# AB105.053R — CloudFormation partial execution, failure-before-mutation, and rollback reconstruction audit

Date: 2026-09-30
Chain: AB105.052R -> AB105.053R

## Research question

Can CloudFormation evidence distinguish a ChangeSet execution that fails before mutation, an operation with partial resource progress, and a replacement that executed before rollback?

## Primary evidence

AWS states that stack events expose the major steps of stack updates and show resource update failures and rollback transitions. A failed resource update produces UPDATE_FAILED; CloudFormation then rolls back resources it updated during the operation. citeturn0search0turn0search1

AWS documents that an update can reach UPDATE_COMPLETE_CLEANUP_IN_PROGRESS while old resources are still being removed, and UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS while newly created resources are still being removed after rollback. citeturn0search0turn0search7

AWS documents that when rollback itself cannot restore all changes, the stack can enter UPDATE_ROLLBACK_FAILED; ContinueUpdateRollback can resume the rollback. Resources skipped during this process are marked UPDATE_COMPLETE but can remain inconsistent with the template. citeturn0search2turn0search3

AWS also documents an explicit preservation mode in which successfully provisioned resources can remain after an operation failure rather than being automatically rolled back. During update/change-set operations, successful resources are preserved while failed resources roll back. citeturn0search4

CloudFormation ClientRequestToken groups StackEvents belonging to the same stack operation. citeturn0search9

## Findings

### 1. Failure before mutation cannot be inferred from a failed stack operation alone

A stack-level failure or failed ChangeSet execution does not by itself prove that no resource mutation occurred.

The correct negative claim requires absence of resource transition evidence plus adequate event coverage and operation semantics.

Therefore:

STACK_OPERATION_FAILED
!=
NO_RESOURCE_MUTATION

### 2. Resource events provide the mutation boundary

If a resource has UPDATE_IN_PROGRESS / CREATE_IN_PROGRESS / DELETE_IN_PROGRESS followed by corresponding completion/failure events, the operation crossed a resource-level execution boundary.

This is stronger than a stack-level failure alone.

### 3. Partial execution is explicitly possible

CloudFormation can progress along independent resource paths and stop at failures; successful resources can have completed changes while another path fails. AWS's preserve-successfully-provisioned option explicitly preserves successfully provisioned resources during failed update/change-set operations. citeturn0search4

Thus a failed operation can contain a real partial execution graph.

### 4. Replacement can execute and then be rolled back

If P2 receives creation/transition events before UPDATE_ROLLBACK_IN_PROGRESS, P2's creation is historical evidence even if rollback later removes P2.

The rollback is a compensating branch:

P1
-> P2 created/updated
-> forward failure
-> rollback
-> P2 cleanup/deletion

The final stack state must not erase the intermediate P2 incarnation.

### 5. Cleanup states are distinct evidence boundaries

UPDATE_COMPLETE_CLEANUP_IN_PROGRESS means the stack update is considered complete while old-resource cleanup remains in progress.

UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS means rollback reached the previous working state while cleanup of newly created resources remains in progress.

Therefore terminal stack status does not necessarily close physical-resource cleanup.

### 6. UPDATE_ROLLBACK_FAILED creates an unresolved graph

UPDATE_ROLLBACK_FAILED means CloudFormation could not restore all changes.

ContinueUpdateRollback can later resume the rollback, so the historical graph is:

forward operation
-> failure
-> rollback attempt
-> rollback failure
-> optional continued rollback
-> eventual outcome

The graph must not be compressed into simply FAILED or ROLLED_BACK.

### 7. ResourcesToSkip creates an explicit inconsistency branch

AWS warns that skipped resources are set to UPDATE_COMPLETE even though their state can remain inconsistent with the template.

Therefore:

UPDATE_COMPLETE after skip
!=
resource restored to intended prior state.

### 8. Preservation mode weakens any assumption that failure implies cleanup

With preservation enabled, successfully provisioned resources can remain after failure.

Therefore:

operation failure
!=
automatic cleanup of all successful mutations.

### 9. Evidence classification

For a given resource and operation:

A. NO_MUTATION_ESTABLISHED
requires:
- operation identity
- complete relevant event coverage
- no resource execution transition
- provider semantics sufficient to make the negative claim.

B. PARTIAL_EXECUTION_ESTABLISHED
requires:
- operation identity
- at least one concrete resource transition
- another resource/path failure or operation-level failure
- adequate coverage for the claim.

C. FORWARD_THEN_ROLLBACK_ESTABLISHED
requires:
- concrete forward mutation evidence
- rollback transition evidence
- compatible operation/resource identity.

D. ROLLBACK_OUTCOME_UNKNOWN
when cleanup or final state lacks sufficient evidence.

## Distilled rule

stack failure alone -> outcome UNKNOWN

resource transition evidence -> mutation evidenced

mutation + later rollback events -> FORWARD_THEN_ROLLBACK

cleanup-in-progress -> terminal logical state not equal physical cleanup complete

UPDATE_ROLLBACK_FAILED -> unresolved compensating graph

ResourcesToSkip -> explicit inconsistency boundary

preserve-successfully-provisioned -> successful mutations may persist after operation failure

## Anti-collapse rules

- Stack failure != no mutation.
- ChangeSet failure != no execution.
- UPDATE_FAILED != zero prior successful transitions.
- UPDATE_ROLLBACK_COMPLETE != erasure of forward events.
- UPDATE_COMPLETE_CLEANUP_IN_PROGRESS != old-resource deletion complete.
- UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS != new-resource deletion complete.
- UPDATE_ROLLBACK_FAILED != rollback never attempted.
- ResourcesToSkip + UPDATE_COMPLETE != consistency restored.
- Operation failure != automatic cleanup.
- Stack status != complete physical-resource history.
- Absence of a visible resource event != proof of no mutation without coverage.
- Final stack state != complete causal history.

## Status ledger

- Stack/resource failure distinction: FOUND
- Partial execution: ESTABLISHED IN PRINCIPLE
- Forward mutation followed by rollback: ESTABLISHED IN PRINCIPLE
- Cleanup-in-progress boundaries: FOUND
- UPDATE_ROLLBACK_FAILED as unresolved state: FOUND
- ResourcesToSkip inconsistency: FOUND
- Preserve-successfully-provisioned branch: FOUND
- No-mutation negative inference: CONDITIONAL / COVERAGE-DEPENDENT
- Universal execution completeness: NOT ESTABLISHED
- Universal event retention/completeness: NOT ESTABLISHED
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

AB105.054R — investigate CloudFormation operation event ordering and parallel resource paths: determine what ordering guarantees exist inside StackEvents and what cannot be inferred when independent resource branches interleave.