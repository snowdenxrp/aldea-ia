# NEXO CONTINUITY — AB104.344

AB104.344 persisted. Research only; no implementation.

## Finding
Compaction makes prior history inaccessible; that absence cannot prove the historical event never occurred. citeturn0search0turn0search1 Restore can create a new logical identity and requires barriers against old revisions becoming current. citeturn0search2

Retirement certificates are historical evidence of finality, not permanent execution authority. A successor/reopen event must bind to the old certificate and establish a newer authenticated frontier; it must never resurrect old executable permission.

Candidate lifecycle: `ISSUED → CURRENTLY_VALID → SUPERSEDED/REOPENED → HISTORICAL_ONLY`.

## Invariants
`RETIREMENT_CERTIFICATE != EXECUTION_AUTHORITY`
`SUPERSEDED != ERASED_HISTORY`
`REOPENED != RESURRECT_OLD_AUTHORITY`
`MISSING_DEPENDENCY_COVERAGE => FINALITY_UNKNOWN`

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.345 — study retirement/reopen interaction with compaction and authenticated successor chains.

## DO-NOT-REPEAT
Never treat a valid historical retirement certificate as current executable authority after restore/reconfiguration.
