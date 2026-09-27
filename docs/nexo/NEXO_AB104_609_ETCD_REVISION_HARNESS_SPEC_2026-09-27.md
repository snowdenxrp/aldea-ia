# NEXO AB104.609 — exact etcd revision semantics + harness specification
Date: 2026-09-27
Status: research/design only; no Nexo implementation and no executed fault-test claims.

## Verified semantics
- etcd Txn comparisons are conjunctions and are evaluated atomically; comparisons can target VERSION, CREATE revision, MOD revision, VALUE, and lease. A successful modifying transaction increments the store revision once; TxnResponse top-level header is the authoritative response revision. citeturn0search6turn0search4
- etcd STM source uses observed ModRevision values as compare guards, illustrating how a read-set can be protected against concurrent writes. citeturn0search2
- Snapshot restore creates a new logical cluster and replaces member/cluster identity. A restore can use revision bumping; etcd documents this specifically to prevent revisions from decreasing and to protect watch/cache consumers. `--mark-compacted` can invalidate affected watches/caches. citeturn0search0turn0search3

## Critical interpretation
Revision is an ordering/version coordinate within an etcd authority incarnation, not a globally unique authority identity. `cluster_id + member_id + revision` is stronger evidence than revision alone, but Nexo still needs an explicit AuthorityIncarnation/epoch because restore creates a new logical cluster while preserving keyspace content.

## Minimal runnable harness specification
Harness components: disposable etcd instance; client; fault injector/proxy; durable operation journal; external-effect stub with its own EffectID state; snapshot/restore controller.

H1 CAS-ACK-LOSS: submit Txn with unique OperationID and compare predicate; inject connection failure after server commit but before response. Restart client; query authoritative state and operation journal; classify LOCAL_CAS_COMMITTED vs LOCAL_CAS_UNKNOWN. Never create a new OperationID before reconciliation.
H2 CAS-COMPARE-FAIL: mutate guarded key before Txn. Assert succeeded=false and no success-block mutation; classify local NOT_COMMITTED for that attempt.
H3 SERIALIZABLE-STALENESS: read through serializable endpoint, mutate from another client, attempt protected final gate. Assert stale evidence cannot satisfy the current guard.
H4 SNAPSHOT-RESTORE: capture snapshot; perform later writes; restore snapshot into new cluster with new identity. Assert old AuthorityIncarnation is not current. With revision bump, assert revision monotonicity for intended consumers; with mark-compacted, assert old watch/cache lineage is invalidated.
H5 OUTBOX-DUPLICATE: commit outbox row, publish, crash before relay deletion, restart. Assert same logical EffectID is redelivered and downstream dedup prevents duplicate effect.
H6 CONSUMER-CRASH: commit downstream effect, crash before acknowledgement/dedup persistence. Assert UNKNOWN unless effect+dedup share atomicity or reconciliation proves outcome.
H7 LOCAL-CAS/EXTERNAL-UNKNOWN: CAS commits local intent, external stub accepts but response is lost. Assert local committed + external UNKNOWN; retry original EffectID only after reconciliation.
H8 REINCARNATION: delete/recreate target, then retry old effect. Assert old resource incarnation cannot satisfy new target identity.

## Evidence record required
AuthorityDomainID; AuthorityIncarnation; OperationID/EffectID; AdmissionID/Generation; compare predicate digest; observed source revisions/versions; TxnResponse top-level revision; fault point; durable journal state; external provider/resource incarnation; reconciliation evidence; final classified state.

## Next
AB104.610: research the outbox/inbox atomicity boundary and concrete idempotent-consumer implementations, then derive the minimum crash-safe EvidenceRecord needed to prove deduplication without overclaiming exactly-once.