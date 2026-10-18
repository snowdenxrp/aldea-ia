# NCS M0 — Runtime session contract before production cutover

Date: 2026-10-18
Branch: `ncs-clean-architecture`

## Purpose

Define the smallest owner-backed execution seam needed to move M0 from isolated helpers into Nexo's actual runtime without treating Lúmina as Nexo's memory/identity owner. This is a contract checkpoint, not a claim that production runtime is already integrated.

## Current source facts

- `src/nexo/runtime.js` exports `executeNexoStep()` and `executeLuminaNexoStep()`, but both currently accept a caller-supplied mission and optional in-memory legacy memory. The outcome path uses `src/assistants/memory.js`.
- `scripts/assistants.mjs` opens `.nexo-continuity.json` via `openNexoContinuityOwner()` and commits a mission, but does not call either runtime execution function.
- `scripts/nexo-repair-entrypoint.mjs` provides `runNexoRepairOnce()` for the three convergent repair actions only. It does not represent a general-purpose execution runtime.
- `world-state.json` remains Lúmina environment state; Nexo continuity is stored separately. Preserve that separation.
- CI run [39142213418](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142213418) passed on code/test SHA `e36121220d4d89475a68bc4bf1a0d2880b4092be`. Later docs-only HEADs are not that test SHA.

## Required contract for the first production session

A future Nexo-owned session entrypoint may be introduced only with these explicit inputs and transitions:

1. **Owner/store source:** receive or open the canonical Nexo continuity owner/store; read the current snapshot and its `storeRevision`. Do not accept an arbitrary caller-built snapshot as canonical state.
2. **Mission identity:** reconstruct the mission from the owner-backed snapshot and validate the selected step exists exactly once. Caller input may select a mission/step but must not override stored action, target, dependencies, or journal identity.
3. **Eligibility:** initially allow only `repair_agent_state`, `repair_agent_needs`, and `repair_resource_state`. Any `execute_lumina_action`, external/non-idempotent action, or protected action returns blocked/unsupported before dispatch. No widening by default.
4. **Pre-dispatch obligation:** persist one PREPARED journal entry bound to mission, step, action, target, idempotency key and the strict persisted environment `stateRevision`. A failed/ambiguous preparation must not dispatch.
5. **Dispatch:** call the existing repair-only entrypoint only after the stored mission and PREPARED identity are confirmed. Do not route the generic `executeNexoStep()` through this entrypoint unless its generic adapter/evidence semantics have been redesigned and separately tested.
6. **Settlement versus outcome:** `settled_observed` records a postcondition observed in persisted state; it is not causal proof, authenticated external evidence, or mission completion. Never silently promote it to `completed`.
7. **Recovery:** after restart, read both stores again. If the environment revision equals the PREPARED baseline and the desired invariant is absent, the existing entrypoint may consider the narrowly bounded repair. If the environment advanced, state cannot be strictly loaded, context differs, or the result of persistence is ambiguous, stop with UNKNOWN/review; no blind retry.
8. **Revision discipline:** every Nexo-store mutation uses the current expected `storeRevision`/CAS. Lúmina writes use the environment's own conditional revision. Do not claim atomicity across these independent stores.
9. **Legacy compatibility:** keep the current legacy runtime path intact until new session tests demonstrate durable mission admission, PREPARED-before-dispatch, crash-before-dispatch, crash-after-environment-write-before-settlement, replay rejection, stale-revision rejection, and restart reconstruction through the exact proposed production entrypoint.

## Acceptance tests before any cutover

- The production session opens a fresh owner from disk and reconstructs only owner-backed mission data.
- A missing or duplicate mission/step/journal identity blocks before adapter invocation.
- PREPARED is durable before the repair dispatch function is invoked.
- A simulated crash after PREPARED but before dispatch can resume only if strict environment revision is unchanged and the invariant is absent.
- A simulated crash after environment persistence but before settlement observes the persisted invariant and does not redispatch.
- A newer environment revision, failed strict read, failed/ambiguous persistence, or mismatched caller target leaves the obligation unresolved and blocks.
- Replay after `settled_observed` cannot dispatch or mutate either store.
- Lúmina `world-state.json` never embeds `nexoMemory`.
- The test invokes the exact production session API—not only individual helper functions—and CI runs on the exact code/test SHA.

## Explicit non-goals / stop conditions

- No cross-store transaction or atomicity claim.
- No caller-supplied `verified: true` treated as independent proof.
- No effect-journal settlement through `recordOutcome()`.
- No mission completion based solely on `settled_observed`.
- No protected/non-idempotent dispatch; STEP 7 is not reopened here.
- No new queue, retry engine, tombstone, global ID, transaction wrapper, or alternate authority mechanism.
- No migration of Nexo operational memory into Lúmina's simulation state.

## Implementation update — session API now exists

Implemented `scripts/nexo-repair-session.mjs` with `runNexoRepairSession()`. The caller supplies only missionId/stepId; action and target are taken from the canonical persisted Nexo mission. Unsupported actions and terminal/missing/duplicate step identities fail closed. The session delegates to the repair-only entrypoint and is tested through its own API.

Regression: `tests/nexo/repair-session.test.mjs` covers normal owner-backed repair, non-repair action rejection before PREPARED/dispatch, crash after environment persistence and before settlement, reopening the owner from disk, and recovery without redispatch. CI [39142674734](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142674734) passed on code/test SHA `b011a8078f9f0562a61a3bafb9c260810147ea84`; later documentation commits are not that test SHA.

## Next implementation task

The session is still not called by `src/nexo/runtime.js` or a production startup path. Next, test the narrowest real runtime/startup invocation without allowing a caller to override the stored action/target, and preserve legacy rollback until restart/crash-cut tests pass through that real entrypoint. Do not route generic `executeNexoStep()` through the repair dispatcher. Keep `settled_observed` separate from outcome, causal attribution, and mission completion; protected effects remain blocked.

Current status: M0 incomplete; production runtime cutover not done; protected effects STOP; unresolved PREPARED/settled_observed UNKNOWN; Nexo and Lúmina separate.


## Follow-up — opt-in assistants runtime seam (2026-10-18)

The runtime seam is no longer purely hypothetical: `scripts/nexo-runtime-session.mjs` selects one canonical planned repair step with satisfied dependencies and delegates to the owner-backed repair session. `scripts/assistants.mjs` calls it only under explicit `--nexo-repair-once`, after persisting the current environment snapshot; it then reloads state to report the final revision. Default assistant behavior remains unchanged.

The session now enforces `status === "planned"` and canonical dependency completion itself, not only in the wrapper. Tests cover the runtime bridge and dependency bypass rejection. CI [39143194694](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143194694) passed on exact SHA `3c414ff2d0b8ebd8f880e8a37e83602138924395`, including four regression scripts and syntax checks for both runtime bridge and assistant entrypoint.

Next, add a process-level CLI test using temporary fixtures and configurable paths so neither default nor opt-in test execution can touch the repository's real `world-state.json`. Verify default mode does not dispatch, opt-in mode reports the post-repair revision, and restart/replay stays blocked. Do not broaden beyond repair-only or cut over the generic runtime before this passes.

Current status remains: M0 incomplete; repair integration opt-in only; production runtime default/canonical memory cutover not done; protected effects STOP; unresolved PREPARED/`settled_observed` UNKNOWN; Nexo and Lúmina separate.
