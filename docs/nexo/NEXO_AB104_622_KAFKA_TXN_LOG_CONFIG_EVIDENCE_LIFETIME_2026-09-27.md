# NEXO AB104.622 — transaction.state.log.* evidence-lifetime controls
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Current broker configuration references document transaction.state.log.min.isr as the minimum acknowledgements for writes to the transaction topic, transaction.state.log.replication.factor as its replication factor, and transaction.state.log.num.partitions as a deployment-time partition count. Current published configuration references show min.isr=2 and replication.factor=3 in standard distributions, while sample KRaft controller configuration may use 1 for development. citeturn0search1turn0search3
transaction.state.log.segment.bytes controls segment size and is described as supporting faster compaction/cache loading; it is not itself a semantic evidence-retention guarantee. citeturn0search4
transactional.id.expiration.ms is the coordinator's inactivity expiration for transactional IDs. Documentation also notes producer IDs can expire earlier when their last write disappears through topic retention. citeturn0search2

## Classification
Durability/availability controls:
- transaction.state.log.replication.factor
- transaction.state.log.min.isr
- election/ISR configuration

Operational recovery/performance:
- transaction.state.log.segment.bytes
- transaction.state.log.load.buffer.size
- transaction.state.log.num.partitions (mainly scaling/placement; should not change after deployment)

Evidence-lifetime controls:
- transactional.id.expiration.ms
- underlying log retention/cleanup behavior
- producer-ID/transaction metadata disappearing as historical log records age out

Critical: no single transaction.state.log.* parameter creates a permanent historical evidence guarantee. Nexo must treat Kafka's evidence lifetime as finite/configuration-dependent.

## Nexo contract
For Kafka-backed claims that must survive longer than Kafka's configured metadata lifetime, require an independent Nexo EvidenceRecord before expiry/cleanup. Record the relevant Kafka configuration fingerprint and authority incarnation. If a required historical record has expired or cannot be reconstructed, classify UNKNOWN/QUARANTINE rather than NOT_COMMITTED.

## Tests
T622-1 low minISR -> failed durability claim.
T622-2 RF/ISR configuration change -> evidence scope changes; new fingerprint required.
T622-3 transactional.id expires -> current absence cannot erase historical Nexo evidence.
T622-4 producer ID disappears after retention -> absence is not NOT_COMMITTED.
T622-5 segment sizing changes -> no direct semantic authority change, but recovery/compaction behavior evidence changes.
T622-6 configuration fingerprint mismatch during recovery -> stale evidence; revalidate/quarantine.

## Conclusion
AB104.622 separates Kafka operational parameters from Nexo evidence semantics. Replication/minISR bound durability; retention/expiration bound reconstructability; segment/load settings mainly affect operations. Nexo's durable historical claim cannot depend solely on Kafka's current coordinator state.

## Next
AB104.623: research Kafka transaction-state retention cleanup implementation and producer-ID expiration interaction in source, then derive the minimum EvidenceRetentionDeadline contract for Nexo.