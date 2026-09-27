# NEXO AB104.613 — CDC offsets/checkpoints: transport progress vs authority evidence
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
- Debezium outbox emits a unique event ID for deduplication and aggregate ID as Kafka key for partition ordering. Its event envelope can also expose source transaction metadata such as txId/LSN in supported connector payloads. These are transport/source lineage evidence, not proof of downstream processing. citeturn0search0turn0search6
- The outbox router treats the outbox as an insert-only queue and uses the event ID as a duplicate-detection handle. citeturn0search0

## Boundary
CDC offset/checkpoint = consumer/connector progress evidence: Offset = (ConnectorIdentity, Partition/SourceScope, Position, Generation/Incarnation, CommitEpoch).
It answers: the connector recorded progress at this source position.
It does NOT prove downstream delivery, consumer business-effect commit, external-provider commit, or absence of replay after restore/reconfiguration.

## Crash/replay scenarios
C613-1: source transaction committed; connector crashes before offset checkpoint -> event replay. Expected same SourceEventID/transaction lineage; dedup handles replay.
C613-2: event emitted; connector checkpoint advances; downstream consumer crashes before local commit -> transport progress must not suppress required consumer retry.
C613-3: connector restores an older offset snapshot -> replay range may expand; old offset cannot prove events absent from replay window never existed.
C613-4: connector identity/incarnation changes -> old offset is historical; new connector generation establishes its own continuity.
C613-5: source snapshot + CDC transition -> snapshot and streaming lineage need explicit handoff; offset alone is insufficient for complete causal claim.
C613-6: source authority restored/reincarnated -> position N has new meaning; bind position to source incarnation.
C613-7: out-of-order events across independent partitions -> per-partition offset cannot establish global order.
C613-8: event ID collision across source incarnations -> BLOCK unless identity transfer proves equivalence.

## Nexo rule
OffsetCommitted != EventDelivered != LocalEffectCommitted != ExternalEffectCommitted.
Offsets are provenance/replay-control evidence, but cannot mint AuthorityContext or current-world truth.

## Minimum CDC evidence
ConnectorDomainID, ConnectorIncarnation, SourceAuthorityDomainID, SourceAuthorityIncarnation, Partition/SourceScope, Position/LSN, SourceEventID, SourceTransactionID where available, AggregateID, EventSequence if defined, checkpoint commit epoch, snapshot-vs-stream mode, provenance digest, reconciliation generation.

## Next
AB104.614: research Kafka Connect offset storage/commit semantics and Debezium crash recovery more concretely; identify the failure window between record processing, broker publication, and checkpoint persistence.