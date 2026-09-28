# NEXO AB104.729 — OffsetForLeaderEpoch reducer direct-coverage audit

Date: 2026-09-28

Status: SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; DIRECT_REDUCER_TEST_FOUND=NO; EXHAUSTIVE_REDUCER_COVERAGE=UNKNOWN; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO

## Exact evidence

Current Apache Kafka source contains `OffsetsForLeaderEpochUtils.handleResponse()` as the reducer boundary. It initializes every requested partition in `partitionsToRetry`, removes a partition only for `Errors.NONE`, and otherwise collapses multiple response errors into the same retry set. `TOPIC_AUTHORIZATION_FAILED` removes the partition from retry and accumulates an unauthorized topic, then throws `TopicAuthorizationException`. Unknown/unrequested partitions are ignored.

The current `OffsetForLeaderEpochClientTest` exercises the reducer indirectly through the client with:
- empty request/empty response;
- requested partition with an empty response;
- successful `Errors.NONE`;
- `TOPIC_AUTHORIZATION_FAILED`;
- one representative retry error, `LEADER_NOT_AVAILABLE`.

The current search found no dedicated `OffsetsForLeaderEpochUtilsTest` and no direct test invoking `handleResponse()` by that name. Repository history shows the utility extraction came from the older OffsetForLeaderEpochClient implementation in commit `a7e865c0a756504cc7ae6f4eb0772cadd3333c53`, but the current test evidence still does not establish exhaustive direct reducer coverage.

## Reducer branch matrix

Current source branches are:

1. `NONE` -> store `EpochEndOffset`, remove partition from retry.
2. `NOT_LEADER_OR_FOLLOWER` -> retry.
3. `REPLICA_NOT_AVAILABLE` -> retry.
4. `KAFKA_STORAGE_ERROR` -> retry.
5. `OFFSET_NOT_AVAILABLE` -> retry.
6. `LEADER_NOT_AVAILABLE` -> retry.
7. `FENCED_LEADER_EPOCH` -> retry.
8. `UNKNOWN_LEADER_EPOCH` -> retry.
9. `UNKNOWN_TOPIC_OR_PARTITION` -> retry.
10. `TOPIC_AUTHORIZATION_FAILED` -> terminal authorization exception.
11. `default` -> retry.

The current downstream/client test only proves one member of the retry behavior (`LEADER_NOT_AVAILABLE`). It does not prove that every explicit retry branch remains mapped to retry, nor that a future/unexpected error follows the intended default branch.

## Nexo implication

The reducer output intentionally loses raw error identity for retry-classified responses: several distinct protocol errors become only membership in `partitionsToRetry`. Therefore downstream retry-state assertions cannot establish raw error provenance.

If Nexo requires the distinction, the raw per-partition `EpochEndOffset.errorCode` must be captured before this reduction boundary and bound to the request/operation identity. The reduced retry state must not be treated as a substitute for that provenance.

## Minimum Nexo adversarial test matrix

Without modifying Kafka, the smallest useful Nexo-side matrix should contain:

- success: `NONE`;
- every explicit retry branch individually: the seven named retry errors;
- `UNKNOWN_TOPIC_OR_PARTITION`;
- `TOPIC_AUTHORIZATION_FAILED` terminal exception;
- default/unrecognized error handling;
- empty response for a requested partition;
- unrequested partition in the response;
- mixed multi-partition response containing success + retry + authorization;
- duplicate/contradictory partition entries, if the transport/parser can expose them;
- raw-error provenance captured before reduction and preserved through retry/reconciliation.

The first ten rows cover reducer branch semantics. The remaining rows are necessary to test set initialization, filtering, mixed outcomes, and provenance boundaries rather than merely individual error-code mapping.

## Closure status

Direct reducer coverage remains UNKNOWN for Kafka. The existence of indirect client tests is established, but they are not evidence of exhaustive reducer coverage.

No Kafka source was modified. No Nexo implementation was performed. No test was executed by Nexo. No broker durability or correctness claim is made. TLC remains PENDING.

## EXACT NEXT ACTION

AB104.730 — inspect Kafka protocol response construction/tests and the commit history around `OffsetsForLeaderEpochUtils.handleResponse()` for any additional response-shape or error-code cases that can bypass the matrix above; then cross-check whether Nexo's provenance boundary must preserve any fields beyond raw `errorCode` (leader epoch/end offset/request identity) before reduction.
