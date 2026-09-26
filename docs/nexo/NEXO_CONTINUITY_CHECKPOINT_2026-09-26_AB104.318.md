# NEXO CONTINUITY — AB104.318

## Canonical state
AB104.318 research persisted. No implementation performed.

## Finding
An authenticated evidence-dependency graph can establish integrity/lineage of the dependency description, but cannot prove the graph is complete, independent, or truthful. RFC 9162 provides a relevant transparency pattern: signed append-only structures, inclusion/consistency proofs, monitoring, and cross-client comparison; it also notes residual trust in the log and uses multiple logs to reduce certain collusion risks. citeturn0search0turn0search3

## Candidate invariants
`AUTHENTIC_GRAPH != INDEPENDENT_GRAPH`
`INDEPENDENT_GRAPH != COMPLETE_GRAPH`
`COMPLETE_GRAPH != TRUE_CLAIM`

The dependency graph is evidence metadata, not authorization.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.319: study witness/gossip-style cross-source comparison and whether independent witnesses can detect equivocation/common-mode omission without becoming a single trust root.

## DO-NOT-REPEAT
Do not treat a signed graph root as proof that all dependencies were disclosed or that the underlying evidence is independent.
