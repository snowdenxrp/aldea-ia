# NEXO AB104.340 — GC certificate revocation/supersession after restore

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
etcd restore creates a new logical cluster identity, and revision bump/mark-compacted can invalidate stale watch assumptions after restore. citeturn0search0turn0search1 etcd also documents that compacted historical revisions become unavailable, so later state cannot be interpreted as if the old historical frontier remained queryable. citeturn0search12 General certificate systems distinguish revocation/supersession from mere expiry: a previously valid certificate can be made invalid before its nominal end when its trust/privilege is withdrawn. citeturn0search4

## Finding
Nexo GC certificates need an explicit lifecycle separate from cryptographic validity:
`ISSUED → CURRENTLY_VALID → SUPERSEDED/REVOKED → HISTORICAL_ONLY`.

A certificate may remain cryptographically authentic and historically useful after it is no longer admissible as a current recovery frontier. Supersession/revocation must bind to the certificate identity (or covered authority generation), reason, successor/transition when applicable, and effective frontier.

## Restore boundary
If restore creates a new target incarnation or authority generation, old GC certificates must not silently regain current authority. They may remain historical evidence for claims whose coverage survives, but execution/recovery admission requires revalidation against the new incarnation/authority frontier.

Candidate invalidation tuple:
`certificate_id + old_authority_epoch + old_target_incarnation + invalidation_frontier + reason + successor/transition_digest`

## Critical invariants
`AUTHENTIC != CURRENTLY_ADMISSIBLE`
`SUPERSEDED != ERASED_HISTORY`
`REVOKED != NEVER_VALID`
`RESTORED != OLD_AUTHORITY_RESURRECTED`

If revocation/supersession status cannot be established => `UNKNOWN`; contradictory authenticated lifecycle records => `CONFLICT`.

## Status
Exact revocation transport, lifecycle schema, and implementation remain UNSELECTED. No formal verification performed.

## Next
AB104.341 — study whether revocation/supersession evidence itself needs coverage/retention guarantees, so compaction cannot delete the very record that invalidates an old GC certificate.
