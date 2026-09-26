# NEXO AB104.269 — Duplicate delivery, operation identity, authority rotation and target incarnation — 2026-09-26

Research-only.

Evidence:
- Transactional outbox relays can publish the same message more than once after a relay crash; consumers therefore need idempotency/deduplication. citeturn0search0turn0search1
- etcd transactions can atomically compare revisions/values and apply guarded updates; revisions provide a logical ordering point inside etcd. citeturn0search5turn0search8

Findings:
1. A durable operation identity must be stable across retry/recovery of the same logical effect, otherwise duplicate delivery cannot be recognized as the same operation.
2. Identity must not be reused across target incarnations. A target restore/replacement can make an old operation ID unsafe to interpret as already applied.
3. Therefore candidate identity context is at least: authority root/generation, target identity + incarnation, operation_id, payload fingerprint, and effect-contract/version context.
4. Authority rotation must not silently change the meaning of an existing operation. A pending F7 operation must either be explicitly revalidated under F8 or be rejected/fenced; it must not inherit F8 merely because the relay retried.
5. Same operation_id + different payload fingerprint is a collision/conflict, not an idempotent duplicate.
6. Same payload + same operation_id in a new target incarnation is a distinct execution context and requires fresh authorization/reconciliation.
7. Deduplication evidence itself needs retention/anti-rollback semantics; losing the dedupe registry can turn a historical duplicate into an apparently new request.

Candidate separation:
SAME_OPERATION != SAME_TARGET_INCARNATION
IDEMPOTENT_RETRY != AUTHORITY_REVALIDATION
DUPLICATE_ID != SAFE_REPLAY

No architecture selected or implemented. Prototype remains without demonstrated target incarnation/authority/fingerprint binding.

AB50–AB58 residuals unchanged. Next: AB104.270 — retention/expiry of dedupe records and the boundary between UNKNOWN and safe retry.