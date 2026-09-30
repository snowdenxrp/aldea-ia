# AB105.057R — CloudFormation event-history retention and coverage audit

Date: 2026-09-30
Chain: AB105.056R -> AB105.057R

## Research question

Does AWS guarantee a historical retention horizon for DescribeEvents/DescribeStackEvents sufficient for negative claims about old operations?

## Primary evidence

Current AWS DescribeEvents documentation defines operation-centric retrieval and pagination with NextToken, but does not specify a universal time-based retention period for OperationEvents in the API reference. If all results are returned, NextToken is null; this means the query exhausted the service's returned result set, not that an eternal historical ledger exists. citeturn0search0

DescribeStackEvents likewise documents pagination and says that events can be listed for failed or deleted stacks by unique stack ID. Its API reference does not specify a universal event-retention duration. citeturn0search1

AWS does explicitly document a 90-day retention period for deleted stack objects/resources in other APIs. The User Guide states that deleted stacks are retained and viewable for 90 days, and DescribeStackResources documents resource information for deleted stacks for up to 90 days. This is evidence for deleted-stack/resource metadata, not a general 90-day guarantee for every event returned by DescribeEvents/DescribeStackEvents. citeturn1search0turn1search1

## Findings

### 1. No universal event-retention horizon was found

The current API references expose pagination and query semantics but do not state a universal number of days for which every operation event remains retrievable.

Therefore we must NOT encode:

EVENT_HISTORY_RETENTION = 90 DAYS

as a universal rule.

The 90-day statement applies to deleted stack visibility/resource metadata, not automatically to every event ledger.

### 2. NextToken=null proves query exhaustion, not historical completeness

If DescribeEvents returns NextToken=null, the service says the request returned all remaining results matching the query.

This establishes:

QUERY_RESULT_SET_EXHAUSTED = TRUE

It does not establish:

ALL_HISTORICAL_EVENTS_EVER_CREATED = TRUE.

The same distinction applies to DescribeStackEvents.

### 3. Deleted-stack accessibility is a separate evidence boundary

AWS permits querying events for failed or deleted stacks by unique stack ID. Deleted-stack visibility is explicitly time-bounded elsewhere at 90 days.

Therefore a reconstruction must distinguish:

STACK_OBJECT_RETAINED
from
EVENT_LEDGER_COMPLETE.

The first does not imply the second.

### 4. Absence after a retention boundary is UNKNOWN, not NO EVENT

If an operation is older than the documented availability window for the relevant stack object/resource metadata, inability to retrieve an event cannot prove that the event never occurred.

The correct state is:

EVENT_NOT_RETRIEVABLE = UNKNOWN

unless independent durable evidence exists.

### 5. Negative claims require a coverage contract

A claim such as:

NO_P2_CREATION_OBSERVED

is only safe as an observation if the queried dataset is complete for the specified operation and scope.

A stronger claim:

P2_WAS_NOT_CREATED

requires provider semantics plus complete relevant evidence sufficient to exclude the transition.

### 6. Event-history retrieval is not an external-world ledger

Even a complete CloudFormation event set describes provider-observed CloudFormation activity. It does not by itself prove the current physical state of an external resource after the observation window.

This preserves the existing separation:

PROVIDER_EVENT_HISTORY != CURRENT_PHYSICAL_STATE.

### 7. Retention must be modeled as a coverage dimension

For every reconstructed operation:

EVENT_COVERAGE =
  COMPLETE_QUERY_RESULT
  | PAGINATED_COMPLETE
  | FILTERED
  | PARTIAL
  | UNAVAILABLE
  | UNKNOWN

And separately:

HISTORICAL_RETRIEVAL_WINDOW = UNKNOWN unless explicitly documented for the relevant API/object.

### 8. Stronger negative claims can be made only inside the proven window

Safe example:

"No P2 creation event was returned in the complete, unfiltered event set available for OperationId X."

Unsafe without more evidence:

"P2 was never created."

The first is an observation. The second is a universal historical claim.

## Distilled rule

`NextToken=null -> QUERY_EXHAUSTED`

`QUERY_EXHAUSTED != HISTORICAL_UNIVERSE_EXHAUSTED`

`90-day deleted-stack visibility != universal event retention`

`unavailable historical event -> UNKNOWN`

`complete query + no transition -> bounded negative observation`

`bounded negative observation != universal non-occurrence`

`CloudFormation event history != current external physical state`

## Anti-collapse rules

- NextToken=null != all events ever generated.
- 90-day deleted-stack visibility != 90-day universal event retention.
- Stack existence != event completeness.
- Event absence != event non-occurrence.
- API query exhaustion != historical universe exhaustion.
- Complete returned dataset != complete internal execution trace.
- Provider event history != current physical resource state.
- Missing historical event != proof of no mutation.
- Retention boundary != causal boundary.
- Filtered query != complete negative evidence.

## Status ledger

- DescribeEvents pagination semantics: FOUND
- DescribeStackEvents pagination semantics: FOUND
- Deleted-stack 90-day visibility: FOUND
- Universal event-retention horizon: NOT FOUND / NOT DOCUMENTED
- 90-day universal event-retention rule: REJECTED
- NextToken-null interpretation: ESTABLISHED
- Coverage contract requirement: ESTABLISHED IN PRINCIPLE
- Negative-claim boundary: ESTABLISHED IN PRINCIPLE
- Complete historical event universe: NOT ESTABLISHED
- Current physical-state proof: NOT ESTABLISHED
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

AB105.058R — investigate CloudFormation event persistence versus durable external audit sources (CloudTrail and related logs): determine which event classes can be independently preserved and how an external audit record can strengthen reconstruction without falsely replacing the CloudFormation event ledger.