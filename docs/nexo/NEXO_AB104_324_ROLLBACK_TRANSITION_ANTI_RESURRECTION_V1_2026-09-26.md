# NEXO AB104.324 — Rollback across authority transition and anti-resurrection

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Consensus systems use monotonically advancing terms/epochs to reject stale leaders and stale information; restoring older state cannot safely recreate current authority. Raft implementations also distinguish restoration of state from the current term/configuration and reject stale terms. citeturn0search0turn0search3turn0search24

RATS independently shows that epoch identifiers can be delayed, replayed, or selectively dropped, so recovery cannot infer freshness from a restored epoch value alone. citeturn0search1turn0search25

## Nexo consequence
Rollback must be split into:
- **application/data frontier** — may legitimately move backward during restore;
- **authority/fence frontier** — must not move backward;
- **incarnation/recovery frontier** — must advance or be authenticated as newer before effects resume.

Candidate anti-resurrection invariant:
`RecoveredExecutableAuthority >= pre-rollback authority frontier`
for the same lineage, OR a strictly newer authenticated authority/incarnation barrier must be established before any external effect.

A restored pre-transition certificate may remain historical evidence, but it must not become executable merely because the application snapshot reverted to the old state.

## Recovery classification
`ROLLBACK_SAFE_DATA_ONLY | AUTHORITY_FRONTIER_PRESERVED | NEW_INCARNATION_REQUIRED | REPLAY_REJECTED | UNKNOWN | CONFLICT`

If the authority/fence frontier was included in rollback or its durability cannot be established, execution should remain blocked/UNKNOWN until a new authenticated authority barrier is established.

## Non-claim
This is a candidate semantic rule, not a formally verified invariant and not an implementation.

## Next
AB104.325 — study whether rollback of replicated consensus state can safely coexist with independently durable fencing/authority state, including split-brain and delayed-message cases.
