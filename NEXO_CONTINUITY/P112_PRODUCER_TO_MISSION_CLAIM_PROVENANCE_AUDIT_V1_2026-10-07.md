# P112 PRODUCER-TO-MISSION CLAIM PROVENANCE AUDIT V1 — 2026-10-07

## Scope
Trace the actual production producer side into buildNexoMission(), with special attention to execute_lumina_action and ordinary repair actions.

## Findings
1. 🟢 Current production assistant squad (src/assistants/squad.js) produces findings for visual, exploration, behavior, routine, ecosystem and society diagnostics.
2. 🔴 Repository-wide source search found no current production producer that emits a finding with code LUMINA_ACTION; concrete LUMINA_ACTION producers found are tests and historical continuity material. Therefore the existing execute_lumina_action bridge is implemented and tested, but its demonstrated producer is currently test-level, not the live assistant pipeline.
3. 🟢 buildNexoMission() correctly maps a LUMINA_ACTION finding into execute_lumina_action and copies finding.action into live step.context.action.
4. 🔴 Because the live production producer path does not currently generate LUMINA_ACTION, the durable mission serialization gap for that path is not currently exercised by the normal assistants.mjs pipeline. This must not be misreported as a production execution finding.
5. 🟢 Ordinary production findings do reach buildNexoMission(). Example classes include MESH_MISSING, NOT_IN_SCENE, HIDDEN, OFFSCREEN, EXPLORER_STALLED, ROUTINE_PHASE_MISSING, NEGATIVE_RESOURCE and SOCIAL_DEPRIVATION.
6. 🔵 For ordinary findings, actionFor() derives the action from the finding code, while target is derived from finding.agent/resource. But recordNexoPlan() does not persist the original finding code, message/reason, source assistant, or evidence. After restart, action/target remain, but the original claim justification is not recoverable from the durable mission record alone.
7. 🔴 Therefore reconstructable action is not equivalent to reconstructable admission claim. A future final validator may re-derive what action corresponds to a target, but cannot automatically prove why that action was admitted, which observation triggered it, or which producer supplied the observation.
8. 🟢 The report pipeline distinguishes observation production from mission integration: specialist assistants return evidence-bearing findings, while buildNexoMission turns findings into executable mission steps. This boundary is a natural provenance boundary.
9. 🔵 Minimum classification from this trace:
   - action/target: often RE-DERIVABLE for ordinary deterministic code mappings, but only relative to the preserved mission step;
   - finding code + source + observation/evidence + triggering message: MUST-PERSIST or otherwise durably bind if they materially justify the protected transition;
   - UI/summary metadata and non-causal report counts: NON-AUTHORITATIVE unless explicitly used by the decision;
   - LUMINA_ACTION payload: MUST-PERSIST if that producer path becomes live, because context.action is the concrete selected operation and is not safely reconstructed from action name alone.
10. 🔵 Existing tests prove the bounded LUMINA_ACTION bridge and action-specific postcondition, but they do not establish a live production producer or durable provenance preservation.
11. 🔴 No implementation, no TLC rerun, no JMM-HB, exactly-once, or power-loss claim.

## Major advance
The audit narrows the problem from mission serialization loses context to two distinct cases:
A) ordinary diagnostic repair: action may be derivable, but admission justification/provenance is lost;
B) LUMINA_ACTION: the concrete action payload itself is not derivable from the persisted mission and the currently demonstrated producer is not in the live assistant pipeline.

## Exact next
Trace report evidence fields and their producers for ordinary finding classes, then determine which evidence is merely explanatory versus claim-critical. In parallel, trace whether any non-assistant production path can create LUMINA_ACTION before treating the bridge as live.
