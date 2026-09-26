# NEXO CONTINUITY — AB104.324

## Canonical state
AB104.324 research persisted. No implementation performed.

## Finding
Rollback can legitimately move application/data state backward, but it must not roll back the executable authority/fence frontier. Consensus terms/epochs reject stale leaders; RATS warns epoch IDs can be replayed/delayed/dropped, so restored epoch state alone does not establish freshness. citeturn0search0turn0search1turn0search25

## Candidate anti-resurrection invariant
`RecoveredExecutableAuthority >= pre-rollback authority frontier`
for the same lineage, OR a strictly newer authenticated authority/incarnation barrier must exist before effects resume.

Old certificates may remain historical evidence but cannot regain executable authority after rollback.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.325: study rollback of replicated consensus state versus independently durable fencing/authority state, including split-brain and delayed-message cases.

## DO-NOT-REPEAT
Do not treat restored application revision, epoch number, or old valid certificate as proof of current executable authority.
