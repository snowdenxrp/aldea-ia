# NCS M0.9 — Six focused Core contracts in CI
Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: CI PASS — focused contracts only

## Change
Extended `.github/workflows/nexo-step-7-observation-contract.yml` so the M0 non-authority contract workflow also runs:
- `node tests/nexo/protected-transition.test.mjs`
- `node tests/nexo/reconciliation.test.mjs`

The workflow path filters for both push and pull_request now include the corresponding source and test files. The final workflow commit is `9fe371c8c49e0398e7207a81e8cfcf78c022d5e5`; workflow blob `f79f0fbed8609221e10f45ea131a0ee3e820d589`.

## CI evidence
- Run: https://github.com/snowdenxrp/aldea-ia/actions/runs/38978624286
- Event: push
- Branch: `ncs-clean-architecture`
- Head SHA: `9fe371c8c49e0398e7207a81e8cfcf78c022d5e5`
- Job: `observation-contract`
- Job conclusion: `success`
- All six test commands completed successfully:
  1. `tests/nexo/observation.test.mjs`
  2. `tests/nexo/observation-equivalence.test.mjs`
  3. `tests/nexo/outcome-classifier.test.mjs`
  4. `tests/nexo/core-contracts.test.mjs`
  5. `tests/nexo/protected-transition.test.mjs`
  6. `tests/nexo/reconciliation.test.mjs`

## What this establishes
The six existing focused test files pass under GitHub Actions on the recorded commit. No production source file was changed in this step; this was test-surface and trigger coverage expansion only.

## Limits that remain
- This is not the full repository test suite.
- Passing protected-transition tests does not authenticate the test-injected `AUTHORIZED` result or prove the real owner/Constitution authority path.
- The reconciler still accepts caller-supplied `authoritative: true` as a structural predicate; this workflow does not authenticate evidence provenance.
- The new Core reconciler has no caller identified in the bounded source scan; no production path or bypass closure is proven.
- `effectBoundary.prepare` remains a default `NOT_IMPLEMENTED` port and is not invoked by `executeProtectedTransition()`.
- No runtime integration, production authority, legitimate claim-identity mapping, Constitution freeze/commissioning, or protected effects are established.

## Next bounded step
Review the Core's existing claim and authority result contracts against their consuming gates and test assumptions, without inventing claim IDs, identity authorities, trust registries, or new mechanisms. Any contract mismatch that would require structural change is a stop-and-redesign item, not a quick patch.

STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective. No commissioning or protected effects.
