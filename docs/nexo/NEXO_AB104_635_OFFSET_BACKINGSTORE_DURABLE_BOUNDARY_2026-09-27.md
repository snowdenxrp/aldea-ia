# NEXO AB104.635 — exact OffsetBackingStore boundary
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Current Kafka Worker source constructs a connector-specific OffsetBackingStore, then wraps it in OffsetStorageReaderImpl; regular source connectors also have a SourceTaskOffsetCommitter, while exactly-once source support disables that separate periodic committer. citeturn0search3
Kafka Connect documentation confirms standalone file offsets and distributed Kafka offset topics, with offset management restricted to stopped connectors. citeturn0search0

## Finding
The important Nexo boundary is not the connector callback itself. The durable claim begins only at the backing store's authoritative persistence boundary:
- regular source: offset flush is periodic and can leave replay after crash;
- EOS source: source records and source offsets share the Kafka transaction boundary, but this proves only Kafka-domain source progress;
- file/memory/custom stores require their concrete persistence and recovery contract.

The Worker code makes the EOS distinction explicit by omitting the regular SourceTaskOffsetCommitter when exactly-once source support is enabled. citeturn0search3

## EvidenceRecord consequence
Minimum offset evidence must distinguish:
OffsetWriteRequested
OffsetPersisted
SourceRecordCommitted
LocalEffectCommitted
ExternalEffectCommitted
and bind each to connector/task/authority incarnation plus storage revision/position and recovery generation.

A timeout/error at the backing-store boundary remains UNKNOWN until authoritative storage state is reconciled. A successful callback is evidence only for the claim that callback contract actually guarantees.

## Adversarial cases
C635-1 callback success followed by process crash before backend durability -> classify from backend evidence, not callback alone.
C635-2 callback timeout after backend commit -> UNKNOWN until read/reconcile.
C635-3 regular periodic flush crash -> replay possible.
C635-4 EOS transaction commit -> Kafka source-record+offset claim only.
C635-5 backend restored into new incarnation -> historical evidence until continuity binding.
C635-6 compacted/expired backend history -> UNKNOWN for claims requiring missing history.

## Next
AB104.636: inspect exact OffsetStorageWriter/OffsetBackingStore implementation and callback completion semantics, then identify whether any callback is strong enough to serve as a durable EvidenceRecord anchor without an independent read-back.