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