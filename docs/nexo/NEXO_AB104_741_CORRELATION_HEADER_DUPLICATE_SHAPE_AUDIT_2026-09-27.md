# NEXO AB104.741 — correlation header and duplicate/shape audit

Date: 2026-09-27
Status: RESEARCH ONLY.

## 1. Exact correlation parser path

Current Apache Kafka source `AbstractResponse.parseResponse(ByteBuffer, RequestHeader)`:

1. Reads API key and API version from the request header.
2. Computes the response-header version through `apiKey.responseHeaderVersion(apiVersion)`.
3. Parses `ResponseHeader` from the same buffer.
4. Compares request correlation ID with parsed response correlation ID.
5. On mismatch, throws `CorrelationIdMismatchException` carrying both IDs.
6. Only after that check does it parse the response body.

Thus a correlation mismatch is rejected before the response body reaches the API-specific response parser.

`ResponseHeader` itself serializes/deserializes a correlation ID and exposes the header version. Current RequestResponseTest contains a positive round-trip test for ResponseHeader and tests that preserve matching correlation IDs. No deliberate mismatch test was found.

Current full-response test construction is sufficient to construct controlled headers: responses use `toSend(new ResponseHeader(correlationId, responseHeaderVersion), version)`, and the serialized buffer can then be parsed. This demonstrates a concrete fixture path from a chosen correlation ID to a serialized response. It still does not establish that a mismatch test has been executed.

## 2. OffsetForLeaderEpoch protocol implication

For the OFLE path, the provenance capture point remains immediately after successful response parsing and before `OffsetsForLeaderEpochUtils.handleResponse`.

At that point the request header/correlation and parsed response can still be associated. After reducer execution, raw error identity can collapse into retry membership.

## 3. Response-shape semantics discovered directly in current reducer

The reducer initializes:
`partitionsToRetry = requestData.keySet()`.

Unrequested response partitions are explicitly ignored.

For duplicate entries for the same requested partition, there is no duplicate rejection or explicit conflict handling. Iteration order therefore matters:

- error/retry entry followed by NONE: NONE removes the partition from retry and stores its EpochEndOffset.
- NONE followed by a retry-class error: the later retry branch does not re-add the partition, so the partition remains absent from `partitionsToRetry`.
- NONE followed by another NONE: later `EpochEndOffset` overwrites the map value.
- authorization causes removal from retry and eventually throws; if a prior NONE stored an end offset, the exception prevents the normal result from being returned.
- authorization followed by NONE still ends in authorization exception; the later NONE can mutate the local result before the throw.

Therefore duplicate response entries are not a neutral formatting issue; they expose order-dependent reducer behavior. No current dedicated test was found that characterizes this behavior.

Missing response entries remain in `partitionsToRetry` because the set starts with all requested partitions and only successful/authorization entries remove them.

## 4. Minimal additional shape matrix

Add to the research specification:
- missing requested partition;
- unrequested topic/partition;
- duplicate retry -> NONE;
- duplicate NONE -> retry;
- duplicate NONE -> NONE;
- duplicate authorization -> any other branch;
- multiple duplicates across different partitions;
- empty response;
- response topic with zero partitions;
- mixed requested/unrequested entries.

These remain test-design items, not execution evidence.

## 5. Epistemic status

SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
CONTROLLED_CORRELATION_SERIALIZATION_PATH=YES
POSITIVE_CORRELATION_TEST=YES
DELIBERATE_MISMATCH_TEST_EXECUTED=NO/NOT_ESTABLISHED
DUPLICATE_RESPONSE_EXPLICIT_TEST=NO/NOT_ESTABLISHED
MISSING_RESPONSE_EXPLICIT_TEST=NO/NOT_ESTABLISHED
UNREQUESTED_RESPONSE_TEST=YES (source behavior inspected; direct dedicated test not established)
ORDER_DEPENDENT_DUPLICATE_BEHAVIOR=DERIVED_FROM_SOURCE_CODE
DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT NEXT ACTION — AB104.742

1. Search current Kafka test tree specifically for duplicate OFLE response entries, missing requested partitions, and unrequested partitions.
2. Search for any direct correlation mismatch construction using ResponseHeader/ByteBuffer/RequestHeader.
3. Inspect OffsetForLeaderEpoch response serialization/version tests to determine which response-header versions are exercised.
4. Record whether the remaining gaps can be closed by source evidence or require actual execution.
