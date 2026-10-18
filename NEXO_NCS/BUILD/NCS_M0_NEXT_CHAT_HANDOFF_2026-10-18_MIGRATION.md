## M0 — Current-state goal regression guard (2026-10-18)

- Regression test commit: [5f7d268bc92920aad25599f6d2689267e18fd98a](https://github.com/snowdenxrp/aldea-ia/commit/5f7d268bc92920aad25599f6d2689267e18fd98a).
- Added a separate persisted environment fixture where the repair invariant regresses after a prior `settled_observed` journal record. The mission verifier must return `blocked` / `NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT`, not `goal_observed` or mission completion.
- Exact-head CI for this test commit is NOT YET VERIFIED. The available GitHub status/workflow connector has not returned check records; no PASS claim.
- This proves re-observation detects a regressed invariant when it reads that state. It does NOT close the race between reading Lúmina's file and a later Nexo continuity write; no durable goal-observation write has been introduced.

Next: verify CI on the exact test commit; then define whether durable observation needs an environment-revision fence spanning both stores. Do not invent cross-file atomicity. M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest verifier hardening — exact mission/journal coverage

- Code commit: [25598ba80e377cdf39498991f29abc665a4ded69](https://github.com/snowdenxrp/aldea-ia/commit/25598ba80e377cdf39498991f29abc665a4ded69).
- Code + test head: [b74cc37edfad915fc8cc5deaf9269c6f15b28872](https://github.com/snowdenxrp/aldea-ia/commit/b74cc37edfad915fc8cc5deaf9269c6f15b28872).
- The mission verifier now rejects duplicate step IDs and requires exact journal coverage: one journal entry for every declared step, no undeclared entries. Regression tests were added to `tests/nexo/simulation-restart-persistence.test.mjs`.
- Exact-head CI is NOT YET VERIFIED; the available status/workflow lookup returned no records. Do not call this PASS.

### Next exact actions

1. Check Actions for exact head `b74cc37edfad915fc8cc5deaf9269c6f15b28872`; fix failures before proceeding.
2. Add a race regression for environment changes between goal verification and any durable continuity write. A continuity CAS alone cannot atomically fence Lúmina's separate environment file.
3. Do not persist `goal_observed` until revision binding/invalidation semantics are explicit. Do not mark mission completed, unblock, replan, wire runtime, or migrate legacy memory from this verifier.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest mission-goal verifier — read-only, non-completion semantics

- Exact tested head: [`1ae28c8570e76191663ed045e6d68644df17a52c`](https://github.com/snowdenxrp/aldea-ia/commit/1ae28c8570e76191663ed045e6d68644df17a52c).
- `scripts/nexo-repair-mission-verification.mjs` exports `verifyRepairMissionGoalFromPersistedState()`. It requires a repair-only mission with one `settled_observed` journal entry per step, reloads one strict environment snapshot, rechecks every required invariant, and rejects dependency cycles.
- Return is `goal_observed`, `missionCompleted: false`, `causalAttribution: "not_claimed"`. It does not write continuity, unblock steps, or authorize replan.
- Runtime replan explicitly returns `NEXO_REPAIR_GOAL_VERIFICATION_REQUIRED` when an earlier mission contains `settled_observed`.
- Exact-head CI PASS: mission/restart [39133517131](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517131), outcome [39133517097](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517097), semantic [39133517074](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517074).

### Next exact task

Define whether/how `goal_observed` can be durably recorded through continuity CAS without turning it into causal completion. The contract must state how the current environment revision is bound, how later state changes invalidate/reopen verification, and how mission/step statuses avoid accidental redispatch. Keep the verifier read-only until those semantics are explicit and tested.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest runtime boundary — no successor before mission goal verification

- Exact tested code/test head: [`9610580f838ea2f55a482f64a28f18d84cac202e`](https://github.com/snowdenxrp/aldea-ia/commit/9610580f838ea2f55a482f64a28f18d84cac202e).
- Runtime replan now detects `settled_observed` journal entries and returns `NEXO_REPAIR_GOAL_VERIFICATION_REQUIRED` without creating a successor. This closes a path where observation settlement could otherwise permit replan even though the mission-level goal was not verified.
- Exact-head CI PASS: mission/restart [39133373970](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373970), outcome [39133373980](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373980), semantic [39133373987](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373987).
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).

### Next exact task

Specify a separate mission-goal verification contract. It must derive evidence from authoritative persisted state, validate all required mission steps and dependencies, and distinguish:
- a repair invariant observed,
- a step verified complete,
- the whole mission verified complete.

Until that verifier exists, observed-settled steps remain blocked and runtime cannot cut over to the new Nexo-owned continuity path. Keep legacy runtime memory intact. No authority or protected-effect claims.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest settlement hardening — negative evidence + reconstruction non-redispatch (2026-10-18)

- Latest exact tested code/test head: [`4cadf1831ecbd3664964c410ac8bc1397fd22a2e`](https://github.com/snowdenxrp/aldea-ia/commit/4cadf1831ecbd3664964c410ac8bc1397fd22a2e).
- Negative recovery tests confirm that an absent desired invariant, a durable environment revision beyond the permitted window, and an UNKNOWN continuity commit result do not settle the operation. PREPARED stays in place for unresolved cases.
- `continuity-operations.mjs` now treats `settled_observed` as non-executable: reconstruction blocks the step under `verify_observed_repair_goal`, explicitly without claiming causality. This prevents a settled-by-observation repair from resurfacing as a planned action and being redispatched.
- Exact-head CI PASS: mission/restart [39133277523](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277523), outcome [39133277522](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277522), semantic [39133277520](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277520).
- Checkpoint addendum in [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).

### Next exact task

Review `settled_observed` compatibility through runtime reconstruction and mission verification. A separate mission-level goal verifier must be defined before any runtime wiring: observation of one repair invariant is not mission completion. Continue testing persistence failure and restart boundaries. Keep non-idempotent actions excluded; no cross-store atomicity or authority claims.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest implementation — repair settlement from persisted invariant (2026-10-18)

- Code/test head: [`72bb686a4d6b84d6cd058751005dbe34cda1d273`](https://github.com/snowdenxrp/aldea-ia/commit/72bb686a4d6b84d6cd058751005dbe34cda1d273).
- New `scripts/nexo-repair-settlement.mjs` exports `settlePreparedRepairFromPersistedState()`. It reads the durable continuity entry and strict persisted environment itself, requires exactly one PREPARED repair, requires a valid bound environment revision, checks that current revision is the prepared revision or immediate successor, verifies the operation-specific invariant, and commits through `store.commitIfCurrent()`.
- It marks journal entry `settled_observed`, not generic `completed`; evidence includes the persisted revision and `causalAttribution: "not_claimed"`. This records a grounded observation without pretending the operation caused the invariant.
- If environment revision is unrelated, invariant is absent/unknown, target is ambiguous, or continuity revision conflicts, settlement is not reported successful.
- Exact-head CI PASS: mission/restart [39133009763](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009763), semantic [39133009760](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009760), outcome [39133009772](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009772).
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).

### Next exact task

Add negative crash-cut tests for desired invariant absent/unknown and environment revision advanced beyond the allowed window. Inject continuity-store commit failures/ambiguous read-after-write results and verify that no caller receives false settlement success. Inspect mission reconstruction so `settled_observed` is terminal only for the repair journal and does not imply broader mission completion. Only then consider runtime wiring; no non-idempotent effects and no cross-store atomicity claims.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest implementation — repair revision-fenced preparation and dispatch (2026-10-18)

- Exact code/test head: [`64f8329aef2ba050e9600227e2661f56fb75e21d`](https://github.com/snowdenxrp/aldea-ia/commit/64f8329aef2ba050e9600227e2661f56fb75e21d).
- `prepareRepairAgainstPersistedState()` derives the repair PREPARED revision from `loadStateStrict()`; the caller no longer supplies that integer to the helper.
- `dispatchPreparedRepair()` loads the operation from the durable Nexo journal by idempotency key and requires exactly one PREPARED entry. It rejects missing entries, unknown revision bindings, and stale durable environment revisions. It only dispatches the three convergent repairs.
- Changed state persists through existing `persistState()` expected-revision fencing with strict reload comparison. A concurrent writer winning the race blocks the stale commit; uncertainty is not converted to success.
- Test covers successful revision 0→1 repair persistence, stale dispatch refusal, and no-PREPARED-entry refusal. The environment write still does not settle the separate Nexo journal.
- Exact-head CI PASS: mission/restart [39132820121](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820121), semantic [39132820068](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820068), outcome [39132820026](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820026).
- Checkpoint: [NCS_M0_REPAIR_PREPARE_DISPATCH_REVISION_FENCE_CHECKPOINT_2026-10-18.md](NCS_M0_REPAIR_PREPARE_DISPATCH_REVISION_FENCE_CHECKPOINT_2026-10-18.md).

### Next gate

Add crash-cut tests for conditional persistence failure and commit ambiguity. Then specify a **repair-only terminal settlement** using the repository's own strict-loaded persisted invariant, the prepared environment revision, and continuity-store compare-and-commit. A successful environment write followed by a process stop must still leave PREPARED unresolved until settlement evidence is consumed. Do not generalize this to non-idempotent actions, do not add a generic cross-store transaction wrapper, and do not wire runtime until settlement is proven.

M0 incomplete; unresolved PREPARED remains UNKNOWN until owner settlement; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest implementation — PREPARED repair environment revision binding (2026-10-18)

- Code/test head: [`d0e38809992be291262153b527ec21a4793ac3d6`](https://github.com/snowdenxrp/aldea-ia/commit/d0e38809992be291262153b527ec21a4793ac3d6).
- For `repair_agent_state`, `repair_agent_needs`, and `repair_resource_state`, `recordPrepared()` requires a valid non-negative safe integer `environmentStateRevision` and persists it in the PREPARED entry.
- Existing PREPARED repair entries cannot be rebound to a different revision. Missing legacy binding remains UNKNOWN/unresolved. Tests cover missing binding and mismatched rebind.
- Checkpoint: [NCS_M0_PREPARED_REPAIR_REVISION_BINDING_CHECKPOINT_2026-10-18.md](NCS_M0_PREPARED_REPAIR_REVISION_BINDING_CHECKPOINT_2026-10-18.md).
- CI for exact code/test head: mission [39132557480](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132557480), outcome [39132557474](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132557474), semantic [39132557453](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132557453). Verify completed conclusions before describing them as PASS.
- Boundary: this stores a caller-provided revision but does not derive it from strict-loaded state; it is not yet a dispatch fence and does not atomically coordinate the two files. No settlement/runtime cutover.

### Next exact task

Implement a Nexo-owned prepare path that loads the authoritative Lúmina snapshot through `loadStateStrict()`, derives `environmentStateRevision` from that snapshot, and commits PREPARED with the derived value. Then make repair dispatch conditional on the durable environment revision still matching the prepared revision, using the existing `persistState({expectedRevision, stateRevision})` concurrency boundary. Keep the distinction between durable `stateRevision` and in-memory `nexoEffectRevision`. Add stale-revision and crash-cut tests. No generic transaction wrapper, no synthetic receipt/queue, no caller-supplied `verified` boolean, no runtime cutover until proven.

M0 incomplete; unresolved PREPARED UNKNOWN; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest continuation — ambiguous repair targets + revision fence diagnostics (2026-10-18)

- `comparePersistedRepairRevision()` classifies matching/stale/missing environment revision binding without inventing a historical revision. Code/test head for that change: [`db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f`](https://github.com/snowdenxrp/aldea-ia/commit/db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f); exact-head CI PASS: mission [39132287649](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287649), outcome [39132287652](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287652), semantic [39132287648](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287648).
- Tightened target resolution: duplicate agent IDs for either agent repair return UNKNOWN; resource target must be an own property of the persisted resources object. Tests at [`f6ad72da4f0caff056a21dbdf8835391844c6b0c`](https://github.com/snowdenxrp/aldea-ia/commit/f6ad72da4f0caff056a21dbdf8835391844c6b0c). Exact-head CI PASS: semantic [39132380744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380744), outcome [39132380742](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380742), mission/restart [39132380735](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380735).
- Checkpoint: [NCS_M0_AMBIGUOUS_REPAIR_TARGET_CHECKPOINT_2026-10-18.md](NCS_M0_AMBIGUOUS_REPAIR_TARGET_CHECKPOINT_2026-10-18.md).

### Next work boundary

The revision observer only detects staleness. Current PREPARED records do not bind the authoritative persisted environment `stateRevision`; adapter `nexoEffectRevision` is an in-memory counter and is not the durable `world-state.json` revision. Do not conflate them.

Before terminal settlement:
1. Review explicit schema-versioned addition of the prepared environment revision (no silent inference).
2. Define the adapter's pre-dispatch check against the same durable revision and ensure mutation/persist path uses conditional expected revision.
3. Re-load strict persisted state during recovery, classify the action-specific repair invariant, and reject stale revision.
4. At terminal settlement, use the continuity store's compare-and-commit revision; any conflict keeps PREPARED unresolved.
5. Add crash-cut tests at prepare, dispatch, persist, recovery, and settlement boundaries. Do not claim two independent stores are atomic.

No generic transaction wrapper, synthetic receipt/queue, or runtime cutover. Non-idempotent effects remain UNKNOWN. M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest continuation — stale/missing environment revision binding (2026-10-18)

- Added `comparePersistedRepairRevision()` and tests at [`db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f`](https://github.com/snowdenxrp/aldea-ia/commit/db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f).
- It reports `current`, `stale`, or `unknown`; if PREPARED lacks a bound environment revision, it explicitly returns `PREPARED_ENVIRONMENT_REVISION_NOT_BOUND` instead of assuming the latest revision is the original one.
- Exact-head CI PASS: mission/continuity [39132287649](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287649), outcome [39132287652](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287652), semantic [39132287648](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287648). The mission workflow ran the restart-persistence test successfully.
- Checkpoint: [NCS_M0_REVISION_FENCE_OBSERVATION_CHECKPOINT_2026-10-18.md](NCS_M0_REVISION_FENCE_OBSERVATION_CHECKPOINT_2026-10-18.md).

### Next exact architecture step

The observer only detects stale state; it cannot close the race. Before settlement:
1. Review and explicitly version the PREPARED schema to bind the persisted environment revision.
2. Make dispatch conditional on the adapter seeing the same current environment revision; stale revision means no dispatch.
3. On recovery, re-load strict persisted state and evaluate the operation-specific repair invariant.
4. Recheck revision at settlement; if changed, preserve PREPARED as UNKNOWN.
5. Settle only via continuity store compare-and-commit at the expected store revision; a conflict leaves PREPARED unresolved.
6. Add crash-cut tests around prepare, dispatch, environment persist, recovery observation, and terminal commit.

Do not pretend the two independent files form one atomic transaction. No generic transaction wrapper, queue, synthetic receipt, or runtime cutover. Non-idempotent actions remain UNKNOWN. M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest continuation — read-only persisted repair observer (2026-10-18)

- Added `src/nexo/adapters/persisted-repair-observation.mjs` and regression coverage at exact code/test head [`8a89ef9b83b3126db3e83122a7876abe2a78819f`](https://github.com/snowdenxrp/aldea-ia/commit/8a89ef9b83b3126db3e83122a7876abe2a78819f).
- For the three candidate repair actions, the observer classifies the durable desired-state invariant as present, absent, or unknown. It is read-only and fails closed on unknown life-state, invalid revision, missing targets, and malformed collection shapes.
- It deliberately does **not** return `verified`, settle PREPARED, or authorize redispatch. It assumes a snapshot loaded through `loadStateStrict()` and is not atomic with later writes.
- Exact-head CI PASS: mission/continuity [39107811320](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811320), semantic [39107811311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811311), outcome [39107811306](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811306).
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_CONTRACT_CHECKPOINT_2026-10-18.md](NCS_M0_REPAIR_OBSERVATION_CONTRACT_CHECKPOINT_2026-10-18.md).

### Next exact task

Design the repair-only settlement boundary; do not immediately add a terminal status switch.

1. Decide whether a satisfied invariant can complete a *goal-state repair step* even if the exact operation cannot be attributed.
2. Address the missing environment revision binding in PREPARED and the race between observing `world-state.json` and later writes.
3. Prove behavior under stale environment revision, concurrent environment mutation, continuity-store revision conflict, absent desired state, and UNKNOWN target/life-state.
4. Only after those decisions and crash-cut tests, add owner settlement backed by repository-controlled evidence and migrate runtime. No caller-provided `verified` assertion, generic transaction wrapper, or synthetic queue/receipt. Keep non-idempotent effects UNKNOWN.

The observer is a diagnostic boundary, not end-to-end migration. M0 incomplete; legacy runtime outcome path remains; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest continuation — persisted repair crash cut (2026-10-18)

- Added regression at code/test commit [`db3399aa28e6671bf5329ea5ca60544c8ac581ee`](https://github.com/snowdenxrp/aldea-ia/commit/db3399aa28e6671bf5329ea5ca60544c8ac581ee).
- The test commits mission + PREPARED in the standalone Nexo store, executes `repair_agent_state`, persists Lúmina `world-state.json`, strictly reloads it, then reopens Nexo continuity.
- Observed: the repaired coordinate survives durable restart; the Nexo journal remains `prepared`; owner reconciliation remains blocked and unverified. This is the expected safe result while no operation-specific terminal settlement contract exists.
- Exact-head CI PASS: mission/continuity [39107632187](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632187), outcome [39107632188](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632188), semantic [39107632199](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632199). Mission workflow logs confirm the restart persistence regression passed.
- Checkpoint: [NCS_M0_DURABLE_REPAIR_CRASH_CUT_CHECKPOINT_2026-10-18.md](NCS_M0_DURABLE_REPAIR_CRASH_CUT_CHECKPOINT_2026-10-18.md).

### Next implementation boundary (do not skip)

1. Specify a repair-only recovery decision table based on the actual persisted snapshot, without mutating Nexo's journal:
   - `repair_agent_state`: target exists, `alive` is boolean, coordinates finite → desired invariant satisfied; missing/non-boolean `alive` or missing target → UNKNOWN.
   - `repair_agent_needs`: target exists and all six needs are finite and clamped to [0,100] → invariant satisfied; missing target/schema-invalid needs → UNKNOWN until exact normalization policy is explicitly represented.
   - `repair_resource_state`: resource exists and `amount` is finite and non-negative → invariant satisfied; missing resource → UNKNOWN.
2. Prove the complementary cases: invariant absent after restart; malformed target; unknown life-state; stale environment revision; Nexo continuity revision conflict.
3. Decide explicitly whether a durable satisfied invariant is enough to mark a **convergent repair step** complete even if this exact operation cannot be attributed. Do not generalize that rule to other actions.
4. Only after the contract and tests are accepted, implement owner settlement with evidence produced by the repository's own persisted-snapshot verifier—not a caller-supplied `verified` boolean or callback.
5. Keep runtime cutover blocked until settlement is safe. Do not reintroduce Lúmina learning-memory coupling, delete legacy runtime functions early, or replay non-idempotent effects.

This closes a missing crash-cut test, **not** the migration. M0 remains incomplete; unresolved PREPARED remains UNKNOWN; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN; no device migration claimed.

---

## Latest update — unknown life-state is not inferred

- `repair_agent_state` now refuses to run if `alive` is missing or non-boolean, returning `AGENT_ALIVE_STATE_UNKNOWN` before any coordinate mutation. A valid explicit `alive:false` remains false while coordinates can be normalized.
- Regression test: an agent with unknown life-state remains unchanged; the operation is `blocked / EFFECT_OUTCOME_UNKNOWN`.
- Exact code/test head: [`508a76a13384e282b812fcc91cbf4fb17222341f`](https://github.com/snowdenxrp/aldea-ia/commit/508a76a13384e282b812fcc91cbf4fb17222341f).
- Exact-head CI PASS: semantic [39106685371](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106685371); outcome classification [39106685361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106685361). Mission/restart continuity was not confirmed on this exact head.
- This is a fail-closed normalization improvement, not settlement or persistence migration. The next gate remains authoritative persisted-state crash-cut tests; no terminal settlement API or runtime cutover yet.

---

## Latest update — dead-agent-safe repair and exact-head CI PASS

- `repair_agent_state` now normalizes coordinates while preserving `alive:false`; the postcondition checks finite coordinates and a boolean alive flag instead of requiring a living agent.
- Test head: [`0846597665e72de65917101c9206c3d26c11bf1b`](https://github.com/snowdenxrp/aldea-ia/commit/0846597665e72de65917101c9206c3d26c11bf1b).
- Exact-head CI PASS: semantic validation [39106552699](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106552699); outcome classification [39106552701](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106552701).
- Mission/restart continuity on this exact head was not observed; do not claim it passed here.
- The change improves repair convergence only. It does not add a durable operation receipt or resolve PREPARED after a crash. Next: inspect the existing durable snapshot and crash-cut tests for repair actions; retain UNKNOWN until the action can be reconciled from independent, persisted evidence.

---

## Latest update — repair normalization convergence (2026-10-18)

- See [convergent repair revision checkpoint](NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md).
- Normalization handlers now increment the in-memory effect revision only when normalized fields change; missing resource amount becomes zero. Regression tests exercise repeated normalization and absent amount.
- Exact test head `575d01789250bb26800d66146da18321ffad32ab`: semantic validation [39106460906](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460906) PASS; outcome classification [39106460938](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460938) PASS. Mission/restart workflow on this exact head not confirmed.
- Important limitation: in-memory revision is not durable world-state revision; desired normalized state does not prove attribution to a particular prepared operation. `repair_agent_state` preserves dead status, while its current postcondition rejects dead agents; do not treat this action as universally settleable until that semantic edge is defined.
- Next: resolve the dead-agent repair contract without resurrection, then test candidate repairs against the authoritative persisted snapshot and crash cuts. Do not add settlement API or runtime cutover before durable evidence exists. All non-idempotent unresolved effects remain UNKNOWN.

---

## Continuity index updated

- `NEXO_NCS/STATUS.md` is now a concise entry point with the current state, exact-head CI links, and ordered next reads.
- The prior chronological STATUS contents were preserved verbatim in [`NEXO_NCS/STATUS_HISTORY_2026-10-18.md`](../STATUS_HISTORY_2026-10-18.md); history was not discarded.
- The index change is documentation-only. The latest code/test CI evidence remains attached to code/test head `431978730f3b2be300fa51d3a35938ef6702e607`; do not imply the documentation commit itself was run through those code tests.

---

## Latest update — action reconciliation matrix added (2026-10-18)

- New source-backed matrix: [action reconciliation classification](NCS_M0_ACTION_RECONCILIATION_CLASSIFICATION_2026-10-18.md).
- It distinguishes the candidate convergent repair actions from non-idempotent actions (resource consumption/transfer, trade, shelter/farm creation, harvest, etc.). The matrix does not authorize terminal settlement; repair candidates still need operation-specific crash-cut tests.
- Current branch head at this update: [`d0049b010226fda3df96fe24a6c7f7c9baec7090`](https://github.com/snowdenxrp/aldea-ia/commit/d0049b010226fda3df96fe24a6c7f7c9baec7090), documentation-only after the code/test head with exact-head CI PASS.
- Continue with the repair-action recovery contract only after testing the existing authoritative snapshot path. Do not wire runtime dispatch to the owner yet. Non-idempotent actions remain UNKNOWN when PREPARED is unresolved.

---

## Latest update — environment crash cuts mapped (2026-10-18)

- Read [environment reconciliation/crash-cut findings](NCS_M0_ENVIRONMENT_RECONCILIATION_CRASH_CUTS_2026-10-18.md) after the fail-closed handler fix.
- Key source finding: the effect adapter mutates an in-memory Lúmina simulation and uses in-memory `nexoEffectRevision`; `scripts/simulate.mjs` persists `world-state.json` with a separate `stateRevision`. `scripts/assistants.mjs` commits Nexo mission admission and Lúmina state separately, and does not dispatch `executeLuminaNexoStep()`. This is not one connected durable effect protocol.
- Therefore, do not implement a universal verifier or terminal settlement yet. Current persisted state cannot universally attribute an observed change to a specific PREPARED operation; action semantics differ, and some replay paths are non-idempotent (e.g. shelter/farm creation).
- Next exact task: classify action handlers by existing durable evidence and idempotency/reconciliation properties; then specify the minimum operation-specific read/settlement contract and crash-cut tests. Any action lacking reliable operation-specific durable evidence remains UNKNOWN. Do not add synthetic queues, IDs, tombstones, global revision, generic transaction wrapper, or caller-asserted verification.
- Exact-head CI PASS for fail-closed code/tests remains [39105986623](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986623), [39105986616](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986616), [39105986625](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986625), all on `431978730f3b2be300fa51d3a35938ef6702e607`.
- M0 incomplete; runtime still uses legacy memory for outcomes; no real-device migration or execution. PREPARED UNKNOWN; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## Latest update — ambiguous handler failures stay unresolved (2026-10-18)

- See [focused checkpoint](NCS_M0_AMBIGUOUS_HANDLER_FAILURE_FAIL_CLOSED_CHECKPOINT_2026-10-18.md).
- `src/nexo/effect-adapter.js` no longer turns a handler's non-completed status into terminal failure solely because the observed revision is unchanged. It returns `blocked / EFFECT_OUTCOME_UNKNOWN`; if the observed revision changed, it returns `blocked / PARTIAL_EFFECT_DETECTED`. Both leave PREPARED unresolved.
- Invalid handler results are also blocked and left PREPARED. Same-key retries cannot redispatch; replan is blocked while the mission has an unresolved prepared entry.
- Regression tests cover a no-observed-mutation failure, invalid result, retry suppression, and runtime replan suppression after environment change.
- Exact code/test head: [431978730f3b2be300fa51d3a35938ef6702e607](https://github.com/snowdenxrp/aldea-ia/commit/431978730f3b2be300fa51d3a35938ef6702e607).
- Exact-head CI PASS: mission/restart [39105986623](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986623), semantic validation [39105986616](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986616), outcome classification [39105986625](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986625).
- Do not overstate this: there is still no independent operation-specific verifier/terminal settlement API, and `src/nexo/runtime.js` still relies on legacy memory functions. Do not wire the standalone owner into effect dispatch until the crash cuts and trusted settlement contract are explicit. M0 incomplete; PREPARED UNKNOWN; protected effects STOP.

---

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


## Update — 2026-10-18, latest verified progress

### Effect adapter fail-closed hardening
- `src/nexo/effect-adapter.js` no longer persists detected partial effects or failed postconditions as terminal failures. They return BLOCKED with uncertainty and keep the journal PREPARED; a same-key retry is blocked instead of dispatching again.
- Code commit: `699b14d57918cbd02c6d6440120f88c91bc84672`.
- Tests added across `af412f23a4898fa279e995e4bc67e0e53b01410c`, `8183fa6ce39c1fd968eeafdcd3833d648d05f549`, `630dc8a51b91047ce5d33cbe08901e8db9a0fc0c`, and `d3ebb7738ba29a3e1ffdbd93f29e35e0c692093a`.
- Exact-head CI PASS at `d3ebb7738ba29a3e1ffdbd93f29e35e0c692093a`: mission/restart [39105138229](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105138229), semantic [39105138224](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105138224), outcome [39105138205](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105138205).
- Checkpoint: `NEXO_NCS/BUILD/NCS_M0_PARTIAL_EFFECT_FAIL_CLOSED_CHECKPOINT_2026-10-18.md`.

### Lúmina action mutation on failure
- `src/actions.js` showed `catchFish()` can fail with `fish_escaped` after mutating agent energy/activity. Previously the simulation adapter bumped its state version only for successful actions, masking this partial effect.
- `src/nexo/simulation-adapter.js` now compares agents/world before and after action execution, including failure outcomes, and advances the effect revision when observed state changed. Code commit: `ed64bec0ad8b8741b7da6f8bcccf65f5af5d2742`.
- Regression test in `tests/nexo/runtime.test.mjs` at `08681d908a3231e0b45700fd09bd35207d7069ae` forces a deterministic fish escape; asserts BLOCKED/PARTIAL_EFFECT_DETECTED, PREPARED retained, and replan rejected.
- Exact-head CI PASS at `08681d908a3231e0b45700fd09bd35207d7069ae`: mission/restart [39105229917](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105229917), semantic [39105229991](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105229991), outcome [39105229910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105229910).
- Checkpoint: `NEXO_NCS/BUILD/NCS_M0_LUMINA_FAILED_ACTION_MUTATION_CHECKPOINT_2026-10-18.md`.

### Mandatory next work — no restart of closed research
1. Review exact branch head and STATUS after this handoff update.
2. Define operation-specific definitive-no-effect semantics. Generic handler `status: failed` with no observed state-version change is not universal proof that an external effect did not occur. Do not permit generic retries based only on that status.
3. Determine how a persisted Lúmina environment state can expose trustworthy operation-specific reconciliation after a crash without adding ungrounded IDs/queues/tombstones or claiming cross-file atomicity. Current PREPARED record contains identity but no independent terminal verifier/settlement exists.
4. Add crash-cut tests for Lúmina state commit success followed by missing/lost Nexo terminal commit, and stale environment revision. Keep UNKNOWN if evidence cannot distinguish.
5. Only then implement owner-backed runtime outcome/reconstruction integration. Do not remove legacy memory functions until end-to-end migration and rollback diagnostics pass.

Latest STATUS update commit before this handoff edit: `38e495812f05004b4371f87fbcc7ae3b0259bc0c`. M0 remains incomplete; runtime still uses legacy memory operations; no device migration is claimed; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.


---

## Latest M0 continuation point — cross-store revision-fence analysis (2026-10-18)

Analysis checkpoint: [NCS_M0_CROSS_STORE_REVISION_FENCE_ANALYSIS_2026-10-18.md](NCS_M0_CROSS_STORE_REVISION_FENCE_ANALYSIS_2026-10-18.md), commit [6e3a51be77b45407707917ccc0ecf0cc94e50994](https://github.com/snowdenxrp/aldea-ia/commit/6e3a51be77b45407707917ccc0ecf0cc94e50994).

### Confirmed implementation boundary

- `scripts/simulate.mjs` owns the current persisted environment read/write path. `persistState()` has its own lock and optional expected-revision check; `loadStateStrict()` validates revision but returns without retaining a lock.
- `src/nexo/core/continuity-store.mjs` has a separate lock and compare-and-commit for the Nexo continuity file.
- The mission verifier reads continuity, then the environment; it is read-only. The settlement helper reads environment, then writes Nexo continuity. No shared fence currently prevents an environment writer from committing a new revision between those operations.
- Do not persist a terminal `goal_observed` status or claim mission completion based on this verifier. Do not wire it into protected runtime execution.
- Exact-head CI for latest regression test commit `5f7d268bc92920aad25599f6d2689267e18fd98a` remains NOT VERIFIED. Status/workflow lookup exposed no records. Do not call it PASS.

### Next work, without restarting prior audits

1. Reuse—not repeat—the closed P112 writer/persistence audits: `P112_PERSISTSTATE_FINAL_COMMIT_FEASIBILITY_AUDIT_V1_2026-10-07.md`, `P112_PERSISTSTATE_PHYSICAL_BOUNDARY_CRASH_CUT_AUDIT_V2_2026-10-07.md`, `P112_PROTECTED_OWNER_AGAINST_EXISTING_PERSISTENCE_PRIMITIVE_V1_2026-10-07.md`, and `P112_WRITER_DEPENDENCY_GRAPH_V1_2026-10-07.md`.
2. Answer only the unresolved consumer-level question: does M0 actually require a durable terminal `goal_observed` record? If not, keep the verifier read-only and re-check on use. If yes, demonstrate that the relevant writer set can participate in a domain-specific revision fence; otherwise declare the terminal durable status unavailable.
3. Avoid generic transaction abstractions, invented global revisions, and test-only hooks that do not represent a real persistence boundary.
4. Preserve legacy runtime memory until end-to-end migration and rollback evidence exists.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.
