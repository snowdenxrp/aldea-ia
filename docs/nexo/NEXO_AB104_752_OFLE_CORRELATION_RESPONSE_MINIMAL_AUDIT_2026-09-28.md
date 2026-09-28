# NEXO AB104.752 — NetworkClient correlation allocator and minimal OFLE response audit

Date: 2026-09-28
Status: RESEARCH ONLY

## NetworkClient correlation setup

Current NetworkClientTest uses a fresh NetworkClient with MockSelector and resets the selector in @BeforeEach. The test helper awaitReady() can consume the internal ApiVersions exchange; its comment explicitly states that the ApiVersions response is mocked with correlation id 0.

The important boundary is that this does NOT prove every subsequently created ClientRequest receives correlation id 0 or 1. The exact allocator state must be treated separately from the ApiVersions bootstrap exchange. Therefore the previous idea of assuming a fixed 0/1 pair is not yet established as a general NetworkClient invariant.

The current test infrastructure exposes request.correlationId() after request creation, so the safest test design remains: obtain the actual OFLE request correlation ID, then choose an explicitly non-reserved, non-equal response correlation ID. No arithmetic +1 invariant is required.

## Minimal valid OFLE response

Current RequestResponseTest has createLeaderEpochResponse(), producing an OffsetsForLeaderEpochResponse containing multiple topics/partitions, all with Errors.NONE and leaderEpoch/endOffset values. This is generic protocol round-trip fixture data, not minimal reducer coverage.

For the correlation-mismatch experiment, response semantics are irrelevant after header validation. A smaller structurally valid response can therefore contain one topic, one partition, Errors.NONE, a defined leader epoch, and an end offset. The response must serialize using the same OFLE API version as the request.

## Important distinction

The NetworkClient test setup establishes:
- selector reset per test;
- real NetworkClient;
- real ClientRequest correlation ID available;
- raw response injection path.

It does NOT establish that the first normal OFLE ClientRequest always has correlation ID 0/1, nor does it establish an OFLE-specific mismatch execution.

## Status

NETWORKCLIENT_TEST_REAL_CLIENT=YES
SELECTOR_RESET_PER_TEST=YES
BOOTSTRAP_APIVERSIONS_CORRELATION_0=SOURCE_ESTABLISHED
FIXED_OFLE_REQUEST_CORRELATION_0_OR_1=NOT_ESTABLISHED
ACTUAL_REQUEST_CORRELATION_AVAILABLE=YES
EXPLICIT_NON_RESERVED_MISMATCH=REQUIRED
GENERIC_OFLE_RESPONSE_FIXTURE=YES
MINIMAL_ONE_TOPIC_ONE_PARTITION_RESPONSE=SPECIFIABLE
MINIMAL_OFLE_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Next exact mission

AB104.753: inspect the current ClientRequest/RequestHeader correlation allocator itself (where NetworkClient obtains the next correlation ID) and determine whether there is a test-local deterministic way to force or observe a safe non-reserved mismatch without production changes. Then inspect the exact OFLE response data type constructors needed for a one-topic/one-partition response. Research only; do not implement.
