# NEXO CONTINUITY CHECKPOINT — AB104.269 — 2026-09-26

AB104.269 persisted.

Key finding: duplicate delivery requires stable logical operation identity, but identity must be bound to target incarnation and payload fingerprint. Authority rotation cannot silently reinterpret a pending F7 operation; it must be revalidated/fenced. Same operation_id + different fingerprint is CONFLICT. Same operation_id in a new target incarnation is a new execution context requiring fresh authorization/reconciliation. Dedupe state itself needs retention and anti-rollback protection.

Status: research only; no architecture/implementation. AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending.

Next: AB104.270 — dedupe retention/expiry and UNKNOWN vs safe retry.