# NEXO AB104.678 — Minimal verifier primitives
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current primitives
Current Kafka integration tests use:
- `KafkaConsumer.subscribe(singletonList(topic))`
- bounded `poll(Duration.ofMillis(500)))
- `ConsumerRecords.count()`
- wall-clock deadline loop.

Kafka's current consumer API confirms `poll(Duration)` fetches records for partitions configured through subscribe/assign, and manual `assign` avoids group coordination/rebalances. cite source: Apache Kafka KafkaConsumer current API search result

## Frozen verifier choice
For this one-partition experiment, prefer manual `assign(Collections.singleton(new TopicPartition(topic, 0)))` over `subscribe()`:
- removes group-coordination/rebalance variables;
- no consumer group commit is required;
- assignment remains fixed unless explicitly changed;
- exact target partition is known.

After assignment:
1. poll with bounded intervals (500 ms);
2. inspect every returned record for exact effectId;
3. on match capture topic/partition/offset and classify PRESENT;
4. continue until match or absolute deadline;
5. successful polling with no match at deadline => NOT_OBSERVED;
6. consumer exception/read failure => READ_PATH_ERROR.

## Frozen configuration
- direct broker bootstrap, never proxy;
- unique verifier group id only if required by client configuration;
- enable.auto.commit=false;
- auto.offset.reset=earliest;
- one target TopicPartition;
- poll timeout=500 ms;
- observation deadline=10 s;
- no offset commit;
- no helper that asserts a final expected collection.

## Epistemic boundary
Manual assignment and successful polling prove only that the verifier read path operated. A missing effect after the deadline is an observation result, not proof of non-commit.

## Status
VERIFIED:
- exact current Kafka test polling pattern;
- current Consumer API semantics;
- manual assignment is suitable for a fixed single partition.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.679: inspect the exact ProducerRecord/effectId construction and serializers, then freeze a collision-resistant record identity that can be matched independently by the verifier.
