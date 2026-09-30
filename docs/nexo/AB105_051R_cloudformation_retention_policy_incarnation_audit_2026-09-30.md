# AB105.051R — CloudFormation retention-policy branches and post-association physical existence audit

Date: 2026-09-30
Chain: AB105.050R -> AB105.051R

## Research question

What can be claimed about physical existence after a replaced resource leaves CloudFormation scope under UpdateReplacePolicy, DeletionPolicy, RetainExceptOnCreate, or snapshot behavior?

## Primary evidence

AWS documents that UpdateReplacePolicy applies when a resource is replaced during a stack update. Replacement creates a new physical ID; the old physical resource can be Delete, Retain, or Snapshot. Retained resources continue to exist and are removed from CloudFormation scope. Snapshots also persist independently after creation. citeturn0search1

AWS documents that DeletionPolicy controls resources deleted by stack deletion or by removing a resource from the template, but does not control the old physical instance in an ordinary replacement during stack update. For replacement, UpdateReplacePolicy is the relevant policy. Retain leaves a resource existing outside CloudFormation scope. RetainExceptOnCreate has special rollback behavior for resources created by the initial stack operation. citeturn0search2

CloudFormation ResourceChange explicitly distinguishes ReplaceAndDelete, ReplaceAndRetain, and ReplaceAndSnapshot. These are change-plan semantics, not by themselves proof of execution. citeturn0search0

## Findings

### 1. Replacement retention is an explicit branch

For a replacement:

P1 -> P2

the policy determines the post-replacement treatment of P1:

ReplaceAndDelete -> deletion intended
ReplaceAndRetain -> P1 retained outside stack scope
ReplaceAndSnapshot -> snapshot created, then P1 deletion intended

Therefore policy semantics create distinct expected transition branches.

### 2. ReplaceAndRetain gives strong bounded evidence of continued physical existence

AWS explicitly states that retained resources continue to exist and that CloudFormation removes them from its scope.

Thus:

observed replacement + Retain semantics
-> BOUNDED_POST_ASSOCIATION_EXISTENCE(P1)

This is stronger than inferring existence from absence of DELETE_COMPLETE.

But the claim is still bounded by the provider's documented semantics and evidence that the policy actually applied to the executed operation.

### 3. ReplaceAndDelete is not proof that deletion completed

ResourceChange describes what CloudFormation plans to do. It does not prove execution.

Even with a Delete policy, the execution ledger must establish the actual deletion outcome. DELETE_FAILED remains a possible boundary.

Therefore:

ReplaceAndDelete
!=
P1_DELETED

without execution evidence.

### 4. ReplaceAndSnapshot creates two distinct artifacts

Snapshot behavior creates a durable snapshot while the old physical resource is subsequently subject to deletion.

The snapshot is not the same identity as P1.

Therefore:

P1 -> snapshot S
and
P1 -> deletion attempt

must remain separate evidence edges.

Snapshot existence does not prove P1 deletion, and P1 existence does not prove snapshot creation.

### 5. DeletionPolicy must not be incorrectly applied to replacement

AWS explicitly states that DeletionPolicy does not apply to the old physical instance when the resource is replaced during a stack update. UpdateReplacePolicy controls that case.

This prevents a major identity/policy collapse:

DeletionPolicy(Retain)
!=
UpdateReplacePolicy(Retain)

for replacement semantics.

### 6. RetainExceptOnCreate introduces a creation/rollback-specific exception

RetainExceptOnCreate behaves like Retain for later stack operations, but if the initial resource-creating stack operation rolls back, CloudFormation deletes the newly created resource.

Therefore the same nominal retention concept cannot be treated as a universal post-operation persistence rule.

The operation phase and creation provenance are required.

### 7. ChangeSet replacement fields are PLAN evidence

ResourceChange values ReplaceAndRetain / ReplaceAndSnapshot establish intended plan semantics.

They do not establish that ExecuteChangeSet happened, that P2 was created, that P1 was retained, or that S was successfully produced.

Execution and outcome evidence remain separate.

## Policy-to-incarnation graph

PLAN:
ChangeSet
 -> ResourceChange
 -> Replacement + ReplaceAndDelete/Retain/Snapshot

EXECUTION:
ExecuteChangeSet
 -> operation identity
 -> P2 creation/transition
 -> P1 treatment

OUTCOME BRANCHES:

ReplaceAndDelete
 -> P1 DELETE_COMPLETE
or
 -> P1 DELETE_FAILED

ReplaceAndRetain
 -> P1 retained
 -> P1 removed from CloudFormation scope

ReplaceAndSnapshot
 -> snapshot S created
 -> P1 deletion attempted
 -> DELETE_COMPLETE or DELETE_FAILED

RetainExceptOnCreate:
initial create + rollback
 -> newly created resource can be deleted

later operation
 -> Retain semantics

## Distilled rule

policy semantics + executed replacement + exact identity
-> BOUNDED_POLICY_APPLIED_TO_INCARNATION

ReplaceAndRetain + executed replacement
-> BOUNDED_POST_ASSOCIATION_PHYSICAL_EXISTENCE

ReplaceAndDelete + DELETE_COMPLETE
-> BOUNDED_DELETION_OBSERVED

ReplaceAndDelete without deletion outcome
-> DELETION_OUTCOME_UNKNOWN

ReplaceAndSnapshot + snapshot evidence
-> BOUNDED_SNAPSHOT_ARTIFACT

Snapshot evidence
!=
P1 deletion evidence

DeletionPolicy
!=
UpdateReplacePolicy for replacement

## Anti-collapse rules

- ResourceChange != executed operation.
- ReplaceAndDelete != deletion completed.
- ReplaceAndRetain != current CloudFormation association.
- Retained != deleted.
- Removed from CloudFormation scope != physically destroyed.
- ReplaceAndSnapshot != P1 deleted.
- Snapshot identity != physical resource identity.
- Snapshot existence != deletion proof.
- DeletionPolicy != UpdateReplacePolicy for replacement.
- RetainExceptOnCreate != universal Retain.
- Plan policy != observed outcome.
- Absence of DELETE_COMPLETE != proof of existence.
- Presence of UPDATE_COMPLETE != proof of physical deletion.
- Same LogicalResourceId != same physical incarnation.

## Status ledger

- UpdateReplacePolicy replacement semantics: FOUND
- ReplaceAndDelete/Retain/Snapshot plan values: FOUND
- Retained physical resource outside CloudFormation scope: FOUND
- Snapshot persistence semantics: FOUND
- DeletionPolicy replacement boundary: FOUND
- RetainExceptOnCreate rollback exception: FOUND
- Policy branch model: ESTABLISHED IN PRINCIPLE
- Retained post-association existence: ESTABLISHED IN PRINCIPLE when executed and policy-bound
- Planned replacement policy -> actual outcome: NOT AUTOMATICALLY ESTABLISHED
- Universal post-association existence beyond provider evidence: NOT ESTABLISHED
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

AB105.052R — investigate the bridge from ChangeSet ResourceChange plan semantics to executed StackEvents for ReplaceAndRetain/ReplaceAndSnapshot, testing whether plan branches can be bound to actual P1/P2/snapshot outcomes without silently treating planned replacement as historical fact.