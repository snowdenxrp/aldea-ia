# NEXO AB104.333 — Frontier dominance and safe subsumption

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
Vector clocks define a component-wise partial order: one frontier dominates another only when every component is at least as advanced; incomparable vectors represent states for which neither dominates the other. citeturn0search0turn0search23

## Finding
For Nexo, a retained frontier/summary may subsume discarded evidence only when the retained artifact proves coverage of every claim-relevant dimension of the discarded frontier. Numeric revision alone is insufficient.

Candidate subsumption predicate:
`SUBSUMES(A,B)` iff A dominates B on every required frontier dimension AND A's authenticated coverage includes every claim interval/dependency uniquely represented by B.

If a dimension is incomparable, missing, stale, or semantically incompatible, subsumption is not proven. The result is `UNKNOWN` rather than safe GC. If authenticated statements contradict, classify `CONFLICT`.

## Consequence
A summary can dominate the state frontier while failing to cover a historical non-membership claim. Therefore `frontier dominance != evidence subsumption`.

Candidate query result: `SUBSUMED | NOT_SUBSUMED | UNKNOWN_COVERAGE | CONFLICT`.

No final predicate, data structure, GC algorithm, implementation, or formal proof selected.

## Next
AB104.334 — study retention obligations: how active/future claims determine which frontier elements cannot yet be garbage-collected.
