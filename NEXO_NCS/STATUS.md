## M0 — entrypoint repair-only (2026-10-18)

- Implementado `scripts/nexo-repair-entrypoint.mjs` con `runNexoRepairOnce()`; la entrada está limitada a reparaciones convergentes.
- Comprueba identidad de PREPARED, observa el entorno persistido antes de recuperar una obligación existente y bloquea si la revisión cambió o el contexto no coincide.
- El settlement solo registra `settled_observed`; no completa la misión ni afirma causalidad.
- CI actualizado tras ampliar el test de recuperación antes del dispatch: [run 39142131775](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142131775), SHA `7d54f50b1e2db04d32e1254764e84de57d811de0`, SUCCESS; los tres pasos de regresión finalizaron `success`. También sigue confirmado el run previo [39142034311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142034311).
- Límite: todavía no existe llamada desde `src/nexo/runtime.js` ni desde el arranque general. El runtime heredado sigue usando `src/assistants/memory.js`. No hay atomicidad cross-store demostrada; efectos protegidos siguen fuera de alcance y las misiones no se marcan completadas.

---

## M0 — crash cut: entorno persistido antes del settlement (2026-10-18)

- Test de reinicio añadido en `tests/nexo/repair-owner-lifecycle.test.mjs`, commit [55f9a064dd28ed5b51eb552f903f3bec504f9640](https://github.com/snowdenxrp/aldea-ia/commit/55f9a064dd28ed5b51eb552f903f3bec504f9640).
- Secuencia probada: PREPARED enlazado a entorno revisión 30 → dispatch persiste revisión 31 → se descarta el owner inicial → se reabre continuidad desde disco → settlement observa la invariante persistida y marca `settled_observed` → replay bloqueado, entorno sigue en revisión 31.
- CI exacto: [run 39141847081](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141847081), sobre el SHA de prueba `55f9a064dd28ed5b51eb552f903f3bec504f9640`, completó **SUCCESS**. Job `repair-crash-cuts` y sus tres pasos de regresión finalizaron `success`.
- Alcance: demuestra recuperación mediante helpers y owner/store existentes en una simulación de reinicio dentro del mismo proceso de test; no demuestra todavía arranque real de la aplicación productiva ni atomicidad entre archivos.
- Siguiente frontera: definir y probar una entrada repair-only coherente que use continuidad propietaria de Nexo sin convertir Lúmina en dueña de memoria/identidad, y decidir el corte de runtime solo después de documentar sus contratos y fallos.

---

## M0 — replay y revisión obsoleta: regresiones añadidas, CI pendiente (2026-10-18)

- Test actualizado: `tests/nexo/repair-owner-lifecycle.test.mjs`, commit [53cf292ae966c80eb722a7f48eec0c6c2c86595d](https://github.com/snowdenxrp/aldea-ia/commit/53cf292ae966c80eb722a7f48eec0c6c2c86595d).
- Caso A — replay después de `settled_observed`: el dispatch debe bloquearse con `NEXO_PREPARED_JOURNAL_ENTRY_UNKNOWN`, sin cambiar la revisión del entorno ni la revisión del store Nexo.
- Caso B — estado de entorno cambia de revisión 20 a 21 después de PREPARED: dispatch debe bloquearse con `NEXO_PREPARED_ENVIRONMENT_REVISION_STALE`, conservar el estado de entorno en revisión 21 y dejar el journal en PREPARED para reconciliación.
- CI exacto: [run 39141470114](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141470114), sobre el SHA de prueba `53cf292ae966c80eb722a7f48eec0c6c2c86595d`, completó **SUCCESS**. Job `repair-crash-cuts` y los tres pasos de regresión (crash cuts, migración de continuidad y lifecycle integrado) finalizaron `success`.
- Alcance: regresiones de los helpers repair-only; no es una integración de `src/nexo/runtime.js`, no prueba atomicidad cross-store y no autoriza efectos protegidos.

---

## M0 — repair lifecycle CI trigger coverage (2026-10-18)

- Corrected `.github/workflows/nexo-m0-repair-crash-cuts.yml` path filters to include preparation, dispatch, settlement, mission verification, continuity migration, and the lifecycle test itself. Before this correction, edits to preparation/dispatch/lifecycle test did not reliably trigger this focused workflow.
- Workflow correction commit: `f54dcc9452d3010fe9fb4463786d263b9d8eaac4`.
- Exact-head CI [39141182732](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141182732) completed **SUCCESS** on `f54dcc9452d3010fe9fb4463786d263b9d8eaac4`. The `repair-crash-cuts` job and all three regression steps completed successfully.
- Scope is precise: this validates the tests currently included in the workflow. Explicit replay-after-settlement and stale-environment-revision dispatch regressions remain a next test task; do not infer those cases from this PASS. Production `runtime.js` owner cutover remains pending; M0 incomplete.

---

## M0 — owner-backed repair lifecycle integration regression (2026-10-18)

- Added `tests/nexo/repair-owner-lifecycle.test.mjs` to exercise the actual existing owner/store + repair helpers in one flow: strict persisted baseline revision 10 → durable PREPARED → conditional repair persistence at revision 11 → separate `settled_observed` commit → read-only `goal_observed`.
- Assertions require that PREPARED is durable before dispatch, the Nexo store revision advances only at the expected commits (0→1→2), the verifier does not mutate continuity, the result does not claim mission completion or causal attribution, and `world-state.json` excludes `nexoMemory`.
- CI workflow updated to run the new regression after existing repair crash-cut and continuity migration tests.
- Evidence: test commit `eddf41c542b252329e45304245728a7bdb5d6800`; workflow commit `d3bce60a5d53df8ffa5caf1fb987fccfe0116620`; focused CI [39140959531](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140959531) completed **SUCCESS** on exact workflow HEAD `d3bce60a5d53df8ffa5caf1fb987fccfe0116620`. Job `repair-crash-cuts` and all three test steps (repair crash cuts, continuity migration, owner-backed lifecycle integration) succeeded. This PASS applies to that code/workflow SHA, not later documentation-only HEADs.
- This test is an integration regression for the existing repair-only helpers, not the production `runtime.js` owner cutover. No non-repair/protected effects are authorized. M0 remains incomplete; ambiguous PREPARED stays UNKNOWN; Nexo/Lúmina stores remain separate.

---

## M0 — Runtime integration seam revalidated (2026-10-18)

- Reused existing P112/AB104 findings and checked the current source seam without reopening the historical audit.
- `scripts/assistants.mjs` persists mission plans through the independent Nexo owner, but does not execute missions. `scripts/simulate.mjs` opens continuity for migration/reporting but does not execute missions. `src/nexo/runtime.js` still has a legacy-memory outcome path.
- Therefore this is **not** a simple import replacement: the missing component is a real owner-backed execution lifecycle. It must carry the owner store revision, persist mission and PREPARED before eligible dispatch, keep execution lineage/outcome separate from journal settlement, and recover ambiguous cross-store results without redispatch.
- Confirmed the separation regression already asserts that `world-state.json` excludes `nexoMemory` and that `applyState()` does not attach Nexo continuity to the Lúmina simulation. Preserve this boundary.
- Decision/checkpoint updated: [NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md](BUILD/NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md).
- **No runtime code cutover made** because no production execution owner exists yet and `recordOutcome()` cannot authenticate external evidence or settle `prepared`/`settled_observed`.
- Next: test-first, owner-backed session contract for the narrow repair-only path. Keep non-idempotent/protected dispatch blocked. M0 incomplete; unresolved effects UNKNOWN; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — Owner-backed durable outcome recording (2026-10-18)

- Added `recordOutcome({ expectedRevision, outcome })` to `src/nexo/core/continuity-owner.mjs`, so the Nexo-owned store can durably record a mission-step outcome through `commitIfCurrent()`.
- The method checks stored mission/step/action/target identity, rejects invalid completion evidence, preserves the first attempt, and returns `authorization: "NOT_EVALUATED"`; it never settles `effectJournal`.
- Completion is blocked while the same step has an unresolved `prepared` or `settled_observed` journal entry. A blocked outcome may be persisted, but reconstruction still lets the unresolved effect dominate.
- Added regressions to `tests/nexo/continuity-migration.test.mjs` for evidence requirements, durable reconstruction, replay immutability, and unresolved-effect guards.
- Exact source + test head: [c7a8852b791dec8a2bee64cda6126aa1658af198](https://github.com/snowdenxrp/aldea-ia/commit/c7a8852b791dec8a2bee64cda6126aa1658af198).
- Focused workflow now runs continuity migration plus repair crash cuts: [run 39140292963](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140292963) — SUCCESS, both test steps completed. Mission/restart [39140282526](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282526), STEP 4 [39140282510](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282510), and STEP 5 [39140282488](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282488) also passed for the source/test head.
- Full checkpoint: [NCS_M0_OWNER_DURABLE_OUTCOME_RECORDING_2026-10-18.md](BUILD/NCS_M0_OWNER_DURABLE_OUTCOME_RECORDING_2026-10-18.md).
- **Limits:** runtime still uses legacy memory; no runtime cutover, independent evidence verification, cross-store atomicity, authority, or protected-effect authorization is claimed. M0 remains incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

Next: test-first runtime integration. Reuse existing P112/PG-009 findings. Do not dispatch effects through this new API until PREPARED-before-dispatch, unresolved-effect recovery, and persistence/restart behavior are covered end-to-end.

---

## M0 — Current-state goal regression guard (2026-10-18)

- Regression test commit: [5f7d268bc92920aad25599f6d2689267e18fd98a](https://github.com/snowdenxrp/aldea-ia/commit/5f7d268bc92920aad25599f6d2689267e18fd98a).
- Added a separate persisted environment fixture where the repair invariant regresses after a prior `settled_observed` journal record. The mission verifier must return `blocked` / `NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT`, not `goal_observed` or mission completion.
- Exact-head CI for this test commit is NOT YET VERIFIED. The available GitHub status/workflow connector has not returned check records; no PASS claim.
- This proves re-observation detects a regressed invariant when it reads that state. It does NOT close the race between reading Lúmina's file and a later Nexo continuity write; no durable goal-observation write has been introduced.

Next: verify CI on the exact test commit; then define whether durable observation needs an environment-revision fence spanning both stores. Do not invent cross-file atomicity. M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — Mission verifier exact-coverage hardening (2026-10-18)

- Code commit: [25598ba80e377cdf39498991f29abc665a4ded69](https://github.com/snowdenxrp/aldea-ia/commit/25598ba80e377cdf39498991f29abc665a4ded69).
- Code + regression-test head: [b74cc37edfad915fc8cc5deaf9269c6f15b28872](https://github.com/snowdenxrp/aldea-ia/commit/b74cc37edfad915fc8cc5deaf9269c6f15b28872).
- Fixed two false-positive paths in `verifyRepairMissionGoalFromPersistedState()`: duplicate mission step IDs could let one journal entry satisfy multiple steps; extra journal entries outside the declared step set were ignored.
- Verifier now rejects duplicate IDs as `NEXO_REPAIR_MISSION_STEP_OR_DEPENDENCY_UNSUPPORTED` and non-exact journal coverage as `NEXO_REPAIR_MISSION_JOURNAL_COVERAGE_MISMATCH`. Regressions added to `tests/nexo/simulation-restart-persistence.test.mjs`.
- Exact-head CI: NOT YET VERIFIED. Available status/workflow lookup returned no records; this is not a PASS.
- No runtime wiring, mission completion, causal attribution, protected-effect authorization, or cross-store atomicity claim.

Next: verify Actions for exact head; then test the race between environment observation and durable continuity recording. Continuity CAS alone cannot atomically fence the separate Lúmina state file.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — Read-only mission goal verification contract hardened (2026-10-18)

- Added `scripts/nexo-repair-mission-verification.mjs`: verifies that every step in a repair-only mission has one `settled_observed` journal entry and that every desired invariant is present in one current strict-loaded environment snapshot. It returns `goal_observed`, `missionCompleted: false`, and `causalAttribution: "not_claimed"`.
- Added dependency-cycle rejection and regression. Runtime replan remains blocked until a separate goal-verification/persistence contract is established.
- Exact tested head: [`1ae28c8570e76191663ed045e6d68644df17a52c`](https://github.com/snowdenxrp/aldea-ia/commit/1ae28c8570e76191663ed045e6d68644df17a52c).
- Exact-head CI PASS: mission/restart [39133517131](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517131), outcome [39133517097](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517097), semantic [39133517074](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517074).
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).
- Remaining: persist a separately scoped goal-observed record using continuity CAS, define which mission step statuses may become executable, and verify mission semantics before any runtime cutover. No claim of mission completion, causal attribution, authority, or cross-store atomicity.

---

## M0 — Runtime replan now respects observed-settlement uncertainty (2026-10-18)

- `replanPersistedNexoMission()` refuses successor creation if the previous mission has a `settled_observed` repair entry, returning `NEXO_REPAIR_GOAL_VERIFICATION_REQUIRED`. Unresolved `prepared` still returns the existing reconciliation veto.
- Test confirms no successor mission is appended and journal state remains unchanged.
- Exact tested head: [`9610580f838ea2f55a482f64a28f18d84cac202e`](https://github.com/snowdenxrp/aldea-ia/commit/9610580f838ea2f55a482f64a28f18d84cac202e).
- Exact-head CI PASS: mission/restart [39133373970](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373970), outcome [39133373980](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373980), semantic [39133373987](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373987).
- Remaining gate: define a distinct mission-level goal verifier; observed repair state is not mission completion. No runtime cutover or non-idempotent action settlement until that contract is proven.

---

## M0 — Settlement negative cases + safe reconstruction guard verified (2026-10-18)

- Added negative tests: desired invariant absent/unknown does not settle; an environment revision beyond the allowed prepared-revision window does not settle; ambiguous continuity commit result stays UNKNOWN and PREPARED remains durable.
- Fixed mission reconstruction: `settled_observed` no longer lets its step reappear as planned/executable. The mission remains blocked at `verify_observed_repair_goal` until a separate goal verifier resolves it; no causal completion claim.
- Latest exact tested head: [`4cadf1831ecbd3664964c410ac8bc1397fd22a2e`](https://github.com/snowdenxrp/aldea-ia/commit/4cadf1831ecbd3664964c410ac8bc1397fd22a2e).
- Exact-head CI PASS: mission/restart [39133277523](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277523), outcome [39133277522](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277522), semantic [39133277520](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277520).
- Detailed checkpoint: [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).
- Next: validate runtime compatibility of `settled_observed` and mission verification semantics; do not wire runtime until explicit mission-level verifier exists. No non-idempotent actions, no cross-store atomicity claim, no authority implication.

---

## M0 — Repair settlement now records persisted invariant observation (2026-10-18)

- Added `scripts/nexo-repair-settlement.mjs`: re-loads the durable Nexo journal and strict environment snapshot, requires one matching PREPARED repair, validates the action-specific invariant, constrains environment revision to the prepared revision or immediate successor, and commits `settled_observed` through continuity-store compare-and-commit.
- Settlement evidence explicitly records `causalAttribution: "not_claimed"`: observed desired state is not proof this operation caused it. No atomicity is claimed across Lúmina and Nexo files.
- Exact code/test head: [`72bb686a4d6b84d6cd058751005dbe34cda1d273`](https://github.com/snowdenxrp/aldea-ia/commit/72bb686a4d6b84d6cd058751005dbe34cda1d273).
- Exact-head CI PASS: mission/restart [39133009763](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009763), semantic [39133009760](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009760), outcome [39133009772](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009772).
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).
- Next: add negative tests for absent/unknown invariant and unrelated environment revision; test continuity commit failure/ambiguous result; review reconstruction semantics before runtime wiring. No non-idempotent settlement or runtime cutover.

---

## M0 — Repair preparation + conditional dispatch fence implemented; exact-head CI PASS (2026-10-18)

- `scripts/nexo-repair-preparation.mjs` loads the environment through `loadStateStrict()` and derives the revision recorded in PREPARED; callers do not supply the integer to this helper.
- `scripts/nexo-repair-dispatch.mjs` derives the operation from exactly one durable PREPARED journal entry, refuses missing entries and stale environment revisions, runs only the three convergent repairs, and persists changed state through `persistState(expectedRevision, stateRevision)` with strict reload comparison.
- The helper intentionally leaves Nexo PREPARED unresolved after environment persistence. It is not terminal settlement and does not claim cross-file atomicity.
- Exact code/test head: [`64f8329aef2ba050e9600227e2661f56fb75e21d`](https://github.com/snowdenxrp/aldea-ia/commit/64f8329aef2ba050e9600227e2661f56fb75e21d).
- Exact-head CI PASS: mission/restart [39132820121](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820121), semantic [39132820068](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820068), outcome [39132820026](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820026).
- Checkpoint: [NCS_M0_REPAIR_PREPARE_DISPATCH_REVISION_FENCE_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_PREPARE_DISPATCH_REVISION_FENCE_CHECKPOINT_2026-10-18.md).
- Next: test write-failure/commit-ambiguity crash cuts and define repair-only terminal settlement from repository-derived evidence with continuity compare-and-commit. Do not generalize to non-idempotent effects or migrate runtime before this gate.

---

## M0 — New repair PREPARED intents bind the persisted environment revision (2026-10-18)

- `recordPrepared()` now requires `environmentStateRevision` for the three convergent repair actions and stores it on the PREPARED entry.
- Existing PREPARED repair entries cannot be rebound to a different revision. Legacy entries without a revision remain unresolved and report UNKNOWN; omission on a new repair intent is blocked.
- Code/test head: [`d0e38809992be291262153b527ec21a4793ac3d6`](https://github.com/snowdenxrp/aldea-ia/commit/d0e38809992be291262153b527ec21a4793ac3d6).
- Checkpoint: [NCS_M0_PREPARED_REPAIR_REVISION_BINDING_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_PREPARED_REPAIR_REVISION_BINDING_CHECKPOINT_2026-10-18.md).
- **Not yet an end-to-end dispatch fence:** the owner still receives the revision from its caller; it does not itself load the strict environment snapshot, and adapter mutation is not yet conditional on the durable revision. No settlement API/runtime cutover.
- Next: derive the revision from a strict persisted snapshot inside a Nexo-owned preparation path; guard dispatch against the same durable revision using existing conditional persistence; keep PREPARED on stale/conflict; add crash-cut tests.

---

## M0 — Ambiguous repair target now fails closed; exact-head CI PASS (2026-10-18)

- Read-only repair observation now requires exactly one matching agent for `repair_agent_state` and `repair_agent_needs`; duplicate IDs return UNKNOWN instead of selecting the first match. Resource lookup requires an own property so inherited object members cannot masquerade as persisted resources.
- Code/test commit: [`f6ad72da4f0caff056a21dbdf8835391844c6b0c`](https://github.com/snowdenxrp/aldea-ia/commit/f6ad72da4f0caff056a21dbdf8835391844c6b0c).
- Exact-head CI PASS: semantic [39132380744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380744), outcome [39132380742](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380742), mission/restart [39132380735](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380735).
- Checkpoint: [NCS_M0_AMBIGUOUS_REPAIR_TARGET_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_AMBIGUOUS_REPAIR_TARGET_CHECKPOINT_2026-10-18.md).
- Still not settlement: PREPARED lacks persisted environment revision binding; revision observation is not atomic against later writers. No runtime cutover.
- Next: design explicit environment revision binding and dispatch/recovery fencing before any terminal settlement API.

---

## M0 — Missing/stale environment revision binding now explicitly classified (2026-10-18)

- Added `comparePersistedRepairRevision()` to the read-only repair observer. Matching revision → `current`; differing valid revisions → `stale`; missing PREPARED binding or invalid current revision → `unknown`.
- Crucially, it does not substitute the current environment revision when PREPARED has no recorded revision. Existing PREPARED schema currently has no authoritative environment revision field.
- Code/test commit: [`db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f`](https://github.com/snowdenxrp/aldea-ia/commit/db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f).
- Exact-head CI PASS: mission/continuity [39132287649](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287649), outcome [39132287652](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287652), semantic [39132287648](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287648). Mission workflow explicitly passed `simulation-restart-persistence.test.mjs`.
- Checkpoint: [NCS_M0_REVISION_FENCE_OBSERVATION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REVISION_FENCE_OBSERVATION_CHECKPOINT_2026-10-18.md).
- Hard boundary: this is stale-state detection, not atomic fencing. PREPARED lacks environment revision binding and two-store settlement is still unresolved. Do not wire runtime or settle from this observer alone.
- Next: define PREPARED revision binding + adapter dispatch fence + recovery recheck + continuity compare-and-commit settlement, with crash cuts at each boundary. Non-idempotent actions remain UNKNOWN.

---

## M0 — Read-only persisted repair observer added; exact-head CI PASS (2026-10-18)

- Added `src/nexo/adapters/persisted-repair-observation.mjs`: action-specific, read-only classification for `repair_agent_state`, `repair_agent_needs`, and `repair_resource_state`.
- Outcomes are `desired_state_present`, `desired_state_absent`, or `unknown`; unknown snapshot revision, target/schema ambiguity, and unknown `alive` fail closed. The observer does not mutate the snapshot, settle PREPARED, or authorize retry.
- Code/test commit: [`8a89ef9b83b3126db3e83122a7876abe2a78819f`](https://github.com/snowdenxrp/aldea-ia/commit/8a89ef9b83b3126db3e83122a7876abe2a78819f).
- Exact-head CI PASS: mission/continuity [39107811320](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811320), semantic [39107811311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811311), outcome [39107811306](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811306). Mission log confirms read-only observation + crash-cut regressions passed.
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_CONTRACT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_CONTRACT_CHECKPOINT_2026-10-18.md).
- Boundary: observer assumes `loadStateStrict()` supplied the snapshot; it does not authenticate the file or make observation atomic with writes. PREPARED still lacks binding to an authoritative environment revision. No settlement API/runtime cutover.
- Next: settle the repair-only contract and address the environment revision/concurrent-write race before any owner settlement. Non-idempotent actions remain UNKNOWN.

---

## M0 — Durable repair crash-cut test added; exact-head CI PASS (2026-10-18)

- Added a restart regression that persists `repair_agent_state` to the authoritative Lúmina snapshot after Nexo has committed PREPARED, then reopens both stores.
- The repaired coordinate and explicit `alive:true` survive strict snapshot reload, while Nexo's separate journal correctly remains `prepared`; `reconcilePrepared()` remains blocked with `NEXO_EFFECT_RECONCILIATION_REQUIRED`, `verified:false`.
- Code/test commit: [`db3399aa28e6671bf5329ea5ca60544c8ac581ee`](https://github.com/snowdenxrp/aldea-ia/commit/db3399aa28e6671bf5329ea5ca60544c8ac581ee).
- Exact-head CI PASS: mission/continuity [39107632187](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632187), outcome classification [39107632188](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632188), semantic validation [39107632199](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632199). Mission workflow log confirms `simulation-restart-persistence.test.mjs` ran and passed.
- Checkpoint: [NCS_M0_DURABLE_REPAIR_CRASH_CUT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_DURABLE_REPAIR_CRASH_CUT_CHECKPOINT_2026-10-18.md).
- Meaning: this closes a crash-cut test gap only. Durable environment state does not silently settle Nexo PREPARED. No settlement API or runtime cutover was added.
- Next: define and test the repair-only recovery contract from persisted snapshot semantics (desired invariant present/absent, malformed target, unknown alive, stale environment revision, continuity revision conflict). Keep non-idempotent actions UNKNOWN and do not redispatch them.

---

## M0 — Unknown life-state remains UNKNOWN (2026-10-18)

- Further tightened `repair_agent_state`: if `alive` is absent or not boolean, the handler returns `AGENT_ALIVE_STATE_UNKNOWN` before touching coordinates. It no longer infers `alive:true` from missing data.
- Regression test verifies the operation returns `blocked / EFFECT_OUTCOME_UNKNOWN`, leaves the unknown life-state unchanged, and makes no coordinate mutation.
- Final code/test head: [508a76a13384e282b812fcc91cbf4fb17222341f](https://github.com/snowdenxrp/aldea-ia/commit/508a76a13384e282b812fcc91cbf4fb17222341f).
- Exact-head CI PASS: [semantic validation 39106685371](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106685371) and [outcome classification 39106685361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106685361). Mission/restart workflow on this exact head not confirmed.
- Updated checkpoint: [NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md).
- Remaining boundary unchanged: in-memory revision is not durable world-state revision; no independent operation receipt, settlement API, or runtime cutover. M0 incomplete; PREPARED UNKNOWN; protected effects STOP.

## M0 — Dead-agent-safe convergent repair verified (2026-10-18)

- Refined `repair_agent_state`: postcondition now requires finite coordinates and a boolean `alive` value, not that the agent be alive. The action normalizes invalid coordinates without resurrecting a dead agent.
- Added a regression test asserting a dead agent remains dead after repair while coordinates become finite. Previous tests still cover idempotent needs normalization and a missing resource amount.
- Final code/test head: [0846597665e72de65917101c9206c3d26c11bf1b](https://github.com/snowdenxrp/aldea-ia/commit/0846597665e72de65917101c9206c3d26c11bf1b).
- Exact-head CI PASS: [semantic validation 39106552699](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106552699) and [outcome classification 39106552701](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106552701). Mission/restart workflow for this exact head has not been confirmed.
- Checkpoint: [NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md).
- Still not solved: in-memory revision is not durable environment revision; postcondition does not attribute the state to a particular prepared operation; no terminal settlement API or runtime cutover. M0 incomplete; PREPARED UNKNOWN; protected effects STOP.

## M0 — Convergent repair revision correction (2026-10-18)

- `src/nexo/simulation-adapter.js`: `repair_agent_state`, `repair_agent_needs`, and `repair_resource_state` now increment the in-memory effect revision only when their normalized fields actually change. A missing resource amount normalizes to zero. The agent repair preserves an explicit dead state rather than resurrecting it.
- Regression tests: a second normalization under a distinct operation key completes without fabricating a new revision; a resource with missing amount is normalized and passes its postcondition.
- Code commit: [8926800](https://github.com/snowdenxrp/aldea-ia/commit/892680032b5512de11532b6ea609e5e9cbc9f75f); test head: [575d017](https://github.com/snowdenxrp/aldea-ia/commit/575d01789250bb26800d66146da18321ffad32ab).
- Exact-head CI: semantic validation [39106460906](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460906) PASS; outcome classification [39106460938](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460938) PASS. A mission/restart workflow on this exact head has not been confirmed; do not carry forward the previous head's result as if it covered this commit.
- Checkpoint: [NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md).
- Limit: revision remains in-memory, not the durable Lúmina snapshot revision; a convergent postcondition is not an operation receipt. The repair-state postcondition still rejects dead agents, so that edge must be resolved before treating it as universally settleable. No owner settlement or runtime cutover was made.

# NCS — STATUS / ÚNICA ENTRADA

Fecha: 2026-10-18  
Repositorio: `snowdenxrp/aldea-ia`  
Rama: `ncs-clean-architecture`

## Estado global

**M0: INCOMPLETO.** La migración de continuidad de Nexo está parcialmente implementada. La ruta de ejecución/resultados de `src/nexo/runtime.js` todavía usa funciones de memoria heredadas; no conectar el despacho al propietario de continuidad independiente hasta que exista un contrato de reconciliación y liquidación de efectos respaldado por evidencia independiente.

- **Efectos PREPARED no resueltos:** UNKNOWN; no redispatch ni replan alrededor de ellos.
- **Efectos protegidos:** STOP.
- **STEP 7:** OPEN / STOP / UNKNOWN.
- **Nexo y Lúmina:** mantener separados. No declarar terminada la migración.
- **Dispositivo real:** no se ha realizado ni verificado una migración local del usuario.

## Punto técnico más reciente

1. El adaptador genérico ahora conserva como PREPARED cualquier fallo del manejador sin prueba independiente de ausencia de efecto. Resultado: `EFFECT_OUTCOME_UNKNOWN` si la revisión observada no cambia, `PARTIAL_EFFECT_DETECTED` si cambia.
2. CI exacto PASS en código/pruebas `431978730f3b2be300fa51d3a35938ef6702e607`:
   - [Mission/restart continuity — 39105986623](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986623)
   - [Semantic validation — 39105986616](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986616)
   - [Outcome classification — 39105986625](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986625)
3. La inspección de persistencia encontró que el adaptador modifica una simulación en memoria, mientras `world-state.json` y `.nexo-continuity.json` tienen revisiones y commits separados. No existe hoy un protocolo durable conectado de ejecución de efecto + liquidación Nexo.

## Leer y continuar en este orden

1. [Handoff principal de migración M0](BUILD/NCS_M0_NEXT_CHAT_HANDOFF_2026-10-18_MIGRATION.md)
2. [Crash cuts de reconciliación del entorno](BUILD/NCS_M0_ENVIRONMENT_RECONCILIATION_CRASH_CUTS_2026-10-18.md)
3. [Matriz de reconciliación por acción](BUILD/NCS_M0_ACTION_RECONCILIATION_CLASSIFICATION_2026-10-18.md)
4. [Checkpoint de fallos ambiguos fail-closed](BUILD/NCS_M0_AMBIGUOUS_HANDLER_FAILURE_FAIL_CLOSED_CHECKPOINT_2026-10-18.md)
5. [Contrato del propietario de continuidad Nexo](BUILD/NCS_M0_NEXO_CONTINUITY_OWNER_CONTRACT_2026-10-18.md)
6. Historial de STATUS preservado en [STATUS_HISTORY_2026-10-18.md](STATUS_HISTORY_2026-10-18.md).

## Próxima tarea obligatoria

Terminar la clasificación de reconciliación para las acciones candidatas idempotentes de reparación y probar los cortes de reinicio contra el estado persistido real. Las acciones no idempotentes deben permanecer UNKNOWN cuando falte evidencia durable específica de la operación. Después, definir el contrato mínimo de liquidación en el propietario Nexo. No integrar aún el runtime con el propietario; no inventar IDs, colas, tombstones, revisión global, reintentos, ni wrappers transaccionales.

## Principio de evidencia

Trigger → ejecución → job → head/pin → artefacto/log bruto → interpretación. Un eslabón faltante significa PENDING/UNKNOWN, nunca PASS supuesto. La documentación y CI no prueban ejecución en el dispositivo real.


## Latest M0 boundary — cross-store revision-fence analysis (2026-10-18)

- Analysis checkpoint: [NCS_M0_CROSS_STORE_REVISION_FENCE_ANALYSIS_2026-10-18.md](BUILD/NCS_M0_CROSS_STORE_REVISION_FENCE_ANALYSIS_2026-10-18.md), commit [6e3a51be77b45407707917ccc0ecf0cc94e50994](https://github.com/snowdenxrp/aldea-ia/commit/6e3a51be77b45407707917ccc0ecf0cc94e50994).
- Concrete boundary: `scripts/simulate.mjs` and `src/nexo/core/continuity-store.mjs` lock and CAS their own independent files. Nexo continuity CAS does not fence Lúmina's `world-state.json`; a read of environment revision R can race with another writer committing R+1 before Nexo records its observation.
- Therefore the mission verifier remains read-only/ephemeral. No durable goal-observed transition, mission completion, replan, protected runtime wiring, or cross-store atomicity claim is allowed yet.
- Exact-head CI for test commit [5f7d268bc92920aad25599f6d2689267e18fd98a](https://github.com/snowdenxrp/aldea-ia/commit/5f7d268bc92920aad25599f6d2689267e18fd98a) remains NOT VERIFIED: status lookup returned no statuses and workflow lookup returned no runs. Missing evidence is neither PASS nor FAIL.
- Next: trace all writers/callers of persisted environment state and choose a domain-specific fence only if all relevant writers can honor it. If not, keep terminal durable goal status unavailable and re-check on use. Do not invent a generic transaction wrapper or test-only hook.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — Goal-observation consumer decision (2026-10-18)

- Decision checkpoint: [NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md](BUILD/NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md), commit [5a3922413ff8702aafe12b05bc69b09f8b0fc864](https://github.com/snowdenxrp/aldea-ia/commit/5a3922413ff8702aafe12b05bc69b09f8b0fc864).
- The read-only mission-goal verifier has no demonstrated production consumer requiring a durable terminal `goal_observed` record; `src/nexo/runtime.js` does not call it. Therefore do not build a cross-store fence for that diagnostic now. Keep it ephemeral/read-only and re-check current state on use.
- This does NOT resolve M0 runtime migration. `src/nexo/runtime.js` still imports mission/outcome/execution/reconstruction operations from `src/assistants/memory.js`. The independent owner does not yet provide a fully verified terminal effect-settlement contract.
- Next: define and test the narrow owner-backed runtime API; keep result lineage separate from PREPARED settlement, reject caller-supplied verification as independent proof, and retain UNKNOWN/PREPARED across cross-file ambiguity. Preserve the legacy path until crash-cut and rollback tests pass.
- No broad writer-audit repeat, generic transaction wrapper, runtime cutover, protected-effect authorization, or device migration claim.

M0 incomplete; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — Execution-lineage owner seam (2026-10-18)

- Checkpoint: [NCS_M0_EXECUTION_LINEAGE_OWNER_SEAM_2026-10-18.md](BUILD/NCS_M0_EXECUTION_LINEAGE_OWNER_SEAM_2026-10-18.md), commit [5acefe5](https://github.com/snowdenxrp/aldea-ia/commit/5acefe5ed04b93c3a6d12a56f8aa14c759dc7301).
- Added `recordExecutionLineage()` to the Nexo continuity owner. It records adapter-result lineage in Nexo's own store with expected-revision CAS, checks persisted mission/step/action/target identity, and preserves the first record on duplicate identity.
- Crucial boundary: this method does not mutate `effectJournal`; even a result claiming `completed` and `verified: true` is only lineage. PREPARED remains unresolved and reconstructed mission remains blocked.
- Regression test authored in `tests/nexo/continuity-migration.test.mjs`: PREPARED preservation, blocked reconstruction, duplicate idempotency, stale revision conflict. Owner code `f5e9e20`; test commit `014b589`.
- Exact-head CI is NOT VERIFIED: combined-status/workflow lookups returned no records for the code/test commits; no local test run was performed in this session.
- This is not runtime cutover. Next: determine an operation-specific durable reconciliation path for one convergent repair and test restart/crash cuts before introducing any settlement API.

M0 incomplete; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — Execution-lineage admission guard (2026-10-18)

- Follow-up review found that a new execution lineage could be recorded for a valid mission step without a matching PREPARED journal obligation. Hardened `recordExecutionLineage()` to require exactly one PREPARED entry with matching key, mission, step, action and target.
- Owner hardening commit: [71b2db0b83e190f9f6d13c765a4e1bc85857903d](https://github.com/snowdenxrp/aldea-ia/commit/71b2db0b83e190f9f6d13c765a4e1bc85857903d); regression test commit: [9971058e2477aa458e6afebdb240f4a52b3b2401](https://github.com/snowdenxrp/aldea-ia/commit/9971058e2477aa458e6afebdb240f4a52b3b2401).
- Test checks that a mission without PREPARED cannot gain execution lineage (`NEXO_EXECUTION_PREPARED_OBLIGATION_REQUIRED`). Exact-head CI NOT VERIFIED; tests were not run locally.
- Still no runtime cutover, effect settlement, independent evidence authentication, or cross-store atomicity claim.

M0 incomplete; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.
- Added regression commit `98caddd0edd81908c2f07b199391e9fe85dbeeae`: a persisted `settled_observed` repair reconstructs as blocked with objective `verify_observed_repair_goal` and explicit `verify_mission_goal_without_redispatch`; observation is not converted into completed execution.
- Exact-head CI remains NOT VERIFIED and no local test execution is claimed.

## M0 — reparación persistida: pruebas de cortes de reinicio (2026-10-18)
- Añadida `tests/nexo/repair-settlement-crash-cuts.test.mjs` para tres límites: (1) Lúmina persiste la reparación y Nexo sigue en PREPARED; la reconciliación solo puede escribir `settled_observed` con `causalAttribution: not_claimed` y la misión reconstruida permanece bloqueada; (2) revisión de entorno más allá de la revisión preparada + 1: no liquidar y conservar PREPARED; (3) revisión adyacente pero invariante ausente: no liquidar y conservar PREPARED.
- `package.json` incorpora la regresión al comando `npm test`.
- Commits: prueba `59f3501f1d96358ad8f59649e06e00af00e219c3`; inclusión en suite `8c08f82792915c444ec9c0acc9decd0acd6b19e5`.
- Estado de evidencia: el código de prueba está en la rama; no se ha ejecutado localmente y no hay un resultado de CI exacto verificado para estos commits. No marcar PASS hasta disponer de ejecución/job/log del head exacto.

M0 sigue incompleto; no hay integración runtime ni liquidación causal; los efectos protegidos siguen STOP; STEP 7 continúa OPEN / STOP / UNKNOWN.


## M0 — Repair lineage environment-revision binding (2026-10-18)

- Review found that `recordExecutionLineage()` checked PREPARED identity but did not compare a repair's supplied environment revision to the revision captured in the PREPARED entry.
- Owner change: `291d482a2f1e03294c519bb8971fcce0b1c69176`. For the three repair actions, new lineage now blocks if either revision is absent/invalid (`NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`) or they differ (`NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH`). The guard does not settle `effectJournal`.
- Regression commit: `4667d3b3cbe4a587c6e53118961437b2db733958`; test asserts mismatched revision leaves Nexo `storeRevision` and execution lineage unchanged before a matching revision is accepted.
- Exact-head CI and local execution are NOT VERIFIED. Do not call this a PASS until the exact code/test head has a recorded job result/log.

M0 incomplete; runtime still uses legacy memory paths; Nexo/Lúmina remain separate stores; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — CI-discovered crash-cut test fixture correction (2026-10-18)

- The mission/restart workflow exposed a test failure in `tests/nexo/simulation-restart-persistence.test.mjs` before it reached the continuity migration regression: `applyState()` does not carry persisted `stateRevision` into the in-memory simulation, so the test incorrectly computed `stateRevision` from the simulation and passed an invalid value to `persistState()`.
- Corrected the test to retain the strictly loaded persisted source snapshot and compute the next revision from `changedGoalSource.stateRevision`. Commit `ea1a8390c2826021feab46f3197c84a1a4f47039`.
- Earlier workflow runs for owner/test heads failed at this unrelated test line; STEP 4/STEP 5 and repair crash-cut workflows succeeded. The corrected head's workflows are pending at the time of this note; do not mark the overall suite PASS until the rerun completes.


### CI result correction — exact code/test head `ea1a8390c2826021feab46f3197c84a1a4f47039`

The three workflows completed successfully on the exact test-fix head:
- [Mission/restart continuity — run 39138908196](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138908196). Job log confirms both `simulation-restart-persistence.test.mjs` and `continuity-migration.test.mjs` passed.
- [STEP 5 outcome classification — run 39138908043](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138908043).
- [STEP 4 semantic validation — run 39138908074](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138908074).

The repair-settlement crash-cut workflow also passed on owner code head `291d482a2f1e03294c519bb8971fcce0b1c69176` ([run 39138771613](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138771613)); the STEP 4/STEP 5 workflows passed on test head `4667d3b3cbe4a587c6e53118961437b2db733958`. Do not interpret these tests as runtime migration or protected-effect proof.


### Repair-lineage revision guard — latest regression result

- Regression commit `12452f8d851c646d3cb7674cd0f59d7ba1246fe1` adds both missing-revision and mismatched-revision rejection checks; neither may append lineage or advance the Nexo store.
- Exact-head workflows all passed: mission/restart continuity [39139024311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024311) (job confirms `simulation-restart-persistence.test.mjs` and `continuity-migration.test.mjs` succeeded), STEP 5 [39139024315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024315), and STEP 4 [39139024377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024377).
- This validates the owner seam regression only. `effectJournal` still remains PREPARED after lineage; no runtime cutover, independent causal proof, or protected-effect authorization is established.


---

## Puerta de continuidad para nuevo chat — misión M0 (2026-10-18)

**Nuevo handoff maestro creado:** [NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-18.md](BUILD/NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-18.md), commit [1b4ee8dafbed4b7bae6820d7d1853d3a31816382](https://github.com/snowdenxrp/aldea-ia/commit/1b4ee8dafbed4b7bae6820d7d1853d3a31816382).

Al abrir un nuevo chat con `NCS`, leer este STATUS y después el handoff maestro completo. Retomar exclusivamente la misión M0 desde la sección “Siguiente tarea concreta”; verificar el HEAD y los checks actuales antes de seguir. No repetir auditorías cerradas, no reiniciar investigación y no mezclar Nexo con Lúmina. La migración del runtime continúa incompleta; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.


## New-chat handoff (2026-10-18)

For the next chat, read `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEW_CHAT_2026-10-18.md` first, then this STATUS. Entry keyword is exactly `NCS`. Mission: complete M0 and build Nexo's own continuity/runtime; keep Nexo separate from Lumina; do not restart M1 or closed historical audits. The handoff contains exact verified CI runs, current limits, and the ordered next steps.
