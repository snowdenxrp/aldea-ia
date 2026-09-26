# NEXO AB104.341 — Retention/coverage of revocation and supersession evidence

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
X.509 revocation depends on a suitably recent CRL and the revocation state can change over time. citeturn0search8 OCSP explicitly defines `unknown` and requires freshness so an old `good` response is not accepted when a newer response says `revoked`. citeturn0search2turn0search7 etcd compaction permanently removes historical revisions before the compaction point. citeturn0search0

## Finding
Revocation/supersession is itself a recovery dependency. Its evidence cannot be garbage-collected merely because the certificate it invalidates is old. The system must retain enough authenticated coverage to answer: “Was this certificate still current at the frontier relevant to this recovery decision?”

Candidate retention object:
`RevocationCoverage = {certificate_id, authority_epoch, target_incarnation, effective_frontier, status, predecessor/successor_digest, coverage_interval, freshness/validity, source/authority}`

Candidate rule:
`GC(revocation_record)` is safe only if every future supported query can still establish the certificate lifecycle status for its relevant interval from retained evidence or an authenticated summary.

If lifecycle history is compacted beyond the available coverage boundary, the old certificate may remain cryptographically authentic but its current/historical admissibility becomes `UNKNOWN`; it must not be treated as unrevoked merely because the revocation record is absent.

## Critical distinction
`NO_REVOCATION_RECORD != NOT_REVOKED`
`EXPIRED_EVIDENCE != NEVER_REVOKED`
`FRESH_STATUS != COMPLETE_HISTORY`

This extends the earlier negative-evidence rule: absence after compaction cannot establish a negative historical fact.

## Status
Exact retention window, freshness policy, revocation transport, and implementation remain UNSELECTED. No formal verification performed.

## Next
AB104.342 — study retention horizons: how to derive the minimum historical interval that must remain queryable for each active recovery/effect claim without relying on a global fixed TTL.
