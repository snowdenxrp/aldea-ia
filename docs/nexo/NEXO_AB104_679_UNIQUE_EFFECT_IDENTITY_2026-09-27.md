# NEXO AB104.679 — Unique effect identity
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source finding
Current Apache Kafka ProducerRecord supports:
- explicit topic;
- explicit partition;
- key;
- value;
- headers.

Headers are preserved as record metadata and are therefore available as an additional identity carrier, but the verifier can avoid depending on header-specific tooling by encoding the unique effectId in both key and value.

## Frozen effect identity
Use one deterministic per-test identifier:
`effectId = "nexo-ab104-679-" + UUID`

Construct:
- topic = fixed test topic;
- partition = 0 explicitly;
- key = effectId;
- value = effectId + "|payload";
- no retry identity is inferred from Kafka offsets.

The verifier matches the exact key == effectId and value prefix/content. This avoids ambiguity if other records exist in the topic.

## Why explicit partition
With one partition, explicit partition=0 removes producer partition-selection variability. Kafka's ProducerRecord semantics support explicit partition selection.

## Why key + value
Using the same unique identifier in both fields gives two independent record fields to validate, while remaining compatible with plain String serializers and the existing verifier pattern.

## Important boundary
effectId identifies the logical record we sent. It is NOT a Kafka producer id, transaction id, broker offset, or Nexo EffectID unless the future architecture explicitly binds those namespaces. Do not collapse these identities.

## Evidence tuple extension
Add:
- effectId
- expectedTopic
- expectedPartition=0
- expectedKey=effectId
- expectedValue=effectId+"|payload"

A PRESENT result must match the exact identity and capture broker-assigned offset.

## Status
VERIFIED:
- current ProducerRecord supports the required explicit fields;
- explicit partition and key/value are suitable for deterministic observation.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.680: inspect current StringSerializer/StringDeserializer behavior and freeze the exact verifier equality checks, including null/encoding edge cases.
