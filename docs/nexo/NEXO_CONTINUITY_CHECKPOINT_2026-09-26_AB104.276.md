# NEXO CONTINUITY CHECKPOINT — AB104.276 — 2026-09-26

AB104.276 persisted.

Rollback/restore finding: a snapshot can be internally valid yet historically stale. etcd documents revision rollback on restore and uses revision bumping/mark-compacted to invalidate stale observations; restore also establishes a new logical cluster identity. Raft snapshots bind a replaced committed prefix to last-included index/term/configuration. Therefore restored validity != current authority. Missing evidence after rollback != NOT_COMMITTED. Rollback without a fresh monotonic fence must not enable external effects. Old workers/target identities must not silently become current again.

Candidate invariants:
RESTORED_VALID != CURRENT_AUTHORITY.
MISSING_AFTER_ROLLBACK != NOT_COMMITTED.
ROLLBACK_WITHOUT_FRESH_FENCE -> NO_EXTERNAL_EFFECT.

Status: research only; no implementation, architecture selection, semantic freeze, or formal verification.
AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending. No fabricated SHAs.

Next: AB104.277 — rollback of target state itself and distinguishing legitimate historical state from replayable current state.