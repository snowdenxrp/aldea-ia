# NEXO CONTINUITY CHECKPOINT — AB104.272 — 2026-09-26

AB104.272 persisted.

Key finding: certificate count does not establish evidence independence. Shared snapshot/WAL, trust root, issuer, target incarnation or observation boundary can create common-mode failure. ARCHIVE_ABSENCE cannot prove TARGET_NOT_COMMITTED without authoritative complete coverage, retention, incarnation, authority/fence and anti-rollback. Conflicting certificates must be resolved by lineage/authority/coverage, not vote count. Dependency metadata must survive compaction.

Status: research only; no architecture/implementation. AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending.

Next: AB104.273 — quorum certificates and independence under shared trust roots/replicas.