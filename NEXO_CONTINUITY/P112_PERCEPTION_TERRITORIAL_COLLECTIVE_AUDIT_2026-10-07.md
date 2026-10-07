# P112 CONTINUITY — PERCEPTION / DECISION / TERRITORIAL / COLLECTIVE AUDIT — 2026-10-07

## Scope
Audited actual source paths: perception.js, decision.js, territorial.js, collective.js, plus their call/use context in simulation.js.

## Findings
### perceiveWorld()
Reads agent position/alive state; every other agent position/alive state for visibleAgents; world resource positions and perception/radius bounds; current activity and needs.
Visible-agent membership is a predicate over the agent set and positions. A protected admission depending on visibleAgents cannot validate only the selected partner ID.

### createDecisionContext()/evaluateOptions()
Reads needs, perception, knowledge, relationships, memories, recent action/result, specialization and skills. Scoring also reads derived need/energy pressure, specialization bonus, territorial bonus, knowledge/memory values, relationship bonus, exploration novelty and recent-action state.
chooseOption introduces randomness after evaluation. Any protected claim about deterministic admission/result must bind random source/seed/consumption or treat the choice as nondeterministic evidence.

### Territorial context
getTerritorialContext reads agent position, spatial region, biome/modifiers, all world resources within 30 units, resource quality/amount, and region settlementLevel/visits.
It calls normalizeSpatialWorld(). Because context extraction can invoke a normalization routine, this is a concrete hidden mutation-capable path; it must not be treated as read-only until normalization semantics are classified.
Territorial opportunities are derived predicates over resource type, distance, quality, amount and biome modifiers. Versioning only the selected resource is insufficient.

### Collective/cooperation
canCooperate reads alive state and the relationship edge between two agents.
getNearbyCooperationTarget reads the alive-agent set and positions, applying a distance predicate.
findOrCreateProject reads/writes collectiveProjects and reads both participants' inventories/home state.
contributeToProject mutates inventories, project progress/contributions/status, structures, participant home/safety/project links, relationships, events and memory.
Collective admission therefore depends on relationship versions, participant liveness/identity, positions, inventories, project membership/status/progress, and broader project/structure state when completion is possible.

## Cross-cutting result
Dependency surface is broader than final handler WriteSet in all four paths. Predicate membership (nearby agents/resources, active projects) and derived values (territorial opportunities, score, exploration pressure) are claim-relevant dependencies.
normalizeSpatialWorld() is a concrete hidden-write concern.

## Security/concurrency interpretation
Current PostgreSQL Serializable documentation describes monitoring read/write patterns and predicate locking for reads whose result can be invalidated by concurrent writes. This independently supports the research distinction between final WriteSet and claim-relevant read/predicate dependencies.

## Status
🟢 Concrete perception/decision/territorial/collective dependencies mapped.
🟢 Predicate membership and derived-score dependencies confirmed.
🟢 Hidden mutation-capable normalization path identified.
🔵 Complete dependency instrumentation/coverage UNKNOWN.
🔵 Exact minimal version granularity OPEN.
🔵 Action-class envelope OPEN.

## DO-NOT-REPEAT
No implementation. No VersionSet capture yet. No TLC rerun. No AB104.185 backfill. No claim that stateRevision/final persistence lock protects these in-memory decision reads.

## Exact next
Audit helper graph behind specializationBonus, territorialActionBonus, exploration/relationship/memory/discovery helpers, and decision-time random/external observation paths; then compare those dependencies against Nexo effect/recovery admission.