# NEXO AB104.325 — Replicated consensus state vs independently durable fencing

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
A replicated consensus log can establish an ordered protocol history only within its configured quorum and persistence assumptions. Fencing is a separate safety boundary when stale actors may still issue effects. Raft's term mechanism rejects stale leaders/messages, while external fencing systems require the resource itself to reject stale tokens. citeturn0search0turn0search1

Therefore, restoring consensus state does not automatically restore the safety frontier of an external target. If the consensus snapshot is rolled back while an external fence remains ahead, the restored controller must not issue effects using the older frontier. Conversely, if the fence state is rolled back independently, old controllers may regain an apparently valid token unless a new authority/incarnation barrier is established.

## Split-brain boundary
During delayed-message or partition scenarios, two controllers may each possess locally valid historical state. The decisive safety property is not which controller has the newer local timestamp, but whether the actual effect target rejects stale authority at its effect boundary.

## Nexo candidate rule
Treat these as separate frontiers:
`CONSENSUS_FRONTIER`
`AUTHORITY_FRONTIER`
`TARGET_FENCE_FRONTIER`
`TARGET_INCARNATION_FRONTIER`

Recovery is executable only when the required frontiers have an authenticated compatible ordering. A mismatch or unknown relationship => `UNKNOWN/STOP`; a contradictory authenticated relationship => `CONFLICT`.

A consensus quorum certificate can prove a protocol decision but cannot by itself fence an external target that does not enforce the authority token.

## Candidate recovery states
`CONSENSUS_RECOVERED_FENCE_CURRENT`
`CONSENSUS_AHEAD_FENCE_UNKNOWN`
`FENCE_AHEAD_REQUIRES_RECONCILIATION`
`NEW_INCARNATION_REQUIRED`
`CONFLICT`
`UNKNOWN_STOP`

No implementation or final ordering relation selected.

## Next
AB104.326 — study delayed-message replay after recovery: determine whether stable operation identity + target incarnation + fence epoch is sufficient to reject old requests across partitions.
