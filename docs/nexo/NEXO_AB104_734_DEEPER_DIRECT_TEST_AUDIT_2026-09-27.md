# NEXO AB104.734 — deeper direct-test audit

Date: 2026-09-27

Current Kafka evidence inspected directly:

1. `OffsetForLeaderEpochClientTest` contains five focused direct tests: empty response, unexpected empty response, successful response preserving errorCode/leaderEpoch/endOffset, topic authorization failure, and LEADER_NOT_AVAILABLE retry. This is not exhaustive reducer branch coverage.

2. `NetworkClientTest.testRequestTimeout` directly compares a successful response with a simulated timeout. Success asserts neither disconnected nor timed out; timeout asserts both disconnected and timed out. This establishes transport outcome classification in the client test, not external-world commit status.

3. The inspected current NetworkClientTest still contains no established deliberate mismatched-correlation response injection test. Correlation matching remains supported by source behavior and normal-response assertions, but the dedicated rejection path is not counted as tested without direct evidence.

4. `OffsetFetcherTest` directly exercises multi-partition request grouping and stale/fencing validation behavior, but this does not prove exhaustive mixed raw reducer combinations.

## Status
- SOURCE_CODE_VERIFIED=YES
- TEST_SOURCE_VERIFIED=YES
- DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
- ALL_ERROR_BRANCHES_TESTED=NO
- MIXED_RAW_REDUCER_COVERAGE=UNKNOWN
- EXPLICIT_CORRELATION_MISMATCH_TEST=NOT_ESTABLISHED
- TIMEOUT_TEST=YES
- DISCONNECT_TEST=YES
- STALE_INFLIGHT_TEST=YES
- UNSUPPORTED_CAPABILITY_TEST=YES
- NEXO_IMPLEMENTED=NO
- NEXO_RUNTIME_EXECUTED=NO
- NEXO_CORRECTNESS_VERIFIED=NO
- TLC= PENDING

No Kafka source was modified. No Nexo implementation was performed.

## Next exact action
AB104.735: search the current Kafka test tree for parameterized/error-matrix coverage of every `OffsetsForLeaderEpochUtils.handleResponse` branch, and separately locate any exact NetworkClient response-correlation validation test outside the inspected file. Do not infer test coverage from implementation.
