# NEXO CONTINUITY CHECKPOINT — AB104.270 — 2026-09-26

AB104.270 persisted.

Key finding: dedupe expiry is loss of replay-prevention evidence, not evidence of non-occurrence. Therefore DEDUPE_EXPIRED != NOT_COMMITTED; UNKNOWN must remain UNKNOWN/UNKNOWN_PERMANENT unless authoritative evidence resolves it. Retention must cover retries plus delayed delivery, recovery, replication lag, restore/replay, authority rotation and target-incarnation changes. Compaction must preserve enough evidence to distinguish COMMITTED/NOT_COMMITTED/UNKNOWN/CONFLICT.

Prototype risk retained: effect journal has a 200-entry cap; this is not yet proven to satisfy semantic retention.

Status: research only. No implementation/architecture selection. AB50–AB58 residuals unchanged. Pending AB104.256/257/259 remain pending.

Next: AB104.271 — archival certificate and safe compaction of dedupe/effect history.