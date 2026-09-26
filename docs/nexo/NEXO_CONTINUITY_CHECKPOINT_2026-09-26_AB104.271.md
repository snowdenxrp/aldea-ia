# NEXO CONTINUITY CHECKPOINT — AB104.271 — 2026-09-26

AB104.271 persisted.

Key finding: safe compaction is not deletion; retained snapshot/certificate must preserve the semantics needed after discarded history is gone. For Nexo, an archival certificate should bind operation identity, target identity/incarnation, fingerprint, authority/fence, covered range, predecessor lineage, resolution state, evidence, retention, and authenticity/integrity. UNKNOWN must survive compaction and never become NOT_COMMITTED by omission. Archive evidence does not automatically prove target mutation. The prototype's 200-entry journal is not a demonstrated archival certificate.

Candidate lifecycle: LIVE → SEALED → CERTIFIED_ARCHIVED/COMPACTED → LIVE_NEXT.

Status: research only; no architecture/implementation. AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending.

Next: AB104.272 — archival certificate dependencies/common-mode and joint negative claims.