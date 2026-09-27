# NEXO AB104.626 — Kafka Connect task-generation/config-topic fencing around offset reset
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
KIP-875 requires offset alter/reset only for STOPPED connectors, with empty task configs in the config topic. For EOS source support, the worker fences previously-running tasks before invoking connector alterOffsets and changing/resetting primary offsets transactionally. The STOPPED transition publishes an empty task set to the config topic and triggers rebalance. citeturn0search0
KIP-618 gives each source task a transactional ID derived from Connect group ID, connector name, and task ID. It also states a custom offsets topic is authoritative for EOS source offset commits, while the global-offset mirror is non-transactional and retried separately. citeturn0search1

## Critical finding
The config-topic task-count/task-config record is a coordination/fencing signal, not a universal external-operation identity.
A reset can span:
1. Connect config/task-generation authority;
2. Kafka transactional primary-offset authority;
3. connector-managed external offset authority, if any.

No single Kafka-side record proves all three changed atomically.

## Crash windows
C626-1 STOPPED/config record durable, worker crashes before fence/reset: old generation is logically stopped but reset outcome remains unresolved.
C626-2 fence succeeds, crash before alterOffsets: old task generation is fenced; no assumption about offset mutation.
C626-3 external alterOffsets succeeds, crash before Kafka primary-offset transaction: cross-domain UNKNOWN.
C626-4 Kafka transaction commits, response lost: reconcile Kafka transaction/offset state; do not repeat with new identity.
C626-5 config topic restored/replayed with new Connect cluster incarnation: historical generation evidence must not automatically become current authority.
C626-6 task ID reused after restart: task ID alone is not an incarnation identity; bind task generation/connector incarnation/transactional ID lineage.

## Nexo mapping
Introduce distinct:
- ConnectorIncarnation
- TaskGeneration
- ConfigEpoch
- OffsetAuthorityIncarnation
- OffsetResetOperationID
- KafkaTransactionIdentity
- ExternalOffsetAuthorityIdentity
- FenceEpoch
- ReconciliationState

Safety: task ID reuse is never sufficient to treat a new task as the old writer. Historical config-topic evidence is not current authority after cluster/connector reincarnation without continuity proof.

## Conclusion
AB104.626 closes the specific “task-generation equals authority identity” ambiguity: generation/fencing is scoped to the Connect/Kafka participant. It must be combined with connector incarnation, offset-authority identity, and operation identity before Nexo can reason about reset/recovery across crashes or external offset stores.

## Next
AB104.627: research actual Kafka Connect implementation paths for task fencing/rebalance completion and source-offset reset ordering; build a source-level crash-window matrix and identify any missing durable operation identity.