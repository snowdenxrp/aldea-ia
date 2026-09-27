# NEXO AB104.692 — Duplicate effect identity and terminal observation
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact Kafka boundary

Kafka ConsumerRecord carries a partition-local offset, and ConsumerRecords preserves the records returned by poll. The verifier is manually assigned to exactly one target partition, so offsets provide the authoritative local ordering surface for this experiment. citeturn0search3

## Frozen duplicate policy

The experiment's effect identity is intended to be unique. Therefore:

- First VALID exact identity match => terminal PRESENT.
- Capture topic, partition, offset and identity evidence immediately.
- Do not continue polling merely to search for a second copy.
- If a later duplicate exists, that is a separate anomaly to investigate in a dedicated duplicate-effect experiment; it cannot invalidate the already observed PRESENT state.
- A record with matching key/value but ambiguous identity headers is never PRESENT.
- Unrelated records continue to be scanned.

## Why PRESENT is terminal

The base experiment asks whether the exact effect identity reached the broker log, not whether every copy can be enumerated. Once a complete identity conjunction is observed at a concrete partition+offset, additional polling cannot erase that observation.

## Duplicate-effect caveat

A later duplicate would matter for a separate invariant such as at-most-one external effect per EffectID. That invariant is NOT established by AB104.692. This experiment establishes only effect identity observed at least once.

Therefore the evidence schema must not silently upgrade PRESENT into exactly-once.

## Offset handling

- Store the first matching offset.
- Never infer global ordering from offsets across partitions; this experiment has one partition.
- Do not commit the verifier offset.
- Do not use later records to reinterpret the first valid match.
- If the verifier encounters log truncation/offset invalidation before a match, classify the read path according to the dedicated error boundary rather than inventing absence.

## Frozen state machine

VERIFYING -> PRESENT(offset) [first complete identity match] -> freeze evidence

VERIFYING -> NOT_OBSERVED [deadline reached with successful reads and no complete match]

VERIFYING -> READ_PATH_ERROR [reliable observation becomes impossible]

No transition: PRESENT -> NOT_OBSERVED.

No transition: NOT_OBSERVED -> NOT_COMMITTED.

## Status

VERIFIED:
- partition-local offset is the concrete observation coordinate;
- first exact identity match is sufficient for the base PRESENT claim;
- duplicate-effect/exactly-once is explicitly outside this experiment.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.693: inspect Kafka log truncation/offset invalidation behavior and determine whether verifier assignment/seek/poll can observe a partition that changes underneath it; freeze the resulting classification so a truncated/replaced log cannot be mistaken for clean NOT_OBSERVED.