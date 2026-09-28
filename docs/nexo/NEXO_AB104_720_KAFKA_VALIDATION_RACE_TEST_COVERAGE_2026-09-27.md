# NEXO AB104.720 — Kafka regression-test coverage for validation races
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Direct test evidence
At Kafka commit 800676c2e366bac8f32625697c67b68db5a817a1, SubscriptionStateTest directly covers the critical stale-response boundary:
- testMaybeCompleteValidationAfterPositionChange: after the partition moves from the original FetchPosition to a new position, a response for the old position returns Optional.empty, leaves awaitingValidation=true, and preserves the new position.
- testMaybeCompleteValidationAfterOffsetReset: after requestOffsetReset, a response for the old validation returns Optional.empty, leaves reset-needed state, and clears the position.
- testTruncationDetectionWithoutResetPolicy: concrete divergent end offset produces LogTruncation carrying the original FetchPosition and divergent OffsetAndMetadata, while awaitingValidation remains true.
- testTruncationDetectionUnknownDivergentOffsetWithoutResetPolicy: undefined epoch/end offset produces LogTruncation with empty divergentOffsetOpt and awaitingValidation remains true.
- testTruncationDetectionWithResetPolicy: concrete truncation causes a reset to the divergent offset/epoch.

These tests directly establish state-transition behavior; they do not prove external-effect durability or Nexo correctness.

## Fetcher propagation evidence
Fetcher.java at the same commit shows validateOffsetsAsync accumulating truncations only from the current OffsetForLeaderEpoch response, then calling buildLogTruncationException. The exception is published via cachedOffsetForLeaderException.compareAndSet(null, e); a later exception is discarded if a prior exception is pending. validateOffsetsIfNeeded consumes that slot with getAndSet(null) before scheduling current validation.

## Important boundary
The test suite directly proves stale responses are ignored at the SubscriptionState boundary. It does NOT establish that the single-slot exception cache is an exhaustive history of all asynchronous validation failures. Therefore Nexo must retain its own per-request/per-validation evidence before relying on surfaced exceptions.

## Frozen mapping
OLD_RESPONSE_AFTER_POSITION_CHANGE -> STALE_VALIDATION_RESPONSE
OLD_RESPONSE_AFTER_RESET -> STALE_VALIDATION_RESPONSE / RESET_PENDING
CONCRETE_TRUNCATION_NONE_POLICY -> LOG_TRUNCATION_UNRESOLVED
UNKNOWN_DIVERGENT_COORDINATE -> LOG_TRUNCATION_UNRESOLVED + DIVERGENT_OFFSET_UNKNOWN
CONCRETE_TRUNCATION_WITH_RESET -> KAFKA_RESET_COORDINATE (not external-effect absence)

## Status
SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
TEST_EXECUTED_BY_NEXO=NO
IMPLEMENTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next
AB104.721: inspect FetcherTest/consumer integration tests for the exception propagation/cache boundary itself, including whether multiple asynchronous validation failures are directly tested as first-error-wins/discard-later behavior.
