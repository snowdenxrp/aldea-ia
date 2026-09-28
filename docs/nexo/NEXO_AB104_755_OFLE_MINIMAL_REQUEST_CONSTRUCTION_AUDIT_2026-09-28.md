# NEXO AB104.755 — OFLE minimal request construction audit

Date: 2026-09-28
Scope: exact current constructor/data shape for a minimal consumer OffsetForLeaderEpoch request.

## Findings

Current `OffsetsForLeaderEpochRequest.Builder.forConsumer(OffsetForLeaderTopicCollection)` constructs `OffsetForLeaderEpochRequestData`, sets `replicaId = CONSUMER_REPLICA_ID (-1)`, sets the supplied topics, and permits versions 3 through the current API latest version. `build(version)` rejects versions outside that inclusive range.

The consumer-side production helper `OffsetsForLeaderEpochUtils.prepareRequest(...)` provides the exact data shape:
- create `OffsetForLeaderTopicCollection(requestData.size())`;
- create `OffsetForLeaderTopic().setTopic(topic)`;
- append `OffsetForLeaderPartition()`;
- set partition;
- set leaderEpoch;
- set currentLeaderEpoch;
- pass the collection to `Builder.forConsumer`.

For a single partition, the minimal request is therefore concretely specifiable as one topic containing one partition record. No hidden factory is required.

Current test/server sources independently confirm the same nested data constructors and setters. Thus the request body can be constructed directly from existing public message types.

## Version boundary

Consumer OFLE starts at version 3. The builder's allowed range is 3..latest. Version 3 is therefore the minimum supported consumer target and is the cleanest minimal-version execution target. The mismatch test need not exercise all protocol versions because its immediate claim is header correlation rejection, not version-complete reducer semantics.

## Response pairing

The response can be constructed as one `OffsetForLeaderTopicResult` with one `EpochEndOffset`, then wrapped in `OffsetsForLeaderEpochResponse`. The response header must use the same API/version expected by the in-flight OFLE request but a deliberately different, non-reserved correlation ID.

## Evidence boundary

MINIMAL_OFLE_REQUEST_CONSTRUCTION=BYTE/CONSTRUCTOR_SPECIFIABLE
CONSUMER_MIN_VERSION=3
CONSUMER_BUILDER_RANGE=3..latest
SINGLE_TOPIC_SINGLE_PARTITION=SPECIFIABLE
RESPONSE_SINGLE_TOPIC_SINGLE_PARTITION=SPECIFIABLE
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next action

AB104.756: inspect the current `NetworkClient.parseResponse` / `handleCompletedReceives` exception path at exact source level and verify that the mismatch is surfaced before any OFLE response body/reducer processing. Do not count this as executed behavior until an actual test run is observed.
