# NEXO - DOUBLE RECOVERY / SPLIT OWNERSHIP / STALE OBSERVER / RESOURCE INCARNATION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can two recovery contexts simultaneously believe they reconstructed the current scope after a crash while an old provider child remains active and the target resource has been replaced?

## External cross-checks

Kubernetes coordinated leader election uses a shared Lease and optimistic concurrency through resourceVersion so concurrent acquisition attempts do not both successfully update the same coordination object. Kubernetes also documents that controllers with stale views can make conflicting decisions, and recommends binding decisions to current resource versions/generations. This supports a protected current recovery-ownership transition. citeturn0search0turn0search1

etcd documents linearizability for operations that require current state and distinguishes this from serializable/stale reads; its watch stream is ordered by revision but is not itself a substitute for a current linearizable authority decision. citeturn0search13

Raft uses monotonically increasing terms to detect obsolete leadership information and reject stale leadership. The architectural lesson for Nexo is that recovery authority needs a current coordination epoch, not merely a restored local snapshot. citeturn0search3turn0search11

## Core result

Two recovery processes can be locally convinced they are current unless ownership is serialized in a protected coordination domain.

Therefore:

RECOVERY_CONTEXT_CURRENT != RECOVERY_OWNER_CURRENT

and:

RECOVERY_PROGRESS != RECOVERY_AUTHORITY

A recovery checkpoint, even if internally consistent, cannot prove that no newer recovery owner exists.

## Adversarial sequence

CRASH
→ R1 restores historical state
→ R1 begins recovery
→ network partition / delayed messages
→ R2 restores the same historical state
→ R2 believes the same old recovery ownership is still valid
→ provider child C remains active
→ resource R1 is replaced by a new incarnation
→ stale observer reports old resource state
→ R1 and R2 each construct different current scopes
→ one tries release/continuation.

The dangerous failure is not merely two processes running. It is two processes being able to cross the same protected effect boundary with conflicting recovery contexts.

## Recovery ownership

Candidate RecoveryOwnership:

scope, recovery_incarnation, owner_identity, authority_epoch, recovery_epoch, fence_epoch, context_identity, acquisition_reference, expiry/transfer state.

Acquisition must be a protected transition.

If R1 owns epoch 7 and R2 acquires epoch 8, R1's old recovery context must become non-authoritative.

This is analogous to stale-leader rejection in Raft and optimistic concurrency in Kubernetes. citeturn0search0turn0search3

## Ownership is not external fencing

Even if R2 becomes current recovery owner:

R2 owns recovery

does not imply:

R1 stopped executing

and does not imply:

provider child C stopped.

Therefore recovery ownership and resource-side fencing remain separate.

## Identical historical input does not create identical recovery authority

R1 and R2 can both restore ScopeFreeze G and compute the same local result.

They still require distinct recovery incarnations:

R1 = RecoveryContext(C, recovery_incarnation=1)
R2 = RecoveryContext(C, recovery_incarnation=2)

Only the currently authorized incarnation may perform protected recovery transitions.

## Resource replacement

Resource R1/incarnation=41 may become R1/incarnation=42.

Same logical name does not imply same physical/history identity.

An observer reporting R1=READY without incarnation binding cannot safely establish which incarnation it observed.

Therefore:

RESOURCE_ID != RESOURCE_INCARNATION

Old evidence tied to 41 cannot silently discharge a claim about 42.

## Stale observer attack

R1 is active.
Observer O reads R1.
Resource is replaced.
R2 becomes current recovery owner.
O returns the old observation.
R1 or R2 treats O's result as current.

Correct classification:

OLD_OBSERVATION + OLD_INCARNATION = HISTORICAL_EVIDENCE

not current world truth.

If observer provenance/currentness is unknown, evidence remains UNKNOWN.

## Ownership transfer

Candidate protocol:

REQUEST_RECOVERY
→ CURRENT_OWNER_CHECK
→ CURRENT_CONTEXT_CHECK
→ OWNER_TRANSFER_LINEARIZATION
→ NEW_RECOVERY_INCARNATION
→ OLD_OWNER_FENCED
→ NEW_OWNER_ACTIVE
→ CURRENT_SCOPE_RECOMPUTATION.

A message saying that an actor is no longer owner is insufficient; stale authority must fail at the protected boundary.

## Stale messages

Every safety-relevant recovery message should bind at least:

- recovery scope;
- recovery incarnation;
- authority epoch;
- recovery epoch;
- fence generation;
- context identity;
- relevant resource incarnation;
- effect identity;
- message/transition identity.

If a required binding is stale:

DENY / IGNORE / RECORD AS LATE HISTORICAL MESSAGE.

Arrival order is not authority order.

## Recovery progress

R1 may have completed reconciliation of A and B before losing ownership.

R2 may reuse those results only if the evidence remains current and compatible.

Therefore:

PROGRESS_TRANSFER != AUTHORITY_TRANSFER

Progress can be evidence. Authority must be freshly established.

## Recovery and resource replacement race

R1 reconciles resource incarnation 41.
Resource is replaced with incarnation 42.
R2 acquires recovery.
R1 sends release based on 41.
R2 sends release based on 42.

Release must bind to current recovery context and current resource incarnation. The old R1 release is rejected.

## Old provider child remains active

Hard case:

R1 recovery
→ old provider child C remains active
→ R2 acquires recovery
→ C produces an effect
→ resource is new incarnation
→ observer reports it late.

The new owner cannot conclude that C is irrelevant merely because it started before R2.

It must classify C against effect identity, attempt identity, provider execution, resource incarnation, fence generation, continuity context, mission invariant and causal/order requirements.

## One current recovery owner does not resolve UNKNOWN

Even after R2 becomes sole owner:

RECOVERY_OWNER = R2

does not imply:

EXTERNAL_OUTCOME = KNOWN

Ownership solves coordination. It does not create world truth.

## Restored ownership

A restored snapshot may say owner=R1 while current authority says owner=R2.

The restored owner record is historical.

RESTORATION != REAUTHORIZATION

## Split-brain boundary

The dangerous condition is:

R1 and R2 both possess execution-capable authority for the same interacting recovery scope.

The safety goal is not necessarily one process globally.

The goal is:

AT MOST ONE CURRENT RECOVERY AUTHORITY CAN CROSS THE PROTECTED EFFECT BOUNDARY FOR A GIVEN INTERACTING CLAIM.

This is narrower and more useful than a global singleton.

## Coordination domain

The required recovery coordination domain is claim-specific.

If two recovery contexts are truly disjoint, they can be independent.

If they share a resource, effect, fence, queue, mission invariant, authority, recovery state, continuity root, provider or physical footprint, they belong to the same interacting coordination domain unless decomposition is formally justified.

## Recovery roles

Do not merge these concepts:

RECOVERY_OWNER
EXECUTION_OWNER
RECONCILIATION_OWNER
STOP_AUTHORITY
VERIFIER

One identity may hold multiple roles only through explicit authority bindings and conflict rules.

Recovery must not grant itself normal execution authority.

## Different recovery scopes

R1 computes Scope={A,B}.

R2 computes Scope={A,B,C}.

This is not merely disagreement. At least one context has an incomplete or stale closure.

Until resolved:

COMBINED_SCOPE = UNKNOWN

for affected claims.

The safe action is to block release and recompute from current authoritative topology, dependency and effect-path state.

## Recovery owner and scope widening

R1 freezes G. Then C appears. R2 later discovers C.

R1 cannot continue under G merely because it acquired ownership first.

Current ownership does not preserve a stale scope.

CURRENT_OWNER AND STALE_SCOPE != RELEASE_ELIGIBLE

## Recovery and proof context

R1 may possess proof valid for ProofContext P1. R2 may have P2.

Neither proof wins because it is newer or belongs to the current owner. Each must be checked against the current claim context.

PROOF != AUTHORITY

## Recovery transfer linearization

Candidate protected transition RECOVERY_TRANSFER_LINEARIZED establishes:

- old recovery incarnation no longer current;
- new recovery incarnation current;
- applicable scope/context generation;
- required fencing generation;
- invalidation generation;
- current owner.

This remains control-plane authority; external enforcement requires a separate verification step.

## Candidate recovery protocol

RECOVERY_REQUEST
→ CURRENT_COORDINATION_CONTEXT
→ ACQUIRE_RECOVERY_OWNERSHIP
→ FENCE_STALE_RECOVERY_OWNERS
→ CREATE_RECOVERY_CONTEXT
→ RECOMPUTE_EFFECT-PATH_CLOSURE
→ IDENTIFY_IN-FLIGHT_EFFECTS
→ IDENTIFY_RESOURCE_INCARNATIONS
→ RECONCILE
→ CLASSIFY_EVIDENCE
→ REVALIDATE_SCOPE
→ REVALIDATE_STOP/FENCES
→ RECOMPUTE_CLAIMS
→ PROTECTED_RELEASE_LINEARIZATION
→ EXPLICIT_EXECUTION_ENABLE

## Candidate invariants INV-DRSO-01..35

01 Recovery progress is not recovery authority.
02 Historical recovery ownership is not current ownership.
03 Recovery ownership requires protected current coordination.
04 Recovery incarnation distinguishes recovery attempts.
05 Only current recovery incarnation may cross protected recovery transitions.
06 Old recovery messages cannot authorize current transitions.
07 Ownership transfer does not prove old process stopped.
08 Ownership transfer does not prove provider child stopped.
09 Recovery ownership is distinct from resource fencing.
10 Recovery ownership is distinct from external world truth.
11 Resource logical identity is not incarnation identity.
12 Old-incarnation evidence cannot classify new incarnation without transfer proof.
13 Stale observer evidence is historical unless currentness is proven.
14 Observer arrival order is not authority order.
15 Recovery progress may be reused only with current evidence compatibility.
16 Progress transfer does not transfer authority.
17 Scope must be current for current recovery owner.
18 Current owner with stale scope is not release eligible.
19 Resource replacement invalidates incompatible recovery context.
20 Provider contract change invalidates incompatible recovery context.
21 Topology change invalidates incompatible recovery scope.
22 Shared recovery footprint requires shared/serialized coordination.
23 Disjoint recovery domains may coordinate independently only with complete decomposition.
24 Current owner does not resolve external UNKNOWN.
25 Current owner does not promote stale evidence.
26 New recovery context dominates restored historical context.
27 Old recovery context cannot regain authority after transfer.
28 Release binds recovery owner, recovery incarnation, scope, fences, resource incarnation and current context.
29 Double recovery must not produce two current protected authorities.
30 Recovery transfer does not equal external enforcement verification.
31 Recovery checkpoint does not restore authority.
32 Higher recovery epoch alone does not prove semantic compatibility.
33 Stale recovery state fails closed.
34 Loss of current coordination blocks protected recovery transitions.
35 Safe non-convergence is preferred to split-brain release.

## Candidate theorem

Not formally proven:

For each interacting safety claim, if recovery ownership is serialized by a current authoritative coordination domain, each recovery incarnation carries a non-regressing fenced identity, stale owners/messages are rejected at the protected boundary, resource incarnations are explicit, and release requires current scope/context/resource/fence validation, then two recovery contexts cannot both obtain current protected recovery authority for the same interacting claim.

This does not establish external-world truth or resource quiescence; those remain separate claims.

## Architectural result

The clean architecture now needs:

RECOVERY COORDINATION DOMAIN
+
RECOVERY INCARNATION
+
RESOURCE INCARNATION
+
STALE OBSERVER REJECTION
+
RESOURCE-SIDE FENCING

Critical rule:

Recovery is singleton only where the safety claim requires singleton authority. Wherever singleton authority is required, it must be enforced at the protected transition/resource boundary, not inferred from process state or messages.

## Open gaps

G-DRSO-01 formal proof of recovery ownership uniqueness.
G-DRSO-02 recovery transfer crash atomicity.
G-DRSO-03 stale-owner enforcement at external resources.
G-DRSO-04 resource incarnation establishment.
G-DRSO-05 provider child continuation semantics.
G-DRSO-06 stale observer provenance/currentness.
G-DRSO-07 split recovery with topology divergence.
G-DRSO-08 recovery-of-recovery recursion.
G-DRSO-09 formal refinement to implementation.
G-DRSO-10 actual SANY/TLC/TLAPS.
G-DRSO-11 fault injection and long-duration tests.

## Next attack

RECOVERY OWNERSHIP + RESOURCE-SIDE FENCING + PROVIDER AUTONOMOUS RETRY + STOP + COMPENSATION.

Question: if Recovery B becomes current and fences Recovery A, can an autonomous provider continuation created by A still produce a protected effect after STOP and after the resource incarnation changes? If yes, what minimum external boundary must reject it before Nexo can make a strong containment claim?