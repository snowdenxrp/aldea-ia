# NEXO AB104.724 — Retry-causing outcome classification

Date: 2026-09-27
Status: SOURCE_CODE_VERIFIED=YES; SEMANTIC_INTERPRETATION=BOUNDED; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO

## Exact source classification
Fetcher.validateOffsetsAsync has three distinct retry paths:
1. The OffsetForLeaderEpoch response returns partitionsToRetry: those partitions receive a retry-backoff deadline; metadata update is requested.
2. The whole request fails: all fetchPositions receive retry-backoff; metadata update is requested. A non-retriable exception is additionally published to the single exception cache; retriable exceptions are not cached.
3. A successful response may simultaneously contain retryable partitions and end-offsets for other partitions. Truncation is evaluated independently through maybeCompleteValidation.

Fetcher therefore does not encode every retry cause into one state. Partition-level retry and request-level failure have different causal scopes.

## Epistemic consequence
Retry classification must retain scope. A request-level failure cannot be copied as a truncation/absence result for every partition unless the protocol explicitly identifies that partition as failed. Likewise, a partition in partitionsToRetry cannot be inferred to have failed validation permanently.

Non-retriable exception caching is also distinct from truncation: the exception may be surfaced later through cachedOffsetForLeaderException, while retry state for other partitions continues independently.

## Frozen EventDAG mappings
- response partition in partitionsToRetry -> RETRY_PARTITION_BACKOFF
- request failure affecting fetchPositions -> RETRY_REQUEST_BACKOFF
- retriable request failure -> no exception-cache evidence
- non-retriable request failure -> PRIOR_EXCEPTION_PENDING plus request-backoff state
- response with matching truncation -> LOG_TRUNCATION_UNRESOLVED unless exact identity was already observed
- successful validation -> VALIDATION_COMPLETED only for the matching coordinate

## Required provenance
Store validation incarnation, request scope, affected partition set, exact protocol error/classification, retry deadline, metadata-update event, cache publication/suppression, and subsequent response coordinate. Do not derive partition-level absence from a broader request failure.

## Next exact step
AB104.725: inspect the concrete OffsetForLeaderEpoch result/error classification source to enumerate protocol-level partitionsToRetry versus terminal errors and verify whether any classification can be ambiguous for Nexo evidence.