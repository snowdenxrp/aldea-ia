# AB104.113 — Nexo CI diagnosis and clean continuation — 2026-09-26

## Continuity
Previous checkpoint: AB104.112 / replan-lineage validation.
Current Nexo orchestrator schema is version 4 and explicitly carries `parentMissionId` and `replanReason`.

## CI diagnosis
Run 2192 (`36203298338`) failed in `tests/nexo/orchestrator.test.mjs` because that workflow checked out an older test revision whose assertion still expected mission schema version 3 while the implementation had already advanced to version 4.

This was verified from the actual runner log and source at the checked-out commit. The current `main` test file now expects version 4, matching `src/nexo/orchestrator.js`.

This is a test/checkout synchronization failure, not evidence that the production orchestrator should be downgraded. The version-4 schema is required by the persisted mission-lineage fields and execution-memory signals.

## Current verified state
- Latest scheduled Lúmina simulation run 2195 (`36203597311`) completed SUCCESS on its checked-out parent commit.
- Current `main` has since advanced through the persistent simulation state update commit `4a35b4e361b34f134c69dcdc5ca7d40053530f3d`.
- The current orchestrator source reports schema version 4.
- The current orchestrator test reports schema version 4.
- No claim is made that a fresh full CI run against the newest `main` has passed until GitHub produces that evidence.

## No-failure rule
Historical CI failures are retained as evidence and are not erased. The failure is considered resolved only after a fresh run against the corrected current tree passes. Do not rewrite history to make the failure disappear.

## Next exact action
1. Verify the first fresh full Lúmina run triggered from the corrected current tree.
2. If it fails, inspect the exact runner log and repair the root cause only.
3. Once CI is clean, continue the multi-step dependency/failure/replan/recovery tests.
4. Persist the next checkpoint with exact commit and CI evidence.

## Boundaries
No arbitrary OS/device/TV control is established. Nexo remains a bounded Lúmina executor. UNKNOWN/PENDING and P_AA/AB65 epistemic boundaries remain unchanged.
