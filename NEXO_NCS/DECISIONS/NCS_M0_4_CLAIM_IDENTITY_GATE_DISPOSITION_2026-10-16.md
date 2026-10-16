# NCS M0.4 — Claim identity gate disposition
Date: 2026-10-16
Branch inspected: `ncs-clean-architecture`
Status: ENGINEERING BLOCKER CONFIRMED / NO IDENTITY SCHEME AUTHORIZED / OWNER DECISION NOT IMPLIED

## Question
Can the current ObservationEnvelope -> MissionCandidate boundary be converted into the existing ClaimEnvelope using a legitimate, already-supported claim identity, without inventing an ID or treating a planning identifier as protected-claim identity?

## Evidence rechecked on the current branch
- `src/nexo/core/observation.mjs` (blob `a7400912e0b55887a5120d059f7c1a598b9d9cd4`): ObservationEnvelope preserves producer fields and optional `existingIdentity`; MissionCandidate contains observation, nullable `claim`, admission state and admission evidence. It does not define canonical claim identity.
- `src/nexo/core/contracts.mjs` (blob `294eb400e9685788f7dd084a28a838b69d0323c7`): `createClaimEnvelope()` requires caller-supplied non-empty `claimId` and `action`; the constructor validates shape, not the legitimacy or provenance of claimId.
- `NEXO_NCS/BUILD/STEP_7_EVIDENCE_MAPPING_2026-10-08.md` (blob `bba96577b015016f4d062c2dc9212db1368057d4`): existing research already found no production runId/reportId/sampleId/executionId attached to findings; missionId exists after mission construction and is not observation identity; timestamps and canonical state revision do not supply causal observation identity.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_OBSERVATION_ENVELOPE_CONTRACT_2026-10-08.md` (blob `2d43c26d75f1c7895d260bc892e267a472b43c91`): specifies the distinct semantic boundary ObservationEnvelope -> MissionCandidate -> ClaimEnvelope and prohibits fabricated identity.
- `NEXO_NCS/BUILD/NCS_M0_2_BOUNDED_OBSERVATION_CANDIDATE_CALLER_TRACE_2026-10-16.md` (blob `4c819b0a91c14e0256bf9a946f0c90290eb4b8cb`): the inspected legacy planner's positional step IDs, timestamp-plus-sequence mission IDs, and action+target dedupe do not establish stable, claim-specific identity.

## Disposition
**BLOCKED / UNKNOWN. No legitimate existing identity binding was demonstrated.**

Do not:
- synthesize a claimId from timestamp, sequence, array position, action+target, missionId, or a new ad hoc hash;
- infer that a candidate's proposed action is already a protected claim;
- blindly copy candidate fields into ClaimEnvelope;
- connect this planning seam to runtime, adapter execution, validation, commit, or persistence.

This is not a claim that no identity could ever be designed. It means the inspected evidence does not justify one now, and the project constraints explicitly forbid inventing an identity lifecycle just to complete the mapping.

## Next bounded action
Keep M0.1 observation/candidate data contract isolated. Do not implement candidate-to-ClaimEnvelope conversion.

Continue useful non-authoritative Core work only by selecting a separate existing behavior slice from source and tests, then record its inputs, outputs, state ownership, failure semantics, and exact test command before changing code. Do not widen the selected slice into runtime/effect wiring. If no coherent slice is found without creating new architecture, stop and report the blocker rather than forcing progress.

## What this disposition does not establish
- It is not a constitutional or owner decision, Constitution approval, freeze, or commissioning.
- It does not prove an exhaustive repository-wide identity search or bypass closure.
- It does not prove observation authenticity, freshness, durable recovery, or protected-effect authorization.
- STEP 7 remains OPEN / STOP / UNKNOWN; Direction B / L2 remains the objective.
