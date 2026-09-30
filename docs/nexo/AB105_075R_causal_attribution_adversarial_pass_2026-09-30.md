# AB105.075R — adversarial causal-attribution pass

Date: 2026-09-30
Chain: AB105.074R -> AB105.075R

## Objective

Attack the causal-attribution model with minimal cases that could falsely infer actor, API cause, CloudFormation operation, resource effect, or causal ordering.

## Primary evidence

CloudTrail records the identity, API operation, request parameters, requestID and eventID for CloudFormation API requests, but AWS explicitly states CloudTrail logs are not an ordered stack trace. citeturn0search2turn0search6

CloudFormation service events sent directly to EventBridge are durable but may be delivered out of order. CloudFormation also has separate CloudTrail-derived API-call events. citeturn0search0turn0search1

CloudTrail userIdentity identifies the IAM identity or service context associated with a request. citeturn0search11

## Counterexamples

### A1 — CloudTrail UpdateStack mistaken for resource mutation

Evidence:
CloudTrail UpdateStack request.

Naive claim:
"Every resource changed."

Correct result:
API_REQUEST_OBSERVED only.

The request establishes an API call, not each downstream resource effect.

### A2 — CloudTrail actor mistaken for physical-effect actor

Evidence:
CloudTrail principal calls CloudFormation.

Naive claim:
"The principal directly deleted/replaced physical resource X."

Correct result:
ACTOR_REQUESTED_API_CALL; physical effect requires independent lifecycle evidence.

### A3 — Temporal proximity mistaken for causal correlation

Evidence:
CloudTrail event at T1; resource event at T1+seconds.

Naive claim:
"The CloudTrail event caused the resource event."

Correct result:
UNKNOWN correlation unless an explicit binding edge exists.

CloudTrail is not an ordered stack trace. citeturn0search2

### A4 — requestID mistaken for OperationId

Evidence:
CloudTrail requestID and CloudFormation OperationId.

Naive claim:
"Same operation because both are IDs."

Correct result:
UNKNOWN unless a documented correlation edge binds them.

### A5 — eventID mistaken for causal identity

Evidence:
CloudTrail eventID.

Naive claim:
"This is the lifecycle event identity."

Correct result:
CLOUDTRAIL_EVENT_ID only.

### A6 — EventBridge ordering mistaken for causal order

Evidence:
CloudFormation events delivered through EventBridge.

Naive claim:
Arrival order equals execution order.

Correct result:
EVENT_OBSERVED; ordering UNKNOWN.

AWS explicitly states CloudFormation EventBridge events may arrive out of order. citeturn0search0

### A7 — resource status event mistaken for actor attribution

Evidence:
CloudFormation Resource Status Change.

Naive claim:
"The IAM principal in the nearest CloudTrail event caused it."

Correct result:
EFFECT_OBSERVED; ACTOR_CAUSE UNKNOWN without correlation.

### A8 — API success mistaken for physical success

Evidence:
CloudTrail API request with successful response.

Naive claim:
"All requested physical changes completed."

Correct result:
API_REQUEST_ACCEPTED/OBSERVED; final resource state requires lifecycle/service evidence.

### A9 — API failure mistaken for zero mutation

Evidence:
CloudTrail API request fails.

Naive claim:
"No resource changed."

Correct result:
UNKNOWN unless lifecycle evidence establishes no mutation.

A multi-resource operation can have independent downstream outcomes.

### A10 — missing CloudTrail event mistaken for no actor/request

Evidence:
No matching CloudTrail record.

Naive claim:
"No request occurred."

Correct result:
UNKNOWN unless the relevant CloudTrail coverage contract makes the negative claim valid.

### A11 — service-generated event mistaken for human actor

Evidence:
CloudTrail userIdentity indicates an AWS service context.

Naive claim:
"Human operator performed the effect."

Correct result:
SERVICE_OR_DELEGATED_IDENTITY; human attribution requires additional identity-chain evidence.

### A12 — event duplication mistaken for two operations

Evidence:
Same logical effect appears through direct CloudFormation EventBridge and CloudTrail-derived EventBridge surfaces.

Naive claim:
"Two operations occurred."

Correct result:
POTENTIAL_MULTI_SURFACE_SAME_EVENT; deduplication/correlation required.

AWS documents that CloudFormation sends service events directly to EventBridge and CloudTrail can separately deliver CloudFormation API-call events. citeturn0search1

### A13 — CloudTrail field truncation mistaken for absent evidence

Evidence:
Large CloudTrail event with missing/truncated request fields.

Naive claim:
"The omitted field was absent in the original request."

Correct result:
UNKNOWN_FIELD_VALUE.

AWS documents field truncation behavior for oversized events, including requestID and request parameters. citeturn0search22

## Adversarial result

All tested false inferences are rejected.

No new generic lifecycle edge is required.

The causal model needs only explicit provenance/correlation states and must never synthesize causality from time, proximity, generic identifiers, or event arrival order.

## Closure

CAUSAL_ATTRIBUTION_GENERIC_BRANCH = CLOSED_WITH_BOUNDED_UNKNOWN

The branch distinguishes:

ACTOR_REQUESTED_API_CALL
API_REQUEST_OBSERVED
CF_OPERATION_OBSERVED
EFFECT_OBSERVED
CAUSAL_LINK_PROVEN_WITHIN_SCOPE
CORRELATION_UNKNOWN
COVERAGE_UNKNOWN

from physical/configuration outcomes.

## Minimal invariants

ACTOR != EFFECT
API_REQUEST != PHYSICAL_EFFECT
API_SUCCESS != PHYSICAL_SUCCESS
API_FAILURE != NO_MUTATION
requestID != OperationId
eventID != lifecycle_identity
TEMPORAL_PROXIMITY != CAUSALITY
EVENT_ARRIVAL_ORDER != EXECUTION_ORDER
MISSING_EVENT != NO_EVENT
SERVICE_IDENTITY != HUMAN_IDENTITY
DUPLICATE_SURFACES != DUPLICATE_OPERATIONS
TRUNCATED_FIELD != ABSENT_FIELD

## Status ledger

- False actor attribution: PASSED
- False API-cause attribution: PASSED
- False physical-effect attribution: PASSED
- False ordering inference: PASSED
- False negative inference: PASSED
- Cross-surface duplicate trap: PASSED
- Truncation boundary: EXPLICIT
- Generic causal taxonomy: CLOSED
- Formal verification: NOT PERFORMED
- Implementation: NOT STARTED

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

AB55 remains 64 states × 6 total orders = 384 per attack across 8 attacks; it did not establish full UsedAdmissionContext/EventDAG/FutureObs_PAA closure.

## Next exact direction

AB105.076R — distill the causal-attribution branch into a normative contract and then perform a small three-branch integration check across physical lifecycle, configuration/drift, and causal provenance. Do not reopen closed branches unless an actual contradiction appears.
