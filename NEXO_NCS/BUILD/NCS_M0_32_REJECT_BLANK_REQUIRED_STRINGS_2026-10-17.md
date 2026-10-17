# NCS M0.32 — Reject blank required strings in core contracts

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Finding

The shared `requiredString()` contract rejected empty strings but accepted whitespace-only strings. Consequently claim identifiers/actions and policy-reference fields could pass the constructor while carrying no meaningful identifier content.

## Change

- `requiredString()` now rejects strings whose trimmed length is zero.
- The original nonblank value is returned unchanged; this validation does not silently rewrite or normalize identifiers.
- Regression tests cover whitespace-only `claimId`, `action`, and `policyContext.policyRef.hash`.

## Evidence

- Source commit: `d2354fab87163210b3c9ffae82bfe9afc7d9a689`
- Test commit / CI head: `930c038484fdd70ff7cc38ee56d34484850fa745`
- M0 core contracts CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989062031
- STEP 4 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989062021
- STEP 5 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989062023
- policyContext contract CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989062010

## Limits

This validates nonblank syntax only; it does not establish that identifiers are globally unique, canonical, authenticated, or authorized. No full-repository test run is claimed. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
