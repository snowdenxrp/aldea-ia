# NEXO AB104.268 — Cross-domain commit / transactional outbox — 2026-09-26

Research-only.

Evidence:
- etcd transactions atomically guard and apply state changes within etcd; completed KV operations are durable and linearizable/strictly serializable. This guarantee applies to the etcd state domain, not automatically to an external target. citeturn0search0turn0search1
- Transactional Outbox solves the database→message ordering gap by storing the outgoing message in the same local transaction, then relaying it. The relay can publish more than once after a crash, so consumers still need idempotency. citeturn0search5

Finding:
1. An outbox creates a durable handoff boundary, not atomicity with the external effect.
2. It proves that the intent/event was durably committed to the outbox domain; it does not by itself prove target-side mutation.
3. Relay crash after target acceptance but before recording completion creates the same UNKNOWN_EXTERNAL class already identified in AB104.206+.
4. Idempotent target operation identity can make retry convergent, but idempotency alone is not proof of whether the first attempt committed.
5. Therefore Nexo should treat outbox/relay as evidence and delivery machinery, while target-side authoritative commit/reconciliation remains the effect proof boundary.
6. If authority fencing changes while an outbox item is pending, the relay must not assume the old authorization remains current; the target must enforce current authority/fence at acceptance.

Candidate separation:
OUTBOX_DURABLE != TARGET_COMMITTED
DELIVERY_ATTEMPT != EFFECT_PROOF
IDEMPOTENT_RETRY != HISTORICAL_COMMIT_PROOF

No architecture selected or implemented. Prototype does not demonstrate cross-domain atomicity.

AB50–AB58 residuals unchanged. Next: AB104.269 — duplicate delivery, idempotency and operation identity under authority rotation/target incarnation.