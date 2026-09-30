# AB105.052R — CloudFormation ChangeSet plan-to-execution replacement bridge audit

Date: 2026-09-30
Chain: AB105.051R -> AB105.052R

## Research question

When does a ChangeSet ResourceChange branch such as ReplaceAndRetain or ReplaceAndSnapshot become historical fact rather than remaining plan-only evidence?

## Primary evidence

AWS defines ResourceChange as describing the resource and action CloudFormation will perform if the ChangeSet is executed. PolicyAction can be ReplaceAndDelete, ReplaceAndRetain, or ReplaceAndSnapshot. Therefore these fields are plan semantics. AWS documentation: ResourceChange API.

AWS documents ExecuteChangeSet as starting the stack update after the call successfully completes.

AWS StackEvents expose LogicalResourceId, PhysicalResourceId, ResourceStatus, ResourceProperties, ClientRequestToken, and OperationId. All events from a given stack operation receive the same ClientRequestToken.

AWS also exposes CloudFormation Resource Status Change events with stack ID, logical resource ID, physical resource ID, status, resource type, and client-request-token.

## Findings

### 1. ResourceChange alone remains PLAN

ReplaceAndRetain or ReplaceAndSnapshot establishes intended policy/action, not execution.

ResourceChange(policy) -> BOUNDED_INTENDED_REPLACEMENT_POLICY

but not:

ResourceChange(policy) -> replacement occurred.

### 2. ExecuteChangeSet establishes the execution boundary

A successful ExecuteChangeSet call establishes that CloudFormation started the update.

It still does not prove that the planned replacement actually completed.

Required next evidence is the provider operation/event graph.

### 3. ClientRequestToken creates the strongest direct plan-to-operation grouping available here

If the ExecuteChangeSet request supplies a ClientRequestToken and the resulting StackEvents carry the same token, the ChangeSet execution request can be grouped with the resulting CloudFormation operation.

This is a bounded provider correlation, not a universal AWS operation identity.

### 4. PhysicalResourceId transitions convert plan into observed incarnation evidence

For a replacement resource:

old P1
-> forward operation
-> new P2 observed in StackEvents

combined with exact LogicalResourceId, resource type, operation grouping, and compatible event sequence:

-> BOUNDED_EXECUTED_REPLACEMENT(P1 -> P2)

This is the point where the replacement branch becomes historical provider evidence.

### 5. ReplaceAndRetain requires a second edge for retained old resource

For ReplaceAndRetain, evidence of P2 creation plus provider policy semantics supports:

P1 -> P2
and
P1 -> RETAINED_OUTSIDE_STACK_SCOPE

The second edge must not be inferred merely from the plan. Execution and resource-event evidence are still required.

### 6. ReplaceAndSnapshot similarly needs independent snapshot evidence

The plan says a snapshot should be taken. To establish historical fact, evidence must show the executed operation and snapshot outcome.

Therefore:

ReplaceAndSnapshot plan
!=
snapshot created.

Snapshot evidence and P1 deletion evidence remain separate edges.

### 7. Resource Status Change is an execution-side confirmation layer

A matching Resource Status Change with exact stack/logical/physical identity and ClientRequestToken can corroborate StackEvents.

It does not replace the need for identity and coverage.

### 8. Missing physical identity leaves the incarnation edge unresolved

If StackEvents only expose the logical resource and status but no usable PhysicalResourceId, the plan can be bound to an operation without proving which physical instance was created or retained.

Result:

PLAN_EXECUTION_BOUND
but
INCARNATION_IDENTITY = UNKNOWN.

### 9. Rollback must override neither plan nor event history

If the planned replacement executes and then rolls back, the replacement remains a historical forward transition if P2 was actually created.

The rollback is a separate compensating branch.

Therefore:

planned replacement
-> executed P1 -> P2
-> rollback
does not become
-> replacement never happened.

## Evidence ladder

1. ChangeSet ARN + ResourceChange
   -> PLAN
2. Successful ExecuteChangeSet
   -> EXECUTION_STARTED
3. matching ClientRequestToken / OperationId
   -> OPERATION_BOUND
4. StackEvents / Resource Status Change
   -> EXECUTED_RESOURCE_TRANSITION
5. exact P1/P2 identities
   -> INCARNATION_TRANSITION
6. retained/snapshot/delete outcome evidence
   -> POLICY_OUTCOME
7. rollback events, if any
   -> COMPENSATING_BRANCH

Only stages 4–7 can turn the plan branch into historical execution/outcome evidence.

## Distilled rule

ResourceChange + policy -> BOUNDED_PLAN

+ ExecuteChangeSet -> BOUNDED_PLAN_EXECUTION_BINDING

+ operation identity + StackEvents -> BOUNDED_EXECUTED_OPERATION

+ exact P1/P2 identity -> BOUNDED_EXECUTED_INCARNATION_TRANSITION

+ Retain/Snapshot/Delete outcome evidence -> BOUNDED_POLICY_OUTCOME

+ rollback evidence -> BOUNDED_FORWARD_PLUS_COMPENSATION_GRAPH

Missing required identity or coverage -> UNKNOWN for that claim.

## Anti-collapse rules

- ResourceChange != StackEvent.
- ReplaceAndRetain != retained resource observed.
- ReplaceAndSnapshot != snapshot created.
- ReplaceAndDelete != deletion completed.
- ChangeSet ARN != operation ID.
- ExecuteChangeSet success != final resource state.
- ClientRequestToken != universal operation ID.
- LogicalResourceId != physical incarnation.
- PhysicalResourceId != ChangeSet identity.
- Plan replacement != historical replacement.
- Rollback != erasure of forward replacement.
- Resource Status Change != independent proof of external-world state.
- Missing PhysicalResourceId != no replacement.
- Event absence != non-execution without coverage.

## Status ledger

- ResourceChange as plan-only artifact: FOUND
- ReplaceAndRetain/ReplaceAndSnapshot plan semantics: FOUND
- ExecuteChangeSet execution boundary: FOUND
- ClientRequestToken operation grouping: FOUND
- StackEvent physical identity/status: FOUND
- Resource Status Change corroboration: FOUND
- Plan-to-execution binding: ESTABLISHED IN PRINCIPLE
- Plan-to-observed replacement binding: ESTABLISHED IN PRINCIPLE
- Plan-to-snapshot outcome without snapshot evidence: REJECTED
- Plan-to-deletion outcome without deletion evidence: REJECTED
- Universal ChangeSet-to-CloudTrail ID mapping: NOT ESTABLISHED
- Universal historical completeness: NOT ESTABLISHED
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

AB105.053R — investigate ChangeSet execution failure and partial execution: distinguish an execution attempt that fails before mutation, a partially applied replacement, and a replacement followed by rollback.