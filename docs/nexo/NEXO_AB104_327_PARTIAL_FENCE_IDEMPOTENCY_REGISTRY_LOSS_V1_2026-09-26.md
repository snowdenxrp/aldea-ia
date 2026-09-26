# NEXO AB104.327 — Partial loss of fence/idempotency state

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Recovery documentation for etcd explicitly distinguishes snapshot lineage from current revision and uses revision bumps to prevent restored state from appearing current; external-effect recovery guidance likewise requires durable operation identity and enough state to reconcile ambiguous calls. citeturn0search0turn0search2

For fencing, the protected resource must retain its highest accepted fence across restart. If that high-water mark is lost/reset, an old token can become apparently admissible again. If the idempotency/receipt registry is lost while the target state survives, the system may be unable to determine whether an old operation already committed. These are different failures and must not collapse into one status.

## Nexo consequence
Classify recovery independently:
- `FENCE_FRONTIER_INTACT` — stale authority can still be rejected.
- `FENCE_FRONTIER_LOST_OR_UNKNOWN` — current execution must remain blocked until a new authenticated authority/incarnation barrier exists.
- `IDEMPOTENCY_HISTORY_INTACT` — duplicate operation can be resolved from durable target evidence.
- `IDEMPOTENCY_HISTORY_LOST` — historical outcome may remain `UNKNOWN_EXTERNAL` even if current fencing is safe.
- `TARGET_STATE_LOST_OR_UNKNOWN` — target effect history may be unrecoverable without independent authoritative evidence.

A safe recovery can therefore be **fence-safe but historically-unknown**.

## Candidate recovery matrix rule
`SAFE_TO_REJECT_STALE` and `CAN_PROVE_NOT_COMMITTED` are separate predicates.

Preserved fence may allow new execution safety while missing receipt/history prevents proving the old operation did not occur. Conversely, preserved receipts without a current fence do not authorize new execution.

If the fence high-water mark was restored from an older snapshot, do not simply accept it as current. Establish a newer authenticated target incarnation/authority barrier first.

## Non-claim
No universal exactly-once guarantee is inferred. No implementation or formal verification performed.

## Next
AB104.328 — study a four-way recovery state model combining authority/fence safety, historical effect knowledge, target state integrity, and idempotency coverage.
