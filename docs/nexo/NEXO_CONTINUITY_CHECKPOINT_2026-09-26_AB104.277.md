# NEXO CONTINUITY CHECKPOINT — AB104.277 — 2026-09-26

AB104.277 persisted.

Rollback finding: restored historical state must not regain current executable authority. etcd explicitly handles revision rollback with revision bump/compaction; its WAL terms are expected monotonic, and Raft snapshots retain last-included index/term/configuration. Candidate Nexo rule: restore must not decrease executable authority generation, target incarnation, effect/dedupe evidence frontier, or freshness guarantees. If freshness/lineage cannot be proven, remain blocked/UNKNOWN and reconcile. Old state can be historical input only if isolated in a new logical incarnation/epoch that prevents stale identities from re-entering execution.

Status: research only; no architecture/implementation/semantic freeze. AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending; no fabricated SHAs.

Next: AB104.278 — rollback of effect/dedupe evidence and split-brain recovery.