# NCS M0.27 — Preconstruct the success outcome before commit

Date: 2026-10-17
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PASS

## Finding

`executeProtectedTransition()` previously called `conditionalCommit.commit(candidate)` and only after a `COMMITTED` result constructed `SAFE_COMMIT` through the outcome classifier. The validator boundary checked that `reasons` and `evidence` were arrays, but did not establish that their contents could be traversed and frozen without throwing. A permitted array containing an object with a throwing enumerable getter could therefore allow the commit port to run and then throw while the success outcome was constructed.

This is a concrete contract-level edge case, not evidence that it occurs in the deployed runtime.

## Change

- `src/nexo/core/protected-transition.mjs`: construct the `SAFE_COMMIT` outcome before calling the conditional commit port; return that preconstructed result only if the commit reports `COMMITTED`.
- `tests/nexo/protected-transition.test.mjs`: regression test supplies PASS with evidence whose enumerable getter throws; asserts transition rejects before conditional commit and commit call count remains zero.
- No new abstraction, identifier scheme, reconciliation mechanism, or authority assumption was introduced.

## Evidence

Source commit: `aafe369082dec64599558ed7769c2e6e1988a846`
Regression-test commit / CI head: `dcee4a5e5dd2b5d80ab6163cd6137eb51c882aa4`

Focused CI on the test commit:
- M0 non-authority core contracts: https://github.com/snowdenxrp/aldea-ia/actions/runs/38987864543 — success.
- STEP 5 outcome classification / protected-transition tests: https://github.com/snowdenxrp/aldea-ia/actions/runs/38987864473 — success.
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/38987864490 — success.

## Boundaries

These focused workflows validate their covered tests at the recorded commit. No full-repository test suite, production runtime execution, exhaustive bypass audit, or deployment validation is claimed. This does not resolve the broader fact that production runtime reachability into `executeProtectedTransition()` has not been demonstrated. The classifier and commit ports remain injected dependencies, and legitimate authority remains outside this M0 change.

STEP 7 remains OPEN / STOP / UNKNOWN; Constitution remains uncommissioned and protected effects remain STOP.
