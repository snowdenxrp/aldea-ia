# P112 REPRESENTATIVE ACTION TRACE — RESOURCE / TRADE / COOPERATE — 2026-10-07

## Scope
Research-only continuation of P112. No implementation. No TLC rerun. No AB104.185 primary artifact.

## 1. Resource action — representative gather_wood / catch_fish
Admission inputs: agent position/perception and target resource identity; needs/energy; action knowledge/confidence; skill; tool availability/efficiency; territorial/range predicates; resource amount/quality and ecosystem context; random source/outcome for catch_fish; decision score and selected intent.
Handler boundary: executeAction() dispatches to gatherWood()/catchFish(). Handlers mutate resource amount, agent inventory, energy/activity, tool durability for gathering, and randomness/branching for catch_fish.
Shared invalidators: tick(); advanceWorldDay(); ecosystem updates; advanceSocietyDay(); production/tool helpers; discovery/learning; normalization paths.
Candidate token class: resource incarnation/version + agent dependency state + tool/skill dependency + spatial/range predicate + ecosystem/environment dependency where authoritative + random evidence when outcome-dependent. If complete conditional coverage cannot be guaranteed, use a broader protected footprint rather than a false single-resource token.

## 2. Trade
Admission inputs: seller/buyer identity and alive status; seller inventory; buyer inventory/money; offer type/amount/unit price; price/economy state; proximity/relationship and decision context; relevant knowledge/needs where used by selection.
Handler boundary: executeAction() resolves the partner, then trade() revalidates partner, goods and money; mutates both inventories and money; mutates both relationship records; mutates economy priceMemory and trade history.
Shared invalidators: advanceEconomyDay() computes prices from inventories of all alive agents, so participant-only versions miss the price aggregate. Relationships change through social/collective paths. Inventory changes through physical actions, production and collective contribution. Alive membership changes through society/lifecycle processing.
Candidate token class: participant agent-state revisions + economy aggregate/price revision + relationship revisions + partner identity/incarnation. Sufficient only if every invalidating writer updates/revalidates those tokens; otherwise include economy/relationship predicates or use a broader boundary.

## 3. Cooperate / collective project
Admission inputs: nearby target uses alive-agent set, positions, distance/range and nearest-target ordering; canCooperate uses alive state plus relationship trust/cooperation/tension; findOrCreateProject uses project membership/status, both inventories, home state, combined resource totals, project type/cost and collective normalization.
Handler boundary: contributeToProject() mutates participant inventories; project progress/contributions/status; structures/shelter; home and safety of multiple members; relationship state; events and memory.
Shared invalidators: project eligibility can change through another contribution; inventory changes through many action/production/collective paths; relationship predicates change through trade/social/collective interaction; alive/position/home/structure state changes through daily transitions and other actions; normalization can mutate project state before the visible operation.
Candidate token class: project revision/incarnation + participant agent-state dependencies + relationship revisions + inventory/resource dependencies + structure/home predicate + spatial/range context. Completion crosses multiple domains, so a broader protected footprint may be simpler and safer than fragmented token coordination.

## Cross-class result
1. Resource, trade and cooperate all show the same failure mode: direct WriteSet validation misses admission dependencies invalidated by unrelated writers.
2. stateRevision cannot be promoted to semantic safety merely because it exists in persistence.
3. A useful token must be owned by the authoritative mutation boundary and updated/invalidated by every writer that can change the represented dependency.
4. Predicate/range/aggregate dependencies require explicit representation or a broader transaction footprint.
5. Composite tokens are plausible for narrow domains, but cooperation completion demonstrates a case where a broader protected transition may be simpler than fragmented token coordination.
6. This is a code-path audit, not a runtime concurrency execution and not a final protocol proof.

## Status
🟢 Concrete end-to-end resource/trade/cooperate dependency and writer intersections mapped.
🟢 Candidate token classes constrained by actual writers.
🔵 Exact token ownership/update discipline remains OPEN.
🔵 Composite-token versus broader-footprint optimization remains OPEN.
🔵 Complete dynamic provenance capture remains OPEN.

## Exact next
Audit adversarial stale-admission/write-skew cases for these three classes against the actual writer matrix, then compare: A) composite dependency tokens; B) protected transition serialization over the intersecting footprint; C) conditional snapshot/commit with stale rejection.

## DO-NOT-REPEAT
No implementation. No TLC rerun. No AB104.117R. No AB104.185 primary artifact. Do not claim runtime interleavings were executed. Do not treat PostgreSQL SSI behavior as Nexo proof; it is only a concurrency-model cross-check.