# AB105.054R — CloudFormation StackEvents ordering and parallel resource-path audit

Date: 2026-09-30
Chain: AB105.053R -> AB105.054R

## Research question

What ordering guarantees exist for CloudFormation StackEvents, and what cannot be inferred when independent resource branches interleave?

## Primary evidence

DescribeStackEvents returns stack events in reverse chronological order. StackEvent has a Timestamp, EventId, ClientRequestToken, and optional OperationId. AWS states that all events triggered by a given stack operation receive the same ClientRequestToken, and OperationId uniquely identifies the operation that generated the event. AWS also documents OperationId as the unique identifier of the operation that generated the event. 

AWS's current DescribeEvents API groups events by OperationId and describes an operation as a discrete change attempt; returned event types include progress events, validation errors, and provisioning errors.

AWS's stack-event documentation shows concrete resource paths whose events interleave across different LogicalResourceIds while sharing the same ClientRequestToken. It also shows CREATE_IN_PROGRESS events where PhysicalResourceId is initially empty and later populated.

## Findings

### 1. Retrieval order is chronological ordering of returned events, not a causal theorem

DescribeStackEvents returns events in reverse chronological order. This supports ordering observations by the provider's Timestamp for the returned records.

It does not establish that timestamp order is a complete causal order among independent resource branches.

Therefore:

returned reverse-chronological order -> ORDERED_OBSERVATIONS

but not:

timestamp order -> UNIVERSAL_CAUSAL_ORDER.

### 2. ClientRequestToken provides operation grouping, not intra-operation causality

All events from a stack operation share the ClientRequestToken.

This establishes:

same token + same stack -> SAME_CLOUDFORMATION_OPERATION_GROUP

It does not establish which resource event caused another resource event.

### 3. OperationId is stronger operation identity

OperationId is explicitly the unique identifier of the operation that generated the event.

Therefore it is a stronger grouping key than timestamp or logical-resource grouping.

Still:

OperationId != event order
OperationId != resource incarnation
OperationId != causal edge between sibling resources.

### 4. Independent resource branches can interleave

CloudFormation can emit events for different LogicalResourceIds in overlapping execution windows. The documented event stream therefore represents an operation-wide event set, not a single linear resource execution trace.

Example abstractly:

A CREATE_IN_PROGRESS
B CREATE_IN_PROGRESS
A CREATE_COMPLETE
B CREATE_COMPLETE

The ordering proves these observations occurred in that sequence according to the recorded timestamps, but does not prove that A caused B, B caused A, or that there were no unrecorded provider-internal steps between them.

### 5. Same LogicalResourceId does not eliminate parallel-branch ambiguity across operations

A LogicalResourceId can recur across separate stack operations. OperationId or ClientRequestToken is required to avoid collapsing events from different operations.

Thus:

LogicalResourceId + timestamp != unique operation identity.

### 6. Empty PhysicalResourceId is a real boundary

AWS's own event example shows a CREATE_IN_PROGRESS event with an empty PhysicalResourceId followed by later events with a populated physical ID.

Therefore an early empty identity must be represented as:

PHYSICAL_ID = UNKNOWN / NOT_YET_BOUND

not:

NO_PHYSICAL_RESOURCE.

This directly reinforces AB105.050R.

### 7. Timestamp gaps cannot prove absence of work

Even with ordered timestamps, a gap between events does not prove that no resource/provider work occurred inside the interval.

The evidence supports observed event boundaries, not a complete trace of all internal actions.

### 8. Cross-operation ordering must not be inferred from timestamp alone

OperationId and ClientRequestToken provide operation boundaries. If two operations have overlapping or nearby timestamps, timestamp order alone is insufficient to establish a causal relationship between them.

A causal cross-operation claim requires an independent provider relation.

## Event graph model

For each operation:

OperationId
  |
  +-- Event A (resource A, t1)
  +-- Event B (resource B, t2)
  +-- Event C (resource A, t3)
  +-- Event D (resource B, t4)

The valid reconstruction is a partially ordered observation graph.

Within one resource/incarnation path, compatible state transitions can form a bounded sequence.

Across sibling resources, do not create causal edges solely from timestamp order.

## Distilled rule

OperationId/ClientRequestToken + event identity -> BOUNDED_OPERATION_GROUP

Timestamp + retrieval ordering -> ORDERED_EVENT_OBSERVATIONS

same resource + compatible status sequence + identity -> BOUNDED_RESOURCE_STATE_SEQUENCE

parallel resources + timestamp order only -> NO_CAUSAL_EDGE

empty PhysicalResourceId -> IDENTITY_UNKNOWN/NOT_YET_BOUND

timestamp gap -> NOT_PROOF_OF_NO_INTERMEDIATE_WORK

cross-operation timestamp ordering -> NO_CAUSALITY without provider relation

## Anti-collapse rules

- Reverse chronological API order != causal order.
- Timestamp != universal causal order.
- ClientRequestToken != causal edge.
- OperationId != event identity.
- OperationId != resource incarnation.
- EventId != operation identity.
- LogicalResourceId != operation identity.
- Empty PhysicalResourceId != no physical resource.
- Event gap != no hidden/provider work.
- Sibling event order != sibling causality.
- Same timestamp order != same causal chain.
- Different operations with nearby timestamps != causally related operations.
- Complete returned event list != complete internal execution trace.

## Status ledger

- Reverse chronological retrieval semantics: FOUND
- OperationId uniqueness: FOUND
- ClientRequestToken operation grouping: FOUND
- Interleaved resource event streams: FOUND
- Empty PhysicalResourceId boundary: FOUND
- Ordered observation sequence: ESTABLISHED IN PRINCIPLE
- Per-resource bounded sequence: ESTABLISHED IN PRINCIPLE
- Universal causal ordering: REJECTED
- Complete internal execution trace: NOT ESTABLISHED
- Cross-resource causal inference from timestamp: REJECTED
- Cross-operation causal inference from timestamp: REJECTED
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

AB105.055R — investigate the newer CloudFormation DescribeEvents operation-centric ledger: determine whether OperationEvent/ProgressEvent/ProvisioningError/ValidationError provides a stronger operation graph than StackEvents, and what identity/ordering gaps remain between the two ledgers.