# AB105.044R — CloudFormation ClientRequestToken cross-ledger correlation audit

Date: 2026-09-30
Chain: AB105.043R -> AB105.044R

## Research question

Can ClientRequestToken be joined across Resource Status Change, StackEvents, and the initiating CloudFormation stack operation, and what residual gap remains against CloudTrail requestID/eventID?

## Primary evidence

AWS documents that all StackEvents triggered by a given stack operation are assigned the same ClientRequestToken, which can be used to track operations. StackEvent also exposes OperationId when present, separately from ClientRequestToken.

The CloudFormation Resource Status Change event contains StackId, LogicalResourceId, PhysicalResourceId, ResourceType, status details, and ClientRequestToken.

CloudFormation's drift-status event also contains StackId, StackDriftDetectionId, detection status, drifted-resource count, and ClientRequestToken.

## Findings

### 1. ClientRequestToken is a valid CloudFormation-side grouping key

For events that belong to the same CloudFormation stack operation, AWS explicitly documents shared ClientRequestToken semantics.

Therefore:

matching ClientRequestToken + same StackId + compatible resource/event semantics
-> BOUNDED_CLOUDFORMATION_OPERATION_GROUP

This is materially stronger than timestamp-only correlation.

### 2. StackEvent adds OperationId, but the two identifiers remain distinct

StackEvent exposes OperationId as the unique identifier of the operation that generated that event, when present.

Therefore the evidence graph can preserve:

ClientRequestToken = operation-grouping key
OperationId = provider operation identity when present
EventId = individual StackEvent identity

No equality between these identifiers should be inferred unless AWS explicitly documents it.

### 3. Resource Status Change can be bound to the operation group

A Resource Status Change event carries ClientRequestToken and exact resource identity fields.

When the token matches StackEvents from a known operation, the resource event can be placed inside that provider-side operation group.

This yields:

STACK OPERATION
 -> ClientRequestToken
 -> StackEvents
 -> Resource Status Change
 -> exact logical/physical resource identity

The resulting claim is provider-bounded operation/resource correlation, not universal external causality.

### 4. Drift Detection Status Change has the same token field but must remain semantically separate

The Drift Detection Status Change event also exposes ClientRequestToken and StackDriftDetectionId.

The token therefore permits a CloudFormation-side correlation if the same token is documented and actually matches.

But the drift detection itself is an observation operation. A shared token must not be used to assert that the drift detection operation caused the resource state being measured.

The correct model remains:

RESOURCE-CHANGING OPERATION
 -> resource transition
 -> later DRIFT DETECTION
 -> StackDriftDetectionId
 -> drift result

A token shared by events inside one operation group does not erase this semantic separation.

### 5. The residual CloudTrail gap is identifier translation

The CloudFormation-side graph has:

ClientRequestToken
OperationId
EventId
StackDriftDetectionId

CloudTrail has:

eventID
requestID

AWS documentation establishes the semantics of these fields independently, but the evidence reviewed here does not establish a universal equality or deterministic translation theorem between them.

Therefore the safe result is:

CloudFormation provider-side operation correlation = ESTABLISHED IN PRINCIPLE
CloudFormation identifier -> CloudTrail identifier equality = NOT ESTABLISHED

A concrete dataset could still produce a bounded cross-ledger join if the records contain compatible request/operation metadata and exact target/time semantics. That would be claim-specific evidence, not a universal theorem.

### 6. Drift cause remains a separate problem

Even a complete CloudFormation operation group does not automatically prove that the grouped operation caused the later drift.

To attribute drift to an operation, the reconstruction still needs:
- exact resource identity/incarnation;
- operation semantics;
- state transition evidence;
- temporal compatibility;
- coverage against competing operations/mutations;
- independent drift observation identity.

Without these, the cause remains UNKNOWN.

## Cross-ledger evidence model

CLOUDFORMATION OPERATION
 -> ClientRequestToken
 -> OperationId (when present)
 -> StackEvents / Resource Status Change
 -> resource identity/state

DRIFT DETECTION
 -> ClientRequestToken
 -> StackDriftDetectionId
 -> Drift Status Change
 -> observed drift state

CLOUDTRAIL
 -> eventID
 -> requestID
 -> API event

The three ledgers must remain distinct until a claim-specific binding is demonstrated.

## Anti-collapse rules

- ClientRequestToken != OperationId.
- ClientRequestToken != StackEvent EventId.
- ClientRequestToken != CloudTrail eventID.
- ClientRequestToken != CloudTrail requestID unless explicitly proven.
- OperationId != CloudTrail requestID unless explicitly proven.
- StackDriftDetectionId != OperationId.
- StackDriftDetectionId != resource-change identity.
- Shared token != universal causal proof.
- Resource Status Change != API request identity.
- StackEvent != complete external-world history.
- Drift Status Change != resource-changing event.
- Timestamp proximity != identifier binding.
- CloudTrail no-hit != operation absence without coverage.

## New distilled rule

matching ClientRequestToken + exact StackId + compatible CloudFormation event semantics -> BOUNDED_OPERATION_GROUP

+ OperationId when present -> STRONGER_PROVIDER_OPERATION_IDENTITY

+ exact resource identity/state transition -> BOUNDED_OPERATION_RESOURCE_BINDING

+ independent DriftDetectionId/result + coverage against competing changes -> BOUNDED_DRIFT_CAUSAL_RECONSTRUCTION

CloudFormation-to-CloudTrail identifier equality remains UNKNOWN unless concretely evidenced.

## Status ledger

- Shared ClientRequestToken across StackEvents of one operation: FOUND
- OperationId field: FOUND
- Resource Status Change ClientRequestToken: FOUND
- Drift Status Change ClientRequestToken: FOUND
- Provider-side operation grouping: ESTABLISHED IN PRINCIPLE
- Provider operation/resource binding: ESTABLISHED IN PRINCIPLE
- Universal token-to-CloudTrail mapping: NOT ESTABLISHED
- Drift-token-to-resource-cause theorem: REJECTED
- Universal drift-to-operation closure: NOT ESTABLISHED
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

AB105.045R — investigate CloudFormation Change Sets/ResourceChange semantics, especially ChangeSource and CausingEntity, as a possible provider-native explanation of which declared change was intended to cause a resource transition, while keeping intended change distinct from executed change and observed drift.
