# NEXO AB104.718 — Validation-state retention and replacement
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source findings
Kafka SubscriptionState.maybeCompleteValidation() only acts when the partition is assigned, still awaiting validation, and its current FetchPosition exactly equals the request position. Otherwise the response is ignored as stale/non-applicable.

A successful validation with endOffset >= current position calls completeValidation(). A truncation with no reset policy returns LogTruncation without transitioning to a new validated position. With a reset policy, Kafka seeks the divergent position and marks it validated.

## Evidence consequence
Validation state is therefore conditional on request-position identity. A late response cannot be applied to a newer position merely because it names the same TopicPartition.

This creates three distinct states Nexo must preserve:
- response matched active validation and established truncation;
- response was stale because assignment/awaiting state/position changed;
- validation remains unresolved or pending.

A stale response is not negative evidence. Likewise, completeValidation() after a non-truncating response is evidence only that Kafka completed that validation coordinate; it is not evidence about an external EffectID.

## Replacement boundary
On leader change, SubscriptionState rebuilds the FetchPosition with the current leader/epoch and enters AWAIT_VALIDATION when epoch information permits validation. Thus validation is coordinate-specific and can be superseded by a newer leader/position state.

Nexo evidence must bind observations to:
TopicPartition + FetchPosition (offset, offsetEpoch, currentLeader/epoch when available) + validation/request epoch + response match status.

## Cross-link to AB104.717
AB104.717 established that the surfaced cached exception is a single-slot and may discard later exceptions. AB104.718 adds that even before exception caching, individual validation responses may be intentionally ignored when their request position no longer matches current state. Therefore absence from the final exception cannot be treated as absence from validation history.

## Frozen interpretation
- matched truncation => LOG_TRUNCATION_UNRESOLVED unless exact identity was already observed;
- stale response => STALE_VALIDATION_RESPONSE, not NOT_OBSERVED;
- completed validation => VALIDATION_COMPLETED at that coordinate only;
- pending/retry => VALIDATION_PENDING;
- no conclusion about external effect durability.

## Status
SOURCE_CODE_VERIFIED=YES
SEMANTIC_INTERPRETATION=BOUNDED
IMPLEMENTED=NO
EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next
AB104.719: inspect leader-change validation scheduling/backoff and the exact transition from AWAIT_VALIDATION to FETCHING/RESET, including whether a new validation can race with cached prior exceptions and how Nexo should epoch/fence those observations.
