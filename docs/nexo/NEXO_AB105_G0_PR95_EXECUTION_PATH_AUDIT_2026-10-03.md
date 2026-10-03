# NEXO AB105 G0 — PR #95 execution-path audit

Date: 2026-10-03

## Finding
PR #95 claims a 100-cycle visibility sample v3, but the fetched branch `nexo-ab105-g0-visibility-sample-v3` contains an ordering-witness-v2 workflow whose `push.branches` trigger is only:
- `nexo-ab105-g0-ordering-witness`

It does NOT include `nexo-ab105-g0-visibility-sample-v3`.

Therefore a push to the PR #95 branch cannot trigger that workflow through its declared branch filter.

The fetched workflow also reconstructs the test harness from `.github/workflows/nexo-ab105-g0-ordering-witness.yml`; no direct evidence in this workflow establishes that the claimed 100-cycle harness is the executed source.

## Consequence
PR #95 is **EXECUTION-PATH UNVERIFIED**. Its documentation/branch existence cannot be treated as 100-cycle runtime evidence.

This does not invalidate the previously accepted 10-cycle real-broker witness from run 37081442555; that remains the bounded empirical result.

## Frozen state
AB105.116R = FROZEN
AB105.117R = NOT_CREATED
TLC = NOT_RERUN
STALE_READ = UNKNOWN
VULNERABILITY = NOT_DECLARED

## DO-NOT-REPEAT
Do not count PR #95 as executed 100-cycle evidence.
Do not count PR #96 as executed prewarm evidence.
Do not alter AB105.116R based on either branch.
