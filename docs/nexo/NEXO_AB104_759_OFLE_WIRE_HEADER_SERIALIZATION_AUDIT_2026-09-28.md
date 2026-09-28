# NEXO AB104.759 — OFLE wire header serialization audit

Date: 2026-09-28
Scope: prove how RequestTestUtils.serializeResponseWithHeader encodes the chosen correlation ID, header version, and OFLE body into the injected ByteBuffer.

## Findings

Current RequestTestUtils.serializeResponseWithHeader(response, version, correlationId) constructs a new ResponseHeader(correlationId, response.apiKey().responseHeaderVersion(version)) and delegates to AbstractResponse.serializeWithHeader(...).

AbstractResponse.serializeWithHeader delegates to RequestUtils.serialize(header.data(), header.headerVersion(), data(), version).

RequestUtils.serialize allocates a ByteBuffer sized as headerSize + apiMessageSize, writes the header first with the selected header version, then writes the API message with the selected API version, and flips the buffer.

Therefore the test-controlled correlation ID is not merely metadata in the test helper: it is placed into ResponseHeaderData and serialized into the first wire segment. The same selected OFLE version controls both response-header-version selection and body serialization.

For a deliberate mismatch, the exact construction is therefore:
1. create valid OffsetsForLeaderEpochResponse body;
2. choose the actual request API version;
3. choose a response correlation ID that is non-reserved and != request correlation ID;
4. call serializeResponseWithHeader(response, version, mismatchedCorrelation);
5. inject resulting ByteBuffer as NetworkReceive.

The source establishes byte-level construction semantics, but no test has yet executed this OFLE-specific path.

## Status

RESPONSE_CORRELATION_ID_WIRE_ENCODED=SOURCE_VERIFIED
RESPONSE_HEADER_VERSION_DERIVED_FROM_OFLE_VERSION=SOURCE_VERIFIED
OFLE_BODY_SERIALIZED_AFTER_HEADER=SOURCE_VERIFIED
NON_RESERVED_MISMATCH_CONSTRUCTION=SPECIFIABLE
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next mission

AB104.760: inspect NetworkReceive construction and MockSelector.completeReceive/poll path once more at exact source level, then freeze the complete no-production-change OFLE mismatch test recipe. Do not execute yet unless the mission explicitly transitions to execution; preserve NOT EXECUTED.
