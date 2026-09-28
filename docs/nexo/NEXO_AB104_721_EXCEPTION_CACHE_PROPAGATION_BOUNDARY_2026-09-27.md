# NEXO AB104.721 — Exception-cache propagation boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source result
Kafka Fetcher.java confirms:
- each OffsetForLeaderEpoch response builds a local truncation list;
- a non-empty list becomes one LogTruncationException;
- maybeSetOffsetForLeaderException uses AtomicReference.compareAndSet(null, e);
- if the slot is occupied, the later error is discarded/logged;
- validateOffsetsIfNeeded consumes the slot with getAndSet(null) before starting current validation scheduling.

The inspected current Fetcher source does not expose an evidence-accumulator or merge operation for multiple asynchronous validation exceptions.

## Test/evidence boundary
SubscriptionStateTest directly tests stale response rejection and truncation state transitions, but the inspected test source does not establish an exhaustive multi-response cache history. The source behavior therefore remains the stronger evidence for first-pending-error-wins at the cache boundary.

## Important distinction
A multi-partition LogTruncationException is complete only for the truncations collected in that one successful response callback. It must not be interpreted as a complete snapshot of all partitions that were concurrently validating.

A later non-retriable failure/truncation can be discarded when the slot is already occupied. Therefore Nexo must capture validation events before/independently of the Kafka exception surface if it needs exhaustive provenance.

## Nexo mapping
KAFKA_EXCEPTION_SLOT_EMPTY -> publish candidate
KAFKA_EXCEPTION_SLOT_OCCUPIED -> SUPPRESSED_BY_PRIOR_EXCEPTION
EXCEPTION_CONSUMED -> PRIOR_EXCEPTION_SURFACED
PARTITION_ABSENT_FROM_SURFACED_EXCEPTION -> UNKNOWN, not NOT_TRUNCATED
LATE_POSITION-MISMATCHED_RESPONSE -> STALE_VALIDATION_RESPONSE

## Status
SOURCE_CODE_VERIFIED=YES
TEST_COVERAGE_REVIEWED=YES
IMPLEMENTED=NO
EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next
AB104.722: inspect the exact retry/backoff state transitions around OffsetForLeaderEpoch failures and truncation, including setNextAllowedRetry/requestFailed interaction, to determine whether retry state can erase or obscure an earlier validation observation.
