# NEXO AB104.335 — Auditable retention roots and dependency-safe GC

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
Distributed GC work shows reclamation must begin from explicit roots and account for references that may exist outside the local view; otherwise an object can be reclaimed while still reachable elsewhere. citeturn0search0turn0search1 A FAST study documents a concrete failure where a retention root written after an identification pass caused an object to be mistakenly removed, demonstrating that GC must account for races between root creation and reclamation. citeturn0search26

## Finding
Nexo should treat retention as an auditable evidence graph, not a boolean `referenced/unreferenced` flag.

Candidate `RetentionRoot` binds:
`root_id + claim/contract + dependency frontier + authority/epoch + target incarnation + coverage interval + semantic version + creation frontier + expiry/revalidation rule`.

Candidate GC proof records:
`candidate_id + roots_considered + dependency_closure + dominance/subsumption result + coverage result + race/finality barrier + retained summary/archive + decision state`.

## Safety boundary
A GC decision is valid only if the dependency view is complete enough for the claim and a reclamation/finality barrier prevents a concurrent new root from appearing after the decision but before deletion. If either is unproven => `UNKNOWN/STOP`, not deletion.

Candidate states: `GC_ELIGIBLE | GC_BLOCKED_LIVE_ROOT | GC_BLOCKED_UNKNOWN | GC_BLOCKED_CONFLICT | GC_COMMITTED`.

No final protocol, barrier mechanism, implementation, or formal verification selected.

## Next
AB104.336 — study concurrent-retention races and the required linearization/finality barrier between root discovery, compaction, and physical deletion.
