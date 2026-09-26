# NEXO AB104.277 — Rollback attacks and monotonicity — 2026-09-26

Research-only.

Findings:
- etcd restore explicitly addresses revision rollback: an old snapshot can make observed revision decrease; revision bumping and compaction can invalidate stale consumers. citeturn0search0
- etcd WAL terms are expected to be monotonic; committed HardState is the stable boundary, while entries beyond commit may be overridden. citeturn0search1
- Raft snapshots carry last-included index/term and configuration, allowing restored state to reconnect to the committed history boundary. citeturn0search12

Nexo implications:
1. A rollback must not decrease executable authority generation, target incarnation, or evidence frontier.
2. Restored state may be historically valid but must be fenced from acting as current state until freshness/lineage is proven.
3. Monotonicity must cover authority, effect evidence, dedupe state and target incarnation—not just timestamps.
4. If monotonicity cannot be proven after restore, execution remains blocked/UNKNOWN and reconciliation is required.
5. Anti-rollback metadata itself must survive compaction/restore; otherwise an attacker or faulty restore can resurrect stale permissions.
6. A lower restored revision can be accepted as historical input only if the system creates a new logical incarnation/epoch and prevents old identities from re-entering the current execution domain.

Candidate invariant: RESTORE(old_state) MUST NOT imply REACTIVATE(old_authority).

No architecture selected, no implementation, no semantic freeze. AB50–AB58 residuals unchanged.

Next: AB104.278 — rollback of effect/dedupe evidence and split-brain recovery.