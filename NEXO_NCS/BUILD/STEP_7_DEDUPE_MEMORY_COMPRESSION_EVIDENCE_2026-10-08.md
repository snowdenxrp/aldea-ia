# NEXO NCS — STEP 7 DEDUPE / MEMORY COMPRESSION EVIDENCE — 2026-10-08

## Status
EVIDENCE CLOSED — no legacy integration.

## MASTER
Observation provenance must survive planning/compression; action+target is not sufficient equivalence; omitted candidates are not failed/resolved; no invented observation identity or compatibility mechanism.

## AB
Historical evidence establishes that WriteSet-only/action-level equivalence can hide causal distinctions and that admission is distinct from commit/effect.

## P/P112 + repository evidence
- `buildNexoMission()` deduplicates using `action|target|finding.action.name`.
- The dedupe key omits finding code, producer/source, causal inputs, freshness, derived provenance and explanatory evidence.
- Therefore demonstrably distinct observations can collide under the legacy key.
- `steps.slice(0,8)` is a bounded admission boundary, but its semantics are already closed: NOT_ADMITTED is not FAILED/RESOLVED/COMMITTED/RETRIED. Do not reopen that question.
- `recordNexoPlan()` persists mission/step action/target/status/dependencies but drops original finding code, source, reason/message and evidence.
- `fingerprintFinding()` compresses learning memory to severity/code/message, which is not a claim-specific observation identity or equivalence proof.
- Current repository evidence does not establish a durable observation identity.

## NCS conclusion
The remaining STEP 7 construction issue is not the meaning of the 8-step bound. It is the loss-preserving handoff from observation to candidate before any legacy compression.

Required next construction surface:
ObservationEnvelope -> candidate equivalence/admission decision -> admitted candidate graph.

Legacy `buildNexoMission()` and `recordNexoPlan()` remain evidence only until a new Core contract defines how provenance-preserving candidates are selected and represented.

## Explicit limits
No new observation ID, queue, retry, tombstone, transaction wrapper, or compatibility layer is introduced. No legacy function is modified by this evidence step.

## Next exact action
Define and test the smallest claim-specific equivalence/admission predicate that can operate on existing ObservationEnvelope data without inventing identity. If existing producer data is insufficient for a particular finding class, preserve UNKNOWN/INVALID according to the existing claim-specific contract rather than guessing.
