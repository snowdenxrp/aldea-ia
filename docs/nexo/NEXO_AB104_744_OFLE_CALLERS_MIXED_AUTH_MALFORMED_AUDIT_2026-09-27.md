# NEXO AB104.744 — OFLE callers, mixed authorization, malformed-shape audit

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation. No V21.

## 1. Caller audit
Current source search finds two production callers of `OffsetsForLeaderEpochUtils.handleResponse`:
- `OffsetsForLeaderEpochClient.handleResponse(...)`, which delegates directly to the utility.
- `OffsetsRequestManager` response handling, which directly calls the utility and completes the request future or exceptionally completes it on runtime error.

No dedicated current `OffsetsForLeaderEpochUtilsTest` was found.

## 2. Consumer-test evidence
`OffsetsRequestManagerTest` has a real OFLE response helper, `buildOffsetsForLeaderEpochResponseWithErrors`, and its discovered OFLE call site uses `Collections.singletonMap(TEST_PARTITION_1, Errors.TOPIC_AUTHORIZATION_FAILED)`. This proves the manager path exercises the authorization branch, but only for one partition.

`OffsetForLeaderEpochClientTest` has a response helper accepting an arbitrary `Errors` value and includes a `TOPIC_AUTHORIZATION_FAILED` response case. This is client/protocol behavior evidence, but the audit did not establish a mixed multi-partition reducer matrix.

A parameterized `retriableErrors()` list exists in `OffsetsRequestManagerTest`, but the inspected test using it is the ListOffsets path. It must not be attributed to OFLE reducer coverage.

## 3. Mixed authorization / partial result semantics
Current reducer source initializes `partitionsToRetry` from every requested partition and accumulates `endOffsets` as it encounters `NONE`. Authorization removes the affected partition from retry and records its topic, but the method does not immediately throw. It continues processing the response, then throws `TopicAuthorizationException` if any unauthorized topic was collected.

Consequently, source-level behavior permits local `endOffsets` and retry-set mutations before the eventual exception, but `OffsetForEpochResult` is never returned when authorization is present. Those partial local mutations are therefore not externally observable through the normal return value. A direct test should nevertheless characterize the exception's unauthorized topic set and confirm no successful result escapes.

Mixed authorization with another requested partition is NOT currently established by a dedicated test.

## 4. Malformed/shape search
Current broad searches found response construction in server epoch tests, `FetcherTest`, `OffsetFetcherTest`, `OffsetForLeaderEpochClientTest`, and `OffsetsRequestManagerTest`, but no dedicated consumer-side malformed OFLE collection test for duplicate requested entries, missing requested entries, or unrequested entries.

Server-side `OffsetsForLeaderEpochTest` is not evidence of consumer reducer behavior.

## 5. Important state correction
The audit does NOT close the reducer gap. It narrows it:
- production caller chain = verified;
- authorization branch through manager = verified at source/test level;
- arbitrary OFLE response fixture = verified;
- mixed raw-error reducer coverage = still UNKNOWN;
- exhaustive direct reducer coverage = NO;
- duplicate/missing/unrequested dedicated reducer tests = NOT ESTABLISHED.

## Epistemic status
SOURCE_CODE_VERIFIED=YES
TEST_SOURCE_VERIFIED=YES
OFLE_PRODUCTION_CALLERS=2_ESTABLISHED
OFLE_AUTHORIZATION_MANAGER_TEST=YES_SINGLE_PARTITION
OFLE_CLIENT_AUTHORIZATION_TEST=YES
MIXED_OFLE_REDUCER_TEST=NOT_ESTABLISHED
MIXED_AUTHORIZATION_TEST=NOT_ESTABLISHED
MALFORMED_OFLE_COLLECTION_TEST=NOT_ESTABLISHED
DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
FORMAL_PROOF=NO
TLC=PENDING

## EXACT NEXT ACTION — AB104.745
1. Trace `OffsetsForLeaderEpochClient.handleResponse` test coverage separately from `OffsetsRequestManager`.
2. Search all OFLE response helper call sites for more than one partition and classify whether they reach the reducer or only validate serialization/request behavior.
3. Determine whether any existing test verifies the unauthorized topic set for multiple unauthorized topics.
4. Continue source audit of response collection iteration/duplicate semantics, without implementing tests.

No Nexo implementation. No V21.
