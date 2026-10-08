# P112 SNAPSHOT ISOLATION BYPASS AUDIT V1 — 2026-10-07

Research-only; no implementation.

## Result
The representative protected mutation modules (`actions.js`, `development.js`, `production.js`, `economy.js`, `collective.js`, `institutions.js`) receive the `simulation`/`world`/`agent` objects explicitly rather than importing a canonical singleton simulation. Their mutations therefore appear structurally snapshot-compatible: if the executor supplies an isolated simulation object, the direct mutation code operates on that object.

Examples:
- `executeAction(simulation, agent, action)` delegates to modules using the supplied simulation/world/agent.
- `buildShelter(simulation, agent)` writes `simulation.world` and `agent`.
- `farm/harvest` write supplied simulation/world/agent.
- `trade(simulation, seller, buyer, ...)` resolves/mutates supplied agents and world economy.
- `findOrCreateProject`/`contributeToProject` operate on supplied simulation agents/world.
- institution actions operate on supplied simulation/world/agent.

## No obvious canonical-global bypass found in this pass
The inspected protected handlers do not import a global live simulation object. This is important positive evidence for a snapshot/conditional-commit design.

## Remaining hidden-dependency classes
Snapshot isolation is not yet proven complete because admission can depend on:
- random source: `getRandom(simulation)` normally follows `simulation.random`, but falls back to `Math.random`; random evidence must be captured/bound if outcome identity matters.
- derived/normalization helpers that mutate the supplied snapshot during reads;
- shared writers/day transitions that may invalidate the snapshot after capture;
- external observations/providers, if introduced later;
- any uninspected module or future handler that closes over live state.

## Critical distinction
This audit establishes **structural snapshot compatibility**, not atomic commit or complete DependencySet coverage.

It strengthens the case for conditional snapshot/commit as the smallest current architectural candidate, but does not close the protocol.

## Status
GREEN: representative protected mutation paths use explicit simulation/world/agent parameters; no canonical singleton bypass found in inspected modules.
BLUE: exhaustive bypass coverage, dependency completeness, random binding, stale rejection and durable crash semantics remain OPEN.

## Exact next
Trace the Nexo runtime/adaptor path itself against snapshot injection: determine whether `executeLuminaNexoStep` and its handlers can receive the isolated simulation while preserving mission/effect journal semantics, and identify where canonical state is revalidated before commit. Do not implement.

## DO-NOT-REPEAT
No implementation; no callback wiring; no fsync; no global stateRevision promotion; no TLC; no AB104.185 primary; no AB105.117R.
