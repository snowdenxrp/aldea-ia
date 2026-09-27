# NEXO AB104.632 — Connect offset-storage retention/restore matrix
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Distributed Kafka Connect stores offsets/config/status in Kafka topics; standalone mode stores source offsets in a local file. REST reset/alter-offset operations require the connector to be stopped. citeturn0search0turn0search1
KIP-618 permits per-connector offsets topics for EOS source connectors and explicitly reasons about migration between global and per-connector offset topics. citeturn0search2
The Connect runtime creates an offset backing store per connector and uses the configured EOS path when exactly-once source support is enabled. citeturn0search4

## Matrix
- KafkaOffsetBackingStore: durable Kafka-topic history, subject to topic retention/compaction, cluster incarnation, replication and restore boundaries.
- FileOffsetBackingStore: local filesystem authority. Crash/restart can preserve offsets only if the file survives; host loss/restore/copy ambiguity requires incarnation binding.
- MemoryOffsetBackingStore: offsets disappear on process restart; cannot support durable post-crash reconstruction.
- JDBC/custom backing store: durability and ordering are backend-specific; Nexo must not assume transactionality, fencing, or historical retention without a concrete contract.

## Restore/reset consequences
1. Storage durability is not evidence durability: a surviving offset value does not prove source lineage, connector incarnation, or external effect history.
2. Kafka-topic offsets can survive Connect worker restart but not automatically a Kafka-cluster reincarnation/restore as current authority.
3. File offsets copied/restored into a new worker are historical evidence until continuity/incarnation is established.
4. Memory offsets force re-read from an earlier source position; this creates replay risk and cannot be interpreted as NOT_PROCESSED.
5. Offset reset is an administrative state transition, not merely a value write; AB104.625-628 fencing/reset findings remain applicable.
6. Per-connector EOS offset topics create an additional lineage/retention boundary; migration must bind global and per-connector histories explicitly.

## Claim matrix
Storage | Restart | Host/cluster restore | Historical proof
Kafka topic | potentially reconstructable | UNKNOWN until cluster lineage restored | bounded by topic retention/compaction + incarnation
File | survives if file survives | UNKNOWN until file provenance/incarnation established | bounded by retained file + provenance
Memory | lost | UNKNOWN/replay | none after process loss
JDBC/custom | backend-specific | UNKNOWN until backend contract verified | contract-specific

## Architecture consequence
Offset evidence minimum: OffsetAuthorityDomain, OffsetAuthorityIncarnation, ConnectorIncarnation, TaskGeneration, source partition identity, source position, storage type, storage lineage/revision, observation time, retention deadline, reset operation identity, and reconciliation state.

OffsetExists != SourceEffectCommitted.
OffsetMissing != SourceEffectNotProcessed.
OffsetRestored != CurrentAuthority.

## Next
AB104.633: research Kafka offset-topic compaction/retention and file/JDBC crash semantics in concrete implementations; determine which storage modes can furnish authoritative historical anchors and which force UNKNOWN.