# P112 — PROTECTED FOOTPRINT INTERSECTION AUDIT — 2026-10-07

## Scope
Research only. Cross-check later ABs first; no AB104.185 backfill. Repository search for AB104.186+ returned no indexed primary artifacts, so no posterior claim is made from missing results.

## Mutation entry points audited
1. `executeAction()` -> rest/drink/eat/catch/gather/build/craft/farm/harvest/eat-farm/commons/trade.
2. `performSocialInteraction()` -> both agents' relationships + social needs + events + memory.
3. `performKnowledgeSharing()` -> knowledge/relationships/memory/event state.
4. `performCollectiveCooperation()` / collective project contribution -> inventories, project progress/status, structures, multiple agents, relationships, events, memory.
5. `discoverArea()` / exploration branches -> spatial discovery, region visits, exploration state, random scheduling, events, memory.
6. `discoverAction()` / discovery branches -> action knowledge/belief state.
7. Post-action learning in `performDecision()` -> skills, discoveries, events, memory, beliefs, failure counters.

## Shared-writer intersections
`tick()` is a broad shared writer. `advanceWorldDay()` mutates climate/ecosystem/resources/farm food. `advanceSocietyDay()` mutates lifecycle, culture, technology, institutions, governance, specialization, research, economy and settlement state. Therefore a resource/action footprint can overlap with daily writers even when the action's direct WriteSet looks small.

Concrete examples:
- `drink`: world water + agent thirst; daily world regeneration also writes water.
- `catch_fish`: fish + inventory + energy; daily ecosystem/fish regeneration writes fish.
- `gather_wood`: wood + inventory + energy/tool; weather/regeneration/ecosystem paths write wood/ecosystem-related state.
- `farm`: land/structure/agent state; daily farm food and land/ecosystem writers overlap.
- `trade`: agent inventories plus economy state; daily economy aggregates inventories into price state.
- collective shelter: multiple inventories + collective project + structure + multiple agents + relationships/events; society/settlement paths can touch overlapping structures/social state.

## Important result
The smallest protected unit is not simply an action's direct WriteSet. It must account for:
`Admission ReadSet + transitive dependency closure + handler ReadSet + predicate/range/aggregate dependencies + protected WriteSet + concurrent shared writers`.

A global `stateRevision` can detect some conflict only if every relevant mutation participates in the same conditional-commit protocol; it does not by itself identify which semantic dependency caused the conflict or prove that all writers are covered.

This aligns with the external concurrency principle: serializable systems track read/write dependencies and predicate/range effects, not just final written objects. PostgreSQL's SERIALIZABLE mode can reject a transaction when concurrent read/write patterns could not correspond to serial execution, and predicate locking exists specifically to detect writes that would have affected prior reads. This is a conceptual cross-check, not proof of Nexo semantics.

## Status
🟢 Direct mutation entry points mapped.
🟢 Concrete overlaps with world/day/society writers found.
🟢 Action-only WriteSet is insufficient.
🔵 Exact minimal transition partition remains OPEN.
🔵 Coverage of every mutation bypass remains OPEN.

## Exact next
Build the overlap matrix per representative action class: resource, trade, cooperate, exploration, build/farm, social/knowledge. Identify whether each conflict can be rejected by object version, subsystem version, dependency predicate/range token, or requires a broader transaction footprint.

## DO-NOT-REPEAT
No implementation. No TLC rerun. No AB104.185 primary artifact. No claim that missing later ABs were inspected successfully beyond the explicit repository search result.
