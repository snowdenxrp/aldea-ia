# AB105.040R — CloudFormation drift retention/history sequence audit

Date: 2026-09-30
Chain: AB105.039R -> AB105.040R

## Research question

Can repeated CloudFormation drift checks establish a bounded state-transition sequence, and where does that differ from an operation/event ledger?

## Primary evidence

CloudFormation creates a new StackDriftDetectionId each time DetectStackDrift runs. AWS explicitly states that the number of drift results retained for a stack, and how long they are retained, may vary. A completed detection has a Timestamp and stack drift status. Resource drift results expose actual and expected values and LastCheckTimestamp. Resources not checked are omitted from DescribeStackResourceDrifts.

AWS Config GetResourceConfigHistory returns configuration items representing states during a requested interval, subject to the configured retention period; each API call is limited to a seven-day span. AWS Config retention can be 30 days through 7 years, and older ConfigurationItems are deleted according to that retention setting.

## Findings

### 1. Repeated drift checks are observations, not a durable event ledger

Each DetectStackDrift run gets a distinct detection ID. Therefore repeated checks can be represented as separate observation records:

DRIFT_OBSERVATION_1 at T1
DRIFT_OBSERVATION_2 at T2
...
DRIFT_OBSERVATION_n at Tn

This is stronger than treating the current drift status as timeless. However, AWS does not guarantee indefinite retention of every historical drift report. Therefore a missing historical drift report cannot be interpreted as evidence that no prior drift check occurred.

### 2. Repeated observations can establish bounded state intervals, not exact transitions

Suppose:
T1 -> IN_SYNC
T2 -> MODIFIED

The evidence establishes:
- checked properties matched expected state at T1;
- checked properties differed from expected state at T2.

It does NOT establish:
- the exact moment of change;
- how many changes occurred between T1 and T2;
- which operation caused the difference;
- whether the resource passed through intermediate states;
- that no transient drift occurred and was corrected before T2.

Thus repeated drift results support a bounded observation interval:
STATE_AT_T1 = expected
STATE_AT_T2 = modified
INTERMEDIATE_HISTORY = UNKNOWN unless another ledger covers it.

### 3. Reverse transitions are especially important

T1 = MODIFIED
T2 = IN_SYNC

This proves that the resource matched the expected configuration when checked at T2, but does not prove when or how it returned to sync. An external actor, CloudFormation update, automated controller, or another mechanism could have produced the correction. Operation attribution requires independent event evidence.

### 4. Drift retention creates a hard historical boundary

AWS explicitly states that the number and duration of retained CloudFormation drift reports may vary. Therefore:

historical drift report absent
+
no retention/completeness proof
!=
no historical drift check

This is distinct from AWS Config, whose configured retention interval can be used as an explicit evidence boundary. Config retention still does not prove complete real-world history because recorder scope and detection/delivery boundaries remain separate.

### 5. AWS Config can provide a denser state sequence, but only within its own contract

Config history returns CIs representing resource states during an interval. This can strengthen reconstruction between drift observations when identity and coverage align.

A combined sequence can be modeled as:

CFN_DRIFT(T1)
  + CONFIG_STATE(T1..T2)
  + CFN_DRIFT(T2)
  + exact identity
  + coverage/provenance

This can establish a bounded state-consistency interval.

It still cannot automatically establish the exact operation sequence because Config CIs are state observations, not universal operation events.

### 6. Seven-day API span is retrieval mechanics, not seven-day evidence retention

GetResourceConfigHistory limits an individual API call to seven days. AWS Config can retain data much longer. Therefore the seven-day call limit must not be misclassified as a seven-day historical boundary.

## Bounded sequence model

For observations O1 at T1 and O2 at T2:

O1 + O2 + exact identity + valid observation semantics
-> BOUNDED_STATE_CHANGE_OBSERVED

But:

BOUNDED_STATE_CHANGE_OBSERVED
!= EXACT_TRANSITION_TIME
!= OPERATION_CAUSE
!= COMPLETE_INTERMEDIATE_HISTORY

If Config covers the interval with sufficient recorder/delivery/retention guarantees, the intermediate state sequence can be strengthened, but only to the granularity actually recorded.

## Anti-collapse rules

- DriftDetectionId != operation ID.
- DriftDetectionId != CloudTrail requestID by assumption.
- Drift result != CloudFormation update event.
- Repeated drift checks != event ledger.
- T1 IN_SYNC + T2 MODIFIED != exact transition at T2.
- T1 MODIFIED + T2 IN_SYNC != proof of the correcting operation.
- Missing retained drift report != no historical drift check.
- Current drift status != complete drift history.
- Config CI sequence != exact operation sequence.
- Config seven-day API span != seven-day retention boundary.
- Multiple CIs != multiple operations.
- Observation ordering != causal ordering.
- State agreement != operation attribution.

## New distilled rule

ordered drift observations + exact identity + observation timestamps -> BOUNDED_STATE_OBSERVATION_SEQUENCE

drift sequence + sufficiently covered Config state history -> BOUNDED_CROSS_LEDGER_STATE_SEQUENCE

Neither implies an exact event/operation ledger unless separately supported by event evidence.

## Status ledger

- New drift ID per detection run: FOUND
- Variable CloudFormation drift-result retention: FOUND
- Drift timestamp/LastCheckTimestamp semantics: FOUND
- Unchecked resources omitted: FOUND
- Repeated observations as bounded sequence: ESTABLISHED IN PRINCIPLE
- Exact transition time from drift observations: REJECTED
- Operation causality from drift sequence: REJECTED
- Complete historical drift ledger: NOT ESTABLISHED
- Config history as complementary state evidence: ESTABLISHED IN PRINCIPLE
- Config seven-day retrieval limit distinguished from retention: FOUND
- Universal drift-to-event closure: NOT ESTABLISHED
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

AB105.041R — investigate CloudFormation drift detection request/operation identity against CloudTrail: determine what, if anything, binds a drift detection invocation to its CloudTrail record, and keep drift observation identity separate from the resource-changing operation identity.
