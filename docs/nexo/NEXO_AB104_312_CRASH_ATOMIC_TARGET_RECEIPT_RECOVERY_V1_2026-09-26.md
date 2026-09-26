# NEXO AB104.312 — Crash points at the atomic target boundary

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
If operation identity, target mutation, and authoritative receipt are truly committed in one durable transaction, recovery can reconstruct the committed result from that transaction without replaying the external effect. The dangerous cases are crashes before commit or when the supposed boundary is actually split across domains.

## Crash classification
1. BEFORE_TARGET_COMMIT: no target commit established; retry may be admitted only under the target's contract.
2. DURING_TRANSACTION_BEFORE_DURABLE_COMMIT: outcome depends on the transaction system's recovery semantics; do not infer from client timeout alone.
3. AFTER_ATOMIC_TARGET_COMMIT_BEFORE_RESPONSE: target transaction is authoritative; recovery should replay the stored result, not re-execute the mutation.
4. OUTSIDE_TARGET_TRANSACTION: if mutation happened in another domain, target-local receipt cannot prove the external effect.

## Nexo consequence
- Recovery must read the authoritative target registry/receipt first.
- A durable COMMITTED record is a recovery fact, not permission to repeat the effect.
- If no authoritative record exists and the effect boundary was not atomic, preserve UNKNOWN_EXTERNAL rather than guessing.
- Client-side retries cannot distinguish pre-commit from post-commit without target evidence.
- Target restore must preserve the transaction's committed frontier and target incarnation; rollback that loses receipts/dedupe state reopens ambiguity.

## Explicit non-claims
This establishes a semantic classification, not a proof that a particular database or API implements the required atomic boundary.

## Sources studied
Durable transaction/recovery semantics and idempotent API guidance, including the distinction between committed target state and client-visible response timing. citeturn0search0turn0search1

## Next
AB104.313 — investigate recovery when the target transaction commits but the receipt is separately materialized/cached, including replica lag and stale reads.
