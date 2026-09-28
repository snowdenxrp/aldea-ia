# NEXO AB104.733 — OffsetForLeaderEpoch direct-test audit

Date: 2026-09-27
Status: RESEARCH ONLY — no Nexo implementation, no Kafka modification, no runtime Nexo verification, no TLC/formal proof.

## Scope
Direct audit of current Apache Kafka tests around OffsetForLeaderEpoch reducer/client behavior, NetworkClient correlation, disconnect/timeout behavior, unsupported versions, stale/in-flight responses, and mixed-partition validation.

## Direct evidence
1. `OffsetForLeaderEpochClientTest` directly asserts:
   - empty response with empty request => no retry/end offsets;
   - unexpected empty response for a requested partition => partition retry;
   - successful response preserves error code, leader epoch and end offset in the reduced result;
   - TOPIC_AUTHORIZATION_FAILED becomes TopicAuthorizationException;
   - LEADER_NOT_AVAILABLE becomes retry state.
   This is direct client-path evidence, but not exhaustive reducer branch coverage.

2. `OffsetFetcherTest` directly asserts:
   - grouping of OffsetForLeaderEpoch requests by node/partitions;
   - waiting for NodeApiVersions before sending validation request;
   - validation skipped when broker capability range is too old (configured OffsetForLeaderEpoch max version 2; validation requires v3+ in the tested path);
   - validation skipped for old metadata responses lacking reliable leader epoch;
   - undefined leader epoch/end offset handling;
   - stale/in-flight validation response is ignored after the consumer seeks to a different position;
   - leader-epoch fencing causes an in-flight validation result to be rejected and a subsequent validation round to use the newer epoch.

3. `NetworkClientTest` directly asserts:
   - normal response correlation to the originating request;
   - disconnect converts in-flight requests into disconnected ClientResponse objects retaining the originating correlation IDs;
   - timeout behavior is exercised through the request timing path;
   - API-version discovery and unsupported API-version handling are tested.
   No directly located test was found in the inspected current file that deliberately injects a mismatched response correlation ID and asserts the rejection path.

## Important distinction
The tests above establish behavior of client layers and validation state machines. They do NOT establish exhaustive direct coverage of `OffsetsForLeaderEpochUtils.handleResponse()`. The reducer still has multiple raw error branches that collapse into retry membership. Therefore downstream assertions cannot reconstruct the original raw error provenance.

## Mixed-partition coverage
Current direct client test coverage includes multi-partition request grouping in `OffsetFetcherTest`, but the dedicated `OffsetForLeaderEpochClientTest` cases inspected are single-partition. The searched evidence does not establish exhaustive mixed success/retry/authorization combinations at the raw reducer boundary. Keep this UNKNOWN.

## Correlation / stale / disconnect interpretation
A normal correlated response is directly tested. Disconnect responses are directly tested as disconnected outcomes, and stale validation after a seek is directly tested as ignored. These are distinct from proving that a particular external-world action did or did not occur. A transport timeout/disconnect remains non-success provenance for Nexo and must not be converted into NOT_COMMITTED without reconciliation.

## Unsupported-version interpretation
The OffsetFetcher tests directly cover a broker capability range where OffsetForLeaderEpoch versions 0..2 are available and validation is skipped because the tested validation path requires v3+. This is capability-selection behavior, not proof of every version-negotiation edge case or protocol compatibility guarantee.

## Coverage status
- SOURCE_CODE_VERIFIED: YES for inspected test/source paths.
- TEST_SOURCE_VERIFIED: YES.
- DIRECT_REDUCER_EXHAUSTIVE_COVERAGE: NO.
- MIXED_RAW_REDUCER_COMBINATION_COVERAGE: UNKNOWN.
- EXPLICIT_CORRELATION-MISMATCH_TEST_FOUND: NOT ESTABLISHED in inspected NetworkClientTest.
- STALE_INFLIGHT_VALIDATION_TEST: YES.
- DISCONNECT_OUTCOME_TEST: YES.
- UNSUPPORTED_CAPABILITY_TEST: YES.
- TOPIC_INCARNATION: UNKNOWN.
- BROKER_INCARNATION: UNKNOWN.
- NEXO_IMPLEMENTED: NO.
- NEXO_RUNTIME_EXECUTED: NO.
- NEXO_CORRECTNESS_VERIFIED: NO.
- TLC/FORMAL_VERIFICATION: PENDING.

## Minimum remaining adversarial gap
Before treating the reducer evidence as closed, directly obtain/inspect any current dedicated reducer tests or equivalent parameterized tests, if present, and explicitly account for every reducer branch plus mixed/duplicate/unrequested partition shapes. Also continue the NetworkClient correlation-mismatch audit without inferring a test from source implementation alone.

## Canonical next action
AB104.734 must not be assigned until this AB104.733 record is committed. Next: direct search/inspection for any additional current Kafka tests that exercise the reducer through parameterized/error matrices and exact NetworkClient correlation-mismatch rejection, then preserve UNKNOWN where no direct test evidence exists.
