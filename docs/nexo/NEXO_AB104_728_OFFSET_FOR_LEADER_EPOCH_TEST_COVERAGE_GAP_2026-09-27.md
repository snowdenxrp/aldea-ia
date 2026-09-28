# NEXO AB104.728 — OffsetForLeaderEpoch test coverage gap

Date: 2026-09-27

Status: SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; EXHAUSTIVE_TEST_COVERAGE=UNKNOWN; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO

## Exact evidence

Current Kafka `OffsetFetcherTest` explicitly tests downstream validation outcomes: undefined epoch/offset, concrete truncation with reset policy NONE, stale in-flight responses after seek, and leader-epoch fencing. These tests establish validation-state behavior but do not provide exhaustive direct assertions for every raw `OffsetsForLeaderEpochUtils.handleResponse()` error class.

The source reducer classifies several protocol errors into the same `partitionsToRetry` set, while authorization throws a terminal `TopicAuthorizationException`. Therefore downstream validation tests cannot prove preservation of the original error identity after reduction.

## Coverage status

Verified downstream tests:
- undefined epoch/end offset
- concrete truncation
- stale response after position change
- leader-epoch fencing
- validation skipped for old response

Not established as exhaustive direct coverage at the reducer boundary:
- every retry-classified protocol error individually
- distinction between each collapsed retry error after `OffsetForEpochResult`
- explicit omission-response provenance
- deterministic preservation of raw error code for Nexo

Therefore these remain UNKNOWN rather than assumed covered.

## Nexo consequence

Do not use Kafka's downstream retry-state tests as proof that raw error provenance survives. Nexo must capture the raw per-partition `EpochEndOffset.errorCode` before reduction.

## Next exact step

AB104.729: inspect the actual Kafka `OffsetsForLeaderEpochUtils` test/source history and protocol response tests to determine whether a direct reducer test exists elsewhere; if not, document the exact minimum test matrix Nexo would need without modifying Kafka.