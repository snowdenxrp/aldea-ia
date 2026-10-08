# P112 — AUTHORITATIVE MUTATION-BOUNDARY TRACE V2 — 2026-10-07

## Scope
Research-only continuation from the protected P112 line.
This audit does NOT repeat the existing-version-token audit. It traces actual mutation ownership/bypasses to determine whether any existing version-like field can honestly dominate all invalidating writers without inventing a global revision.

## Evidence basis
Inspected current repository code paths including:
- src/world.js
- src/ecosystem.js
- src/economy.js
- src/relationships.js
- src/collective.js
- src/simulation.js
- src/movement.js
- src/development.js / institutions.js where inventory mutation bypasses are visible
- existing P112 writer/dependency/ownership artifacts as cross-checks.

## Ten bounded findings

### 1. Resource/day boundary is distributed
advanceWorldDay(targetWorld) directly mutates climate, ecosystem-derived state and multiple resource quantities; it also invokes advanceEcosystemDay(), which derives ecosystem pressure/quality from resource ratios and then mutates ecosystem state.
Therefore resource validity is not owned by an action handler alone.
Status: 🟢 concrete code evidence.

### 2. Ecosystem is a transitive resource invalidator
advanceEcosystemDay() reads wild_plants, fish, water, stone, farms and fertile-land quality, then mutates biodiversity, waterQuality and soilQuality. ecosystemModifiers() subsequently turns those values into regeneration/yield modifiers.
Thus an apparently resource-local claim can depend transitively on ecosystem state and vice versa.
Status: 🟢 confirmed dependency cycle at code-path level.

### 3. Economy aggregate has a broad authoritative writer
advanceEconomyDay() scans inventories of every alive agent, computes aggregate stock/per-capita scarcity, and rewrites priceMemory.
Therefore a trade admission depending on price cannot be fenced by seller/buyer state alone; every inventory/alive writer that can alter the aggregate is semantically relevant.
Status: 🟢 confirmed.

### 4. Relationship state has a direct cross-domain mutation owner
recordInteraction() creates missing relationships and mutates familiarity, trust, cooperation, tension, affection, resentment and history. It is called from economy/trade, collective paths and society/family paths.
Therefore relationship validity cannot be owned by the trade or cooperation handler.
Status: 🟢 confirmed bypass.

### 5. Inventory has multiple physical mutation owners, including a direct institutional path
Inventory is mutated by actions, trade, development/production/collective helpers, and institution commons contribution. consumeInventory() is not itself a universal semantic fence because institution code also mutates inventory directly.
Therefore a token attached to one helper or one action class would miss invalidators.
Status: 🟢 confirmed; 🔵 exhaustive repository-wide mutation coverage remains open.

### 6. Position/range has an additional writer outside the decision/action path
moveAgent() directly mutates agent position. It is called from scripts/simulate.mjs, src/main.js, and src/main-stable.js, not only from the tick() decision flow.
This is a material spatial/range bypass: a protected claim based on distance/territory cannot assume tick() owns every position mutation.
Status: 🟢 new concrete bypass identified.

### 7. Normalization can mutate spatial state while appearing observational
Current main-path normalization clamps/initializes agent positions and related fields. Existing P112 evidence also shows normalizeSpatialWorld() and related context helpers can mutate/materialize state.
Therefore observation/context extraction cannot automatically be treated as read-only.
Status: 🟢 mutation-capable observation path confirmed; exact protected-runtime coverage remains 🔵 OPEN.

### 8. Collective mutation crosses participant, resource, project and structure domains
findOrCreateProject() reads participant alive/home/inventory predicates and creates project state. contributeToProject() mutates inventory, project progress/contributions, structures/home/safety, relationships, events and memory.
Therefore a project-local token cannot dominate the complete admission/write footprint.
Status: 🟢 confirmed.

### 9. Day transition is a coordinator, not a demonstrated semantic token owner
tick() advances time and invokes world/society transitions, but the actual invalidating state is mutated by subordinate domain functions. Treating tick() or stateRevision as the semantic owner would conflate coordination/persistence conflict detection with domain validity.
Status: 🟢 architectural distinction confirmed; 🔵 exact protected exclusion/order remains OPEN.

### 10. No existing version-like field currently dominates the complete invalidator closure
Spatial version/regionVersion exist but lack demonstrated complete writer coverage; canonical stateRevision is a persistence conflict token; no generic relationship/resource/agent/economy/collective semantic revision is demonstrated.
The traced bypasses mean no existing field can presently be promoted to a complete semantic fence without additional coverage or a broader protected footprint.
Status: 🟢 negative result supported by current code; 🔵 exact minimum composite partition remains OPEN.

## New synthesis
The search did not reveal a hidden single mutation funnel. Instead, semantic dependencies cross:
resource ↔ ecosystem ↔ daily world,
inventory ↔ economy aggregate,
relationships ↔ trade/collective/society,
position ↔ movement/tick/spatial normalization,
collective project ↔ inventory/relationships/structures/memory.

The important boundary is therefore not “the function that performs the final write.” It is the smallest protected transition that dominates all authoritative invalidators of the claim being protected.

This strengthens the current P112 direction:
claim-specific DependencySet + ReadSet/WriteSet + predicate/range/aggregate dependencies + provenance/version/incarnation evidence + final conditional validation/commit.

## What is CLOSED vs OPEN

### 🟢 CLOSED
- Concrete distributed mutation ownership exists.
- Additional position/movement bypass is confirmed.
- Existing local function boundaries are insufficient as semantic fences.
- No current existing token has demonstrated complete coverage for representative classes.

### 🔵 OPEN
- Exhaustive mutation coverage for every future/current writer.
- Whether a composite dependency-token scheme can cover the closure without excessive footprint.
- Exact minimum protected exclusion set if tokens are incomplete.
- Final revalidation semantics for each claim class.
- Whether snapshot/conditional commit can be the practical boundary after all bypasses are included.

### 🔴 NOT CLAIMED
- No runtime race proof.
- No JMM happens-before claim.
- No exactly-once claim.
- No atomic power-loss durability claim.
- No implementation authorization.

## Exact next
1. Build the representative-class × writer matrix using the newly confirmed movement/position bypass.
2. For each class, mark whether a candidate token can dominate every writer or whether the protected footprint must expand.
3. Trace the remaining spatial writers and all direct inventory/relationship/economy mutation sites not yet exhaustively enumerated.
4. Compare the minimum composite-token closure against the existing isolated-snapshot + persistState(expectedRevision) path.
5. Only after that decide whether the protected boundary can be narrowed.

## DO-NOT-REPEAT
No new global stateRevision.
No implementation.
No TLC rerun.
No AB104.185 primary artifact/backfill.
No AB105.117R.
Do not repeat the earlier generic version-token audit or generic persistence-primitive audit.
Do not treat temporal ordering as JMM happens-before.
