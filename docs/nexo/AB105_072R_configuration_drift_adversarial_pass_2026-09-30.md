# AB105.072R — adversarial counterexample pass for configuration/drift evidence

Date: 2026-09-30
Chain: AB105.071R -> AB105.072R

## Objective

Test whether DRIFTED, IN_SYNC, NOT_CHECKED, UNKNOWN, MODIFIED and DELETED can be safely mapped to stronger claims of change, cause, continuity, or non-change.

## Primary evidence

AWS defines drift as a comparison between actual and expected configuration. Resource statuses include DELETED, MODIFIED, NOT_CHECKED, IN_SYNC, UNKNOWN and UNSUPPORTED. Only explicitly defined template properties are checked. citeturn0search0turn0search3turn0search4

A drift detection run receives a new StackDriftDetectionId; AWS states retained drift results and their retention duration may vary. Filters can limit which logical resources are checked, and DETECTION_FAILED can leave partial results. citeturn0search1

DescribeStackResourceDrifts is paginated; NextToken means more results remain. citeturn0search9

## Counterexamples

### D1 — DRIFTED mistaken for "changed now"

DRIFTED only establishes that actual configuration differs from expected at the detection observation. It does not establish the transition time.

Result: BOUNDED_CONFIGURATION_DIFFERENCE.

### D2 — DRIFTED mistaken for external/manual cause

DRIFTED identifies a difference, not who or what caused it.

Result: CAUSE = UNKNOWN unless an independent causal ledger binds the change.

### D3 — IN_SYNC mistaken for "never changed"

IN_SYNC means the current checked configuration matches expected configuration.

A prior change followed by restoration can end IN_SYNC.

Result: CURRENT_CONFIGURATION_MATCH only.

### D4 — NOT_CHECKED mistaken for "no drift"

NOT_CHECKED means CloudFormation did not check the resource. Unsupported resources can remain outside the check.

Result: UNKNOWN / NOT_OBSERVED.

### D5 — UNKNOWN mistaken for IN_SYNC

AWS explicitly permits UNKNOWN when CloudFormation could not run drift detection for a resource.

Result: UNKNOWN.

### D6 — DELETED mistaken for "CloudFormation deleted it"

DELETED means the actual resource differs from expected because it has been deleted.

It does not, by itself, identify the deleting actor, operation, or causal event.

Result: CONFIGURATION_DELETION_OBSERVED; CAUSE = UNKNOWN.

### D7 — MODIFIED mistaken for physical replacement

MODIFIED means one or more checked properties differ from expected.

Result: CONFIGURATION_DIFFERENCE; physical incarnation = UNKNOWN unless lifecycle evidence independently establishes replacement.

### D8 — successful detection mistaken for universal coverage

DETECTION_COMPLETE covers resources that support drift detection; filtered runs can intentionally check only selected logical IDs.

Result: BOUNDED scope, never universal historical coverage.

### D9 — empty filtered result mistaken for "no drift anywhere"

A filtered detection can exclude resources.

Result: NO_DRIFT_WITHIN_QUERY_SCOPE only.

### D10 — one drift detection ID mistaken for persistent historical ledger

Each run receives a new detection ID, and AWS says retained results/retention duration may vary.

Result: detection IDs identify observations, not an eternal history.

### D11 — NextToken=null mistaken for historical completeness

Pagination exhaustion means the query returned all results for that query, not that all historical drift observations ever existed.

Result: QUERY_COMPLETE, HISTORY_COMPLETE = UNKNOWN.

### D12 — only explicitly tracked properties treated as full resource configuration

AWS states drift detection checks properties explicitly set in the template/parameters and has unsupported-resource boundaries.

Result: CONFIGURATION_SCOPE_LIMITED.

## Adversarial result

All twelve false inferences are rejected by the existing configuration evidence model.

No new generic edge is required.

The necessary dimensions are:

1. expected configuration;
2. observed configuration;
3. detection scope;
4. detection execution status;
5. observation identity;
6. coverage/retention;
7. independent causal/lifecycle correlation.

## Closure

CONFIGURATION_DRIFT_GENERIC_BRANCH = CLOSED_WITH_BOUNDED_UNKNOWN

No new generic lifecycle edge is introduced.

The branch is sufficient to distinguish:
CONFIGURATION_DIFFERENCE
CONFIGURATION_MATCH
NOT_OBSERVED
DETECTION_FAILURE
DELETION_OBSERVATION
from:
PHYSICAL_LIFECYCLE
CAUSE
HISTORICAL_CONTINUITY.

## Minimal invariants

DRIFTED != CHANGE_TIME
DRIFTED != CAUSE
IN_SYNC != NEVER_CHANGED
NOT_CHECKED != NO_DRIFT
UNKNOWN != IN_SYNC
DELETED != CAUSAL_DELETION_PROOF
MODIFIED != REPLACEMENT
DETECTION_COMPLETE != UNIVERSAL_HISTORY
FILTERED_EMPTY != GLOBAL_EMPTY
DETECTION_ID != LIFECYCLE_OPERATION_ID
QUERY_COMPLETE != HISTORY_COMPLETE
CHECKED_PROPERTIES != FULL_RESOURCE_HISTORY

## Status ledger

- False CHANGE inference: PASSED
- False CAUSE inference: PASSED
- False CONTINUITY inference: PASSED
- False NO-CHANGE inference: PASSED
- False PHYSICAL-REPLACEMENT inference: PASSED
- Generic configuration/drift edge set: CLOSED
- Coverage boundary: EXPLICIT
- Causal correlation: EXTERNAL EVIDENCE REQUIRED
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

AB105.073R — closeout/contract distillation for the configuration evidence branch, then reassess whether the planned audit checkpoint has enough closed branches to be useful.
