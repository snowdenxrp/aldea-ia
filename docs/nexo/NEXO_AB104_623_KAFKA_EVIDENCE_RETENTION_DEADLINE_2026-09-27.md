# NEXO AB104.623 — cleanup, producer-ID expiration, and EvidenceRetentionDeadline
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Source-level findings
Current Kafka ProducerConfig documents that transactional.id spans producer sessions and requires prior transactions for that identity to be completed before a new session proceeds. KafkaProducer also documents that commit/abort timeouts only mean the acknowledgement was not obtained; the request may already have reached the broker. citeturn0search0turn0search1

Kafka's transaction-state cleanup therefore creates two independent clocks:
1. transaction execution/recovery clock (transaction timeout);
2. metadata/history lifetime clock (transactional-id expiration and log retention).

A timeout is not evidence deletion, and evidence deletion is not evidence of NOT_COMMITTED.

## Nexo contract
Define:
EvidenceRetentionDeadline = latest deadline by which Nexo must durably externalize any Kafka observation required for a future claim.

It must be strictly earlier than the earliest configured/observed point at which the required Kafka history may cease to be reconstructable, with operational safety margin. The exact deadline is deployment-specific and must be computed from the configured retention/expiration regime, not hard-coded.

Minimum persisted fields:
Kafka cluster incarnation, transaction-state partition, transactionalId, producerId/epoch, transaction state, observation position/revision, config fingerprint, observation time, Nexo recovery generation, evidence digest.

## Adversarial tests
T623-1 commit timeout followed by later authoritative COMMITTED -> preserve UNKNOWN until reconciliation.
T623-2 transactional-id expiration after historical commit -> current absence cannot overwrite Nexo COMMITTED evidence.
T623-3 retention removes historical producer state before Nexo capture -> claim becomes UNKNOWN/QUARANTINE.
T623-4 new producer reuses transactional identity after expiry -> new generation cannot inherit old Nexo authority.
T623-5 configuration drift shortens evidence lifetime below recorded deadline -> invalidate the deadline and force new capture/hold.
T623-6 Kafka transaction state survives but external effect is UNKNOWN -> maintain separate claims.

## Conclusion
The minimum Nexo retention contract is not a single Kafka setting. It is a computed deadline tied to the earliest loss-of-reconstructability mechanism plus safety margin. Any Kafka-backed authority evidence needed beyond that deadline must be anchored into Nexo durable EvidenceRecord before the deadline.

## Next
AB104.624: research exact Kafka transaction timeout/recovery interaction and source-connector EOS offset retention, then determine whether the EvidenceRetentionDeadline must cover both transaction-state and source-offset histories.