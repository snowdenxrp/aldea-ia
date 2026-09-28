# NEXO AB104.727 — OffsetForLeaderEpoch response evidence coverage

Date: 2026-09-27

Status: SOURCE_CODE_VERIFIED=YES; SEMANTIC_INTERPRETATION=BOUNDED; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO

## Exact finding

The current Kafka consumer path confirms the evidence-loss boundary identified in AB104.726.

`OffsetsForLeaderEpochUtils.handleResponse()` starts `partitionsToRetry` with every requested partition. A partition is removed only when its response error is `NONE`, and its `EpochEndOffset` is stored in `endOffsets`.

The retry-classified response errors are grouped into the same retry set. The exact protocol error is not retained in `OffsetForEpochResult`.

Kafka's `Fetcher.validateOffsetsAsync()` then consumes only:
- `partitionsToRetry()` for retry/backoff;
- `endOffsets()` for validation/truncation.

This means exact protocol-error provenance must be captured at the response boundary, before `OffsetForEpochResult` is consumed.

## Test/evidence implication

The current source path itself is sufficient to establish the reduction boundary, but this turn did not establish exhaustive executed test coverage for every collapsed protocol error. Therefore test coverage remains bounded/UNKNOWN for exhaustive enumeration.

No inference may be made that the retry set preserves which error occurred.

## Frozen Nexo rule

The adapter should emit an immutable raw-response event containing, per returned partition:
TopicPartition, raw error code, decoded error class, response presence, request/validation incarnation, leader coordinate, and timestamp/deadline.

Only after that event is persisted may the Kafka-compatible reduction to retry/success state occur.

## Next exact step

AB104.728: inspect the Kafka test suite around `OffsetsForLeaderEpochUtils.handleResponse()` and enumerate explicit error-case assertions; if exhaustive coverage is absent, record the exact uncovered classes rather than assuming coverage.
