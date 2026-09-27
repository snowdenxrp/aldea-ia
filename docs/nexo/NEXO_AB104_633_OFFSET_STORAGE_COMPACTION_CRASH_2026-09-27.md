# NEXO AB104.633 — offset storage compaction/crash evidence
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Current Kafka Connect guidance requires distributed offset topics to be replicated and compacted; standalone mode uses a local offset file. The current guide also exposes connector-specific offsets topics for EOS support. citeturn0search2
Compaction is a storage/recovery mechanism, not permanent archival evidence. A compacted topic preserves the latest retained value for a key rather than every historical version needed to reconstruct every prior state.

## Findings
F633-1: KafkaOffsetBackingStore can survive worker restart, but historical reconstruction is bounded by Kafka topic retention/compaction and cluster lineage.
F633-2: A current offset value is not proof that every earlier offset existed, was committed, or corresponded to an external effect.
F633-3: FileOffsetBackingStore can survive process restart if its file survives, but copied/restored files require provenance and connector/host incarnation binding.
F633-4: MemoryOffsetBackingStore provides no durable crash-recovery anchor.
F633-5: JDBC/custom stores are not classifiable from the storage label alone; transactionality, isolation, ordering, retention, backup/restore, and fencing must be evidenced by the concrete implementation.
F633-6: Offset reset after STOPPED/fencing remains a multi-domain operation; storage success does not prove external source mutation or downstream effect.

## Claim matrix
Kafka topic: durable bounded anchor if topic lineage + key/value history + incarnation are preserved; compaction limits historical reconstruction.
File: bounded anchor if file integrity/provenance and host/connector incarnation are preserved.
Memory: no post-crash anchor.
JDBC/custom: contract-dependent; UNKNOWN until concrete guarantees are established.

## Architecture consequence
Nexo must persist an independent EvidenceRecord before the storage layer reaches a point where the claim cannot be reconstructed. Required fields include storage authority/incarnation, connector/task generation, source partition, offset, storage revision/position, reset operation ID, evidence timestamp, retention deadline, and provenance digest.

CurrentOffset != HistoricalCommitProof.
CompactedAway != NOT_COMMITTED.
RestoredFile != CurrentAuthority.

## Next
AB104.634: inspect concrete Kafka Connect source code for FileOffsetBackingStore and KafkaOffsetBackingStore flush/error behavior, then test the exact crash windows that separate offset callback completion from durable storage evidence.