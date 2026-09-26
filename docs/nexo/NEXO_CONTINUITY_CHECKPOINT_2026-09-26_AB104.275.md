# NEXO CONTINUITY CHECKPOINT — AB104.275 — 2026-09-26

AB104.275 persisted and refreshed with the full research result.

Key finding: authority fencing/conflict must survive crash/restore. A stale snapshot cannot resurrect a previously fenced authority. Recovery must compare restored authority state against the newest trusted fence/epoch evidence before re-enabling execution; if freshness cannot be proven, remain blocked/UNKNOWN. Raft snapshot restoration provides a concrete precedent for treating snapshot index/term/configuration as safety boundaries. A valid historical signature is not current authorization. New authority incarnations must be distinguishable from fenced predecessors.

Direct Nexo effect-adapter inspection: prepared-effect reconciliation and idempotency handling exist, but no demonstrated authority-equivocation persistence or anti-resurrection fence.

Status: research only; no implementation, architecture selection, semantic freeze, or formal verification.
AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending. No fabricated SHAs.

Next: AB104.276 — rollback/restore attacks against authority and effect evidence; monotonicity requirements.