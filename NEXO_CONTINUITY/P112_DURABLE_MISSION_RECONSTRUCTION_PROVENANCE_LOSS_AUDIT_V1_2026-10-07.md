# P112 DURABLE MISSION RECONSTRUCTION PROVENANCE LOSS AUDIT V1 — 2026-10-07

## Findings
1. The live mission step can contain context, but recordNexoPlan() persists only id, action, target, status and dependsOn for each step. It drops step.reason, source, reversibility, requiresEvidence, requiresVerification and context.
2. Therefore execute_lumina_action loses even its action context when the mission is reconstructed from durable Nexo memory.
3. reconstructNexoMission() rebuilds the mission from the reduced plan and structured-clones only the stored steps; it cannot recover fields that recordNexoPlan() discarded.
4. recordNexoExecution() stores result data and recordNexoOutcome() stores terminal evidence, but neither restores the admission-time dependency/provenance envelope.
5. This is a distinct durability boundary from the previously found live admission→execution gap: even if a future admission stage captured complete provenance in the live mission, the current durable mission serializer would erase it across reconstruction/restart.
6. The existing idempotency/reconstruction protections are useful for mission-step outcome history, but they are not provenance-preserving protected-transition records.
7. The correct interpretation is not to enlarge missions blindly: first determine the minimum claim-specific provenance that must survive restart, then see whether existing evidence/result fields already contain enough information to reconstruct it.
8. No implementation was made; no TLC/JMM/exactly-once/power-loss claim.

## Exact next
Trace the producer-side report/finding fields and the action handler inputs against the durable mission serializer. Identify which admission facts are authoritative, which can be deterministically re-derived from the isolated snapshot, and which must be retained as evidence because re-derivation would not reproduce the original claim.
