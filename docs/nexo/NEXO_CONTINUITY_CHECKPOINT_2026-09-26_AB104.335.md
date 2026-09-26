# NEXO CONTINUITY — AB104.335

AB104.335 persisted. Research only; no implementation.

## Finding
Distributed GC requires explicit roots plus awareness of remote/replicated reachability. citeturn0search0turn0search1 A documented distributed-storage GC failure shows that a retention root created after a scan can race with deletion and cause erroneous reclamation. citeturn0search26

Nexo retention should therefore be an auditable dependency/evidence graph, not a boolean reference flag.

Candidate root fields: claim/contract, dependency frontier, authority/epoch, target incarnation, coverage, semantic version, creation frontier, expiry/revalidation.

GC must have a completeness/finality barrier: if dependency completeness or concurrent-root exclusion is not proven => `UNKNOWN/STOP`, never deletion.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.336 — study concurrent-retention races and the linearization/finality barrier between root discovery, compaction, and physical deletion.

## DO-NOT-REPEAT
Do not treat a completed dependency scan as permanently valid while new retention roots can race with deletion.
