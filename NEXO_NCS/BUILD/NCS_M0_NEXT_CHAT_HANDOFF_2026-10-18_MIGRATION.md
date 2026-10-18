## Update: fail-closed reconstruction for unresolved PREPARED (2026-10-18)

- `reconstructNexoMissionFromSnapshot()` now checks the independent effect journal. If any effect for the mission remains `prepared`, reconstruction returns a blocked mission with objective `reconcile_prepared_effect`; the affected step is blocked with code `NEXO_EFFECT_RECONCILIATION_REQUIRED` and its idempotency key.
- This unresolved state dominates ordinary failure/replan status so replan cannot route around an effect that may already have occurred. It is not a reconciliation result and not permission to execute.
- Exact-head CI PASS at `1f359dfd0ef4c736431eb1f9890d061bbf9680b6`: mission/restart [39104631021](https://github.com/snowdenxrp/aldea-ia/actions/runs/39104631021), semantic validation [39104631004](https://github.com/snowdenxrp/aldea-ia/actions/runs/39104631004), outcome classification [39104630998](https://github.com/snowdenxrp/aldea-ia/actions/runs/39104630998).
- Next safe boundary remains: integrate runtime through Nexo owner only after independent operation-specific reconciliation and terminal settlement contracts exist. Do not add a caller-supplied boolean/callback as proof; do not dispatch or replan around PREPARED.

---

## Update: Nexo-owned mission reconstruction landed (2026-10-18)

- `src/nexo/core/continuity-owner.mjs` now exposes `reconstructMission(missionId)`, reconstructing from the standalone Nexo snapshot. Missing mission and invalid ID return explicit outcomes.
- Regression tests landed in `tests/nexo/continuity-contract.test.mjs`.
- Exact-head CI passed for commit `024c28c55458a517c03be37943651e805de07ca1`: mission/restart [39104216392](https://github.com/snowdenxrp/aldea-ia/actions/runs/39104216392), semantic validation [39104216377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39104216377), outcome classification [39104216391](https://github.com/snowdenxrp/aldea-ia/actions/runs/39104216391).
- This is a Nexo-owned reconstruction API, not a completed runtime cutover. `src/nexo/runtime.js` still imports legacy memory functions. The API does not establish that the mission is current against Lúmina's environment and does not authorize execution.
- Next implementation boundary: trace the runtime's persisted execution path and add the owner integration without dispatching effects until the PREPARED ordering, final admission, terminal commit, and crash-window behavior are made explicit. Do not invent a terminal-success proof: the current owner must remain unable to settle ambiguous PREPARED effects until an independent operation-specific verifier exists.

---

# NCS — NEXT CHAT HANDOFF: FINISH NEXO CONTINUITY MIGRATION
Date: 2026-10-18
Repository: `snowdenxrp/aldea-ia`
Branch: `ncs-clean-architecture`
Priority: **M0 — finish Nexo's migration to independent operational continuity**
Status: **PARTIAL MIGRATION IMPLEMENTED; runtime effect/outcome/reconstruction path NOT migrated end-to-end**

## Start here — do not restart research
1. Read `NEXO_NCS/STATUS.md`.
2. Read this handoff.
3. Read `NEXO_NCS/BUILD/NCS_M0_CONTINUITY_MIGRATION_RECOVERY_CHECKPOINT_2026-10-18.md`.
4. Read `NEXO_NCS/BUILD/NCS_M0_NEXO_CONTINUITY_OWNER_CONTRACT_2026-10-18.md`.
5. Then inspect only the exact runtime call path needed for the next implementation. Do not repeat closed audits or reopen old AB/P investigations without a concrete contradiction.

The user explicitly corrected the architecture boundary: Nexo and Lúmina were never intended to be mixed. Keep the scope precise: the prior prototype coupled Nexo's operational memory to Lúmina persistence; the latest branch has now begun correcting that. Do not tell the user the whole project is mixed, and do not claim migration complete.

## Latest verified migration state
Migration bootstrap/integration commit family is recorded in:
- Migration code/test/workflow exact head: `8b45736b92d6510ed5ccdb3d151b969210b2c66b`.
- Exact-head mission/restart CI PASS: [39099935315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39099935315).
- CI run includes orchestrator, runtime, effect adapter, restart reconstruction, simulation persistence, continuity contract, continuity store, and migration tests.
- Migration report/checkpoint: `NEXO_NCS/BUILD/NCS_M0_CONTINUITY_MIGRATION_RECOVERY_CHECKPOINT_2026-10-18.md`.
- Architecture owner contract: `NEXO_NCS/BUILD/NCS_M0_NEXO_CONTINUITY_OWNER_CONTRACT_2026-10-18.md`.

### Implemented
1. `src/nexo/core/continuity-snapshot.mjs`: standalone schema `NEXO_OPERATIONAL_CONTINUITY`, version 1, operational collections only: `missions`, `attempts`, `doNotRepeat`, `executions`, `effectJournal`. No Lúmina world state or learning analytics.
2. `src/nexo/core/continuity-store.mjs`: independent file-backed store with strict load, explicit initialize, conditional commit against a store-local revision. Does not claim power-loss/fsync durability, anti-rollback, distributed linearizability, current authority or external-effect truth.
3. `src/nexo/core/continuity-owner.mjs`: semantic owner for mission admission and PREPARED checkpoint; existing unresolved PREPARED blocks redispatch; PREPARED means durable intent, not authorization. It cannot settle prepared effects yet.
4. `src/nexo/core/continuity-operations.mjs`: snapshot-only mission/attempt/execution/outcome/reconstruction operations. Evidence source labels are labels only, not authentication.
5. `scripts/nexo-continuity.mjs::openNexoContinuityOwner()`: opens independent store; if store exists it is canonical and legacy copy is not merged; if absent, imports validated legacy memory; corrupt store fails closed; empty initialization requires explicit opt-in.
6. `scripts/assistants.mjs`: reads Nexo owner and records mission admission through the standalone snapshot/owner. Lúmina learning analytics remain in `.lumina-assistant-memory.json`.
7. `scripts/simulate.mjs`: uses `.nexo-continuity.json` as the independent Nexo store; `world-state.json` now persists Lúmina world/agents/events and no longer serializes `nexoMemory`.
8. `tests/nexo/continuity-migration.test.mjs`: preserves operational records and PREPARED obligations, excludes learning analytics, canonical-store precedence, corrupt-store fail-closed, and explicit-only empty bootstrap. CI runs dedicated store + migration tests.

### Still NOT complete
- `src/nexo/runtime.js` still imports legacy `recordNexoOutcome`, `recordNexoExecution`, `recordNexoPlan`, and `reconstructNexoMission` from `src/assistants/memory.js`; `executeNexoStep()` still works against the legacy memory object.
- Runtime PREPARED write, terminal outcome commit and restart reconstruction are not wired end-to-end through the independent owner.
- Cross-store ordering between Nexo mission admission and Lúmina world-state persistence is not atomic. A Nexo plan can persist while a Lúmina state revision conflicts; that plan must not execute without fresh admission against the actual current environment.
- The migration tests use temporary directories. **No real user/device/local dataset was migrated in this chat.**
- Store is a local file implementation; don't overclaim durability. No protected external executor or independent operation-specific verifier exists.

## Exact next task — finish the migration, not another audit/doc cycle
Implement the next bounded runtime integration, after defining its ordering contract:

### A. Trace the actual call path once
Inspect and document only these functions/files:
- `scripts/assistants.mjs`: how mission is built/admitted and what simulation revision/input it used.
- `src/nexo/runtime.js`: `executeNexoStep()`, `commitRuntimeOutcome()`, mission reconstruction/replan.
- `src/nexo/core/continuity-owner.mjs`: `recordMission()`, `recordPrepared()`, `reconcilePrepared()` and current terminal/reconstruction API gaps.
- `src/nexo/core/continuity-store.mjs`: load/commit semantics.
- `src/nexo/core/effect-adapter.js` or the actual effect adapter path: current PREPARED/dispatch/result behavior.
- `scripts/simulate.mjs`: how current Lúmina state is loaded and conditionally persisted.
Do not broaden into generic research; use existing Maestra/A05-A06, AB104.150/.151 and P112 decisions as binding constraints.

### B. Define a real order for a single operation
Minimum conceptual sequence:
1. Load/validate current Nexo continuity from `.nexo-continuity.json`; missing/corrupt must not normalize into empty memory.
2. Load the current Lúmina environment state and its actual store revision.
3. Reconstruct the exact mission/step/dependencies and perform a fresh admission check against current state; stale plan cannot authorize mutation.
4. Commit the operation's PREPARED obligation through Nexo owner before any handler/effect dispatch. A successful PREPARED commit is not authorization by itself; final admission must be distinct and explicit.
5. Dispatch only the allowed bounded local operation after the required admission boundary.
6. Record terminal outcome through Nexo owner only if evidence/verification contract is satisfied. Do not trust caller-supplied `verified: true`, arbitrary callbacks or a source label as independent proof.
7. Persist Lúmina environment mutation with its own conditional state revision.
8. On any crash/conflict/ambiguous commit result, preserve UNKNOWN; never assume two file writes are atomic.

This sequence is a contract to validate against the real call path, not permission to implement an ungrounded transaction wrapper. If ordering cannot be made safe with current primitives, stop at the exact boundary and document the blocker.

### C. Add crash-cut and end-to-end tests
At minimum:
- no Nexo store + valid legacy memory => one-time import preserving missions, attempts, do-not-repeat, executions, and prepared journal.
- existing canonical store + stale legacy copy => canonical wins, no merge.
- corrupt canonical store => fail closed, no legacy fallback.
- Lúmina state absent/initialized/reset while valid Nexo store exists => Nexo operational continuity remains independent.
- no Nexo store and missing legacy source => UNKNOWN/fail closed unless explicit bootstrap is justified by verified fresh installation.
- crash before PREPARED commit => handler not called.
- crash after PREPARED commit before dispatch => UNKNOWN and no automatic redispatch.
- handler mutates candidate but Lúmina commit conflicts => reconcile/UNKNOWN; do not claim completed based only on Nexo record.
- Lúmina commit succeeds but terminal Nexo commit/result response is lost => restart retains ambiguity; no replay or successor plan until operation-specific reconciliation.
- stale mission/state revision => fresh admission required; no stale plan execution.
- malformed/orphan PREPARED => no dispatch and no successor replan.
- runtime recovery reconstructs from independent Nexo store without calling `createLearningMemory()` or reading Nexo fields from `world-state.json`.

### D. Cut over without destroying history
- Do not delete legacy Nexo fields/functions until the new owner path is wired, tests pass, and the migration is explicit and reversible/diagnosable.
- Do not dual-write both stores as if that made them atomic.
- Do not silently merge stale legacy state into an existing canonical Nexo store.
- Do not make a fresh empty store hide a missing old history.
- Do not introduce new IDs, queues, retries, tombstones, global revisions, authority epochs, or transaction wrappers without grounding in prior design.
- Keep `Nexo ≠ Lúmina`; Lúmina may expose an explicit environment port but cannot own Nexo's operational history.

## Evidence / current safety labels
- Exact-head migration CI PASS: [39099935315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39099935315).
- This verifies automated tests on temporary paths; it is not proof of real device data migration or physical durability.
- M0: INCOMPLETE.
- Prepared external effects: UNKNOWN; no redispatch/replan around unresolved PREPARED.
- Protected effects: STOP.
- STEP 7: OPEN / STOP / UNKNOWN.
- No claim that identity/constitutional authority has been solved.

## Instructions for the next chat
User starts new project chat with exactly: `NCS`.
First action: read `NEXO_NCS/STATUS.md` and this file; confirm the current branch/head and CI evidence before editing. Continue at **runtime integration / terminal owner contract and cross-store crash cuts**. Do not restart M0 from M0.1, do not redo closed AB/P audits, do not treat this handoff as proof of migration completion, and do not stop at documentation only. The goal is to finish Nexo's independent operational-continuity migration and integrate it into M0's real observe → decide → plan → permitted execute → verify → persist → restart/recover/replan loop.
