# AB105.027R — AWS Config recorder scope/status: proving coverage across gaps
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

Can a gap in AWS Config ConfigurationItems be interpreted as evidence that no relevant change occurred, if recorder status and resource-selection configuration are examined?

## Primary evidence

AWS Config's customer-managed recorder has a configurable resource scope. It can record all supported resource types with exclusions, or only specified resource types. Resource-type recording can also use Continuous or Daily frequency. Changing frequency or stopping recording for a resource type leaves already-recorded configuration items unchanged. citeturn0search1turn0search2

AWS documents a ConfigurationRecorderStatus containing lastStartTime, lastStopTime, current recording, and the latest recording status/error information. AWS explicitly notes that this status is current status; detailed status of recording events over time requires additional CloudWatch metrics. citeturn0search5

AWS Config also records the AWS::Config::ConfigurationRecorder itself as a configuration item. AWS says this CI can track updates to resource types being recorded, recorder stop/start, and recorder deletion/uninstallation. citeturn0search0

AWS documents that supported-resource availability is Region-specific and that global resource types have special recording/home-Region rules. citeturn0search2

## Findings

### F1 — Current recorder status is not historical coverage

recording=true now does not prove the recorder was continuously active throughout a historical interval.

lastStartTime and lastStopTime provide boundary observations, but a complete historical coverage claim needs evidence about intervening recorder state and configuration changes.

Therefore:

current_status -> current fact

current_status + historical recorder-state evidence -> potentially bounded coverage

### F2 — Recorder configuration is itself auditable state

Because AWS Config records AWS::Config::ConfigurationRecorder, the recorder's own configuration/state can provide evidence about whether recording scope or start/stop state changed. citeturn0search0

This creates a useful layered chain:

recorder ConfigurationItems
-> recorder scope/status observations
-> coverage argument for resource ConfigurationItems

However, this must not be treated as automatically complete: the recorder evidence itself is subject to the same recording/retention boundaries and provider semantics.

### F3 — Scope changes create epistemic boundaries

If a resource type was excluded/not selected during part of [t1,t2], absence of its ConfigurationItems during that interval cannot support a “no configuration change” claim.

Likewise, if a resource type becomes selected later, its first observed CI does not reconstruct the earlier interval.

This yields:

outside recording scope -> NOT OBSERVED

not observed != unchanged

### F4 — Recording frequency matters

Continuous recording can produce CIs when changes occur. Daily recording produces a CI representing the most recent state over the preceding 24-hour period only if it differs from the previous CI. citeturn0search1turn0search2

Therefore a missing CI under Daily recording has weaker immediate meaning than a missing CI under a continuously recorded, fully covered interval.

Even under Continuous recording, however, a missing CI is not enough by itself to prove absence of a lifecycle event unless coverage, identity, provider detection semantics, and integrity are established.

### F5 — Recorder stop/start is an explicit coverage break

AWS exposes lastStartTime and lastStopTime, and the recorder CI can track start/stop changes. citeturn0search0turn0search5

A confirmed stop during [t1,t2] creates an explicit uncovered interval unless another independent evidence source covers it.

Thus:

recorder stopped in interval + no independent source -> UNKNOWN for continuity across that interval.

### F6 — Region and global-resource semantics matter

AWS Config's recording behavior differs by resource type and Region. Some global resource types are recorded only in a designated home Region; some historical global IAM recording behavior is Region-dependent. citeturn0search2

Therefore “Config was enabled in the account” is too coarse.

Coverage must bind:

account + Region/home Region + resource type + recorder scope + time interval.

### F7 — Resource-type support can itself change the evidentiary boundary

If a resource type was not supported in the relevant Region or period, the absence of Config history cannot be interpreted as evidence of absence of resource changes.

The claim must be scoped to the provider's documented recording capability.

## Coverage contract distilled

For a negative historical claim such as:

“no relevant configuration/lifecycle change occurred between t1 and t2”

the minimum Config-side evidence is:

1. resource type was supported in the applicable Region;
2. recorder scope included that resource type throughout [t1,t2];
3. recorder remained active throughout [t1,t2], or every gap has independent coverage;
4. recording frequency/semantics are known;
5. identity/incarnation binding remains valid;
6. retention covers the full interval;
7. returned history is complete across pagination/time windows;
8. recorder/scope changes themselves are evidenced;
9. provenance/integrity of the evidence is preserved.

Without these, the correct result is bounded/UNKNOWN, not “no change.”

## Important distinction

The recorder's own CI can strengthen the coverage argument, but it cannot magically prove its own historical completeness.

This is not circular proof if treated as layered evidence with explicit boundaries; it becomes invalid if the existence of a current recorder configuration is used as proof that the same configuration existed for the entire past interval.

## Anti-collapse rules

- current recording=true != historical continuous recording;
- lastStartTime != proof of no intermediate stop;
- resource included now != resource included throughout history;
- missing CI != no change;
- daily recording gap != continuous-recording gap;
- recorder CI != universal audit log;
- Config enabled in account != complete Region/resource-type coverage;
- first CI after scope inclusion != pre-inclusion history;
- state-history coverage != complete API-operation history.

## New distilled rule

Coverage must itself be treated as evidence.

resource_history + recorder_scope_history + recorder_active_interval + retention + identity/region binding
-> bounded historical continuity claim

If any required coverage component is UNKNOWN:

historical continuity -> UNKNOWN/BOUNDED

This extends AB105.025R: event-class completeness and state-history completeness are both claim-specific, and now recorder coverage is an explicit evidence dependency rather than an assumed background condition.

## Status ledger

- Recorder scope as explicit coverage dependency: FOUND.
- Recorder start/stop state as historical boundary: FOUND.
- Recorder configuration itself auditable through Config CI: FOUND.
- Coverage argument across recorder changes: ESTABLISHED IN PRINCIPLE.
- Missing CI => no-change inference without coverage proof: REJECTED.
- Universal Config continuity: NOT ESTABLISHED.
- Acquisition-boundary closure: NOT CLOSED GLOBALLY.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN GLOBALLY.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

Investigate whether the recorder's own ConfigurationItems and/or CloudWatch metrics provide enough historical evidence to establish recorder-active intervals with completeness, including failures and transitions, rather than merely exposing current/last-known status. Then test whether that coverage can support a bounded negative claim without silently converting missing telemetry into “no change.”
