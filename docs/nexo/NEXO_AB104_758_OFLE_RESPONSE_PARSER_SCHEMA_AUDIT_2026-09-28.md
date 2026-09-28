# NEXO AB104.758 — OFLE response parser/schema audit

Date: 2026-09-28
Scope: exact OFLE response parser entry point and minimal response construction.

## Findings

Current `OffsetsForLeaderEpochResponse.parse(Readable readable, short version)` constructs `OffsetForLeaderEpochResponseData(readable, version)` and wraps it in `OffsetsForLeaderEpochResponse`.

The generic `AbstractResponse.parseResponse` dispatches OFFSET_FOR_LEADER_EPOCH to this parser only after correlation validation succeeds.

The response object itself is directly constructible from `OffsetForLeaderEpochResponseData`; existing Kafka tests construct a data object, add `OffsetForLeaderTopicResult`, then add `EpochEndOffset` records with partition/error/leaderEpoch/endOffset fields. This confirms the planned one-topic/one-partition response is an established construction pattern.

The parser consumes the body using the same API version supplied by the request header. Thus header-version selection and body-version selection are coupled through the request API version, but there is no separate response-version selector that must be supplied to the mismatch test.

For the mismatch test, the body is intentionally not the subject of the assertion: a structurally valid minimal response remains preferable because it avoids conflating malformed-body behavior with correlation validation. Existing test fixtures demonstrate such construction.

## Boundary

Matching correlation:
header parse → correlation compare → OFLE body parse(version)

Mismatching correlation:
header parse → correlation compare → exception
                                     ↘ OFLE body parser NOT INVOKED

## Status

OFLE_RESPONSE_PARSER_SOURCE_VERIFIED=YES
OFLE_RESPONSE_DATA_CONSTRUCTOR_PATTERN=SOURCE_VERIFIED
ONE_TOPIC_ONE_PARTITION_RESPONSE=SPECIFIABLE
BODY_VERSION_COMES_FROM_REQUEST_API_VERSION=SOURCE_VERIFIED
SEPARATE_RESPONSE_VERSION_SELECTOR_REQUIRED=NO
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next mission

AB104.759: inspect the exact `RequestTestUtils.serializeResponseWithHeader` implementation and the underlying serialization path to prove that the deliberately chosen response correlation ID is encoded into the wire header while preserving the selected OFLE version/body. Preserve NOT EXECUTED.
