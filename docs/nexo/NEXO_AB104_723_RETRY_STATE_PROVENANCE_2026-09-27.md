# NEXO AB104.723 — Retry state provenance

Date: 2026-09-27
Status: SOURCE_CODE_VERIFIED=YES; SEMANTIC_INTERPRETATION=BOUNDED; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO

## Exact source findings
SubscriptionState.partitionsNeedingValidation(now) selects only partitions that are awaiting validation and whose nextRetryTimeMs has expired or is absent.
nextRetryTimeMs is explicitly cleared when validation is newly entered, when validation completes, when a validated seek occurs, when reset is entered, and when an older protocol path skips validation.
During an OffsetForLeaderEpoch request, Fetcher sets nextRetryTimeMs to the request-timeout boundary. Retryable response partitions receive a later retry-backoff deadline; request failure likewise sets a retry deadline.
Therefore the retry deadline is mutable coordination state, not durable evidence history.

## Critical provenance consequence
A later transition can clear nextRetryTimeMs without preserving why the previous retry existed. Kafka's live SubscriptionState therefore cannot itself serve as Nexo's immutable causal record.
The correct Nexo boundary is to snapshot each retry transition into the EventDAG: validation incarnation, coordinate, prior deadline, new deadline, triggering response/failure, and subsequent transition. Clearing the live deadline must never erase the historical event.
Expiration of nextRetryTimeMs only makes a partition eligible for another validation attempt; it does not establish absence, non-truncation, or loss of an external EffectID.

## Frozen mappings
- awaitingValidation + now < nextRetryTimeMs -> VALIDATION_PENDING_RETRY_BACKOFF
- awaitingValidation + now >= nextRetryTimeMs -> VALIDATION_ELIGIBLE
- new validation coordinate -> VALIDATION_PENDING with a new causal epoch/incarnation
- successful validation -> VALIDATION_COMPLETED at that coordinate; prior retry events remain immutable
- matching truncation -> LOG_TRUNCATION_UNRESOLVED unless exact identity was already observed
- stale response/coordinate mismatch -> STALE_VALIDATION_RESPONSE

## Next exact step
AB104.724: inspect Fetcher failure handling and OffsetForEpochResult partition retry classification to map every retry-causing outcome into the EventDAG, including request timeout, retriable broker error, and per-partition retry.