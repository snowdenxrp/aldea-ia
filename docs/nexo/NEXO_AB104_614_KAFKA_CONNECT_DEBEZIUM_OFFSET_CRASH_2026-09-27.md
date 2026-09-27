# NEXO AB104.614 — Kafka Connect/Debezium offset commit crash windows
Date: 2026-09-27
Status: research/design only; no implementation or executed-test claim.

## Evidence
- Kafka Connect periodically commits source offsets so a failed SourceTask can resume, but the framework explicitly describes possible reprocessing/duplication after failure. The connector, not the framework, knows how to seek to the correct source position. citeturn0search3
- Debezium Engine documents the failure window directly: offsets are recorded per source record but flushed periodically; after crash, already-processed records can be received again, with replay bounded by flush interval and batch size. citeturn0search5
- Kafka Connect exactly-once source support (KIP-618) can transactionally write source records and their offsets to Kafka, but that guarantee concerns the Kafka transaction boundary; it does not automatically prove downstream external effects. citeturn0search11
- Debezium offset storage is persistent in Kafka Connect deployments; file/memory/JDBC options have different durability characteristics. Memory offsets are lost on crash. citeturn0search0turn0search2
- PostgreSQL connector documentation exposes an offset mismatch case where stored offset LSN and replication-slot confirmed LSN diverge, including slot recreation or offset-store corruption/reset. This is concrete evidence that a stored position and source authority state can disagree and need reconciliation. citeturn0search10

## Failure windows
F614-1: source record processed -> crash before offset flush -> replay.
F614-2: offset flush succeeds -> downstream consumer effect fails -> source resumes after offset; transport progress cannot prove local effect.
F614-3: Kafka transactional source commit -> downstream external effect later fails -> Kafka EOS does not prove external EOS.
F614-4: offset store restored/reset -> old position becomes historical; new connector incarnation must reconcile.
F614-5: source replication slot recreated/advanced relative to stored LSN -> position mismatch; do not silently equate stored offset with current source state.
F614-6: connector task reconfiguration changes source identity/partition mapping -> old offsets need explicit compatibility/continuity evidence.

## Nexo boundary
`ConnectorOffsetCommitted` is transport/source-progress evidence. It may support replay control but cannot mint `AuthorityContext`, `LocalEffectCommitted`, or `ExternalEffectCommitted`.

## Harness extension
Add F614-1..F614-6 to the runnable fault harness. For each, record connector/source incarnation, source position/LSN, offset-store generation, source event ID, downstream EffectID, delivery attempt, local transaction evidence, external provider evidence, and reconciliation state.

## Next
AB104.615: research Kafka Connect exactly-once source guarantees and their transaction boundary in more detail, then formalize the exact claim that EOS can and cannot establish for Nexo.