# NEXO AB104.621 — exact __transaction_state cleanup boundary
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Code evidence
Apache Kafka TransactionStateManager explicitly manages the internal transaction log and background expiration of transactional IDs. The current source writes tombstones for expired transactional IDs and removes their cached metadata only after the tombstone append succeeds. It also loads transaction metadata by replaying the transaction log from its logStartOffset through logEndOffset; tombstone records remove entries from the reconstructed map. citeturn0search1
Kafka's TransactionCoordinator constructs the transaction log configuration from transaction topic partitions, replication factor, segment bytes and minimum ISR, confirming these are explicit configuration inputs to the transaction-state authority. citeturn0search4
The internal topic is explicitly __transaction_state. citeturn0search3

## Critical finding
There are two different cleanup layers:
1. Kafka log retention/segment lifecycle limits how far historical transaction-state records remain replayable.
2. Kafka's transactional-id expiration writes tombstones and removes expired IDs from reconstructed metadata.

Therefore a later absence of a transactionalId from the current coordinator cache/API is NOT evidence that the transaction never existed or never committed. It can be the expected result of expiration/tombstoning or unavailable historical log prefix.

## Nexo rule
Current coordinator state may support a scoped CURRENT_STATE claim only.
Historical outcome requires an EvidenceRecord captured before the relevant history can disappear, containing at minimum:
KafkaClusterIncarnation, TransactionStateTopicPartition, TransactionalId, ProducerId, ProducerEpoch, transaction state, coordinator epoch/lineage, observation log position/revision, evidence digest, timestamp and Nexo RecoveryGeneration.

If that anchor is absent and the Kafka log no longer reconstructs the required history: UNKNOWN/QUARANTINE, never NOT_COMMITTED.

## Added tests
T621-1 transactionalId expires -> current API absence must not imply historical non-existence.
T621-2 tombstone is durable but older state records are unavailable -> preserve historical anchor if Nexo captured it.
T621-3 coordinator loads from a shortened logStartOffset -> reconstructed current state is incomplete for older history.
T621-4 tombstone append response is lost -> reconcile durable log state.
T621-5 cluster incarnation changes -> old transaction-state evidence becomes historical lineage, not current authority.
T621-6 current Kafka state says no transaction while Nexo EvidenceRecord says COMMITTED -> retain both scopes; do not overwrite historical evidence.

## Conclusion
AB104.621 closes the concrete cleanup gap: Kafka itself can intentionally erase a transactionalId from the current reconstructed state through expiration/tombstones, while log retention bounds historical replay. Nexo therefore needs independent durable EvidenceRecord anchoring for any historical transaction claim it must preserve beyond Kafka's evidence lifetime.

## Next
AB104.622: research Kafka transaction log configuration defaults/current source for transaction.state.log.* settings and determine which settings materially bound evidence lifetime and which only affect operational recovery.