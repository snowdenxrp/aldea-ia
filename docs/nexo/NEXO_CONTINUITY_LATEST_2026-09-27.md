# NEXO — LATEST CONTINUITY CHECKPOINT

Date: 2026-09-27
Canonical repository: snowdenxrp/aldea-ia
Status: RESEARCH ONLY. Implementation remains blocked. No V21.

## Latest chain
AB104.728 → AB104.729 → … → AB104.743 → **AB104.744**

Latest research commit: `38edf9965cd8ce268b622a8efd0ada48ed3c80a6`
Research file: `docs/nexo/NEXO_AB104_744_OFLE_CALLERS_MIXED_AUTH_MALFORMED_AUDIT_2026-09-27.md`

## Critical correlation correction — source-traced end to end
`ForwardingManagerTest.testResponseCorrelationIdMismatch` deliberately serializes a response with `requestCorrelationId + 1`; the response enters the normal forwarding path; `ForwardingManagerImpl` calls `AbstractResponse.parseResponse`; the parser rejects the mismatched correlation ID with `CorrelationIdMismatchException` before API-specific body parsing; the forwarding layer translates it to `UNKNOWN_SERVER_ERROR`, which the test asserts.

Therefore:
- deliberate correlation mismatch test exists = YES;
- mismatch reaches `AbstractResponse.parseResponse` = YES;
- controlled response-header serialization seam = YES;
- OffsetForLeaderEpoch-specific mismatch test = NOT ESTABLISHED;
- runtime execution by this research session = NOT PERFORMED;
- source-level implementation/test-path proof = YES.

## OFLE caller/reducer state
Two production callers of `OffsetsForLeaderEpochUtils.handleResponse` are established:
1. `OffsetsForLeaderEpochClient.handleResponse(...)` delegates directly to the utility.
2. `OffsetsRequestManager` directly calls the utility when an OFLE response completes.

`OffsetsRequestManagerTest` has `buildOffsetsForLeaderEpochResponseWithErrors(...)`; its discovered OFLE use is a single-partition `TOPIC_AUTHORIZATION_FAILED` response. `OffsetForLeaderEpochClientTest` has an arbitrary-`Errors` response helper and a focused authorization case. Neither establishes a mixed multi-partition reducer matrix.

The `retriableErrors()` parameterized matrix in `OffsetsRequestManagerTest` must NOT be counted as OFLE reducer coverage because its inspected test is the ListOffsets path.

## Authorization mixed-response semantics
The reducer initializes retry state from all requested partitions, collects successful end offsets, and accumulates unauthorized topics while continuing iteration. It throws `TopicAuthorizationException` after processing the response if authorization failures were found, so no `OffsetForEpochResult` is returned in that case. Partial local mutations therefore are not externally returned, but mixed authorization behavior is still worth explicit characterization.

Dedicated mixed authorization across multiple requested partitions = NOT ESTABLISHED.

## Shape/malformed state
Broad searches found OFLE response construction in server epoch tests, Fetcher/OffsetFetcher tests, `OffsetForLeaderEpochClientTest`, and `OffsetsRequestManagerTest`, but no dedicated consumer-side reducer tests for duplicate requested entries, missing requested entries, or unrequested entries.

Server-side OFLE tests and generic serialization tests are not reducer evidence.

## Current evidence state
- Direct `OffsetsForLeaderEpochUtils.handleResponse` exhaustive coverage = NO.
- Mixed raw-error reducer coverage = UNKNOWN.
- Direct duplicate raw-response-entry test = NOT ESTABLISHED.
- Direct missing requested partition test = NOT ESTABLISHED.
- Dedicated unrequested OFLE response-shape test = NOT ESTABLISHED.
- Arbitrary OFLE error fixture exists = YES.
- Direct reducer seam = YES (`public static`).
- Correlation mismatch generic test reaches parser = YES.
- OFLE-specific correlation mismatch test = NOT ESTABLISHED.
- Runtime execution by this research session = NO.
- Formal proof = NO.

## Non-negotiable constraints
INVESTIGAR → ANALIZAR → GUARDAR.
No Nexo implementation. No V21. No silent gap closure. Never convert source presence into runtime verification. Keep SOURCE_CODE, TEST_SOURCE, EXECUTED_TEST, FORMAL_PROOF and RUNTIME_VERIFICATION separate.

## EXACT RESUME — AB104.745
1. Trace `OffsetsForLeaderEpochClient.handleResponse` test coverage separately from `OffsetsRequestManager`.
2. Search all OFLE response-helper call sites for multi-partition construction and classify whether they actually reach the reducer.
3. Determine whether any test verifies unauthorized topic sets for multiple unauthorized topics.
4. Continue source audit of response-collection iteration/duplicate semantics without implementing tests.
5. Preserve the correlation correction above in every future checkpoint.
