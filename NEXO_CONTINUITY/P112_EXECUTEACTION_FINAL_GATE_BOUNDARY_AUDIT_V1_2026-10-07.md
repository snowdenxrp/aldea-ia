# P112 EXECUTEACTION FINAL-GATE BOUNDARY AUDIT V1 — 2026-10-07

## Scope
Trace the current Lúmina `tick()/performDecision()/executeAction()` boundary against the Nexo runtime path.

## 🟢 Concrete path recovered

Normal simulation:
`tick()` → perception → decision context → option generation/evaluation → selected `currentIntent` → `performDecision()` → `executeAction(simulation, agent, intent)` → post-action learning/event/memory updates.

Nexo:
`executeLuminaNexoStep()` → `createLuminaEffectAdapter(simulation)` → effect handler → `executeAction(simulation, agent, action)` → local postcondition → runtime outcome commit.

Both paths therefore converge on the same mutation primitive, but neither currently inserts a demonstrated semantic FINAL_GATE immediately before the mutation.

## Admission footprint

The selected intent is materially derived from:
- needs;
- perception and nearby resources;
- visible agents/partner state;
- inventory and dynamic prices;
- knowledge/memories/relationships/skills;
- territorial context;
- plan state;
- random selection;
- current world resource quantities and availability.

Several of these are not simply the eventual WriteSet.

Examples:
- `trade` re-resolves the partner at execution and uses current partner/economic state;
- `catch_fish` reads current fish amount, skill and randomness inside the mutation;
- gather actions read current resource amount, skill and tool state;
- `build_shelter`, `farm`, `harvest`, institution actions delegate into modules with their own current-state reads.

Therefore the decision snapshot is not a sufficient final-gate provenance object.

## Critical boundary result

A single isolated snapshot can be a useful execution substrate, but **snapshot existence is not equivalent to final validation**.

The current normal `tick()` mutates the same simulation before and after `executeAction()`:
- day/world advancement can mutate world state before agent decisions;
- `executeAction()` performs the protected mutation;
- afterward `performDecision()` performs learning, belief, event and memory updates;
- `tick()` also records region visits and applies need consequences.

So a future protected transaction must distinguish at least:
1. protected effect mutation;
2. durable effect/operation outcome;
3. post-effect learning/telemetry/history writes.

Post-effect learning must not accidentally become part of the effect's protected WriteSet merely because it occurs in the same call path.

## Nexo-specific consequence

The Nexo adapter currently calls the same `executeAction()` directly. Its local `nexoEffectRevision` increments after success, but this is not the canonical `stateRevision` and is not a durable authority fence.

The Nexo runtime's final outcome commit records mission/execution/outcome in memory; it does not itself perform canonical `persistState(expectedRevision)`.

Therefore:
- 🟢 common mutation primitive identified;
- 🟢 admission footprint wider than WriteSet confirmed;
- 🔵 one protected final-gate boundary covering all relevant dependencies is absent;
- 🔵 protected mutation and post-effect learning/history are not cleanly separated;
- 🔵 Nexo runtime → canonical persistence/reconciliation owner remains absent.

## Minimal boundary candidate

The smallest defensible future boundary is not “wrap all of tick() in a transaction.”

It is closer to:

`capture claim-specific admission provenance`
→ `isolated snapshot`
→ `final revalidate DependencySet + authority/resource context`
→ `protected executeAction()`
→ `commit only if canonical conditional-commit still matches`
→ `record protected outcome`
→ `apply/record non-protected learning separately`.

This remains a design candidate, not implementation or proof.

## Status

🟢 Boundary and mutation convergence are evidenced.
🟢 The protected WriteSet cannot be inferred from the post-action learning/event path.
🔵 Complete final-gate provenance remains open.
🔵 Exact conflict/reconciliation ownership remains open.
🔴 No atomicity/exactly-once claim.

## Exact next
Audit the individual `executeAction` branches against their real helper mutation/read graphs, beginning with the smallest representative actions (resource consumption, inventory mutation, trade/partner mutation), and determine the minimum claim-specific DependencySet + WriteSet + post-effect learning separation for each class.

## DO-NOT-REPEAT
No implementation, no second persistence primitive, no TLC rerun, no AB104.185 primary, no AB105.117R.
