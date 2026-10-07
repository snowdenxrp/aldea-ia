# P112 ACTION-CLASS ENVELOPES v1 — 2026-10-07

## Why posterior ABs were checked
Later retrospective research after the historical AB104.151 frontier was used only as cross-check, not as a replacement for missing primary AB104 artifacts. The later line AB104.152 onward reinforces the same boundary: effect outcome ambiguity, resource/control incarnation, protected transition scope, mutation overlap, and stateRevision are distinct concerns. No historical AB104.185 primary artifact is created or backfilled.

## Envelope A — resource action: gather_wood
Admission/decision dependencies include perception, known action/confidence, knowledge/memory scoring, territorial opportunity, specialization/skills, needs and recent-action state. The physical handler additionally reads wood amount, gather skill, tool selection/tool efficiency and randomness is not used here; it writes world wood, agent inventory, energy, activity and tool state.
The authoritative conflict footprint therefore includes both decision-time reads and handler-time reads, not only world.resources.wood.

## Envelope B — resource action: catch_fish
Admission depends on perception/knowledge/memory/territorial context and action confidence. Handler reads fish amount, catch skill and simulation random source; it writes fish amount, inventory, energy/activity. Because the success branch depends on randomness, admission/result provenance must account for the random draw or treat the result as nondeterministic evidence.

## Envelope C — trade
Decision-time trade options read visible partner membership, partner inventory, agent inventory, both money balances, dynamic price state, hunger and proximity. Handler resolves the partner again by current alive identity and calls trade with offer type/amount/unit price. The dependency footprint therefore spans at least both agent identities/liveness, inventories, money, price state, hunger/proximity and trade/economy state. A partner-ID-only check is insufficient.

## Envelope D — cooperate
Admission reads visible-agent predicate, relationship trust/cooperation/tension, partner liveness, both inventories, homes and collective-project membership/status. Execution can create/find a project or contribute, mutating project progress, inventories, structures, participant home/safety links, relationships, events and memory. Completion has a larger write/dependency closure than simple cooperation admission.

## Envelope E — exploration
Admission reads position, spatial region/visits, nearby resources and novelty/knowledge/memory. discoverArea then mutates spatial discovery, exploration records and agent knownResources. The read and write footprints cross spatial, resource and knowledge domains.

## Envelope F — build/farm family
Existing development/production predicates read inventories, homes/structures, technology and fertile-land state. The eventual handlers mutate structures, inventory/land and agent state. These predicates must remain part of the protected admission dependency closure; checking only the final structure write is unsound.

## Main result
No fixed object-only version is sufficient for these representative classes. The smallest defensible unit remains a protected transition footprint containing authoritative admission reads, handler reads/writes, predicate/range/aggregate dependencies, derived provenance, relevant versions/incarnations and conditional validation/commit.

## Status
GREEN: representative action-class envelopes established from actual code.
GREEN: posterior research is consistent with this direction, but is not promoted to historical primary evidence.
BLUE: complete executable dependency instrumentation UNKNOWN.
BLUE: exact practical partition/version granularity OPEN.

## DO-NOT-REPEAT
Do not implement capture yet. Do not use stateRevision as a complete mutation fence. Do not rerun TLC. Do not create AB104.185 primary. Do not claim exactly-once external effect.

## Exact next
Complete the envelope for the decision/admission chain itself: perception -> options -> scoring -> selection -> execution, then identify which dependencies must be revalidated at the final protected transition and which are merely observational/non-authoritative.