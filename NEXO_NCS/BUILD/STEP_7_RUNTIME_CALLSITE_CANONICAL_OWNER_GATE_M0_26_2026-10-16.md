# STEP 7 — Runtime Call-Site and Canonical Owner Gate — M0.26 — 2026-10-16

Status: BOUNDED REPOSITORY SEARCH — NO PRODUCTION EXECUTION OWNER FOUND IN SEARCHED CURRENT SOURCES

## Scope

Searched the repository for:
- `executeLuminaNexoStep`
- `executeNexoStep(`
- `persistState(`
- `executeProtectedTransition`

Then compared matches with the current source for `src/nexo/runtime.js`, `src/nexo/effect-adapter.js`, and the existing P112 owner-gap audits. This is a bounded search/source trace, not a proof that no dynamic, generated, or unindexed caller exists anywhere.

## Result

The repository search surfaced:
- `src/nexo/runtime.js`: exports `executeNexoStep` and `executeLuminaNexoStep`; this is a definition, not a caller.
- `tests/nexo/runtime.test.mjs` and `tests/nexo/runtime-concurrency.test.mjs`: tests call `executeNexoStep`; test invocation is not a production owner.
- `scripts/assistants.mjs` is described in the existing P112/AB continuity evidence as loading canonical state, constructing/applying simulation state, generating and persisting a mission plan through `persistState()`, but not executing the mission through `executeLuminaNexoStep()`.
- `scripts/simulate.mjs` owns world-state loading/persistence, lock/revision checking and state-file replacement, but the existing source audit states its main loop does not invoke the Nexo runtime execution functions.
- `executeProtectedTransition()` appears in its Core definition and tests; no call from the inspected `src/nexo/runtime.js` execution path was found.

This agrees with the pre-existing P112 audits; it is not a new claim that the old audits were wrong or need to be repeated.

## Architectural consequence

There are currently two separate, non-composed areas in the inspected evidence:
1. A canonical state persistence/planning workflow that can persist mission plans but does not execute the Nexo mission through the runtime effect adapter.
2. A callable runtime/effect-adapter path that can mutate a supplied simulation and update supplied in-memory records, but has no demonstrated production caller that owns canonical state/revision and supplies a durable prepared-intent checkpoint.

The protected Core transition has contracts and tests, but the inspected production runtime path does not invoke it. Therefore no demonstrated path currently connects:
canonical state owner → detached candidate → legitimate Constitution Authority Context → final validation → conditional canonical commit / durable intent → effect boundary → reconciliation.

Do not “fix” this by wiring the runtime into `scripts/assistants.mjs` or `scripts/simulate.mjs` yet. That would select a production execution model and effect scope before Step 7 has established the trust root, constitutional decision scope, and final effect boundary.

## Next exact action

The next valid work is a **design-only ownership decision record** that distinguishes:
- planning-only path (already exists);
- local Lúmina candidate-state mutation (runtime adapter);
- canonical persisted state acceptance;
- any true external/protected effect (not identified by these source matches).

Before any wiring, identify the intended deployment target and which of those classes is actually within the first constitutional scope. Then trace the target's final effect-capable sink and its state owner. If the first scope is merely a non-authoritative review acknowledgement, it must not be used as a pretext to activate the mission executor.

## Evidence/change boundary

- No tests/CI were run.
- No code, workflow, state file, Constitution, device, key, signature, owner review, commissioning, or protected effect was changed or exercised.
- No current production caller was demonstrated by the bounded search; do not convert that into an exhaustive proof of absence.
- Step 7 remains OPEN / STOP / UNKNOWN; Constitution remains DRAFT / NOT FROZEN / NOT COMMISSIONED; protected effects remain STOP.
