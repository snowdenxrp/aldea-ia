# AB105.076R — causal contract + three-branch integration check

Date: 2026-09-30
Chain: AB105.075R -> AB105.076R

## Objective

Distill causal attribution into a normative contract and test it against the already closed physical-incarnation and configuration/drift contracts.

## Fresh primary evidence

CloudFormation StackEvent exposes OperationId as the unique identifier of the operation that generated the stack event, while PhysicalResourceId identifies the physical instance when present. The same record also exposes resource status and logical/resource type context. AWS makes these fields optional where documented. [AWS StackEvent API]

CloudFormation drift detection creates a new StackDriftDetectionId for each run; retained drift results and retention duration may vary. DETECTION_COMPLETE is scoped to supported resources and any supplied logical-resource filter. [AWS DetectStackDrift / DescribeStackDriftDetectionStatus]

CloudFormation drift EventBridge events include StackDriftDetectionId, stack status, detection status, and client-request-token. AWS documents the client request token as a tracking value for events initiated by a stack operation. [AWS Drift Detection Status Change event]

## Normative causal contract

### Provenance layers

ACTOR_PROVENANCE
API_REQUEST
CF_OPERATION
RESOURCE_EFFECT
CONFIGURATION_EFFECT

Each layer is independently evidenced.

### Allowed causal edges

CLOUDTRAIL_EVENT -> ACTOR/API_REQUEST
  Exact within the CloudTrail event record.

CF_OPERATION -> RESOURCE_EFFECT
  Bounded when provider-native operation identity is present in the lifecycle event.

CF_OPERATION -> CONFIGURATION_EFFECT
  Bounded only when the configuration observation is explicitly bound to that operation.

API_REQUEST -> CF_OPERATION
  UNKNOWN unless a documented correlation edge exists.

API_REQUEST -> RESOURCE_EFFECT
  UNKNOWN unless independently bound.

API_REQUEST -> CONFIGURATION_EFFECT
  UNKNOWN unless independently bound.

TIME_PROXIMITY -> CAUSALITY
  NEVER.

EVENT_ARRIVAL_ORDER -> EXECUTION_ORDER
  NEVER.

## Claim states

ACTOR_REQUEST_OBSERVED
API_REQUEST_OBSERVED
CF_OPERATION_OBSERVED
EFFECT_OBSERVED
CAUSAL_LINK_PROVEN_WITHIN_SCOPE
PARTIAL
UNKNOWN

No state may silently upgrade another state.

## Three-branch integration

### Physical branch

Input:
Operation/StackEvent + PhysicalResourceId + lifecycle semantics.

Output:
PHYSICAL_CREATION / PHYSICAL_REPLACEMENT / PHYSICAL_DELETION only when evidence binds the physical identity transition.

Causal attribution remains separate.

### Configuration branch

Input:
StackDriftDetectionId + expected/actual properties + detection scope.

Output:
CONFIGURATION_MATCH / CONFIGURATION_DIFFERENCE / CONFIGURATION_DELETION_OBSERVED / NOT_OBSERVED / PARTIAL / UNKNOWN.

Drift does not create physical lifecycle edges.

### Causal branch

Input:
actor/API provenance + provider operation identity + explicit correlation edges.

Output:
actor/API attribution only at the level actually evidenced.

Causal attribution does not manufacture a physical or configuration effect.

## Integration invariants verified

1. Physical effect != causal attribution.
2. Configuration difference != causal attribution.
3. Causal attribution != proof of physical effect.
4. A CloudFormation OperationId can bind provider lifecycle events without becoming an actor identity.
5. A drift detection ID identifies a drift observation, not a physical incarnation.
6. ClientRequestToken is a correlation aid within documented provider semantics, not a universal cross-ledger identity.
7. Current configuration observation cannot establish historical physical continuity.
8. Physical lifecycle evidence cannot by itself establish the configuration cause.
9. Missing correlation remains UNKNOWN.
10. Historical coverage remains explicit.

## Contradiction result

No contradiction found among the three contracts.

No new generic edge required.

No previously closed branch reopened.

## Closure

CAUSAL_ATTRIBUTION_GENERIC_CONTRACT = CLOSED

The causal branch is closed at the generic evidence layer with bounded UNKNOWN.

Remaining dependencies are implementation/evidence adapters:
- CloudTrail retention and query coverage;
- provider-specific operation correlation;
- resource-type identity semantics;
- service-side physical evidence;
- configuration-property support;
- cross-ledger correlation where no documented bridge exists.

## Research stop rule

Do not continue expanding these three generic branches.

Resume only for a concrete new evidence dependency or a primary-source counterexample.

A broader audit is not needed immediately; this three-branch integration is the checkpoint requested after AB105.073R.

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

AB105.077R — select the next unresolved evidence dependency outside the three closed generic branches. Prefer a dependency that materially affects Nexo's future Claim/Decision/Evidence model rather than another AWS lifecycle sub-branch.
