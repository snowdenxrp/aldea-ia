# NCS M0.39 — Fail closed on malformed authority-gate result

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Finding

`executeProtectedTransition()` validated that the authority-gate result had a recognized status, but it did not validate `reasons` and `evidence` as arrays before passing them to the outcome classifier. A result such as `{ status: "AUTHORIZED", reasons: "not-an-array", evidence: [] }` could reach later processing and throw while constructing an outcome, rather than safely stopping before snapshot isolation, candidate execution, semantic validation, or commit.

## Change

The transition now checks the authority result's `reasons` and `evidence` arrays immediately after validating its status. Malformed shape produces `UNKNOWN` with a controlled reason, before any later port is invoked. Regression test asserts isolate/execute/validate/commit call counts remain zero.

## Commits and CI

- Source commit: `4f8eec4e7e92adc1d992ce327af405bd0bcb6d8c`
- Test commit: `fecf86260feaf9f75c275ad954ae99365ce0f2c9`
- STEP 4: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993378610
- STEP 5: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993378537
- M0 core contracts: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993378595

All three listed CI runs completed successfully on source commit `4f8eec4e7e92adc1d992ce327af405bd0bcb6d8c`.

## Limits

This validates the shape of the authority-gate output only. It does not authenticate the authority, establish constitutional legitimacy, prove production runtime reachability, or prove protected-sink closure. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP. No full-repository or device test is claimed.
