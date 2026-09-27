# NEXO AB104.699 — Final poll deadline race
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

KafkaConsumer.poll(Duration) accepts a non-null timeout and waits for records up to that duration; an empty ConsumerRecords result is a normal successful poll, not an absence proof by itself. The current Kafka consumer API also exposes timeout-related exceptions separately from ordinary empty polls. citeturn0search7turn0search0

## Frozen timing algorithm

Use one monotonic deadline, not repeated wall-clock additions.

1. `deadline = monotonicNow + OBSERVATION_WINDOW`.
2. Before each poll, calculate `remaining = deadline - monotonicNow`.
3. If `remaining <= 0`, terminate NOT_OBSERVED only if every prior read operation was successful and no exact identity was seen.
4. Otherwise call `poll(min(POLL_MAX, remaining))`.
5. Scan the complete returned batch.
6. If exact identity is found, PRESENT is terminal even if the deadline has passed while processing that returned batch.
7. If the batch is empty, this is a successful read with no evidence; continue while remaining time exists.
8. After processing a non-matching batch, recompute remaining rather than adding another fixed poll interval.

## Final-deadline race

A poll that begins before the deadline may return at or after the deadline. The returned batch is still a completed read operation and must be processed completely. Therefore deadline expiration is evaluated after scanning the batch, not before scanning it.

This prevents a record fetched by the final permitted poll from being discarded merely because processing crossed the nominal timestamp.

## Timeout values

The poll timeout must be strictly positive when a poll is issued. If no positive time remains, do not issue a zero/negative poll; transition to the terminal state using the evidence already collected.

An empty poll is NOT_OBSERVED evidence only in combination with successful repeated polling through the deadline. One empty poll is never sufficient.

## Exception boundary

Any unrecoverable Kafka consumer exception during polling or batch processing => READ_PATH_ERROR, not NOT_OBSERVED.

A normal empty poll => continue.

## Frozen state machine

VERIFYING -> PRESENT when exact identity appears in any successfully returned batch.
VERIFYING -> READ_PATH_ERROR on observation-path failure.
VERIFYING -> NOT_OBSERVED only after deadline with successful reads and no exact identity.

No terminal state is inferred from a single empty poll or from the deadline before a returned batch has been scanned.

## Status

VERIFIED:
- current Kafka poll API and ConsumerRecords behavior;
- empty poll is a normal successful result;
- timeout is distinct from an application-level absence claim;
- fixed monotonic deadline prevents cumulative timing drift.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.700: inspect consumer wakeup/close/interruption behavior and freeze how verifier shutdown or test-thread interruption is separated from READ_PATH_ERROR and harness failure.