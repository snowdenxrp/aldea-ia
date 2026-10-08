# P112 ACTION MUTATION IRREVERSIBILITY / SNAPSHOT-CANDIDATE AUDIT V1 — 2026-10-07

## Scope
Research-only audit of the concrete Lumina action handlers reached by `executeLuminaNexoStep()`, to distinguish local candidate-state mutation from irreversible/external effects and refine the protected-transition boundary.

## Source basis
Inspected at ref `4d6c48da51680ef24a700924bd768ad67d3b45dc`:
- `src/actions.js`
- `src/development.js`
- `src/production.js`
- `src/economy.js`
- `src/institutions.js`
- `src/collective.js`
- `src/exploration.js`
- `src/relationships.js`
- `src/memory.js`
- `src/spatial.js`
- `src/nexo/orchestrator.js`
- `src/nexo/runtime.js`
- `src/nexo/simulation-adapter.js`
- `src/nexo/effect-adapter.js`

## Findings
1. 🟢 The concrete Lumina handlers inspected perform their effects by mutating the supplied `simulation`, `world`, `agent`, relationships, events, knowledge and memory objects. No explicit network, filesystem, remote-provider, payment, or device I/O was found in these handler paths.
2. 🟢 Therefore the current Lumina action effect is structurally a **local candidate-state transition** when the caller supplies an isolated simulation snapshot. The physical mutation itself is not an external irreversible effect in the inspected code.
3. 🔴 This does NOT make live-object execution safe: if the supplied simulation is canonical/live, the handler mutates canonical objects before `persistState(expectedRevision)` can reject a stale revision.
4. 🟢 `rest`, `drink`, `eat_plant`, `eat_fish`, `catch_fish`, `gather_wood`, `gather_stone`, and `eat_farm_food` directly change agent needs/inventory and/or world resources. These are snapshot-local candidate mutations.
5. 🟢 `catch_fish` consumes randomness through `getRandom(simulation)`; the random draw affects whether the protected result occurs. Random evidence therefore remains an admission/provenance dependency even though the mutation itself is local.
6. 🟢 `gather_wood` / `gather_stone` read skill + tool state and mutate resource, inventory, energy and tool durability. A resource-only token cannot protect their complete admission/result semantics.
7. 🟢 `build_shelter`, `craft_tool`, `farm`, and `harvest` cross agent inventory plus structures/resources/technology or crop state. Their mutations remain local to the supplied snapshot, but their protected footprint is multi-domain.
8. 🟢 `trade` mutates both participants, money, inventories, relationships, economy priceMemory and trade history. It has no external payment side effect in the inspected implementation, so it can remain candidate-state under snapshot execution; its dependency footprint is nevertheless aggregate/relational.
9. 🟢 Institution actions mutate agent inventory, commons, contribution/withdrawal history and hunger/activity. Institution membership/norms/commons state are part of the protected local footprint.
10. 🟢 Collective cooperation mutates project creation/progress/completion, inventories, structures, participant homes/safety, relationships, events and memories. Project-only protection is insufficient; whole candidate snapshot naturally contains these local writes.
11. 🟢 Exploration/discovery mutates spatial regions, known regions, discovered areas, agent knownResources/exploredAreas, events and memory. `normalizeSpatialWorld()` is mutation-capable on this path, so even seemingly observational spatial helpers must be treated as candidate-state readers/writers.
12. 🟢 Social/knowledge paths inspected in the simulation call graph also mutate relationships, social needs, events and memories, and use randomness. They are outside the narrow `executeAction()` dispatcher but remain local snapshot transitions.
13. 🔵 Current action handlers do not themselves establish a durable PREPARED checkpoint before mutation. For these purely local candidate transitions, that checkpoint is not the same requirement as an external-effect outbox; the more immediate safety requirement is isolation from canonical state plus conditional commit.
14. 🔵 The generic effect adapter still correctly treats handler exceptions as UNKNOWN because the abstraction permits effects whose occurrence cannot be inferred from an exception. That generic safety rule should not be weakened merely because current Lumina handlers appear local.
15. 🔵 If a future handler adds external I/O, provider/device calls, filesystem mutation, irreversible physical action, or another side effect outside the isolated snapshot, it leaves this local-candidate class and requires explicit effect identity, durable intent, outcome evidence and reconciliation.
16. 🟢 The strongest current boundary for the inspected Lumina implementation is therefore: **isolated candidate mutation → final semantic validation → existing `persistState(expectedRevision)`**, with external-effect handling remaining a separate protocol for future/non-local handlers.
17. 🔵 Final semantic validation must still account for random evidence, dynamic helper reads, aggregate/predicate dependencies, authority context, incarnation/fence/STOP, policy/config/logic and expectedRevision; local mutation does not remove those dependencies.
18. 🔴 No conclusion here about JMM happens-before, exactly-once, or power-loss durability.

## Action-class classification
| Class | Current inspected effect | Candidate snapshot? | External-effect protocol now required? |
|---|---|---:|---:|
| Basic resource/need actions | local world/agent mutation | 🟢 Yes | 🔵 No, unless handler later gains external I/O |
| Build/Farm/Production | local multi-domain mutation | 🟢 Yes | 🔵 No, same condition |
| Trade | local inventory/money/relationship/economy mutation | 🟢 Yes | 🔵 No external payment found |
| Institution | local commons/member mutation | 🟢 Yes | 🔵 No |
| Collective | local project/structure/relationship/event/memory mutation | 🟢 Yes | 🔵 No |
| Exploration/Discovery | local spatial/discovery/knowledge/memory mutation + randomness | 🟢 Yes | 🔵 No |
| Social/Knowledge | local relationship/knowledge/memory/event mutation + randomness | 🟢 Yes | 🔵 No |
| Future external/provider/device effect | not present in inspected handlers | ❓ | 🟠 Yes |

## Consequence for P112
The previous question “which current Lumina handler is irreversible/external?” narrows substantially: **none of the inspected concrete handlers demonstrated an external side effect.** The current protected-transition failure is primarily a snapshot-isolation/final-validation/conditional-commit problem, not an already-proven external-side-effect transaction problem.

This does not close P112 because complete dependency capture, final semantic validation, canonical writer participation, cross-artifact memory, effect-journal durability/eviction and reconciliation semantics remain open.

## Exact next
Audit the caller-level lifecycle around `applyState()` / `persistState(expectedRevision)` and determine whether a future protected owner can execute the entire local candidate transition on a cloned simulation without any hidden live references, then atomically classify the resulting world-state conflict as stale candidate versus effect uncertainty. Separately preserve the external-effect protocol as a future extension rather than imposing it on current local Lumina handlers.

## DO-NOT-REPEAT
No implementation.
No TLC rerun.
No AB104.185 backfill.
No AB105.117R.
No JMM-HB/exactly-once/power-loss claims.
No claim that PREPARED proves NOT_ATTEMPTED.
