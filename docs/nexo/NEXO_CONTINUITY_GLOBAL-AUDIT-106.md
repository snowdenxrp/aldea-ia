# NEXO CONTINUITY — GLOBAL-AUDIT-106

Artifact: 65a316bf4fe1d5f15342878a592f29bfcd7f3616
Mission: operation identity / attempt lineage / cross-provider idempotency / reconciliation.

GLOBAL-AUDIT-106 adds fresh evidence that logical operation identity, retry identity, provider incarnation, dedup domain, receipts, and world effects must remain separate. AWS Durable Execution explicitly separates deterministic OperationId from AttemptNumber and documents that at-most-once is per retry attempt, not exactly-once across a workflow. Cloud Tasks permits duplicate execution and does not guarantee execution order. etcd restore changes cluster/member identity and may require revision handling for stale caches/watchers.

Critical carryover:
- FutureObs_PAA remains UNKNOWN.
- AB55/AB56 unresolved ternary/PAA/EventDAG/reconstruction gaps remain unchanged.
- No architecture implementation.
- No V21.
- No semantic freeze.
- No formal verification.

Next exact mission: GLOBAL-AUDIT-107, continue adversarial research on the remaining cross-provider effect/history boundary without collapsing UNKNOWN into absence.
