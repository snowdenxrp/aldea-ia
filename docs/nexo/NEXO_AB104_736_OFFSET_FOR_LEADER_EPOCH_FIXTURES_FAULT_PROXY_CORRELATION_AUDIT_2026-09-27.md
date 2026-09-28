# NEXO AB104.736 — OffsetForLeaderEpoch fixtures, fault proxy and correlation audit

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation. No V21.

## Findings

### 1. Exact current client path

Current Apache Kafka `OffsetsForLeaderEpochClient` is a thin `AsyncClient` adapter:
- `prepareRequest` delegates to `OffsetsForLeaderEpochUtils.prepareRequest`.
- `handleResponse` delegates directly to `OffsetsForLeaderEpochUtils.handleResponse(requestData, response)`.

Current `OffsetsRequestManager` also contains a direct path where an `OffsetsForLeaderEpochResponse` is passed to `OffsetsForLeaderEpochUtils.handleResponse(fetchPositions, response)`.

This confirms the reducer is not merely hypothetical: it is the concrete semantic reduction point in the current client path.

### 2. Raw-response fixture/helper search

Search for a dedicated `OffsetForLeaderEpochResponseTest` and dedicated reducer fixture matrix did not find one in the accessible current tree.

The existing `OffsetForLeaderEpochClientTest` therefore remains the strongest directly identified focused suite. Its five tests do not enumerate every reducer error branch.

Shared helpers in `OffsetFetcherTest` can construct/prepare OffsetForLeaderEpoch responses and exercise multi-partition/stale/fencing behavior, but their existence is not equivalent to exhaustive raw reducer assertions.

### 3. Fault-proxy capability

Current Kafka includes `KafkaProtocolFaultProxy` as a wire-level integration-test fixture. It:
- records request headers keyed by correlation ID;
- parses broker responses using Kafka's own protocol classes;
- can inject selected errors, disconnect, delay, blackhole requests, and rewrite routing;
- reserializes transformed responses with the originating request's correlation ID.

However, its current `ERROR_SETTERS` supports only a subset of APIs (including FETCH, PRODUCE, transaction APIs), not OffsetForLeaderEpoch. Therefore the fixture demonstrates a mechanism for response mutation, but it does NOT establish an executed OffsetForLeaderEpoch fault test or a current correlation-mismatch test.

Current `KafkaProtocolFaultProxyTest` only directly tests single/multi-broker bootstrap behavior. It does not execute response mutation, correlation mismatch, or OffsetForLeaderEpoch fault scenarios.

### 4. Correlation mismatch boundary

Current `AbstractResponse.parseResponse` explicitly compares the request header correlation ID against the parsed response header correlation ID and throws `CorrelationIdMismatchException` when they differ.

The fault proxy itself deliberately reconstructs a response header with the originating request correlation ID when it transforms a response. Therefore its current implementation does not provide a ready-made mismatch injection path.

Current direct test evidence still does not establish an intentional mismatched-correlation response reaching the client and being asserted as rejected.

### 5. Nexo implication

The strongest capture point remains:

**parsed response + originating RequestHeader, immediately before semantic reduction.**

At that point, preserve independently:
- OperationID;
- API key/version/header version;
- client ID;
- correlation ID;
- destination node;
- request/response timing;
- topic/partition;
- raw error code;
- leader epoch/end offset when present;
- protocol/schema identity;
- transport outcome;
- independently authoritative generation/version/incarnation.

Do not treat the fault proxy's capability as executed evidence.

## Epistemic status

SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
ALL_ERROR_BRANCHES_TESTED=NO
MIXED_RAW_REDUCER_COVERAGE=UNKNOWN
FAULT_PROXY_SUPPORTS_RESPONSE_MUTATION=YES
OFFSET_FOR_LEADER_EPOCH_FAULT_PROXY_SUPPORT=NO
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

No Kafka source was modified. No Nexo implementation or runtime verification was performed.

## EXACT NEXT ACTION — AB104.737

1. Inspect `OffsetFetcherTest` response-building helpers and all current OffsetForLeaderEpoch-related tests around them.
2. Determine whether any helper path actually asserts raw error identity before `handleResponse` reduction.
3. Inspect `AbstractResponse.parseResponse` tests and nearby request/response tests for correlation mismatch assertions, including protocol parsing tests.
4. Keep infrastructure capability, source behavior, test-source presence, and executed-test evidence strictly separated.
5. Continue toward a minimal Nexo provenance/fault matrix only after direct evidence is exhausted.

Do not implement Nexo. Do not create V21.
