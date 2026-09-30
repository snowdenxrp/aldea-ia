# AB105.047R — CloudFormation ExecuteChangeSet -> StackEvents execution/outcome audit

Date: 2026-09-30
Chain: AB105.046R -> AB105.047R

## Research question

What can StackEvents prove after ExecuteChangeSet, and where are the exact boundaries between execution request accepted, operation started, resource transitions, rollback, and final outcome?

## Primary evidence

AWS documents ExecuteChangeSet as starting the stack update after the call successfully completes. StackEvent records expose EventId, StackId, Timestamp, ClientRequestToken, OperationId when present, LogicalResourceId, PhysicalResourceId, ResourceType, ResourceStatus and ResourceStatusReason.

AWS states that all StackEvents triggered by a given stack operation share the same ClientRequestToken. StackEvent OperationId is the unique identifier of the operation that generated that event.

CloudFormation stack statuses include UPDATE_IN_PROGRESS, UPDATE_COMPLETE, UPDATE_FAILED, UPDATE_ROLLBACK_IN_PROGRESS, UPDATE_ROLLBACK_COMPLETE and UPDATE_ROLLBACK_FAILED. AWS documents UPDATE_ROLLBACK_COMPLETE as a successful rollback and UPDATE_ROLLBACK_FAILED as an unsuccessful rollback requiring recovery.

## Findings

### 1. ExecuteChangeSet success is the execution-start boundary

A successful ExecuteChangeSet call means CloudFormation starts updating the stack. It does not mean the resource changes are complete.

Therefore:

ExecuteChangeSet accepted
-> EXECUTION_STARTED / operation admitted

not:

ExecuteChangeSet accepted
-> FINAL_RESOURCE_STATE_PROVEN

### 2. OperationId provides stronger provider-native operation identity when present

StackEvents can contain OperationId, documented as the unique identifier of the operation that generated the event.

Therefore:

OperationId + StackId + compatible StackEvents
-> BOUNDED_OPERATION_IDENTITY

This is stronger than grouping solely by timestamps.

The absence of OperationId does not prove absence of an operation; ClientRequestToken can still provide operation grouping.

### 3. ClientRequestToken groups the operation's events

AWS explicitly states that all events triggered by a given stack operation receive the same ClientRequestToken.

Thus:

same StackId + same ClientRequestToken + compatible StackEvent semantics
-> BOUNDED_STACK_OPERATION_GROUP

This supports reconstructing the operation's event set, subject to event retrieval/retention coverage.

### 4. Resource transitions are observable inside the operation group

StackEvents include LogicalResourceId, PhysicalResourceId, ResourceType, ResourceStatus, status reason and timestamp.

A sequence such as:

UPDATE_IN_PROGRESS
-> UPDATE_COMPLETE

for the exact resource identity provides bounded evidence that CloudFormation observed the resource transition during the operation.

It does not by itself prove independent external-world state beyond the provider's observation contract.

### 5. Rollback must be modeled as part of the operation, not discarded as failure noise

A stack can move through UPDATE_ROLLBACK_IN_PROGRESS and reach UPDATE_ROLLBACK_COMPLETE or UPDATE_ROLLBACK_FAILED.

Therefore an execution record must preserve both forward and rollback events.

UPDATE_ROLLBACK_COMPLETE means rollback completed successfully; it does not mean the planned change was successfully deployed.

UPDATE_ROLLBACK_FAILED means the operation did not restore the stack to the previous stable state automatically.

### 6. Final stack status is necessary but not sufficient for every resource-level claim

A stack-level UPDATE_COMPLETE supports a bounded claim about the stack operation's final provider status.

For a specific resource, exact resource StackEvents and identity are still required.

Conversely, a stack-level rollback status cannot silently erase resource-level transitions that occurred before rollback.

### 7. EventId remains event identity, not operation identity

Each StackEvent has a unique EventId. OperationId, ClientRequestToken and EventId therefore form different identity layers.

Correct model:

OperationId
 -> many StackEvents
 -> each with EventId
 -> resource identity/status

No equality among these identifiers should be inferred.

### 8. CloudTrail remains a separate API-evidence layer

The ExecuteChangeSet API response has a RequestId, while CloudTrail records have eventID/requestID.

The current evidence does not establish a universal equality mapping among these identifiers.

Thus the execution graph can be complete on the CloudFormation side while CloudTrail cross-binding remains claim-specific/UNKNOWN.

## Bounded execution model

PLAN
 -> ChangeSet ARN
 -> planned ResourceChange

EXECUTION
 -> ExecuteChangeSet accepted
 -> OperationId / ClientRequestToken
 -> StackEvents
 -> Resource Status Change
 -> final stack status / rollback status

OBSERVATION
 -> DetectStackDrift
 -> StackDriftDetectionId
 -> Drift Status Change

The strongest provider-side execution claim requires the middle chain, not merely the ExecuteChangeSet API response.

## Anti-collapse rules

- ExecuteChangeSet success != deployment complete.
- ExecuteChangeSet success != every resource updated successfully.
- OperationId != ClientRequestToken.
- OperationId != EventId.
- EventId != resource incarnation ID.
- ClientRequestToken != universal AWS operation ID.
- UPDATE_COMPLETE != proof that every intended external-world property is correct.
- UPDATE_ROLLBACK_COMPLETE != successful execution of the planned change.
- UPDATE_ROLLBACK_FAILED != proof that no changes occurred.
- Stack status != complete resource history.
- Missing StackEvent != no resource transition without coverage.
- Event timestamp order != universal causal proof.
- CloudFormation RequestId != CloudTrail requestID/eventID without concrete binding.

## New distilled rule

ExecuteChangeSet success + ChangeSet identity -> BOUNDED_EXECUTION_START

+ OperationId/ClientRequestToken + StackEvents -> BOUNDED_OPERATION_EVENT_GRAPH

+ exact resource identity + resource status sequence -> BOUNDED_RESOURCE_TRANSITION

+ terminal stack status + rollback evidence -> BOUNDED_EXECUTION_OUTCOME

CloudTrail cross-binding remains separate and claim-specific.

## Status ledger

- ExecuteChangeSet starts update after successful call: FOUND
- StackEvent EventId: FOUND
- StackEvent OperationId: FOUND
- shared ClientRequestToken across operation events: FOUND
- resource identity/status fields: FOUND
- rollback status semantics: FOUND
- execution-start boundary: ESTABLISHED IN PRINCIPLE
- provider-side operation/event graph: ESTABLISHED IN PRINCIPLE
- resource transition binding: ESTABLISHED IN PRINCIPLE
- final outcome binding: ESTABLISHED IN PRINCIPLE
- ExecuteChangeSet RequestId to CloudTrail ID equality: NOT ESTABLISHED
- universal stack-final-state-to-resource-world theorem: REJECTED
- universal plan-to-drift causality: NOT ESTABLISHED
- acquisition boundary: NOT CLOSED
- reconstruction: BOUNDED / PER-CLAIM
- W19/W20: NOT FROZEN
- coverage denominator: NOT FROZEN
- formal verification: NOT PERFORMED
- implementation: NOT STARTED
- semantic/architecture freeze: NOT DECLARED

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

AB105.048R — investigate rollback as a competing state-transition graph: distinguish forward execution, compensating rollback, skipped resources, and final stable state, and determine what evidence is required before reconstructing a single linear operation history.