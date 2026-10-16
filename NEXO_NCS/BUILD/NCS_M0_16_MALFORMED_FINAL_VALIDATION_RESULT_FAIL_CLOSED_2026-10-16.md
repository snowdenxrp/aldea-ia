# NCS M0.16 — Malformed final semantic validation result fails closed

Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PASS

## Finding

`executeProtectedTransition()` previously validated only that the final semantic validator returned a recognized `status`. It did not require `reasons` and `evidence` to be arrays before proceeding. A malformed result such as `{ status: "PASS" }` could therefore reach conditional commit, then fail when the terminal outcome classifier received missing evidence. That would risk committing while the transition function cannot return a correctly classified terminal outcome.

## Change

- `src/nexo/core/protected-transition.mjs`: after validating the status, it now requires both `validation.reasons` and `validation.evidence` to be arrays. Otherwise it returns `UNKNOWN` before conditional commit.
- `tests/nexo/protected-transition.test.mjs`: added probes for PASS with missing arrays and FAIL with malformed reasons. Both assert UNKNOWN and zero commit calls.

## Exact evidence

- Source commit: `71bdc30bd7c3f84c4c134b24a87daeddf4dcdc45`
- Test commit / CI head: `9fe296b41a8ee8d18f12e2c3f4ecba1019ae041c`
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/38980153223 — success.
- STEP 5 outcome classification + protected transition tests: https://github.com/snowdenxrp/aldea-ia/actions/runs/38980153231 — success.
- M0 seven-command contract workflow: https://github.com/snowdenxrp/aldea-ia/actions/runs/38980153205 — success.

## Boundaries

This validates the shape of the final semantic validator's return value at this composition boundary. It does not authenticate the validator or its evidence, establish Genesis/owner authority, invoke `effectBoundary.prepare`, connect the production runtime, prove bypass closure, or establish full-repository test success.

STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective. Constitution is not frozen or commissioned; protected effects remain stopped.
