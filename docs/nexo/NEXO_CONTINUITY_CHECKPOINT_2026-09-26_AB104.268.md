# NEXO CONTINUITY CHECKPOINT — AB104.268 — 2026-09-26

AB104.268 persisted.

Key finding: transactional outbox provides a durable handoff inside one state domain, not atomicity with an external effect. Outbox durability proves intent/event persistence, not target mutation. Relay crash after target acceptance can still yield UNKNOWN_EXTERNAL. Idempotent retry aids convergence but does not prove historical commit. If authority rotates while an outbox item is pending, stale authorization must not be trusted; target-side fencing/revalidation is required.

Status: research only; no architecture selection/implementation. AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending.

Next: AB104.269 — duplicate delivery, idempotency and operation identity across authority rotation and target incarnation.