# NEXO AB104.738 — All-Kafka EpochEndOffset/error-fixture search

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation. No V21.

## Finding

A broader current Apache Kafka test-tree search found substantially more OffsetForLeaderEpoch-related error fixture construction than the previous OffsetFetcher-only audit.

### 1. OffsetsRequestManagerTest

Current `clients/src/test/java/org/apache/kafka/clients/consumer/internals/OffsetsRequestManagerTest.java` contains:

- `buildOffsetsForLeaderEpochResponseWithErrors(...)`, which constructs `EpochEndOffset` entries and sets each partition's raw error code from a supplied `Errors` value.
- This helper is genuinely capable of arbitrary partition error construction.
- In the inspected OffsetForLeaderEpoch path, it is used for `TOPIC_AUTHORIZATION_FAILED` in `testValidatePositionsFailureWithUnrecoverableAuthException`.
- A separate `retriableErrors()` parameterized matrix exists, but its test `testRequestFailsWithRetriableError_RetrySucceeds` exercises the ListOffsets path, not the OffsetForLeaderEpoch reducer. Its values include NOT_LEADER_OR_FOLLOWER, REPLICA_NOT_AVAILABLE, KAFKA_STORAGE_ERROR, OFFSET_NOT_AVAILABLE, LEADER_NOT_AVAILABLE, FENCED_LEADER_EPOCH, BROKER_NOT_AVAILABLE, INVALID_REQUEST, UNKNOWN_LEADER_EPOCH and UNKNOWN_TOPIC_OR_PARTITION.

Therefore the existence of that parameterized list is NOT evidence that `OffsetsForLeaderEpochUtils.handleResponse` receives every one of those errors.

### 2. OffsetForLeaderEpochClientTest

Current direct client tests still include focused cases for:
- empty response;
- unexpected empty response;
- success;
- TOPIC_AUTHORIZATION_FAILED;
- LEADER_NOT_AVAILABLE.

Its helper can construct an `EpochEndOffset` with a supplied error, but the inspected suite does not enumerate every reducer branch.

### 3. FetcherTest

Current FetcherTest contains several EpochEndOffset/error constructions and parameterized fetch-error tests. These are principally FetchResponse/fetcher behavior and do not establish exhaustive coverage of the OffsetForLeaderEpoch reducer.

### 4. Core server OffsetForLeaderEpoch tests

Current `core/src/test/scala/unit/kafka/server/epoch/OffsetsForLeaderEpochTest.scala` constructs OffsetForLeaderEpoch response data including error cases such as `UNKNOWN_TOPIC_OR_PARTITION`.

This is server-side request handling evidence, not direct evidence that the consumer-side `OffsetsForLeaderEpochUtils.handleResponse` reducer has exhaustive client-side branch coverage.

### 5. Key correction

The broader search changes one narrow statement from AB104.737:

It is no longer accurate to say that Kafka has no arbitrary OffsetForLeaderEpoch error fixture anywhere in the current test tree.

The accurate statement is:

> Current Kafka tests contain reusable arbitrary-error OffsetForLeaderEpoch response construction, but the inspected uses do not establish exhaustive direct coverage of the consumer-side reducer `OffsetsForLeaderEpochUtils.handleResponse`.

In particular, the parameterized `retriableErrors()` matrix in OffsetsRequestManagerTest must not be misattributed to OffsetForLeaderEpoch; it belongs to ListOffsets behavior.

## Reducer branch coverage status

Reducer branches previously established from current source remain:

1. NONE -> success
2. NOT_LEADER_OR_FOLLOWER -> retry
3. REPLICA_NOT_AVAILABLE -> retry
4. KAFKA_STORAGE_ERROR -> retry
5. OFFSET_NOT_AVAILABLE -> retry
6. LEADER_NOT_AVAILABLE -> retry
7. FENCED_LEADER_EPOCH -> retry
8. UNKNOWN_LEADER_EPOCH -> retry
9. UNKNOWN_TOPIC_OR_PARTITION -> retry
10. TOPIC_AUTHORIZATION_FAILED -> terminal authorization
11. default -> retry

No direct current parameterized test was established that drives all eleven semantic branches through `OffsetsForLeaderEpochUtils.handleResponse`.

## Correlation status

The correlation parser implementation remains direct evidence that mismatched response/request correlation IDs are rejected, but the current test search still did not establish a deliberate mismatch-injection test.

## Epistemic status

SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
ARBITRARY_OFLE_ERROR_FIXTURE_EXISTS=YES
ARBITRARY_OFLE_ERROR_FIXTURE_USED_FOR_EXHAUSTIVE_REDUCER_MATRIX=NO
DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
ALL_ERROR_BRANCHES_TESTED=NO
MIXED_RAW_REDUCER_COVERAGE=UNKNOWN
LISTOFFSETS_RETRIABLE_MATRIX_EXISTS=YES
LISTOFFSETS_MATRIX_IS_OFLE_REDUCER_EVIDENCE=NO
EXPLICIT_CORRELATION_MISMATCH_TEST_FOUND=NO/NOT_ESTABLISHED
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

No Kafka source was modified. No Nexo implementation/runtime verification was performed.

## EXACT NEXT ACTION — AB104.739

1. Inspect every current call site of `buildOffsetsForLeaderEpochResponseWithErrors` and every OffsetForLeaderEpoch response helper in client tests.
2. Determine whether any existing test drives mixed partitions through the consumer-side reducer with multiple raw error classes in one response.
3. Inspect current `OffsetsForLeaderEpochUtils` source and identify whether its package visibility allows a direct unit-test seam without changing production code; this is research only, not implementation.
4. Continue correlation mismatch test search at the narrow parser/request layer.

Do not implement Nexo. Do not create V21.
