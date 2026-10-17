# NCS M0.41 — Require reconciliation after uncertain commit

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Finding

The protected transition returned generic `UNKNOWN` when conditional commit threw, returned a malformed result, or explicitly reported `COMMIT.UNKNOWN`. In these cases the transition cannot establish whether the mutation took effect. Generic UNKNOWN loses the actionable distinction that state reconciliation is required.

## Change

These three ambiguous commit outcomes now produce the existing terminal outcome `RECONCILE_REQUIRED`. A definite `CONDITIONAL_CONFLICT` remains `STALE_CANDIDATE`; explicit `FAILED` remains `UNKNOWN` because the code does not establish a stronger safe-state guarantee. Regression tests cover an exception carrying `IO_UNCERTAIN`, explicit `COMMIT.UNKNOWN`, and a malformed commit result.

This change marks reconciliation as required; it does not claim that reconciliation runs automatically or that the current reconciliation implementation proves authoritative state.

## Commits and CI

- Source commit: `b162c0375fa29e795d915a318e1b83b81554fbef`
- Regression-test commit / CI head: `9d471755e65b0de5cd4cc266eb6c5b9ecd67c279`
- STEP 4 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993658355 — success
- STEP 5 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993658376 — success
- M0 core contracts CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993658044 — success

## Limits

No automatic reconciliation, authoritative evidence, production runtime reachability, full-repository tests, or device tests are demonstrated. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
