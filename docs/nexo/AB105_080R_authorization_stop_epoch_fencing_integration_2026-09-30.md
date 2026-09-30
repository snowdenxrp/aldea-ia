# AB105.080R — adversarial authorization + STOP/epoch/fencing integration

Date: 2026-09-30
Chain: AB105.079R -> AB105.080R

## Objective
Test authorization freshness and in-flight execution against the existing STOP, revocation, epoch, and fencing model and determine whether a missing generic invariant remains.

## Fresh primary evidence
AWS states that temporary credential permissions are evaluated each time credentials are used for an AWS request, while policy changes can take a few minutes to propagate. AWS also provides role-session revocation using a deny policy tied to token issue time and documents a propagation-aware future boundary. [AWS IAM] citeturn0search0turn0search1
AWS's current policy evaluation documentation confirms that the enforcement decision is computed from the request context and all applicable policy classes, with explicit deny overriding allow. citeturn0search2turn0search3
AWS IAM Identity Center's revocation procedure demonstrates that revocation may require multiple enforcement steps and that a deny policy may need to remain in place until active role sessions expire. citeturn0search4

## Adversarial integration

### Case 1 — valid authorization followed by STOP
Result: the original authorization remains historical evidence; STOP creates a new control event. It does not retroactively change the decision made at T0.

### Case 2 — STOP before effect authorization checkpoint
Result: effect admission must fail or become UNKNOWN if the current authority cannot be established.

### Case 3 — STOP after provider operation started
Result: operation history remains STARTED/IN_FLIGHT; subsequent effects require independent observation. STOP does not prove zero prior mutation.

### Case 4 — epoch advances while operation is in flight
Result: the old decision cannot authorize a new side effect unless the operation has an explicit invariant covering the new epoch.

### Case 5 — fencing token is stale
Result: stale fencing evidence cannot establish current authority. Admission becomes UNKNOWN/STOP.

### Case 6 — revocation issued but propagation unknown
Result: REVOCATION_ISSUED != REVOCATION_ENFORCED. Nexo must not claim universal enforcement.

### Case 7 — cached authorization
Result: cache presence is not current authority. A cache entry must carry an explicit freshness/enforcement boundary.

### Case 8 — operation completes after revocation
Result: COMPLETED is an operation state, not proof that every side effect remained authorized throughout execution.

### Case 9 — rollback after revocation
Result: rollback is itself an effect path. Authorization for compensation/rollback must be represented separately from the authorization that started the original operation.

### Case 10 — provider reports cancellation
Result: CANCELLED does not imply ZERO_PRIOR_EFFECT. Reconciliation remains required.

### Case 11 — authorization evaluation is complete but effect evidence is missing
Result: AUTHORIZED_TO_START may be PROVEN while EFFECT_UNKNOWN remains the correct final evidence state.

### Case 12 — effect observed but authorization provenance is missing
Result: EFFECT_OBSERVED may be PROVEN while AUTHORIZATION_PROVENANCE remains UNKNOWN. Do not infer authorization from successful execution.

## Generic invariants confirmed
1. VALID_AT_T0 != VALID_AT_T1.
2. AUTHORIZATION_DECISION != EXECUTION_RESULT.
3. STOP_REQUESTED != STOP_ENFORCED.
4. REVOCATION_ISSUED != REVOCATION_ENFORCED_EVERYWHERE.
5. AUTH_CACHE_HIT != CURRENT_AUTHORITY.
6. AUTHORIZED_TO_START != AUTHORIZED_FOR_EVERY_LATER_SIDE_EFFECT.
7. OPERATION_CANCELLED != ZERO_PRIOR_EFFECT.
8. OPERATION_SUCCEEDED != EVERY_EXPECTED_EFFECT_PROVEN.
9. ROLLBACK != ABSENCE_OF_PRIOR_EFFECT.
10. EFFECT_OBSERVED != AUTHORIZATION_PROVEN.
11. AUTHORIZATION_PROVEN != EFFECT_OBSERVED.
12. STALE_FENCE != CURRENT_AUTHORITY.
13. UNKNOWN_ENFORCEMENT != DENIED.
14. UNKNOWN_ENFORCEMENT != ALLOWED.
15. REVOCATION/STOP history must never overwrite the historical decision or effect record.

## New result
No missing generic invariant was discovered.
The combined model is sufficient to represent:
AUTHORIZATION -> START -> IN_FLIGHT -> STOP/REVOCATION -> EFFECTS -> RECONCILIATION
while preserving UNKNOWN where enforcement or effect coverage is incomplete.

## Closure decision
AUTHORIZATION_EFFECTIVE_PERMISSION_GENERIC_BRANCH = CLOSED_WITH_PROVIDER-DEPENDENT_UNKNOWN
AUTHORIZATION_FRESHNESS_REVOCATION = CLOSED_WITH_PROVIDER-DEPENDENT_ENFORCEMENT
IN_FLIGHT_AUTHORIZATION = CLOSED_AT_GENERIC_LAYER

Provider-specific adapters remain outside the generic closure boundary. They may define concrete freshness windows, revocation mechanisms, fencing semantics, and operation reconciliation, but cannot collapse the generic UNKNOWN states.

## Integration result
No contradiction with the three previously closed branches:
- physical lifecycle remains physical evidence;
- configuration/drift remains configuration observation;
- causal provenance remains actor/request evidence;
- authorization remains authority evidence;
- operation/effect reconciliation remains a separate claim.

## Research stop rule
Do not reopen these branches without a concrete primary-source counterexample or a new Nexo requirement that changes the contract.

## Next exact direction
AB105.081R — small final integration checkpoint across physical lifecycle, configuration/drift, causal provenance, and authorization. Verify the contracts can coexist in one Claim/Decision/Evidence graph without identity or state collapse. If clean, close this AWS evidence campaign and return to unresolved Nexo core dependencies rather than extending AWS research indefinitely.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.