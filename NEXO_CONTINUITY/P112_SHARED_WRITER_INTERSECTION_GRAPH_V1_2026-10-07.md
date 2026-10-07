# P112 SHARED-WRITER INTERSECTION GRAPH V1 — 2026-10-07

Research-only. Built from current writer code paths; no concurrency execution claim.

## Representative class × shared writer
| Class | tick / needs+perception+selection | advanceWorldDay/ecosystem | advanceSocietyDay/economy | performDecision/post-effect writers |
|---|---|---|---|---|
| Resource | agent needs, perception, position/range, knowledge/skill/tool, random evidence | resource amount/quality, ecosystem context, farms | population/society-derived predicates where consulted | resource + inventory + needs/activity + learning/events |
| Trade | both-agent state, partner/alive/range, price/decision inputs | environmental/context changes can alter availability if admitted against world state | aggregate inventory → dynamic price; lifecycle/social state | inventory/money + relationship + economy history |
| Cooperate | participant alive/position, relationship, inventory, project predicates | spatial/world context and shared resources | population/social/economic state; project-adjacent predicates | project progress/structure/home + relationships/events/memory |

## Minimum writer implications
1. Resource token cannot be complete unless all resource invalidators are covered, including action writers plus daily world/ecosystem writers. Agent-only token is insufficient.
2. Trade token cannot be participant-only: `advanceEconomyDay()` derives price from inventories of all alive agents. An external inventory writer can therefore invalidate a captured price dependency without touching either trade participant.
3. Cooperate token needs project + participant/resource/spatial dependencies. `contributeToProject()` can change project status and structures, while other writers can change the inputs used by later admission.
4. `tick()` is not one semantic token owner: it is a coordinator invoking multiple domain writers. Treating `tick()` as a single global revision would be a broad serialization shortcut, not evidence of minimality.
5. `performDecision()` is likewise not a single mutation boundary because it dispatches social, knowledge, cooperation, exploration/discovery and ordinary actions, then applies learning/event/skill consequences.

## Important narrowing result
The intersection graph does NOT show that one global stateRevision is necessary. It shows that the protected footprint must dominate the invalidating writers for the specific claim. Composite tokens can reduce the footprint only where every invalidating writer is demonstrably covered by the token's authoritative mutation boundary.

## Current candidate minimums
- Resource: resource state + agent state + spatial/territorial predicate + ecosystem/context + random evidence, with daily resource/ecosystem writers covered.
- Trade: seller/buyer state + price/aggregate economy + partner/range/relationship dependencies, with all inventory writers and daily economy recomputation covered.
- Cooperate: participants + relationship + project incarnation/progress + combined resources + spatial/alive predicates, with all project/resource/social writers covered.

## Status
GREEN: concrete shared-writer intersections identified from current source.
BLUE: exact transaction ordering, token ownership and whether a composite token beats a broader protected footprint remain OPEN.

## Exact next
Trace the shared writers themselves into their subordinate writers and determine whether any proposed token has a single authoritative mutation boundary. If not, mark that dependency as requiring a broader protected footprint or conditional snapshot/commit with complete dependency closure.

## DO-NOT-REPEAT
No token implementation, no global stateRevision promotion, no TLC rerun, no AB104.185 primary, no AB105.117R, no runtime concurrency claim.
