# NEXO NCS — STEP 7 Runtime Verification — 2026-10-08

## Scope
Minimum ObservationEnvelope/MissionCandidate contract runtime check.

## Runtime result
- 🟢 User manually executed `Nexo — STEP 7 observation contract` after the harness-only immutability assertion was corrected.
- 🟢 User reported the workflow result as PASS.
- Runtime command: `node tests/nexo/observation.test.mjs`
- Expected output: `NEXO STEP 7 observation contract tests: PASS`

## Evidence boundary
This record captures the successful manual runtime result reported in the active construction session. The available GitHub connector does not expose workflow_dispatch/listing for this workflow, so the run ID/job ID were not independently retrieved here and are intentionally not invented.

## Verified semantics
- ObservationEnvelope requires source and code.
- Mutable observation content is detached and immutable.
- MissionCandidate accepts ADMITTED, NOT_ADMITTED, or UNKNOWN only.
- NOT_ADMITTED is represented explicitly and is not a FAILED state.
- UNKNOWN is represented explicitly.
- Missing required observation code is rejected.
- Invalid admission states are rejected.
- Candidate retains the ObservationEnvelope rather than replacing it with only action/target.

## Limits
This runtime check does not prove complete claim-critical provenance for every producer, causal equivalence under deduplication, durable raw observation recovery, exactly-once, external-effect correctness, distributed fencing, or production safety.

## Next action
Run focused semantic tests for causal-distinct findings, provenance preservation, and the action/target dedupe boundary. No legacy integration or invented identity/queue/retry/tombstone mechanism.
