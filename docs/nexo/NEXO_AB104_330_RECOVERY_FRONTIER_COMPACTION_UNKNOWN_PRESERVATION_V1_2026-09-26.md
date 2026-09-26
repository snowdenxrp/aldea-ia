# NEXO AB104.330 — Recovery-frontier compaction without erasing UNKNOWN

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
History compaction can deliberately make older revisions inaccessible; etcd explicitly documents that revisions before the compaction point cannot be read, and restore from an older snapshot can move the visible revision backward unless a recovery bump is used. citeturn0search1turn0search0

Therefore compaction is not merely storage cleanup: it changes the evidence coverage frontier.

## Nexo consequence
A frontier may be compacted only after preserving an authenticated summary/certificate that retains every semantic fact needed for future admission decisions. If a discarded interval contained an unresolved possibility relevant to a future claim, the summary must preserve that uncertainty rather than converting absence of retained records into `NOT_COMMITTED`.

Candidate compaction artifact:
`coverage_start/end + frontier_digest + dependency_digest + retained_claims + unresolved_UNKNOWN_set + authority/epoch + target_incarnation + schema/semantic_version + archive_reference`

## Critical rules
1. `COMPACTED != FORGOTTEN` when the evidence is still needed for safety/history claims.
2. `ABSENT_AFTER_COMPACTION != NOT_COMMITTED`.
3. An authenticated summary preserves only the claims it explicitly covers; it cannot recreate omitted evidence.
4. If a future admission predicate requires a discarded fact that the certificate does not cover, result remains `UNKNOWN`.
5. Incomparable frontiers must not be merged by picking the numerically largest revision.
6. Archive references themselves need lineage/coverage verification before being used to close a gap.

## Candidate states
`COMPACTED_COVERED | COMPACTED_PARTIAL | COMPACTED_GAP | COMPACTED_CONFLICT | UNKNOWN`

## Non-claim
No final compaction protocol or certificate format selected; no implementation/formal verification performed.

## Next
AB104.331 — study authenticated summary/checkpoint schemes: what minimum information must survive compaction to preserve non-membership, UNKNOWN, lineage, and conflict semantics.
