# NEXO AB104.742 — Correlation mismatch correction + response/version audit

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation. No V21.

## Critical correction to AB104.741
The previous statement `DELIBERATE_CORRELATION_MISMATCH_TEST_EXECUTED=NO/NOT_ESTABLISHED` was too broad and is now corrected.

Current Apache Kafka contains an actual executed test source named `ForwardingManagerTest.testResponseCorrelationIdMismatch`.

The test:
- creates an `AlterConfigsResponse`;
- serializes it with `RequestTestUtils.serializeResponseWithHeader(...)` using `requestCorrelationId + 1`;
- feeds the resulting response buffer through the forwarding path;
- verifies a resulting `UNKNOWN_SERVER_ERROR` response/error count.

This is direct test-source evidence that a deliberately mismatched response correlation ID is exercised through a real forwarding/network path. It is NOT an OffsetForLeaderEpoch-specific mismatch test, and it does not prove every client path handles the mismatch identically.

The test fixture `RequestTestUtils.serializeResponseWithHeader(response, version, correlationId)` accepts an explicit correlation ID and derives the response-header version from the response API/version. This is a concrete controlled-mismatch injection seam.

## Exact parser boundary
Current `AbstractResponse.parseResponse(ByteBuffer, RequestHeader)`:
1. derives API key/version from RequestHeader;
2. parses ResponseHeader using `apiKey.responseHeaderVersion(apiVersion)`;
3. compares request and response correlation IDs;
4. throws `CorrelationIdMismatchException` on mismatch;
5. only then parses the API-specific response body.

Thus mismatch rejection occurs before OffsetForLeaderEpoch response body parsing/reduction.

## OffsetForLeaderEpoch serialization/version evidence
`RequestResponseTest` contains a generic `createLeaderEpochResponse()` fixture and includes `OFFSET_FOR_LEADER_EPOCH` in its response round-trip dispatch. `MessageTest` has explicit OffsetForLeaderEpoch request message version coverage, including the current-leader-epoch field transition at version 2.

This establishes protocol/message round-trip infrastructure, but it does not establish exhaustive reducer error coverage or a version-by-version adversarial correlation test specifically for OffsetForLeaderEpoch.

## Response-shape audit
Direct reducer source remains:
- missing requested partition => stays in `partitionsToRetry`;
- unrequested response partition => ignored;
- duplicate entries => no explicit duplicate rejection; order-dependent state as previously documented.

Search did not establish dedicated current OFLE tests for duplicate/missing/unrequested response-shape cases.

## Corrected epistemic status
SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
CONTROLLED_CORRELATION_SERIALIZATION_PATH=YES
DELIBERATE_CORRELATION_MISMATCH_TEST_EXISTS=YES
DELIBERATE_CORRELATION_MISMATCH_TEST_IS_OFLE_SPECIFIC=NO
DELIBERATE_CORRELATION_MISMATCH_TEST_EXECUTION_EVIDENCE=SOURCE_TEST_FOUND; RUNTIME_EXECUTION_NOT_PERFORMED_HERE
OFLE_DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
OFLE_MIXED_RAW_REDUCER_COVERAGE=UNKNOWN
OFLE_DUPLICATE_SHAPE_TEST=NOT_ESTABLISHED
OFLE_MISSING_SHAPE_TEST=NOT_ESTABLISHED
OFLE_UNREQUESTED_SHAPE_TEST=NOT_ESTABLISHED_AS_DEDICATED_TEST
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT NEXT ACTION — AB104.743
1. Inspect `ForwardingManagerTest.testResponseCorrelationIdMismatch` surrounding execution path to determine whether it reaches `AbstractResponse.parseResponse` directly or validates a higher-level translated failure.
2. Search for any other deliberate correlation-mismatch tests in NetworkClient/RequestContext layers.
3. Determine exact OffsetForLeaderEpoch response-header versions from `ApiKeys`/message specs and map existing round-trip coverage.
4. Finish dedicated duplicate/missing/unrequested OFLE test-source search.
5. Preserve this correction in the next continuity checkpoint; do not allow the old UNKNOWN statement to overwrite the new evidence.

No Nexo implementation. No V21.