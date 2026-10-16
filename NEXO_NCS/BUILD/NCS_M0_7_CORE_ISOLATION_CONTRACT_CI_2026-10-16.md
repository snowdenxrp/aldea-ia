# NCS M0.7 — Core isolation contract in CI
Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: EXISTING CONTRACT TEST INCLUDED / CI PASS CONFIRMED

## Scope
Added the existing `tests/nexo/core-contracts.test.mjs` to the narrow non-authority Core workflow. No production source was changed.

## What the test establishes
The test exercises current contract behavior for:
- ClaimEnvelope required fields and immutable/detached nested data;
- detached candidate state and expected revision validation;
- explicit validation, commit and outcome result shapes;
- policy-context required fields and rejected malformed policy status;
- default Core ports fail with `NOT_IMPLEMENTED` when called without an implementation;
- proposal port does not expose the conditional-commit capability.

## Important interpretation
The constructor only validates that `claimId` is a non-empty string. This test does **not** establish legitimate claim identity, provenance authentication, authority legitimacy, production caller reachability, or protected-effect safety. A shape-valid ClaimEnvelope is not automatically a legitimate or authorized claim.

The test also confirms the current default port behavior, not that every production composition uses these defaults or that all bypass paths are closed.

## CI evidence
Latest confirmed run:
- Run ID: `38978251261`
- URL: https://github.com/snowdenxrp/aldea-ia/actions/runs/38978251261
- Tested commit: `1ace583c39e9a86e6c2fe69b126ba6d63cc37ef4`
- Workflow: `Nexo — M0 non-authority core contracts`
- Job `observation-contract`: `success`
- `node tests/nexo/observation.test.mjs`: `success`
- `node tests/nexo/observation-equivalence.test.mjs`: `success`
- `node tests/nexo/outcome-classifier.test.mjs`: `success`
- `node tests/nexo/core-contracts.test.mjs`: `success`

Workflow:
https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-step-7-observation-contract.yml

## Limits
- This is a four-command focused CI workflow, not the full `npm test` suite.
- It does not prove exhaustive call graph/bypass closure or deployment behavior.
- It does not resolve the blocked candidate-to-ClaimEnvelope identity mapping.
- It does not commission the Constitution, establish Genesis trust, or authorize protected effects.
- STEP 7 remains OPEN / STOP / UNKNOWN; Direction B / L2 remains the objective.

## Next gate
Keep this boundary as test evidence. Before changing runtime or adding a mapping, resolve claim identity from an existing legitimate source or explicitly redesign that root contract with owner review. Do not generate an ID merely to make the constructor test pass.
