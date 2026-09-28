# NEXO AB104.750 — MockSelector/NetworkClient exception-surface audit

Date: 2026-09-28
Status: RESEARCH ONLY

## MockSelector semantics

MockSelector.completeReceive(NetworkReceive) directly appends the receive to completedReceives. It does not parse, mutate, validate, disconnect, or convert the receive.

NetworkClient.poll() calls selector.poll(), then handleCompletedReceives(). handleCompletedReceives() removes the next in-flight request for the receive source and immediately invokes NetworkClient.parseResponse(receive.payload(), req.header).

NetworkClient.parseResponse delegates to AbstractResponse.parseResponse. For ordinary (non-SASL-reserved) request correlation IDs, CorrelationIdMismatchException is propagated rather than transformed by NetworkClient.parseResponse.

No catch around parseResponse exists inside handleCompletedReceives(). Therefore a deliberately mismatched raw response should surface as a thrown CorrelationIdMismatchException from the NetworkClient.poll() call, provided a matching in-flight request exists for that source.

## Minimal OFLE test specification is feasible from existing infrastructure

The existing NetworkClientTest setup already supplies:
- NetworkClient + MockSelector;
- node readiness;
- request creation/sending;
- selector.completeReceive(new NetworkReceive(...));
- RequestTestUtils.serializeResponseWithHeader(response, version, arbitraryCorrelationId);
- poll() processing.

The minimal OFLE experiment can therefore be specified without production changes:
1. create a real OFLE request builder at a supported version;
2. send it and obtain its real request correlation ID;
3. create an OffsetsForLeaderEpochResponse body;
4. serialize it with the same OFLE version but correlationId + 1 (or another non-reserved mismatch);
5. inject NetworkReceive into MockSelector;
6. assert NetworkClient.poll() throws CorrelationIdMismatchException.

This is a TEST DESIGN, not executed evidence.

## Boundary

The exception occurs before OFLE reducer handling because AbstractResponse.parseResponse validates response header/correlation before API body is returned. Thus such a test would establish wire-level correlation validation, not OffsetForLeaderEpochUtils semantic coverage.

Current status:
MOCKSELECTOR_RAW_RECEIVE_INJECTION=YES
POLL_TO_HANDLE_COMPLETED_RECEIVE=YES
MISMATCH_EXCEPTION_PROPAGATION_PATH=SOURCE_ESTABLISHED
MINIMAL_OFLE_TEST_SPECIFIABLE=YES
MINIMAL_OFLE_TEST_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Next exact mission

AB104.751: inspect the current OFLE request builder/version setup in NetworkClientTest or adjacent consumer tests, determine the exact supported OFLE version and required request data needed for the minimal test specification, and verify whether the correlation mismatch should use +1 safely relative to reserved SASL ranges. Do not implement.
