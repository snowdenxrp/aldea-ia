# NEXO AB104.740 — Direct reducer matrix and correlation parser audit

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation. No V21.

## 1. Direct reducer test discovery

Current GitHub search found no `OffsetsForLeaderEpochUtilsTest` in Apache Kafka and no current direct test class clearly dedicated to `OffsetsForLeaderEpochUtils.handleResponse`.

The production seam is nevertheless directly callable because `handleResponse` is `public static`.

Current consumer path:
`OffsetsRequestManager` receives the parsed `OffsetsForLeaderEpochResponse` and directly invokes the reducer.

## 2. Minimal direct reducer matrix — research specification only

The minimum direct matrix should contain:

A. Single-partition branch tests
1. NONE -> `endOffsets` contains partition; retry set excludes it.
2. NOT_LEADER_OR_FOLLOWER -> no end offset; retry contains partition.
3. REPLICA_NOT_AVAILABLE -> retry.
4. KAFKA_STORAGE_ERROR -> retry.
5. OFFSET_NOT_AVAILABLE -> retry.
6. LEADER_NOT_AVAILABLE -> retry.
7. FENCED_LEADER_EPOCH -> retry.
8. UNKNOWN_LEADER_EPOCH -> retry.
9. UNKNOWN_TOPIC_OR_PARTITION -> retry.
10. TOPIC_AUTHORIZATION_FAILED -> terminal TopicAuthorizationException with correct topic.
11. One error not explicitly named in switch -> default retry.

B. Response-shape tests
12. Empty response for non-empty request -> all requested partitions remain retryable.
13. Unrequested partition in response -> ignored; requested state unchanged.
14. Duplicate response entries for the same requested partition -> explicitly characterize current behavior rather than assuming it.
15. Multiple topics/partitions -> exact per-partition result.

C. Mixed-response tests
16. NONE + retriable error + UNKNOWN_TOPIC_OR_PARTITION.
17. NONE + retriable error + unrequested partition.
18. Authorization mixed with successful/retriable partitions; verify terminal exception and determine whether partial result is externally observable.
19. Multiple different retry errors in one response.

D. Raw provenance test
20. Assert each injected raw `errorCode` maps to the expected reducer result without reconstructing the raw error from `partitionsToRetry`.

These are test-design requirements, NOT executed test results.

## 3. Important semantic nuance

The reducer initializes `partitionsToRetry` from all requested partitions.

It removes only:
- successful `NONE`;
- `TOPIC_AUTHORIZATION_FAILED` before throwing.

The seven explicitly retriable errors, `UNKNOWN_TOPIC_OR_PARTITION`, and default errors leave the partition in retry.

An unrequested response partition is ignored.

This makes a mixed-response test especially important because downstream state can become many-to-one: distinct raw errors can yield the same retry membership.

## 4. Correlation parser audit

Current search did not find a dedicated deliberate `CorrelationIdMismatchException` test.

Current implementation evidence:
- `AbstractResponse.parseResponse(ByteBuffer, RequestHeader)` parses the response header using the API's response-header version.
- It compares response correlation ID against the request header correlation ID.
- A mismatch raises `CorrelationIdMismatchException`.
- `NetworkClient.parseResponse` catches that exception as a protocol/response parsing failure path.

A current `RequestContextTest` does demonstrate construction of a RequestHeader and response parsing with a matching correlation ID, but this is positive correlation evidence, not mismatch injection.

Therefore:
MATCHED_CORRELATION_TEST_EVIDENCE=YES
DELIBERATE_MISMATCH_TEST_EVIDENCE=NO/NOT_ESTABLISHED

## 5. Fault proxy relevance

The previously inspected KafkaProtocolFaultProxy parses responses and reconstructs response headers using the originating request correlation ID. Therefore its existing behavior cannot be counted as a mismatch injector. A future test fixture could intentionally alter that ID, but that is a test-design observation, not executed evidence.

## 6. Epistemic status

SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
DIRECT_REDUCER_TEST_CLASS_FOUND=NO
DIRECT_REDUCER_SEAM=YES
MINIMUM_MATRIX_DESIGNED=YES
MINIMUM_MATRIX_EXECUTED=NO
DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
MIXED_RAW_REDUCER_COVERAGE=UNKNOWN
MATCHED_CORRELATION_TEST_EVIDENCE=YES
DELIBERATE_MISMATCH_TEST_EVIDENCE=NO/NOT_ESTABLISHED
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT NEXT ACTION — AB104.741

1. Inspect the exact `AbstractResponse.parseResponse` implementation and the response-header version handling for the API versions relevant to the OffsetForLeaderEpoch provenance path.
2. Inspect any test fixture capable of serializing a response with a controlled response header correlation ID.
3. Finish the reducer shape audit for duplicate/missing/unrequested entries.
4. Only after source-level coverage is exhausted, freeze the research gap and update the continuity handoff.

No Nexo implementation. No V21.
