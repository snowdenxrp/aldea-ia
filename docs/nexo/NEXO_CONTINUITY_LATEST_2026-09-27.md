# NEXO — LATEST CONTINUITY CHECKPOINT

Date: 2026-09-27
Canonical repository: snowdenxrp/aldea-ia
Status: RESEARCH ONLY. Implementation remains blocked. No V21.

## Latest chain
AB104.728 → AB104.729 → … → AB104.742 → **AB104.743**

Latest research commit: `307505959459090afd2c270ab456d5c4cc7226a7`
Research file: `docs/nexo/NEXO_AB104_743_CORRELATION_PATH_AND_OFLE_SHAPE_VERSION_AUDIT_2026-09-27.md`

## Critical correlation correction — now source-traced end to end
`ForwardingManagerTest.testResponseCorrelationIdMismatch` deliberately serializes a response with `requestCorrelationId + 1`. The test sends that buffer through an `EnvelopeResponse` with no envelope error. `ForwardingManagerImpl` then enters its normal response path and calls its private `parseResponse(...)`, which directly calls `AbstractResponse.parseResponse(buffer, header)`. The latter parses the ResponseHeader, detects the mismatch and throws `CorrelationIdMismatchException` before API-specific body parsing. `ForwardingManagerImpl` catches that exception and returns the request's `UNKNOWN_SERVER_ERROR`, which the test asserts.

Therefore:
- deliberate correlation mismatch test exists = YES;
- mismatch reaches `AbstractResponse.parseResponse` = YES;
- controlled response-header serialization seam = YES;
- OffsetForLeaderEpoch-specific mismatch test = NOT ESTABLISHED;
- runtime execution by this research session = NOT PERFORMED;
- source-level implementation/test-path proof = YES.

## OFLE protocol vs reducer boundary
`AbstractResponse.parseResponse` selects `apiKey.responseHeaderVersion(apiVersion)` and only after correlation validation dispatches `OFFSET_FOR_LEADER_EPOCH` to `OffsetsForLeaderEpochResponse.parse`.
`RequestResponseTest.testSerialization` iterates all API keys and supported versions for generic request/error-response/response serialization; its special cases explicitly include LeaderForEpoch request/error-response construction. This is protocol/serialization evidence, not exhaustive reducer evidence.

Do not invent hard-coded per-version response-header numbers unless directly verified from generated protocol metadata.

## OFLE reducer state still OPEN
- Direct `OffsetsForLeaderEpochUtils.handleResponse` exhaustive coverage = NO.
- Mixed raw error reducer coverage = UNKNOWN.
- Direct duplicate raw-response-entry test = NOT ESTABLISHED.
- Direct missing requested partition test = NOT ESTABLISHED.
- Dedicated unrequested OFLE response-shape test = NOT ESTABLISHED.
- Arbitrary OFLE error fixture exists, but discovered direct call-site use remains authorization-only.
- Direct reducer seam exists because `handleResponse` is `public static`.

## Duplicate-test correction
`OffsetFetcherTest.testEndOffsetsDuplicateTopicPartition` exists, but it is duplicate handling for the EndOffsets operation, not proof of duplicate raw `OffsetForLeaderEpochResponse` entries reaching the reducer. Do not count it as OFLE reducer duplicate coverage.

## Research-only matrix
The frozen minimum reducer matrix remains: all 11 semantic branches; empty/missing/unrequested/duplicate/mixed responses; authorization mixed response; and raw-error-to-result mapping. It is a design specification, not execution evidence.

## Non-negotiable constraints
INVESTIGAR → ANALIZAR → GUARDAR.
No Nexo implementation. No V21. No silent gap closure. Never convert source presence into runtime verification. Keep SOURCE_CODE, TEST_SOURCE, EXECUTED_TEST, FORMAL_PROOF and RUNTIME_VERIFICATION separate.

## EXACT RESUME — AB104.744
1. Inspect every current `OffsetsForLeaderEpochUtils.handleResponse` caller/test using method/data-type references, not filenames only.
2. Determine whether any consumer test exercises mixed OFLE raw errors through `OffsetsRequestManager` without naming the reducer.
3. Audit authorization mixed-response exception/partial-result behavior.
4. Search malformed OFLE response-collection tests while separating protocol parsing from reducer semantics.
5. Preserve the correlation correction above in every future checkpoint.
