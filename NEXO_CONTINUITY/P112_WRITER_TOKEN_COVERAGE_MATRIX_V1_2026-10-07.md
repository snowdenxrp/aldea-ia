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