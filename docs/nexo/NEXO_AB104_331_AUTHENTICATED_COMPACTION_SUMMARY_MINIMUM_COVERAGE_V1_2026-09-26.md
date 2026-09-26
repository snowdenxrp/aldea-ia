# NEXO AB104.331 — Minimum authenticated summary that may survive compaction

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
etcd explicitly makes pre-compaction revisions inaccessible, so compaction creates a real historical coverage boundary. citeturn0search0turn0search2 Snapshot restore can also require an explicit revision bump/compaction marking to prevent old state from appearing current. citeturn0search6 RFC 9162 demonstrates that authenticated Merkle consistency proofs can bind successive committed tree views, but this authenticates committed structure/lineage rather than arbitrary real-world truth or completeness. citeturn0search9

## Finding
A safe Nexo compaction summary must preserve, at minimum:
1. authenticated coverage interval/frontier;
2. target identity + target incarnation;
3. authority epoch/config and fence frontier;
4. operation identity and effect-status facts;
5. non-membership/coverage claim scope where relevant;
6. dependency/lineage digest and schema/semantic version;
7. unresolved UNKNOWN and CONFLICT boundaries;
8. archive/reference material needed to revalidate the summary.

A digest/root alone is insufficient for a future claim whose required coverage is not represented. Compaction can preserve a commitment to omitted data, but cannot recreate omitted semantics.

## Invariant
`SAFE_COMPACTION` requires: every currently supported safety/history claim has an authenticated retained summary sufficient to reach the same admissibility classification; otherwise the claim must remain `UNKNOWN` (or `CONFLICT` when contradictory evidence survives).

## Boundary
`AUTHENTIC_SUMMARY != COMPLETE_HISTORY`
`COMPLETE_COMMITMENT != EXTERNAL_TRUTH`
`COMPACTION != NOT_COMMITTED`

## Status
Exact certificate format, proof system, retention algorithm, and implementation remain UNSELECTED / NOT IMPLEMENTED / NOT FORMALLY VERIFIED.

## Next
AB104.332 — study whether compaction summaries can safely preserve an antichain of incomparable recovery frontiers and how to detect when scalar GC would erase required evidence.
