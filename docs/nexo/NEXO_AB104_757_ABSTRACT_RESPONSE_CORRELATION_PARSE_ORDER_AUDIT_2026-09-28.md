# NEXO AB104.757 — AbstractResponse correlation parse-order audit

Date: 2026-09-28
Scope: exact response-header parsing and correlation validation order.

## Findings

Current `AbstractResponse.parseResponse(ByteBuffer, RequestHeader)` first derives the API key and API version from the request header. It then calls `ResponseHeader.parse(buffer, apiKey.responseHeaderVersion(apiVersion))`.

`ResponseHeader.parse` constructs `ResponseHeaderData` directly from the current buffer position and advances the buffer to the beginning of the API message body. It records the parsed header size but does not validate the request correlation itself.

Immediately after header parsing, `AbstractResponse.parseResponse` compares `requestHeader.correlationId()` against `responseHeader.correlationId()`. On mismatch it throws `CorrelationIdMismatchException`.

Only after that comparison does it call the second overload:
`AbstractResponse.parseResponse(apiKey, new ByteBufferAccessor(buffer), apiVersion)`.

For `ApiKeys.OFFSET_FOR_LEADER_EPOCH`, that dispatch selects `OffsetsForLeaderEpochResponse.parse(readable, version)`. Therefore a correlation mismatch prevents the OFLE body parser from being invoked.

## Important precision

The header itself must still be parsed before the correlation comparison, and this advances the ByteBuffer position past the header. Thus the precise claim is NOT “nothing is parsed”; rather:

HEADER PARSING = YES
CORRELATION VALIDATION = BEFORE API BODY PARSING
OFLE BODY PARSING ON MISMATCH = NO

The response header version is selected from the request API/version, not inferred from the response body.

No OFLE-specific mismatch execution was performed in this audit.

## Status

RESPONSE_HEADER_PARSE_SOURCE_VERIFIED=YES
CORRELATION_COMPARE_SOURCE_VERIFIED=YES
CORRELATION_COMPARE_PRECEDES_API_BODY_PARSE=YES
OFLE_BODY_PARSE_DISPATCH_SOURCE_VERIFIED=YES
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next mission

AB104.758: inspect the exact OFLE response parser entry point and generated response-data constructor/schema path to determine whether a structurally valid minimal body is sufficient for the mismatch test and whether any version-specific response-header/body coupling remains relevant. Preserve NOT EXECUTED.
