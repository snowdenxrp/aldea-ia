# NEXO AB104.725 — OffsetForLeaderEpoch error classification

Date: 2026-09-27
Status: SOURCE_CODE_VERIFIED=YES; SEMANTIC_INTERPRETATION=BOUNDED; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO

## Exact source finding
Fetcher.validateOffsetsAsync distinguishes response-level partitionsToRetry from terminal/non-retriable request failure. Retryable protocol outcomes are represented as partition eligibility for another attempt; they are not truncation evidence.

At the response boundary, partitionsToRetry can coexist with endOffsets for other partitions. Each returned endOffset is independently passed to maybeCompleteValidation. Thus retry classification and truncation classification are orthogonal.

At request failure, every partition in the request receives retry backoff. Only a non-RetriableException is placed into cachedOffsetForLeaderException. A RetriableException produces retry state plus metadata refresh, but no terminal exception evidence.

Cross-check: librdkafka independently fences outdated OffsetForLeaderEpoch responses by marking them OUTDATED when partition fetch state has changed. This is supporting evidence only, not canonical Kafka semantics.

## Epistemic mapping
- Retriable protocol/result condition -> VALIDATION_PENDING_RETRY_BACKOFF
- Request-level RetriableException -> REQUEST_RETRY_BACKOFF for affected request set
- Non-retriable exception -> PRIOR_EXCEPTION_PENDING
- partitionsToRetry absent -> no inference about truncation
- endOffset lower than matching current FetchPosition -> LOG_TRUNCATION_UNRESOLVED
- stale/mismatched validation response -> STALE_VALIDATION_RESPONSE
- unsupported validation capability -> validation skipped/completed by Kafka; Nexo must not reinterpret that as proof of effect absence

## Ambiguity boundary
The retry/error result only establishes what Kafka's client control path did with the protocol outcome. It does not establish external EffectID durability, rejection, or absence. Those claims require independent effect evidence.

## Next exact step
AB104.726: inspect the concrete OffsetForLeaderEpoch response parser/result construction to determine whether partition-level protocol errors can be lost when a request is transformed into OffsetForEpochResult, and whether that transformation preserves enough evidence for Nexo.