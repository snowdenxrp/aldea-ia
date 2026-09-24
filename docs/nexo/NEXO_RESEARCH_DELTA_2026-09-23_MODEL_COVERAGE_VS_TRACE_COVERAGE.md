# Nexo Research Delta — model coverage vs trace coverage

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## External cross-check
TLC coverage measures how often actions/statements in the specification are executed while generating new states; it is useful for identifying actions that never run, but it is not the same thing as proving that the implementation exercised the corresponding behavior. citeturn0search1turn0search6 TLC also reports explored/unique-state information, while the configured finite model determines the scope of the exhaustive result. citeturn0search2turn0search11 Research on TLA+ trace validation likewise treats implementation traces as a selected subset rather than exhaustive coverage. citeturn0search0turn0search7

## New conclusions
1. Nexo must not use one generic "coverage" field. At minimum distinguish:
   - `MODEL_STATE_COVERAGE`: reachable states explored within the configured finite model.
   - `MODEL_ACTION_COVERAGE`: specification actions/sub-actions exercised.
   - `MODEL_SCENARIO_COVERAGE`: adversarial scenario classes represented in the model.
   - `RUNTIME_TRACE_COVERAGE`: implementation scenarios actually executed and mapped.
   - `REFINEMENT_COVERAGE`: concrete transitions mapped to abstract transitions/stuttering rules.
2. A model action can have TLC coverage while its real implementation counterpart is never exercised. Conversely, runtime tests can execute implementation paths not represented in the model; that is a refinement gap, not evidence to ignore.
3. Coverage must be accompanied by scope: constants, config, invariants/properties, constraints, symmetry, tool version, and trace/test corpus.
4. Coverage is diagnostic evidence, not a safety score. Missing coverage should produce an explicit `UNCOVERED` condition rather than a numerical quality claim.
5. The future evidence ledger should preserve uncovered critical transition classes, because absence of execution is itself relevant evidence for planning verification.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
