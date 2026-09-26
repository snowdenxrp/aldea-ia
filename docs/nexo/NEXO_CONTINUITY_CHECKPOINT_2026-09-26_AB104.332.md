# NEXO CONTINUITY — AB104.332

AB104.332 persisted. Research only; no implementation.

## Finding
Distributed recovery uses partial ordering; vector clocks distinguish incomparable states. citeturn0search22turn0search24 Therefore recovery-frontier GC cannot safely reduce an antichain to a scalar "largest" frontier when incomparable elements carry distinct evidence.

## Candidate safe-GC rule
Discard frontier `f` only when a retained frontier/summary dominates `f`, or an authenticated summary preserves every claim uniquely supported by `f`.

`INCOMPARABLE != NEWER`
`SCALAR_MAX != SAFE_SUBSUMPTION`

Preserve UNKNOWN/CONFLICT, coverage, lineage, incarnation, and authority/fence frontiers.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.333 — study frontier dominance/coverage queries and when one retained summary truly subsumes another without erasing unique UNKNOWN/CONFLICT evidence.

## DO-NOT-REPEAT
Do not collapse incomparable recovery evidence by scalar revision alone.
