# NEXO AB104.751 — OFLE builder/version and correlation-range audit

Date: 2026-09-28
Status: RESEARCH ONLY

## OFLE request builder

Current Kafka source uses OffsetsForLeaderEpochRequest.Builder (plural class name).

Builder.forConsumer(OffsetForLeaderTopicCollection):
- sets replicaId to CONSUMER_REPLICA_ID = -1;
- accepts the requested topic/partition epoch collection;
- permits versions from 3 through ApiKeys.OFFSET_FOR_LEADER_EPOCH.latestVersion().

Builder.forFollower(...) is restricted to version 4.

Current request tests explicitly iterate consumer-builder versions from 3 through ApiKeys.OFFSET_FOR_LEADER_EPOCH.latestVersion(). Therefore version 3 is the lowest valid consumer OFLE version and is the simplest stable target for the proposed wire-mismatch test. Using latestVersion() is also possible, but would make the test more sensitive to future protocol-version additions.

The request body can be minimal: one topic, one partition, one OffsetForLeaderPartition, with replicaId -1. The mismatch experiment does not depend on the semantic value of the requested epoch because the response header correlation is rejected before the OFLE body reaches reducer logic.

## SASL reserved correlation range

Current SaslClientAuthenticator defines:
- MAX_RESERVED_CORRELATION_ID = Integer.MAX_VALUE
- MIN_RESERVED_CORRELATION_ID = MAX_RESERVED_CORRELATION_ID - 7
- isReserved(id) iff id >= MIN_RESERVED_CORRELATION_ID.

Thus only the top 8 signed-int values are reserved for SASL.

For a deterministic unit test, blindly using request.correlationId() + 1 is not universally safe because an arbitrary correlation ID could theoretically be the last non-reserved value (MAX_RESERVED_CORRELATION_ID - 8), making +1 reserved. The test should instead choose an explicit non-reserved mismatch value, or assert both request and injected response IDs are outside the reserved range.

A simple deterministic pair is request correlation 0 and response correlation 1 if the test harness is freshly initialized and the request generator starts from the normal non-reserved range. More robustly, derive the actual request correlation and choose a nearby non-equal value only when both values satisfy !SaslClientAuthenticator.isReserved(...); otherwise use a fixed low non-reserved mismatch such as 0/1 if it differs from the request.

## Exact minimal test design

Target API version: OFLE v3.
Request:
- one topic;
- one partition;
- replicaId -1;
- valid epoch payload.

Response:
- any structurally valid OffsetsForLeaderEpochResponse;
- same protocol version;
- intentionally non-matching, non-reserved correlation ID.

Transport:
RequestTestUtils.serializeResponseWithHeader(...) -> new NetworkReceive(node.idString(), buffer) -> MockSelector.completeReceive(...) -> NetworkClient.poll(...).

Expected result:
CorrelationIdMismatchException propagates from poll() before OFLE reducer semantics execute.

This would establish only wire/header correlation validation. It would NOT close:
- OFLE reducer duplicate semantics;
- unrequested response partition semantics;
- mixed duplicate/error ordering;
- exhaustive reducer branch coverage.

## Status

OFLE_CONSUMER_BUILDER_MIN_VERSION=3
OFLE_CONSUMER_BUILDER_RANGE=3..ApiKeys.OFFSET_FOR_LEADER_EPOCH.latestVersion()
OFLE_FOLLOWER_BUILDER_VERSION=4
OFLE_MINIMAL_REQUEST_SPECIFIABLE=YES
SASL_RESERVED_RANGE=MAX-7..MAX
BLIND_CORRELATION_PLUS_ONE_UNCONDITIONALLY_SAFE=NO
NON_RESERVED_MISMATCH_CONSTRUCTIBLE=YES
MINIMAL_OFLE_MISMATCH_TEST_SPECIFIABLE=YES
MINIMAL_OFLE_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Next exact mission

AB104.752: inspect the current NetworkClientTest construction/correlation allocator and determine whether a fresh NetworkClient test deterministically begins at a low non-reserved correlation ID. Then inspect existing OffsetsForLeaderEpochResponse construction helpers to specify the smallest valid response object for the wire mismatch test. Research only; do not implement.
