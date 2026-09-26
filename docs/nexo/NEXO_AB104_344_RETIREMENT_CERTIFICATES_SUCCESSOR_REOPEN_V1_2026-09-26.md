# NEXO AB104.344 — Retirement certificates, successor and reopen transitions

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
etcd documents that compaction makes earlier revisions inaccessible, so loss of history is not itself evidence that a historical fact never occurred. citeturn0search0turn0search1 Restore also creates a new logical cluster identity and may require revision bumping/marking compacted to prevent old revisions being treated as current. citeturn0search2 Distributed checkpoint literature treats recovery around consistent checkpoints/rollback boundaries rather than simple elapsed time. citeturn0search6turn0search7

## Finding
A retirement certificate should be treated as **historical evidence of a finality decision**, not as permanent authority. It must bind the exact claim, dependency closure, frontier, authority/incarnation, semantic version and retirement reason. A later successor/reopen event can supersede the retirement decision without resurrecting deleted executable authority.

Candidate certificate:
`retirement_id + claim_id + final_state + finality_frontier + dependency_digest + authority_epoch + target_incarnation + semantic_version + successor/reopen_policy + certificate_status`

Candidate lifecycle:
`ISSUED → CURRENTLY_VALID → SUPERSEDED/REOPENED → HISTORICAL_ONLY`.

A reopen event must reference the retirement certificate and establish a newer authenticated frontier. It cannot silently reuse the old execution permission. If the certificate's dependencies are no longer covered, its historical validity may remain but its ability to establish present finality becomes `UNKNOWN`.

## Invariants
`RETIREMENT_CERTIFICATE != EXECUTION_AUTHORITY`
`SUPERSEDED != ERASED_HISTORY`
`REOPENED != RESURRECT_OLD_AUTHORITY`
`MISSING_DEPENDENCY_COVERAGE => FINALITY_UNKNOWN`

## Status
Exact certificate schema, successor semantics and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.345 — study how retirement/reopen events interact with evidence compaction and authenticated successor chains, especially preventing an old certificate from becoming current after restore.
