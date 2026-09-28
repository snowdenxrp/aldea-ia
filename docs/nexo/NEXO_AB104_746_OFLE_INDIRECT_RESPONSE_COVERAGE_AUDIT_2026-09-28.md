# NEXO AB104.746 — OFLE indirect response-shape coverage audit

Date: 2026-09-28
Status: RESEARCH ONLY

## Search result

Repository-wide current-source search found explicit production handling for unrequested OFLE response partitions in OffsetsForLeaderEpochUtils.handleResponse:
- if response TopicPartition is absent from requestData, it logs and continues;
- therefore the behavior is intentionally defined as ignore, not reject.

However, no current dedicated consumer-client test was found that constructs an unrequested OFLE response partition and asserts this behavior.

A separate core AbstractFetcherThreadTest contains an OFLE-related unrequested-partition scenario, but it exercises the server/fetcher truncation path, not the consumer-side OffsetsForLeaderEpochUtils reducer. It therefore cannot be promoted to consumer reducer coverage.

## RequestResponseTest

RequestResponseTest.createLeaderEpochResponse() creates a multi-topic, multi-partition OFLE response and participates in generic response error-count testing. This establishes response object construction and error-count behavior, but not reducer semantics because it does not feed the response through OffsetsForLeaderEpochUtils.handleResponse with a requestData set.

Its sample response has unique requested-looking partitions; it does not characterize duplicates or unrequested consumer response entries.

## Duplicate semantics

The reducer uses a Map keyed by TopicPartition for endOffsets and iterates response entries in wire/list order. There is no duplicate detection before processing. Consequently duplicate response entries remain an uncharacterized semantic edge at test level, and source inspection indicates order can affect the final map value and retry state.

This remains a source-derived observation, not an executed test result.

## Version boundary

Request message version transitions are covered by MessageTest as recorded in AB104.745. RequestResponseTest's generic response fixture does not establish exhaustive OFLE response semantic coverage across all protocol versions.

## Refined evidence matrix

OFLE_REQUEST_MESSAGE_ROUNDTRIP_VERSION_COVERAGE=YES
OFLE_RESPONSE_OBJECT_GENERIC_CONSTRUCTION=YES
OFLE_RESPONSE_REDUCER_UNREQUESTED_EXECUTED=NO
OFLE_RESPONSE_REDUCER_MISSING_REQUESTED_EXECUTED=YES
OFLE_RESPONSE_REDUCER_DUPLICATE_EXECUTED=NO
OFLE_RESPONSE_REDUCER_DUPLICATE_ORDER_EXECUTED=NO
OFLE_RESPONSE_REDUCER_MIXED_DUPLICATE_ERROR_EXECUTED=NO
OFLE_RESPONSE_REDUCER_CORRELATION_MISMATCH_EXECUTED=NO
OFLE_SERVER/FETCHER_UNREQUESTED_SCENARIO=YES_BUT_DIFFERENT_LAYER
DIRECT_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Next

AB104.747: inspect RequestResponseTest's all-version loops and the OFLE response header/version path; determine exactly what generic response serialization tests do and do not establish for OFLE. Then freeze the protocol-vs-reducer boundary. No production changes.
