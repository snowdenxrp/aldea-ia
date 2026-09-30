# AB105.062R — claim-specific coverage contract for Hook + OperationEvent + StackEvent

Date: 2026-09-30
Chain: AB105.061R -> AB105.062R

## Research question

Can Hook results, OperationEvents, and StackEvents be combined into a claim-specific coverage contract, and where must an old negative reconstruction claim become UNKNOWN?

## Primary evidence

AWS states that the Hook Invocation Summary covers Hook invocations across an account and Region for the past 90 days. ListHookResults is paginated and supports filters by Hook, status, and target. Therefore a complete negative claim over Hook invocations requires exhausting pagination and accounting for the active filters. citeturn0search0turn0search1

GetHookResult identifies a Hook result by a unique HookResultId and includes target identity, action, invocation time, status, and failure mode. This makes a retrieved result strong evidence about that Hook invocation, but not automatically about the final physical resource state. citeturn0search2turn0search3

DescribeEvents groups CloudFormation events by OperationId and is paginated. A null NextToken means the returned result set for that query has been exhausted; it does not establish that the historical universe is complete. OperationEvent can include Hook invocation errors together with OperationId, ClientRequestToken, resource identities, and Hook failure mode. citeturn0search7turn0search8

## Findings

### 1. Coverage is claim-specific, not global

There is no single statement called COMPLETE_HISTORY that can safely cover all three surfaces.

Instead each claim must declare its evidence scope:

HOOK_COVERAGE
OPERATION_COVERAGE
STACK_EVENT_COVERAGE
RESOURCE_STATE_COVERAGE

A claim is only as strong as the weakest required evidence boundary.

### 2. Hook negative claims have an explicit 90-day boundary

For the Invocation Summary surface, AWS documents the past 90 days.

Therefore:

complete pagination + appropriate unfiltered scope + claim date inside the documented 90-day window
-> bounded NO_HOOK_INVOCATION_OBSERVED.

Outside that documented window:

NO_HOOK_INVOCATION_OBSERVED
-> UNKNOWN

unless an independently retained Hook result or external evidence exists.

The 90-day statement is not generalized to OperationEvents or StackEvents.

### 3. Filters can invalidate negative claims

ListHookResults supports filters by TypeArn, Status, and target. A filtered empty result cannot support the universal statement that no Hook invocation existed.

Therefore:

FILTERED_EMPTY -> NO_MATCH_FOR_FILTER

not:

NO_HOOK_INVOCATION.

This is the same epistemic rule already established for DescribeEvents.

### 4. OperationEvent coverage remains independent

A complete DescribeEvents query for a known OperationId can establish that no matching OperationEvent was returned for that operation within the retrievable result set.

It cannot prove that no Hook invocation occurred historically if the Hook invocation is outside the relevant retained dataset or was represented only through another evidence surface.

Therefore:

NO_OPERATION_EVENT
!= NO_HOOK_INVOCATION.

### 5. StackEvents remain necessary for physical lifecycle claims

OperationEvent can report operation-level status, validation errors, provisioning errors, and Hook invocation errors.

A physical resource claim still requires resource lifecycle evidence such as LogicalResourceId and PhysicalResourceId in the relevant StackEvents/resource evidence.

Therefore:

HOOK_PASS
!= RESOURCE_CREATED

HOOK_FAIL
!= RESOURCE_NEVER_EXISTED

OPERATION_SUCCEEDED
!= EVERY_RESOURCE_FINAL_STATE_PROVEN

### 6. Strongest bounded reconstruction

For a claim such as:

"Did Hook H block creation of logical resource L during operation O?"

the strongest bounded evidence chain is:

HookResultId
-> Hook result/status/target
-> OperationId or co-recorded operation evidence
-> StackEvent lifecycle for L
-> PhysicalResourceId transition when present

Every arrow must be supported by a shared field or provider-documented semantic.

If any required arrow is missing:

CLAIM = UNKNOWN

### 7. Old negative claims must decay to UNKNOWN

A negative claim is not permanently reusable merely because it was once observed.

Example:

"No Hook invocation was found for target T"

is bounded by:
- retrieval timestamp,
- Hook retention window,
- pagination completeness,
- filters,
- target identity,
- region/account,
- and the specific evidence surface.

When the claim exceeds its documented coverage boundary, it must be reclassified UNKNOWN unless durable evidence preserved the relevant observation.

### 8. Retained positive evidence differs from historical absence

A retrieved HookResultId is an explicit positive observation and can remain useful as preserved evidence even after the live query window changes.

By contrast, absence from a later live query is not evidence that an old invocation never existed.

This asymmetry is important:

POSITIVE_RETAINED_RECORD -> evidence remains available if preserved

OLD_LIVE_QUERY_ABSENCE -> UNKNOWN

### 9. Coverage contract

For each claim, record:

CLAIM_SCOPE
ACCOUNT
REGION
TIME_BOUND
TARGET_IDENTITY
HOOK_TYPE
OPERATION_ID
FILTERS
PAGINATION_COMPLETE
SOURCE_SURFACES
RETENTION_BOUNDARY
CORRELATION_EDGES
FINAL_EVIDENCE_STATE

Allowed final states:

PROVEN_WITHIN_SCOPE
BOUNDED_OBSERVATION
PARTIAL
UNKNOWN

Do not use a binary PRESENT/ABSENT model.

## Claim matrix

| Claim | Minimum evidence | Negative claim boundary |
|---|---|---|
| Hook invocation occurred | retained HookResultId/result | positive evidence |
| No Hook invocation in 90-day live Hook summary | complete unfiltered ListHookResults + scope | documented 90-day window |
| No Hook invocation ever occurred | durable complete historical ledger | NOT ESTABLISHED by AWS Hook summary |
| Operation contained Hook error | complete DescribeEvents for OperationId | retrievable OperationEvent dataset |
| Resource lifecycle transition occurred | StackEvents/resource identity | available lifecycle evidence |
| Resource was never created | lifecycle + replacement/rollback evidence sufficient to exclude creation | claim-specific; otherwise UNKNOWN |
| Hook FAIL prevented provisioning | Hook result + provider semantics + operation/resource evidence | bounded to operation |
| Hook PASS proves resource exists | insufficient | UNKNOWN |

## Distilled rule

Hook coverage is claim-specific.

Complete pagination is necessary but not sufficient for historical completeness.

The documented 90-day Hook summary window is a boundary for that surface only.

A filtered empty query proves only absence within the filter.

Positive retained Hook evidence is stronger than later absence from a live query.

Physical resource claims still require lifecycle evidence.

When any required coverage or correlation edge is missing:

UNKNOWN

## Anti-collapse rules

- 90-day Hook summary != universal CloudFormation event retention.
- HookResultId != PhysicalResourceId.
- Hook PASS != resource creation.
- Hook FAIL != universal non-creation.
- OperationSucceeded != every resource final state.
- Filtered empty != universal absence.
- Query exhaustion != historical universe exhaustion.
- Positive retained record != negative live-query absence.
- Account/Region scope must not be silently broadened.
- Missing correlation edge != inferred correlation.

## Status ledger

- Hook 90-day summary boundary: FOUND
- Hook pagination/filter semantics: FOUND
- OperationEvent pagination/OperationId scope: FOUND
- HookResultId positive evidence identity: FOUND
- Claim-specific coverage contract: ESTABLISHED IN PRINCIPLE
- Universal historical Hook ledger: NOT ESTABLISHED
- Universal CloudFormation event retention: NOT ESTABLISHED
- Physical-state proof from Hook alone: NOT ESTABLISHED
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

AB105.063R — investigate whether CloudFormation StackEvents provide enough resource-level identity and ordering semantics to close the physical-lifecycle edge in the claim contract, especially replacement, DELETE_FAILED, Retain, and missing PhysicalResourceId cases.
