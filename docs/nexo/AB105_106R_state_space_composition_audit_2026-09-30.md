# AB105.106R — adversarial state-space composition audit

Date: 2026-09-30
Chain: AB105.105R -> AB105.106R

## Objective
Test whether the orthogonal state dimensions introduced by AB105.105R create impossible combinations, hidden illegal transitions, or accidental collapse of UNKNOWN/STOP semantics.

## Evidence boundary
TLA+ treats type/state invariants as properties over all reachable states and supports proving invariants over Init/Next behavior; refinement then relates a lower-level specification to an abstract one. This supports testing composition before implementation. citeturn0search12turn0search14
NIST SP 800-53A likewise separates assessment objectives/methods/objects and emphasizes traceability from requirements to findings, supporting explicit state/property coverage rather than a single undifferentiated test result. citeturn0search0turn0search13

## 1. Composition attacks

### C1 — STOP with valid authority
STOP can coexist with authority that is still valid. Authority validity does not cancel STOP.
PASS.

### C2 — STOP with stale authority
Both conditions can coexist; stale authority strengthens the block but is not required for STOP.
PASS.

### C3 — DECIDED + AUTHORITY_UNKNOWN
Decision record can exist while executability is unknown.
PASS; must not auto-promote to executable.

### C4 — DECIDED + AUTHORITY_STALE
Decision remains historical evidence but cannot be treated as current executable authority.
PASS.

### C5 — STARTED + UNKNOWN_EFFECT
Valid: an external request may have been issued without an observed outcome.
PASS.

### C6 — STOP_ENFORCED + EFFECT_UNKNOWN
Valid: stop enforcement does not prove whether an earlier external effect occurred.
PASS.

### C7 — RECONCILING + STOP_REQUESTED
Valid: stopping further effects and reconciling prior effects are separate concerns.
PASS.

### C8 — RECONSTRUCTED + AUTHORITY_CURRENT + EXCLUSIVITY_UNKNOWN
Valid: restored state and current authority do not prove predecessor exclusion.
PASS.

### C9 — SUCCESSOR_RELEASED + EFFECT_RECONCILIATION_UNKNOWN
INVALID for consequential exclusive release unless policy explicitly permits bounded uncertainty.
PASS — release predicate blocks it by default.

### C10 — ATOMIC capability + UNKNOWN participant outcome
Must remain unresolved rather than converted to COMMITTED or ABORTED without protocol evidence.
PASS.

### C11 — PARTIAL EventDAG + terminal record
Terminal record cannot erase missing predecessor/successor coverage.
PASS.

### C12 — fresh evidence + conflicting evidence
Freshness does not resolve semantic conflict.
PASS.

### C13 — independent evidence + stale evidence
Independence and freshness are orthogonal dimensions.
PASS.

### C14 — recovery complete + prior effect unknown
Recovery completion cannot imply zero prior external effect.
PASS.

### C15 — replay recognized + effect status unknown
Replay recognition prevents treating the request as a new operation; it does not prove the original effect outcome.
PASS.

## 2. Illegal-transition audit
The following transitions are explicitly prohibited at the semantic layer unless a policy/adapter contract supplies the missing proof:

- DECIDED -> CONSEQUENTIAL_EFFECT without current authority validation when required.
- UNKNOWN_AUTHORITY -> AUTHORIZED_TO_START.
- STOP_REQUESTED -> STOP_ENFORCED without enforcement evidence.
- FENCE_ISSUED -> SUCCESSOR_RELEASED without enforcement/exclusivity evidence.
- EFFECT_UNKNOWN -> EFFECT_ABSENT.
- EVENTDAG_PARTIAL -> TERMINAL_COMPLETE.
- RECONSTRUCTION_COMPLETE -> CURRENT_AUTHORITY without reauthorization.
- COMPENSATED -> ATOMIC.
- TIMEOUT -> COMMITTED.
- ACK -> EFFECT_PROVEN when the underlying protocol does not define that equivalence.

## 3. Composition invariant set

INV-01: CURRENT_AUTHORITY requires a valid authority evidence boundary.
INV-02: DECIDED does not imply EXECUTABLE.
INV-03: STOP_REQUESTED does not imply STOP_ENFORCED.
INV-04: FENCE_ISSUED does not imply FENCE_ENFORCED.
INV-05: SUCCESSOR_AUTHORITY does not imply SUCCESSOR_EXCLUSIVITY.
INV-06: EFFECT_OBSERVED does not imply AUTHORIZATION_PROVEN.
INV-07: AUTHORIZATION_PROVEN does not imply EFFECT_OBSERVED.
INV-08: UNKNOWN_EFFECT does not imply EFFECT_ABSENT.
INV-09: PARTIAL_RECONSTRUCTION does not imply TERMINALITY.
INV-10: FRESH does not imply CURRENT_FOREVER.
INV-11: INDEPENDENT does not imply FRESH.
INV-12: RECONCILED does not imply ATOMIC.
INV-13: RECOVERY_RELEASED does not imply ZERO_PRIOR_EFFECT.
INV-14: historical evidence does not become current authority merely by being newer than an older checkpoint.

## 4. Critical modeling result
The orthogonal model does not create a semantic contradiction. Several combinations that initially look unusual are actually required to represent real distributed failure states.
The dangerous alternative would be a product-state enum that silently removes combinations such as STOP_REQUESTED + EFFECT_UNKNOWN or CURRENT_AUTHORITY + EXCLUSIVITY_UNKNOWN.

Therefore the formal model should use:
- lifecycle variables;
- independent appraisal predicates;
- explicit transition guards;
- typed UNKNOWN states;
- policy-defined release predicates.

## 5. State-space control
Full Cartesian enumeration is not required at this stage and would create combinatorial noise. The formalization should constrain the reachable state space through invariants and transition guards, then use model checking/proof to test those constraints.
This is consistent with TLA+ invariant methodology: define Init/Next behavior, then prove the invariant over all reachable behaviors. citeturn0search12

## Result
STATE_COMPOSITION = PASSED_ADVERSARIAL_AUDIT
ORTHOGONAL_DIMENSIONS = PRESERVED
UNKNOWN_COLLAPSE = REJECTED
STOP_COLLAPSE = REJECTED
ILLEGAL_TRANSITIONS = IDENTIFIED
NEW_BEHAVIOR_CHANGING_SEMANTIC_BRANCH = NONE
FORMAL_MODEL = READY_FOR_SPECIFICATION_SEED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.107R — construct the first executable-free formal specification skeleton: variables, Init, Next, invariants, and explicit UNKNOWN/STOP guards. No production code and no protocol implementation. Then adversarially inspect the specification itself for semantic drift.