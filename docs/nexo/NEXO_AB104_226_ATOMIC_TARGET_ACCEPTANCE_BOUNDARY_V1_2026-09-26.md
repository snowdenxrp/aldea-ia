# NEXO AB104.226 — ATOMIC TARGET ACCEPTANCE BOUNDARY V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
The research converged on a precise distinction:
- A worker-side check is an observation.
- A target-side conditional transaction is an acceptance decision.
- A receipt is evidence of the target's decision.
- Linearizability/strict serializability is a property of the target protocol, not something Nexo can infer from a local version number.

A candidate target acceptance boundary is conceptually:

ACCEPT iff, in one target-side linearization point:
1. authority_root/configuration is the currently accepted authority context;
2. authority_epoch is acceptable for that root/configuration;
3. resource_id + resource_incarnation match;
4. presented_fence is not older than target's current fence;
5. expected_resource_version matches the target's current version;
6. operation_id/effect_identity is not already committed with a conflicting payload fingerprint;
7. if the operation is accepted, the target atomically records the new resource state and the operation receipt/idempotency record.

This is a research model, not a selected Nexo architecture.

## Why the checks must compose
A sequence of independent checks can have a race:
read authority -> read version -> check fence -> delay -> mutate.
The state may change between every check.

etcd provides a useful reference: transactions atomically evaluate multiple comparisons and then apply writes; its API documents comparisons over values, revisions and versions, and its KV operations are documented as linearizable by default. This is evidence for the primitive shape, not a recommendation to use etcd in Nexo. citeturn0search1turn0search3

Kubernetes resourceVersion is another concrete example of server-side concurrency identity: clients send the server-provided version back unchanged when expressing consistency requirements. It is a concurrency mechanism, not proof of authority by itself. citeturn0search7

Fencing research independently establishes that the protected resource must reject older fencing tokens; checking a lease only at the client is insufficient. citeturn0search0

## Attack matrix

### A — version matches, authority stale
Target version = 41. Worker carries E1. Authority is already E2.
If target compares only version, stale E1 can mutate.
If target atomically validates authority/fence + version, E1 is rejected.

### B — authority current, version stale
Worker carries current E2 but expected version 40 while target is 41.
Target rejects by conditional version. This is a concurrency conflict, not an authority failure.

### C — fence current, wrong incarnation
Fence number 50 is valid for resource incarnation R1, but target is R2 after recreation.
The request must be rejected because numeric fence equality/order is insufficient without incarnation binding.

### D — operation already committed
A retry presents the same operation_id and matching fingerprint.
Target can return the existing authoritative result without creating a new effect.
This is reconstruction/reconciliation, not permission to execute again.

### E — operation_id collision
Same operation_id but different payload fingerprint.
This must be conflict/quarantine, never a new execution and never a timestamp winner.

### F — concurrent revocation
E1 request and E2 revocation race.
If E1 linearizes before revocation, the historical effect may be E1-authorized.
If revocation linearizes first and target enforces E2, E1 must be rejected.
Arrival time at Nexo is not the linearization order.

### G — target partitioned
Target cannot obtain current authority context.
Strong current-authority safety may require fail-closed behavior unless the target possesses an independently valid monotonic authority/fence state.
No availability policy selected.

### H — target restore
Target restores an older snapshot where version/fence are lower.
Without rollback-resistant continuity, an old request may become acceptable again.
Therefore durability and anti-rollback remain distinct.

### I — accepted effect, lost response
Target atomically commits state + operation record, then response is lost.
Nexo must reconcile against the target record. It must not issue a fresh effect merely because the response is missing.

### J — rejected request
A target-side conditional rejection is NOT_COMMITTED only if the protocol guarantees that the request was not accepted/processed at the relevant effect boundary.
A generic error/timeout is insufficient.

### K — partial/streaming operation
The parent operation may be valid, while child effects have separate acceptance points.
Each independently crossing child boundary needs identity and relevant fence/version evidence.

## Candidate atomic tuple

Target-side state:
- accepted_authority_root
- accepted_authority_epoch/configuration
- resource_id
- resource_incarnation
- current_fence
- current_resource_version
- operation registry / receipt state

Request:
- authority_root
- authority_epoch
- resource_id
- resource_incarnation
- presented_fence
- expected_resource_version
- operation_id
- effect_identity
- payload_fingerprint

Acceptance should conceptually bind the complete predicate and resulting state transition in one atomic boundary.

## Important subtlety
A global authority epoch and a resource fence do not have to be the same counter.
They may have different scopes:
- authority epoch answers “which authority generation is current?”
- resource fence answers “which executor generation is current for this resource?”
- resource version answers “which target state am I conditionally updating?”

But the protocol must define which transitions advance which values and how the three are related. Otherwise a valid local fence can coexist with revoked global authority, or a valid global epoch can coexist with a stale resource executor.

## Current prototype code study
Direct main inspection confirms:
- effect-adapter.js blob SHA: 3ed48663b4da0d165c3a86da248d3f11d1e7b598
- runtime.js blob SHA: 1b4096bd6868fd9086ba6740f07d6a104a258651
- orchestrator.js blob SHA: 973d3d5406c5cab16fb49529d94e07a1557c3111

Observed limitations:
1. runtime constructs idempotencyKey as missionId:stepId.
2. effect-adapter's getStateVersion() is local and used around precondition/handler execution.
3. simulation-adapter's nexoEffectRevision is an in-memory simulation revision, not an authority/fence primitive.
4. effect-adapter's prepared entry requires reconciliation before another execution attempt.
5. A handler exception returns EFFECT_OUTCOME_UNKNOWN but the current exception branch does not call persist(); this previously observed discrepancy with the test expectation remains unresolved and must not be called a passing test.
6. The prototype has no observed atomic target-side authority+fence+resource-version acceptance boundary.
7. runtime's local commit lock serializes local memory commits, but it is not distributed target fencing.

## Evidence boundary
Strong NOT_COMMITTED candidate:
target atomically rejects before acceptance + target semantics explicitly guarantee non-acceptance + receipt binds rejection to exact operation/identity/context.

Strong EXTERNALLY_COMMITTED candidate:
target atomically commits and produces an authoritative receipt/operation record bound to exact operation, payload fingerprint, authority context and resource incarnation.

UNKNOWN:
target outcome cannot be established, target continuity is broken, or receipt semantics are insufficient.

## External evidence
- etcd transactions atomically apply multiple comparisons and writes; etcd documents strict serializability/linearizability for KV operations. citeturn0search1turn0search3
- Kubernetes resourceVersion is a server-side resource version used for consistency/concurrency requirements and must be passed back unchanged. citeturn0search7
- Fencing requires the resource/storage service to actively reject older tokens. citeturn0search0

## Open questions for AB104.227
1. Exact semantics of the target's operation registry: retention, uniqueness, collision handling.
2. How operation receipt and resource mutation become one atomic commit.
3. Whether the fence is allocated by authority, target, or a separate coordination layer.
4. Crash semantics if fence allocation succeeds but effect acceptance does not.
5. Crash semantics if effect acceptance commits but receipt transport fails.
6. Restore/clone handling for target fence/version/operation registry.
7. Partition policy and whether stale authority may ever be used.
8. Proof/evidence format for target-side rejection as non-acceptance.
9. Child-effect atomicity and partial-effect aggregation.
10. Formal model remains unconstructed; no formal verification performed.

## AB50→AB58 residuals
UNCHANGED:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

AB55 remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
- local precondition check != atomic target acceptance
- local stateVersion != authority freshness
- CAS/resourceVersion != authority permission by itself
- fence != anti-rollback unless continuity is protected
- operation_id equality != proof of prior execution
- rejection != NOT_COMMITTED without a non-acceptance guarantee
- receipt inclusion/integrity != truth of the underlying target claim
- no V21
- no architecture implementation
- no unsupported formal/CI/fault-injection claims

## Exact next mission
AB104.227: attack operation-registry atomicity, receipt binding, crash ordering, retention/expiry and restore/clone interactions at the target boundary.
