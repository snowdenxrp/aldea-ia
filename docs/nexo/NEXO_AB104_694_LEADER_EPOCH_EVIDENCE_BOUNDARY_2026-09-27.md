# NEXO AB104.694 — Leader-epoch evidence boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

Kafka 4.1.2 exposes consumer-side leader-epoch information in its consumer API/model, and the current consumer package includes explicit LogTruncationException and OffsetOutOfRangeException types. This confirms leader-epoch/truncation is a first-class read-path concern, not merely application metadata. 

## Frozen minimum evidence

The verifier must distinguish:
1. record observation evidence;
2. read-path continuity evidence;
3. durability evidence.

For the base RF=1 experiment, only (1) is needed to establish PRESENT. Leader epoch is auxiliary evidence for detecting a changed read topology, not proof of replication or durability.

Minimum captured verifier metadata:
- target topic/partition;
- initial assignment/seek success;
- first observed leader epoch when exposed by the record/metadata surface;
- leader epoch attached to a matching ConsumerRecord when available;
- offset of matching record;
- observation deadline;
- truncation/read exception class if any.

Do not synthesize a leader epoch when Kafka does not expose one on a particular observation.

## Epoch-change rule

A leader-epoch change by itself does NOT invalidate an already observed PRESENT record.

Before a valid match:
- epoch change with continued clean reads is diagnostic;
- explicit truncation/offset invalidation/read failure => READ_PATH_ERROR;
- automatic reset after invalidation cannot produce clean NOT_OBSERVED.

After a valid PRESENT:
- freeze evidence;
- later epoch changes belong to subsequent diagnostics and cannot rewrite the terminal observation.

## No false durability inference

Even if a ConsumerRecord carries a leader epoch, the verifier must not infer:
- replicated commit;
- quorum durability;
- external effect completion;
- Nexo authority validity.

The direct verifier establishes only that a record with the exact identity was observable through the selected Kafka read path at a concrete partition+offset.

## Frozen evidence contract

PRESENT requires exact identity plus successful read-path continuity up to that observation.

NOT_OBSERVED requires successful assignment, explicit seek, and successful polling through the deadline with no exact identity and no truncation/read-path failure.

READ_PATH_ERROR includes truncation/offset invalidation or any failure that prevents a reliable absence claim.

This keeps leader-epoch metadata subordinate to the actual epistemic claim.

## Status

VERIFIED:
- current Kafka consumer API has explicit truncation/out-of-range error surfaces;
- leader-epoch information is part of the current consumer model;
- epoch metadata is diagnostic evidence, not durability proof;
- read-path invalidation must remain distinct from clean absence.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.695: inspect the exact current Kafka ConsumerRecord leaderEpoch API and source behavior, then freeze whether epoch capture is mandatory, optional, or merely diagnostic for the minimal verifier.