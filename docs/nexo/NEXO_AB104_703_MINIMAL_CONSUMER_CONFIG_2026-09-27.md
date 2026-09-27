# NEXO AB104.703 — Minimal verifier consumer configuration
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current finding

Current Kafka 4.1.2 documentation explicitly states that manual assign() disables dynamic partition assignment and consumer-group coordination. It also states that group.id is still used for committing offsets in manual-assignment mode, but no commit is needed for this verifier. Therefore group.id is not part of the observation mechanism. citeturn0search0turn0search1

The verifier can therefore omit group.id while using assign(), provided construction/configuration succeeds in the target Kafka client version. This is the cleanest base configuration.

## Frozen minimal properties

Required:
- bootstrap.servers = direct EmbeddedKafkaCluster bootstrap
- key/value deserializer = ByteArrayDeserializer
- enable.auto.commit = false
- auto.offset.reset = earliest
- isolation.level = read_uncommitted
- max.poll.records = explicit bounded value
- request.timeout.ms = bounded test value as needed by client

Not required:
- group.id
- group.instance.id
- partition.assignment.strategy
- auto.commit.interval.ms
- consumer group protocol settings
- offset commit settings

Runtime operations:
- assign(single target TopicPartition)
- beginningOffsets(target)
- seekToBeginning(target)
- position(target)
- poll(bounded remaining deadline)
- no commit APIs

## Important correction

AB104.702 said “omit group.id if permitted.” Current Kafka documentation gives stronger evidence: manual assignment itself does not use group coordination, while group.id's documented role in this mode is committing offsets. Since the verifier performs no commits, group.id is unnecessary to the evidence path.

We should still validate the exact constructor/config validation in the actual test runtime before implementation. That validation is an implementation gate, not a reason to introduce group coordination by default.

## Evidence isolation

The verifier's claim remains:

DirectBrokerRecordObservation = evidence of seeing the exact record.

It is NOT:
ConsumerGroupOffsetCommit
NOT:
ConsumerGroupMembership
NOT:
ConsumerCloseSuccess.

## Status

VERIFIED:
- manual assignment disables group coordination;
- group.id is only relevant here for offset commits;
- no commit APIs are needed;
- minimal verifier can omit group.id pending runtime construction validation.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.704: inspect exact current ConsumerConfig validation/source around group.id and constructor behavior, then freeze whether a no-group verifier is executable without hidden defaults or warnings.