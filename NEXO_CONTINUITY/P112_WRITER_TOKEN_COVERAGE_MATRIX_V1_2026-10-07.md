# P112 — WRITER→TOKEN COVERAGE MATRIX V1 — 2026-10-07

A = existing token with demonstrated complete writer coverage. B = existing token exists but writer coverage is incomplete. C = no demonstrated token/dependency representation.

| Dependency | Main invalidating writers | Existing token | Class | Gap |
|---|---|---|---|---|
| Resource quantity/quality | actions, world daily, ecosystem | none demonstrated | C | shared resource + daily writers |
| Agent inventory | actions, trade, development, production, collective | none demonstrated | C | many mutation owners |
| Agent needs | actions, collective, development, production, tick | none demonstrated | C | broad shared writers |
| Relationship | social/economy/collective helpers | none | C | get/create + mutation bypass |
| Economy aggregate/price | trade + advanceEconomyDay | none | C | aggregate dependency |
| Collective project | collective creation/contribution | none | C | project predicate/incarnation |
| Spatial/range | discovery + world normalization + world/day | spatial.version/regionVersion | B | writer discipline/conditional validation incomplete |
| Structures/land | development/production/world daily | none | C | cross-domain predicate |
| Knowledge/discovery | learning/discovery/social/research | none | C | future admission can change |
| Memory | remember/trim/replay paths | none | C | selection depends on retained memories |
| Technology/culture/specialization | society/social learning/research | none | C | cross-agent writers |
| Institutions/commons | institution daily + commons actions | none | C | depends on multiple aggregates |

## Critical conclusion
The audit does NOT support choosing a single global stateRevision as the semantic safety token. stateRevision belongs to persistence conflict control and does not demonstrate coverage of in-memory concurrent mutation or every semantic invalidator.

The only existing candidate with partial semantic meaning is spatial versioning, but its writer/commit discipline is incomplete.

Therefore the smallest defensible design target remains a claim-specific protected transition footprint: dependency closure + invalidating writers + conditional final validation.

## External cross-check
PostgreSQL's serializable model tracks read/write dependencies and predicate effects because final writes alone do not identify all serialization conflicts. This is conceptual corroboration only, not Nexo evidence.

## Status
GREEN: matrix completed for audited domains.
BLUE: exact token granularity/ownership remains OPEN.
No implementation, no TLC rerun, no AB104.185 primary.

## Exact next
For each C domain, trace the narrowest authoritative mutation boundary and ask whether one token can cover all invalidating writers. If not, define the dependency token class (object, aggregate, predicate/range, incarnation, or broader protected footprint) without implementing it.

## Narrowest authoritative mutation-boundary trace — resource / trade / cooperate

### Resource
- Physical resource mutation is concentrated in action handlers (drink, eatPlant, catchFish, gatherWood, gatherStone) plus daily advanceWorldDay() and its advanceEcosystemDay() dependency.
- Agent-side consequences are separate writers: inventory and needs change in the same handlers; tool durability can also change through useTool.
- Therefore a single resourceRevision alone is insufficient for admission: it must be paired with agent-state/tool dependencies, or the protected footprint must cover them.
- No current authoritative mutation funnel updates a semantic resource token across all these writers.

### Trade
- trade() is one physical transfer boundary for a completed trade, but its admission dependencies are not owned there: generateTradeOptions() reads partner inventory, buyer money, dynamic price, proximity and relationship context.
- Inventory can be invalidated outside trade by actions, production, development and collective contribution.
- Price can be invalidated by advanceEconomyDay(), whose aggregate input is inventory across all alive agents.
- Relationship can be invalidated by social/economic/collective paths.
- Therefore no single trade-local token is sufficient. A protected trade transition needs participant/resource dependencies plus economy aggregate/price and relationship dependencies, unless a broader protected boundary encompasses those writers.

### Cooperate
- findOrCreateProject() is a project admission/creation boundary, but project validity depends on both participants' inventories, homes, alive state and relationship; spatial proximity is selected upstream.
- contributeToProject() mutates participant inventory, project progress/status, structures, homes/safety, relationships, events and memory.
- These domains have independent writers outside the collective module.
- Therefore a project revision/incarnation alone cannot protect cooperation admission. The protected footprint must include the participant/project/resource predicates or a broader common transaction boundary.

### New conclusion
The narrowest single-function mutation boundary is not equivalent to the narrowest semantic protected boundary. Each candidate function has external invalidators. A token is only useful if its authoritative mutation boundary covers every writer that can invalidate the claim before final commit. This is consistent with serializable concurrency systems where read/predicate dependencies matter in addition to final writes. 

### Exact next
Trace the remaining invalidators into a writer→dependency graph and identify the first common boundary that actually dominates all writers for each class. If no common boundary exists, record the minimum multi-domain protected footprint rather than inventing a token.
