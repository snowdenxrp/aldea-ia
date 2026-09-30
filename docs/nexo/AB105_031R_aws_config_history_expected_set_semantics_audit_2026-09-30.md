# AB105.031R — AWS Config history-file cadence and expected-set semantics
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

Can AWS Config S3 configuration-history files be enumerated as an expected set over a bounded interval, so that missing files can be interpreted without silently treating absence as no change?

## Primary evidence

AWS states that for each recorded resource type it regularly sends a configuration-history file to the configured S3 bucket. The file contains resources of one resource type that changed during that delivery period. AWS currently documents the normal history-file cadence as every six hours. If no configuration changes occur, AWS does not send a file. citeturn0search0turn0search9

AWS's resource-history documentation states that each S3 history file represents a resource type and contains configuration changes detected since the previous history file was delivered; files are typically delivered every six hours. citeturn0search2

AWS distinguishes history-file delivery from configuration snapshots. A snapshot is explicitly described as a complete picture of resources currently being recorded and their configurations, while history files contain changes for a resource type during a delivery period. citeturn0search4turn0search15

The Config API exposes recording frequency on individual configuration-history results. Continuous recording and Daily recording have different semantics, and delivery time is optional for continuous recording but populated for daily recording. citeturn0search12

## Findings

### F1 — There is a documented cadence, but the expected set is conditional

For a continuously recorded resource type, AWS documents a normal six-hour history-file cadence.

However, AWS also explicitly states that no file is sent when no configuration changes occur. Therefore the expected set cannot simply be “one file every six hours.”

Instead:

expected_file(period, resource_type)
= file expected if a qualifying configuration change occurred and the delivery path succeeded

No file can therefore mean either:

A. no qualifying recorded change, or
B. delivery/coverage failure or an unobserved recording gap.

The distinction requires independent coverage evidence.

### F2 — File contents are resource-type scoped

Each history file contains resources of one resource type. This makes the expected-set model more precise:

account + Region + resource_type + delivery period

rather than one undifferentiated account-wide file stream. citeturn0search0turn0search2

This also means a missing file for resource type A says nothing about resource type B.

### F3 — “Since the previous history file” creates a dependency on delivery boundaries

AWS describes a file as containing detected changes since the previous history file was delivered. citeturn0search2

Therefore the file itself should not be interpreted as an independent six-hour fixed transaction boundary without checking the actual delivery interval.

A delayed or failed delivery can affect how the next successful file's contents are interpreted.

Thus:

documented cadence != guaranteed exact partition boundaries.

### F4 — Missing file can become bounded evidence only after delivery coverage is established

Because AWS explicitly says no file is sent when there are no configuration changes, a missing file can support a bounded “no recorded qualifying change” claim only if:

1. recorder scope was active;
2. resource type was supported and selected;
3. recording semantics are known;
4. the relevant delivery interval is known;
5. delivery channel was functioning for the interval;
6. retention/object deletion does not explain the absence;
7. the identity and Region are bound.

Without those conditions, the result remains UNKNOWN.

### F5 — Snapshot can provide a checkpoint, not a missing-history substitute

A configuration snapshot is a complete picture of resources being recorded at the snapshot point. citeturn0search15

Therefore:

snapshot(t1) + snapshot(t2)

can establish two state checkpoints.

But it cannot prove which intermediate configuration changes occurred between them. It can strengthen a continuity claim when combined with history files, but it cannot retroactively manufacture missing history.

### F6 — Recording frequency must remain part of the claim contract

The API distinguishes Continuous and Daily recording. Daily recording has different capture/delivery semantics, including a delivery-time field that is populated for daily recording and omitted for continuous recording. citeturn0search12

Therefore an expected-set algorithm cannot assume continuous event-like behavior for all resources.

### F7 — The six-hour cadence is not itself a completeness theorem

AWS documents the cadence as regular/typically every six hours. It does not establish that every six-hour slot must produce an object regardless of change, nor that absence of an object proves absence of change independent of recorder and delivery evidence.

The correct interpretation is:

documented cadence + change-dependent file creation + delivery coverage

rather than:

six-hour slot -> mandatory file.

## Formal expected-set model

For a claim scope S = (account, Region, resource_type, recording_mode, [t1,t2]):

For each documented delivery interval P:

- if a qualifying recorded change occurred in P and delivery succeeded, a corresponding history artifact is expected;
- if no qualifying change occurred, AWS may legitimately emit no history file;
- if delivery/recording coverage is unknown, absence of an artifact is epistemically ambiguous.

Therefore:

expected artifact absent + complete recording/delivery coverage + correct scope
-> bounded NO-RECORDED-CHANGE fact

expected artifact absent + incomplete/unknown coverage
-> UNKNOWN

This is stronger than treating the object namespace as a simple fixed sequence.

## Anti-collapse rules

- six-hour cadence != mandatory six-hour file;
- missing file != no change without coverage;
- history file != exact fixed six-hour transaction;
- resource type A file != evidence about resource type B;
- snapshot != intermediate history;
- S3 object timestamp != resource-change timestamp;
- current delivery success != historical delivery completeness;
- history-file presence != complete lifecycle history.

## New distilled rule

The expected set is conditional, not unconditional.

scope + recording semantics + documented cadence + actual delivery coverage + retained artifact inventory
-> bounded expected-set interpretation

Missing artifact without those dependencies
-> UNKNOWN.

This advances AB105.030R: S3 object/version identity can establish artifact provenance, but completeness requires a claim-specific expected-set model that accounts for AWS Config's change-dependent delivery behavior.

## Status ledger

- Resource-type-specific history files: FOUND.
- Six-hour documented/typical cadence: FOUND.
- No-change => no history file: FOUND.
- Conditional expected-set semantics: ESTABLISHED IN PRINCIPLE.
- Fixed mandatory artifact sequence: REJECTED.
- Snapshot as complete point-in-time state: FOUND.
- Universal missing-file => no-change inference: NOT ESTABLISHED.
- Acquisition-boundary closure: NOT CLOSED GLOBALLY.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN GLOBALLY.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

Investigate whether AWS Config's delivery-status APIs and CloudWatch delivery-failure metrics can be combined with the conditional expected-set model to distinguish “no change, therefore no file” from “file expected but delivery evidence is incomplete,” including delayed/failed delivery and retention/deletion boundaries.
