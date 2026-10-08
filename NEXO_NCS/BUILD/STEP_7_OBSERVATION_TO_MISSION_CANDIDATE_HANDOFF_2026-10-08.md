# NCS STEP 7 — Observation → MissionCandidate handoff — 2026-10-08

## Status
MINIMUM CONTRACT DEFINED — no legacy integration.

## Purpose
Define the smallest Core handoff that preserves producer evidence while carrying a claim-specific admission question forward.

## Contract
The handoff is a transport boundary, not an authority boundary:

`ObservationEnvelope -> MissionCandidate`

A `MissionCandidate` MUST:
1. retain the complete detached immutable `ObservationEnvelope`;
2. optionally carry the claim proposal as detached data;
3. carry exactly one explicit admission state: `ADMITTED | NOT_ADMITTED | UNKNOWN`;
4. carry admission evidence separately from the observation itself;
5. expose no authority, commit, SAFE_COMMIT, execution, retry, or external-effect capability.

## Semantic separation
- Observation evidence answers: what was observed and with what provenance?
- Claim proposal answers: what action/claim could this observation support?
- Admission answers: did this candidate enter the bounded admitted mission set?
- Admission is not commit, execution, resolution, retry, or proof that the observation was equivalent to another observation.
- Equivalence evidence may inform admission, but it does not itself authorize admission.
- `UNKNOWN` remains UNKNOWN when claim-critical evidence is insufficient.
- `NOT_ADMITTED` retains its previously closed meaning and is not a failure state.

## Existing implementation
`createMissionCandidate()` already implements this minimum transport shape in `src/nexo/core/observation.mjs`.

No new identity mechanism is introduced. No observation ID, queue, continuation cursor, retry, tombstone, transaction wrapper, or compatibility layer is required by this handoff.

## Concrete NEGATIVE_RESOURCE application
For the current producer:
1. create ObservationEnvelope from actual producer fields;
2. evaluate the claim-specific equivalence predicate;
3. preserve EQUIVALENT/NON_EQUIVALENT/UNKNOWN as evidence for the caller's admission decision;
4. construct MissionCandidate carrying the original ObservationEnvelope and explicit admission state.

The evaluator does not itself admit, reject, authorize, commit, or execute.

Because the producer currently lacks resource incarnation/version, freshness, and complete causal dependency evidence, an otherwise identical NEGATIVE_RESOURCE pair remains UNKNOWN for equivalence.

## STOP condition
If the handoff requires fabricating missing observation identity, freshness, incarnation, dependencies, or authority, STOP and redesign the root observation contract.

## Non-goals
- No change to legacy `buildNexoMission()`.
- No change to the 8-step budget.
- No universal observation equivalence predicate.
- No durable observation identity invention.
- No integration with external effects.
