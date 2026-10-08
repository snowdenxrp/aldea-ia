# P112 SNAPSHOT ALIAS / MEMORY CROSSING AUDIT V1 — 2026-10-07

## Scope
Focused audit of the actual `loadState() → applyState() → createSimulation() → executeLuminaNexoStep()` crossing for hidden references that could make an apparently isolated working snapshot share mutable objects with its source state.

## Findings
1. 🟢 `applyState(state)` deep-clones `state.world` and `state.agents` with `structuredClone`, so those two major domains are physically detached from the supplied state object.
2. 🟢 `createSimulation(world, agents)` receives those cloned world/agent graphs and normalizes them in place; this remains inside the working simulation.
3. 🔴 `applyState(state)` does **not** deep-clone `state.nexoMemory` before passing it as `options.nexoMemory` into `createSimulation()`.
4. 🔴 `createLearningMemory(raw)` uses shallow array copies such as `source.nexo.effectJournal.slice(-200)`, `executions.slice(-200)`, `attempts.slice(-100)`, etc. The array containers are new, but their entry objects remain shared with `raw`.
5. 🔴 The effect adapter mutates existing effectJournal entry objects in place when terminal `persist()` writes `existing.result`, `existing.status`, and `existing.completedAt`. Therefore a working simulation's Nexo effectJournal can mutate objects still referenced by the original `state.nexoMemory` object.
6. 🔵 The runtime also mutates the selected memory object through `Object.assign(memory,nextMemory)`; although most top-level arrays are reconstructed, their existing element objects can retain source aliases because `createLearningMemory()` is shallow for entries.
7. 🔵 `state.events` is copied by `slice(-500)` in `applyState()`, so the array is detached but existing event objects are initially shared with the source state object. No inspected current handler was shown mutating an existing event object in place; current paths mostly append new event records. This is a latent alias, lower confidence than the Nexo-memory finding.
8. 🟢 World/agent action mutations therefore remain isolated from the source state in the normal `applyState()` path, but Nexo-memory journal mutations are a distinct snapshot-isolation boundary.
9. 🔵 This does not prove a production corruption bug today because `scripts/simulate.mjs` loads state from disk and immediately builds the working simulation; the original parsed state is not retained as a canonical live singleton by that script. The finding matters for any future protected owner that retains/reuses the loaded state object or passes a shared memory object.
10. 🔵 The hidden alias is especially relevant to conditional-commit semantics: a later `STATE_REVISION_CONFLICT` can reject the world snapshot while an already-shared Nexo-memory journal object may have been mutated in the discarded candidate/source graph.
11. 🟢 The clean research boundary is therefore not merely “clone world + agents”; the protected working graph must detach every mutable artifact that can be changed before conditional commit, including Nexo memory/effectJournal and any event records that future code may mutate.
12. 🔵 This strengthens the earlier conclusion that `persistState(expectedRevision)` is a valid conditional snapshot commit primitive but does not itself establish snapshot isolation before the candidate is prepared.
13. 🔴 No claim of current user-visible corruption, concurrent JMM behavior, exactly-once, or power-loss failure is made from this source-level alias alone.

## Consequence
The future protected owner must establish a **fully detached working state**, not just detached world/agent state, before allowing runtime/effect-adapter mutation. The existing persistence primitive can remain unchanged; this is a pre-commit isolation property.

## Exact next
Audit the complete mutable graph crossing into `createSimulation()` (including random/provider references and any other non-plain object/function inputs), then determine the minimum deep-detachment boundary required before a protected transition can be safely discarded on `STATE_REVISION_CONFLICT`.

## DO-NOT-REPEAT
No implementation.
No second persistence wrapper.
No TLC rerun.
No AB104.185 backfill.
No AB105.117R.
No JMM-HB/exactly-once/power-loss claims.
