# AB105.071R — post-closure dependency audit: drift as observation, not lifecycle proof

Date: 2026-09-30
Chain: AB105.070R -> AB105.071R

## Objective

After closing the generic physical-incarnation branch, identify the next unresolved evidence-layer dependency without reopening the closed taxonomy.

## Fresh primary evidence

CloudFormation drift detection compares a resource's current configuration with its expected template configuration. A resource can be DRIFTED, MODIFIED, DELETED, or IN_SYNC; unsupported resources can be NOT_CHECKED. AWS also documents edge cases where drift results may not be accurate. citeturn0search0turn0search1

Each DetectStackDrift execution receives a new StackDriftDetectionId, and AWS states the number and duration of retained drift results may vary. citeturn0search1

CloudFormation DescribeEvents groups events by OperationId, while StackEvent also exposes OperationId, ClientRequestToken, LogicalResourceId, PhysicalResourceId and ResourceStatus. citeturn0search2turn0search3

AWS documents resolving drift through import as a way to retain an existing physical resource rather than replace it, confirming that a drift observation and a management transition can coexist without a physical-incarnation transition. citeturn0search5

## Dependency identified

The remaining evidence-layer dependency is not another physical edge.

It is the **claim-specific evidence contract for configuration state**:

CONFIGURATION_OBSERVED
vs
CONFIGURATION_CHANGED
vs
CONFIGURATION_DRIFTED
vs
PHYSICAL_LIFECYCLE_CHANGED.

These are distinct claims and must not collapse.

## Required separation

1. DRIFTED proves a difference between expected and observed configuration at the detection scope.
2. DRIFTED does not by itself identify when the change occurred.
3. DRIFTED does not by itself identify who/what caused the change.
4. DRIFTED does not by itself prove a physical incarnation transition.
5. IN_SYNC is a current comparison result, not proof that no historical change occurred.
6. NOT_CHECKED is not evidence of IN_SYNC.
7. DELETED in drift results is a configuration/state observation, not automatically a CloudFormation deletion-cause record.
8. StackDriftDetectionId identifies the detection result, not the underlying configuration-changing operation.
9. Retention of drift results is itself a coverage dimension.
10. Unsupported/unobservable properties create explicit evidence boundaries.

## Evidence graph

Expected configuration
    |
    v
DRIFT DETECTION
    |
    +--> CURRENT_CONFIGURATION_OBSERVATION
    |
    +--> DRIFT_STATUS
    |
    +--> PROPERTY_DIFFERENCES

Independent lifecycle graph:
OperationId / StackEvent
    |
    +--> CREATE / UPDATE / DELETE / ROLLBACK / IMPORT
    |
    +--> PhysicalResourceId when present

Independent external-service graph:
service read / service audit evidence
    |
    +--> current physical state
    +--> type-specific identifiers

No graph may silently manufacture edges into another graph.

## Coverage contract

A configuration-state claim should carry:

ACCOUNT
REGION
STACK_ID
LOGICAL_RESOURCE_ID
RESOURCE_TYPE
DETECTION_ID
OBSERVED_AT
EXPECTED_CONFIGURATION_SCOPE
ACTUAL_CONFIGURATION_SCOPE
SUPPORTED_PROPERTIES
UNOBSERVABLE_PROPERTIES
DRIFT_RESULT
RETENTION_BOUNDARY
PAGINATION_COMPLETE
CORRELATION_EDGES
FINAL_EVIDENCE_STATE

Allowed final states:

PROVEN_WITHIN_SCOPE
BOUNDED_OBSERVATION
PARTIAL
UNKNOWN

## Closure boundary

The physical-incarnation branch remains CLOSED.

This node opens a separate configuration-evidence branch only.

No new physical edge is introduced.

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

AB105.072R — adversarial counterexample pass for configuration/drift evidence: test false inferences of CHANGE, CAUSE, CONTINUITY, and NO-CHANGE from DRIFTED/IN_SYNC/NOT_CHECKED/DELETED results, then close the branch if no new generic edge is required.
