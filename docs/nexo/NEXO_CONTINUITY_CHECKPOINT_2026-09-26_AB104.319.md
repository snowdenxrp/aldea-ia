# NEXO CONTINUITY — AB104.319

## Canonical state
AB104.319 research persisted. No implementation performed.

## Finding
Independent witnesses/gossip can expose equivocation by comparing signed checkpoints. RFC 9162 describes cross-client comparison; current IETF CLL work states multiple independent witnesses strengthen resistance to equivocation. citeturn0search0turn0search1

## Critical boundary
Witnessed checkpoint continuity does NOT prove record truth, completeness, or real-world effect. Those require separate evidence. citeturn0search3

## Candidate evidence classes
`WITNESS_CONTINUITY`, `WITNESS_EQUIVOCATION_PROOF`, `WITNESS_CONTENT_CORROBORATION`, `WITNESS_COMPLETENESS_COVERAGE`.

Do not upgrade one class into another.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.320: study quorum/threshold witnesses and distinguish Byzantine equivocation detection from correlated signatures; define recovery classification for disagreement.

## DO-NOT-REPEAT
Do not treat witness signatures or lack of observed disagreement as proof of truth/completeness/external effect.
