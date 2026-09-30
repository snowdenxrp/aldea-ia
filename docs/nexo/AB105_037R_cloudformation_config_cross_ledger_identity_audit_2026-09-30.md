# AB105.037R — CloudFormation StackEvents ↔ AWS Config ConfigurationItem cross-boundary audit

Date: 2026-09-30
Chain: AB105.036R → AB105.037R
Repository: snowdenxrp/aldea-ia
Branch: main

## Research question

Can CloudFormation StackEvents and AWS Config ConfigurationItems be cross-bound as two provider ledgers by shared resource identity and time, and what remains UNKNOWN when only one ledger contains the transition?

## Primary evidence

AWS CloudFormation StackEvent exposes StackId, EventId, LogicalResourceId, PhysicalResourceId, ResourceType, Timestamp, ResourceStatus, ResourceProperties, ClientRequestToken and optionally OperationId. AWS documents StackId as the unique identifier of the stack instance; PhysicalResourceId is the name or unique identifier associated with the physical resource instance. A CloudFormation example shows the stack's own StackId also appearing as the PhysicalResourceId for the AWS::CloudFormation::Stack event.

AWS Config ConfigurationItem exposes resourceId, resourceType, resourceCreationTime and related configuration/state fields. AWS Config supports AWS::CloudFormation::Stack as a recorded resource type.

## Analysis

### 1. Direct identity bridge exists for some resources, but is provider/resource-specific

For an AWS::CloudFormation::Stack resource, CloudFormation exposes a StackId that is also used as the physical identifier in the stack event representation. AWS Config independently identifies the recorded resource with resourceId and resourceType. This creates a possible direct identity bridge when the Config resourceId exactly corresponds to the CloudFormation stack identity and the resourceType is AWS::CloudFormation::Stack.

This is a concrete cross-ledger identity relation, not a generic theorem for every CloudFormation-managed resource. For child resources, CloudFormation PhysicalResourceId is provider/resource-specific and Config resourceId follows the recorded resource type's identity contract. Equality must therefore be established per resource type/identity contract rather than inferred from names or logical IDs.

### 2. Time compatibility is necessary but not causal proof

A Config ConfigurationItem can be compared with StackEvent Timestamp and its own capture/delivery/state timestamps. Temporal overlap can establish that the observations are compatible with the same resource state transition.

Temporal proximity or ordering alone does not prove that the StackEvent caused the ConfigurationItem. The two ledgers have different observation boundaries. A StackEvent is a CloudFormation operation/event record; a ConfigurationItem is an AWS Config point-in-time observation.

Therefore:
- same identity + compatible time = CROSS_LEDGER_CORRELATED
- same identity + provider/resource semantics + compatible state transition = BOUNDED_CROSS_LEDGER_BINDING
- timestamp order alone = NOT_CAUSAL_PROOF
- different/missing identity = UNKNOWN

### 3. One ledger observing a transition does not fill a gap in the other

If CloudFormation records CREATE/UPDATE/DELETE for a resource but no matching Config ConfigurationItem is available, the CloudFormation evidence remains valid as provider-native operation evidence. It does not establish that Config observed the transition.

If Config records a state transition but the corresponding CloudFormation event is absent, the Config evidence remains valid as Config observation evidence. It does not establish that CloudFormation performed the transition, because the resource could have been changed outside CloudFormation or the CloudFormation history could be unavailable/incomplete.

Therefore:
- StackEvent present + Config absent => CloudFormation transition EVIDENCED; Config transition UNKNOWN.
- Config CI present + StackEvent absent => Config state observation EVIDENCED; CloudFormation causation UNKNOWN.
- Both present + exact identity + compatible semantics/time => bounded cross-ledger binding.
- Both present but identity mapping uncertain => CORRELATION/UNKNOWN, not causal closure.

### 4. CloudFormation stack identity does not automatically identify every child resource's Config identity

LogicalResourceId is a template-local logical name. It is not a universal AWS resource identifier. PhysicalResourceId is stronger, but its semantics are resource/provider-specific. Config resourceId is likewise type-specific.

Thus a valid bridge must preserve:
1. account,
2. Region,
3. resource type,
4. CloudFormation StackId,
5. LogicalResourceId,
6. PhysicalResourceId where present,
7. Config resourceId,
8. identity-contract evidence for that resource type,
9. timestamps/capture semantics,
10. provenance/coverage.

No global rule may substitute StackId, logical ID, name, or timestamp for an absent resource identity mapping.

## Evidence ladder

IDENTITY_EXACT
→ TEMPORAL_COMPATIBILITY
→ SEMANTIC_COMPATIBILITY
→ PROVIDER_OPERATION_BINDING
→ CROSS_LEDGER_BOUND

Missing any required identity/coverage dependency prevents upgrading to the stronger state.

## Anti-collapse rules

- CloudFormation StackId != Config resourceId by assumption.
- LogicalResourceId != AWS global resource identity.
- PhysicalResourceId != universal AWS incarnation theorem.
- Config resourceId != CloudFormation LogicalResourceId.
- Same timestamp/order != causality.
- StackEvent presence != Config observation.
- Config CI presence != CloudFormation causation.
- Missing Config CI != no real-world change.
- Missing StackEvent != no CloudFormation action.
- Current Config state != complete CloudFormation event history.
- CloudFormation operation history != complete external-world lifecycle.
- Cross-ledger correlation != universal causal closure.

## New distilled rule

exact_provider_identity_mapping + resource_type/account/region binding + compatible temporal/state semantics + coverage/provenance -> BOUNDED_CROSS_LEDGER_BINDING

one ledger only -> provider-specific evidence only; other ledger remains UNKNOWN

identity uncertain OR coverage incomplete -> UNKNOWN/CORRELATION_ONLY

## Status ledger

- CloudFormation StackEvent identity fields: FOUND
- CloudFormation StackId/PhysicalResourceId concrete stack identity relation: FOUND
- AWS Config resourceId/resourceType fields: FOUND
- AWS Config CloudFormation Stack support: FOUND
- Concrete cross-ledger identity bridge for CloudFormation Stack: ESTABLISHED IN PRINCIPLE
- Generic child-resource identity bridge: NOT ESTABLISHED
- Temporal compatibility as correlation evidence: ESTABLISHED IN PRINCIPLE
- Temporal ordering as causal proof: REJECTED
- One-ledger gap closure by the other ledger: REJECTED
- Universal CloudFormation↔Config causal theorem: NOT ESTABLISHED
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

AB105.038R — investigate whether CloudFormation StackResource/StackResourceSummary and AWS Config relationships/supplementary configuration provide a reliable mapping for nested stacks and child resources, and determine whether that mapping can strengthen cross-ledger identity without silently becoming a universal causal claim.
