# NEXO AB104.617 — Kafka transactional recovery and UNKNOWN mapping
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Kafka KIP-98 states that initTransactions obtains a producer ID/epoch, fences prior generations, and recovers incomplete transactions; the recovered transaction is completed as committed or aborted before the new producer resumes. It also states that a stable TransactionalId enables recovery across producer sessions. citeturn0search2
Current Kafka TransactionCoordinator code shows explicit handling for UNKNOWN_PRODUCER_ID recovery, producer fencing, pending transaction transitions, epoch exhaustion, and coordinator-epoch changes. A transaction marker can be appended while the coordinator epoch changes, producing a NOT_COORDINATOR response even though the marker append succeeded. citeturn0search0 Kafka's producer API documents ProducerFencedException/InvalidProducerEpochException and timeout behavior; commit success means the transaction committed, while timeout is not itself proof of the final external state. citeturn0search4

## Nexo mapping
Kafka has a useful scoped recovery pattern:
- TRANSACTIONAL_ID = stable logical producer identity.
- PRODUCER_EPOCH = generation fence.
- COORDINATOR_EPOCH = coordinator authority incarnation.
- transaction state log = durable recovery evidence.
- initTransactions = reconciliation/recovery barrier before resuming.
- fenced old producer = stale writer blocked.
- recovered incomplete transaction = Kafka can resolve its own transaction domain to COMMITTED/ABORTED.

Nexo must not collapse these into one global state:
- Kafka COMMITTED/ABORTED -> Kafka-domain outcome evidence.
- Nexo external EffectOutcome remains separate.
- Coordinator/transport ambiguity -> UNKNOWN until authoritative Kafka evidence resolves it.
- Old Kafka generation fenced -> participant-local authority invalidation, not global Nexo revocation.
- New Nexo recovery generation must not infer external effects from Kafka transaction recovery.

## Important failure boundary
Current coordinator source contains a case where a transaction marker is successfully appended but the coordinator epoch changes before response, yielding NOT_COORDINATOR. Therefore response/error is not equivalent to durable transaction outcome; Nexo should treat lost/ambiguous responses as epistemic UNKNOWN and reconcile from the transaction authority. citeturn0search0

## Tests
T617-1 commit marker durable, response lost -> Kafka outcome UNKNOWN locally, reconcile by transaction state.
T617-2 abort marker durable, response lost -> same.
T617-3 coordinator epoch changes after marker append -> NOT_COORDINATOR does not imply NOT_COMMITTED.
T617-4 old producer continues after epoch bump -> fenced; classify as stale participant, not evidence of external rollback.
T617-5 initTransactions recovers incomplete transaction -> Kafka transaction becomes resolved before new work; external side effects remain separate.
T617-6 UNKNOWN Kafka transaction + external provider effect already submitted -> Kafka reconciliation must not erase/overwrite external UNKNOWN.

## Conclusion
AB104.617 closes the research point: Kafka demonstrates a strong pattern for scoped transaction recovery—stable identity, generation fencing, durable transaction state, and recovery-before-resume. The Nexo analogue must preserve UNKNOWN until authoritative evidence resolves it and must keep participant-local transaction outcome separate from external-world effect outcome.

## Next
AB104.618: research Kafka transaction coordinator failover/replication semantics and determine what durability/lineage evidence is required before Nexo can trust recovered Kafka transaction state as EvidenceRecord input.