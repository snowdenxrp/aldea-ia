# P112 SHARED-WRITER SUBORDINATE COVERAGE AUDIT V1 — 2026-10-07

Research-only; current source audit. No runtime interleaving executed.

## Resource
Shared invalidators are not centralized.
- Physical resource quantities: `actions.js` (drink/eatPlant/catchFish/gatherWood/gatherStone), `production.js` (farm), `world.js` daily regeneration/storm/drought, `ecosystem.js` derives environmental state from resource ratios.
- Resource quality/context: world/economy/territorial/perception paths can read them; ecosystem state can change independently.
- Agent-side eligibility: inventory/needs/skills/tools are written by actions, production, development, collective and daily simulation/society paths.
- Spatial/range: `spatial.js`, exploration, movement/tick and settlement updates can alter spatial predicates or derived region state.
Conclusion: no single resource-token owner is demonstrated. A resource token would require an authoritative mutation wrapper around all quantity/quality writers OR a broader protected footprint.

## Trade
- Inventory is written by actions, production, development, collective, economy trade itself, and other daily paths.
- Price dependency is aggregate: `advanceEconomyDay()` scans inventories of every alive agent, computes per-capita stock and updates `priceMemory`.
- Relationship dependency is written through `recordInteraction()` and can be created/mutated by social, trade, collective and society learning paths.
- Partner/alive/range state is written by lifecycle, movement/tick, social/society and spatial paths.
Conclusion: no participant-only token can own the full trade admission dependency. Economy aggregate needs a boundary covering every inventory invalidator plus price recomputation.

## Cooperate
- Project state is written by `findOrCreateProject()` and `contributeToProject()`.
- Participant inventory can be changed by many domains before contribution.
- Relationship state is changed by trade/social/collective/society.
- Home/structure/safety can be changed by development, production and collective completion.
- Spatial/alive predicates are affected by tick, society/lifecycle and spatial/exploration writers.
Conclusion: project revision alone is insufficient; no single authoritative owner currently dominates the complete admission dependency.

## Important bypasses
1. `getOrCreateRelationship()` mutates an observational path by creating a relationship when absent.
2. `getBiomeForRegion()` and spatial helpers can materialize derived region/biome state while evaluating context.
3. `discoverArea()` mutates spatial discovery/visits and agent knownResources from an exploration path.
4. `advanceSocietyDay()` performs broad cross-domain writes: lifecycle, pregnancy/birth, culture, social learning, technology, institutions, governance, specialization, research, economy and settlement state.
5. `advanceWorldDay()` mutates resource quantities and farm food through ecosystem/context-derived modifiers.
6. `tick()` writes spatial visit/known-region state after `performDecision()`.

## Minimality result
The subordinate graph currently contains no demonstrated single mutation boundary that owns the full invalidation set for Resource, Trade or Cooperate. Therefore a composite token is presently only a candidate representation, not a proven minimal protection mechanism.

The defensible choices remain:
A) establish explicit authoritative mutation boundaries for token classes;
B) protect the complete claim-specific transition footprint;
C) use conditional snapshot/commit with complete dependency/provenance capture and final stale rejection.

No choice is being implemented here.

## Status
GREEN: subordinate writers and bypasses concretely identified.
BLUE: exact protected boundary/token ownership/order remains OPEN.

## Exact next
Audit the admission-to-commit temporal window: identify every writer that can occur between dependency capture and final protected commit, then classify whether it must be blocked, version-invalidated, or reconciled. Separately audit mutation-after-commit learning/event writes so they are not mistaken for part of the protected physical transition.

## DO-NOT-REPEAT
No implementation; no global `stateRevision` promotion; no TLC rerun; no AB104.185 primary; no AB105.117R; no runtime concurrency claim.
