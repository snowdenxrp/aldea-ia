# AB105.073R — configuration evidence normative contract and branch closeout

Date: 2026-09-30
Chain: AB105.072R -> AB105.073R

## Objective

Distill the adversarially tested configuration/drift evidence branch into a compact normative contract and close it without expanding the generic lifecycle taxonomy.

## Fresh primary evidence

CloudFormation drift compares actual configuration against expected template configuration, checks only explicitly defined properties, and can operate on all supported resources or a filtered set of logical resource IDs. citeturn0search0turn0search2

A drift detection run receives a new StackDriftDetectionId; retention count and duration may vary. DETECTION_COMPLETE means all resources in scope that support drift detection completed, while filtered runs and unsupported resources limit the scope. citeturn0search1

DescribeStackResourceDrifts returns only resources checked for drift; unsupported or not-yet-checked resources are not included, and pagination is explicit through NextToken. citeturn0search3

A resource can move from DRIFTED back to IN_SYNC after its configuration is restored, demonstrating that IN_SYNC is a current comparison result rather than proof of no historical change. citeturn0search9

## Normative configuration contract

### Identity

Required scope:

ACCOUNT
REGION
STACK_ID
RESOURCE_TYPE
LOGICAL_RESOURCE_ID

Optional physical context:

PHYSICAL_RESOURCE_ID
SERVICE_PRIMARY_IDENTIFIER

Observation identity:

STACK_DRIFT_DETECTION_ID
OBSERVED_AT

### Configuration dimensions

EXPECTED_CONFIGURATION_SCOPE
ACTUAL_CONFIGURATION_SCOPE
CHECKED_PROPERTIES
UNSUPPORTED_PROPERTIES
UNOBSERVABLE_PROPERTIES
DRIFT_STATUS

### Execution and coverage

DETECTION_STATUS
FILTER_SCOPE
PAGINATION_COMPLETE
RETENTION_BOUNDARY
COVERAGE_SCOPE
CORRELATION_EDGES

## Normative states

CONFIGURATION_MATCH
CONFIGURATION_DIFFERENCE
CONFIGURATION_DELETION_OBSERVED
NOT_OBSERVED
DETECTION_FAILED
PARTIAL
UNKNOWN

These states describe configuration evidence only.

## Decision rules

1. DRIFTED/MODIFIED -> configuration differs at observation time; do not infer change time.
2. DRIFTED/MODIFIED -> cause UNKNOWN unless independently correlated.
3. IN_SYNC -> current checked configuration matches expected configuration; do not infer historical absence of change.
4. NOT_CHECKED/UNSUPPORTED -> no negative drift claim.
5. UNKNOWN -> preserve UNKNOWN.
6. DELETED -> resource is absent relative to expected configuration; actor/cause remains UNKNOWN.
7. Detection completion -> complete only within the declared detection scope.
8. Filtered detection -> claims are limited to the selected resources.
9. NextToken=null -> query pagination exhausted, not historical completeness.
10. StackDriftDetectionId -> observation identity, not lifecycle operation identity.
11. Checked properties -> not necessarily the full service configuration.
12. Drift evidence -> does not create PHYSICAL_CREATION, PHYSICAL_REPLACEMENT, or PHYSICAL_DELETION edges.

## Anti-collapse invariants

DRIFT != CHANGE_EVENT
DRIFT != CAUSE
IN_SYNC != NEVER_CHANGED
NOT_CHECKED != NO_DRIFT
UNKNOWN != IN_SYNC
DELETED_DRIFT != DELETION_CAUSE_PROOF
MODIFIED != REPLACEMENT
DETECTION_COMPLETE != HISTORICAL_COMPLETENESS
FILTERED_COMPLETE != GLOBAL_COMPLETE
DETECTION_ID != LIFECYCLE_OPERATION_ID
QUERY_COMPLETE != HISTORY_COMPLETE
CONFIGURATION_OBSERVATION != PHYSICAL_LIFECYCLE

## Closure

CONFIGURATION_DRIFT_GENERIC_BRANCH = CLOSED

No new generic edge is required.

Remaining dependencies are explicit:
- type/resource support;
- checked-property scope;
- historical retention;
- detection coverage;
- causal correlation;
- independent service/lifecycle evidence.

The branch must not be reopened unless new primary evidence produces a counterexample to this contract.

## Audit checkpoint recommendation

The two consecutive branches now closed are:
1. Generic physical incarnation (AB105.070R)
2. Configuration/drift evidence (AB105.073R)

This is sufficient to trigger the previously planned integration audit checkpoint before opening another broad dependency branch.

Audit objective:
- verify no contradictions between the two closed contracts;
- verify no semantic collapse between configuration and physical lifecycle;
- verify historical UNKNOWN/PENDING carry-forward;
- verify branch closure and next dependency pointer;
- detect duplicates or missing persisted nodes.

The audit is a consistency audit, not a new research branch.

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

GLOBAL INTEGRATION AUDIT CHECKPOINT — audit AB105.070R and AB105.073R together, without reopening either branch unless an actual contradiction is found.
