# AB105.058R — CloudFormation external audit provenance audit

Date: 2026-09-30
Chain: AB105.057R -> AB105.058R

## Research question

Can CloudTrail / EventBridge independently preserve CloudFormation API activity beyond the CloudFormation event-history boundary, and how must that evidence be joined without replacing the CloudFormation resource-event ledger?

## Primary evidence

AWS states that CloudFormation is integrated with CloudTrail and that CloudTrail records CloudFormation API calls, including console and programmatic API calls. A configured trail can continuously deliver CloudTrail events to S3, providing an ongoing record beyond the default Event History view. citeturn1search0

AWS states that CloudTrail Event history provides a searchable/downloadable record of the past 90 days of management events in a Region. A trail or event data store can provide longer-lived retained evidence depending on its configured storage/retention model. citeturn1search6turn1search13

AWS explicitly warns that CloudTrail log files are not an ordered stack trace of public API calls and do not appear in any specific order. citeturn1search0turn1search2

AWS EventBridge documents CloudFormation events originating from CloudTrail as `AWS API Call via CloudTrail`, while CloudFormation also emits service events to EventBridge. AWS states that AWS service events delivered via CloudTrail are best effort. citeturn1search1

## Findings

### 1. CloudTrail preserves a different evidence class

CloudFormation event APIs describe provider-side stack/resource lifecycle observations.

CloudTrail records API activity: who/what principal made the request, when it occurred, source information, request metadata, response metadata where available, and the CloudFormation API action.

Therefore:

CLOUDFORMATION_EVENT
!=
CLOUDTRAIL_API_CALL

They are complementary evidence classes.

### 2. CloudTrail can establish request provenance without proving resource mutation

A CloudTrail `ExecuteChangeSet` or `UpdateStack` event proves that the API request was made and records its request context.

It does not by itself prove that the requested resource transition completed.

Therefore:

API_CALL_OBSERVED
-> REQUEST_PROVENANCE

but:

API_CALL_OBSERVED
!=
RESOURCE_MUTATION_COMPLETED

### 3. CloudTrail can strengthen the execution boundary

When an ExecuteChangeSet request is preserved in CloudTrail and CloudFormation `DescribeEvents`/`StackEvents` later show a matching operation/resource graph, the combined evidence is stronger than either ledger alone.

The safe join requires explicit correlation fields where available, such as stack/change-set identifiers, client request token, timestamps, and operation context. A timestamp-only join remains bounded correlation, not identity proof.

### 4. CloudTrail's ordering limitation is critical

AWS explicitly says CloudTrail logs are not an ordered stack trace.

Therefore CloudTrail must not be used to invent causal ordering among CloudFormation API calls.

The correct model is an evidence set with timestamps and identities, not a serialized execution trace.

### 5. EventBridge is useful for delivery/automation, not historical completeness by itself

EventBridge can receive CloudFormation events and CloudTrail-originated API-call events. AWS documents CloudTrail-originated service events as best effort.

Therefore EventBridge delivery evidence can corroborate activity but must not automatically be treated as a complete historical ledger unless the configured destination/persistence and delivery semantics establish the required coverage.

### 6. Durable CloudTrail trail evidence can outlive CloudFormation's query boundary

If a trail is configured to deliver CloudFormation API events to S3, those retained logs form an independently stored evidence source whose retention is controlled by the configured storage/lifecycle policy.

This can preserve the fact that an API request occurred even after the CloudFormation API's directly retrievable event history is no longer available.

It still does not automatically preserve every internal CloudFormation resource event.

### 7. CloudTrail is not a substitute for StackEvents/DescribeEvents

CloudTrail can show:
- request provenance;
- caller identity;
- API operation;
- request timing;
- request metadata;
- response metadata where recorded.

CloudFormation event APIs can show:
- operation/resource lifecycle states;
- LogicalResourceId;
- PhysicalResourceId where available;
- resource status and status reason;
- operation-level event classes.

Therefore the ledgers answer different questions.

### 8. The correct reconstruction is a multi-ledger evidence graph

Example:

CloudTrail ExecuteChangeSet
        |
        | request provenance
        v
ChangeSet / ClientRequestToken
        |
        v
CloudFormation OperationId
        |
        +--> ProgressEvent
        +--> Resource P1/P2 events
        +--> Provisioning/Validation error
        |
        v
Outcome / rollback branch

No edge should be created merely because two records have nearby timestamps.

### 9. Missing CloudTrail evidence does not prove the API call never occurred

If no durable trail existed, retention expired, logging was disabled/filtered, or the relevant record is otherwise unavailable, the absence of a CloudTrail event cannot establish that the request never occurred.

Therefore:

NO_CLOUDTRAIL_RECORD
-> UNKNOWN unless coverage is established.

### 10. CloudTrail coverage must be represented explicitly

For each external audit source:

AUDIT_SOURCE = CloudTrail / EventBridge / other
RETENTION = configured / documented
FILTERS = known
DELIVERY = established / unknown
QUERY_COMPLETENESS = complete / partial / unknown
CORRELATION = exact / bounded / unknown

This prevents external evidence from becoming an unqualified authority layer.

## Distilled rule

`CloudTrail API event -> request provenance`

`CloudFormation OperationEvent -> provider lifecycle observation`

`both + exact correlation -> stronger bounded reconstruction`

`CloudTrail API call != resource mutation completion`

`CloudTrail ordering != causal ordering`

`EventBridge delivery != universal historical completeness`

`durable trail evidence can preserve API activity beyond CloudFormation query availability`

`missing external audit record -> UNKNOWN without coverage proof`

## Anti-collapse rules

- CloudTrail API event != CloudFormation resource event.
- ExecuteChangeSet observed != replacement completed.
- UpdateStack observed != resource mutation completed.
- CloudTrail timestamp != causal ordering.
- EventBridge receipt != complete event universe.
- EventBridge best-effort delivery != guaranteed absence when missing.
- Durable CloudTrail API history != durable internal CloudFormation lifecycle history.
- No CloudTrail record != API call never happened without coverage.
- Same timestamp != same operation.
- Similar request metadata != exact operation identity unless provider correlation supports it.

## Status ledger

- CloudTrail integration with CloudFormation: FOUND
- CloudTrail API-call provenance: FOUND
- 90-day Event History boundary: FOUND
- Configured trail as independently retained evidence: FOUND
- CloudTrail ordering limitation: FOUND
- EventBridge CloudFormation/CloudTrail event paths: FOUND
- EventBridge best-effort limitation: FOUND
- Multi-ledger correlation model: ESTABLISHED IN PRINCIPLE
- CloudTrail as proof of resource completion: REJECTED
- EventBridge as universal historical ledger: REJECTED
- Exact cross-ledger correlation for every operation: NOT ESTABLISHED
- Complete internal CloudFormation trace from CloudTrail: NOT ESTABLISHED
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

AB105.059R — investigate the strongest correlation keys across CloudTrail, ChangeSet, DescribeEvents, and StackEvents (request ID, client request token, ChangeSet ARN/name, OperationId, StackId, LogicalResourceId, PhysicalResourceId): build a correlation matrix and explicitly mark which joins are exact, bounded, or UNKNOWN.