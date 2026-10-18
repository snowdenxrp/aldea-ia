# NCS M0 — Preserve mission context for unresolved prepared effects

Date: 2026-10-18
Status: IMPLEMENTED; EXACT-HEAD CI PASS

## Defect

`createLearningMemory()` retained prepared effect-journal entries beyond the journal soft cap, but unconditionally truncated mission plans to the last 50. A sufficiently old mission could therefore lose its persisted action/dependency context while its effect remained `prepared` and outcome-unknown. The journal still blocked redispatch, but the system could no longer reconstruct the mission that explains the unresolved operation.

`recordNexoPlan()` applied the same hard truncation after adding a new plan, so the problem could recur during ordinary mission recording.

## Change

- Added `retainNexoMissions()`.
- It identifies mission IDs referenced by `prepared` effect-journal entries and protects those mission plans from eviction.
- It prunes non-protected mission plans first and treats the 50-plan cap as soft when unresolved operations require more context. Attempts and execution records are also retained for every mission plan still in the retained set, because those records reconstruct step outcomes after restart.
- `createLearningMemory()` now constructs the retained effect journal first, then applies the same retention rule to mission plans.
- `recordNexoPlan()` uses the same retention rule; it no longer unconditionally slices the mission array.
- No new operation IDs, queues, retries, tombstones, or authority tokens were introduced.

## Regression

`tests/nexo/restart-reconstruction.test.mjs` now creates 60 mission plans with a prepared effect referencing the oldest plan and asserts:
- retention stays at 50 where possible;
- the referenced oldest mission remains present and reconstructable;
- its prepared journal entry remains unresolved;
- recording a new mission still does not evict that protected plan.

## Evidence

- Source commit: `d9ccf449f401bdedf5efad7017b67befb983014c`
- Test commit / exact source+test head: `ff6c6d26c03d7bd9908a82805b67af9bb96bfeb2`
- Final exact source+test head `9c5b38f9ecc2710ee1d7036f3b391a8cd3f85246` CI PASS: mission/restart [39097573478](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097573478), STEP 4 [39097573456](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097573456), STEP 5 [39097573552](https://github.com/snowdenxrp/aldea-ia/actions/runs/39097573552). The mission/restart workflow ran `restart-reconstruction.test.mjs` successfully, including retention of the oldest mission, all 120 attempts and 220 execution records for a mission with a prepared effect.
- [Source](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/assistants/memory.js)
- [Regression](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/restart-reconstruction.test.mjs)

## Limits

This preserves the plan context needed to interpret an unresolved operation. It does not prove the external effect's outcome, authenticate evidence, or establish current authority. A prepared entry remains UNKNOWN and cannot be redispatched merely because its mission plan is retained. M0 remains incomplete; protected effects remain STOP.

## Next

After exact-head CI, trace whether any other bounded collection can evict a dependency of an unresolved prepared effect. Keep the audit focused on causal context needed for recovery; do not convert this into a broad new retention/queue/tombstone architecture.
