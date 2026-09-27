# NEXO AB104.618 — Kafka coordinator durability and lineage
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Kafka transaction state is maintained through the transaction-state topic and coordinator ownership. Current coordinator code persists transaction metadata before completing transitions; transaction metadata records transactionalId, producerId, producerEpoch, last producer identity/epoch and transaction state. A transition is accepted only after the corresponding log entry is successfully written and replicated. citeturn0search0turn0search1

KafkaProducer initTransactions recovers prior incomplete transactions for the same transactional.id before the new producer proceeds. citeturn0search2

## Nexo evidence boundary
A recovered Kafka transaction state can enter EvidenceRecord only with:
- Kafka authority domain + transaction-state partition identity;
- transactionalId;
- producerId + producerEpoch;
- coordinator/partition lineage sufficient to identify the current authority instance;
- transaction state and authoritative observation point;
- evidence timestamp;
- recovery/generation context;
- exact source of observation.

The transaction state itself is stronger evidence than a client response, but it remains scoped to Kafka's transaction authority.

## Critical distinction
KafkaRecoveredState != GlobalCommitTruth.
A recovered Kafka COMMIT/ABORT can establish the Kafka transaction outcome if obtained from authoritative Kafka state, but cannot establish a downstream external effect or erase an external UNKNOWN.

Coordinator change is not itself an outcome change. It is a lineage/authority transition requiring re-resolution against the new coordinator's authoritative state. The current source also explicitly preserves enough prior producer epoch information to recognize certain retries across coordinator changes. citeturn0search1

## Fault tests
T618-1 coordinator failover during EndTxn -> response ambiguity, reconcile transaction state.
T618-2 state-log append replicated but client response lost -> recovered state is authoritative Kafka evidence.
T618-3 coordinator changes after marker append -> preserve historical append evidence and reconcile final state.
T618-4 stale coordinator serves old producer epoch -> fencing/lineage check rejects stale producer.
T618-5 state restoration/reincarnation -> require explicit authority-incarnation continuity; do not infer from key presence alone.
T618-6 recovered Kafka COMMITTED + external UNKNOWN -> keep both claims independently.

## Conclusion
Kafka supplies a strong participant-local durability pattern: replicated transaction-state record + identity/epoch + coordinator lineage + recovery before reuse. Nexo can ingest this as EvidenceRecord only after validating scope, lineage and freshness. It must never promote it directly to universal AuthorityContext.

## Next
AB104.619: research Kafka transaction-state topic replication/configuration and exact durability failure boundaries (ISR/minISR, unclean leader election, log loss/recovery), then map them to Nexo evidence confidence and UNKNOWN/QUARANTINE rules.