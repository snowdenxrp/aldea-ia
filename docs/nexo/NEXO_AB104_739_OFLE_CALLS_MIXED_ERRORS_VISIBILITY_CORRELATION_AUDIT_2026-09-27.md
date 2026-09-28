# NEXO AB104.739 — OffsetForLeaderEpoch call-sites, mixed errors, reducer visibility, correlation audit

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation. No V21.

## 1. Exact helper call sites

Current repository search found exactly one current call site for:
`buildOffsetsForLeaderEpochResponseWithErrors`

It is in:
`clients/src/test/java/org/apache/kafka/clients/consumer/internals/OffsetsRequestManagerTest.java`

The call is:
`testValidatePositionsFailureWithUnrecoverableAuthException`

It supplies exactly one partition mapped to:
`Errors.TOPIC_AUTHORIZATION_FAILED`

The helper itself constructs each response partition with the supplied raw `errorCode`, but no `leaderEpoch` or `endOffset` is set in that helper.

Thus:
- arbitrary error fixture capability = YES
- current call-site coverage found = authorization-only
- mixed-error call-site coverage = NOT ESTABLISHED

## 2. Direct reducer path

Current source `OffsetsRequestManager.java` directly receives the parsed `OffsetsForLeaderEpochResponse` and calls:
`OffsetsForLeaderEpochUtils.handleResponse(fetchPositions, offsetsForLeaderEpochResponse)`

Current `OffsetsForLeaderEpochUtils.handleResponse` is public static, so a direct test seam exists without changing production visibility.

Its implementation initializes:
`partitionsToRetry = requestData.keySet()`

It then removes successful `NONE` partitions and authorization-failed partitions, while the listed retriable/default/unknown-topic cases leave the partition in the retry set.

Important semantic detail:
`UNKNOWN_TOPIC_OR_PARTITION` is explicitly logged but remains in `partitionsToRetry`.
`TOPIC_AUTHORIZATION_FAILED` removes the partition and records its topic for a terminal `TopicAuthorizationException`.
Any unrecognized/default error also remains retryable.

## 3. Branch count

The current switch has these semantic groups:
- success: NONE
- retry: NOT_LEADER_OR_FOLLOWER, REPLICA_NOT_AVAILABLE, KAFKA_STORAGE_ERROR, OFFSET_NOT_AVAILABLE, LEADER_NOT_AVAILABLE, FENCED_LEADER_EPOCH, UNKNOWN_LEADER_EPOCH
- retry with warning: UNKNOWN_TOPIC_OR_PARTITION
- terminal authorization: TOPIC_AUTHORIZATION_FAILED
- default: all other Errors

Therefore direct exhaustive testing must include both explicit branches and at least one default-path error not named in the switch.

A raw error matrix must test observable result state, not merely that no exception occurred.

## 4. Mixed partition behavior

The reducer is inherently multi-partition because `requestData` and response data are maps/collections. A mixed test should combine, in one response, at minimum:
- one NONE partition;
- one retriable error;
- one UNKNOWN_TOPIC_OR_PARTITION;
- one TOPIC_AUTHORIZATION_FAILED;
- optionally one unrequested partition.

The expected authorization case is exceptional for the whole call, so a second mixed test without authorization is needed to inspect the resulting `endOffsets` and `partitionsToRetry` precisely.

No such direct mixed reducer test was established in the current search.

## 5. Visibility / direct test seam

`OffsetsForLeaderEpochUtils.handleResponse` is currently `public static`.

Therefore there is no production-visibility obstacle to a direct unit test in the same client test module.

This is an architectural/testing observation only. No test was added and no production source was modified.

## 6. Correlation audit

Current search for deliberate test use of `CorrelationIdMismatchException`, `assertThrows(CorrelationIdMismatchException...)`, and direct mismatch-injection phrases did not establish a current dedicated test.

Current implementation remains the evidence that parsing rejects a response whose correlation ID does not match the request header.

This must remain:
IMPLEMENTATION EVIDENCE != EXECUTED TEST EVIDENCE.

## 7. Important correction / state

AB104.738 established arbitrary fixture capability. AB104.739 establishes that its only discovered current OffsetForLeaderEpoch call site is authorization-only.

Therefore the missing direct matrix is narrower and more actionable than previously stated:
- fixture construction exists;
- direct reducer seam exists;
- production source contains explicit branch semantics;
- exhaustive direct test execution/source coverage is still NOT ESTABLISHED.

## Epistemic status

SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
ARBITRARY_OFLE_ERROR_FIXTURE_EXISTS=YES
ARBITRARY_OFLE_ERROR_FIXTURE_CALLSITE_COVERAGE=AUTHORIZATION_ONLY
MIXED_OFLE_RAW_ERROR_CALLSITE=NOT_ESTABLISHED
DIRECT_REDUCER_SEAM=YES
DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
ALL_ERROR_BRANCHES_TESTED=NO
MIXED_RAW_REDUCER_COVERAGE=UNKNOWN
CORRELATION_VALIDATION_IMPLEMENTED=YES
EXPLICIT_CORRELATION_MISMATCH_TEST_FOUND=NO/NOT_ESTABLISHED
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT NEXT ACTION — AB104.740

1. Inspect all existing direct tests around `OffsetsForLeaderEpochUtils` by class/package and search method names beyond textual symbol matches.
2. Build the minimal direct branch/mixed test matrix as a RESEARCH SPECIFICATION only, without implementing it.
3. Continue correlation mismatch audit by inspecting `AbstractResponse.parseResponse` and nearby protocol tests for raw buffer/request-header construction.
4. Preserve the distinction between source test presence and actual execution.

No Nexo implementation. No V21.
