# NCS M0.5 — Observation-equivalence test slice
Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: TEST ADDED / CI RESULT NOT YET CONFIRMED

## Why this slice
The claim-identity mapping is blocked, so no conversion to ClaimEnvelope is being implemented. To continue safe M0 progress without widening the architecture, this slice adds focused regression tests for the already-existing pure function `evaluateNegativeResourceEquivalence()`. No production source was changed.

## Files and commits
- New test: `tests/nexo/observation-equivalence.test.mjs`
  - commit: `17c140b0d3044fccafbca8e1f6972abe203bc361`
  - URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/observation-equivalence.test.mjs
- CI workflow updated to run both observation contract tests and trigger on their source/test paths:
  - `.github/workflows/nexo-step-7-observation-contract.yml`
  - commit: `2f0ac5b4debd2d1f36038f6ae6b6b2fdce65107b`
  - URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-step-7-observation-contract.yml

## Cases covered by the new test
- Complete matching causal dimensions => EQUIVALENT.
- Resource type, observed amount, target incarnation, freshness, causal provenance, or producer source mismatch => NON_EQUIVALENT.
- Missing claim-critical freshness, unsupported finding class, or missing observation => UNKNOWN.
- Result reasons are immutable.

These tests specify only the current function's declared behavior for this bounded input set. They do not prove that production producers supply these dimensions, that the equivalence model is complete for every finding class, or that the planner uses the result.

## Validation status
The existing CI workflow was changed to execute:
1. `node tests/nexo/observation.test.mjs`
2. `node tests/nexo/observation-equivalence.test.mjs`

At the time this note was written, no successful Actions run for the updated workflow had been confirmed. Therefore the new test is **not yet reported as passing CI**. Do not treat a created test file or workflow commit as test execution evidence.

## Safety boundary
- No runtime/orchestrator integration.
- No source implementation change.
- No new identifier, persistence, queue, retry, authority, or commit behavior.
- No constitutional commissioning or protected effects.
- STEP 7 remains OPEN / STOP / UNKNOWN; Direction B / L2 remains the objective.

## Next
Verify the Actions run for commit `2f0ac5b4debd2d1f36038f6ae6b6b2fdce65107b` and inspect the exact job steps/logs. If CI fails, diagnose only this bounded test/workflow slice. If CI succeeds, record the run ID and exact step conclusions before selecting any further slice.
