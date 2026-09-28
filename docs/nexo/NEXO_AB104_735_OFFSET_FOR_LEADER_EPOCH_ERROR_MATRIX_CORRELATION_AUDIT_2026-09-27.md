# NEXO AB104.735 — OffsetForLeaderEpoch error-matrix + correlation audit

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation. No V21.

## Scope

Continue AB104.734 by directly searching current Apache Kafka source/test tree for:
1. parameterized/error-matrix tests covering every branch of `OffsetsForLeaderEpochUtils.handleResponse()`;
2. an explicit response-correlation mismatch test elsewhere in the current test tree;
3. direct assertions versus implementation-only evidence.

## Direct current source findings

Current `OffsetsForLeaderEpochUtils.handleResponse()` was retrieved from Apache Kafka `trunk`.

The reducer initializes all requested partitions in `partitionsToRetry`, then processes each returned partition:
- `NONE`: stores the raw `EpochEndOffset` in `endOffsets` and removes the partition from retry.
- `NOT_LEADER_OR_FOLLOWER`
- `REPLICA_NOT_AVAILABLE`
- `KAFKA_STORAGE_ERROR`
- `OFFSET_NOT_AVAILABLE`
- `LEADER_NOT_AVAILABLE`
- `FENCED_LEADER_EPOCH`
- `UNKNOWN_LEADER_EPOCH`

The seven errors above remain in the retry set and therefore collapse to the same reduced retry state.

`UNKNOWN_TOPIC_OR_PARTITION` also remains retry-classified.

`TOPIC_AUTHORIZATION_FAILED` adds the topic to an unauthorized set and removes that partition from retry; a non-empty unauthorized set causes `TopicAuthorizationException`.

The `default` branch also leaves the partition retry-classified.

An unrequested topic/partition is logged and ignored.

This confirms that raw `errorCode` provenance is lost for the retry-classified branches after reduction.

## Test search result

Current GitHub code search found no dedicated `OffsetsForLeaderEpochUtilsTest` and no matches establishing a parameterized test matrix for the named reducer branches.

The current `OffsetForLeaderEpochClientTest` remains the five-test focused suite already recorded in AB104.734:
- empty response;
- unexpected empty response;
- successful response;
- authorization failure;
- one retriable error (`LEADER_NOT_AVAILABLE`).

Direct searches for the other explicit reducer errors did not find additional tests tied to this client test/reducer path.

Therefore:
- ALL_ERROR_BRANCHES_TESTED = NO
- DIRECT_REDUCER_EXHAUSTIVE_COVERAGE = NO
- MIXED_RAW_REDUCER_COVERAGE = UNKNOWN

The absence of search hits is not proof that no indirect coverage exists; only direct evidence found in the current accessible tree is counted.

## Correlation mismatch audit

Current `AbstractResponse.parseResponse(ByteBuffer, RequestHeader)` directly checks:

request correlation ID != response correlation ID

and throws `CorrelationIdMismatchException` carrying both IDs.

Current `NetworkClient.parseResponse(...)` catches that exception for protocol-specific handling.

Current source therefore establishes an implementation-level response/request correlation validation boundary.

Search for an explicit current test using `CorrelationIdMismatchException` or an intentional mismatched response correlation did not find a dedicated direct assertion in the inspected current test tree.

Existing `NetworkClientTest` evidence still covers normal response correlation, disconnect/timeout behavior, and version negotiation, but that is not equivalent to deliberately injecting a mismatched response correlation.

Therefore:
- CORRELATION_VALIDATION_IMPLEMENTED = YES
- EXPLICIT_CORRELATION_MISMATCH_TEST_FOUND = NO / NOT ESTABLISHED
- TIMEOUT_TEST = YES
- DISCONNECT_TEST = YES

## Nexo provenance consequence

The strongest currently supported capture boundary remains immediately after parsing and before `handleResponse()` reduction.

Candidate minimum record remains:

`OperationID, ApiKey, ApiVersion, HeaderVersion, ClientID, CorrelationID, DestinationNodeID, RequestTime, ResponseTime, Topic, Partition, ResponseErrorCode, ResponseLeaderEpoch(if supplied), ResponseEndOffset, ProtocolSchemaIdentity, ParsingStatus, TransportOutcome, authoritative generation/version/incarnation where independently available`.

Do not infer topic or broker incarnation from topic name or node ID alone.

## Epistemic status

SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
ALL_ERROR_BRANCHES_TESTED=NO
MIXED_RAW_REDUCER_COVERAGE=UNKNOWN
CORRELATION_VALIDATION_IMPLEMENTED=YES
EXPLICIT_CORRELATION_MISMATCH_TEST_FOUND=NO/NOT_ESTABLISHED
TIMEOUT_TEST=YES
DISCONNECT_TEST=YES
STALE_INFLIGHT_TEST=YES
UNSUPPORTED_CAPABILITY_TEST=YES
TOPIC_INCARNATION=UNKNOWN
BROKER_INCARNATION=UNKNOWN
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

No Kafka source was modified. No Nexo code was implemented. No runtime execution or formal correctness claim was made.

## Exact next action

AB104.736:
1. inspect the current Kafka test fixtures/helpers that can construct raw OffsetForLeaderEpoch responses and determine whether a direct reducer matrix can be proven indirectly through shared helpers;
2. inspect `NetworkClient.parseResponse` and its surrounding tests for protocol-error handling after a correlation mismatch, distinguishing parser rejection from transport disconnect;
3. inspect current fault-proxy/integration tests for deliberate response mutation, while preserving the distinction between infrastructure capability and an actually executed test;
4. keep raw error provenance, request identity, correlation, transport outcome, and incarnation as separate evidence fields.

Do not implement Nexo. Do not create V21.
