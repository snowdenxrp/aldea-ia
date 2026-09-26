# NEXO CONTINUITY — AB104.340

AB104.340 persisted. Research only; no implementation.

## Finding
Restore creates a new logical etcd cluster identity and can use revision bump/mark-compacted to invalidate stale revision assumptions. citeturn0search0turn0search1 Compaction makes old revisions unavailable. citeturn0search12 Revocation/supersession can invalidate an otherwise authentic certificate before normal expiry. citeturn0search4

Nexo GC certificates therefore need lifecycle semantics independent of cryptographic validity:
`ISSUED → CURRENTLY_VALID → SUPERSEDED/REVOKED → HISTORICAL_ONLY`.

Old certificates may remain useful historical evidence but cannot silently become current authority after restore/incarnation/authority change.

## Invariants
`AUTHENTIC != CURRENTLY_ADMISSIBLE`
`SUPERSEDED != ERASED_HISTORY`
`REVOKED != NEVER_VALID`
`RESTORED != OLD_AUTHORITY_RESURRECTED`

Unknown lifecycle status => `UNKNOWN`; contradictory authenticated records => `CONFLICT`.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.341 — study retention/coverage requirements for revocation and supersession evidence itself.

## DO-NOT-REPEAT
Do not allow compaction to remove the authoritative record needed to prove that an old GC certificate was revoked/superseded.
