# AB105.074R — causal attribution as a separate evidence dependency

Date: 2026-09-30
Chain: GLOBAL_INTEGRATION_AUDIT_CHECKPOINT -> AB105.074R

## Objective

Identify the next unresolved evidence-layer dependency after closing physical-incarnation and configuration/drift branches.

The dependency is causal/provenance attribution: who or what initiated an operation, versus what physical/configuration transition actually occurred.

## Fresh primary evidence

AWS CloudTrail records CloudFormation API calls and provides request time, event source/name, request parameters, response elements, requestID and eventID. AWS states this information can identify the request, who made it, when it occurred, and related details. citeturn0search6

AWS CloudFormation also emits resource, stack and drift status events directly to EventBridge. AWS states these events are durably delivered but may arrive out of order. citeturn0search2turn0search4

CloudFormation best practices explicitly recommend CloudTrail when auditing who made what CloudFormation call, while separately recommending revision control for template history. citeturn0search3

## Dependency boundary

A causal claim has at least four distinct layers:

1. ACTOR_PROVENANCE
2. API_REQUEST
3. CLOUD_FORMATION_OPERATION
4. RESOURCE/CONFIGURATION_EFFECT

Evidence for layer 1 or 2 must not silently prove layer 4.

## Evidence model

### ACTOR_PROVENANCE

CloudTrail can establish, within its retained/scope boundary, information about the principal/request associated with a CloudFormation API call.

Claim:
ACTOR_REQUESTED_API_CALL

State:
PROVEN_WITHIN_SCOPE when the relevant CloudTrail event is complete and retained.

### API_REQUEST

CloudTrail can establish the API operation and request parameters recorded in the event.

Claim:
API_REQUEST_OBSERVED

State:
BOUNDED_OBSERVATION unless coverage/retention guarantees stronger completeness.

### CLOUD_FORMATION_OPERATION

CloudFormation-native OperationId/ClientRequestToken/StackEvent evidence can identify the provider operation when those fields are present.

Claim:
CF_OPERATION_OBSERVED

State:
BOUNDED/PROVEN_WITHIN_PROVIDER_SCOPE depending on evidence completeness.

### RESOURCE/CONFIGURATION_EFFECT

A resource status event, StackEvent, drift result, or service read can establish an observed effect.

Claim:
EFFECT_OBSERVED

This remains separate from actor attribution.

## Anti-collapse cases

A CloudTrail UpdateStack event does not by itself prove:
- every resource in the stack changed;
- a particular resource was replaced;
- a particular physical incarnation was deleted;
- a particular drift difference was caused by that request.

A CloudFormation Resource Status Change event does not by itself prove:
- which human/role initiated the operation;
- the exact causal API request if correlation is absent.

Temporal proximity between CloudTrail and resource events is not an identity edge.

EventBridge delivery guarantees do not make event order causal; AWS explicitly warns CloudFormation events may be delivered out of order. citeturn0search2

## Correlation contract

Allowed correlation edges:

CLOUDTRAIL_EVENT -> ACTOR/API_REQUEST
  = exact within the CloudTrail record.

CLOUDFORMATION_OPERATION -> RESOURCE_EVENTS
  = provider-bounded when OperationId/client token and resource event fields bind the records.

CLOUDTRAIL_REQUEST -> CLOUDFORMATION_OPERATION
  = UNKNOWN unless an explicit documented/shared correlation edge exists.

API_REQUEST -> PHYSICAL_EFFECT
  = UNKNOWN unless lifecycle evidence binds the effect.

API_REQUEST -> CONFIGURATION_EFFECT
  = UNKNOWN unless causal correlation binds the effect.

TEMPORAL_PROXIMITY -> CAUSALITY
  = NEVER.

## Coverage contract

CAUSAL_CLAIM_SCOPE
ACCOUNT
REGION
TIME_BOUND
ACTOR_IDENTITY
CLOUDTRAIL_EVENT_ID
REQUEST_ID
API_NAME
STACK_ID
OPERATION_ID
CLIENT_REQUEST_TOKEN
TARGET_RESOURCE_IDENTITY
EFFECT_EVENT_ID
CORRELATION_EDGES
RETENTION_BOUNDARY
PAGINATION/DELIVERY_COMPLETENESS
FINAL_EVIDENCE_STATE

Allowed states:

PROVEN_WITHIN_SCOPE
BOUNDED_OBSERVATION
PARTIAL
UNKNOWN

## Why this is the next dependency

The previous branches deliberately stopped at:
- what physical identity/state was observed;
- what configuration differed from expected.

The remaining question is:
**what evidence permits attribution of an observed transition to an initiating actor/request?**

This is distinct from physical lifecycle and drift.

## Closure status

CAUSAL_ATTRIBUTION_GENERIC_BRANCH = OPEN

No new lifecycle edge is introduced yet.

The earlier AB105.060R finding remains intact:
no deterministic generic CloudTrail requestID/eventID -> CloudFormation OperationId bridge was established.

That does not close actor/API provenance itself; it only prevents unsupported cross-ledger correlation.

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

AB105.075R — adversarial counterexample pass for causal attribution: test false inferences from CloudTrail API calls, CloudFormation resource events, EventBridge delivery, temporal proximity, and missing correlation. Close the branch if the existing evidence model is sufficient.
