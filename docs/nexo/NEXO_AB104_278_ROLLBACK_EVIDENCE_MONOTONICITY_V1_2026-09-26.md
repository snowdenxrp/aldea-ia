# NEXO AB104.278 — Rollback evidence monotonicity — 2026-09-26

Research-only.

Findings:
- Raft rejects obsolete snapshots and uses snapshot index/term plus persistent state as recovery boundaries. Its restart procedure requires persistent HardState/snapshot/entries to be restored before normal operation. citeturn0search0turn0search2
- etcd recovery explicitly addresses revision rollback after snapshot restore; revision bumping and marking revisions compacted prevent consumers from treating an older lineage as current. citeturn0search6
- Candidate Nexo rule: restored evidence must carry a monotonic lineage/fence domain. A snapshot that is internally valid can still be semantically stale relative to already-issued authority/effect evidence.
- Anti-rollback must cover authority epochs, target incarnation, operation/dedupe history and archival certificates, not only the primary state snapshot.
- If freshness cannot be proven after restore, execution remains fenced/UNKNOWN until reconciliation. Never infer NOT_COMMITTED from absence in a rolled-back snapshot.
- Restore should establish a new logical incarnation where appropriate, so pre-restore actors cannot silently become current again.

Status: research only; no architecture selection, implementation, semantic freeze, or formal verification. AB50–AB58 residuals unchanged.

Next: AB104.279 — delayed messages from pre-restore state and replay resistance.
