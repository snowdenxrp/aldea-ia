# NEXO AB104.704 — No-group ConsumerConfig constructor gate
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source finding

Current Apache Kafka trunk defines group.id with default null. Its configuration processing explicitly handles the null-group case: auto-commit is forced false when group.id is absent, and explicitly enabling auto-commit with a null group.id is rejected. The consumer internals represent groupId as Optional and only throw InvalidGroupIdException when group-management or offset-commit APIs require a group id. citeturn0search1turn0search8

Kafka's generated 4.1 consumer configuration states group.id is required for subscribe()/group management or Kafka-based offset management, not for direct manual observation. citeturn0search2

## Frozen conclusion

A no-group verifier is a supported configuration shape for the intended path:

- bootstrap.servers = direct broker
- group.id = OMITTED
- group.instance.id = OMITTED
- enable.auto.commit = explicit false
- assign() only
- no commit APIs
- no subscribe()
- no group-management calls

Because the current implementation rejects explicit enable.auto.commit=true when group.id is null, the verifier must keep it false.

## Important correction

Do NOT claim that omitting group.id means KafkaConsumer has no group-related code internally. The implementation still carries Optional groupId and contains guards for APIs that require it. The correct statement is:

The selected verifier path does not invoke group-management or offset-commit APIs, so group.id is not required for its observation path.

## Minimal property set

Required:
- bootstrap.servers
- key.deserializer = ByteArrayDeserializer
- value.deserializer = ByteArrayDeserializer
- enable.auto.commit = false
- isolation.level = read_uncommitted
- auto.offset.reset = earliest
- max.poll.records = explicit bounded value

Optional diagnostic:
- client.id

Forbidden in base verifier:
- group.id
- group.instance.id
- subscribe()
- commitSync()
- commitAsync()
- seek via committed offsets

Runtime:
assign -> beginningOffsets -> seekToBeginning -> position -> bounded poll loop.

## Evidence boundary

No-group configuration does not itself prove anything about the target record. It only removes group/offset-management machinery from the verifier path.

Record presence remains established solely by the direct successful read of the exact identity.

## Status

VERIFIED:
- group.id default is null in current source;
- null group + auto-commit true is rejected;
- no-group manual observation is supported;
- group-management/offset-commit APIs remain guarded separately.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.705: inspect the exact beginningOffsets()/seekToBeginning()/position() implementation path with no group.id and freeze whether any of those operations can consult committed offsets or group state.