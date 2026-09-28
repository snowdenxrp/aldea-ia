# NEXO AB104.743 — OFLE response-shape and correlation follow-up audit

Date: 2026-09-28
Status: RESEARCH ONLY

## Scope
Continue AB104.742: duplicate/missing/unrequested OffsetForLeaderEpoch response shapes; direct correlation-mismatch construction/test evidence; response-header parsing boundary; serialization/version evidence.

## Current Kafka source evidence
Inspected current Kafka source at commit `abf522e1ca5d7f4375baddc4da004da9fcb6e9ca`.

### OffsetsForLeaderEpochUtils.handleResponse
File: `clients/src/main/java/org/apache/kafka/clients/consumer/internals/OffsetsForLeaderEpochUtils.java`.

Observed behavior:
- Initializes `partitionsToRetry` from the complete requested key set.
- Iterates response topic/partition entries.
- Unrequested response partitions are explicitly ignored.
- `NONE`: records EpochEndOffset, removes the partition from retry.
- Seven named errors remain retryable.
- `UNKNOWN_TOPIC_OR_PARTITION` remains retryable.
- `TOPIC_AUTHORIZATION_FAILED`: removes partition from retry and accumulates topic for terminal exception.
- Default error path remains retryable.
- Duplicate entries are not rejected by the reducer.
- Therefore duplicate semantics are order-dependent at the reducer boundary: later entries can overwrite endOffset state; once a partition is removed from retry by NONE/authorization, later retry-class entries do not re-add it because retry removal is monotonic within this local set operation.

### Correlation boundary
Current `AbstractResponse.parseResponse(ByteBuffer, RequestHeader)` parses the ResponseHeader using the API-version-specific response-header version, compares response/request correlation IDs, and throws `CorrelationIdMismatchException` before API-body parsing when they differ.

This establishes implementation-level parser rejection, not executed deliberate-mismatch test evidence.

### Test-source search result
Searches did not establish:
- a dedicated `OffsetsForLeaderEpochUtilsTest`;
- an explicit duplicate OFLE response test;
- an explicit missing-requested-partition OFLE response test;
- an explicit unrequested-partition OFLE reducer test;
- a deliberate correlation-ID mismatch execution test.

Existing implementation/helper capability and positive correlation serialization tests must not be promoted to executed fault-injection evidence.

### Serialization/version evidence
Current `RequestResponseTest` contains OffsetForLeaderEpoch response construction and generic response-header serialization/size/round-trip infrastructure. This demonstrates a controlled serialization path, but the inspected evidence does not establish deliberate mismatch execution or exhaustive OFLE response-shape testing across API versions.

## Nexo research consequence
The safe evidence boundary remains immediately before semantic reduction:

`RequestHeader + ResponseHeader + API/version + correlation + raw response entries + transport outcome + authoritative generation/incarnation`

must remain available before reducer collapse if later claims depend on distinguishing raw protocol faults, semantic retry, authorization, duplicates, omissions, or unrequested data.

For response-shape integrity, the following must remain separate claims:
- response parsed successfully;
- correlation matched;
- every requested partition was represented;
- no unrequested partition was present;
- no duplicate partition was present;
- each raw error code was preserved;
- reducer outcome is semantically correct;
- provider/resource incarnation remained valid.

A reducer that tolerates or ignores malformed/extra shapes is not by itself proof that the input was semantically complete.

## Epistemic status
SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
CORRELATION_VALIDATION_IMPLEMENTED=YES
CONTROLLED_CORRELATION_SERIALIZATION_PATH=YES
DELIBERATE_CORRELATION_MISMATCH_EXECUTED=NO/NOT_ESTABLISHED
DUPLICATE_OFLE_TEST_EXECUTED=NO/NOT_ESTABLISHED
MISSING_OFLE_TEST_EXECUTED=NO/NOT_ESTABLISHED
UNREQUESTED_OFLE_TEST_EXECUTED=NO/NOT_ESTABLISHED
DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
MIXED_RAW_REDUCER_COVERAGE=UNKNOWN
API-VERSION_EXHAUSTIVE_RESPONSE-SHAPE_COVERAGE=UNKNOWN
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next action
AB104.744: inspect Kafka's current response-header/version tests and the exact OFLE Request/Response serialization test cases; determine whether controlled ByteBuffer construction can establish a research-only deliberate correlation mismatch path without production changes. In parallel, search for any parameterized response-shape tests by API key/version that could indirectly cover duplicate/missing/unrequested semantics. If execution evidence remains absent, freeze the gaps rather than inferring coverage.

No Kafka source modified. No Nexo implementation. No V21.
