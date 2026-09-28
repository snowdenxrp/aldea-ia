# NEXO AB104.749 — OFLE lower-level correlation injection path audit

Date: 2026-09-28
Status: RESEARCH ONLY

## Finding

Current NetworkClientTest provides the exact lower-level injection mechanism sought in AB104.749: it constructs a real NetworkClient with a MockSelector, sends a real ClientRequest, then injects a raw NetworkReceive whose payload is produced by RequestTestUtils.serializeResponseWithHeader(...). The helper accepts an arbitrary correlation ID.

NetworkClient.handleCompletedReceives() obtains the matching in-flight request and calls NetworkClient.parseResponse(receive.payload(), req.header). NetworkClient.parseResponse delegates to AbstractResponse.parseResponse and propagates CorrelationIdMismatchException for ordinary request correlation IDs. Therefore this path is the appropriate wire-level boundary for testing correlation mismatch.

However, the inspected current NetworkClientTest does not establish an OFLE-specific mismatch execution. Its existing raw NetworkReceive examples use Produce and telemetry responses, with matching correlation IDs. Repository searches also did not establish a dedicated CorrelationIdMismatchException assertion through selector.completeReceive.

## Important distinction

The infrastructure is sufficient to construct the experiment without production changes:
- real NetworkClient: YES
- real request/in-flight correlation: YES
- raw NetworkReceive injection: YES
- arbitrary serialized response correlation ID: YES
- OFLE response can be supplied to the same helper: source capability YES
- OFLE mismatch execution currently present: NO
- observed OFLE mismatch exception test: NO

Thus we must not convert "test infrastructure can support it" into "OFLE mismatch is covered."

## Status

NETWORKCLIENT_RAW_RESPONSE_INJECTION=YES
ARBITRARY_RESPONSE_CORRELATION_CONSTRUCTION=YES
GENERIC_RAW_RESPONSE_PATH_EXECUTED=YES
OFLE_RAW_RESPONSE_PATH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_EXCEPTION_ASSERTED=NO
PRODUCTION_CHANGE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Next exact mission

AB104.750: inspect the relevant NetworkClientTest setup/request-version helpers and determine whether a minimal OFLE mismatch test can be specified entirely from existing test infrastructure; separately inspect whether MockSelector completion semantics and NetworkClient.poll would surface the exception directly or through disconnect/error handling. Do not implement the test or production code.
