# NEXO CONTINUITY CHECKPOINT — AB104.278 — 2026-09-26

AB104.278 persisted.

Key finding: restore must preserve monotonic evidence/authority lineage. A snapshot can be internally valid yet semantically stale. Anti-rollback must cover authority epoch, target incarnation, operation/dedupe history and archival certificates. If freshness cannot be proven, remain fenced/UNKNOWN; absence from a rolled-back snapshot is not NOT_COMMITTED. A new logical incarnation may be required so pre-restore actors cannot silently become current again.

Evidence: etcd recovery uses revision bumping/compaction to prevent revision rollback from being treated as current; etcd/raft rejects obsolete snapshots and restores persistent HardState/snapshot/entries before normal operation. citeturn0search0turn0search2turn0search6

Status: research only; no architecture/implementation/semantic freeze/formal verification. AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending; no fabricated SHAs.

Next: AB104.279 — delayed messages from pre-restore state and replay resistance.
