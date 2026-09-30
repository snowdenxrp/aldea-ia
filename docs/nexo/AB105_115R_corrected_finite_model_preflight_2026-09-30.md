# AB105.115R — corrected finite TLA+ model and second semantic preflight

Date: 2026-09-30
Chain: AB105.114R -> AB105.115R

## Objective
Replace the rejected AB105.113R abstraction rather than patching it. The corrected model separates effect observation from effect execution and binds consequential execution to authority-at-execution.

## Corrections
1. EFFECT_ORIGIN is explicit: NONE, NEXO_EXECUTED, EXTERNAL_OBSERVED.
2. AUTHORITY_AT_EXECUTION is separate from CURRENT authority.
3. EXTERNAL_OBSERVED + UNKNOWN current authority remains representable.
4. Consequential execution requires VALID authority at execution time.
5. Replay identity is represented separately from operation state.
6. Input freshness is admitted explicitly rather than inferred from receipt.
7. STOP and fencing have separate request/issuance versus enforcement transitions.

## Semantic preflight
The corrected structure now preserves the previously frozen rule EFFECT_OBSERVED != AUTHORIZATION_PROVEN and avoids the AB105.113R false constraint.

Required adversarial states remain representable:
- external effect observed while current authority is UNKNOWN;
- Nexo execution with authority valid at execution but stale later;
- duplicate operation identity;
- stale input admission;
- UNKNOWN effect outcome;
- STOP requested before enforcement;
- fence issued before enforcement.

## Tooling boundary
Primary TLA+ documentation confirms TLC checks invariants over reachable states of the configured finite model and can report counterexample traces; it also distinguishes model checking from mathematical proof. citeturn0search12turn0search14
The official TLA+ repository documents the command-line TLC tool and current toolchain. citeturn0search0turn0search1

## Execution status
The corrected artifact was committed to the canonical repository.
TLC execution was NOT performed in this environment because the official TLA+ executable was not available locally and external package download was unavailable. No PASS/FAIL claim is made.

Therefore:
SEMANTIC_CORRECTION = COMPLETED
SECOND_PREFLIGHT = STRUCTURALLY_COMPLETED
TLC_MODEL_CHECK = NOT_RUN
FORMAL_PROOF = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Anti-overclaim
MODEL_WRITTEN != MODEL_CHECKED.
MODEL_CHECKED != UNBOUNDED_PROOF.
EXTERNAL_OBSERVED_EFFECT != NEXO_EXECUTED_EFFECT.
CURRENT_AUTHORITY != AUTHORITY_AT_EXECUTION.

## Next exact direction
AB105.116R — obtain/run the official TLC tool against this corrected artifact (single worker first for deterministic shortest counterexample), then record the exact state count, invariant/deadlock result, and any counterexample. If TLC cannot run, record that as a tooling boundary rather than simulating a PASS.