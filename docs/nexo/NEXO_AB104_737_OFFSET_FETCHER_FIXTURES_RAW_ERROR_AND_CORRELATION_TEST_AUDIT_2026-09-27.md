# NEXO AB104.737 — OffsetFetcher fixtures, raw error identity and correlation-test audit

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation. No V21.

## 1. OffsetFetcherTest helper inspection

Current Apache Kafka `OffsetFetcherTest` contains a helper named `prepareOffsetsForLeaderEpochResponse`.

The helper constructs an `OffsetForLeaderEpochResponseData` and explicitly sets:
- topic;
- partition;
- `errorCode(Errors.NONE.code())`;
- leader epoch;
- end offset.

The helper is therefore useful evidence that the test fixture can construct a raw OffsetForLeaderEpoch response, but the inspected helper itself is hard-coded to `Errors.NONE`.

The related validation tests use `client.prepareResponse(prepareOffsetsForLeaderEpochResponse(...))` and assert behavioral outcomes such as stale in-flight validation or successful validation.

This does NOT establish a reusable current helper matrix for arbitrary raw reducer error codes.

## 2. Multi-partition / helper evidence

The same current test file contains multi-partition validation/request-grouping coverage and helpers for mapping request data by topic/partition.

That demonstrates test infrastructure capable of exercising multiple partitions, but it does not establish exhaustive mixed raw error combinations at the `handleResponse()` boundary.

The direct raw response helper found here cannot be used to claim coverage for the retry/error branches because it emits `Errors.NONE` only.

Therefore:
- RAW_ERROR_MATRIX_VIA_OFFSETFETCHER_HELPER = NOT ESTABLISHED
- DIRECT_REDUCER_EXHAUSTIVE_COVERAGE = NO
- MIXED_RAW_REDUCER_COVERAGE = UNKNOWN

## 3. Correlation mismatch test search

Current repository search for `CorrelationIdMismatchException` tied to tests and for explicit mismatch phrases did not identify a dedicated current test asserting an intentionally mismatched response correlation ID.

Current implementation evidence remains:
- `AbstractResponse.parseResponse` compares request and response correlation IDs;
- mismatch results in `CorrelationIdMismatchException`;
- `NetworkClient.parseResponse` delegates to this parser and has handling around parse failures.

Existing normal-correlation, timeout, disconnect, stale-inflight and version-negotiation tests remain separate evidence classes. None should be promoted to deliberate mismatch-injection coverage.

## 4. Important provenance boundary

The inspected OffsetFetcher helper reinforces the same architectural boundary:

A response object can carry rich raw fields (`errorCode`, leader epoch, end offset), but once `OffsetsForLeaderEpochUtils.handleResponse` reduces several error codes to the same retry state, downstream behavior cannot reconstruct which raw error occurred.

Therefore Nexo should capture raw response provenance before semantic reduction, not attempt to infer it from the later retry state.

## Epistemic status

SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
RAW_ERROR_MATRIX_VIA_OFFSETFETCHER_HELPER=NOT_ESTABLISHED
DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
ALL_ERROR_BRANCHES_TESTED=NO
MIXED_RAW_REDUCER_COVERAGE=UNKNOWN
CORRELATION_VALIDATION_IMPLEMENTED=YES
EXPLICIT_CORRELATION_MISMATCH_TEST_FOUND=NO/NOT_ESTABLISHED
TIMEOUT_TEST=YES
DISCONNECT_TEST=YES
STALE_INFLIGHT_TEST=YES
UNSUPPORTED_CAPABILITY_TEST=YES
TOPIC_INCARNATION=UNKNOWN
BROKER_INCARNATION=UNKNOWN
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

No Kafka source was modified. No Nexo implementation/runtime verification was performed.

## EXACT NEXT ACTION — AB104.738

1. Search all current Kafka test files for construction of `EpochEndOffset` and arbitrary `Errors` values, not just OffsetFetcherTest.
2. Determine whether any existing test directly calls `OffsetsForLeaderEpochUtils.handleResponse` or constructs a response that reaches every reducer branch.
3. Continue the correlation mismatch audit around protocol/request tests, without treating implementation-only exception paths as executed evidence.
4. If no direct matrix exists, formalize the minimum missing test matrix as a research gap rather than implementing it in Nexo.

Do not implement Nexo. Do not create V21.
