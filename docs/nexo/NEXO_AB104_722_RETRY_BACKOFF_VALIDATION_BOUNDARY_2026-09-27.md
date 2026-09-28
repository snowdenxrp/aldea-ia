# NEXO AB104.722 — Retry/backoff validation boundary

Date: 2026-09-27
Status: SOURCE_CODE_VERIFIED=YES; SEMANTIC_INTERPRETATION=BOUNDED; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO

## Exact finding
Current Kafka Fetcher validation flow sets a retry gate before OffsetForLeaderEpoch requests and updates it on retryable partition results/failures. The retry state is time-based (nextRetryTimeMs) and is separate from the single-slot cachedOffsetForLeaderException.

- validateOffsetsIfNeeded() first consumes a cached exception, then asks partitionsNeedingValidation(now); retry-gated partitions are therefore not immediately re-requested.
- validateOffsetsAsync() calls setNextAllowedRetry(... requestTimeoutMs) before sending.
- Retryable response partitions receive setNextAllowedRetry(... retryBackoffMs); request failure calls requestFailed(... retryBackoffMs).
- Non-retriable failure is cached separately; if another exception already occupies the slot, the later error is discarded.
- A successful response can both mark some partitions for retry and produce truncation observations for others in the same response.

## Epistemic consequence for Nexo
Retry/backoff is not evidence of absence, non-truncation, or effect loss. A partition can remain VALIDATION_PENDING/RETRY_BACKOFF while another partition's truncation or exception is surfaced. The evidence record must preserve the retry deadline and validation incarnation/coordinate rather than collapsing the interval into NOT_OBSERVED.

A cached non-retriable exception can be surfaced before a newly scheduled validation cycle. Therefore exception consumption and retry eligibility are separate causal events and must remain distinct in the EventDAG.

## Required evidence fields
TopicPartition; FetchPosition/leader epoch; validation incarnation; request start; request timeout deadline; retry-backoff deadline; response classification; partitionsToRetry; whether a non-retriable exception entered the cache; whether cache was occupied; whether exact EffectID was observed; phase/state at each transition.

## Frozen mappings
- retryable request/partition failure -> VALIDATION_PENDING_RETRY_BACKOFF
- non-retriable error cached -> PRIOR_EXCEPTION_PENDING
- cached error consumed -> PRIOR_EXCEPTION_SURFACED
- matching truncation -> LOG_TRUNCATION_UNRESOLVED unless exact identity was already observed
- retry interval expiration -> eligible for a new validation attempt, not evidence that the prior observation was absent

## Next exact step
AB104.723: inspect partitionsNeedingValidation and the precise nextRetryTimeMs state machine, including state transitions that clear/reset the retry deadline, to determine whether any transition can erase causal provenance needed by Nexo.

## Source
Apache Kafka Fetcher.java / SubscriptionState.java current source reviewed via GitHub search/fetch on 2026-09-27.