# AB105.063R — physical lifecycle edge: PhysicalResourceId, replacement, DELETE_FAILED, Retain, and missing identity

Date: 2026-09-30
Chain: AB105.062R -> AB105.063R

## Research question

Determine when StackEvents can establish a bounded physical-lifecycle transition, and when replacement, retention, deletion failure, or missing PhysicalResourceId force UNKNOWN.

## Primary evidence

AWS defines StackEvent PhysicalResourceId as the name or unique identifier associated with the physical instance, but the field is not required. StackEvent also exposes LogicalResourceId, OperationId, ResourceStatus, and ResourceStatusReason. Valid statuses include CREATE_COMPLETE, DELETE_COMPLETE, DELETE_FAILED, DELETE_SKIPPED, UPDATE_COMPLETE, UPDATE_FAILED, rollback states, and others. citeturn0search0

For replacement, AWS documents that CloudFormation recreates the resource with a new physical ID, normally creates the replacement first, then redirects dependencies and deletes the old resource. UpdateReplacePolicy can retain the old physical resource or create a snapshot, removing the retained resource from CloudFormation's scope. citeturn0search3turn0search10

AWS also documents that a failed deletion can produce DELETE_FAILED while the old physical resource still exists. In that case CloudFormation can remove the old resource from stack scope and continue the update; the physical resource may remain accessible only through the underlying service. citeturn0search6

DeletionPolicy Retain similarly means the physical resource can continue to exist after CloudFormation removes it from scope. A stack can reach DELETE_COMPLETE while retained resources still exist. citeturn0search1

## Findings

### 1. PhysicalResourceId is strong identity evidence, but optional

When a StackEvent contains:

StackId + OperationId + LogicalResourceId + PhysicalResourceId + ResourceStatus

the event can bind a resource observation to a specific physical identifier within that operation.

But PhysicalResourceId is not required.

Therefore:

missing PhysicalResourceId
-> identity edge not established

It must not be interpreted as "no physical resource."

### 2. New PhysicalResourceId can establish a bounded replacement edge

For a documented replacement operation, if the evidence contains:

old PhysicalResourceId = P_old
new PhysicalResourceId = P_new
same LogicalResourceId = L
same relevant OperationId = O
and provider semantics say replacement generates a new physical ID

then:

L@P_old -> L@P_new

is a bounded incarnation transition.

This is stronger than matching timestamps or names.

### 3. Same PhysicalResourceId does not prove universal continuity

A stable PhysicalResourceId supports identity continuity within the provider's documented semantics.

It does not prove that the physical object could never have been deleted and recreated with a reused identifier, unless the resource type's identity semantics explicitly exclude reuse.

Therefore:

same ID
-> BOUNDED identity continuity

not:

same ID
-> universal historical continuity.

### 4. DELETE_FAILED creates an explicit unresolved physical-state branch

AWS documents that DELETE_FAILED can coexist with the old physical resource still existing.

Therefore:

DELETE_FAILED
-> deletion attempt failed

but:

DELETE_FAILED
-> physical resource definitely exists forever

is false.

Likewise:

DELETE_FAILED
-> physical resource definitely gone

is false.

Final physical existence requires evidence from the underlying resource service or another durable state ledger.

### 5. DELETE_COMPLETE is stronger but scope-sensitive

DELETE_COMPLETE establishes CloudFormation's lifecycle result for the resource/operation.

It does not by itself establish that every retained or externally managed physical artifact is gone.

Retention policies explicitly separate CloudFormation scope from physical existence. citeturn0search1turn0search3

Therefore:

DELETE_COMPLETE + normal deletion semantics
-> bounded deletion outcome

DELETE_COMPLETE + Retain
-> CloudFormation association ended; physical existence may continue.

### 6. Retain is a scope transition, not necessarily physical deletion

The correct model is:

IN_CLOUDFORMATION_SCOPE
        |
        | Retain / UpdateReplacePolicy:Retain
        v
OUT_OF_CLOUDFORMATION_SCOPE
        |
        +--> physical resource may still exist

Therefore the architecture must not encode:

removed_from_scope == physically_deleted.

### 7. Replacement with retention creates two incarnations

With UpdateReplacePolicy:Retain:

P_old --replacement--> P_new

and:

P_old --retained--> OUTSIDE_CF_SCOPE

while P_new becomes the current CloudFormation-managed physical instance.

This means a single logical resource can legitimately have multiple physical incarnations whose lifetimes overlap.

A memory system that keys solely on LogicalResourceId will collapse these distinct instances.

### 8. Missing PhysicalResourceId is not a negative observation

For events such as an early CREATE_IN_PROGRESS or other provider event where PhysicalResourceId is absent:

UNKNOWN_PHYSICAL_ID

not:

NO_PHYSICAL_RESOURCE.

The same rule applies to missing IDs in rollback/error paths.

### 9. OperationId does not replace PhysicalResourceId

OperationId identifies the operation that generated the event.

It does not uniquely identify the physical instance.

Therefore:

OperationId != PhysicalResourceId

and:

OperationId + LogicalResourceId
still does not prove incarnation identity when PhysicalResourceId is absent.

### 10. Physical lifecycle claim contract

For a claim:

"Logical resource L transitioned from physical incarnation P_old to P_new during operation O"

minimum bounded evidence:

1. same StackId
2. same LogicalResourceId
3. relevant OperationId
4. P_old observed
5. P_new observed
6. replacement semantics applicable
7. event sequence/operation evidence consistent with replacement
8. no unresolved evidence that invalidates the transition

If any identity edge is missing:

CLAIM = UNKNOWN

For:

"old physical resource P_old no longer exists"

the CloudFormation ledger alone is insufficient when Retain, UpdateReplacePolicy:Retain, DELETE_FAILED, or external deletion is possible.

Required external physical-state evidence or an explicit provider guarantee.

## Physical-state matrix

| Evidence | CloudFormation conclusion | Physical existence conclusion |
|---|---|---|
| CREATE_COMPLETE + PhysicalResourceId | resource created in CF lifecycle | bounded positive evidence |
| UPDATE_COMPLETE + same PhysicalResourceId | update completed for same observed ID | bounded continuity |
| replacement + new PhysicalResourceId | new incarnation created/managed | bounded positive evidence |
| DELETE_COMPLETE + normal delete | CF deletion completed | bounded, subject to policy/scope |
| DELETE_FAILED | delete attempt failed | UNKNOWN physical final state |
| DELETE_SKIPPED | deletion skipped | UNKNOWN/retained path |
| Retain | CF scope removed/retained | physical resource may remain |
| UpdateReplacePolicy:Retain | old instance retained outside CF scope | physical old instance may remain |
| PhysicalResourceId missing | identity absent | UNKNOWN |
| same PhysicalResourceId across events | same observed provider ID | bounded continuity only |

## Distilled rule

**CloudFormation lifecycle state and physical existence are different state dimensions.**

PhysicalResourceId can establish a bounded incarnation edge when present and semantically applicable.

Retain and DELETE_FAILED explicitly prevent the shortcut:

CF scope ended -> physical object gone.

Missing PhysicalResourceId is UNKNOWN, never a negative identity claim.

## Anti-collapse rules

- LogicalResourceId != physical incarnation.
- OperationId != physical incarnation.
- PhysicalResourceId missing != resource absent.
- DELETE_FAILED != deleted.
- DELETE_COMPLETE != universal physical nonexistence.
- Retain != deletion.
- UpdateReplacePolicy:Retain != deletion.
- New PhysicalResourceId = replacement evidence only with applicable provider semantics.
- Same PhysicalResourceId != universal historical continuity.
- CloudFormation scope != underlying physical existence.
- Never infer physical deletion from stack disappearance alone.

## Status ledger

- PhysicalResourceId identity semantics: FOUND
- Replacement/new physical ID semantics: FOUND
- DELETE_FAILED physical-state ambiguity: FOUND
- Retain scope-vs-physical distinction: FOUND
- Missing PhysicalResourceId boundary: FOUND
- Bounded physical incarnation contract: ESTABLISHED
- Universal physical existence/deletion proof from CF alone: NOT ESTABLISHED
- External resource-state ledger: REQUIRED for stronger claims
- Reconstruction: BOUNDED / PER-CLAIM
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

AB55 remains only 64 states × 6 total orders = 384 per attack across 8 attacks; it did not establish full UsedAdmissionContext/EventDAG/FutureObs_PAA closure.

## Next exact direction

AB105.064R — determine whether the underlying AWS resource service can supply a durable physical-state edge after CloudFormation scope loss, and define the minimum cross-ledger identity required before such evidence can upgrade UNKNOWN to a bounded physical-existence/deletion claim.
