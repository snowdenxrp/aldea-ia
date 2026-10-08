# P112 — COMPLETE MUTABLE GRAPH / SNAPSHOT DETACHMENT BOUNDARY AUDIT V1 — 2026-10-07

## Scope
Research-only continuation. Verify whether the previously identified snapshot-alias gap can be closed by tracing the complete mutable input graph entering `createSimulation()`, without repeating the already-completed alias audit.

## Source boundary recovered
`scripts/simulate.mjs::applyState()` currently:
1. structured-clones `state.world`;
2. structured-clones `state.agents`;
3. calls `createSimulation(world, agents, { nexoMemory: state.nexoMemory ?? null })`;
4. then assigns `simulation.events = state.events.slice(-500)`.

`src/simulation.js::createSimulation()` accepts only the following externally supplied option fields relevant to mutable/non-plain state:
- `options.random` → stored directly as `simulation.random`;
- `options.nexoMemory` → passed through `createLearningMemory()`.

No provider object, callback registry, filesystem handle, network client, or other arbitrary option graph is accepted by `createSimulation()` in the inspected source.

## Findings

### 1. World/agent graph is already detached
🟢 `applyState()` uses `structuredClone()` for world and agents. This closes the previously suspected world/agent alias at the inspected entry boundary.

### 2. Nexo memory remains a real mutable alias boundary
🔴 `state.nexoMemory` is passed into `createLearningMemory()`, whose bounded arrays are shallow-copied. Entry objects therefore remain shared. The effect adapter can mutate existing effectJournal entry objects in place.

This reproduces the already-known concrete alias finding; it is not a new defect. The new result is that the inspected `createSimulation()` input graph confirms this is the principal mutable plain-data graph still crossing the snapshot boundary.

### 3. Events are detached only at the container level
🔵 `applyState()` uses `state.events.slice(-500)`. The array is new, but existing event objects remain shared with the source state. No inspected current path was found mutating existing event objects in place; current paths append new event records. Therefore this remains latent/lower-confidence, not a demonstrated corruption path.

### 4. Random is not a cloneable mutable snapshot component
🟢 `options.random` is a function reference, not persisted state. `applyState()` does not restore it from canonical state. Restart therefore defaults to the simulation's fallback random source unless the caller separately injects one.

🔵 This should not be “deep-cloned.” It belongs in the non-snapshot causal-input class: if randomness affects a protected claim, its draw/result or equivalent deterministic random-state provenance must be bound to that attempt. The separate P112 random audit already established this requirement.

### 5. No additional arbitrary provider/callback graph was found at this boundary
🟢 The inspected `createSimulation()` signature and caller show no additional provider/client/callback objects crossing through `options`. Therefore the prior “complete mutable graph” question can be bounded for this construction path rather than treated as an open-ended object-graph search.

## Minimum detachment boundary

For a protected local candidate that may be discarded after `STATE_REVISION_CONFLICT`, the defensible boundary is:

`structured-cloned world + structured-cloned agents + independently detached mutable nexoMemory/effectJournal + independently detached mutable event records where mutation is possible`

plus **separately bound non-snapshot causal inputs** such as RNG/time/provider observations when they affect the claim.

The random function itself must not be treated as durable snapshot state merely because it is reachable from the simulation object.

## Classification

🟢 World/agent detachment: demonstrated.
🟢 Complete `createSimulation()` option surface inspected: bounded to random + nexoMemory in this path.
🔴 Mutable Nexo-memory entry alias: demonstrated and already known.
🔵 Event-object alias: latent/lower-confidence; no current in-place writer demonstrated.
🔵 RNG/time provenance: causal-input issue already established; not a mutable-snapshot detachment problem.
🟢 No additional provider/callback object graph found at this boundary.

## Consequence

The “complete mutable graph” question is now narrowed enough that it should not block the P112 protected-transition model. The remaining isolation requirement is concrete: detach mutable Nexo-memory entries (and conservatively mutable event records) before candidate execution; keep RNG/provider/time as explicit provenance inputs rather than pretending they are snapshot state.

No implementation. No TLC rerun. No JMM-HB/exactly-once/power-loss claim.
