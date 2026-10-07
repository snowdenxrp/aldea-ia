# P112 SMALLEST LOCAL TRANSACTION CANDIDATE V1 — 2026-10-07

Research-only; no implementation and no runtime execution claimed.

## Candidate local boundary
The smallest defensible local transaction is not the whole simulation tick. It is a protected claim transition whose durable record carries:
- Operation/Admission identity;
- authority/dependency provenance snapshot;
- prepared intent;
- deterministic local transition inputs;
- resulting local state/history delta;
- commit marker/outcome sufficient for crash recovery.

The boundary must cover every local mutation in the protected WriteSet, but not automatically unrelated post-effect learning/event bookkeeping.

## Crash cuts this candidate can close
A WAL-like protocol demonstrates the useful principle: durable commit requires the commit record to survive the crash; WAL systems log before data changes and recover from the log. This is a conceptual cross-check, not a prescription to use PostgreSQL. citeturn0search1turn0search0

1. Before PREPARED durable: NOT_COMMITTED / no protected mutation permitted.
2. PREPARED durable, before mutation: recoverable PREPARED / NOT_ATTEMPTED.
3. Mutation plus durable commit record: COMMITTED.
4. Crash after mutation but before durable commit record: still UNKNOWN unless mutation and commit share a true atomic storage transaction or recovery can prove the outcome.
5. Crash after durable commit record but before response: COMMITTED after recovery, even if caller saw an exception/no response.

This is why a durable commit marker is materially different from merely persisting state before or after a handler.

## Remaining hard boundary
If local mutation occurs in ordinary JS object memory and durable persistence occurs afterward, there is no demonstrated atomic point joining them. A filesystem lock/rename can make the persisted file transition robust, but it does not turn the prior in-memory mutation and file commit into one atomic transaction.

Therefore the current repository still needs a future explicit transaction/recovery owner if it wants COMMITTED vs UNKNOWN to close across the mutation→durability crash cut.

## External effect separation
Even a successful local transaction does not prove an external provider effect is exactly-once. External effects require their own capability contract: provider transaction, fence, idempotency key, reconciliation, or conservative UNKNOWN handling.

## Status
GREEN: minimum local transaction contents and closed/open crash cuts are now explicit.
BLUE: exact implementation-independent owner/atomic storage mechanism remains OPEN.

## Exact next
Trace the actual persistence primitive (lock/temp/rename/stateRevision) and test which crash cuts it closes by contract, then compare against the local transaction candidate. Do not assume rename = transaction or lock = rollback.

## DO-NOT-REPEAT
No implementation; no TLC rerun; no global stateRevision promotion; no AB104.185 primary; no AB105.117R; no exactly-once external-effect claim.
