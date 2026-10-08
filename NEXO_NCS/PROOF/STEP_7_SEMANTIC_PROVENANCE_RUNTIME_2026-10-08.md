# NEXO NCS — STEP 7 Semantic Provenance Runtime Verification — 2026-10-08

## Scope
Focused semantic tests for the ObservationEnvelope/MissionCandidate boundary.

## Runtime result
- 🟢 User manually executed `Nexo — STEP 7 semantic provenance` after the test and workflow were committed.
- 🟢 User reported PASS.
- Runtime command: `node tests/nexo/step-7-provenance.test.mjs`
- Expected output: `NEXO STEP 7 semantic provenance tests: PASS`

## Verified semantics
- Same action + target does not establish observational equivalence when causal inputs/freshness differ.
- Observation provenance remains attached to the MissionCandidate.
- NOT_ADMITTED remains distinct from FAILED, RESOLVED, COMMITTED, and RETRIED.
- UNKNOWN remains explicit when admission classification is insufficient.
- MissionCandidate exposes no authority/commit/safeCommit capability.
- Candidate observation data remains detached and immutable.

## Limits
This does not prove universal producer provenance completeness, durable raw observation recovery, exactly-once, external-effect correctness, distributed fencing, or production safety.

## Next boundary
The next work must inspect the actual legacy `buildNexoMission()` deduplication boundary against this contract before any integration is attempted. No legacy integration is performed merely because the semantic tests pass.
