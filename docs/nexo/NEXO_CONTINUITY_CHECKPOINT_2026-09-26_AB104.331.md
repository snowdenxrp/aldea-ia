# NEXO CONTINUITY — AB104.331

AB104.331 persisted. Research only; no implementation.

## Core finding
Compaction creates a historical coverage boundary because old revisions become inaccessible. citeturn0search0turn0search2 Restore may require a revision/freshness barrier so old state cannot masquerade as current. citeturn0search6 Authenticated Merkle consistency can prove lineage between committed views, but does not by itself prove completeness or external truth. citeturn0search9

## Minimum surviving summary
Coverage/frontier; target identity+incarnation; authority epoch/config+fence; operation/effect facts; non-membership scope; dependency/lineage; schema/semantic version; unresolved UNKNOWN/CONFLICT; archive references.

## Critical invariant
If retained summary cannot support every still-valid safety/history claim, the claim remains UNKNOWN/CONFLICT. Never turn discarded history into NOT_COMMITTED.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.332 — study preservation of incomparable recovery-frontier antichains and the danger of scalar garbage collection.

## DO-NOT-REPEAT
Do not treat a cryptographic root/digest as proof of complete history or external-world truth.
