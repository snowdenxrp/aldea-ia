# NEXO AB104.761 — OFLE NetworkClientTest fixture audit

Date: 2026-09-28
Scope: smallest existing NetworkClientTest fixture path for a real OFLE ClientRequest, without production changes.

## Findings

The current NetworkClientTest already provides the complete reusable harness needed:
- shared MockTime, MockSelector, singleton Node, TestMetadataUpdater and real NetworkClient;
- setup() resets the selector before each test;
- awaitReady(client, node) establishes readiness and clears the selector after bootstrap/API-version discovery;
- NetworkClient.newClientRequest(...) is directly used in existing tests;
- NetworkClient.send(...) followed by poll() leaves the request in the in-flight table;
- actual ClientRequest.correlationId() and requestBuilder()/api version are available.

Existing tests construct requests directly with a concrete AbstractRequest.Builder and do not require production changes. The OFLE case can follow the same shape using OffsetsForLeaderEpochRequest.Builder.forConsumer(...).

The current test class imports NetworkReceive, RequestTestUtils, MockSelector, assertThrows, and related infrastructure already required by the frozen recipe. Additional OFLE/message imports would be test-only additions if the test is eventually executed.

Important: awaitReady() must occur before constructing the OFLE request because it may consume bootstrap/API-version correlation IDs. The existing comment explicitly documents that the mocked ApiVersions response uses correlation id 0. Therefore the actual OFLE ClientRequest correlation must still be observed from the returned ClientRequest.

Smallest concrete location: clients/src/test/java/org/apache/kafka/clients/NetworkClientTest.java, alongside the existing raw-response injection tests. No production source modification is required by the recipe.

## Frozen execution shape

- awaitReady(client, node)
- build one-topic/one-partition consumer OFLE request, minimum supported consumer version 3
- create ClientRequest using client.newClientRequest(...)
- client.send(request, now)
- client.poll(...) so the request is registered/in-flight
- read request.correlationId() and request.requestBuilder().latestAllowedVersion() / chosen request version as appropriate
- select a different non-reserved response correlation ID
- construct minimal valid OffsetsForLeaderEpochResponse
- serialize with RequestTestUtils.serializeResponseWithHeader(...)
- selector.completeReceive(new NetworkReceive(node.idString(), buffer))
- assertThrows(CorrelationIdMismatchException, () -> client.poll(...))

No production code change is needed merely to construct this test.

## Status

NETWORKCLIENTTEST_REUSABLE_REAL_CLIENT=YES
MOCKSELECTOR_REUSABLE=YES
AWAITREADY_REUSABLE=YES
REAL_CLIENTREQUEST_CONSTRUCTION=SOURCE_VERIFIED
ACTUAL_CORRELATION_OBSERVABLE=YES
OFLE_BUILDER_TEST_ONLY_ADDITION=REQUIRED
PRODUCTION_CHANGE_REQUIRED=NO
SMALLEST_TEST_LOCATION=NetworkClientTest.java
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next mission

AB104.762: inspect the exact OFLE test-only imports and concrete one-topic/one-partition builder syntax against current Kafka test sources, then produce the final compile-level test skeleton. Preserve NOT EXECUTED unless execution is explicitly authorized.
