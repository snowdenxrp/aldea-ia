# AB105.041R — CloudFormation Drift detection identity and CloudTrail audit

Date: 2026-09-30
Chain: AB105.040R -> AB105.041R

## Research question

What binds a CloudFormation drift-detection invocation to CloudTrail, and can that identity be confused with the identity of the resource-changing operation?

## Primary evidence

DetectStackDrift returns a StackDriftDetectionId and response metadata includes a RequestId. AWS states that a new StackDriftDetectionId is generated for each DetectStackDrift run. The drift status API uses that detection ID and returns StackId, detection ID, status and Timestamp.

CloudFormation publishes a dedicated EventBridge event, CloudFormation Drift Detection Status Change. Its documented detail includes stack-id, stack-drift-detection-id, status-details, drifted-stack-resource-count and client-request-token.

AWS documents CloudFormation API calls as CloudTrail events and CloudTrail requestID/eventID as distinct event-level identifiers. EventBridge also states that CloudFormation events delivered through CloudTrail are best effort.

## Findings

### 1. DriftDetectionId is the native identity for the drift observation

StackDriftDetectionId identifies the drift-detection result set created by a particular DetectStackDrift invocation. It is suitable as the primary observation identity inside the CloudFormation drift subsystem.

It is NOT automatically:
- the CloudTrail eventID;
- the CloudTrail requestID;
- the resource-changing operation ID;
- a CloudFormation stack update operation ID.

### 2. CloudTrail can evidence the DetectStackDrift API call, but identifier equality must not be assumed

A CloudTrail record for the DetectStackDrift API call can establish that the API invocation occurred, subject to CloudTrail coverage. CloudTrail eventID identifies the CloudTrail record and requestID identifies the service request.

The DetectStackDrift response separately exposes StackDriftDetectionId and RequestId. Without an explicit provider guarantee that a particular field is identical across the CloudFormation response and CloudTrail record, equality must remain UNKNOWN rather than inferred from UUID-like values.

Thus:
CloudTrail eventName=DetectStackDrift + target stack + compatible time -> DETECTION_API_CALL_CORRELATED

but not:
CloudTrail eventID == StackDriftDetectionId.

### 3. The dedicated EventBridge drift event gives a stronger bridge inside CloudFormation

AWS documents a Drift Detection Status Change event containing both stack-drift-detection-id and client-request-token. This means a status transition can be correlated to the same drift detection identity through the CloudFormation event channel.

This is stronger than timestamp-only matching.

However, the event is a status-change observation. It still does not identify the resource-changing operation that created any observed drift.

### 4. ClientRequestToken has a different semantic role

The drift status event includes client-request-token. This can strengthen correlation of the drift-detection invocation/event within the CloudFormation control plane.

It must not be promoted to a universal AWS operation identifier or assumed equal to CloudTrail requestID/eventID.

### 5. Drift observation identity and resource-change identity are separate graphs

The correct graph is:

RESOURCE-CHANGING OPERATION
    -> resource state
    -> later DetectStackDrift invocation
    -> StackDriftDetectionId
    -> drift result/status event

CloudTrail can separately observe the DetectStackDrift API call and resource-changing APIs.

Therefore a drift result showing MODIFIED can be linked to the observation that detected the mismatch, but not automatically to the earlier operation that caused the mismatch.

### 6. EventBridge/CloudTrail delivery has coverage boundaries

AWS states CloudFormation events delivered through CloudTrail are best effort. Therefore absence of a corresponding CloudTrail record cannot automatically prove that the DetectStackDrift invocation did not occur.

Likewise, presence of the dedicated EventBridge drift-status event is positive evidence of the status event; it does not prove complete historical retention of all drift detections.

## Evidence ladder

STACK_IDENTITY
-> STACK_DRIFT_DETECTION_ID
-> CLOUDFORMATION_STATUS_EVENT
-> CLOUDTRAIL_DETECTION_API_RECORD
-> RESOURCE_STATE/DRIFT_RESULT
-> SEPARATE_RESOURCE_CHANGING_EVENT_EVIDENCE

Only the first layers bind the observation. The final causal link to the resource-changing operation requires independent evidence.

## Anti-collapse rules

- StackDriftDetectionId != CloudTrail eventID.
- StackDriftDetectionId != CloudTrail requestID unless explicitly proven.
- CloudTrail DetectStackDrift event != resource-changing operation.
- Drift status event != resource-change event.
- client-request-token != universal AWS operation ID.
- Drift timestamp != resource-change timestamp.
- Drift result != proof of actor/cause.
- CloudTrail no-hit != DetectStackDrift never occurred when coverage is incomplete.
- EventBridge status event != complete drift history.
- Drift observation identity != resource incarnation identity.
- Detection correlation != causal attribution.

## New distilled rule

StackDriftDetectionId + documented CloudFormation status event + exact StackId + compatible temporal semantics -> BOUNDED_DRIFT_OBSERVATION_IDENTITY

CloudTrail DetectStackDrift record + compatible stack/time + coverage -> DETECTION_API_CALL_CORRELATED

drift observation + separate resource-changing event + identity/semantic/temporal binding + coverage -> BOUNDED_CAUSAL_RECONSTRUCTION

Missing the resource-changing event leaves the cause UNKNOWN.

## Status ledger

- StackDriftDetectionId per detection run: FOUND
- DetectStackDrift response RequestId: FOUND
- CloudFormation drift status event: FOUND
- Status event includes StackDriftDetectionId: FOUND
- Status event includes ClientRequestToken: FOUND
- CloudTrail API-call evidence path: FOUND
- CloudTrail/EventBridge best-effort boundary: FOUND
- StackDriftDetectionId == CloudTrail requestID/eventID: NOT ESTABLISHED
- Drift identity == resource-change identity: REJECTED
- Drift observation-to-resource-cause bridge: BOUNDED / PER-CLAIM
- Universal drift-to-operation theorem: NOT ESTABLISHED
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

AB105.042R — investigate the documented CloudFormation Drift Detection Status Change event and EventBridge delivery semantics in more detail, including whether its client-request-token can be bound to the initiating DetectStackDrift request and what remains UNKNOWN across delivery gaps.
