# NEXO - INVALIDATION CUTOFF / ADMISSION LINEARIZATION / DURABLE INTENT / CRASH-REPLAY - 2026-09-24
Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
What minimum durable ordering is required when an invalidation cutoff and an admission commit race, followed by crash/replay, so that stale admission cannot occur and a valid admission is not falsely erased?

## External cross-check
etcd transactions can atomically evaluate multiple comparisons and apply success/failure updates, providing a useful model for an authoritative compare-and-swap style ordering primitive; etcd also distinguishes linearizable operations from watch delivery, so observing an event is not itself the serialization point. citeturn0search4turn0search7
AWS Durable Execution explicitly documents crash windows where a step can execute more than once on replay and notes that idempotency is required for retryable side effects; checkpoint/replay therefore does not by itself create exactly-once external effects. citeturn0search0turn0search6
TLA+ refinement reasoning requires the implementation behavior to satisfy the higher-level specification under a refinement mapping; the model must therefore represent the relevant crash/replay states rather than assuming recovery resumes from the last line of code. citeturn0search36

## Core result
The minimum safe primitive is not a pair of timestamps and not an event bus. Nexo needs one authoritative serialization point for the safety-relevant relationship between the invalidation cutoff and protected admission, plus durable state sufficient to reconstruct that ordering after crash.

`EVENT_ARRIVAL_ORDER != SAFETY_ORDER`
`CACHE_ORDER != SAFETY_ORDER`
`WALL_CLOCK_ORDER != SAFETY_ORDER`
`DURABLE_LOG_ORDER` is useful only if it is the authoritative ordering domain for the relevant claim.

## 1. Two competing transitions
Define:
`I(D)` = authoritative invalidation cutoff for dependency/change D.
`A(E,C)` = protected admission of effect E under context C.

The safety question is not which message arrived first. It is which transition linearized first in the authoritative safety domain.

Case 1:
`A < I`
Admission linearized before invalidation. The operation is a real admitted transition under the prior context. Invalidation must not pretend it never existed; it must process the in-flight effect according to the effect lifecycle, fence/revalidate as required, and preserve history.

Case 2:
`I < A`
Admission using the invalidated context must be rejected.

Case 3:
`A || I` / order unavailable
The system cannot safely invent an order. Admission requires revalidation or an effective resource-side boundary proving the stale context cannot cross.

## 2. Why a durable journal alone is insufficient
A journal can record both events, but if the admission decision is made using stale state before the journal transaction that establishes its order, the journal may document a race rather than prevent it.
Therefore the critical transition must be protected by an authoritative compare/commit operation or equivalent serialization mechanism.

## 3. Candidate atomic admission predicate
Conceptually:
`ADMIT_IF(current_context == C && invalidation_generation == G && required_claims_current) -> COMMIT(A, G)`.
The compare and the admission commit must be one authoritative transition in the same coordination domain.
This is analogous to compare-and-swap/transactional guarding: etcd transactions atomically evaluate comparisons and then apply the selected update block. citeturn0search4

## 4. Invalidation commit
Candidate:
`INVALIDATE_IF(current_generation == G) -> COMMIT(G+1, affected_claims=...)`.
After this linearization, any admission requiring G is stale.

Important: the numeric generation is only meaningful inside the authoritative continuity domain. Restoring an old snapshot cannot make G current again.

## 5. The crash matrix
Important crash windows:
W1 before invalidation commit: no authoritative cutoff yet; admission may still legitimately use old context if all other predicates pass.
W2 after invalidation commit, before propagation: old caches may still say CURRENT; authoritative admission must reject them.
W3 after admission commit, before durable external intent: admission exists but external lifecycle is unresolved; recovery must reconstruct the admitted effect.
W4 after durable intent, before external attempt: replay must not silently create a new semantic effect.
W5 after external attempt, before local observation: outcome may be UNKNOWN.
W6 after local observation, before claim recomputation: historical effect exists but assurance may still be stale.
W7 after claim recomputation, before release/publication: claim state is durable but current admission remains separately controlled.
W8 crash during replay: replay must be idempotent and generation-aware.

## 6. The critical forbidden inference
`NO_DURABLE_INTENT => NO_EFFECT` remains forbidden.
Also:
`NO_LOCAL_ADMISSION_RECORD => NO_ADMISSION` is unsafe if the admission commit could have linearized and the local process crashed before observing its result.
Recovery therefore needs reconciliation with the authoritative store, not local absence inference.

## 7. Durable ambiguity
Suppose Nexo sends an admission commit request and crashes before receiving the response.
Possible worlds:
- transaction rejected;
- transaction committed;
- transaction committed but response lost;
- transport retried and duplicate request arrived;
- request never reached the authoritative store.
Recovery must query the authoritative domain by stable transition/admission identity.

## 8. Stable transition identity
Candidate `AdmissionCommit` identity:
- admission_id
- effect_id
- attempt_id
- context_id
- invalidation_generation
- authority_epoch
- coordination_domain
- request fingerprint.
This supports idempotent recovery of the control transition.

## 9. Duplicate admission requests
A retry of the same `admission_id` must not create a second authoritative admission transition.
However:
`same admission_id != same external effect`.
The external effect still requires its own effect identity/attempt protocol.
AWS documents this separation in durable execution: replay/retry may execute a side-effecting operation more than once unless its semantics or idempotency contract prevents duplication. citeturn0search0

## 10. Phantom invalidation
Could an invalidation appear to have won when it actually did not?
If invalidation is committed atomically in the same authoritative ordering domain, its status is a durable fact.
If only an asynchronous message says invalidation happened, it is merely an observation and can be stale/lost.
Therefore:
`INVALIDATION_REQUESTED != INVALIDATION_COMMITTED`.

## 11. Phantom admission
Likewise:
`ADMISSION_REQUESTED != ADMISSION_COMMITTED`.
Only the protected commit transition establishes the authoritative control fact.

## 12. The minimum ordering relation
Candidate required order:
`AUTHORITATIVE_CONTROL_ORDER` containing at least:
`Invalidate(D,G->G+1)` and `Admission(E,C,G)`.
Everything else can remain asynchronous if it cannot bypass this boundary.
This is the key scope-reduction result: not every component needs one global clock; only interacting safety transitions need a common authoritative order.

## 13. Relationship to effect boundary
Even a perfectly linearized admission does not prove external execution.
The chain remains:
`ADMISSION_COMMIT -> DURABLE_INTENT -> FENCE -> EXTERNAL_ATTEMPT -> EFFECT_COMMIT -> OBSERVATION -> CLAIM`.
Therefore the admission/invalidation race is solved at the control boundary, not at the world-effect boundary.

## 14. Crash after invalidation, before propagation
This is expected and safe if all protected admissions consult the authoritative generation.
Stale caches may continue to exist but become non-authoritative.
Propagation is needed for efficiency and eventual convergence, but safety cannot depend solely on it.

## 15. Crash after admission, before invalidation
If admission committed first, later invalidation must process the admitted effect according to its actual state.
It may:
- fence continuation;
- prevent retry/redrive;
- require reconciliation;
- invalidate associated proof/currentness;
- preserve the historical admission fact.
It must not retroactively rewrite the ordering.

## 16. Crash during simultaneous replay
Recovery should not replay messages blindly.
Protocol:
`RESTORE -> QUERY AUTHORITATIVE CONTROL STATE -> IDENTIFY COMMITTED TRANSITIONS -> REPLAY ONLY MISSING DERIVED EFFECTS -> RECONCILE EXTERNAL EFFECTS -> REVALIDATE CURRENT CONTEXT -> RELEASE`.
This follows the durable-execution principle that replayed orchestration must account for checkpointed state and side-effect semantics rather than assuming code position equals world state. citeturn0search3

## 17. Invalidation and admission in different coordination domains
If they are separate domains, neither domain can automatically establish their order.
Possible solutions:
A. common authoritative coordination domain for the interacting claim;
B. explicit cross-domain causal/fencing protocol;
C. resource-side boundary that makes stale admission ineffective;
D. weaken the claim until ordering is unnecessary.
No universal global coordinator is required.

## 18. Cross-domain causal uncertainty
If D1 invalidation is in domain X and admission is in Y and no valid bridge exists:
`ORDER_UNKNOWN`.
The safe response is revalidation/hold unless a boundary makes the ambiguity irrelevant.

## 19. Why timestamps fail
Wall-clock timestamps can indicate observation time but cannot establish protected serialization under skew, delay, pause or replay.
`timestamp(A) < timestamp(I)` does not prove `A < I` in the authoritative safety order.

## 20. Why event buses fail as the sole safety mechanism
Event propagation is useful for invalidation convergence but cannot itself be assumed to provide atomic exclusion between a stale admission and a new invalidation unless its exact transactional semantics establish that property.
An event saying INVALIDATED after admission does not prove whether admission was legal at its own linearization point.

## 21. Claim-scoped control domain
Candidate `SafetyOrderingDomain`:
- claim scope;
- affected dependency closure;
- admission transitions;
- invalidation transitions;
- required fence transitions;
- continuity identity;
- ordering primitive;
- current generation;
- crash/replay semantics.
This becomes the minimal authoritative domain for the specific safety claim.

## 22. Reconciliation after ambiguous commit
Recovery query must distinguish:
`COMMITTED`
`REJECTED`
`UNKNOWN`.
UNKNOWN at the authoritative control store is itself a failure of the assumed ordering primitive and must not be treated as rejection.

## 23. Authoritative store failure
If the control store is unavailable, Nexo cannot assume the last observed generation is current unless its consistency contract explicitly permits that claim.
Safe default for safety-critical admission:
`NO CURRENT ORDER -> NO NEW PROTECTED ADMISSION`.
Existing effects require separate lifecycle/reconciliation handling.

## 24. Snapshot restore attack
Suppose control store snapshot at generation 100 is restored after generation 130 existed.
Restored generation 100 must not be accepted as current 130.
The continuity layer must establish a new recovery context/monotonic authority boundary.
This is consistent with the broader Nexo continuity research: historical restoration does not restore historical authority.

## 25. Candidate protected transaction
Candidate `ControlCommit`:
`READ current_generation, policy, claims, fences`
then atomically:
`VERIFY predicates`
`WRITE admission/invalidation state`
`WRITE durable intent/reference`
`EMIT derived propagation metadata`.
Whether durable intent can be in the same transaction depends on the storage architecture. The abstract contract must not assume a particular database.

## 26. Minimum versus stronger guarantees
Minimum for control safety:
1. authoritative ordering between interacting invalidation and admission;
2. durable queryable identity for committed transitions;
3. current generation/fence validation;
4. crash recovery that distinguishes committed/rejected/unknown;
5. no stale cache bypass.

Stronger optional guarantees:
- same transaction for control commit and durable intent;
- synchronous fence activation;
- resource-side enforcement;
- provider effect commit protocol.
These strengthen recovery and world claims but are not identical to the minimum control-order requirement.

## 27. Candidate invariants INV-ACR-01..34
01 Invalidation request is not invalidation commit.
02 Admission request is not admission commit.
03 Only the authoritative control order establishes protected ordering.
04 Event arrival order does not establish safety order.
05 Cache order does not establish safety order.
06 Wall-clock order does not establish safety order.
07 Admission before invalidation remains historical fact.
08 Invalidation before admission rejects stale admission.
09 Unknown ordering blocks strong admission unless stale effect is otherwise fenced.
10 Control generation is authoritative only inside its continuity domain.
11 Generation equality does not prove continuity.
12 Missing local record does not prove missing authoritative transition.
13 Duplicate admission requests with same admission_id must be idempotent at the control layer.
14 Same admission_id does not imply same external effect attempt.
15 Control commit does not imply external effect.
16 Durable intent does not imply external effect.
17 External attempt does not imply success.
18 Local observation does not automatically prove world truth.
19 Crash recovery queries authoritative state.
20 Replay does not inherit historical authority.
21 Replay is generation-aware.
22 Unknown control-store outcome remains unknown.
23 Control-store outage does not authorize stale admission.
24 Asynchronous propagation cannot be the sole safety boundary.
25 Cross-domain order requires explicit bridge or boundary.
26 Timestamp order is not causal safety order.
27 Snapshot restore cannot regress current authority.
28 Invalidation cannot retroactively erase admitted history.
29 Admission cannot retroactively erase invalidation history.
30 Protected control order is claim-scoped.
31 Unrelated claims need not share a global coordinator if disjointness is proven.
32 Derived propagation state cannot override authoritative state.
33 Reconciliation after crash is a protected process.
34 Strong world claims require the later external-effect protocol in addition to control ordering.

## Architectural result
The minimum authoritative kernel becomes clearer:
`CONTROL ORDER` is the protected serialization domain for interacting safety transitions.
It does not need to serialize the entire world.

Canonical chain:
`CHANGE -> IMPACT -> INVALIDATION_CUTOFF`
competing with
`REQUEST -> ADMISSION_CHECK -> ADMISSION_COMMIT`.
Both must meet at the same `SafetyOrderingDomain` when their truth conditions interact.

Then separately:
`CONTROL_COMMIT -> DURABLE_INTENT -> FENCE -> EXTERNAL_EFFECT -> RECONCILIATION`.

## Open gaps
G-ACR-01 exact storage/consensus contract.
G-ACR-02 formal proof of selective control ordering.
G-ACR-03 cross-domain causal bridge.
G-ACR-04 crash/replay formal model.
G-ACR-05 duplicate transition implementation.
G-ACR-06 snapshot continuity implementation.
G-ACR-07 external effect reconciliation integration.
G-ACR-08 actual SANY/TLC/TLAPS.
G-ACR-09 implementation refinement.
G-ACR-10 fault-injection validation.

## Next attack
CONTROL_COMMIT + DURABLE_INTENT + FENCE_ACTIVATION as one protected transition versus the impossibility/limits of atomicity with an external provider.
Question: when the control store can atomically commit admission but the external resource/provider cannot participate in that transaction, what exact guarantees can Nexo still make, and where must it deliberately stop claiming atomicity?