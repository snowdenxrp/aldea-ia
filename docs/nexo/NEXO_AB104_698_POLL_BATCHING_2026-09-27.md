# NEXO AB104.698 — Poll batching and same-poll evidence
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

KafkaConsumer.poll(Duration) returns a ConsumerRecords collection, not necessarily one record. Kafka's max.poll.records limits the number of records returned from a single poll, while underlying fetch behavior can retrieve more records internally. Therefore one poll may contain multiple records from the target partition. 

## Frozen verifier rule

The verifier must scan every record returned by each successful poll until a terminal exact identity is found.

If a poll contains:
- unrelated records followed by the exact effectId: continue scanning that same batch and classify PRESENT when the exact identity is reached;
- the exact effectId plus unrelated records: PRESENT is still terminal, but the batch must not be treated as an error;
- multiple exact effectId matches in one poll: classify PRESENT and record the first matching offset plus duplicate-match diagnostic evidence; do not downgrade the primary observation;
- no exact effectId: continue until the fixed deadline.

## Why scan the complete batch

The verifier must not inspect only the first record in ConsumerRecords. Doing so could miss the target even though Kafka successfully delivered it in the same poll. Conversely, after finding a valid exact identity, scanning later records cannot invalidate the already established observation.

## Frozen timing rule

The deadline is checked around each poll and after processing the returned batch. A successful poll that began before the deadline may return records after the nominal deadline; those records are still part of a completed read operation and must be handled deterministically. To avoid an unbounded final poll, each poll timeout is bounded by the remaining deadline.

If the poll returns records and an exact match is present, PRESENT wins over deadline bookkeeping.

If the deadline expires with a successful poll containing no exact identity, classify NOT_OBSERVED only if no read-path error occurred.

## Batch evidence

For diagnostics capture:
- poll start/end time;
- record count;
- first/last observed offset when available;
- matching offset if PRESENT;
- duplicate match count if any.

These fields are observational metadata and do not establish durability.

## Status

VERIFIED:
- poll returns a batch of ConsumerRecords;
- max.poll.records bounds records returned per poll;
- one poll can contain multiple records;
- verifier must scan the batch rather than only its first element.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.699: inspect the exact current KafkaConsumer poll timeout semantics and freeze the final-deadline race, especially whether zero/negative remaining duration is legal and how an empty poll is classified.