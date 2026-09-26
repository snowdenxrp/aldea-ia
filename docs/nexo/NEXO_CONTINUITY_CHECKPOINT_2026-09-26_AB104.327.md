# NEXO CONTINUITY — AB104.327

## Canonical state
AB104.327 research persisted. No implementation performed.

## Finding
Fence high-water state and idempotency/receipt history are separate recovery dependencies. Losing the fence frontier can re-admit stale authority; losing idempotency history can leave historical effect outcome UNKNOWN. etcd restore demonstrates that restored revision must not be treated as current without a recovery barrier; external-effect recovery requires durable operation identity/reconciliation state. citeturn0search0turn0search2

## Required separation
`SAFE_TO_REJECT_STALE` != `CAN_PROVE_NOT_COMMITTED`

Possible states:
`FENCE_INTACT`, `FENCE_UNKNOWN`, `IDEMPOTENCY_INTACT`, `IDEMPOTENCY_UNKNOWN`, `TARGET_HISTORY_UNKNOWN`.

Fence-safe recovery can still be historically UNKNOWN. Preserved receipts do not authorize new execution if current fencing is unknown.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.328: study a four-way recovery state model combining authority/fence safety, historical effect knowledge, target-state integrity, and idempotency coverage.

## DO-NOT-REPEAT
Do not collapse fence loss, receipt loss, target-state loss, and historical uncertainty into one boolean recovery status.
