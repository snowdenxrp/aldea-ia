# AB105.111R — input-admission boundary and finite-model abstraction

Date: 2026-09-30
Chain: AB105.110R -> AB105.111R

## Objective
Freeze the admission/correlation rule for consequential external inputs and define the smallest finite abstraction suitable for model checking, without claiming that the bounded model proves the unbounded system.

## Fresh primary evidence
TLC checks invariants of a finite-state model of a TLA+ specification; finite constants and explicit state constraints are legitimate ways to obtain such a model. The model checker is intended to find design errors, not to establish that every unbounded behavior has been exhausted. citeturn0search0turn0search1
The TLA+ Toolbox documentation distinguishes TLC finite-state checking from TLAPS deductive reasoning over potentially infinite state spaces, reinforcing that a bounded TLC result and an unbounded proof are different evidence classes. citeturn0search2

## 1. Input-admission contract
Every external input that can influence a consequential derived predicate must carry, or be bound to, a correlation envelope:
- SUBJECT_IDENTITY;
- OPERATION_ID when operation-scoped;
- AUTHORITY_EPOCH when authority-scoped;
- INCARNATION_ID when resource/runtime-scoped;
- OBSERVATION_ID or EVENT_ID when evidence-scoped;
- VALIDITY/FRESHNESS boundary;
- SOURCE/PROVENANCE;
- COVERAGE_SCOPE.

Admission result:
- ACCEPTED — correlation and validity requirements satisfied;
- REJECTED — identity/correlation invalid;
- STALE — valid identity but outside current freshness/epoch boundary;
- CONFLICTING — valid evidence conflicts with already-appraised evidence;
- UNKNOWN — required correlation or appraisal cannot be established.

Crucial rule: RECEIVED != ADMITTED. An input can be durable evidence without being admissible for the current consequential decision.

## 2. Minimum finite abstraction

To keep the first model small, each dimension is reduced to the minimum distinctions needed by frozen invariants.

Runtimes: {PRED, SUCC}
Epochs: {OLD, CURRENT, FUTURE}
Authority: {VALID, STALE, UNKNOWN, REVOKED}
STOP: {NONE, REQUESTED, ENFORCED, UNKNOWN}
Fence: {NONE, ISSUED, ENFORCED, UNKNOWN}
Decision: {NONE, VALID, STALE, UNKNOWN, REJECTED}
Operation: {NONE, NEW, IN_FLIGHT, STOPPING, TERMINAL, UNKNOWN}
Replay: {NONE, NEW, DUPLICATE, CONFLICT}
Effect: {NONE, OBSERVED, ABSENT_UNPROVEN, UNKNOWN, PARTIAL}
Reconciliation: {NONE, REQUIRED, COMPLETE, CONFLICT, UNKNOWN}
Evidence freshness: {FRESH, STALE, UNKNOWN}
Coverage: {SUFFICIENT, PARTIAL, UNKNOWN}
Dependency: {INDEPENDENT, CORRELATED, UNKNOWN}
Reconstruction: {EMPTY, PARTIAL, COMPLETE, CONFLICT, UNKNOWN}
Exclusivity: {NOT_ESTABLISHED, BOUNDED, PROVEN, CONFLICT, UNKNOWN}
Atomicity capability: {ATOMIC, COMPENSATABLE, RECONCILIABLE, UNSUPPORTED}

These finite domains are abstractions, not the final production state domain.

## 3. Abstraction-preservation obligations
The finite abstraction must preserve every distinction used by a frozen safety guard.

Required preserved distinctions:
- CURRENT vs STALE authority;
- REQUESTED vs ENFORCED STOP;
- ISSUED vs ENFORCED fence;
- AUTHORITY vs EXCLUSIVITY;
- EFFECT_OBSERVED vs AUTHORIZATION_PROVEN;
- UNKNOWN_EFFECT vs EFFECT_ABSENT;
- PARTIAL vs COMPLETE reconstruction;
- DUPLICATE vs NEW operation;
- ATOMIC vs weaker capability;
- FRESH vs STALE evidence;
- sufficient vs insufficient coverage.

If two concrete states map to the same finite state while one can violate a frozen invariant and the other cannot, the abstraction is invalid for that invariant.

## 4. Small-model adversarial traces

T1 — OLD authority arrives after CURRENT epoch.
Expected: STALE/rejected; current authority unchanged.

T2 — duplicate operation arrives with same identity but altered payload.
Expected: CONFLICT, never NEW operation.

T3 — STOP requested while effect outcome UNKNOWN.
Expected: STOP_REQUESTED + UNKNOWN_EFFECT remains reachable.

T4 — fence ISSUED but enforcement evidence absent.
Expected: successor release remains blocked.

T5 — successor authority CURRENT but exclusivity UNKNOWN.
Expected: no consequential exclusive release.

T6 — partial history plus terminal event.
Expected: reconstruction remains PARTIAL/UNKNOWN.

T7 — weaker atomicity capability for ATOMIC consequence.
Expected: UNSUPPORTED/blocked decision.

T8 — fresh but correlated evidence.
Expected: freshness accepted; independence requirement remains separately evaluated.

T9 — recovery from checkpoint with unknown prior effect.
Expected: reauthorization plus reconciliation required.

T10 — delayed effect observation after recovery.
Expected: effect can transition UNKNOWN -> OBSERVED without rewriting recovery history.

## 5. What this model can establish
If TLC is later run successfully on this finite abstraction, a passing invariant result would establish only that the specified finite instances satisfy the checked invariants under the model's transition relation and assumptions.
It would NOT establish:
- correctness for arbitrary cardinalities;
- provider implementation correctness;
- liveness without its assumptions;
- historical ternary compatibility;
- cryptographic correctness;
- absence of bugs outside the modeled abstraction.

## 6. Important anti-overclaim boundary
FINITE_MODEL_PASS != FORMAL_PROOF_OF_NEXO.
MODEL_CHECKED != IMPLEMENTATION_VERIFIED.
BOUNDED_STATE_SPACE != UNBOUNDED_CORRECTNESS.
SAFETY_PASS != LIVENESS_PASS.

## 7. Historical ternary
The historical ternary branch remains outside this first generic finite abstraction. If later included, its undefined transition semantics must remain explicit UNKNOWN rather than being invented to make the model total.

## Result
INPUT_ADMISSION_CORRELATION = FROZEN
FINITE_ABSTRACTION = DEFINED
ABSTRACTION_PRESERVATION_CRITERIA = DEFINED
MODEL_CHECKING = NOT_YET_RUN
FORMAL_PROOF = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED
HISTORICAL_TERNARY = ISOLATED
NEW_BEHAVIOR_CHANGING_SEMANTIC_BRANCH = NONE

## Next exact direction
AB105.112R — perform the first finite-model consistency audit: enumerate the reachable abstract combinations relevant to the frozen invariants, identify impossible-state constraints and deadlocks, and only then prepare the actual model-checking artifact. Do not treat enumeration as proof.