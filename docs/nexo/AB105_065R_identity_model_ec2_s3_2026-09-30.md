# AB105.065R — identity-model test: EC2 InstanceId vs S3 bucket name

Date: 2026-09-30
Chain: AB105.064R -> AB105.065R

## Research question

Test the generic cross-ledger physical identity contract against resource types with materially different identity models: EC2 instances and S3 buckets, including replacement and identifier reuse.

## Primary evidence

CloudFormation documents physical IDs as actual assigned resource identifiers, with EC2 InstanceId and S3 bucket name as examples. For S3, CloudFormation can generate a unique physical name when no custom name is supplied. citeturn0search34

For AWS::S3::Bucket, BucketName is a replacement property; when a named bucket must be replaced, a new name is required. citeturn0search0

CloudFormation states that replacement recreates a resource and generates a new physical ID. For AWS::EC2::Instance, CloudFormation creates the replacement before deleting the old instance during a successful replacement, with rollback able to restore the old instance if the update fails. citeturn0search7turn0search15

CloudFormation resource schemas define primaryIdentifier and additionalIdentifiers per resource type, confirming that identity semantics are resource-type-specific rather than one universal identifier rule. citeturn0search16

## Findings

### 1. EC2 InstanceId is an instance-oriented identity

For an AWS::EC2::Instance, the physical ID is an EC2 instance ID. A replacement creates a new instance and therefore a new physical ID.

Bounded edge:

L@i_old --replacement--> L@i_new

is strong when the same logical resource and operation evidence connect the two IDs.

### 2. S3 BucketName is a name-oriented identity

For AWS::S3::Bucket, the physical identifier can be the bucket name. A bucket name is therefore both a physical identifier and a human-selected/resource naming value.

A stable S3 bucket name supports the scoped identity:
ACCOUNT + REGION + AWS::S3::Bucket + BucketName

but does not by itself establish uninterrupted incarnation history.

### 3. S3 replacement semantics expose the danger of name equality

CloudFormation explicitly treats BucketName as a replacement property. If a replacement is required for a named bucket, a new name must be supplied. citeturn0search0

An S3 name change can therefore establish a stronger replacement boundary when old/new names and operation evidence are both present.

An identifier string observed again later still does not prove incarnation continuity without lifecycle evidence spanning the gap.

### 4. EC2 and S3 cannot share a raw-ID equality rule

EC2:
RESOURCE_TYPE = AWS::EC2::Instance
PHYSICAL_ID = InstanceId

S3:
RESOURCE_TYPE = AWS::S3::Bucket
PHYSICAL_ID = BucketName

Therefore raw identifier equality is not identity equality.

The generic contract must include resource type and account/region scope.

### 5. Replacement is a semantic edge, not an ID comparison

The safe reconstruction edge is:

same logical resource
+ same stack
+ same relevant operation
+ resource-type replacement semantics
+ old physical ID
+ new physical ID
=> BOUNDED_REPLACEMENT_EDGE

Not:

old_id != new_id
=> replacement.

### 6. Identifier reuse remains an UNKNOWN boundary

A later observation equal to an earlier identifier proves equality of identifier value, not automatic equality of incarnation.

The architecture must distinguish:

IDENTIFIER_EQUALITY
from
INCARNATION_CONTINUITY.

If an identity can be deleted and later reused, continuity requires lifecycle evidence across the gap.

### 7. Generic contract is sufficient at the namespace level

The generic namespace remains:

ACCOUNT
REGION
RESOURCE_TYPE
SERVICE_PRIMARY_IDENTIFIER

with optional CloudFormation context:

STACK_ID
LOGICAL_RESOURCE_ID
OPERATION_ID
PHYSICAL_RESOURCE_ID

The mapping from CloudFormation PhysicalResourceId to service identity remains resource-type-specific.

### 8. Type-specific adapter is required, not a separate global model

Use one generic identity envelope and resource-type-specific adapters.

The adapter supplies:
- primary identifier definition,
- allowed secondary identifiers,
- replacement semantics,
- reuse assumptions,
- service read mapping,
- identity normalization.

The generic evidence layer must not invent those semantics.

## Identity contract

### Generic minimum

ACCOUNT + REGION + RESOURCE_TYPE + SERVICE_PRIMARY_IDENTIFIER

### CloudFormation enriched identity

STACK_ID + LOGICAL_RESOURCE_ID + OPERATION_ID + PHYSICAL_RESOURCE_ID

### Upgrade condition

A cross-ledger claim may move from UNKNOWN to BOUNDED only when:

1. resource type is known,
2. account/region scope is known,
3. service identifier semantics are known,
4. CloudFormation physical ID mapping is documented for that type,
5. lifecycle evidence supplies the relevant operation/incarnation edge,
6. service state observation uses the same scoped identity.

If any required mapping is absent: UNKNOWN.

## Matrix

| Dimension | EC2 Instance | S3 Bucket |
|---|---|---|
| Physical ID example | InstanceId | BucketName |
| Identity character | generated instance identifier | resource name |
| Replacement | new instance/new physical ID | replacement requires new name when custom name specified |
| Raw string equality | insufficient | insufficient |
| Type scope required | yes | yes |
| Account/Region scope | required | required |
| Type-specific adapter | required | required |
| Current service read | instance state | bucket state |
| Historical continuity from ID alone | UNKNOWN | UNKNOWN |

## Distilled rule

The generic contract survives the test, but identity semantics cannot be genericized away.

Use one namespace/envelope and resource-type-specific adapters.

The central separation is:

IDENTIFIER_EQUALITY != INCARNATION_CONTINUITY

and:

CURRENT_SERVICE_STATE != HISTORICAL_LIFECYCLE_PROOF.

## Anti-collapse rules

- EC2 InstanceId != S3 BucketName even if strings match.
- PhysicalResourceId != universal identity semantics.
- Same identifier != guaranteed same incarnation.
- Different identifier != automatically replacement.
- Replacement requires provider/resource-type semantics plus lifecycle evidence.
- Resource type cannot be omitted from identity.
- Account/Region cannot be silently omitted.
- CloudFormation logical ID cannot substitute for physical identity.
- Service current state cannot retroactively prove historical continuity.
- Type-specific identity adapters must not mutate generic evidence semantics.

## Status ledger

- EC2 identity model tested: FOUND
- S3 identity model tested: FOUND
- Replacement contrast: FOUND
- Generic namespace: SUFFICIENT
- Resource-type-specific mapping: REQUIRED
- Identifier reuse boundary: UNKNOWN unless lifecycle evidence spans gap
- Generic physical-lifecycle contract: CLOSED AT NAMESPACE LEVEL
- Type-specific semantic adapter: REQUIRED
- Universal historical continuity: NOT ESTABLISHED
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

AB105.066R — investigate whether import/adoption of pre-existing resources creates a separate identity/incarnation boundary, because CloudFormation can manage a resource that existed before the stack and therefore LogicalResourceId + PhysicalResourceId cannot automatically imply creation by the current stack.
