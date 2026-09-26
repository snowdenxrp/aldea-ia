# NEXO AB104.318 — Authenticated evidence-dependency graph

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
An evidence-dependency graph must itself be authenticated and versioned, but authenticating the graph does not make its dependency claims independent. Certificate Transparency demonstrates a useful pattern: signed append-only roots and inclusion/consistency proofs allow auditors to detect changes and compare views, while the protocol explicitly recognizes that a log remains a trust dependency and that multiple logs can reduce certain collusion risks. citeturn0search0turn0search3

## Nexo consequence
The graph should bind, at minimum: evidence node identity, claim supported, source/origin, target incarnation, observation frontier, lineage, authority/trust root, acquisition path, storage/archive domain, software/verification domain, operator/admin domain, retention/coverage, and parent dependency digests.

A graph digest proves the graph presented is the graph authenticated by its root; it does NOT prove that the graph is complete, independent, truthful, or free of a common upstream dependency.

Therefore:
- `AUTHENTIC_GRAPH != INDEPENDENT_GRAPH`
- `INDEPENDENT_GRAPH != COMPLETE_GRAPH`
- `COMPLETE_GRAPH != TRUE_CLAIM`

The graph is evidence metadata, not authorization.

## Recovery rule candidate
If restoring evidence, the recovered dependency graph must be authenticated against a trusted lineage and checked for coverage/semantic compatibility. If the graph's own trust root is the same common-mode dependency as every evidence source it describes, it cannot by itself close that dependency gap.

## Candidate statuses
`DEPENDENCY_GRAPH_AUTHENTIC | DEPENDENCY_GRAPH_INCOMPLETE | DEPENDENCY_GRAPH_CONFLICT | DEPENDENCY_GRAPH_UNKNOWN`

No implementation or exact cryptographic construction selected.

## Next
AB104.319 — study witness/gossip-style cross-source comparison and determine whether independent witnesses can detect equivocation/common-mode omission without becoming a single trust root.
