# NEXO AB104.747 — OFLE protocol-version serialization boundary audit

Date: 2026-09-28
Status: RESEARCH ONLY

## Generic serialization loop

Current Kafka RequestResponseTest.testSerialization() iterates every ApiKeys value and every apiKey.allVersions(). For each version it:
1. builds a request;
2. round-trips the request;
3. checks the request's error response;
4. builds the corresponding response;
5. round-trips that response with checkResponse(response, version).

For OFFSET_FOR_LEADER_EPOCH, getResponse() returns createLeaderEpochResponse(), and the same response fixture is therefore passed through checkResponse for every supported OFLE version.

checkResponse serializes the AbstractResponse at the supplied version, parses it through AbstractResponse.parseResponse(apiKey, readable, version), serializes it again, and compares the buffers. Thus OFLE has generic response serialize/deserialize/re-serialize coverage across every supported API version represented by ApiKeys.allVersions().

This is stronger than the previous wording "response-version coverage not established." The correct statement is:
- generic OFLE response wire round-trip across all supported versions: YES;
- semantic reducer behavior across those versions: NOT established;
- exhaustive response-shape edge cases: NOT established.

## Response-header boundary

RequestResponseTest has a generic testResponseHeader() and version-aware response serialization logic elsewhere (e.g. Fetch) using apiKey.responseHeaderVersion(version). AbstractResponse.parseResponse(ApiKeys, readable, version) parses the API body at the supplied version. The previously established AbstractResponse.parseResponse(ByteBuffer, RequestHeader) path also derives/checks the response header before parsing the body.

Therefore protocol framing/version machinery has generic coverage, but this does not constitute an OFLE-specific correlation-mismatch execution test.

## OFLE fixture limitation

createLeaderEpochResponse() is version-independent and contains three unique partition records over two topics. The all-version loop verifies that this same logical fixture survives OFLE schema serialization for each supported version. It does not inject:
- unrequested response partition;
- duplicate partition;
- duplicate with conflicting errors/endOffsets;
- missing requested partition (that is separately covered in OffsetForLeaderEpochClientTest);
- deliberate OFLE correlation mismatch.

## Final AB104 protocol/reducer boundary

PROTOCOL_REQUEST_ROUNDTRIP_ALL_OFLE_VERSIONS=YES
PROTOCOL_RESPONSE_ROUNDTRIP_ALL_OFLE_VERSIONS=YES
PROTOCOL_HEADER_GENERIC_COVERAGE=YES
OFLE_SPECIFIC_CORRELATION_MISMATCH_EXECUTED=NO
CONSUMER_REDUCER_MISSING_REQUESTED_EXECUTED=YES
CONSUMER_REDUCER_UNREQUESTED_EXECUTED=NO
CONSUMER_REDUCER_DUPLICATE_EXECUTED=NO
CONSUMER_REDUCER_MIXED_DUPLICATE_ERROR_EXECUTED=NO
CONSUMER_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Next exact mission

AB104.748: inspect whether an existing test utility can construct a deliberately mismatched OFLE response header and route it through a real/current NetworkClient or ConsumerNetworkClient path without production changes. If only generic mismatch coverage exists, preserve that distinction. No implementation/V21.
