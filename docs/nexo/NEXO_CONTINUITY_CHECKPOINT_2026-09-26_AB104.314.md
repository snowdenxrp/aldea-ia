# NEXO CONTINUITY — AB104.314

## Canonical state
AB104.314 research persisted. No implementation performed.

## Finding
NOT_COMMITTED requires authoritative read + incarnation binding + sufficient authenticated history/coverage. Stale, compacted, expired, lost, or restored-incomplete history yields UNKNOWN rather than proof of absence. etcd explicitly distinguishes linearizable reads from potentially stale serializable reads and documents revision rollback during restore. citeturn0search0turn0search2

## Constraints
Research first; no V21; no historical patching; no unsupported security/correctness/verification claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.315: research authenticated coverage certificates and how to prove a history/range is complete enough for negative evidence.

## DO-NOT-REPEAT
Do not equate key absence, a stale read, a compacted history, or an older restored snapshot with proof that an external operation never committed.
