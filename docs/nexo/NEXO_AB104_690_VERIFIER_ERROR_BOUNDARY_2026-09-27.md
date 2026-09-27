# NEXO AB104.690 — Direct verifier deserialization and read-path error boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka findings

KafkaConsumer.poll(Duration) can throw KafkaException-family failures, including deserialization-related failures. Kafka's KIP-334 introduced RecordDeserializationException with offset information, and KIP-1036 extended it with record metadata/bytes and an origin distinguishing key/value deserialization. citeturn0search0turn0search10

For the Nexo verifier, the cleanest way to minimize this failure surface is not to deserialize the experiment record into application types at all. Use ByteArrayDeserializer for both key and value, then compare raw UTF-8 bytes to the frozen effectId. Headers are already byte[] and can be compared directly.

## Frozen verifier representation

- KafkaConsumer<byte[], byte[]>
- key.deserializer = ByteArrayDeserializer
- value.deserializer = ByteArrayDeserializer
- isolation.level=read_uncommitted
- enable.auto.commit=false
- manual assign(targetPartition)
- seekToBeginning(targetPartition)
- direct cluster bootstrap

Expected experiment records contain:
- key bytes = UTF-8(effectId)
- value bytes = UTF-8(effectId)
- header nexo-effect-id = UTF-8(effectId)

This removes String/JSON/schema deserialization as an additional source of false absence.

## Exact classification

PRESENT:
- a record is fetched successfully;
- exact key/value/header identity matches the frozen effectId;
- capture topic/partition/offset;
- freeze immediately.

UNRELATED_RECORD:
- fetched successfully but identity does not match;
- continue polling until the fixed deadline.

NOT_OBSERVED:
- all polling and record decoding completed successfully through the fixed deadline;
- exact effectId was never observed.

READ_PATH_ERROR:
- consumer construction/setup fails after the test enters verification;
- poll throws an unrecoverable Kafka/consumer/read exception;
- raw record/header processing itself fails unexpectedly;
- authentication/authorization/network/read failure prevents reliable observation.

A READ_PATH_ERROR must never be converted to NOT_OBSERVED because the missing record may be hidden by the failed read path.

HARNESS_SETUP_FAILURE:
- failure before the observation state begins, such as inability to construct/assign/seek the verifier.

## Important implementation constraint

Do not use a deserializer that can reject the target record before the verifier sees its identity. Raw byte deserializers make the verifier's evidence surface narrower and auditable.

Do not treat a malformed/unexpected unrelated record as evidence that the target effect is absent. Only successful observation through the deadline can produce NOT_OBSERVED.

## Evidence boundary

The verifier proves only observation through the direct Kafka read path. It does not prove replicated durability, external side effects, or Nexo-wide correctness.

## Status

VERIFIED:
- Kafka poll/deserialization exception surface;
- RecordDeserializationException carries offset/record context;
- raw byte deserialization is the minimal verifier representation;
- read failures remain distinct from NOT_OBSERVED.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.691: inspect exact current Kafka ConsumerRecord header iteration/access semantics and freeze the identity-matching algorithm so duplicate headers, null header values, and unrelated headers cannot create false PRESENT results.
