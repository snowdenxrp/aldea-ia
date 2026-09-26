# NEXO AB104.276 — Rollback/restore attacks against authority and effect evidence — 2026-09-26

Research-only.

Evidence:
- etcd documents that restoring an older snapshot can move revisions backward and recommends revision bumping plus compaction to invalidate stale caches. Restore also creates a new logical cluster identity. citeturn0search0turn0search1
- Raft snapshots carry last-included index/term and configuration metadata; a snapshot replaces only the committed prefix represented by that boundary. citeturn0search12

Findings:
1. A restored state can be internally valid yet historically stale.
2. Therefore validity/integrity of a snapshot does not imply current authority.
3. Monotonic recovery metadata is required where stale state could otherwise resurrect authority, dedupe state, or effect permissions.
4. A rollback must be distinguishable as a new recovery/incarnation boundary; old workers and old target identities cannot silently become current again.
5. Evidence that disappeared because of rollback must not be interpreted as evidence that the event never happened.
6. If monotonicity cannot be proven across restore, execution must remain fenced until reconciliation establishes the current authority/evidence frontier.
7. etcd's revision bump/mark-compacted pattern is useful evidence for the principle: restore may require explicit invalidation of pre-restore observations rather than merely loading old data.

Candidate invariants:
RESTORED_VALID != CURRENT_AUTHORITY.
MISSING_AFTER_ROLLBACK != NOT_COMMITTED.
ROLLBACK_WITHOUT_FRESH_FENCE -> NO_EXTERNAL_EFFECT.

No architecture selected or implemented. AB50–AB58 residuals unchanged.

Next: AB104.277 — rollback of target state itself and how to distinguish legitimate historical state from replayable current state.