# AB105.049R — CloudFormation replacement, PhysicalResourceId and rollback incarnation boundary audit

Date: 2026-09-30
Chain: AB105.048R -> AB105.049R

## Research question

When an update requires replacement, what evidence establishes an old/new resource incarnation boundary, and what changes when rollback or cleanup follows?

## Primary evidence

AWS documents that a replacement recreates a resource and generates a new physical ID. The usual replacement sequence is create the new resource, repoint dependent resources, then delete the old resource. Some resource types can use the opposite order when their provider contract requires it.

CloudFormation StackEvents expose PhysicalResourceId, ResourceStatus, ResourceStatusReason, ResourceType and OperationId.

AWS documents that replacement may leave the old resource undeleted if deletion fails. In that case CloudFormation can remove the old resource from the stack while the old physical resource still exists; a DELETE_FAILED event records the failed deletion.

For custom resources, AWS explicitly states that a changed PhysicalResourceId between old and new responses is interpreted as replacement and causes a delete request for the old resource.

## Findings

### 1. Replacement is a positive incarnation-boundary signal when old/new identities are observed

If the same logical resource moves from old PhysicalResourceId P1 to new PhysicalResourceId P2 under documented replacement semantics, the evidence supports:

INCARNATION_1 -> INCARNATION_2

This is stronger than timestamp inference or equality of a reusable logical name.

The claim remains provider/resource-specific because PhysicalResourceId semantics are defined by the relevant resource provider.

### 2. Replacement ordering matters

The normal create-then-delete behavior means there can be an interval where both old and new physical resources exist.

Therefore:

P1 exists before replacement
P2 created
dependencies move to P2
P1 deletion attempted

This is not equivalent to an instantaneous substitution.

For resource types using delete-then-create, the gap has different semantics.

### 3. UPDATE_COMPLETE can coexist with old-resource existence

AWS documents that if CloudFormation cannot delete the old resource, it can remove that resource from the stack and still complete the stack update, while emitting DELETE_FAILED for the specific resource.

Therefore:

stack UPDATE_COMPLETE
!=
old physical resource definitely deleted.

This is a hard historical/state boundary.

### 4. Cleanup events are part of the incarnation graph

UPDATE_COMPLETE_CLEANUP_IN_PROGRESS represents ongoing removal of old resources after a successful replacement update.

UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS represents ongoing removal of new resources created during a failed update.

Therefore final stack status and physical cleanup are separate evidence nodes.

### 5. Rollback can reverse which incarnation is authoritative without erasing the created incarnation

If P2 was created during a forward replacement and rollback returns the logical resource to P1, the evidence graph should retain:

P1 existing/previous incarnation
 -> P2 created during forward operation
 -> rollback transition
 -> P1 restored/retained as stack-associated incarnation

The existence of P2 must not be deleted from history merely because rollback removed it.

Conversely, if P1 deletion failed, P1 may continue existing outside the current stack association.

### 6. PhysicalResourceId equality remains insufficient for universal continuity

A single physical ID observed at two times is not, by itself, a universal proof that the same underlying instance continuously existed between those observations.

The stronger boundary is a provider-documented replacement transition with explicit old/new identities and event coverage.

### 7. Custom resources provide an explicit provider contract example

For custom resources, AWS explicitly defines changed PhysicalResourceId as the replacement trigger.

This is a concrete example of why resource identity semantics must be sourced from the resource provider rather than generalized across all CloudFormation resources.

## Incarnation graph

LOGICAL_RESOURCE
 -> P1 / INCARNATION_1
 -> replacement requested
 -> P2 / INCARNATION_2 created
 -> dependency/reference transition
 -> P1 delete attempt

Then branches:

P1 DELETE_COMPLETE
or
P1 DELETE_FAILED / physical resource remains

For rollback:

P2 cleanup/delete
and/or
P1 restoration/continued association

Every observed incarnation transition remains historical evidence even when the operation later rolls back.

## Distilled rule

documented replacement semantics
+ exact old/new PhysicalResourceId
+ StackEvent/operation identity
+ adequate coverage
-> BOUNDED_INCARNATION_TRANSITION

replacement transition
+ rollback events
-> BOUNDED_FORWARD_AND_COMPENSATION_INCARNATION_GRAPH

DELETE_FAILED
-> old incarnation existence may persist outside current stack association

UPDATE_COMPLETE
-> does not prove old incarnation deletion

missing old/new identity or incomplete event coverage
-> UNKNOWN incarnation continuity.

## Anti-collapse rules

- LogicalResourceId != PhysicalResourceId.
- PhysicalResourceId != universal non-reuse theorem.
- Replacement prediction != observed replacement.
- New physical ID != proof old resource was deleted.
- UPDATE_COMPLETE != old-resource deletion proof.
- DELETE_FAILED != deletion success.
- Cleanup status != historical deletion completion.
- Rollback != erasure of forward-created incarnation.
- P2 cleanup != proof P2 never existed.
- Same PhysicalResourceId across observations != uninterrupted existence without provider guarantee.
- Stack association != physical existence.
- Timestamp proximity != incarnation proof.

## Status ledger

- Replacement creates new physical ID: FOUND
- Normal create-then-delete ordering: FOUND
- Alternate replacement ordering possible by resource contract: FOUND
- StackEvent PhysicalResourceId and OperationId: FOUND
- Old-resource DELETE_FAILED boundary: FOUND
- Cleanup-phase boundary: FOUND
- CustomResource explicit PhysicalResourceId replacement semantics: FOUND
- Positive incarnation transition: ESTABLISHED IN PRINCIPLE
- Rollback incarnation graph: ESTABLISHED IN PRINCIPLE
- Universal PhysicalResourceId continuity theorem: REJECTED
- UPDATE_COMPLETE as deletion proof: REJECTED
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

AB105.050R — investigate whether CloudFormation StackEvents expose enough old/new resource identity during replacement and rollback to reconstruct a complete incarnation edge, including the cases where PhysicalResourceId is missing, retained, or deletion fails.