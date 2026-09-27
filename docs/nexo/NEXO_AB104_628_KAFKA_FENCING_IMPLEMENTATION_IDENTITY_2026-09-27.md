# NEXO AB104.628 — actual Kafka Connect fencing implementation identity
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Source-code evidence
Apache Kafka Connect Worker.java implements zombie fencing with Admin.fenceProducers over the task transactional IDs derived from connector name/task ID. The method waits on the Admin future's .all() and closes the Admin client in the completion callback. The task producer configuration separately derives transactional.id from groupId + connector + taskId and enforces it for EOS source tasks. citeturn0search1
KIP-875 defines the offset-reset transactional ID differently: groupId + connector (without task ID), while task producers use groupId + connector + taskId. citeturn0search0

## Key finding
Kafka has participant-local identities at two levels:
- Task writer identity: groupId + connector + taskId.
- Offset-reset transaction identity: groupId + connector.

Neither is a durable Nexo-wide ResetOperationID. The fencing API itself returns completion of the producer-fencing request, but the source code does not make that completion a durable cross-domain operation record.

Therefore a crash after successful fencing but before the next reset stage leaves a participant-local state that must be reconciled from Kafka evidence; Nexo cannot infer the whole reset operation outcome from the fencing future.

## Crash matrix update
C628-1 Admin.fenceProducers succeeds, worker crashes before alterOffsets: task writers are fenced, reset operation remains unresolved.
C628-2 fencing request times out/connection fails: do not infer whether broker-side fencing occurred; reconcile transactional producer epochs/metadata before retry.
C628-3 offset-reset transaction succeeds but REST response is lost: reconcile the groupId+connector transaction identity; do not create a new logical operation.
C628-4 external connector alterOffsets succeeds before Kafka offset transaction: cross-domain UNKNOWN.
C628-5 task ID reused after restart: task transactional ID may identify the same scoped producer lineage but does not prove same Nexo operation or connector incarnation.
C628-6 cluster/Connect authority reincarnation: old transactional IDs require incarnation/continuity binding before being treated as current authority evidence.

## Nexo consequence
A Nexo reset must wrap Kafka's participant-local identities in its own durable ResetOperationID + AuthorityEpoch + ConnectorIncarnation + TaskGeneration + participant evidence anchors. Kafka transactional IDs are evidence keys, not Nexo authority identities.

## Next
AB104.629: research Kafka Admin.fenceProducers semantics and producer epoch/fencing evidence after timeout, then define the exact reconciliation evidence needed to classify fencing as COMMITTED / NOT_COMMITTED / UNKNOWN.