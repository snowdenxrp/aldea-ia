# P112 — ACTION-CLASS OVERLAP MATRIX V1 — 2026-10-07

## Matrix

| Clase | Admission dependencies | Direct protected writes | Concurrent shared writers | Minimum defensible conflict unit |
|---|---|---|---|---|
| Resource | availability/quality; needs/skill/tool; territorial predicates; selected resource identity; random outcome | resource amount + inventory/needs/activity/tool | world/ecosystem regeneration; tick; production | resource incarnation/version + agent versions + predicate/resource token; ecosystem token where needed |
| Trade | both agents alive; partner identity; inventories; money; price/economy; proximity/relationship | both inventories + money/economy/relationship | daily economy aggregation; society relationship/institution paths | participant versions + economy version + partner predicate + aggregate dependency |
| Cooperate | both alive/position; relationship trust/cooperation/tension; project status/participants; combined inventory | inventories + project + shelter/structure + agents + relationships/events/memory | society/settlement/social writers; other contributors | project + participant + inventory + relationship + structure versions; final predicate revalidation |
| Exploration | position/region; resource/range/territorial predicates; exploration state; discovery knowledge; random target | spatial knowledge/visits + exploration + events/memory/knowledge | tick movement; settlement; world/resource changes | spatial/resource observation token + exploration/knowledge versions + random evidence + range/predicate token |
| Build/Farm | inventory; tool/skills; fertile-land quality/amount; structures; technology/production predicates | land + farm/structure + inventory + agent state | world/ecosystem + production + settlement | land/resource + structure + inventory/agent + production/technology dependencies |
| Social/Knowledge | partner identity/distance; relationship; knowledge/confidence; action availability | relationship + knowledge + memory/event state | social learning, culture, specialization, relationship updates | participant relationship/knowledge versions + event/memory generation + proximity predicate |

## Key distinction

A version token is sufficient only when the authoritative dependency is a single versioned boundary covering every writer that can invalidate the claim. Otherwise the gate needs a dependency set, predicate/range token, or broader protected transaction.

stateRevision is not automatically sufficient: it is useful as a conflict token only if every relevant writer participates in the same conditional-commit protocol.

## Strongest narrower-partition candidates

1. Resource actions: resource-specific + agent-local versions, plus ecosystem/day dependency when those paths overlap.
2. Trade: participant + economy aggregate boundary.
3. Cooperation: project + participants + inventories + relationships + structure.
4. Exploration: predicate/range/spatial dependencies dominate.
5. Build/farm: resource + structure + production/technology.
6. Social/knowledge: participant state plus historical/derived social state.

## Posterior AB observation

Search for later AB104 provenance artifacts returned no indexed result in this repository query. No later AB claim is promoted from this search. Existing posterior AB104.600–.602 remain retrospective cross-checks already recorded in P112.

## External cross-check

Serializable systems protect against anomalies caused by read/write dependencies and predicate/range effects; PostgreSQL documents predicate locking for writes that could have affected prior reads. This supports the category of dependency, not Nexo correctness.

## Status

GREEN: matrix established for six representative classes.
GREEN: fixed object-only version rejected as universal solution.
BLUE: exact minimal partition and complete writer coverage remain OPEN.
BLUE: dynamic provenance completeness remains OPEN.

## Exact next

Audit the matrix for write-skew and aggregate-dependency cases, with one adversarial scenario per class where naive object/subsystem versioning would falsely accept an unsafe commit.
