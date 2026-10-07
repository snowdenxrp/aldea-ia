# P112 — MUTATION OWNERSHIP / VERSION BYPASS AUDIT — 2026-10-07

## Resource domain
No per-resource revision/incarnation is demonstrated.

Protected resource mutations occur through:
- actions.js: drink, eatPlant, catchFish, gatherWood, gatherStone;
- production.js: farm;
- world.js: advanceWorldDay regeneration/weather effects;
- ecosystem.js: advanceEcosystemDay and related normalization/update paths.

Therefore a resource token would need coverage across both action-time and day-transition writers. A token attached only to action handlers would miss daily invalidation.

## Agent inventory / needs domain
No generic agent revision is demonstrated.

Inventory is mutated by:
- actions.js resource collection/eating;
- economy.js trade;
- development.js consumeInventory/build;
- production.js consume/craft/farm/harvest/useTool;
- collective.js consumeInventory/contribution.

Needs are mutated by:
- actions.js physical actions;
- collective.js completion safety;
- development.js shelter safety;
- production.js farm safety;
- simulation/needs processing during tick.

A single inventory-local token would not cover needs, and an agent-wide token must have every writer participate or it becomes an incomplete dependency token.

## Relationship domain
No relationship revision is demonstrated.

recordInteraction() can create a relationship and mutate familiarity/trust/cooperation/tension/affection/resentment/history. It is called by economy and collective paths and by other social paths. This is a direct bypass candidate for any token updated only by a protected executor.

## Economy aggregate
No aggregate revision is demonstrated.

advanceEconomyDay() computes prices from all alive-agent inventories. trade() also mutates priceMemory/trades. Therefore a participant-only version cannot validate a price dependency whose value depends on the global alive-agent inventory aggregate.

## Collective project
No project revision/incarnation is demonstrated.

findOrCreateProject() checks participant membership, combined inventories and homes, then creates project state. contributeToProject() mutates project progress/contributions, agent inventory, structures, member homes/safety, relationships, events and memory. This is a multi-object write set with project predicates; no existing token closes that footprint.

## Spatial / range / predicate
world.spatial.version and regionVersion exist, but the audited spatial module does not show a complete writer discipline that advances them whenever relevant predicates change. Position changes, resource positions/radii, region discovery/settlement state and active-region calculations therefore cannot yet be assumed covered.

## Key bypass result
The same semantic dependency can be invalidated from different execution paths:
action handler, daily world/society writer, social/economic helper, or normalization/discovery helper.

Therefore token ownership must be assigned to the authoritative mutation boundary, not merely to whichever helper currently performs the most visible mutation.

## Status
GREEN: concrete writer coverage/bypasses identified.
BLUE: exact final token ownership remains OPEN.
BLUE: minimal version partition remains OPEN.
No implementation performed.

## Exact next
Continue with remaining shared domains: structures/land/production, knowledge/discovery/memory, technology/institutions, then construct a writer-to-token coverage matrix and identify any writer that would escape each candidate token.
