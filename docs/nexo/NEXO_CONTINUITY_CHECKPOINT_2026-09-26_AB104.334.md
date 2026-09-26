# NEXO CONTINUITY — AB104.334

AB104.334 persisted. Research only; no implementation.

## Finding
Distributed checkpoint GC retains checkpoints according to future recovery usefulness and dependency reachability, not simply age. citeturn0search24turn0search7 Distributed GC similarly must account for remote/failed references before reclamation. citeturn0search0turn0search2

For Nexo, retention roots include active recovery/mission contracts, unresolved UNKNOWN/CONFLICT, authority/incarnation/fence transitions, reconciliation obligations, archive/coverage certificates, and policy-permitted future recovery paths.

## Invariants
`OLD != GARBAGE`
`UNREFERENCED_NOW != SAFE_TO_DELETE`
`RETENTION_EXPIRY != NOT_COMMITTED`

UNKNOWN can itself create a retention obligation when its evidence is needed for later resolution.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.335 — study auditable retention-root/dependency encoding so GC cannot silently delete evidence required by later recovery queries.

## DO-NOT-REPEAT
Do not use age or current unreferenced status as sufficient proof that recovery evidence is disposable.
