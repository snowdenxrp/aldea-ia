# STEP 7 DECISION — OBSERVATION VS CLAIM SEPARATION
Date: 2026-10-08

## Decision
Use separate semantic boundaries for ObservationEnvelope and ClaimEnvelope.

## MASTER
ClaimEnvelope is the protected claim/provenance boundary for final semantic validation and conditional commit. Mission planning must preserve causal evidence but cannot become the protected transition.

## AB
Historical evidence rejects action+target or WriteSet-only equivalence as sufficient claim identity. Identity/incarnation and provenance are distinct semantic dimensions. Admission is not commit.

## P/P112
Current production assistant findings have no explicit run/sample/report identity. MissionId is created after finding admission. The mission projection drops finding code, source, reason/message and evidence. Therefore a mission step can retain an action and target without retaining enough information to reconstruct the original admission claim.

## NCS contract
ObservationEnvelope is the pre-admission evidence boundary. MissionCandidate transports that provenance through planning/admission. ClaimEnvelope is the protected claim boundary after a candidate has been selected for protected transition.

No new observation ID is introduced by this decision.

## Why not unify them
Unifying them would make the protected claim object carry semantics that exist before admission and would blur the authority boundary. It would also tempt the planner to treat a proposal's observation structure as if it were already a protected claim.

## Why not invent identity now
The repository does not demonstrate an existing production observation identity. Fabricating runId/sampleId/observationId would create a new semantic contract without evidence that the identity's scope, durability, uniqueness or lifecycle are defined.

## Remaining UNKNOWN
A future Core contract still needs to decide which producer-side fields are claim-critical for each observation class and when a missing identity/version/incarnation makes admission UNKNOWN rather than merely non-identifiable metadata.

No implementation, legacy migration, retry, queue, tombstone, or external-effect mechanism is implied.
