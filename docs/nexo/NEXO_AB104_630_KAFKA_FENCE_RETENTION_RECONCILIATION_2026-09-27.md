# NEXO AB104.630 — fence evidence vs transaction-state retention
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Kafka Admin.fenceProducers exposes per-transactional-ID producerId/epoch results; internally it uses FindCoordinator + InitProducerId, which bumps epoch and recovers an incomplete transaction. citeturn0search0
Current TransactionCoordinator persists producer/epoch and transaction state into the transaction-state log and can describe current transaction state, but historical state can become unavailable after transactional-ID expiration/cleanup. ProducerStateManager also expires producer IDs after inactivity or log deletion. citeturn0search1turn0search2
Kafka explicitly treats an old producer epoch as fenced; a timeout can itself cause an epoch bump, so ProducerFencedException does not necessarily imply a competing producer existed. citeturn0search3

## Key finding
A producer epoch is strong scoped evidence only while its Kafka cluster/coordinator lineage is reconstructable. After transaction-state cleanup or producer-ID expiration, absence of current metadata cannot prove that a requested fence never happened.
Therefore:
- observed higher epoch + valid cluster/coordinator lineage -> FENCE_COMMITTED (participant-local);
- authoritative proof that no requested epoch transition occurred, with preserved lineage -> FENCE_NOT_COMMITTED;
- timeout, cleanup, missing lineage, or conflicting coordinator evidence -> FENCE_UNKNOWN.

A new producer ID after epoch exhaustion is a new identity event; epoch values alone must never be treated as globally monotonic identity.

## Retention consequence
EvidenceRetentionDeadline for fencing must precede the earliest loss of transaction-state/producer lineage needed to distinguish committed from unknown. Independent durable Nexo EvidenceRecord is required if the claim must outlive Kafka's own metadata lifetime.

## Crash matrix
C630-1 fence succeeds, response lost, metadata retained -> reconcile transactional ID + producerId/epoch.
C630-2 fence succeeds, response lost, metadata later expired -> historical claim becomes UNKNOWN unless independently anchored.
C630-3 timeout causes broker-side epoch bump -> fencing may have committed despite no competing writer.
C630-4 coordinator migration -> require current coordinator epoch/transaction partition lineage.
C630-5 producer ID rotation -> bind old/new IDs through transaction-state evidence, not epoch alone.
C630-6 cleanup before reconciliation -> do not infer NOT_COMMITTED from absence.

## Next
AB104.631: research exact transaction-state retention/expiration interactions with Kafka Connect EOS source offsets, then close the AB104.623-630 EvidenceRetentionDeadline chain or record remaining gaps.