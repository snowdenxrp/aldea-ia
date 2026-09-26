# NEXO AB104.270 — Dedupe retention/expiry and UNKNOWN vs safe retry — 2026-09-26

Research-only.

Evidence:
- Reliable idempotency requires a stable key and durable outcome association; late retries after a dedupe window can become new executions. Current literature also stresses that timeout does not establish failure.
- Outbox/consumer patterns commonly use at-least-once delivery, making duplicate handling dependent on durable dedupe state.

Findings:
1. Dedupe expiry is a loss of replay-prevention evidence, not evidence that the original operation did not occur.
2. Therefore expiry must never transform UNKNOWN_EXTERNAL into NOT_COMMITTED.
3. After expiry, retry safety depends on an independent authoritative target proof, a new operation identity with explicit policy, or a target protocol that guarantees conditional deduplication across the relevant historical window.
4. Deleting the dedupe record without preserving a historical certificate can create a replay ambiguity: the system no longer knows whether the old operation committed.
5. A safe compaction path must preserve enough evidence to distinguish historical COMMITTED, NOT_COMMITTED, UNKNOWN and CONFLICT, or explicitly retain UNKNOWN_PERMANENT.
6. Retention must cover not only normal retries but recovery, replication lag, delayed delivery, restore/replay, authority rotation, and target-incarnation transitions.
7. Same key + different fingerprint remains CONFLICT even after expiry if historical identity can be recovered; absence of the old record alone is insufficient to call it a fresh safe operation.

Candidate rule:
DEDUPE_EXPIRED != NOT_COMMITTED.
UNKNOWN + EXPIRED -> UNKNOWN/UNKNOWN_PERMANENT unless authoritative evidence resolves it.

No architecture selected or implemented. Prototype's 200-entry effect journal remains an identified semantic-retention risk.

AB50–AB58 residuals unchanged. Next: AB104.271 — archival certificate and whether compaction can safely preserve dedupe/effect history.