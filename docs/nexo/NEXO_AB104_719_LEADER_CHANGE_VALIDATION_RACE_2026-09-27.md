# NEXO AB104.719 — Leader-change validation race and epoch fencing
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Source evidence
Kafka increments assignment identity on assignment changes and validates a FetchPosition against the current leader/epoch. When the leader changes, maybeValidatePosition replaces the position's current leader/epoch and enters AWAIT_VALIDATION when usable epoch information exists. A new validation therefore has a new coordinate even when the numeric offset is unchanged.

validateOffsetsIfNeeded first consumes the single cached offset-validation exception, then schedules partitions currently needing validation, subject to retry backoff. validateOffsetsAsync sets the next retry deadline before sending the OffsetForLeaderEpoch request.

If the response returns after the partition's position or validation state changed, maybeCompleteValidation refuses it. If the response detects truncation and reset policy NONE is active, it produces LogTruncation without silently changing the coordinate. With a reset policy, Kafka can seek to the broker's divergent coordinate and enter FETCHING.

## Race boundary
A leader-change cycle can therefore overlap:
1. old validation request in flight;
2. metadata/leader change;
3. new FetchPosition + AWAIT_VALIDATION;
4. old response arrival;
5. cached exception publication;
6. new validation request.

The old response cannot validate the new coordinate when position equality fails. However, the exception cache is independent: a non-retriable exception can occupy the single slot and be surfaced on the next validateOffsetsIfNeeded call before new validation work starts.

## Nexo requirement
Nexo must fence validation evidence by a monotonically unique validation epoch/incarnation, not only TopicPartition or numeric offset. Each request should carry:
- TopicPartition
- FetchPosition offset
- offset epoch when present
- leader identity/epoch when present
- Nexo validation epoch
- request send timestamp/deadline
- response match result
- cache publication/suppression state

A prior exception must not be allowed to semantically contaminate a newer validation coordinate; conversely, a newer validation must not erase historical evidence from the prior coordinate.

## Frozen interpretation
- old response rejected by position/state mismatch = STALE_VALIDATION_RESPONSE;
- new leader coordinate awaiting response = VALIDATION_PENDING;
- matching truncation = LOG_TRUNCATION_UNRESOLVED;
- cached prior exception surfaced before new request = PRIOR_EXCEPTION_SURFACED, not evidence about the new coordinate;
- successful validation = VALIDATION_COMPLETED for that exact coordinate only.

## Status
SOURCE_CODE_VERIFIED=YES
SEMANTIC_INTERPRETATION=BOUNDED
IMPLEMENTED=NO
EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next
AB104.720: inspect Kafka tests covering leader-change validation races, especially late OffsetForLeaderEpoch responses and exception caching, to determine which race behaviors are directly regression-tested versus only inferred from source.
