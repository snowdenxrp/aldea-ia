# P112 — ACTION-CLASS × WRITER MATRIX V2 — 2026-10-07

## Purpose
Continue P112 from the existing six-class overlap matrix. This version adds concrete writer ownership and the newly confirmed movement/normalization bypasses. Research only.

## Ten findings
1. Resource: admission reads resource quantity/quality, agent needs/skill/tool, territory and random outcome; writes resource + agent state. Invalidators include action handlers, production, world-day, ecosystem and agent-side writers. A resource-only token is insufficient.
2. Trade: admission depends on both participants, inventory, money, price aggregate, proximity and relationship. Trade writes inventories/money/relationship/economy. Inventory writers outside trade and daily economy aggregation can invalidate the admission. Participant-only fencing is insufficient.
3. Cooperate: admission depends on both agents, relationship predicates, project status, combined inventory, home/structure and spatial/alive state. Contribution mutates inventory, project progress/contributions and related social/structure state. A project token alone is insufficient.
4. Exploration: admission depends on position/range, known region, resources, exploration state, knowledge and random selection. moveAgent() is a concrete position writer outside the decision path; normalization can also mutate position/spatial state. Therefore spatial/range protection needs writer coverage beyond tick().
5. Build/Farm: admission combines inventory, tool/skill, fertile land, structures and technology/production predicates. Writers span development, production, world/ecosystem and other agent paths. No single local token dominates this closure.
6. Social/Knowledge: admission depends on relationship, knowledge/confidence, proximity and historical/derived state. recordInteraction() is called from trade, collective and society/family paths, so relationship ownership is distributed.
7. Aggregate dependency: economy price is derived from inventories across all alive agents. A trade commit can have disjoint direct writes from the writer that changes the aggregate it relied on. This is a write-skew class requiring aggregate dependency validation.
8. Predicate/range dependency: exploration, cooperation and social actions can rely on predicates such as distance, alive/home/structure eligibility. A writer that changes the predicate without changing the action's direct object can still invalidate admission. Object-only versions are therefore incomplete.
9. Coordinator distinction: tick() and day-transition functions coordinate many subordinate writers but are not themselves demonstrated semantic version owners. Assigning semantic validity to the coordinator would hide the actual invalidator set.
10. Minimum-boundary result: for each class, the defensible unit is a claim-specific dependency closure: admission reads + transitive authoritative reads + handler reads/writes + aggregate/range/predicate dependencies + every writer capable of invalidating those dependencies. If complete token coverage cannot be demonstrated, the protected footprint must broaden or use conditional snapshot/commit with stale rejection.

## Matrix
| Class | Key invalidator writers | Token status | Minimum defensible boundary |
|---|---|---|---|
| Resource | action, production, world-day, ecosystem, agent | 🔵 incomplete | resource + agent + ecosystem/day dependencies |
| Trade | inventory, trade, economy aggregate, relationship, lifecycle/position | 🔵 incomplete | participants + aggregate + relationship + predicate closure |
| Cooperate | inventory, collective, relationship, structure/home, lifecycle/spatial | 🔵 incomplete | project + participants + resource + relationship + structure |
| Exploration | movement, spatial normalization, world/resource, discovery/knowledge, random | 🔵 incomplete | spatial/range + resource + exploration/knowledge + random evidence |
| Build/Farm | development, production, world/ecosystem, inventory, technology | 🔵 incomplete | land/resource + structure + agent + production/technology |
| Social/Knowledge | relationship, society, learning/culture, memory/knowledge, movement | 🔵 incomplete | participant social state + historical/derived + proximity |

## Important negative result
No class currently has demonstrated complete writer→token coverage. This is not evidence that tokens are impossible; it means the current repository does not justify promoting any existing token to a complete semantic fence.

## Snapshot comparison
Existing applyState() + isolated simulation + persistState(expectedRevision) remains structurally compatible with a broader protected transition. It can reject canonical revision conflicts at final persistence, but that does not by itself prove complete dependency capture, final semantic revalidation, crash atomicity, or durable prepared-intent ordering.

## Status
🟢 Matrix expanded with concrete writer classes and movement/normalization bypass.
🟢 Write-skew/aggregate/range categories identified for all representative classes.
🔵 Complete writer coverage and exact minimum token partition remain OPEN.
🔵 Final canonical revalidation and durable transaction semantics remain OPEN.
🔴 No runtime race/JMM-HB/exactly-once claim.

## Exact next
1. Pick one representative adversarial stale-admission case per class.
2. Enumerate the exact writer that changes each dependency after admission.
3. Determine the smallest token set that would reject that stale commit.
4. If no token set has complete coverage, compare against isolated snapshot + conditional persistState(expectedRevision).
5. Continue only from these six adversarial cases; do not repeat generic token inventory.

## DO-NOT-REPEAT
No implementation, TLC rerun, AB104.185 backfill, AB105.117R, new global stateRevision, or generic version-token audit.