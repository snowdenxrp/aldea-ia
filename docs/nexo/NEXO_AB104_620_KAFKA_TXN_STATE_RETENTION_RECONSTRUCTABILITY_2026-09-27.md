# NEXO AB104.620 — Kafka transaction-state retention and reconstructability
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Kafka's transaction coordinator stores transaction metadata in the internal transaction-state topic. Kafka topic configuration supports retention/compaction semantics, and Kafka's transaction-state implementation relies on log-backed metadata rather than a permanent external ledger. Current Kafka APIs expose transaction state/description, but those are derived from current coordinator state. citeturn0search3turn0search8

## Nexo consequence
A transaction outcome is only reconstructible while the authoritative Kafka transaction-state lineage remains available and trustworthy.
- Current Kafka state is not automatically permanent historical proof.
- EvidenceRecord must retain an immutable externalized proof/reference sufficient for the Nexo claim after Kafka metadata ages out or authority is reincarnated.
- Compaction/retention is an evidence-lifetime boundary.
- A missing old transaction record after retention/restore cannot be interpreted as NOT_COMMITTED.
- If required historical state is unavailable, outcome remains UNKNOWN unless independent durable evidence resolves it.

## Required evidence anchor
Candidate Nexo anchor:
KafkaEvidenceAnchor = {KafkaClusterIncarnation, TransactionStateTopicPartition, TransactionalId, ProducerId, ProducerEpoch, TransactionState, StateLogPosition/ObservationRevision, EvidenceDigest, ObservationTime, RecoveryGeneration}.

The anchor is provenance, not a replacement for the original Kafka authority. It permits Nexo to prove what it observed and under which Kafka lineage, while preserving UNKNOWN when the underlying history cannot be reconstructed.

## Adversarial tests
T620-1 transaction completes, later transaction-state history is compacted/expired -> Nexo must retain independent EvidenceRecord.
T620-2 old transaction disappears after retention -> absence must not imply NOT_COMMITTED.
T620-3 cluster restore with surviving keyspace but new Kafka authority incarnation -> old anchor remains historical evidence only.
T620-4 transaction state reconstructed from incomplete lineage -> UNKNOWN/QUARANTINE.
T620-5 current API reports no transaction after old metadata disappears -> no retroactive NOT_COMMITTED inference.
T620-6 external effect UNKNOWN while Kafka historical anchor says COMMITTED -> preserve both scoped claims.

## Conclusion
AB104.620 closes an important evidence-lifetime gap: Kafka transaction-state machinery is authoritative within its current lineage, but Nexo needs its own durable immutable EvidenceRecord/anchor if a historical Kafka outcome may be needed after retention, compaction, restore or reincarnation. Absence of reconstructable Kafka history is UNKNOWN, never NOT_COMMITTED by default.

## Next
AB104.621: research Kafka transaction-state topic configuration/source and exact cleanup behavior, including compaction/retention ordering, to determine the concrete minimum evidence-retention contract Nexo should require from any Kafka-backed mechanism.