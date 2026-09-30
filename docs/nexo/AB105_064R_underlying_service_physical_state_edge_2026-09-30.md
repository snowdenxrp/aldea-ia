# AB105.064R — underlying service physical-state edge and minimum cross-ledger identity

Date: 2026-09-30
Chain: AB105.063R -> AB105.064R

## Research question

Determine whether an underlying AWS resource-service/Cloud Control read can upgrade a CloudFormation UNKNOWN physical-state claim, and what minimum identity binding is required.

## Primary evidence

AWS Cloud Control API defines a primary identifier for each resource type. The primary identifier must be unique for that resource type in an AWS account and Region; some types also define secondary identifiers. citeturn0search0

Cloud Control API GetResource returns the current state of an existing resource identified by its primary or supported secondary identifier, and this works for resources regardless of whether they were provisioned through Cloud Control API. citeturn0search1turn0search2

Cloud Control ListResources can discover currently provisioned resources of a resource type, including resources created directly by the underlying service or through CloudFormation. citeturn0search5

CloudFormation defines Physical ID as the actual assigned name/identifier of a resource and gives examples such as an EC2 InstanceId. Physical IDs can be used to identify resources outside CloudFormation after creation. citeturn0search9

## Findings

### 1. A current underlying-service read is a state observation, not historical proof

GetResource/ListResources can establish a current-state observation for an identified resource.

They do not by themselves prove when it was created, that it is the same incarnation observed by an old CloudFormation event, that it existed continuously, or that an absent resource was never present.

Therefore:

CURRENT_SERVICE_PRESENT -> bounded present-state evidence

CURRENT_SERVICE_ABSENT -> not automatically historical nonexistence.

### 2. Resource type is mandatory for identity interpretation

A raw identifier such as a name or ID is insufficient as a universal identity.

Minimum identity namespace:

ACCOUNT + REGION + RESOURCE_TYPE + PRIMARY_IDENTIFIER

For CloudFormation linkage, add:

STACK_ID + LOGICAL_RESOURCE_ID + OPERATION_ID + PHYSICAL_RESOURCE_ID

where available.

### 3. PrimaryIdentifier is stronger than arbitrary resource properties

AWS states that primary identifiers are defined by the resource type schema and are unique within account/Region for that type.

Therefore a service-state read using the documented primary identifier is stronger than matching resource name, ARN substring, timestamp, configuration similarity, or logical resource name.

Uniqueness remains scoped; it is not a universal global identity across account/Region/type boundaries.

### 4. Minimum bridge from CloudFormation to service state

To upgrade UNKNOWN_PHYSICAL_STATE to BOUNDED_CURRENT_PRESENT, require:

CF PhysicalResourceId
+ CF ResourceType
+ Account
+ Region
+ documented mapping to service/Cloud Control primary identifier
+ successful current-state read

If PhysicalResourceId is not the service primary identifier, an explicit provider/resource-type mapping is required.

### 5. Present-state proof does not prove incarnation continuity

CF event at T1 -> P_old plus current service read at T2 -> P_old exists supports:

P_old OBSERVED_AT_T1
P_old PRESENT_AT_T2

It does not prove continuous existence over (T1,T2) without an additional continuity ledger.

### 6. Current absence is similarly bounded

CF event at T1 -> P_old plus current service read at T2 -> not found supports:

P_old NOT_FOUND_AT_T2

It does not prove deletion time, deletion cause, absence of recreation, or universal historical nonexistence.

### 7. Retained resources can remain positively observable

If CloudFormation removes a resource from managed scope but the underlying service still identifies it, a current service read can establish:

OUTSIDE_CF_SCOPE + CURRENTLY_PRESENT

This is not contradictory; the two ledgers describe different state dimensions.

### 8. Deletion requires a stronger contract than presence

For "P_old was physically deleted", require:

1. prior positive identity P_old,
2. deletion operation/event evidence,
3. service-level deletion outcome or durable service evidence,
4. post-delete state observation,
5. no unresolved replacement/recreation identity conflict.

A single GetResource NOT_FOUND is insufficient for the historical claim.

### 9. Cloud Control operation identifiers do not automatically bridge to CloudFormation OperationId

Cloud Control has its own request-token/operation model. No universal equality with CloudFormation OperationId was established by this research.

Therefore:

CF OperationId == Cloud Control RequestToken -> UNKNOWN unless explicitly co-recorded/documented.

Temporal proximity is not an identity bridge.

## Claim upgrade matrix

| Claim | Evidence | Result |
|---|---|---|
| Resource currently exists | Type + scoped primary ID + successful GetResource | BOUNDED_CURRENT_PRESENT |
| Resource currently absent | Type + scoped primary ID + not-found result | BOUNDED_CURRENT_NOT_FOUND |
| CF-managed resource currently exists | CF PhysicalResourceId + documented mapping + service read | BOUNDED_CF_TO_SERVICE_PRESENT |
| CF retained resource still exists | Retain evidence + service read | BOUNDED_OUTSIDE_CF_SCOPE_PRESENT |
| Resource existed continuously | old CF identity + current service presence | UNKNOWN without continuity ledger |
| Resource was physically deleted | CF delete + current absence | UNKNOWN unless stronger deletion evidence exists |
| Resource was never recreated | current absence/presence alone | UNKNOWN |
| CF and Cloud Control operations are same operation | temporal proximity | UNKNOWN |
| Exact incarnation bridge | scoped identifier + provider semantics + lifecycle evidence | BOUNDED when all edges present |

## Distilled rule

The underlying service can upgrade a claim about current physical state, but not automatically a claim about historical continuity or deletion.

Minimum cross-ledger identity:

ACCOUNT + REGION + RESOURCE_TYPE + SERVICE_PRIMARY_IDENTIFIER

plus the CloudFormation-to-service mapping from PhysicalResourceId when the identifiers differ.

Historical claims require an evidence graph spanning the relevant interval.

## Anti-collapse rules

- Current presence != continuous existence.
- Current absence != historical deletion.
- PrimaryIdentifier uniqueness is scoped, not global.
- PhysicalResourceId != automatically every service's primary identifier.
- LogicalResourceId != service identity.
- CloudFormation OperationId != Cloud Control request token without an explicit bridge.
- Retained outside CF scope != deleted.
- A service read cannot retroactively prove an event's cause.
- Never infer identity from temporal proximity alone.

## Status ledger

- Underlying current-state read capability: FOUND
- Primary identifier semantics: FOUND
- Cross-ledger minimum identity: ESTABLISHED
- Current present/absent bounded claims: ESTABLISHED
- Historical continuity proof from current read alone: NOT ESTABLISHED
- Historical deletion proof from current absence alone: NOT ESTABLISHED
- Universal CF to Cloud Control operation bridge: NOT ESTABLISHED
- Physical lifecycle closure: PARTIAL; current-state edge established, historical continuity remains claim-dependent
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

AB105.065R — test the cross-ledger identity contract against concrete resource types with different identity models, including EC2 InstanceId versus S3 bucket name, identifier reuse and replacement, then decide whether the generic contract is sufficient or must remain resource-type-specific.
