# NEXO AB104.726 — OffsetForEpochResult evidence-preservation boundary

Date: 2026-09-27

Status: SOURCE_CODE_VERIFIED=YES; SEMANTIC_INTERPRETATION=BOUNDED; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO

## Exact source finding

Current Apache Kafka `OffsetsForLeaderEpochUtils.handleResponse()` initializes `partitionsToRetry` with every requested partition and removes a partition only when its protocol result is `NONE`. Successful results are copied into `endOffsets`.

Retry-classified errors remain only as membership in `partitionsToRetry`; the exact error code is not retained in `OffsetForEpochResult`. The result exposes only:
- `endOffsets: Map<TopicPartition, EpochEndOffset>`
- `partitionsToRetry: Set<TopicPartition>`

`TOPIC_AUTHORIZATION_FAILED` is different: its topic is accumulated and then a `TopicAuthorizationException` is thrown. `UNKNOWN_TOPIC_OR_PARTITION` remains retry membership rather than a terminal partition result.

## Evidence-loss boundary

This is a real information-loss boundary for Nexo research: after `handleResponse()`, several distinct protocol errors collapse into the same `partitionsToRetry` state. Therefore a later Nexo EventDAG record built only from `OffsetForEpochResult` cannot truthfully reconstruct the original Kafka error code.

The raw response/error classification must be captured before or at this boundary if Nexo needs exact causal provenance.

A successful `NONE` result preserves the full `EpochEndOffset` object for downstream validation. Only successful partitions enter `endOffsets`; retry partitions do not produce an end offset.

## Frozen mapping

- `NONE` -> END_OFFSET_AVAILABLE -> downstream coordinate validation.
- Any retry-classified protocol error -> RETRY_PARTITION_BACKOFF, with exact error UNKNOWN unless captured at response boundary.
- `TOPIC_AUTHORIZATION_FAILED` -> TERMINAL_AUTHORIZATION_ERROR.
- Missing partition from response while it was requested -> remains in retry set; do not interpret as successful absence/truncation.
- `UNKNOWN_TOPIC_OR_PARTITION` -> retry state, not proof of topic/partition permanent absence.
- No `endOffsets` entry -> no truncation conclusion.

## Architectural consequence

Nexo's evidence adapter must capture protocol-level error code/message and response scope before converting Kafka's result into the reduced `OffsetForEpochResult`. The adapter must not reconstruct exact error identity from the retry set later.

## Next exact step

AB104.727: inspect the wire-response/request layer and tests for `OffsetsForLeaderEpochUtils.handleResponse()` to verify coverage of each collapsed error class and identify whether response-level evidence can be captured deterministically before reduction.
