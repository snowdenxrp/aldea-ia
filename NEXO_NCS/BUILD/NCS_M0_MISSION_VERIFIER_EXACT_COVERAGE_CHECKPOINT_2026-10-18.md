# NCS M0 — Mission verifier exact-coverage hardening

Date: 2026-10-18

The mission goal verifier previously failed to reject duplicate step IDs and ignored extra journal entries whose step IDs were not declared by the mission. This could produce a false-positive `goal_observed` result.

The verifier now rejects duplicate/invalid step IDs with `NEXO_REPAIR_MISSION_STEP_OR_DEPENDENCY_UNSUPPORTED` and requires exact mission journal coverage, returning `NEXO_REPAIR_MISSION_JOURNAL_COVERAGE_MISMATCH` for undeclared or missing entries.

Regression tests were added for both cases in `tests/nexo/simulation-restart-persistence.test.mjs`.

Code commit: https://github.com/snowdenxrp/aldea-ia/commit/25598ba80e377cdf39498991f29abc665a4ded69
Code + test head: https://github.com/snowdenxrp/aldea-ia/commit/b74cc37edfad915fc8cc5deaf9269c6f15b28872

Exact-head CI is NOT YET VERIFIED. Available status/workflow lookup returned no records; do not interpret that as PASS.

This is validation hardening only. No goal-observation persistence, mission completion, replan, runtime cutover, protected-effect authorization, or cross-store atomicity is claimed. Continuity CAS cannot atomically fence the separate Lúmina environment file.

Next: verify exact-head Actions; then test the verification-to-record race before designing durable goal-observation persistence.

M0 incomplete. Protected effects STOP. STEP 7 OPEN / STOP / UNKNOWN.
