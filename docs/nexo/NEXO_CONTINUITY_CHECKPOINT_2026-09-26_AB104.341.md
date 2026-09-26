# NEXO CONTINUITY — AB104.341

AB104.341 persisted. Research only; no implementation.

## Finding
Revocation evidence has its own freshness and historical-coverage requirements. X.509 CRLs are signed/time-stamped and clients acquire a suitably recent CRL; OCSP defines `unknown` and requires freshness to avoid accepting stale `good` status when a newer status is `revoked`. citeturn0search8turn0search2 etcd compaction makes pre-compaction history inaccessible. citeturn0search0

Therefore revocation/supersession records are themselves retention roots when future recovery must establish whether an old certificate was current at a historical frontier.

## Invariants
`NO_REVOCATION_RECORD != NOT_REVOKED`
`EXPIRED_EVIDENCE != NEVER_REVOKED`
`FRESH_STATUS != COMPLETE_HISTORY`

If lifecycle history is outside retained coverage, status becomes `UNKNOWN`; absence after compaction cannot prove non-revocation.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.342 — study claim-specific retention horizons rather than a single global TTL.

## DO-NOT-REPEAT
Do not treat missing/compacted revocation evidence as proof that an old certificate was never revoked or superseded.
