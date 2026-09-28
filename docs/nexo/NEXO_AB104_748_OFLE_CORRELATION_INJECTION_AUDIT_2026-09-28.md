# NEXO AB104.748 — OFLE correlation-mismatch injection boundary

Date: 2026-09-28
Status: RESEARCH ONLY

## Finding

OffsetForLeaderEpochClientTest uses ConsumerNetworkClient backed by MockClient. The normal OFLE tests call MockClient.prepareResponse(AbstractResponse), supplying only an AbstractResponse body.

MockClient internally creates ClientResponse with request.makeHeader(version) and the supplied response body. Therefore its normal prepare/respond helpers preserve the request's header/correlation identity rather than providing a test hook for an independently serialized response header.

Generic Kafka infrastructure DOES support deliberate correlation mismatch at the wire/serialization layer: RequestTestUtils.serializeResponseWithHeader(AbstractResponse, version, arbitraryCorrelationId) was previously established, and ForwardingManagerTest executes requestCorrelationId + 1. But that generic path is not used by OffsetForLeaderEpochClientTest and is not OFLE-specific.

## Consequence

There is no evidence in the inspected current test path that an OFLE response with a deliberately mismatched correlation ID is injected through ConsumerNetworkClient/MockClient.

This yields:
OFLE_CORRELATION_MISMATCH_WIRE_CONSTRUCTION=YES (generic utility, not OFLE execution)
OFLE_CORRELATION_MISMATCH_THROUGH_CONSUMER_CLIENT=NO/NOT_ESTABLISHED
OFLE_CORRELATION_MISMATCH_DEDICATED_TEST=NO
GENERIC_CORRELATION_MISMATCH_EXECUTED=YES
PRODUCTION_CHANGE_NEEDED_TO_ESTABLISH_CURRENT_EVIDENCE=UNKNOWN (a dedicated test may be possible by using lower-level selector/network plumbing; do not assume).

## Boundary preserved

A response-body mock is not equivalent to a wire-level malformed/mismatched response. The former tests reducer/callback behavior; the latter tests response-header correlation validation before body parsing.

No production code was changed.

## Next exact mission

AB104.749: inspect MockClient/KafkaClient test infrastructure and existing Selector/NetworkClient tests to identify the smallest existing lower-level path that can inject RequestTestUtils.serializeResponseWithHeader(OFLE, version, wrongCorrelationId) and observe the real correlation-mismatch exception/behavior. If no such current path exists for OFLE, record the exact blocker rather than inventing coverage.
