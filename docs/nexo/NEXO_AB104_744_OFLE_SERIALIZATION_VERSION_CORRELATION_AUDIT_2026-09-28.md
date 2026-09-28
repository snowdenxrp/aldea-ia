# NEXO AB104.744 — OFLE serialization/version and correlation-mismatch evidence audit

Date: 2026-09-28
Status: RESEARCH ONLY

## New evidence

Current Kafka test fixture `RequestTestUtils.serializeResponseWithHeader(AbstractResponse response, short version, int correlationId)` explicitly accepts an arbitrary correlation ID and constructs the versioned ResponseHeader before serializing the response. Therefore a deliberate mismatch buffer is constructible without production changes.

A current server test, `ForwardingManagerTest.testResponseCorrelationIdMismatch`, uses `requestCorrelationId + 1` with this helper, establishing that the repository does execute at least one deliberate response-correlation mismatch scenario. This is not OFLE-specific and therefore does not establish OFLE client-path coverage.

`AbstractResponse.parseResponse(ByteBuffer, RequestHeader)` remains the parser boundary: it selects the response-header version from API key/version, parses the header, compares correlation IDs, and throws `CorrelationIdMismatchException` before API-body parsing.

## OFLE-specific conclusion

The earlier statement “deliberate correlation mismatch test not established” must be refined:
- GLOBAL Kafka deliberate mismatch execution evidence: YES.
- OFLE-specific deliberate mismatch execution evidence: NOT ESTABLISHED.
- Controlled mismatch construction without production change: YES.
- OFLE reducer exhaustive response-shape coverage: NO.
- OFLE API-version exhaustive response-shape coverage: UNKNOWN.

The existence of a generic mismatch test proves the test infrastructure can exercise this fault class; it does not prove the consumer OFLE path receives and rejects a mismatched response in an executed test.

## Version/serialization boundary

`RequestTestUtils` serializes the response with `response.apiKey().responseHeaderVersion(version)`, while `AbstractResponse.parseResponse` independently derives the response-header version from the request API key/version. This creates a concrete research path for testing version-correct header/body parsing and intentional mismatch.

No evidence found yet that the OFLE-specific consumer test suite systematically exercises every supported OFLE version with duplicate/missing/unrequested shapes.

## Nexo consequence

Distinguish:
1. generic infrastructure fault-injection capability;
2. executed generic correlation-mismatch evidence;
3. OFLE-specific fault execution;
4. semantic reducer coverage;
5. version-complete coverage.

Do not promote (1) or (2) into (3)-(5).

## Status

SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
GENERIC_CORRELATION_MISMATCH_EXECUTED=YES
OFLE_CORRELATION_MISMATCH_EXECUTED=NO/NOT_ESTABLISHED
CONTROLLED_OFLE_MISMATCH_CONSTRUCTION=YES
DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
DUPLICATE_OFLE_TEST=NO/NOT_ESTABLISHED
MISSING_OFLE_TEST=NO/NOT_ESTABLISHED
UNREQUESTED_OFLE_TEST=NO/NOT_ESTABLISHED
API-VERSION_EXHAUSTIVE_OFLE_SHAPE_COVERAGE=UNKNOWN
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next action

AB104.745: inspect the exact OFLE Request/Response message schema versions and current test loops/parameterization in RequestResponseTest; determine the supported-version set and whether generic protocol serialization tests indirectly exercise every OFLE version. Then inspect whether a small research-only execution can route a mismatched OFLE response through NetworkClient without production changes. Freeze any remaining gaps explicitly.

No Kafka source modified. No Nexo implementation. No V21.
