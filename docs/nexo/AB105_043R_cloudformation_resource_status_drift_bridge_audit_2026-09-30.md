# AB105.043R — CloudFormation Resource Status Change as drift-to-resource-state bridge

Date: 2026-09-30
Chain: AB105.042R -> AB105.043R

## Research question

Can CloudFormation Resource Status Change events provide the missing resource-side bridge from an observed drift result to a concrete resource transition, while preserving the distinction between state observation and causal operation attribution?

## Primary evidence

AWS documents a direct EventBridge event named CloudFormation Resource Status Change. Its detail includes stack-id, logical-resource-id, physical-resource-id, resource-type, status, status-reason, and client-request-token. AWS describes this event as representing updates that change underlying resource properties.

CloudFormation StackResource/StackResourceSummary exposes StackId, LogicalResourceId, PhysicalResourceId, ResourceType, resource status and a timestamp describing when the status was updated. PhysicalResourceId is the name or unique identifier corresponding to a physical resource instance.

CloudFormation stack events separately expose EventId, StackId, logical/physical resource identity, ResourceType, ResourceStatus, Timestamp and ClientRequestToken.

## Findings

### 1. Resource Status Change is a real resource-side observation

Unlike Drift Detection Status Change, which represents a user-initiated drift detection update, Resource Status Change represents a CloudFormation update that changes underlying resource properties.

Therefore the two event types occupy different evidence roles:

DRIFT_DETECTION_STATUS_CHANGE
-> observation of expected-vs-actual configuration

RESOURCE_STATUS_CHANGE
-> provider-side observation of a resource status transition

This is a meaningful bridge candidate.

### 2. The resource event has strong identity fields

The Resource Status Change event carries:

- StackId
- LogicalResourceId
- PhysicalResourceId
- ResourceType
- status/status-reason
- ClientRequestToken

This permits a bounded identity join with CloudFormation stack/resource records when account, Region, stack, resource type and identity all agree.

The PhysicalResourceId strengthens instance binding, but AWS describes it generically as a name or unique identifier for a physical instance. It must remain provider/resource-specific rather than being promoted to a universal non-reuse theorem.

### 3. ClientRequestToken can connect resource transitions to a CloudFormation stack operation

AWS documents that all events initiated by a given stack operation are assigned the same client request token and that the token can be used to track operations.

Therefore:

RESOURCE_STATUS_EVENT + ClientRequestToken
-> BOUNDED_CLOUDFORMATION_OPERATION_CORRELATION

This is stronger than timestamp matching.

But the token is still not a universal AWS operation ID and must not be equated with CloudTrail requestID/eventID without explicit evidence.

### 4. Resource Status Change can strengthen the drift-to-state bridge, but not automatically the drift-to-cause bridge

Suppose:

T1: Resource Status Change for exact resource identity
T2: Drift Detection Status Change for same stack
T2: Drift result says resource is MODIFIED

This can establish a bounded provider-side sequence linking a known resource transition to a later drift observation when identity, semantics and temporal coverage are compatible.

It does NOT by itself prove that the T1 transition caused the T2 drift.

A later external mutation, an earlier mutation, an unsupported intermediate transition, or another operation may remain possible unless independently covered.

### 5. Drift and resource events have different semantics

The AWS EventBridge integration explicitly distinguishes:
- Resource Status Change: updates that change underlying resource properties.
- Drift Detection Status Change: user-initiated drift detection update.

Therefore they must remain separate event classes in the evidence graph.

A drift event is not a resource-change event.
A resource-change event is not a drift result.

### 6. StackResource current state is not a historical event ledger

StackResource and StackResourceSummary provide current/high-level resource state and a status-update timestamp. They are useful for identity/state binding but cannot alone reconstruct all intermediate transitions.

CloudFormation stack events are stronger historical evidence because they expose individual event identities and operation tokens, but coverage/retention still require separate proof.

### 7. Missing resource event does not prove no resource change

Even though direct CloudFormation service events are documented as durable, absence from a retrieved local/event archive is not automatically a negative historical fact unless the acquisition, retention, filtering and retrieval scope are complete for the claim.

Therefore:
NO_RESOURCE_EVENT_OBSERVED
!=
NO_RESOURCE_CHANGE_OCCURRED

unless completeness is independently established.

## Bounded bridge

A stronger claim is justified when all are present:

exact StackId
+ exact LogicalResourceId
+ compatible ResourceType
+ exact/compatible PhysicalResourceId
+ Resource Status Change or StackEvent evidence
+ ClientRequestToken when available
+ compatible event semantics and time
+ adequate retention/coverage
+ independent DriftDetectionId and drift-result evidence

Result:

BOUNDED_RESOURCE_STATE_TO_DRIFT_OBSERVATION_SEQUENCE

Not:

UNIVERSAL_CAUSAL_PROOF

## Anti-collapse rules

- Resource Status Change != Drift Detection Status Change.
- Resource status != drift result.
- Resource event != resource-changing API identity by itself.
- PhysicalResourceId != universal non-reuse theorem.
- ClientRequestToken != universal AWS operation ID.
- Event arrival order != causal order.
- Resource status timestamp != exact real-world mutation time.
- Current StackResource state != complete historical event sequence.
- Resource event presence != complete resource history.
- Missing resource event != proof of no resource change without coverage.
- Drift MODIFIED != proof that the nearest resource event caused the drift.
- Drift observation identity != resource incarnation identity.

## New distilled rule

exact resource identity + provider Resource Status Change/StackEvent + compatible ClientRequestToken + coverage -> BOUNDED_RESOURCE_TRANSITION

bounded resource transition + independent DriftDetectionId/result + compatible temporal/state semantics -> BOUNDED_RESOURCE_STATE_TO_DRIFT_SEQUENCE

Causal attribution to a specific resource-changing operation remains UNKNOWN unless the operation identity and competing-history coverage are independently established.

## Status ledger

- Resource Status Change event: FOUND
- Resource identity fields: FOUND
- ClientRequestToken semantics: FOUND
- StackResource state/timestamp: FOUND
- StackEvent historical identity: FOUND
- Resource-side bridge to drift observation: ESTABLISHED IN PRINCIPLE
- Exact cause attribution from drift alone: REJECTED
- Universal PhysicalResourceId continuity theorem: NOT ESTABLISHED
- Complete resource history from current StackResource: REJECTED
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

AB105.044R — investigate whether ClientRequestToken can be concretely joined across CloudFormation Resource Status Change, StackEvents, and the initiating stack operation, and identify the exact residual gap between that provider-side operation correlation and CloudTrail request/event identity.
