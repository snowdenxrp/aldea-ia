# NEXO AB104.314 — Negative evidence and non-membership after crash/restore

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Absence of an operation becomes strong negative evidence only when the read is authoritative for a defined state frontier and the authenticated history/coverage is sufficient to exclude the operation. A stale read or incomplete historical window cannot prove NOT_COMMITTED.

## Evidence
etcd documents that linearizable reads reflect current consensus while serializable reads may be stale. Its revisioned history can support point-in-time reads, but compaction removes older revisions. Restore can move the visible revision backward; etcd recommends revision bumps to prevent old revisions from appearing current. citeturn0search0turn0search2turn0search8

## Nexo consequence
1. Candidate NOT_COMMITTED requires: authoritative target read + target incarnation binding + known coverage frontier + sufficient history/non-membership guarantee.
2. If the queried history is compacted, expired, lost during restore, or otherwise incomplete, absence => UNKNOWN, not NOT_COMMITTED.
3. A restored snapshot is not automatically a proof of absence for events after the snapshot frontier.
4. A lower restored revision must not be allowed to masquerade as the current frontier; a new incarnation/epoch or monotonic revision barrier is required before execution resumes.
5. Negative evidence is a claim about a bounded authenticated universe, not a universal claim that the operation never existed.

## Candidate proof tuple
`target_id + target_incarnation + authoritative_read_frontier + authenticated_history_coverage + operation_identity + non_membership_result`

## Explicit non-claims
No universal non-membership proof is selected. The exact mechanism depends on target semantics and retention guarantees.

## Next
AB104.315 — investigate authenticated coverage certificates: how to prove that the history/range inspected is complete enough for a negative claim.
