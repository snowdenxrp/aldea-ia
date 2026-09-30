# AB105.028R — AWS Config recorder status and CloudWatch: historical coverage is observable, but not automatically complete
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

Can the AWS Config recorder's own ConfigurationItems plus CloudWatch metrics establish a complete historical interval of recorder activity/failure, so that a gap in resource ConfigurationItems can safely support a bounded negative claim?

## Primary evidence

AWS explicitly states that ConfigurationRecorderStatus is the current recorder status. For detailed status of recording events over time, AWS directs users to send AWS Config events to CloudWatch metrics and use those metrics. The status includes lastStartTime, lastStopTime, lastStatus, lastStatusChangeTime, lastErrorCode/message, and current recording state. citeturn0search0

AWS Config records configuration changes for resources in scope as ConfigurationItems. AWS also exposes configuration history and configuration streams for recorded resources. citeturn0search1

AWS's recorder verification documentation shows that describe-configuration-recorder-status confirms that a recorder is currently recording; this is an operational/current check, not a historical completeness guarantee. citeturn0search5

AWS Config supports Continuous and Daily recording. Continuous recording records changes when they occur; Daily recording produces a CI for the most recent state over a 24-hour period only if it differs from the previous CI. citeturn0search6

## Findings

### F1 — AWS itself distinguishes current status from historical status

Current recorder status is not a historical event ledger. AWS explicitly recommends CloudWatch metrics for detailed recording-event status over time. citeturn0search0

Therefore:

current recorder status -> current evidence

CloudWatch historical metrics -> historical operational evidence

Neither statement alone proves complete historical coverage.

### F2 — Recorder status can expose failures, but failure telemetry is not automatically a complete interval proof

The status object exposes the latest status and latest error, plus last status-change time. This can identify a known failure boundary.

But "latest failure" does not prove there were no earlier failures.

Therefore:

known failure -> positive evidence of a coverage problem

no currently reported failure -> not proof of uninterrupted historical operation

The negative claim requires retained historical telemetry covering the full interval.

### F3 — CloudWatch provides a separate evidence axis, not automatic completeness

CloudWatch metrics can preserve a time series of recording-related status/events, but the mere existence of a metric does not establish that every relevant failure, stop, scope change, or delivery problem is represented for the exact claim being made.

The coverage contract must therefore include metric namespace/dimension, interval, resolution, retention, and semantics.

This follows the same evidence discipline already established for CloudTrail and Config history: telemetry must be bound to the claim.

### F4 — Recorder ConfigurationItems can reveal configuration/state transitions, but inherit Config's own boundaries

If AWS Config records AWS::Config::ConfigurationRecorder, its ConfigurationItems can provide historical observations of recorder configuration/state.

That is useful evidence for detecting scope/start/stop transitions, but it cannot bootstrap proof before Config began recording, nor can it prove periods removed by retention.

Thus:

recorder CI -> positive observation

recorder CI sequence + established recorder-history coverage -> bounded coverage evidence

recorder CI gap + unknown Config coverage -> UNKNOWN

### F5 — The combination is stronger than either source alone

For a historical interval [t1,t2], a defensible coverage argument can combine:

1. recorder ConfigurationItems;
2. recorder status history;
3. CloudWatch historical metrics;
4. resource-type/Region selection configuration;
5. resource ConfigurationItems;
6. retention/availability evidence;
7. identity/incarnation binding.

This creates a layered evidence graph rather than treating one telemetry source as an oracle.

### F6 — CloudWatch does not erase the acquisition-boundary problem

Even if CloudWatch demonstrates continuous Config operation from t1 to t2, it only establishes the state/event coverage of that recorded interval.

It cannot establish resource history before Config recording began, nor history outside the relevant resource/Region scope.

Therefore the acquisition boundary remains:

pre-recording history -> retained independent evidence | UNKNOWN

recorded interval + adequate coverage -> bounded continuity evidence

### F7 — Daily recording prevents an overly strong absence inference

Under Daily recording, absence of a CI for a particular day cannot be interpreted as "no change occurred during the day" in the same way as an event-by-event continuous recording model. AWS defines Daily as a CI representing the most recent state over the preceding 24-hour period only when different from the previous CI. citeturn0search6

Therefore any negative claim must include recording-frequency semantics.

## New coverage contract

A Config-based negative claim such as:

"no relevant recorded configuration change occurred during [t1,t2]"

requires at minimum:

- supported resource type and Region;
- resource type included in recorder scope throughout interval;
- recorder active throughout interval, or every inactive segment independently covered;
- recording frequency and overrides known;
- recorder configuration/status evidence covering the interval;
- relevant CloudWatch telemetry retained for the interval where needed;
- resource ConfigurationItems retrieved completely;
- retention boundaries known;
- resource identity/incarnation bound;
- provenance/integrity preserved.

If these conditions cannot be established, result remains UNKNOWN/BOUNDED.

## Anti-collapse rules

- current recorder status != historical recorder continuity;
- latest error == positive failure evidence, not complete failure history;
- no latest error != no historical failure;
- CloudWatch metric exists != complete coverage of every relevant event;
- recorder CI != universal recorder audit log;
- recorder CI gap != proof of uninterrupted recorder operation;
- Continuous recording != universal lifecycle-event history;
- Daily recording != event-by-event history;
- Config coverage != pre-Config history;
- Config continuity != complete API-operation history.

## Distilled rule

Telemetry about coverage is itself claim-bound evidence.

recorder-state evidence + CloudWatch historical evidence + scope/frequency + retention + resource history + identity
-> bounded historical coverage claim

missing coverage evidence
-> UNKNOWN/BOUNDED

This strengthens AB105.027R without closing the acquisition-boundary problem.

## Status ledger

- Current vs historical recorder status distinction: FOUND.
- CloudWatch as historical recorder-status evidence: FOUND.
- Recorder ConfigurationItems as coverage evidence: FOUND.
- Layered coverage argument: ESTABLISHED IN PRINCIPLE.
- Complete universal recorder-history guarantee: NOT ESTABLISHED.
- Missing telemetry -> no-change inference: REJECTED.
- Acquisition-boundary closure: NOT CLOSED GLOBALLY.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN GLOBALLY.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

Investigate AWS Config delivery-channel/configuration-history integrity and availability: whether S3-delivered configuration history files, configuration snapshots, and configuration streams provide retention/integrity/completeness guarantees that can independently strengthen the coverage argument, and whether delivery failures introduce another UNKNOWN boundary.
