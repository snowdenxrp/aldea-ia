# NCS M0.2 — CI evidence qualification — 2026-10-16

## Result

The dedicated observation-contract CI workflow has not been shown to run for the latest observation-contract change in this session.

## Exact evidence

- GitHub Actions run: [Nexo — STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/38973998980), commit `b53b8d91b3c847f5d7c46f48dd19d8db95b70ccd`, conclusion `success`.
- Its recorded job steps run `tests/nexo/outcome-classifier.test.mjs` and `tests/nexo/protected-transition.test.mjs`; they do not run `tests/nexo/observation.test.mjs`.
- Current branch workflow `.github/workflows/nexo-step-7-observation-contract.yml` has only `workflow_dispatch` and runs `node tests/nexo/observation.test.mjs`.
- The semantic-provenance and negative-resource-handoff workflows also use `workflow_dispatch`.
- The available GitHub connection in this session has read/fetch and file-write operations, but no workflow-dispatch action. No run was invented and no workflow trigger was modified.

## Qualification

The previous isolated Node 22 test is still only an isolated behavior check. Repository checkout / dedicated CI evidence for the observation test remains PENDING. A successful unrelated workflow is not evidence for this test.

No source/test/runtime/effect path was changed by this evidence check.

**STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective. No commissioning or protected effects.**
