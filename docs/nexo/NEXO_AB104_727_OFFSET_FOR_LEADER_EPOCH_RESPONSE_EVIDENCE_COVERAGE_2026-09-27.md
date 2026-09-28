# NEXO AB104.727 — OffsetForLeaderEpoch response evidence coverage

Date: 2026-09-27

Status: SOURCE_CODE_VERIFIED=YES; SEMANTIC_INTERPRETATION=BOUNDED; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO

## Findings

Current Kafka source confirms `OffsetsForLeaderEpochUtils.handleResponse()` reduces every non-success retry-classified protocol error into `partitionsToRetry`, while successful `NONE` responses retain `EpochEndOffset`. The exact error code is therefore unavailable after `OffsetForEpochResult` construction.

`Fetcher.validateOffsetsAsync()` then consumes only those two reduced surfaces: retry partitions receive retry backoff; successful end offsets enter `maybeCompleteValidation()`. Truncation is derived only from the successful end-offset path. This confirms the evidence-loss boundary is upstream of Nexo's validation decision, not inside truncation detection itself. citeturn0search1

The broker-side API response contains per-partition error codes, so the exact causal evidence exists on the wire before the client reduction. citeturn0search0

## Important distinction

The reduction is not itself a correctness failure in Kafka: Kafka's consumer control flow only needs to know which partitions can retry and which returned offsets can be validated. For Nexo, however, provenance requirements are stricter. If exact protocol causality matters, the adapter must snapshot the raw per-partition error before `OffsetForEpochResult` collapses it.

## Frozen mapping

- raw response + `NONE` -> preserve EpochEndOffset and validate coordinate
- raw response + retry-classified error -> preserve exact error, then map operational state to RETRY_PARTITION_BACKOFF
- raw response + authorization failure -> preserve topic/partition authorization evidence and terminal exception
- absent requested partition in response -> preserve response omission explicitly; do not infer absence/truncation
- reduced `partitionsToRetry` alone -> insufficient to reconstruct exact protocol error

## Test/evidence consequence

Existing downstream tests can verify retry/truncation state transitions, but they cannot prove exact error provenance once the response has been reduced. A Nexo fault-injection harness therefore needs an observation point at the raw `EpochEndOffset.errorCode` boundary, before `OffsetForEpochResult` creation.

## Next exact step

AB104.728: inspect the current Kafka tests for `OffsetsForLeaderEpochUtils.handleResponse()` and enumerate which error classes are explicitly covered versus only implicitly covered by the default retry behavior.