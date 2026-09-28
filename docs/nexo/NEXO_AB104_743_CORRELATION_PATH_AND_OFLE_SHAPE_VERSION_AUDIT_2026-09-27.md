# NEXO AB104.743 — correlation path and OFLE shape/version audit

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation. No V21.

## 1. Correlation mismatch path is now source-traced end to end
`ForwardingManagerTest.testResponseCorrelationIdMismatch` is not merely testing a translated error without parsing.

The test:
- creates an `AlterConfigsResponse`;
- serializes it with `requestCorrelationId + 1` using `RequestTestUtils.serializeResponseWithHeader`;
- places that buffer into an `EnvelopeResponse`;
- invokes `ForwardingManagerImpl.forwardRequest`;
- receives an envelope with `Errors.NONE`;
- therefore enters `ForwardingManagerImpl`'s normal response path;
- calls its private `parseResponse(...)` helper;
- that helper directly calls `AbstractResponse.parseResponse(buffer, header)`;
- `AbstractResponse.parseResponse` parses the response header, compares correlation IDs, and throws `CorrelationIdMismatchException` before parsing the API-specific body;
- `ForwardingManagerImpl` catches the exception and converts it to the request's `UNKNOWN_SERVER_ERROR` response;
- the test asserts that error count.

Therefore the previous uncertainty is CLOSED at source level:
`DELIBERATE_CORRELATION_MISMATCH_REACHES_ABSTRACT_RESPONSE_PARSER = YES`.

This is still generic forwarding-path evidence, not an OffsetForLeaderEpoch-specific mismatch test.

## 2. OFLE response/header version coverage
`ApiKeys.OFFSET_FOR_LEADER_EPOCH` is part of the normal API-key machinery and its `responseHeaderVersion(apiVersion)` is selected by `ApiKeys`/message type. `AbstractResponse.parseResponse` uses exactly that computed header version before dispatching `OFFSET_FOR_LEADER_EPOCH` to `OffsetsForLeaderEpochResponse.parse`.

`RequestResponseTest.testSerialization` iterates `ApiKeys.values()` and every supported version for each API, then performs request/error-response/response serialization checks. The special-case section also explicitly exercises LeaderForEpoch request/error-response construction. This establishes broad protocol serialization coverage for supported OFLE versions, but it does not establish reducer-branch coverage.

The dedicated `testResponseHeader` verifies ResponseHeader serialization/parsing and correlation preservation for header version 1. The controlled mismatch test uses the response-header serializer path with a deliberately altered correlation ID.

Exact per-version OFLE response-header values are still a generated-message/protocol detail and were not hard-coded into Nexo from this audit. No need to invent them.

## 3. Duplicate/missing/unrequested search correction
A current search found `OffsetFetcherTest.testEndOffsetsDuplicateTopicPartition`, but that test concerns duplicate topic-partition handling in the EndOffsets operation, not a duplicate entry in the raw `OffsetForLeaderEpochResponse` consumed by `OffsetsForLeaderEpochUtils.handleResponse`.

Therefore it must NOT be counted as direct reducer duplicate coverage.

A broad current search did not establish dedicated consumer-side OFLE reducer tests for:
- duplicate response entries for the same requested partition;
- missing requested response partition;
- unrequested response partition.

The source-level semantics previously recorded remain unchanged.

## 4. Evidence classification
CORRELATION_MISMATCH_TEST_EXISTS = YES
CORRELATION_MISMATCH_REACHES_ABSTRACT_RESPONSE_PARSER = YES
CORRELATION_MISMATCH_IS_OFLE_SPECIFIC = NO
OFLE_PROTOCOL_SERIALIZATION_COVERAGE = YES (generic all-API serialization + LeaderForEpoch special cases)
OFLE_REDUCER_EXHAUSTIVE_COVERAGE = NO
OFLE_MIXED_RAW_ERROR_COVERAGE = UNKNOWN
OFLE_DUPLICATE_SHAPE_TEST = NOT_ESTABLISHED
OFLE_MISSING_SHAPE_TEST = NOT_ESTABLISHED
OFLE_UNREQUESTED_SHAPE_TEST = NOT_ESTABLISHED
RUNTIME_EXECUTION_BY_THIS_RESEARCH_SESSION = NO
FORMAL_PROOF = NO
NEXO_IMPLEMENTED = NO

## EXACT NEXT ACTION — AB104.744
1. Inspect all current `OffsetsForLeaderEpochUtils.handleResponse` callers and tests again using method/data-type references rather than only filenames.
2. Determine whether any consumer test can be proven to exercise mixed OFLE raw errors through `OffsetsRequestManager` even if it does not call the reducer by name.
3. Audit the reducer's exception/partial-result behavior for authorization mixed with other partitions.
4. Search for protocol tests that deliberately construct malformed OFLE response collections, while keeping malformed-protocol parsing separate from reducer semantics.

No Nexo implementation. No V21.
