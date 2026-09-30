# AB105.026R — AWS Config state history: continuity evidence without universal gap closure
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

Can AWS Config configuration history establish continuity between two observations, or do recording/retention boundaries still require UNKNOWN for unobserved intervals?

## Primary evidence reviewed

AWS Config defines a ConfigurationItem as a point-in-time view of a supported resource. AWS states that when Config is recording a supported resource type, it creates configuration items when it detects a resource being created, updated, or deleted. A configuration history is the collection of configuration items for a resource over time. citeturn0search4turn0search0

AWS states that Config maintains historical configuration items from the time the configuration recorder starts. It also delivers configuration history files for resource types being recorded. citeturn0search6

AWS Config retention is configurable from 30 days to 2557 days (7 years); data older than the selected retention period is deleted. citeturn0search2turn0search8

The GetResourceConfigHistory API returns configuration items for a specified resource and time interval, but each API call is limited to a seven-day span and results are paginated. citeturn0search1turn0search9

## Findings

### F1 — Config provides state-history evidence, not merely event evidence

A ConfigurationItem represents a point-in-time resource state, including configuration and relationships. This is different from CloudTrail's request/event-oriented evidence.

Therefore Config can answer questions such as how a recorded resource was configured over time, subject to the recording and retention boundaries. citeturn0search4

### F2 — A sequence of adjacent configuration items can establish bounded continuity

If the same resource identity is represented by successive ConfigurationItems, with sufficient temporal coverage and no relevant gap, the sequence provides stronger evidence of continuity than two isolated current observations.

However, “no item was returned” cannot automatically mean “no change occurred.” Config only maintains history from the point the recorder began recording, and retention can remove older items. citeturn0search6turn0search2

Thus:

recorded_state(t1) + recorded_state(t2) + demonstrated coverage between them
-> bounded continuity claim

recorded_state(t1) + recorded_state(t2) + unknown recording/retention coverage
-> UNKNOWN for uninterrupted continuity

### F3 — Recorder start is a hard historical boundary

AWS explicitly states that Config maintains historical records from the time the configuration recorder starts.

Therefore an import at t2 cannot use Config history to reconstruct pre-recorder history.

The earliest ConfigurationItem is evidence of the earliest observed state in the Config-covered interval, not necessarily the resource's creation or first-ever state.

### F4 — Retention creates another hard boundary

Even after recording has been continuously enabled, the configured retention period can remove older ConfigurationItems. Therefore a current Config history query can contain an evidence gap caused by retention rather than by absence of resource changes. citeturn0search2

This preserves the existing rule:

history_gap + unproven coverage -> UNKNOWN

### F5 — Config can strengthen, but does not replace, lifecycle-event evidence

For a concrete resource, a useful composition is:

CloudTrail management events -> operation evidence
+
AWS Config ConfigurationItems -> observed state/configuration evidence
+
resource identity semantics -> target/incarnation binding
+
recording/retention coverage -> interval completeness argument

This can produce a stronger bounded reconstruction than either source alone.

But Config does not become a universal lifecycle oracle. Its evidence is limited to supported resource types, the resource types actually selected for recording, the recorder's active interval, and retained ConfigurationItems. citeturn0search4turn0search6

### F6 — Configuration continuity is not necessarily lifecycle continuity

Even a continuous sequence of configuration states does not automatically prove every possible lifecycle fact.

For example, state history may establish that a resource was observed with configuration A and later configuration B without proving every API operation that produced B. CloudTrail and Config therefore answer different questions.

The model must preserve:

event evidence != state evidence

and

state continuity != complete operation history

### F7 — The seven-day API limit is retrieval mechanics, not a seven-day evidence limit

GetResourceConfigHistory limits each API call to a seven-day span, but the underlying history can cover a much longer retained interval. Therefore the seven-day limit must not be misclassified as an epistemic gap.

Conversely, successful pagination across the whole desired interval still does not prove that recording was enabled before the first returned item. citeturn0search1turn0search9

## Minimum evidence for a continuity claim using Config

For a claim that a resource remained continuously represented from t1 to t2:

1. resource type was supported and selected for Config recording;
2. recorder coverage is established for the entire [t1,t2] interval;
3. retention covers the entire interval;
4. resource identity remains bound across the returned ConfigurationItems;
5. the history retrieval is complete across pagination/time windows;
6. relevant deletion/recreation semantics are accounted for;
7. provenance/integrity of the history is established.

If recorder start, retention, identity, or relevant lifecycle semantics are unknown, the continuity claim must remain bounded or UNKNOWN.

## Anti-collapse rules

Do not collapse:

- first ConfigurationItem -> resource creation;
- Config history -> complete API history;
- continuous configuration observations -> proof of every lifecycle event;
- retention period -> recorder start;
- missing ConfigurationItem -> no state change;
- current Config state -> pre-import history;
- seven-day API request limit -> seven-day history limit;
- state continuity -> universal incarnation continuity.

## New distilled rule

AWS Config adds a second evidence axis:

**CloudTrail answers “what recorded management activity occurred?”**

**Config answers “what recorded resource state was observed over time?”**

For historical continuity:

state_sequence + identity_binding + full recorder/retention coverage
-> bounded continuity evidence

state_sequence + unknown coverage
-> UNKNOWN continuity

Config therefore strengthens reconstruction but does not close the acquisition-boundary problem by itself.

## Status ledger

- State-history evidence distinct from event evidence: FOUND.
- Bounded continuity from covered ConfigurationItems: ESTABLISHED IN PRINCIPLE.
- Recorder-start boundary: FOUND.
- Retention boundary: FOUND.
- Universal continuity from Config history: NOT ESTABLISHED.
- Acquisition-boundary closure: NOT CLOSED GLOBALLY.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN GLOBALLY.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

Investigate whether AWS Config's recorder and resource-selection semantics provide enough coverage evidence to prove that a missing ConfigurationItem represents “no detected change” rather than an unrecorded interval. Focus on recorder configuration changes, resource-type selection, and the boundary between recording being enabled and disabled.

Do not generalize beyond documented provider semantics or observed evidence.
