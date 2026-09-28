# NEXO — LATEST CONTINUITY CHECKPOINT

Date: 2026-09-27
Canonical repository: snowdenxrp/aldea-ia
Status: RESEARCH ONLY. Implementation remains blocked. No V21.

## Latest chain
AB104.728 → AB104.729 → … → AB104.741 → **AB104.742**

Latest research commit: `43edeaaced008579355876c8d9c9d56203e10f51`

Research file: `docs/nexo/NEXO_AB104_742_CORRELATION_AND_VERSION_AUDIT_2026-09-27.md`

## Critical correction
Do NOT carry forward the older statement that no deliberate correlation-mismatch test exists.

Current Kafka test source contains `ForwardingManagerTest.testResponseCorrelationIdMismatch`, which deliberately serializes a response with `requestCorrelationId + 1` using `RequestTestUtils.serializeResponseWithHeader(...)` and verifies the forwarding path produces an `UNKNOWN_SERVER_ERROR` result.

Therefore:
- deliberate correlation mismatch test exists = YES;
- controlled correlation serialization seam = YES;
- OffsetForLeaderEpoch-specific mismatch test = NOT ESTABLISHED;
- runtime execution by this research session = NOT PERFORMED;
- source-level implementation proof = YES.

`AbstractResponse.parseResponse` checks the response header correlation ID before parsing the API-specific body, and throws `CorrelationIdMismatchException` on mismatch.

## OFLE state that remains OPEN
- Direct `OffsetsForLeaderEpochUtils.handleResponse` exhaustive coverage = NO.
- Mixed raw error reducer coverage = UNKNOWN.
- Direct duplicate response-shape test = NOT ESTABLISHED.
- Direct missing requested partition test = NOT ESTABLISHED.
- Dedicated unrequested OFLE response-shape test = NOT ESTABLISHED.
- Arbitrary OFLE error fixture exists, but discovered call-site use is authorization-only.
- Direct reducer seam exists because `handleResponse` is `public static`.

## Research-only matrix already frozen
The minimum reducer matrix covers all 11 semantic branches plus empty/missing/unrequested/duplicate/mixed responses and raw-error-to-result mapping. It is a test-design specification, not execution evidence.

## Important semantic findings
- Missing requested partition remains retryable because retry set starts from all requested partitions.
- Unrequested response partition is ignored.
- Duplicate entries are not explicitly rejected and can be order-dependent.
- Distinct raw errors can collapse into the same retry state; raw provenance must be captured before reduction.

## Non-negotiable constraints
INVESTIGAR → ANALIZAR → GUARDAR.
No Nexo implementation. No V21. No silent gap closure. Never convert source presence into runtime verification. Keep SOURCE_CODE, TEST_SOURCE, EXECUTED_TEST, FORMAL_PROOF and RUNTIME_VERIFICATION as separate evidence classes.

## EXACT RESUME — AB104.743
1. Inspect whether `ForwardingManagerTest.testResponseCorrelationIdMismatch` reaches `AbstractResponse.parseResponse` directly or validates a higher-level translated failure.
2. Search NetworkClient/RequestContext for additional deliberate mismatch tests.
3. Map exact OffsetForLeaderEpoch response-header versions and existing round-trip coverage.
4. Finish dedicated OFLE duplicate/missing/unrequested test search.
5. Preserve the correlation correction in every future continuity checkpoint.
