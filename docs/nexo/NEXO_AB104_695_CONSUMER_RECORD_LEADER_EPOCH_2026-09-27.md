# NEXO AB104.695 — ConsumerRecord leaderEpoch exact boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

Kafka 4.1.2 defines ConsumerRecord.leaderEpoch() as Optional<Integer>. The API explicitly says the value may be empty for legacy record formats. Therefore leaderEpoch capture is inherently optional at the record level.

Current KafkaConsumer documentation also says leader epoch is important when committing offsets because it lets Kafka validate an offset against partition history; without it, resume may fall back to auto.offset.reset when the offset no longer exists. That is relevant to durable consumer state, but the AB104 verifier deliberately does not commit offsets.

## Frozen decision

For the minimal AB104 verifier:

LEADER_EPOCH_CAPTURE = OPTIONAL_DIAGNOSTIC

It MUST be captured when ConsumerRecord.leaderEpoch().isPresent(), but absence of an epoch MUST NOT:
- downgrade PRESENT;
- create READ_PATH_ERROR;
- create NOT_OBSERVED;
- imply legacy/corrupt data;
- be treated as durability evidence.

The verifier's primary evidence remains: topic + partition + exact effect identity + concrete offset + successful read path.

## Matching record evidence

For a PRESENT record, persist:
- topic
- partition
- offset
- effectId
- identity-header evidence
- leaderEpoch if present
- leaderEpochPresent boolean

Do not manufacture a sentinel integer such as -1 for an absent epoch; preserve Optional/boolean semantics.

## Read-path rule

An epoch value changing across records in the same partition is not by itself an error. A truncation/out-of-range exception remains READ_PATH_ERROR under AB104.693.

The verifier does not need an Admin OffsetForLeaderEpoch call in the base test. Adding that call would expand the observation surface and introduce another protocol/API dependency without improving the base claim.

## Critical boundary

leaderEpoch is useful for diagnostics and future recovery/reconstruction, relevant to offset continuity, but is NOT proof of broker append durability, replication, external effect completion, or Nexo AuthorityEpoch.

## Status

VERIFIED:
- ConsumerRecord.leaderEpoch() is Optional<Integer>;
- epoch can be absent for legacy record formats;
- Kafka uses leader epoch for offset-history validation;
- absence of leader epoch must remain non-fatal in this verifier.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.696: inspect current Kafka consumer fetch/position behavior around beginningOffsets and seekToBeginning, and freeze whether the verifier needs to record the exact starting offset to make NOT_OBSERVED reproducible and auditable.