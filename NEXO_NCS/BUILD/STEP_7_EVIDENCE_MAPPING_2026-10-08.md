# NEXO NCS — STEP 7 EVIDENCE MAPPING
Date: 2026-10-08
Status: DESIGN EVIDENCE CLOSED — implementation not started

## Purpose
Recover existing observation/run/sample identity and map the current production finding -> mission boundary to the protected ClaimEnvelope without inventing identity or persistence machinery.

## Recovered identity evidence

Repository-wide search and the existing P112 lifecycle audit show no production runId, reportId, sampleId, or executionId attached to assistant findings/reports.
- missionId exists only after mission construction;
- generatedAt is mission creation time, not observation identity;
- canonical stateRevision is assigned at persistence and is not attached to the observation;
- timestamps are not treated as causal identity.

Therefore STEP 7 must not invent an observation identity merely to make the boundary appear complete.

## Current production boundary

Current flow is materially:

canonical state -> specialist reports -> squad findings -> buildNexoMission -> mission -> canonical persistence

Separately, learning memory stores compressed run/fingerprint summaries and does not persist the squad report as a raw observation ledger.

The current recordNexoPlan() projection persists missionId/version/status/objective/parent/replan/step id/action/target/status/dependencies, but drops original finding code, source, reason/message and evidence.

Therefore reconstructable action != reconstructable admission claim.

## Existing ClaimEnvelope

src/nexo/core/contracts.mjs currently represents the protected claim with:
- claimId
- action
- target / targetIncarnation
- authoritativeReads
- dependencies
- predicateDependencies
- derivedProvenance
- policyContext
- causalInputs
- sourceProvenance

This is the correct protected-claim boundary, but it should not be overloaded to act as the identity of an observation that existed before a claim was admitted.

## STEP 7 semantic conclusion

Evidence supports keeping ObservationEnvelope and ClaimEnvelope as distinct semantic objects:

- ObservationEnvelope represents producer/report evidence before mission admission.
- MissionCandidate carries the observation provenance into planning/admission.
- ClaimEnvelope represents the protected claim consumed by final validation/commit.

The boundary is therefore:

Observation -> MissionCandidate -> ClaimEnvelope -> protected transition

This is not permission to add a new observation ID. Existing identity is absent; the envelope must preserve the provenance that actually exists and explicitly represent missing identity rather than fabricate it.

## Minimum provenance mapping

When present in the producer data, preserve:
- producer/source;
- finding code/type;
- target and target incarnation if supplied;
- causal input/evidence fields;
- freshness/version context if supplied;
- predicate/range/aggregate scope if supplied;
- derived provenance;
- proposed action/payload;
- policy/config/logic context when causally relevant;
- existing mission/run/sample identity only when actually present.

Fields such as severity, message and reason may be retained as explanatory metadata, but must not be assumed to establish claim equivalence or causal identity by themselves.

## Important implementation blocker

Current live findings do not carry a complete claim-specific provenance envelope. In particular, there is no demonstrated durable observation identity and no universal target incarnation/version field across findings.

Therefore the first STEP 7 implementation must be a loss-preserving boundary contract, not a claim that production observations are fully identified or durably recoverable.

If implementation requires a fabricated identity, queue, retry, tombstone, or compatibility layer to pass, STOP and redesign the contract.

## Runtime scope derived from evidence

Tests should demonstrate:
1. observation/proposal remains non-authoritative;
2. producer provenance survives into MissionCandidate;
3. distinct causal observations cannot be silently declared equivalent by action+target alone;
4. missing identity/provenance remains explicit rather than synthesized;
5. NOT_ADMITTED remains semantically distinct from FAILED/RESOLVED;
6. conversion into ClaimEnvelope does not grant authorization or commit capability.

## Limits

This evidence does not prove durable raw observation recovery, exactly-once semantics, complete dependency closure, external-effect correctness, distributed fencing, or production readiness.

No historical AB/TLC/Kafka audit reopened.
