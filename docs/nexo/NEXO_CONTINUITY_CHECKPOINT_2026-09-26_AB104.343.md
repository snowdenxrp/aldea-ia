# NEXO CONTINUITY — AB104.343

AB104.343 persisted. Research only; no implementation.

## Finding
Distributed recovery GC is safe only when older state cannot be needed by future recovery; dependency/recovery-line analysis determines obsolete state. citeturn0search1turn0search2 Recoverable states form a lattice, so finality is relative to the defined recovery space. citeturn0search4

Nexo claim retirement requires an authenticated finality boundary: no supported reopen/reconciliation path can require the discarded evidence, or a retained summary fully covers such a path.

Candidate states: `OPEN | RESOLVED_NONFINAL | RETIRED_FINAL | REOPENED | UNKNOWN | CONFLICT`.

## Invariants
`RESOLVED != FINAL`
`FINAL != ERASED_HISTORY`
`POSSIBLE_REOPENING + MISSING_EVIDENCE => UNKNOWN`

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.344 — study retirement certificates and successor/reopen transitions.

## DO-NOT-REPEAT
Do not garbage-collect evidence solely because a claim is currently resolved.
