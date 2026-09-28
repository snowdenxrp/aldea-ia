# NEXO AB104.712 — LogTruncationException evidence boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka source finding

Apache Kafka's current OffsetFetcherUtils builds LogTruncationException from per-partition truncation records. The exception carries:
- truncatedFetchOffsets: the fetch position/offset that was affected;
- divergentOffsets: optional divergent OffsetAndMetadata where available.

Kafka determines truncation during position validation: an end offset lower than the current fetch position is treated as evidence of log truncation; returned offset/epoch validity is also checked. Retriable validation failures remain retryable and are not themselves truncation proof.

## Frozen epistemic boundary

LogTruncationException proves a read-continuity problem associated with the affected partition/position. It does NOT by itself prove:
- that the target effect was never committed;
- that the target effect was deleted;
- that the producer request was rejected;
- that the broker lost the effect permanently.

Therefore:
POST-START truncation before an exact identity match -> LOG_TRUNCATION_UNRESOLVED.
Exact identity observed before truncation -> PRESENT remains frozen.
Setup invalidation before the observation epoch -> SETUP_POSITION_INVALID.
Ordinary retriable leader/metadata errors -> retry within SETUP/READ policy; do not classify as absence.

## Minimum evidence to persist

For a truncation event, preserve at minimum:
- topic;
- partition;
- verifier starting position;
- current/failing fetch position;
- truncatedFetchOffset;
- divergentOffset when present;
- leader epoch diagnostics when exposed;
- exception type;
- observation epoch/state;
- monotonic observation timestamp/deadline;
- whether exact identity had already been observed;
- underlying read/validation operation result.

No synthetic sentinel offset or epoch should be invented when Kafka does not provide one.

## Important distinction

The Kafka source distinguishes two different facts:
1. position validation can discover truncation through OffsetForLeaderEpoch validation;
2. ListOffsets failures can be retriable and independently retried.

Thus "Kafka returned an offset-related error" is not equivalent to "log truncation occurred."

## Decision

AB104.711's two-state lifecycle distinction is retained:
- SETUP_POSITION_INVALID when the intended observation coordinate cannot be established;
- LOG_TRUNCATION_UNRESOLVED once a valid observation epoch has begun and continuity is subsequently invalidated.

Neither state becomes NOT_OBSERVED automatically.

## Evidence status

SOURCE_CODE_VERIFIED=YES
SEMANTIC_INTERPRETATION=BOUNDED
IMPLEMENTED=NO
EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.713: inspect the exact SubscriptionState.LogTruncation structure and maybeCompleteValidation() semantics to determine precisely when divergentOffsets are populated and what coordinate relationship constitutes truncation.
