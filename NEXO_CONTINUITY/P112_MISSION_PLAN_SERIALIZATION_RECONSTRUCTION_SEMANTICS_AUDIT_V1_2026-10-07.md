# P112 MISSION PLAN SERIALIZATION / RECONSTRUCTION SEMANTICS AUDIT V1 — 2026-10-07

## Reconciliation
The prior finding is confirmed against current source, with one important nuance: runtime.js now calls recordNexoPlan() during commitRuntimeOutcome(), so durable mission lineage itself is not absent. The gap is specifically field preservation, not mission existence.

## Findings
1. buildNexoMission() creates rich live step data: priority, reason, source, target, reversibility, requiresEvidence, requiresVerification, dependsOn, status, and for execute_lumina_action a context.action object.
2. recordNexoPlan() reduces each step to id/action/target/status/dependsOn. It discards the richer admission/execution context when creating the durable mission record.
3. runtime.js records the current mission again at commitRuntimeOutcome(), but this does not repair the loss because recordNexoPlan() applies the same lossy projection.
4. reconstructNexoMission() restores terminal status/evidence from attempts, but cannot reconstruct discarded reason/source/context/reversibility/verification requirements from the durable plan.
5. For a future protected transition, missionId:stepId plus terminal evidence is insufficient to prove that a reconstructed step is the same claim context that was admitted. This is especially relevant for execute_lumina_action because its action payload lives in context.action and is not persisted by the mission serializer.
6. Existing durable outcome evidence can still establish that an attempt completed according to its stored verification contract; this audit does not invalidate existing replay/reconstruction protections.
7. The minimum durable requirement should not automatically be to persist the entire live mission. The correct question is which admission facts are non-reconstructible from the canonical isolated snapshot and therefore must survive as bound evidence.
8. No implementation, TLC rerun, JMM-HB, exactly-once or power-loss claim.

## Exact next
Trace concrete report findings into buildNexoMission() for execute_lumina_action and at least one ordinary repair action. Classify each claim input as RE-DERIVABLE from canonical snapshot, MUST-PERSIST as evidence/provenance, or NON-AUTHORITATIVE/informational.
