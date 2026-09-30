# AB105.048R — CloudFormation rollback as competing transition graph audit

Date: 2026-09-30
Chain: AB105.047R -> AB105.048R

## Research question

Can a failed CloudFormation update and its rollback be reconstructed as one linear operation history, or must forward execution, compensation, skipped resources, and final state remain separate transition branches?

## Primary evidence

AWS documents UPDATE_ROLLBACK_IN_PROGRESS as return toward the previous working state after a failed update. UPDATE_ROLLBACK_COMPLETE means successful return to a previous working state; UPDATE_ROLLBACK_FAILED means the return was unsuccessful. During rollback, CloudFormation can delete newly created resources and restore previous resources.

ContinueUpdateRollback can resume a failed rollback. ResourcesToSkip can be supplied only for resources in UPDATE_FAILED caused by the rollback failure. AWS warns that skipped resources can be marked UPDATE_COMPLETE while remaining inconsistent with the stack template after rollback.

AWS also documents that UPDATE_COMPLETE_CLEANUP_IN_PROGRESS and UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS can continue deleting old/new resources after the main operation status has changed.

## Findings

### 1. Rollback is a distinct transition graph, not merely an error flag

A forward update can produce:

FORWARD_OPERATION
 -> resource transitions
 -> failure
 -> ROLLBACK_IN_PROGRESS
 -> rollback resource transitions
 -> terminal rollback state

The rollback transitions are evidence of compensating activity. They must not be erased or merged into the forward path.

### 2. UPDATE_ROLLBACK_COMPLETE does not mean the forward plan succeeded

AWS defines it as successful return to the previous working state after a failed update.

Therefore:

UPDATE_ROLLBACK_COMPLETE
!=
FORWARD_UPDATE_SUCCESS

It supports a bounded rollback outcome, not successful deployment of the intended ChangeSet.

### 3. UPDATE_ROLLBACK_FAILED creates an explicit unresolved state

When rollback cannot restore all changes, CloudFormation enters UPDATE_ROLLBACK_FAILED. ContinueUpdateRollback can resume the rollback after the underlying problem is fixed.

Therefore an audit must preserve the interval in which the stack was neither successfully updated nor successfully restored.

### 4. ResourcesToSkip creates a deliberate divergence boundary

AWS allows selected resources to be skipped during ContinueUpdateRollback and warns that those resources can become inconsistent with the stack template.

This is a critical reconstruction boundary:

SKIPPED_RESOURCE
-> rollback graph intentionally incomplete for that resource
-> final stack status cannot be interpreted as proof that the skipped resource matches template state.

The later UPDATE_COMPLETE status assigned to a skipped resource must not be collapsed into proof of successful restoration.

### 5. Cleanup states extend the transition graph

AWS documents UPDATE_COMPLETE_CLEANUP_IN_PROGRESS after successful update when old resources still need deletion, and UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS after rollback when newly created resources still need deletion.

Therefore a terminal-looking status transition can still be followed by cleanup activity.

The state graph must retain cleanup as a distinct phase.

### 6. External changes can invalidate rollback assumptions

AWS documents rollback failures where resources were modified or deleted outside CloudFormation.

Therefore the rollback graph may contain an external-state divergence that CloudFormation cannot itself fully explain.

This directly prevents the inference:

rollback failure -> no resource transition occurred.

Instead, failure can coexist with partial forward and rollback transitions.

### 7. Drift evidence after skipped rollback has an explicit UNKNOWN boundary

AWS documents that resources included in ResourcesToSkip receive drift status NOT_CHECKED.

Therefore a later drift result with NOT_CHECKED must not be interpreted as IN_SYNC or as proof of absence of drift.

This creates a direct evidence boundary between rollback reconstruction and later drift observation.

## Correct transition model

PLAN
 -> EXECUTION
 -> FORWARD_RESOURCE_TRANSITIONS
 -> FAILURE

then branch:

ROLLBACK
 -> COMPENSATING_RESOURCE_TRANSITIONS
 -> CLEANUP
 -> UPDATE_ROLLBACK_COMPLETE

or:

ROLLBACK
 -> FAILED_RESOURCE
 -> UPDATE_ROLLBACK_FAILED
 -> CONTINUE_UPDATE_ROLLBACK
 -> optional ResourcesToSkip
 -> further rollback
 -> terminal state

The branches must remain explicit.

## Distilled rule

forward operation + failure evidence -> BOUNDED_FORWARD_FAILURE

+ rollback StackEvents -> BOUNDED_COMPENSATING_TRANSITION_GRAPH

+ terminal rollback status -> BOUNDED_ROLLBACK_OUTCOME

+ ResourcesToSkip -> EXPLICIT_INCONSISTENCY_BOUNDARY

+ cleanup events -> EXTENDED_OPERATION_GRAPH

+ later drift result -> separate observation layer

No single terminal stack status is sufficient to reconstruct every resource's final external state.

## Anti-collapse rules

- UPDATE_ROLLBACK_COMPLETE != forward update success.
- UPDATE_ROLLBACK_FAILED != no resource mutation.
- Rollback != undo proof for every resource.
- ResourcesToSkip UPDATE_COMPLETE != template-consistent state.
- Cleanup status != completed resource history.
- Stack terminal status != complete resource-level outcome.
- Rollback event != original forward event.
- Compensation != erasure of prior transition.
- External mutation != CloudFormation operation.
- NOT_CHECKED != IN_SYNC.
- Missing rollback event != no rollback without coverage.
- Event arrival order != causal order.

## Status ledger

- Rollback as separate status graph: FOUND
- UPDATE_ROLLBACK_COMPLETE semantics: FOUND
- UPDATE_ROLLBACK_FAILED semantics: FOUND
- ContinueUpdateRollback: FOUND
- ResourcesToSkip inconsistency boundary: FOUND
- Cleanup phases: FOUND
- External-change rollback failure: FOUND
- Rollback as competing transition graph: ESTABLISHED IN PRINCIPLE
- Single linear history without branch markers: REJECTED
- Terminal status as universal resource-state proof: REJECTED
- Drift closure after skipped rollback: NOT ESTABLISHED
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

AB105.049R — investigate CloudFormation replacement semantics during forward update and rollback: old/new PhysicalResourceId, cleanup timing, and whether replacement creates a provable incarnation boundary before or after rollback.