# NCS M0 — Continuity migration recovery checkpoint

Date: 2026-10-18
Branch: `ncs-clean-architecture`
State: PARTIAL MIGRATION PATH IMPLEMENTED; MIGRATION REGRESSIONS PASS; RUNTIME EFFECT/OUTCOME PATH NOT MIGRATED

## Why this checkpoint exists

The mobile app closed during work on Nexo's continuity migration. This checkpoint records the exact repository state and distinguishes implemented migration code from any claim that a real local data set was migrated. Tests used temporary files; no user device data or production runtime was accessed.

## Confirmed code state

1. `src/nexo/core/continuity-store.mjs` provides a separate file-backed store. It strictly loads schema/revision, explicitly initializes only when absent, and conditionally commits against its store-local revision. Missing/corrupt data does not silently become an empty store.
2. `scripts/nexo-continuity.mjs::openNexoContinuityOwner()` is the migration/bootstrap boundary:
   - If the Nexo store already exists, it is canonical and the legacy copy is not merged.
   - If the store is absent and valid legacy Nexo memory is supplied, the memory is projected and initialized into the standalone store.
   - Empty initialization is only allowed when the caller explicitly passes `allowEmptyInitialization: true`.
   - A corrupt existing store fails closed; it does not fall back to the legacy copy.
3. `scripts/assistants.mjs` now reads the Nexo owner, builds mission input from the standalone snapshot, and persists mission admission through `continuity.owner.recordMission()`. The separate Lúmina learning file remains for learning analytics.
4. `scripts/simulate.mjs` opens the same Nexo store and persists only Lúmina's world/agents/events to `world-state.json`; `persistState()` no longer writes `nexoMemory`, and `applyState()` no longer attaches Nexo memory to the simulation object.
5. The runtime execution implementation in `src/nexo/runtime.js` is **not yet migrated**: it still imports `recordNexoOutcome`, `recordNexoExecution`, `recordNexoPlan`, and `reconstructNexoMission` from `src/assistants/memory.js`, and its `executeNexoStep()` works against the legacy memory object. Therefore independent storage and mission admission are implemented, but effect PREPARED/terminal outcome/restart reconstruction are not yet integrated end-to-end through the owner.

## Migration regression added and verified

Added `tests/nexo/continuity-migration.test.mjs`. It checks:
- Legacy missions, attempts, do-not-repeat records, executions, and a valid PREPARED obligation are preserved in the independent Nexo snapshot.
- Learning analytics (`runs`, `lessons`, `patterns`) are excluded.
- Reopening uses the canonical Nexo store and does not merge a stale legacy copy.
- Corrupt canonical Nexo state fails closed rather than falling back to legacy.
- Missing initial continuity is UNKNOWN by default; an empty bootstrap requires explicit opt-in.

Workflow `.github/workflows/nexo-mission-admission-continuity.yml` now triggers on the owner/store/operations modules and migration scripts, and runs both the dedicated store test and migration test.

Exact code/test/workflow head: `8b45736b92d6510ed5ccdb3d151b969210b2c66b`.
CI PASS: [mission/restart continuity run 39099935315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39099935315). The run executed orchestrator, runtime, effect adapter, restart reconstruction, simulation persistence, continuity contract, continuity store, and continuity migration tests.

## Not yet proven / risks to carry

- No real local/user data migration was performed by this chat; only the migration code path and temporary-directory regressions were tested.
- Mission admission is committed to Nexo continuity before Lúmina state is persisted. These are separate stores and are not one atomic transaction. A state-revision conflict can leave a persisted plan based on a stale simulation snapshot; that plan must not authorize execution without a fresh operation-specific admission check.
- `src/nexo/runtime.js` still mutates the legacy in-memory continuity shape and does not call the Nexo owner for PREPARED/terminal commits. Do not call the end-to-end migration complete.
- The owner intentionally cannot reconcile a prepared external effect. Such effects remain UNKNOWN; do not redispatch or create successor missions around them.
- A separate file and passing tests do not establish fsync/power-loss durability, anti-rollback, current authority, external-effect truth, or constitutional ownership.

## Next bounded work

1. Define and test the owner contract for terminal outcomes and mission reconstruction without trusting caller-provided `verified` flags or labels as independent proof.
2. Integrate `executeNexoStep()` only after the prepare-before-dispatch and final admission ordering is explicit; preserve the existing effect journal and operation identity.
3. Test crash cuts across Nexo-store commit and Lúmina world-state commit; no dual-write/transaction fiction, no hidden migration fallback, no silent deletion of legacy history.
4. Add an end-to-end test proving Nexo mission/effect continuity can be loaded without reading Lúmina state, while unresolved PREPARED blocks dispatch and replanning.
5. Update STATUS after each verified block.

## Unchanged safety status

M0 incomplete. Protected effects STOP. Prepared external outcomes UNKNOWN. STEP 7 OPEN / STOP / UNKNOWN. This checkpoint does not grant authority or release any gate.
