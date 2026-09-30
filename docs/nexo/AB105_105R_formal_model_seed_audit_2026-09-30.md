# AB105.105R — formal-model seed audit: state/transition inventory and adversarial gate

Date: 2026-09-30
Chain: AB105.104R -> AB105.105R

## Objective
Create the minimal formalization seed without implementing Nexo. The seed must expose every behavior-changing state boundary before a formal specification is written.

## Primary evidence
TLA+ models systems as an initial-state predicate plus a next-state relation, with liveness expressed separately; this supports treating states/transitions as the semantic seed and not conflating safety with progress. citeturn0search24turn0search25
Lamport's verified examples also show refinement from an abstract algorithm to lower-level implementations and distinguish checked safety from incompletely checked liveness. citeturn0search2

## 1. Minimal state vector

### Authority
- authority_epoch
- authority_state
- validity/recheck boundary
- predecessor/successor relationship

### Identity
- runtime_id
- subject_id
- incarnation_id
- resource identity

### Evidence
- observation set
- freshness state
- coverage state
- dependency/independence state
- conflict/reconciliation state

### Decision
- claim set
- appraisal state
- decision state
- consequence class
- required assurance

### Operation
- operation_id
- operation phase
- replay/idempotency state
- fence state

### External effects
- expected effects
- observed effects
- unobservable effects
- reconciliation state
- atomicity capability

### History/recovery
- EventDAG reconstruction state
- checkpoint/recovery state
- migration state
- successor exclusivity state

## 2. Minimal transition families
INIT -> OBSERVING
OBSERVING -> APPRAISED | UNKNOWN | CONFLICTING
APPRAISED -> DECIDED | RECHECK | STOP
DECIDED -> AUTHORIZED_TO_START | REJECTED | UNKNOWN
AUTHORIZED_TO_START -> STARTED
STARTED -> IN_FLIGHT | EFFECT_OBSERVED | FAILED | STOP_REQUESTED
IN_FLIGHT -> EFFECT_OBSERVED | STOPPING | FAILED | UNKNOWN
STOP_REQUESTED -> STOPPING | STOP_ENFORCED | UNKNOWN
STOPPING -> STOP_ENFORCED | FAILED_TO_STOP | UNKNOWN
EFFECT_OBSERVED -> RECONCILING | COMPLETED | UNKNOWN
RECONCILING -> RECONCILED | CONFLICTING | UNKNOWN
RECOVERY_DETECTED -> RECOVERY_LOADING
RECOVERY_LOADING -> RECONSTRUCTION_PARTIAL | RECONSTRUCTED | UNKNOWN
RECONSTRUCTED -> REAUTHORIZED | AUTHORITY_UNKNOWN
REAUTHORIZED -> RECONCILING | RELEASED | BLOCKED
TRANSFER_REQUESTED -> PREDECESSOR_FENCING -> SUCCESSOR_AUTHORITY_ESTABLISHED -> EXCLUSIVITY_APPRAISED -> RELEASED

These are semantic transition families, not implementation states or code enums.

## 3. Adversarial missing-state test

### Case 1 — decision valid, authority expires before effect
Requires a state distinct from DECIDED: decision exists but is no longer executable.
Result: REQUIRED.

### Case 2 — effect exists, authorization evidence missing
Requires EFFECT_OBSERVED without AUTHORIZATION_PROVEN.
Result: REQUIRED; already covered by separation invariant.

### Case 3 — authorization valid, effect outcome unknown
Requires AUTHORIZED/STARTED with UNKNOWN effect.
Result: REQUIRED.

### Case 4 — STOP requested but enforcement unknown
Requires STOP_REQUESTED/UNKNOWN_ENFORCEMENT, not STOPPED.
Result: REQUIRED.

### Case 5 — predecessor fenced, successor authority not established
Requires FENCED_WITHOUT_SUCCESSOR_AUTHORITY.
Result: REQUIRED.

### Case 6 — successor authority established, exclusivity unresolved
Requires SUCCESSOR_AUTHORITY_WITH_EXCLUSIVITY_UNKNOWN.
Result: REQUIRED.

### Case 7 — recovery reconstructed state but authority stale
Requires RECONSTRUCTED_WITH_AUTHORITY_UNKNOWN/STALE.
Result: REQUIRED.

### Case 8 — two effects, one committed and one unknown
Requires PARTIAL_EFFECT/RECONCILIATION_REQUIRED; cannot collapse to FAILED or COMPLETE.
Result: REQUIRED.

### Case 9 — EventDAG prefix with missing successor
Requires PARTIAL/UNKNOWN reconstruction, not terminal state.
Result: REQUIRED.

### Case 10 — atomicity capability unavailable for requested consequence
Requires UNSUPPORTED/BLOCKED decision path before consequential execution.
Result: REQUIRED.

## 4. Important finding: phase vs condition
The audit exposes a modeling rule: some values are not lifecycle phases. FRESH/STALE, AUTHORITY_CURRENT/STALE, DEPENDENCY_INDEPENDENT/CORRELATED/UNKNOWN, and reconstruction COMPLETE/PARTIAL/UNKNOWN are predicates or appraisal dimensions that can coexist with an operation phase.
Therefore the formal model must avoid a single giant enum representing every combination.

## 5. Important finding: UNKNOWN is not one state
UNKNOWN must remain typed by boundary, at minimum:
- UNKNOWN_AUTHORITY
- UNKNOWN_FRESHNESS
- UNKNOWN_EFFECT
- UNKNOWN_RECONSTRUCTION
- UNKNOWN_FENCING
- UNKNOWN_EXCLUSIVITY
- UNKNOWN_RECONCILIATION.

This preserves the decision contract's ability to specify which uncertainty blocks which effect.

## 6. Adversarial result
No missing *semantic family* was discovered.
Two modeling corrections are mandatory before formalization:
1. separate lifecycle phase from orthogonal appraisal predicates;
2. type UNKNOWN by uncertainty boundary rather than using one undifferentiated UNKNOWN.

These are not new architecture branches; they are clarifications required to faithfully encode already-frozen contracts.

## 7. Historical ternary boundary
The historical ternary artifact remains outside this generic seed. It can later be represented as a legacy/compatibility subsystem whose undefined transitions remain UNKNOWN. No historical transition is invented here.

## Result
FORMAL_MODEL_SEED = SEMANTICALLY COMPLETE_AT_FAMILY_LEVEL
STATE_PHASE_ORTHOGONALITY = REQUIRED_MODELING_RULE
TYPED_UNKNOWN = REQUIRED_MODELING_RULE
NEW_BEHAVIOR_CHANGING_BRANCH = NONE
HISTORICAL_TERNARY = ISOLATED_BLOCKED_DEPENDENCY
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.106R — adversarial state-space composition audit: test whether the orthogonal state dimensions introduce impossible combinations, hidden illegal transitions, or an accidental collapse of UNKNOWN/STOP semantics. No implementation yet.