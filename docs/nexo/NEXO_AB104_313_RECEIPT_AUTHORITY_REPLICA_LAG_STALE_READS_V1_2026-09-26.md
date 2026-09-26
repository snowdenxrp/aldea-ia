# NEXO AB104.313 — Receipt authority, replica lag, and stale reads

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
A receipt or observation is only authoritative for recovery if its read path provides the required consistency/lineage guarantee. A stale replica can legitimately report that a committed operation is absent or return an older result; therefore replica absence must not be promoted to NOT_COMMITTED without an authenticated coverage/consistency guarantee.

## Nexo consequence
1. Classify evidence by authority: TARGET_PRIMARY/LINEARIZABLE, TARGET_QUORUM/CONTRACTED, REPLICA_STALE_OR_UNKNOWN, CACHE, INTERMEDIARY.
2. A negative read from a potentially stale replica is insufficient to prove non-commit.
3. A positive receipt from a stale replica may still be historical evidence, but its freshness/incarnation/lineage must be validated before using it as current state.
4. Recovery should prefer the target's documented authoritative read/commit index or equivalent consistency boundary.
5. If the target cannot establish the necessary read frontier, preserve UNKNOWN rather than manufacture absence.
6. Receipt caches can accelerate recovery but must not silently become the authority unless their provenance and freshness contract explicitly permits it.

## Candidate evidence tuple
`target_id + target_incarnation + operation_id + commit/sequence frontier + receipt_digest + authority/provenance + freshness/coverage`

## Explicit non-claims
No specific database consistency model is selected; the required frontier depends on the target contract.

## Next
AB104.314 — study negative evidence/non-membership after crash and restore: when can absence of an operation be proven rather than merely observed?
