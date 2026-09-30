# AB105.114R — finite-model preflight failure and semantic correction

Date: 2026-09-30
Chain: AB105.113R -> AB105.114R

## Trigger
AB105.113R produced the first concrete TLA+ artifact. Before treating it as executable verification, a semantic preflight was performed.

## Finding 1 — the model was not yet the intended 12-invariant model
The artifact contained only a subset of the frozen safety boundaries and lacked complete authority, replay, reconstruction, recovery, atomicity, and input-correlation transitions. Therefore it cannot be treated as the promised minimal model-checking artifact.

## Finding 2 — a frozen invariant was encoded incorrectly
The first artifact encoded:
effect=OBSERVED => authority=VALID.
This is too strong and contradicts the previously frozen separation:
EFFECT_OBSERVED != AUTHORIZATION_PROVEN.
An external effect may be observed while authorization evidence is unavailable or stale. That state must remain representable because reconciliation and causal analysis explicitly preserve UNKNOWN.

The correct semantic boundary is about CONSEQUENTIALLY EXECUTING/CREATING an effect, not about OBSERVING an effect that already exists.

Therefore the corrected model requires separate provenance/origin state, at minimum:
- EFFECT_ORIGIN = NONE | NEXO_EXECUTED | EXTERNAL_OBSERVED;
- AUTHORITY_AT_EXECUTION = VALID | UNKNOWN | INVALID when NEXO_EXECUTED;
- EFFECT_STATE = NONE | OBSERVED | UNKNOWN | PARTIAL | ABSENT_UNPROVEN.

Then the safety rule can constrain a NEXO_EXECUTED consequential effect without forbidding EXTERNAL_OBSERVED evidence.

## Concrete preflight counterexample
A bounded independent state exploration of the first artifact found the one-step trace:
Init -> ObserveEffect(OBSERVED)
with authority=UNKNOWN and effect=OBSERVED.
This violates the artifact's own NoEffectWithoutAuthority invariant.
That is not evidence of a Nexo design failure; it is evidence that the first model encoded the wrong abstraction boundary.

## Finding 3 — deadlock semantics remain intentional
TLC reports a state with no enabled successor as a deadlock, but Nexo's STOP/BLOCKED states can intentionally wait for evidence. Therefore the corrected model must encode SAFE_WAIT/terminal semantics rather than blindly treating every blocked state as a defect. TLC's documentation confirms that deadlock checking is a model configuration concern. citeturn0search0turn0search11

## Finding 4 — symmetry remains conditional
Symmetry may reduce exploration only for identities whose permutation preserves the specification and all checked properties. TLC does not prove that the declared symmetry is sound. Runtime roles PRED/SUCC and semantic epoch labels therefore remain non-symmetric. citeturn0search2turn0search4

## Verification status
AB105.113R_ARTIFACT = PRELIMINARY_AND_REJECTED_AS_VERIFICATION_ARTIFACT
SEMANTIC_PREFLIGHT = FAILED_WITH_LOCAL_MODELING_ERROR
COUNTEREXAMPLE = FOUND_IN_FIRST_ARTIFACT
FROZEN_NEXO_SEMANTICS = NOT_CHANGED
EXTERNAL_OBSERVED_EFFECT_WITH_UNKNOWN_AUTH = REQUIRED_REPRESENTATION
TLC_EXECUTION = NOT_PERFORMED_IN_CURRENT_RUNTIME
UNBOUNDED_PROOF = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Anti-collapse
OBSERVED_EFFECT != AUTHORIZATION_PROOF.
EXTERNAL_OBSERVED_EFFECT != NEXO_EXECUTED_EFFECT.
MODEL_COUNTEREXAMPLE != NEXO_DESIGN_COUNTEREXAMPLE.
PRELIMINARY_MODEL != VERIFIED_MODEL.

## Next exact direction
AB105.115R — construct the corrected minimal model with explicit effect origin, authority-at-execution, input correlation/admission, replay identity, reconstruction state, recovery/successor exclusivity, and atomicity capability. Then perform a second semantic preflight before attempting TLC. Do not reuse the flawed invariant from AB105.113R.