# NEXO CONTINUITY — AB104.354

AB104.354 persisted. Research only; no implementation.

## Finding
Trust-anchor rotation/revocation is an authority transition, not merely a new signature. RFC 6024 requires authenticated/authorized trust-anchor management and secure transfer of store control; RFC 9334 requires protected trust-anchor stores and warns that delayed/reordered epoch information can make old evidence appear fresh. citeturn0search0turn0search1turn0search3

Candidate states:
`CURRENT | HISTORICAL_ONLY | REVOKED | SUPERSEDED | TRANSITION_PENDING | STALE | UNKNOWN | CONFLICT`

Anti-resurrection:
`AUTHENTIC_OLD_ROOT != CURRENT_AUTHORITY`
`HISTORICAL_ROOT != EXECUTABLE_ROOT`
`RESTORED_OLD_STORE != CURRENT_TRUST_STORE`

Missing transition/revocation coverage => `UNKNOWN/STOP`, never inferred current authority.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.355 — study rollback/recovery of trust-anchor stores and the minimum authenticated state needed to prevent stale-root resurrection.

## DO-NOT-REPEAT
Do not treat cryptographic validity of an old root as proof of current authority after rotation/revocation/recovery.
