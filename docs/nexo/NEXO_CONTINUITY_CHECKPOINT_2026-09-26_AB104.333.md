# NEXO CONTINUITY — AB104.333

AB104.333 persisted. Research only; no implementation.

## Finding
Partial-order dominance requires component-wise comparison; incomparable frontiers are not ordered. citeturn0search0turn0search23

For Nexo, `frontier dominance != evidence subsumption`.

Candidate `SUBSUMES(A,B)` requires:
- A dominates B on every required recovery dimension;
- authenticated coverage includes every claim interval/dependency uniquely represented by B;
- no incompatible schema/semantic lineage;
- no unresolved missing dimension.

If coverage is missing/incomparable/stale => `UNKNOWN_COVERAGE`; contradictory authenticated claims => `CONFLICT`.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.334 — study retention obligations: active/future claims and which frontier elements cannot yet be garbage-collected.

## DO-NOT-REPEAT
Never infer evidence subsumption from a larger numeric revision alone.
