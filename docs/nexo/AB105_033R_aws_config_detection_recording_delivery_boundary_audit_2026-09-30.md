# AB105.033R — AWS Config detection, recording, delivery boundary audit
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

Can the evidence distinguish:
1. underlying change not yet recorded,
2. recorder unable to obtain configuration,
3. change recorded later,
4. related-resource CI effects,
5. genuinely no qualifying change detected?

## Primary AWS evidence

AWS Config states that it usually records changes after detection, but recording is best-effort and can take longer. AWS also documents resource types with known delays; the list is non-exhaustive. citeturn0search1turn1search2

A ConfigurationItem contains configurationItemCaptureTime, optional configurationItemDeliveryTime, configurationItemStatus, recordingFrequency, relationships, and related CloudTrail event IDs. The delivery-time field is not guaranteed and is omitted for continuous recording. citeturn1search1

AWS Config exposes a CloudWatch metric for Configuration Recorder Insufficient Permissions Failure. AWS describes this as failed permission access attempts for configuration recorders whose IAM role lacks required permissions. citeturn1search0

AWS documents that configuration items can be generated for multiple resources when resources are related; one resource change can therefore produce multiple CIs. citeturn0search3

AWS documents that changing recording frequency or stopping recording a resource type leaves previously recorded CIs unchanged. citeturn1search7

## Findings

### F1 — Capture time is not underlying operation time

configurationItemCaptureTime is the time recording of the configuration change was initiated for the resource. It is not a provider-independent timestamp proving when the underlying operation occurred.

Therefore:
CI capture time != operation causal time.

For continuous recording, configurationItemDeliveryTime is omitted because the CI is available immediately; for daily recording it is populated. citeturn1search1

### F2 — Late recording must remain a temporal UNKNOWN until bounded

Because AWS explicitly says recording can take longer than expected, absence of a CI immediately after an external change cannot be treated as negative evidence. citeturn0search1turn1search2

A later CI can convert the state from NOT_YET_OBSERVED to CHANGE_EVIDENCED, but it does not retroactively establish that the earlier observation window was complete unless the resource-type recording semantics and coverage support that claim.

### F3 — Permission failure is a distinct evidence state

A permission-failure metric establishes that AWS Config experienced failed access attempts due to insufficient IAM permissions. citeturn1search0

Therefore a period containing unresolved recorder-permission failure cannot be silently classified as NO_RECORDED_CHANGE for claims that depend on successful configuration retrieval.

Correct state:
RECORDING_COVERAGE_DEGRADED -> UNKNOWN

The metric is not itself proof that a particular target resource was missed; target binding is still required.

### F4 — ResourceNotRecorded is explicit evidence, not absence

AWS provides explicit statuses for discovered resources whose configuration was not recorded because the recorder did not record that resource type, and for deleted resources whose configuration was not recorded. citeturn1search1

This is stronger than simply finding no CI, but it is still a statement about Config's recording scope, not about whether the underlying resource operation happened.

### F5 — Daily recording intentionally collapses intermediate changes

AWS documents that Daily recording produces the most recent state over the previous 24-hour period only if it differs from the previous CI. citeturn1search3turn1search8

Therefore:
DAILY CI != complete intermediate event history.

Multiple underlying changes can be represented by one later state. Any historical reconstruction using Daily mode must preserve this lossiness.

### F6 — Related-resource CIs cannot be treated as duplicate copies of one event

AWS documents that a change involving related resources can generate multiple configuration items. citeturn0search3

Thus:
multiple CIs != multiple independent underlying operations.

Conversely, a CI for one related resource does not automatically prove that every related resource's state was independently and simultaneously captured.

Relationship edges must remain separate from causal-event identity.

### F7 — Recorder configuration history is itself an evidence dependency

AWS documents that the ConfigurationRecorder resource type is recorded as a CI and can track changes to the recorder, including changes to enabled resource types, start/stop, and deletion. AWS warns that recorder drift can cause inaccurate detection and false compliance results. citeturn1search12

Therefore the recorder's own history should be part of the evidence graph:
target-resource history <- recorder scope/state history.

A target-resource gap crossing a recorder-scope transition cannot inherit coverage from the target CI alone.

## Evidence-state model

For a target scope S:

NOT_YET_OBSERVED
= expected observation window has not closed under resource-type recording semantics.

RECORDING_COVERAGE_DEGRADED
= permission/recorder/detection evidence prevents a complete negative claim.

CHANGE_EVIDENCED
= valid CI positively binds a recorded state to S.

NO_RECORDED_CHANGE
= only after claim-specific coverage, recording semantics, delivery coverage, and expected-set conditions are all satisfied.

UNKNOWN
= any required dependency remains unresolved.

These states must not collapse into one another.

## Refined decision rules

1. recent change + no CI yet + normal expected latency
-> NOT_YET_OBSERVED, not NO_CHANGE.

2. permission failure covering relevant recording path
-> RECORDING_COVERAGE_DEGRADED / UNKNOWN.

3. later valid CI
-> CHANGE_EVIDENCED; does not automatically prove prior-window completeness.

4. DAILY recording
-> state checkpoint; intermediate operations remain potentially unobservable.

5. related-resource CI
-> relationship evidence; not independent causal-event proof.

6. ResourceNotRecorded
-> explicit recording-scope fact; not proof of no underlying change.

7. complete covered interval + expected-set + no unresolved recording/delivery gap
-> bounded NO_RECORDED_CHANGE.

## New distilled rule

Detection, recording, and delivery are three separate boundaries.

UNDERLYING_OPERATION
→ CONFIG_DETECTION
→ CONFIG_RECORDING
→ DELIVERY
→ RETAINED_ARTIFACT

Evidence at a downstream boundary cannot silently prove completeness of an upstream boundary.

A later CI proves recorded state existed later; it does not by itself prove that the earlier interval was completely observable.

## Anti-collapse rules

- CI capture time != underlying operation time.
- CI delivery time != operation time.
- no CI yet != no change.
- permission failure != proof of one specific missed resource.
- permission failure unresolved != negative evidence.
- ResourceNotRecorded != no underlying operation.
- Daily CI != intermediate operation history.
- related CI != independent operation.
- current recorder state != historical recorder coverage.
- healthy delivery != complete detection.
- later observation != retroactive proof of prior coverage.

## Status ledger

- Detection delay as explicit uncertainty boundary: FOUND.
- Permission-failure telemetry as coverage evidence: FOUND.
- Explicit ResourceNotRecorded states: FOUND.
- Daily recording lossiness: FOUND.
- Related-resource multi-CI behavior: FOUND.
- Recorder self-history as coverage evidence: FOUND.
- Universal detection completeness: NOT ESTABLISHED.
- Universal negative inference from missing CI: REJECTED.
- Acquisition-boundary closure: NOT CLOSED GLOBALLY.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN GLOBALLY.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

AB105.034R: investigate CloudTrail relatedEvents semantics and the current AWS Config relationship between ConfigurationItems and CloudTrail event identity, including the documented Version 1.3 behavior where relatedEvents is empty and LookupEvents must be used. Determine exactly what causal binding can and cannot be reconstructed without collapsing event identity, CI state, and operation causality.
