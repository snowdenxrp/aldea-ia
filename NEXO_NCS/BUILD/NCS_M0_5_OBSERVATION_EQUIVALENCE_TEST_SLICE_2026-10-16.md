# NCS M0.5 — Observation-equivalence test slice
Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: TEST ADDED / CI PASS CONFIRMED

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

Confirmed GitHub Actions evidence:
- Run ID: `38977786284`
- Run URL: https://github.com/snowdenxrp/aldea-ia/actions/runs/38977786284
- Tested commit: `2f0ac5b4debd2d1f36038f6ae6b6b2fdce65107b`
- Event: `push`; workflow: `Nexo — STEP 7 observation contract`
- Job `observation-contract`: `success`
- Step `node tests/nexo/observation.test.mjs`: `success`
- Step `node tests/nexo/observation-equivalence.test.mjs`: `success`

This confirms both listed test commands passed on that repository commit. It does not establish full-suite success, production integration, authentic observations, or constitutional/protected-effect enforcement.

## Safety boundary
- No runtime/orchestrator integration.
- No source implementation change.
- No new identifier, persistence, queue, retry, authority, or commit behavior.
- No constitutional commissioning or protected effects.
- STEP 7 remains OPEN / STOP / UNKNOWN; Direction B / L2 remains the objective.

## Next
CI evidence is now verified above. Next: choose another already-existing pure Core contract and inspect its tests before changing source. Keep this work non-authoritative; do not connect it to the runtime/effect path.


## Follow-up CI run after expanding the bounded contract workflow

A later workflow run also passed and includes the two observation tests plus the existing outcome-classifier contract test:
- Run ID: `38978170086`
- URL: https://github.com/snowdenxrp/aldea-ia/actions/runs/38978170086
- Tested commit: `1fbc509c8e97545960097043a93380672d846961`
- Job `observation-contract`: `success`
- `node tests/nexo/observation.test.mjs`: `success`
- `node tests/nexo/observation-equivalence.test.mjs`: `success`
- `node tests/nexo/outcome-classifier.test.mjs`: `success`

The workflow was then adjusted once more to align pull-request path filters with the same test dependencies; that final filter-only commit is `f12454ed7f537aff90a0bbd62c53ca955eef34de`. The successful run above proves the three commands at its tested commit, not the final filter-only revision specifically.
