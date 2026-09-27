# NEXO AB104.631 — Kafka Connect EOS retention closure
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
KIP-618 defines EOS source support as atomically writing source records and their source offsets to Kafka and fencing zombie task generations. It requires meaningful source offsets and exact upstream resume semantics; ordinary Connect source offsets are periodically written, so crash before offset persistence can replay records. citeturn0search0
Kafka's transactional model exposes a finite log history: transaction visibility is bounded by log start/last-stable offsets, while transaction-state and producer metadata have their own retention/expiration boundaries. citeturn0search2

## Finding
The AB104.623-630 EvidenceRetentionDeadline must cover the intersection of three histories:
1. external source position/resume evidence;
2. Kafka source-record + primary-offset transaction evidence;
3. Kafka transaction/coordinator/fencing lineage.

Kafka EOS does not make external-source history permanent. If any required history expires before reconciliation, the claim becomes UNKNOWN rather than NOT_COMMITTED/NOT_PROCESSED.

## Reset consequence
KIP-618 fencing prevents zombie source tasks, but it does not make an offset reset globally atomic with an external source. Therefore ResetOperationID must bind:
ConnectorIncarnation, TaskGeneration, FenceEpoch, KafkaTransactionIdentity, SourceOffsetAuthorityIncarnation, source position, Kafka transaction-state evidence, and reset generation.

## New adversarial cases
C631-1 source record transaction committed, source-position history later unavailable -> Kafka-side commit remains historical; upstream resume claim UNKNOWN.
C631-2 fence evidence retained but source offset evidence expired -> fencing COMMITTED, reset overall UNKNOWN.
C631-3 Kafka transaction history expired but independent Nexo EvidenceRecord retained -> reconcile from anchored evidence if its integrity/authority contract remains valid.
C631-4 source offset reset changes external position, Kafka transaction fails/unknown -> cross-domain UNKNOWN; never infer from Kafka alone.
C631-5 all Kafka metadata retained but source connector lacks exact resume semantics -> EOS claim invalid for that connector.
C631-6 connector/cluster reincarnation -> old offset/transaction evidence requires explicit continuity binding.

## Closure status
AB104.623-631 establishes the retention model, but does NOT prove a universal numeric deadline. EvidenceRetentionDeadline is deployment/claim-specific and must be computed from the earliest required evidence loss boundary minus safety margin.

Remaining UNKNOWN: exact per-deployment source-history retention and whether every external connector exposes authoritative, durable resume evidence.

## Next
AB104.632: research concrete Kafka Connect offset-storage implementations and reset/restore behavior (Kafka topic, file, memory, JDBC), then build the retention/restore matrix and identify which claims can survive each storage boundary.