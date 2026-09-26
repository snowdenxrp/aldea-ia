# NEXO CONTINUITY — AB104.345

AB104.345 persisted. Research only; no implementation.

## Finding
Compaction removes historical revisions from queryable storage; absence after compaction is not proof of historical non-occurrence. citeturn0search4turn0search6 Restore establishes a new logical identity and can bump/mark revisions to prevent old state from appearing current. citeturn0search0turn0search2

Retirement→successor/reopen chains therefore need authenticated predecessor binding plus a new authority/incarnation frontier. If predecessor details are compacted, an authenticated summary must preserve enough lineage and coverage; otherwise the successor relation is UNKNOWN.

Candidate states: `CHAIN_VALID | PREDECESSOR_COMPACTED_BUT_SUMMARIZED | PREDECESSOR_COVERAGE_GAP | REOPENED | CONFLICT | UNKNOWN`.

## Invariants
`AUTHENTIC_PREDECESSOR != COMPLETE_LINEAGE`
`MISSING_LINEAGE_COVERAGE => UNKNOWN`
`OLD_CERTIFICATE != CURRENT_AUTHORITY`

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.346 — study independent witnesses/archive coverage for successor chains and detection of omitted predecessor links.

## DO-NOT-REPEAT
Never infer complete successor lineage merely because a surviving certificate is cryptographically valid.
