# NEXO AB104.254 — TARGET-SIDE FENCING, RESOURCE VERSION, IN-FLIGHT EFFECTS AND LEASE EXPIRY V1 — 2026-09-26

## Status
Research/study only. No architecture implementation or semantic freeze.

## Core finding
A lease or authority check at the worker is insufficient. The protected target must enforce the current fence at the actual mutation boundary. A stale worker can pause after authorization, outlive its lease, and later issue a delayed write; the target must reject it based on a durable/current fence state.

Martin Kleppmann's fencing analysis gives the canonical failure: worker A gets token 33, pauses, worker B gets token 34 and writes, then A resumes; the storage service must reject token 33 itself. citeturn0search0

## Candidate target predicate
For a protected resource, conceptually:
`accept iff incoming_fence >=/appropriate_current_fence AND target_incarnation == current_incarnation AND resource_version satisfies expected predicate AND operation identity/fingerprint is admissible`

The exact >= vs > semantics must be contract-defined. For ownership generations, strict monotonic progression is generally safer; for retries of the same operation, equal-token/equal-operation replay may be admissible if idempotency rules explicitly allow it. This is unresolved architecture policy, not selected behavior.

## Fence + resource version
Fence answers: "is this authority/owner generation still admissible?"
Resource version/CAS answers: "has the protected state changed since the operation's expected state?"
They are orthogonal. A request can have a current fence and still fail CAS because the resource changed. A stale fence can be rejected even if its resource version happens to match.

## Atomic boundary
etcd transactions provide a concrete primitive: multiple comparisons are evaluated atomically, and the success writes are applied as one transaction. Comparisons can include key value, revision or version. citeturn0search1 This supports a candidate target boundary where fence/ownership and resource-version predicates are checked in the same atomic operation as the mutation when the target is capable of it.

## Lease expiry
Lease expiry is a coordination/liveness event; it does not itself stop a paused worker. The target must observe a newer fence before accepting a stale worker's write. etcd's own documentation notes that a lease does not by itself guarantee mutual exclusion of resource access; conditional revision/lease validation is what protects etcd's own keys. citeturn0search7

## In-flight operations
Candidate interleaving:
1. worker W receives fence F1;
2. W reads resource version V1;
3. authority transitions to F2;
4. worker W sends old request (F1,V1);
5. target rejects as STALE/FENCED before mutation;
6. worker W may reconcile using the same operation_id.

Critical race:
1. W request reaches target before F2 is durably active at target;
2. target accepts W;
3. F2 becomes active afterward.
This does not prove a violation: the protocol must define the linearization point for the authority transition and effect acceptance. The transition and target acceptance cannot be treated as ordered merely from client observations.

## Transition/effect ordering
Candidate safe contracts need one of:
- target transaction that binds current fence and mutation;
- authoritative resource version that also encodes authority generation;
- an explicit effect registry whose commit boundary is ordered against the fence transition.
Without such a boundary, there is an UNKNOWN interval around the transition.

## Restart/restore
The target's highest accepted fence/high-water mark must survive restart in a way that cannot roll back to a lower value. Otherwise a stale worker carrying F1 can become acceptable after restore even though F2 had previously been accepted. This is an anti-resurrection requirement.

## Idempotency interaction
Fencing does not replace idempotency. A current worker may retry the same operation after a lost response. The target should distinguish:
- same operation + same fingerprint + admissible fence -> potentially return/reuse existing result;
- same operation + different fingerprint -> CONFLICT/COLLISION;
- old fence -> STALE/FENCED;
- current fence + failed CAS -> VERSION_CONFLICT/reconcile.

## External systems without fencing
Some external APIs cannot inspect a Nexo fence token. In that case, target-side fencing cannot be claimed at the external provider. The protection must move to an intermediary that owns a fenced/idempotent boundary, or the contract must retain the residual risk/UNKNOWN semantics. This is a capability boundary, not something software can assume away. citeturn0search9

## Code study
Indexed GitHub search did not surface the relevant operation-registry implementation. This is not evidence of absence. Earlier direct prototype inspection remains evidence of the existing simulation path only. No implementation changed.

## Persistent AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.

## DO-NOT-REPEAT
lease expiry != target fencing; worker-side authorization != effect-boundary authorization; fence != CAS; CAS != authority; restart != anti-rollback; fencing != idempotency; current fence + lost response != permission to duplicate; no V21; no implementation; no unsupported verification.

## Exact next mission
AB104.255: investigate crash ordering around the fence transition/effect boundary — four-way interleavings (transition-before-send, send-before-transition, target-accept-before-transition, transition-visible-before-target-durable), operation registry linearization, UNKNOWN classification and recovery/reconciliation.