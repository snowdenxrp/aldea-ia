# NEXO AB104.634 — concrete Connect offset flush crash windows
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Current Kafka Connect documentation says standalone uses a local offset file; distributed mode uses replicated, compacted Kafka offset topics. The worker exposes offset flush interval/timeout settings, while exactly-once source support uses a different transactional path for source offsets. citeturn0search0turn0search1
Current Worker source creates a connector-specific OffsetBackingStore for source connectors and selects a special store when exactly-once source support is enabled. citeturn0search3

## Findings
F634-1: "offset callback completed" is not automatically equivalent to "Nexo historical evidence durably anchored"; the claim depends on the backing store's own commit boundary.
F634-2: In regular source mode, a crash around periodic offset flush can replay source records. Therefore the last observed offset is only progress evidence, not proof of external processing.
F634-3: Exactly-once source support changes the storage/transaction path, but its atomic boundary remains Kafka source-record + source-offset, not an arbitrary external effect.
F634-4: File-backed offsets depend on filesystem survival and provenance; copying a file to another worker cannot silently establish current authority.
F634-5: Distributed Kafka offset topics provide a stronger durable recovery substrate, but compaction/retention and Kafka-cluster incarnation still bound historical reconstruction.
F634-6: Flush timeout/failure must remain UNKNOWN until the backing store's authoritative state is reconciled; timeout is not NOT_COMMITTED.

## Crash matrix
C634-1 source records processed, offset flush not durable, worker crashes -> replay possible.
C634-2 offset flush acknowledged, worker crashes before downstream/external effect -> offset cannot prove effect completion.
C634-3 flush timeout -> UNKNOWN until authoritative offset-store evidence.
C634-4 restored file/topic with different worker/cluster incarnation -> historical offset only until continuity is proven.
C634-5 EOS source transaction committed -> Kafka source-record+offset claim can be reconstructed within retained Kafka lineage; external side effects remain separate.
C634-6 offset history compacted/expired before reconciliation -> UNKNOWN, never NOT_PROCESSED.

## Architecture consequence
Nexo should model OffsetPersisted, SourceRecordCommitted, LocalEffectCommitted and ExternalEffectCommitted as separate claims. A backing-store callback may supply evidence for one boundary only. EvidenceRecord must anchor authority/incarnation, connector/task generation, source position, storage revision/position, operation/reset identity, retention deadline and provenance.

## Next
AB104.635: inspect the exact OffsetBackingStore implementations and callback semantics in Apache Kafka source, then derive the minimal durable boundary needed for Nexo's EvidenceRecord.