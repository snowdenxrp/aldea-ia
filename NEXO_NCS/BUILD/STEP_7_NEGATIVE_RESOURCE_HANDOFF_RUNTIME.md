# NCS STEP 7 — NEGATIVE_RESOURCE handoff runtime checkpoint — 2026-10-08

## Test
`tests/nexo/step-7-negative-resource-handoff.test.mjs`

## Contract exercised
Actual producer-level ObservationEnvelope:
- source = EcosystemAgent
- code = NEGATIVE_RESOURCE
- resourceType = wood
- amount = -2
- freshness = absent
- target incarnation = absent
- derived provenance = empty

Two otherwise identical observations therefore produce:
`EQUIVALENCE.UNKNOWN`

The handoff carries that evidence into:
`MissionCandidate(admission=UNKNOWN)`

## Assertions
- missing claim-critical evidence remains UNKNOWN;
- UNKNOWN equivalence is not converted into ADMITTED;
- UNKNOWN equivalence is not converted into NOT_ADMITTED;
- complete ObservationEnvelope remains attached;
- candidate exposes no authority/commit/SAFE_COMMIT;
- candidate observation remains detached and immutable.

## Architectural conclusion
The Core can transport unresolved observational uncertainty into the candidate boundary without inventing identity or pretending admission has occurred.

This is a handoff proof, not an admission policy proof and not an execution/effect proof.

## Not changed
- legacy `buildNexoMission()`;
- 8-step bounded admission semantics;
- producer data contract;
- external effects;
- observation identity mechanism.
