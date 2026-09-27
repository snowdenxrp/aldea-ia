# NEXO AB104.629 — fencing timeout/epoch reconciliation
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Kafka's Admin fenceProducers is implemented by initializing the transactional ID, which bumps the producer epoch and recovers an incomplete transaction left by the previous producer. The API can return producer ID and epoch evidence per transactional ID, in addition to the aggregate success future. citeturn0search0
Kafka's transaction protocol uses producer epochs as stale-writer fencing; a newer producer with the same transactional.id fences the previous instance. citeturn0search1turn0search3
Current coordinator code also handles a retry case where an epoch bump may have succeeded but its response was lost: the previous producer ID/epoch can be recognized and the next request can continue the fencing/recovery process. citeturn0search4

## Nexo finding
A fencing request cannot be classified from transport result alone.
1. COMMITTED fencing: authoritative Kafka evidence shows target transactional ID at an epoch strictly newer than the expected prior epoch, with expected Kafka cluster/coordinator lineage.
2. NOT_COMMITTED: only when authoritative evidence proves the requested fence epoch was not installed and no later equivalent fence exists for the same operation identity.
3. UNKNOWN: timeout/transport loss without authoritative epoch evidence; also conflicting coordinator/cluster lineage.

A higher epoch proves a fence event for that transactional ID, but does not prove the surrounding Nexo reset operation completed. It is participant-local evidence.

## Crash/timeout cases
C629-1 response lost after epoch bump -> reconcile producer epoch; do not issue a new logical operation.
C629-2 timeout before evidence -> UNKNOWN until coordinator evidence resolves.
C629-3 retry observes higher epoch -> fencing may be COMMITTED; bind evidence to expected transactional ID and cluster incarnation.
C629-4 coordinator migration during request -> require current coordinator/transaction-state lineage before classification.
C629-5 epoch exhaustion/recovery -> producer ID may change; epoch alone is not permanent identity.
C629-6 old producer receives ProducerFencedException -> strong evidence that a newer generation has fenced it, scoped to that transactional ID.

## Architecture consequence
Participant fence evidence should include KafkaClusterIncarnation, TransactionalID, prior ProducerID/Epoch, observed ProducerID/Epoch, coordinator partition/epoch, FenceOperationID, observation revision/position, recovery generation, evidence digest.

FenceEpoch greater than oldFenceEpoch is evidence of a fencing transition, not proof of global authority transition.

## Next
AB104.630: research Admin.fenceProducers producerId/epoch response semantics and transaction-state durability/retention together; determine minimum evidence needed to survive coordinator migration and transaction-state cleanup.