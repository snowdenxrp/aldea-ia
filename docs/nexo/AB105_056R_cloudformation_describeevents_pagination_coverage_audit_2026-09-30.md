# AB105.056R — CloudFormation DescribeEvents pagination and coverage audit

Date: 2026-09-30
Chain: AB105.055R -> AB105.056R

## Research question

When can a retrieved DescribeEvents result set support a negative claim about an operation, and when must UNKNOWN remain because pagination or filtering prevents complete coverage?

## Primary evidence

AWS documents DescribeEvents as paginated: if results are truncated, NextToken is returned and must be supplied to retrieve the next set. A null NextToken means the service returned all remaining results for that request. The API supports OperationId, ChangeSetName, or StackName queries and an EventFilter including FailedEvents. citeturn0search0turn0search1

The AWS CLI documentation likewise states that DescribeEvents is paginated and that multiple API calls may be required to retrieve the entire result set. citeturn0search1

DescribeStackEvents is also paginated; AWS specifies that its NextToken is returned when output exceeds 1 MB. citeturn0search5

## Findings

### 1. A single DescribeEvents response is not necessarily the complete operation ledger

If NextToken is present, the response is explicitly incomplete.

Therefore:

NextToken != null
-> COVERAGE_INCOMPLETE

No negative claim about an absent event is valid from that page alone.

### 2. Null NextToken closes pagination for that query, not universal historical completeness

A null NextToken establishes that there are no additional results for that particular query under the service's returned result set.

It does not prove that:
- no events were ever emitted outside the query's filter,
- no events existed outside the API's available history,
- external systems have no corresponding evidence,
- every physical-world mutation is represented.

Therefore:

NextToken = null
-> QUERY_RESULT_COMPLETE
not
-> UNIVERSAL_HISTORY_COMPLETE.

### 3. Filters can intentionally remove evidence

The FailedEvents filter can restrict the result set to failed events.

Therefore a query using FailedEvents=true cannot support the negative claim "no successful/progress event occurred."

More generally:

FILTERED_QUERY
-> FILTERED_COVERAGE

not
-> COMPLETE_OPERATION_LEDGER.

### 4. OperationId is the preferred boundary for operation-scoped negative claims

An OperationId query avoids mixing unrelated operations that can occur on the same stack.

If all pages are consumed and no restrictive filter is used, the resulting dataset is the strongest available DescribeEvents basis for an operation-scoped negative claim.

Even then, the claim remains bounded by the API's documented event model and retention/availability limits.

### 5. ChangeSetName and StackName queries have broader ambiguity

A ChangeSetName query can retrieve events associated with the change set, while StackName can retrieve events across stack operations.

Neither should be treated as an exact single-operation ledger unless the returned OperationId values establish that boundary.

### 6. Pagination state must be persisted as evidence

For audit/reconstruction, the chain should retain:
- query selector;
- filters;
- every page;
- NextToken progression;
- final null NextToken;
- retrieval timestamps;
- OperationId values observed.

A later statement of "we queried DescribeEvents" is insufficient evidence of complete retrieval if pagination state was not preserved.

### 7. Negative claims require a coverage contract

Safe negative claim:

NO_MATCHING_EVENT_IN_RETRIEVED_OPERATION_DATASET

Unsafe compression:

NO_EVENT_OCCURRED.

The first is an epistemically bounded statement. The second exceeds the evidence unless additional provider guarantees establish completeness.

### 8. Missing event and failed retrieval are different states

If pagination fails midway, authorization fails, throttling prevents completion, or the audit process loses a NextToken, the correct state is INCOMPLETE/UNKNOWN rather than NO_EVENT.

A retrieval error cannot be converted into an empty dataset.

### 9. DescribeEvents and StackEvents require independent coverage accounting

Even when both APIs are queried for the same operation, each has its own retrieval path and semantics.

Cross-ledger corroboration is stronger when both complete, but a complete DescribeEvents query does not automatically prove complete StackEvents history, and vice versa.

## Coverage state machine

START
 -> QUERY_BOUND
 -> PAGE_1
 -> NextToken
 -> PAGE_N
 -> NextToken = null
 -> QUERY_COMPLETE

Failure before final page:
 -> COVERAGE_INCOMPLETE
 -> UNKNOWN for negative claims

Filtered query:
 -> FILTERED_COVERAGE
 -> only claims within filter domain are admissible

OperationId query + all pages + no restrictive filter + final null token:
 -> BOUNDED_OPERATION_DATASET_COMPLETE

This remains bounded to the API's available event model.

## Distilled rule

`NextToken present -> incomplete dataset`

`NextToken null -> query pagination complete`

`filtered query -> filtered coverage`

`OperationId + all pages + no restrictive filter -> strongest bounded operation dataset`

`retrieval failure before final page -> UNKNOWN, not empty`

`query-complete != universal historical completeness`

`no matching event in dataset != no event ever occurred`

## Anti-collapse rules

- One page != complete operation history.
- NextToken != proof of another event type; it proves only more result pages exist.
- Null NextToken != universal history completeness.
- FailedEvents=true != complete operation ledger.
- StackName query != single operation identity.
- ChangeSetName query != proof every planned change executed.
- Retrieval failure != empty result.
- Missing page != no event.
- API dataset completeness != physical-world completeness.
- DescribeEvents completeness != StackEvents completeness.
- No matching event != no event ever occurred.

## Status ledger

- DescribeEvents pagination: FOUND
- NextToken completeness boundary: FOUND
- FailedEvents filtering: FOUND
- OperationId operation boundary: FOUND
- Negative-claim coverage contract: ESTABLISHED IN PRINCIPLE
- Query-complete vs universal-history distinction: ESTABLISHED
- Retrieval failure -> UNKNOWN rule: ESTABLISHED
- API historical retention/availability guarantee sufficient for universal negative claims: NOT ESTABLISHED
- Complete physical-world coverage: NOT ESTABLISHED
- Acquisition boundary: NOT CLOSED
- Reconstruction: BOUNDED / PER-CLAIM
- W19/W20: NOT FROZEN
- Coverage denominator: NOT FROZEN
- Formal verification: NOT PERFORMED
- Implementation: NOT STARTED
- Semantic/architecture freeze: NOT DECLARED

## Historical carry-forward — MUST NOT COLLAPSE

AB50–AB58 unresolved state remains unchanged:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

AB55 scope remains only 64 states × 6 total orders = 384 per attack across 8 attacks; it did not establish full UsedAdmissionContext/EventDAG/FutureObs_PAA closure.

## Next exact direction

AB105.057R — investigate event retention/history boundaries and whether CloudFormation documents a guaranteed historical horizon for DescribeEvents/StackEvents; if no universal retention guarantee is documented, formally preserve UNKNOWN for claims extending beyond the retrieved provider dataset.