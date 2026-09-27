# NEXO AB104.679 — Effect identity
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source findings
Current Kafka `ProducerRecord` supports topic, explicit partition, key, value, headers and timestamp. Current `ConsumerRecord` exposes topic, partition, offset, key, value and headers.

## Frozen effect identity
Do not use timestamp or Kafka offset as the pre-existing effect identity:
- timestamp can be broker-adjusted under LogAppendTime;
- offset exists only after broker append;
- producer metadata is unavailable in the response-loss case.

Use an explicit unique application-level `effectId` encoded in the record value and duplicated in a dedicated header.

Frozen format:
- topic: `nexo-ab104-679`
- partition: `0`
- key: `effectId`
- value: `effectId`
- header: `nexo-effect-id` -> UTF-8 bytes of the same effectId

The verifier matches the header first and may cross-check key/value. A match is therefore tied to the exact generated effect rather than a timestamp or offset.

## Why duplicate key/value/header
- key makes the record easy to identify;
- value gives an independent payload identity;
- header provides an explicit protocol-level identity field;
- requiring all three to agree reduces accidental collision/misclassification.

No random UUID is treated as a proof primitive by itself; uniqueness is an experiment-local collision-avoidance measure. The evidence still records the exact effectId generated for the run.

## Frozen evidence
If verifier finds a record:
- require matching `nexo-effect-id` header;
- require key == effectId;
- require value == effectId;
- capture topic/partition/offset;
- classify PRESENT.

If no matching record by deadline:
- NOT_OBSERVED only.

If read path fails:
- READ_PATH_ERROR.

## Status
VERIFIED:
- ProducerRecord/ConsumerRecord provide the fields required for this identity scheme.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.680: inspect current Kafka producer header serialization/deserialization primitives and freeze the exact byte encoding used by the verifier, avoiding charset ambiguity.
