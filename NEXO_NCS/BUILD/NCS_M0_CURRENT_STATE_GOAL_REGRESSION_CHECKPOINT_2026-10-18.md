# NCS M0 — Current-state mission goal regression guard

Date: 2026-10-18

## Change

Added a regression test using a separate persisted environment snapshot where the repair invariant has regressed after the mission's prior `settled_observed` record. `verifyRepairMissionGoalFromPersistedState()` must re-read current persisted state and return `blocked` with `NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT` instead of returning `goal_observed`.

## Evidence

- Test commit: https://github.com/snowdenxrp/aldea-ia/commit/5f7d268bc92920aad25599f6d2689267e18fd98a
- Exact-head CI: NOT YET VERIFIED. Available status/workflow lookup did not return check records. Do not call this PASS.
- STATUS update: https://github.com/snowdenxrp/aldea-ia/commit/b8d692ce986cdadd94ba814a3fe9d6c9dc9ad227
- Handoff update: https://github.com/snowdenxrp/aldea-ia/commit/316a030da65bb2dcf849885d975ba5801db80cbc

## Boundary

This regression proves that a verifier which reads a regressed persisted snapshot refuses to report the goal observed. It does not close the race between environment read and a later continuity write. No durable goal-observation write, mission completion, runtime cutover, protected-effect authorization, or cross-store atomicity is claimed.

## Next

1. Verify CI for the exact test commit.
2. Determine whether any durable observation protocol can be revision-fenced across the independent environment and continuity stores without introducing an unsupported generic transaction abstraction.
3. Until then, keep the verifier read-only and fail closed on uncertainty.

M0 incomplete. Protected effects STOP. STEP 7 OPEN / STOP / UNKNOWN.
