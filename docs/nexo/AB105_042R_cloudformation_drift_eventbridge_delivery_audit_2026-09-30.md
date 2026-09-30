# AB105.042R — CloudFormation Drift Status Change + EventBridge delivery semantics audit

Date: 2026-09-30
Chain: AB105.041R -> AB105.042R

## Research question

Can the CloudFormation Drift Detection Status Change event provide a stronger identity bridge for a drift observation, and what remains UNKNOWN across delivery/order gaps?

## Primary evidence

AWS documents CloudFormation service events as being sent directly to EventBridge. The Drift Detection Status Change event is a named CloudFormation service event and its detail contains stack-id, stack-drift-detection-id, status-details, drift-detection-details, and client-request-token.

AWS documents these CloudFormation service events as durable. AWS also states that CloudFormation events sent to EventBridge can be delivered out of order.

The CloudFormation event reference separately describes CloudTrail-delivered API events as best effort. Therefore the direct CloudFormation service-event path and the CloudTrail API-call path have different delivery semantics and must not be collapsed.

## Findings

### 1. Direct EventBridge service event is a first-class drift-observation ledger signal

The documented Drift Detection Status Change event contains the exact StackDriftDetectionId generated for the drift run, plus StackId and detection status.

Therefore:

direct CloudFormation drift event + StackId + StackDriftDetectionId
-> BOUNDED_DRIFT_OBSERVATION_EVENT

This is stronger than reconstructing the drift identity from timestamp proximity.

### 2. Durable delivery does not mean ordered delivery

AWS explicitly says CloudFormation events sent directly to EventBridge are guaranteed to be delivered, but might be delivered out of order.

Therefore durable delivery supports eventual event availability, not causal or chronological ordering.

Event arrival order cannot be treated as proof that one event happened before another.

The event's own time is an observation/event timestamp, but timestamp order remains distinct from causal proof.

### 3. ClientRequestToken strengthens operation correlation inside CloudFormation

The documented Drift Detection Status Change event contains client-request-token. AWS states that events initiated by a given stack operation are assigned the same client request token and that it can be used to track operations.

This permits a bounded CloudFormation-side correlation when the token is present and matching.

It still must not be treated as a universal AWS operation ID, CloudTrail eventID, or resource incarnation ID.

### 4. Direct service event and CloudTrail path are independent evidence axes

CloudFormation sends service events directly to EventBridge and also has CloudTrail-delivered API events.

The direct drift event is documented as durable, while the CloudTrail delivery path is best effort.

Therefore:

DIRECT_EVENT_PRESENT -> positive drift-status evidence
CLOUDTRAIL_EVENT_PRESENT -> positive API-call evidence

DIRECT_EVENT_ABSENT does not by itself prove no drift detection occurred.
CLOUDTRAIL_EVENT_ABSENT does not by itself prove no API call occurred.

A missing event becomes negative evidence only after a claim-specific completeness/retention/coverage argument.

### 5. Drift detection remains an observation, not a resource-change ledger

The drift event describes a user-initiated drift detection operation and its observed drift status. It does not identify the earlier resource-changing operation that produced the mismatch.

Correct causal graph:

RESOURCE CHANGE
 -> resulting resource state
 -> DRIFT DETECTION
 -> StackDriftDetectionId
 -> DRIFT STATUS EVENT

The middle and later nodes can be strongly identified without proving the first node's exact cause.

### 6. Event ordering cannot close the causal gap

Because CloudFormation service events can be delivered out of order, receiving a resource status event near a drift event does not establish a causal sequence merely from arrival order.

Even matching client-request-token must remain within its documented CloudFormation operation semantics.

## Evidence ladder

1. StackId
2. StackDriftDetectionId
3. Drift Detection Status Change event
4. client-request-token when present
5. event time / account / region
6. independent CloudTrail API-call evidence
7. independent resource-changing operation evidence
8. resource identity/incarnation + state evidence

Layers 1-5 can establish bounded drift-observation identity.
Layers 6-8 are needed for stronger reconstruction of what caused the observed drift.

## Anti-collapse rules

- Durable delivery != ordered delivery.
- EventBridge arrival order != causal order.
- StackDriftDetectionId != CloudTrail eventID.
- StackDriftDetectionId != resource-change operation ID.
- client-request-token != universal operation ID.
- Drift status event != resource-change event.
- Direct service-event absence != proof of no drift detection.
- CloudTrail absence != proof of no API call.
- Event time != causal proof.
- DRIFTED != proof of actor/cause.
- IN_SYNC != proof of no historical external change.
- Durable event delivery != indefinite historical retention unless the retention boundary is separately established.
- One evidence axis cannot silently repair an uncovered gap in another.

## New distilled rule

durable direct CloudFormation drift event + exact StackId + exact StackDriftDetectionId -> BOUNDED_DRIFT_OBSERVATION

+ matching client-request-token -> BOUNDED_CLOUDFORMATION_OPERATION_CORRELATION

+ independently evidenced resource-changing operation + exact identity/incarnation + compatible semantics/coverage -> BOUNDED_CAUSAL_RECONSTRUCTION

Otherwise causal attribution remains UNKNOWN.

## Status ledger

- Direct CloudFormation Drift Detection Status Change event: FOUND
- StackDriftDetectionId in event: FOUND
- StackId in event: FOUND
- client-request-token in event: FOUND
- Direct service-event delivery: DOCUMENTED DURABLE
- Possible out-of-order delivery: FOUND
- CloudTrail API-event path: FOUND
- CloudTrail delivery best-effort boundary: FOUND
- Drift observation identity: ESTABLISHED IN PRINCIPLE
- ClientRequestToken as universal operation ID: REJECTED
- Event arrival ordering as causality: REJECTED
- Drift-to-resource-change causal closure: NOT ESTABLISHED
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

AB105.043R — investigate whether CloudFormation Resource Status Change events can provide the missing resource-side bridge from the observed drift state to a specific stack/resource transition, while preserving the distinction between state observation and causal operation attribution.
