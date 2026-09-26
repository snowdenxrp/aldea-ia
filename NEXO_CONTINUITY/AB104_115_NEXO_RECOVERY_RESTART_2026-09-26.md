# AB104.115 — Nexo recovery + serialized restart coverage — 2026-09-26

Previous: AB104.114.
Implementation commit: c0516b5cf4a7933086ba93ba973cf5465d4196d8.

Added:
- Serialized-memory restart regression: execution journal is cloned before recreating the Lúmina adapter, and the duplicate execution must return the persisted result without running the precondition or mutating the simulation again.
- Two-step real Lúmina chain: step 1 succeeds; step 2 fails because water is unavailable; mission enters needs_replan.
- Recovery replan explicitly preserves parentMissionId and replanReason after the step-2 failure.
- Historical evidence and failures are untouched.

Verification:
- Fresh CI for this newest commit is still required before declaring the tree clean.
- No execution success is claimed from tests not run in GitHub Actions.

Next:
- Verify CI for c0516b5.
- If clean, continue with recovery execution of the replanned mission and assert the recovered action completes while retaining lineage.
