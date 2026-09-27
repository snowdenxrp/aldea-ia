# NEXO AB104.636 — offset commit callback is not the durable anchor
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Current Kafka Connect Worker creates connector-specific OffsetBackingStore and an OffsetStorageReader; regular source mode also has SourceTaskOffsetCommitter, while exactly-once source mode disables that separate committer. citeturn0search0
KIP-618 explicitly states that EOS source offset commits use the Kafka transaction boundary and that the worker offset flush timeout is ignored for EOS source tasks. It also states SourceTask commit/commitRecord callbacks occur after successful offset commit and may be skipped if the process dies between the successful commit and callback completion. citeturn0search5
Current Connect documentation distinguishes distributed Kafka-topic state from standalone local-file offsets. citeturn0search3turn0search6

## Key finding
For EOS source connectors, the authoritative Kafka-side anchor is the committed transaction containing source records plus source offsets; SourceTask.commit/commitRecord is explicitly post-commit and cannot itself serve as the durable commit anchor.

For regular source connectors, callback/flush completion is a backing-store-specific progress signal; replay remains possible after a crash around periodic flush.

Therefore Nexo must never mint EvidenceRecord as effect committed from a connector callback alone.

## Crash matrix
C636-1 Kafka EOS transaction committed, worker dies before SourceTask.commit callback -> Kafka transaction remains authoritative; callback absence is not failure.
C636-2 callback executed, later external effect fails -> callback does not prove external effect.
C636-3 regular offset flush acknowledged, process dies before downstream effect -> offset and effect claims diverge.
C636-4 backing-store timeout -> UNKNOWN until authoritative store reconciliation.
C636-5 restored offset store -> historical evidence until incarnation/continuity binding.

## Minimal durable boundary
EvidenceRecord should anchor the strongest actual storage-domain event available:
- EOS: Kafka transaction identity + source offset + source record lineage + cluster incarnation + transaction-state evidence.
- Regular Kafka store: authoritative offset-store record + Kafka cluster/topic partition lineage + observation revision/position.
- File/custom: backend-specific durable commit evidence plus storage/host incarnation and provenance.

## Next
AB104.637: inspect concrete KafkaOffsetBackingStore and OffsetStorageWriter source to determine batching, serialization, flush ordering, and failure callbacks; map exact crash windows.