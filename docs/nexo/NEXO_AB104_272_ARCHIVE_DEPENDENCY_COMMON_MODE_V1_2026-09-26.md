# NEXO AB104.272 — Archive certificate dependency and common-mode — 2026-09-26

Research-only.

Evidence:
- Raft snapshots replace only committed/applied history and retain index/term/configuration metadata needed to reconnect the remaining log; etcd-raft rejects obsolete snapshots and preserves the committed boundary during restore. citeturn0search24turn0search0turn0search3

Findings:
1. Multiple archival certificates are not automatically independent evidence. If they derive from the same snapshot, WAL, trust root, issuer, target incarnation, or observation boundary, they share failure modes.
2. A quorum of certificates from one common corrupted/rolled-back source does not become independent merely by counting signatures.
3. Negative claims are especially sensitive: ARCHIVE_ABSENCE does not prove TARGET_NOT_COMMITTED unless coverage, retention, incarnation, authority/fence and anti-rollback are authoritative and complete.
4. Certificate composition therefore needs an evidence-dependency graph. Each certificate records its source lineage and covered observation boundary.
5. A composed claim is admissible only when required dependencies are intact and no common-mode failure invalidates the whole set.
6. If one certificate says UNKNOWN and another says NOT_COMMITTED, do not resolve by count. Trace lineage/authority/coverage; unresolved conflict remains CONFLICT/UNKNOWN.
7. Compaction must preserve dependency metadata, not merely hashes of certificate payloads.

Candidate rule:
CERTIFICATE_COUNT != EVIDENCE_INDEPENDENCE.
ARCHIVE_ABSENCE != TARGET_NOT_COMMITTED without authoritative complete coverage.

No architecture selected or implemented. AB50–AB58 residuals unchanged.

Next: AB104.273 — quorum certificates and independence under shared trust roots/replicas.