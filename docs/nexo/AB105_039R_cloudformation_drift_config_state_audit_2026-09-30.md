# AB105.039R — CloudFormation Drift Detection and AWS Config state audit

Date: 2026-09-30
Chain: AB105.038R -> AB105.039R

## Research question

Can CloudFormation drift detection independently strengthen cross-ledger state binding with AWS Config, while keeping expected-template state, provider-observed state, and real-world state separate?

## Primary evidence

CloudFormation drift detection compares a resource's current configuration with the expected configuration defined by the CloudFormation template and template parameters. Resource drift statuses include IN_SYNC, MODIFIED, DELETED, NOT_CHECKED, UNKNOWN and UNSUPPORTED. Drift detection only checks explicitly defined properties and resources that support drift detection. AWS also exposes LastCheckTimestamp and warns that drift results can be stale if the check predates the resource result.

AWS Config ConfigurationItems are point-in-time observations of recorded resource configuration. AWS Config has its own recorder scope, detection and retention boundaries established in earlier AB105 nodes.

## Findings

### 1. Drift is an expected-vs-current comparison, not an independent event ledger

CloudFormation drift can establish:
EXPECTED_CONFIGURATION = template/parameter-defined values
CURRENT_OBSERVED_CONFIGURATION = values observed by CloudFormation at drift-check time

It does not by itself identify the operation that produced a difference.

Therefore:
DRIFTED != OPERATION_IDENTIFIED
MODIFIED != CLOUDTRAIL_EVENT_IDENTIFIED
IN_SYNC != NO_EXTERNAL_CHANGES_EVER

### 2. Drift can strengthen cross-ledger state binding when identities and observation times align

If CloudFormation and Config refer to the same resource identity, and both observations are temporally compatible, drift results can add an independent expected-vs-current comparison.

A bounded relation is:

CloudFormation expected state
+
CloudFormation drift observation
+
Config resource identity/state observation
+
compatible observation times
+
coverage/provenance
-> BOUNDED_EXPECTED_VS_OBSERVED_STATE_BINDING

This still does not prove which system changed the resource or complete historical causality.

### 3. IN_SYNC has a narrow meaning

AWS defines IN_SYNC as the actual configuration matching the expected template configuration for the checked properties. It is not evidence that no changes occurred historically, because an external modification can be followed by a later correction back to expected state.

Therefore:
IN_SYNC at T = checked properties matched expected values at the drift observation boundary.
It is not:
NO_EXTERNAL_CHANGE_DURING_PRIOR_INTERVAL.

### 4. DRIFTED is not causal attribution

A DRIFTED or MODIFIED result means current observed properties differ from expected template values. AWS describes external changes as a source of drift, but the drift result itself does not establish a particular actor, API request, or external system as the cause.

CloudTrail, StackEvents, or other provider evidence remains necessary for operation attribution.

### 5. NOT_CHECKED, UNKNOWN and UNSUPPORTED are evidence boundaries

CloudFormation explicitly reports cases where drift was not checked or could not be checked, including unsupported resources. A missing drift record cannot be interpreted as IN_SYNC.

The number and duration of retained drift reports can also vary, creating a retention boundary.

### 6. Nested stacks require separate drift checks

CloudFormation states that drift detection on a parent stack does not detect drift on nested stacks; the nested stack must be checked directly. Therefore a parent-stack IN_SYNC result cannot be generalized to all nested-stack descendants.

### 7. AWS Config adds an independent observation axis

Config observes current configuration under its recorder contract. CloudFormation drift compares against the CloudFormation template contract. Agreement can strengthen state consistency; disagreement can expose a cross-ledger mismatch.

But:
Config current state != CloudFormation expected state
CloudFormation expected state != complete real-world historical state
CloudFormation drift result != complete Config history

## Evidence ladder

EXPECTED_TEMPLATE_STATE
-> CLOUDFORMATION_DRIFT_OBSERVATION
-> CONFIG_RESOURCE_STATE_OBSERVATION
-> EXACT_IDENTITY_BINDING
-> TEMPORAL_COMPATIBILITY
-> BOUNDED_EXPECTED_VS_OBSERVED_STATE_BINDING

This does not upgrade to historical causal closure.

## State distinctions

- EXPECTED_STATE: template/parameter-defined desired configuration.
- CFN_OBSERVED_STATE: configuration observed by CloudFormation during drift detection.
- CONFIG_OBSERVED_STATE: configuration captured by AWS Config under its recorder contract.
- REAL_WORLD_STATE: actual resource state, only bounded by provider observation semantics.
- HISTORICAL_OPERATION_CAUSE: which operation/actor produced a transition; requires separate event evidence.

## Anti-collapse rules

- DRIFTED != operation identified.
- MODIFIED != CloudTrail event identified.
- IN_SYNC != no historical external change.
- IN_SYNC != complete history.
- NOT_CHECKED != IN_SYNC.
- UNKNOWN != IN_SYNC.
- UNSUPPORTED != unchanged.
- Parent-stack drift result != nested-stack drift result.
- Drift timestamp != resource-change timestamp.
- Config CI != CloudFormation expected configuration.
- Config observation != CloudFormation causation.
- Agreement between two current observations != historical causal proof.
- Drift evidence != complete lifecycle history.
- Missing drift report != no drift.

## New distilled rule

expected-template provenance + current CloudFormation drift observation + exact resource identity + compatible Config observation + coverage/provenance -> BOUNDED_EXPECTED_VS_OBSERVED_STATE_BINDING

IN_SYNC -> only checked properties match at observation boundary

DRIFTED/MODIFIED -> mismatch evidenced, cause remains UNKNOWN unless separately bound

NOT_CHECKED/UNKNOWN/UNSUPPORTED/missing coverage -> UNKNOWN

## Status ledger

- CloudFormation expected-vs-actual drift semantics: FOUND
- Resource drift statuses and boundaries: FOUND
- Staleness/LastCheckTimestamp boundary: FOUND
- Nested-stack independent drift requirement: FOUND
- Drift result as operation attribution: REJECTED
- IN_SYNC as historical no-change proof: REJECTED
- Drift + Config bounded state binding: ESTABLISHED IN PRINCIPLE
- Universal drift-to-event causal bridge: NOT ESTABLISHED
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

AB105.040R — investigate CloudFormation drift result retention/history boundaries and whether repeated drift checks can establish a bounded state-transition sequence, explicitly separating repeated observations from an operation/event ledger.
