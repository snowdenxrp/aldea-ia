# AB105.055R — CloudFormation DescribeEvents operation-centric ledger audit

Date: 2026-09-30
Chain: AB105.054R -> AB105.055R

## Research question

Does DescribeEvents provide a stronger operation graph than StackEvents, and what identity/ordering gaps remain between the two ledgers?

## Primary evidence

CloudFormation DescribeEvents groups events by OperationId. AWS defines an operation as a discrete change attempt and supports stack lifecycle operations, rollback, change-set creation, nested-stack creation, and automatic rollbacks. The response contains OperationEvents and supports filtering by OperationId, ChangeSetName, or StackName. citeturn0search0turn0search2

OperationEvent contains OperationId, EventId, OperationType, OperationStatus, EventType, StackId, LogicalResourceId, PhysicalResourceId, ResourceType, StartTime, EndTime, Timestamp, ResourceStatus, ClientRequestToken, validation fields, provisioning/error fields, and Hook invocation fields. EventType distinguishes STACK_EVENT, PROGRESS_EVENT, VALIDATION_ERROR, PROVISIONING_ERROR, and HOOK_INVOCATION_ERROR. citeturn0search1turn0search8

DescribeStackEvents remains a stack-event history API returning stack-related events in reverse chronological order. citeturn0search6

## Findings

### 1. DescribeEvents provides a stronger operation boundary

OperationId is first-class on every OperationEvent and the API is explicitly organized around operations.

Therefore:

OperationId + OperationEvents
-> BOUNDED_OPERATION_CENTRIC_LEDGER

This is stronger than reconstructing operation membership from timestamps or LogicalResourceId.

### 2. DescribeEvents broadens event classes beyond ordinary StackEvents

The operation ledger can contain:
- STACK_EVENT
- PROGRESS_EVENT
- VALIDATION_ERROR
- PROVISIONING_ERROR
- HOOK_INVOCATION_ERROR

This means an operation can have evidence even where there is no corresponding resource state transition.

For example, a validation failure can establish that the operation was rejected during validation without asserting a resource mutation.

### 3. Operation failure is not equivalent to resource mutation

A VALIDATION_ERROR or early failure can establish an operation failure boundary while providing no resource transition.

Therefore:

VALIDATION_ERROR
-> OPERATION_FAILED_AT_VALIDATION

but not:

VALIDATION_ERROR
-> RESOURCE_MUTATED

Conversely, a provisioning error can coexist with earlier resource progress events, so failure does not prove zero mutation.

### 4. StartTime and EndTime improve bounded timing

OperationEvent exposes StartTime and EndTime in addition to Timestamp.

This permits bounded duration observations for an event.

It still does not establish a complete internal causal trace. Time intervals can overlap and independent resource paths can remain concurrent.

### 5. OperationStatus is operation-level state, not resource-level outcome

OperationStatus is IN_PROGRESS, SUCCEEDED, or FAILED.

ResourceStatus is separately represented with detailed states such as CREATE_COMPLETE, DELETE_FAILED, UPDATE_ROLLBACK_COMPLETE, and DELETE_SKIPPED.

Therefore:

OperationStatus
!=
every resource's final physical state.

A successful operation does not by itself prove every physical cleanup step or external-world state.

### 6. PhysicalResourceId remains optional

OperationEvent exposes PhysicalResourceId, but it is not required.

Thus DescribeEvents improves operation grouping but does not solve the missing-incarnation-identity problem established in AB105.050R and AB105.054R.

### 7. EventId remains event identity

EventId uniquely identifies the event.

It is not OperationId and not PhysicalResourceId.

Therefore:

EventId != operation identity
EventId != incarnation identity.

### 8. ChangeSetName is a useful plan/execution query bridge, not automatic historical causality

DescribeEvents can query by ChangeSetName, which strengthens retrieval of events associated with that change set.

However, queryability does not itself prove that every returned event represents execution of every planned ResourceChange. The execution/outcome evidence must still be interpreted from OperationEvent semantics and resource identity.

### 9. DescribeEvents and StackEvents should be modeled as complementary ledgers

A safe model is:

DescribeEvents
-> operation-centric event graph

StackEvents
-> stack/resource-centric event history

Shared fields such as StackId, OperationId, ClientRequestToken, LogicalResourceId, PhysicalResourceId, ResourceType, Timestamp, ResourceStatus permit bounded cross-ledger joins when values and semantics match.

But equality of fields alone does not prove that the two APIs have identical coverage or retention semantics.

### 10. Stronger graph, not complete graph

DescribeEvents closes an important identity gap:

OperationId is directly queryable.

It does not close:
- physical incarnation gaps when PhysicalResourceId is absent
- complete internal execution trace
- universal causal ordering
- historical completeness across retention boundaries
- external-world state outside CloudFormation.

## Distilled rule

DescribeEvents + OperationId -> BOUNDED_OPERATION_LEDGER

OperationEvent.EventType=VALIDATION_ERROR -> BOUNDED_VALIDATION_FAILURE

OperationEvent.EventType=PROVISIONING_ERROR + resource transition -> BOUNDED_RESOURCE_FAILURE_IN_OPERATION

OperationId + resource identity + compatible timestamps/statuses -> BOUNDED_CROSS_EVENT_GRAPH

missing PhysicalResourceId -> INCARNATION_IDENTITY UNKNOWN

OperationStatus -> operation outcome, not universal resource outcome

DescribeEvents + StackEvents matching identities -> BOUNDED_CROSS_LEDGER_CORRELATION

matching fields alone -> NOT universal causal proof

## Anti-collapse rules

- DescribeEvents != complete internal execution trace.
- OperationId != EventId.
- OperationId != PhysicalResourceId.
- OperationStatus != ResourceStatus.
- VALIDATION_ERROR != resource mutation.
- PROVISIONING_ERROR != proof of zero prior mutation.
- StartTime/EndTime != causal ordering.
- ChangeSetName queryability != execution proof for every planned change.
- DescribeEvents != universal historical ledger.
- StackEvents != DescribeEvents.
- Matching fields != identical coverage.
- Missing PhysicalResourceId != no physical incarnation.
- Operation SUCCEEDED != every resource physically settled.
- Operation FAILED != no resource mutation.

## Status ledger

- Operation-centric grouping: FOUND
- OperationId direct identity: FOUND
- Multiple event classes: FOUND
- Validation/provisioning distinction: FOUND
- Start/End timing: FOUND
- OperationStatus vs ResourceStatus separation: FOUND
- Cross-ledger join fields: FOUND
- Operation-centric graph: ESTABLISHED IN PRINCIPLE
- Stronger than timestamp-only grouping: ESTABLISHED
- Complete causal graph: NOT ESTABLISHED
- Complete physical-incarnation graph: NOT ESTABLISHED
- Universal retention/completeness equivalence with StackEvents: NOT ESTABLISHED
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

AB105.056R — investigate DescribeEvents pagination, filtering, and operation retention/coverage semantics: determine whether an apparently complete OperationId event set can support negative claims, and what UNKNOWN remains when pagination, filters, or historical retention prevent complete retrieval.