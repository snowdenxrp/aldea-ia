# NEXO CONTINUITY — AB104.325

## Canonical state
AB104.325 research persisted. No implementation performed.

## Finding
Replicated consensus state and external fencing are separate safety frontiers. Consensus can order protocol history, but an external target is protected from stale actors only if it enforces the relevant fence at the actual effect boundary. Raft terms reject stale protocol messages; external fencing remains a separate target property. citeturn0search0turn0search1

## Required frontiers
`CONSENSUS_FRONTIER`
`AUTHORITY_FRONTIER`
`TARGET_FENCE_FRONTIER`
`TARGET_INCARNATION_FRONTIER`

Executable recovery requires an authenticated compatible ordering. Unknown relationship => `UNKNOWN/STOP`; contradictory authenticated relationship => `CONFLICT`.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.326: study delayed-message replay after recovery and whether operation identity + target incarnation + fence epoch can reject stale requests across partitions.

## DO-NOT-REPEAT
Do not infer external fencing from a consensus certificate or from a restored consensus snapshot alone.
