# NEXO — UNCERTAINTY + CONCURRENT EFFECTS + COMPENSATION RACE

Date: 2026-09-24
Status: RESEARCH ONLY. No V21. No implementation.

## Core result
An UNKNOWN external effect cannot be treated independently once later effects, compensation, downstream queues, resource replacement, or provider retries may interact with the same footprint. Compensation is a new protected effect and may enlarge the uncertainty space.

## Findings
RACE-01 UNKNOWN is a set of allowed histories/worlds, not a scalar failure.
RACE-02 A later effect does not classify an earlier UNKNOWN effect.
RACE-03 A compensation can create additional ambiguity rather than reduce it.
RACE-04 Idempotency protects repeated identical requests; it does not establish commutativity, compensability, isolation, or historical truth.
RACE-05 A new fence blocks stale future effects only when the resource enforces it; it does not classify effects accepted before the fence.
RACE-06 Concurrent effects sharing a footprint require an explicit interaction contract.
RACE-07 Downstream queues, retries and child operations belong to the effect footprint when they can still produce the protected effect.
RACE-08 Resource replacement creates a new incarnation and does not erase historical uncertainty.
RACE-09 Recovery must not introduce a new effect unless its safety is proven across the remaining joint uncertainty set.
RACE-10 If effect interaction is UNKNOWN, generic compensation is blocked unless a branch-invariant safety property has already been established.
RACE-11 Recovery actions can increase the uncertainty set; this is safety-relevant and must be bounded.
RACE-12 Safe non-convergence is preferable to unsafe convergence based on guessed history.

## Candidate EffectInteractionContract
For effects E1/E2 classify interaction as DISJOINT, COMMUTATIVE, ORDER_SENSITIVE, MUTUALLY_EXCLUSIVE, CONDITIONALLY_COMPATIBLE, CONFLICTING or UNKNOWN. These are research labels, not final canonical names.

## Candidate safety predicate
SAFE_UNDER_JOINT_UNCERTAINTY(action) requires safety for every allowed world/history consistent with current evidence and every causal relation relevant to the claim.

## New candidate objects
EffectInteractionContract
EffectOutcomeUncertaintySet
RecoveryDecisionPolicy
CompensationEffectBinding
ExternalEffectHistory
ResourceIncarnation

## Candidate invariants
INV-RACE-01 Recovery must not introduce a new effect that creates unsafe indistinguishable worlds unless safe across all remaining worlds.
INV-RACE-02 Later effects do not retroactively resolve earlier UNKNOWN outcomes.
INV-RACE-03 Fence advancement invalidates stale future authority but does not prove historical absence.
INV-RACE-04 Compensation is a new protected effect with independent identity, authority, fencing and reconciliation.
INV-RACE-05 Unknown effect interaction blocks generic compensation.
INV-RACE-06 Downstream autonomous work remains inside the effect footprint when it can produce the protected effect.
INV-RACE-07 Resource incarnation changes do not erase historical uncertainty.
INV-RACE-08 Idempotency is not proof of transaction isolation or cross-resource safety.
INV-RACE-09 Recovery must preserve or reduce the uncertainty relevant to the required claim; it must not silently expand it.
INV-RACE-10 Ambiguous interaction defaults to HOLD/QUARANTINE unless a stronger safety contract applies.

## Adversarial sequence
E1 -> UNKNOWN
E2 -> concurrent effect on shared resource
fence advances
C1 -> compensation prepared/executed
provider retries E1
resource replaced
observation of E1 arrives
second crash

The final state must preserve effect identities, incarnations, ordering uncertainty, compensation relation and claim-specific verification. A generic SUCCESS/FAILURE field is insufficient.

## Architecture consequence
Recovery is not restoration to a prior state. It is a new sequence of protected effects performed under incomplete knowledge of external history. The clean architecture therefore needs explicit interaction semantics and a bounded uncertainty model.

## External cross-check
AWS documents that saga participants can experience stale data under concurrent orchestration and recommends semantic locking; it also treats compensation and retries as sources of additional complexity. AWS idempotency guidance distinguishes retry safety from exactly-once behavior. Fencing research likewise requires the resource itself to reject stale fencing tokens. These are external research inputs, not Nexo verification evidence.

## Next attack
BOUNDED UNCERTAINTY / ABSORBING SAFE STATE: determine whether there are effect classes for which uncertainty can be deliberately transformed into a safe absorbing state, what guarantees that requires, and whether such a state can coexist with later reconciliation and decommission.
