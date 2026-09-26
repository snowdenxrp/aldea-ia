# NEXO CONTINUITY — AB104.330

## Canonical state
AB104.330 research persisted. No implementation performed.

## Finding
Compaction changes evidence coverage. etcd drops historical revisions before its compaction point; restored snapshots can expose older revision state. citeturn0search1turn0search0

## Required boundary
`COMPACTED != FORGOTTEN`
`ABSENT_AFTER_COMPACTION != NOT_COMMITTED`

A compacted frontier needs authenticated coverage/summary metadata for any future claim that depends on discarded history. If required history is not covered, the result remains UNKNOWN.

Candidate compaction artifact includes coverage interval, frontier/dependency digests, retained claims, unresolved UNKNOWN set, authority/epoch, target incarnation, schema/semantic version, and archive reference.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.331: study authenticated summary/checkpoint schemes and the minimum information that must survive compaction for non-membership, UNKNOWN, lineage, and conflict semantics.

## DO-NOT-REPEAT
Do not equate missing compacted history with proof that an operation never happened.
