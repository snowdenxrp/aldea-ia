# NEXO CONTINUITY CHECKPOINT — AB104.275 — 2026-09-26

AB104.275 persisted.

Key finding: equivocation/fencing must survive crash/restore strongly enough that an older snapshot cannot resurrect a fenced authority. Raft's persistent term/log state and snapshot index/term/configuration show the importance of monotonic recovery boundaries. A valid historical signature is not current authorization. If recovery cannot prove a fence was not rolled back, execution remains blocked/UNKNOWN. New authority incarnation must be distinguishable from the fenced predecessor.

Direct prototype inspection: effect-adapter.js has prepared/reconciliation and idempotency handling, but no demonstrated authority-equivocation persistence or anti-resurrection fence.

Status: research only; no architecture/implementation. AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending. No fabricated SHAs.

Next: AB104.276 — rollback/restore attacks against authority and effect evidence; monotonicity requirements.