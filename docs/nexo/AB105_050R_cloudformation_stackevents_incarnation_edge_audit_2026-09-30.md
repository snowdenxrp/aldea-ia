# AB105.050R — CloudFormation StackEvents incarnation-edge reconstruction under missing/retained/deletion-failed identity

Date: 2026-09-30
Chain: AB105.049R -> AB105.050R

## Research question

Can StackEvents and stack-resource APIs reconstruct a complete old/new incarnation edge when PhysicalResourceId is absent, retained, or deletion fails?

## Primary evidence

AWS StackEvent exposes EventId, LogicalResourceId, PhysicalResourceId, ResourceType, Timestamp, ResourceStatus and OperationId. PhysicalResourceId is optional, so some events do not provide the physical identity. Resource statuses include DELETE_FAILED and DELETE_SKIPPED. AWS documents these fields and statuses. citeturn0search3turn0search9

AWS documents that replacement normally generates a new physical ID and normally creates the replacement before deleting the old resource. citeturn0search8

AWS documents that if CloudFormation cannot delete the old resource, it can remove the old resource from stack scope and continue the update; the old physical resource remains and a DELETE_FAILED event is emitted. citeturn0search13

AWS also documents UpdateReplacePolicy Retain: the old physical resource remains after replacement and is removed from CloudFormation's scope. citeturn0search11

DescribeStackResources can retrieve resource descriptions for running and deleted stacks; deleted-stack resource information is available for up to 90 days. PhysicalResourceId is described as the name or unique identifier corresponding to a physical instance. citeturn0search0

## Findings

### 1. A complete incarnation edge requires both sides when possible

Strong case:

LogicalResourceId L
+ old PhysicalResourceId P1
+ replacement operation identity
+ new PhysicalResourceId P2
+ compatible StackEvents
-> BOUNDED_INCARNATION_EDGE(P1 -> P2)

The operation identity can be OperationId or a bounded CloudFormation operation group using ClientRequestToken.

### 2. Missing PhysicalResourceId is an explicit UNKNOWN boundary

Because StackEvent.PhysicalResourceId is optional, an event without it cannot independently identify the physical incarnation.

Therefore:

LogicalResourceId + event + status
!=
physical incarnation identity.

A missing PhysicalResourceId may be bridged only if another provider-native record supplies the same physical identity with adequate semantic and temporal binding. Otherwise the incarnation edge remains UNKNOWN.

### 3. DELETE_FAILED is positive evidence that deletion was attempted and failed

A DELETE_FAILED event tied to the old PhysicalResourceId is stronger than absence of a DELETE_COMPLETE event.

It supports:

P1 deletion_attempted
-> deletion_failed
-> P1 may still exist

It does not prove the exact external resource state indefinitely; continued existence must remain bounded to the provider evidence and coverage available.

### 4. UPDATE_COMPLETE does not close the old-incarnation boundary

AWS explicitly documents the case where an old resource remains after the stack update completes. The stack can issue UPDATE_COMPLETE while also emitting DELETE_FAILED.

Therefore:

UPDATE_COMPLETE + no visible DELETE_COMPLETE
!=
P1 definitely absent.

A complete reconstruction must retain the negative/failed deletion branch.

### 5. Retain policy creates a deliberate post-replacement split

With UpdateReplacePolicy=Retain:

P1 -> replaced by P2 in stack association
P1 remains physically existing outside CloudFormation scope.

Therefore the history must distinguish:

STACK_ASSOCIATION
from
PHYSICAL_EXISTENCE.

The old incarnation is not equivalent to a deleted incarnation merely because it is no longer associated with the stack.

### 6. DELETE_SKIPPED creates another non-deletion boundary

AWS StackEvent status includes DELETE_SKIPPED, including the documented case for resources with a Retain deletion policy.

Thus DELETE_SKIPPED must not be normalized to DELETE_COMPLETE.

### 7. Current resource APIs are not unlimited historical ledgers

DescribeStackResources exposes current/retained stack resource descriptions and, for deleted stacks, up to 90 days of information. It therefore cannot universally reconstruct an arbitrarily old incarnation chain.

Historical StackEvents plus resource APIs can strengthen reconstruction, but retention/coverage remains a separate dependency.

### 8. Replacement plan evidence and observed identity remain separate

ResourceChange can say a modification is a replacement and distinguish ReplaceAndDelete, ReplaceAndRetain and ReplaceAndSnapshot. That is plan semantics, not by itself proof that P1/P2 were actually created/deleted/retained. citeturn0search12

## Incarnation evidence ladder

1. Replacement planned
2. Operation identity bound
3. P1 observed
4. P2 observed
5. P2 creation/transition observed
6. P1 delete attempt observed
7. P1 DELETE_COMPLETE / DELETE_FAILED / DELETE_SKIPPED observed
8. Retention policy semantics bound
9. Adequate event/resource coverage

Only when the required dependencies are present:

P1 -> P2 = BOUNDED_INCARNATION_TRANSITION

If P1/P2 identity is missing:

INCARNATION_EDGE = UNKNOWN

If P1 deletion failed or was retained:

INCARNATION_EDGE = TRANSITION + POST_STACK_ASSOCIATION_PHYSICAL_EXISTENCE_POSSIBLE

## Distilled rule

replacement semantics + operation identity + P1 + P2 + compatible events -> BOUNDED_INCARNATION_EDGE

missing physical identity -> UNKNOWN unless independently bridged

DELETE_FAILED -> deletion failure evidenced; old physical resource may persist

DELETE_SKIPPED/Retain -> physical existence can continue outside stack scope

UPDATE_COMPLETE -> stack operation outcome, not old-resource deletion proof

resource API retention boundary -> historical reconstruction bounded

## Anti-collapse rules

- LogicalResourceId != PhysicalResourceId.
- EventId != incarnation ID.
- OperationId != incarnation ID.
- Missing PhysicalResourceId != no physical resource.
- DELETE_FAILED != DELETE_COMPLETE.
- DELETE_SKIPPED != DELETE_COMPLETE.
- UPDATE_COMPLETE != old-resource deletion.
- Retained resource != deleted resource.
- Removed from stack scope != physically destroyed.
- Replacement planned != replacement observed.
- Current resource description != complete historical ledger.
- 90-day deleted-stack visibility != universal historical retention.
- P1/P2 equality != uninterrupted continuity without provider semantics.

## Status ledger

- Optional PhysicalResourceId: FOUND
- OperationId and event identity: FOUND
- DELETE_FAILED semantics: FOUND
- DELETE_SKIPPED semantics: FOUND
- UpdateReplacePolicy Retain semantics: FOUND
- Current resource-history retention boundary: FOUND
- Strong P1->P2 edge when both identities observed: ESTABLISHED IN PRINCIPLE
- Missing-identity reconstruction: UNKNOWN unless independently bridged
- Retained/deletion-failed branch: ESTABLISHED IN PRINCIPLE
- Universal historical incarnation reconstruction: NOT ESTABLISHED
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

AB105.051R — investigate CloudFormation UpdateReplacePolicy/DeletionPolicy plus ChangeSet ReplaceAndRetain/ReplaceAndSnapshot as explicit retention branches, and determine exactly what can and cannot be claimed about physical existence after stack association ends.