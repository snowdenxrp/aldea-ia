# NEXO AB104.762 — OFLE compile-level test skeleton audit

Date: 2026-09-28
Scope: exact test-only imports and one-topic/one-partition OFLE request/response construction.

## Source-verified syntax

OffsetsForLeaderEpochRequest.java imports and uses generated nested message types:
- OffsetForLeaderEpochRequestData.OffsetForLeaderTopicCollection
- OffsetForLeaderEpochRequestData.OffsetForLeaderTopic
- OffsetForLeaderEpochRequestData.OffsetForLeaderPartition

Consumer construction is Builder.forConsumer(topics), whose supported range begins at version 3.

The production helper OffsetsForLeaderEpochUtils.prepareRequest() establishes the concrete construction pattern:
new OffsetForLeaderTopic().setTopic(topic)
then topic.partitions().add(new OffsetForLeaderPartition()
    .setPartition(partition)
    .setLeaderEpoch(epoch)
    .setCurrentLeaderEpoch(currentEpoch));

The response source establishes:
OffsetForLeaderEpochResponseData
-> OffsetForLeaderEpochResponseData.OffsetForLeaderTopicResult
-> OffsetForLeaderEpochResponseData.EpochEndOffset

Each EpochEndOffset supports partition, errorCode, leaderEpoch and endOffset. OffsetsForLeaderEpochResponse wraps the data object.

## Final compile-level skeleton

Test-only imports needed in NetworkClientTest:
- org.apache.kafka.common.message.OffsetForLeaderEpochRequestData.OffsetForLeaderTopic
- org.apache.kafka.common.message.OffsetForLeaderEpochRequestData.OffsetForLeaderTopicCollection
- org.apache.kafka.common.message.OffsetForLeaderEpochRequestData.OffsetForLeaderPartition
- org.apache.kafka.common.message.OffsetForLeaderEpochResponseData
- org.apache.kafka.common.message.OffsetForLeaderEpochResponseData.EpochEndOffset
- org.apache.kafka.common.message.OffsetForLeaderEpochResponseData.OffsetForLeaderTopicResult
- org.apache.kafka.common.requests.OffsetsForLeaderEpochRequest
- org.apache.kafka.common.requests.OffsetsForLeaderEpochResponse
- org.apache.kafka.common.errors.CorrelationIdMismatchException

Minimal request body:
OffsetForLeaderTopicCollection topics = new OffsetForLeaderTopicCollection(1);
OffsetForLeaderTopic topic = new OffsetForLeaderTopic().setTopic("test");
topic.partitions().add(new OffsetForLeaderPartition()
    .setPartition(0)
    .setLeaderEpoch(1)
    .setCurrentLeaderEpoch(1));
topics.add(topic);
OffsetsForLeaderEpochRequest.Builder builder = OffsetsForLeaderEpochRequest.Builder.forConsumer(topics);
short requestVersion = 3;

Minimal response body:
OffsetForLeaderEpochResponseData responseData = new OffsetForLeaderEpochResponseData();
OffsetForLeaderTopicResult result = new OffsetForLeaderTopicResult().setTopic("test");
result.partitions().add(new EpochEndOffset()
    .setPartition(0)
    .setErrorCode(Errors.NONE.code())
    .setLeaderEpoch(1)
    .setEndOffset(0));
responseData.topics().add(result);
OffsetsForLeaderEpochResponse response = new OffsetsForLeaderEpochResponse(responseData);

The existing NetworkClientTest imports Errors and assertThrows already, so no new import is needed for those.

The final test skeleton can use the existing real client fixture:
awaitReady(client, node);
ClientRequest request = client.newClientRequest(node.idString(), builder, time.milliseconds(), true);
client.send(request, time.milliseconds());
client.poll(1, time.milliseconds());

Then serialize the valid response with a different non-reserved correlation ID, inject NetworkReceive, and assert CorrelationIdMismatchException from poll.

## Important qualification

This is a compile-level/source-derived skeleton, not a compiled or executed test. No source modification to Kafka has been made. No OFLE mismatch execution has been observed.

## Status

OFLE_REQUEST_IMPORTS_SOURCE_VERIFIED=YES
OFLE_REQUEST_ONE_TOPIC_ONE_PARTITION=SOURCE_VERIFIED
OFLE_RESPONSE_ONE_TOPIC_ONE_PARTITION=SOURCE_VERIFIED
REQUEST_VERSION_3_SUPPORTED=YES
TEST_SKELETON_COMPILE_LEVEL=SPECIFIED
TEST_COMPILED=NO
TEST_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## Exact next mission

AB104.763: inspect the current NetworkClientTest correlation-mismatch tests and helper naming to determine whether the final OFLE test should reuse an existing assertion/helper or add a dedicated test method. Preserve NOT EXECUTED.
