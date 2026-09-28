# NEXO AB104.754 — OFLE mismatch execution path audit

Date: 2026-09-28
Scope: research-only mapping of existing Kafka test infrastructure to the minimal OFLE correlation-mismatch experiment.

## Findings

Current `NetworkClientTest` already contains the complete lower-level receive-injection pattern:
1. `awaitReady(networkClient, node)` before creating the request.
2. Create a real `ClientRequest` with `NetworkClient.newClientRequest(...)`.
3. Send it and poll so it becomes in-flight.
4. Build a response with `RequestTestUtils.serializeResponseWithHeader(response, version, correlationId)`.
5. Inject it with `selector.completeReceive(new NetworkReceive(node.idString(), buffer))`.
6. Call `networkClient.poll(...)`.

The same test class imports JUnit `assertThrows`, `NetworkReceive`, `RequestTestUtils`, `MockSelector`, and already uses `completeReceive`. Therefore no new testing infrastructure or production modification is required in principle.

`ClientRequest.requestBuilder()` exposes the builder and `ClientRequest.apiKey()` exposes the API key. `AbstractRequest.Builder` exposes `latestAllowedVersion()`, so a test can construct an OFLE consumer builder with a chosen supported version and retain the same version for response serialization.

The dedicated `OffsetForLeaderEpochClientTest` uses a higher-level `ConsumerNetworkClient + MockClient` path and therefore cannot inject an independently mismatched wire ResponseHeader. The lower-level `NetworkClientTest` path is the correct boundary for this specific claim.

## Minimal execution recipe

Research-only recipe, not executed in this audit:
- use `OffsetsForLeaderEpochRequest.Builder.forConsumer(...)`;
- choose a supported consumer version (v3 is the minimal stable target);
- call `awaitReady`;
- create and send a real ClientRequest;
- poll until the request is in flight;
- read `request.correlationId()`;
- choose a response correlation ID that is different and outside the reserved SASL range;
- construct a one-topic/one-partition `OffsetsForLeaderEpochResponse`;
- serialize with the OFLE response version and the deliberately wrong correlation ID;
- inject through `MockSelector.completeReceive`;
- assert `networkClient.poll(...)` throws `CorrelationIdMismatchException`.

The existing generic NetworkClient test pattern demonstrates the matching path; source inspection establishes the mismatch propagation path. However, no repository evidence was found that this exact OFLE-specific test has already been executed.

## Important boundary

This experiment would establish wire/header correlation validation for OFLE only. It would NOT establish:
- OFLE reducer completeness;
- duplicate/unrequested semantic handling;
- error-matrix completeness;
- version-complete reducer correctness;
- Nexo correctness or implementation;
- TLC/formal verification.

## Status

NETWORKCLIENT_RAW_RECEIVE_INJECTION=YES
OFLE_REQUEST_BUILDER_PATH=SPECIFIABLE
OFLE_RESPONSE_HEADER_SERIALIZATION=YES
DELIBERATE_NONMATCHING_CORRELATION_CONSTRUCTION=YES
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next action

AB104.755: inspect the current OFLE builder's required request-data types/constructors and the exact version selected by the client path, then determine whether the minimal OFLE mismatch test can be specified byte-for-byte from existing public/test-visible constructors. Preserve execution status as NOT EXECUTED until an actual test run is observed.
