# NEXO AB104.354 — Trust-anchor rotation, revocation and anti-resurrection V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 6024 treats trust anchors as locally configured authority with constrained scope and requires secure transfer of trust-anchor-store control between managers; it also requires the receiver to authenticate the provider and confirm authorization. Rekey/manager transfer is therefore a managed authority transition, not merely a new signature. citeturn0search0turn0search2 RFC 9334 states that RATS Verifiers/Relying Parties must protect trust-anchor stores against unauthorized insertion, deletion and modification, and that freshness/epoch handling matters because delayed or reordered epoch information can make past evidence appear current. citeturn0search1turn0search3

## Finding
For Nexo, trust-anchor rotation/revocation must create a **new authority frontier**. A previously valid root may remain historical evidence, but must not regain executable authority after recovery.

Candidate transition:
`OLD_ROOT_VALID -> TRANSITION_AUTHENTICATED -> NEW_ROOT_CURRENT`
with old root moving to `HISTORICAL_ONLY` or `REVOKED` according to policy.

Candidate binding:
`old_root_id + new_root_id + old_epoch + new_epoch + old_store_digest + new_store_digest + transition_digest + authority_scope + effective_frontier + semantic_version`

Candidate statuses:
`CURRENT | HISTORICAL_ONLY | REVOKED | SUPERSEDED | TRANSITION_PENDING | STALE | UNKNOWN | CONFLICT`

## Anti-resurrection rule
After recovery, an old trust anchor cannot become executable merely because its signature remains cryptographically valid.

`AUTHENTIC_OLD_ROOT != CURRENT_AUTHORITY`
`HISTORICAL_ROOT != EXECUTABLE_ROOT`
`RESTORED_OLD_STORE != CURRENT_TRUST_STORE`

Effects must remain blocked until the recovered trust-anchor state has an authenticated current frontier, including the applicable epoch/configuration and transition lineage. If the transition/revocation history is missing or its coverage is insufficient, current authority is `UNKNOWN/STOP`, not inferred from the last locally observed root.

## Nexo implication
Trust-anchor state becomes another recovery dependency alongside authority/fence, target incarnation, operation history, coverage, schema/semantic lineage and GC/retention state. Rotation cannot be treated as ordinary configuration because it changes which dependency terminals can authorize closure.

## Status
Exact rotation protocol, rollback semantics, revocation evidence format, and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.355 — study rollback/recovery of trust-anchor stores: determine the minimum authenticated state needed to prevent a stale store from reintroducing a superseded root.
