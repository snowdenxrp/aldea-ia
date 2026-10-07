# P112 — WRITER→DEPENDENCY GRAPH V1 — 2026-10-07

Research-only; no implementation.

## Resource
Admission dependencies: resource amount/quality + agent needs/inventory/skill/tool + territorial/range + ecosystem context + random evidence.
Invalidating writers:
- actions.js: drink/eatPlant/catchFish/gatherWood/gatherStone mutate resource and agent state; gather actions may mutate tool durability.
- production.js: tool/farm/harvest paths mutate inventory, land/farm and agent state.
- world.js: advanceWorldDay mutates water/wood/land/plants/fish/clay and farm food.
- ecosystem.js: advanceEcosystemDay derives/mutates biodiversity, soil/water quality.
First common semantic boundary: not a single action handler. Candidate protected footprint must include resource + affected agent state + relevant environment predicates, or prove narrower conditional validation.

## Trade
Admission dependencies: seller/buyer inventory, buyer money, partner identity/alive, dynamic price/aggregate economy, proximity, relationship.
Invalidating writers:
- actions/production/development/collective: inventory.
- economy.trade: inventories, money, relationship, priceMemory/trades.
- advanceEconomyDay: reads all alive-agent inventories and rewrites priceMemory.
- relationships: trust/cooperation/tension/familiarity/history.
- lifecycle/simulation paths: alive/position.
First common semantic boundary: no single trade-local writer dominates all dependencies. Economy aggregate is the strongest shared invalidator; participant-only tokens are insufficient.

## Cooperate
Admission dependencies: participant alive/position, relationship, combined inventory, home, project status/membership, spatial range/order.
Invalidating writers:
- inventory writers across actions/production/development/economy/collective.
- relationship writers via social/economy/collective.
- collective findOrCreate/contribute: project progress/status/membership.
- development/collective completion: structures/home/safety.
- simulation/world/spatial: position/range/region state.
First common semantic boundary: no single collective function dominates all invalidators.

## Cross-class conclusion
The first common boundary is currently broader than the local effect function for all three classes. A global stateRevision would be an unjustified shortcut because its demonstrated writer coverage is incomplete. The defensible next candidate is a claim-specific protected footprint or conditional snapshot/commit whose dependency closure includes every invalidating writer.

## Status
GREEN: writer/dependency edges identified from actual code paths.
BLUE: exact minimum common boundary and token ownership remain open.
No runtime concurrency claim.

## Exact next
Trace the shared writers themselves (tick, day transitions, normalization, social/economic helpers) and determine which protected footprints they must participate in. Then compare whether composite tokens can reduce the footprint without losing writer coverage.

## DO-NOT-REPEAT
No token implementation; no global stateRevision promotion; no TLC rerun; no AB104.185 primary; no AB105.117R.
