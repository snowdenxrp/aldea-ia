# NEXO AB104.352 — Authenticated dependency-graph closure and completeness

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RATS separates Evidence from appraisal policy and trust anchors; trustworthiness appraisal depends on the configured dependency chain. citeturn0search0turn0search3 The current CORIM draft makes the boundary explicit: trust-dependency graphs are modeled as acyclic, with terminus trustees acting as roots of trust, and appraisal evaluates domain-to-trustee linkages. citeturn0search1turn0search2

## Finding
Authenticating a dependency graph proves integrity of the graph presented, but not that the graph is complete. For Nexo, closure must therefore be a separate claim.

Candidate `DependencyClosureCertificate`:
`claim_id + graph_root_digest + covered_nodes/edges + traversal_scope + terminal_roots + exclusion_rule + authority + frontier + semantic_version + completeness_status`

Candidate statuses:
`CLOSED_FOR_CLAIM | PARTIALLY_CLOSED | MISSING_DEPENDENCY | COMMON_ROOT | CYCLE | UNKNOWN | CONFLICT`.

A graph is `CLOSED_FOR_CLAIM` only when the policy defines what dependency classes must be traversed and evidence establishes that traversal reached every required terminal/root or an authenticated boundary where further dependencies cannot affect the claim. A signed graph with an omitted dependency can remain perfectly authentic while being incomplete.

The current CORIM acyclic-trust-dependency model is useful evidence for this boundary, but Nexo must not assume its graph model automatically proves real-world completeness. citeturn0search1turn0search2

## Invariants
`AUTHENTIC_GRAPH != COMPLETE_GRAPH`
`ACYCLIC_GRAPH != COMPLETE_GRAPH`
`CLOSED_FOR_CLAIM != UNIVERSAL_COMPLETENESS`
`UNKNOWN_CLOSURE => UNKNOWN/STOP` when independence depends on closure.

## Status
Exact closure predicates, discovery mechanism, and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.353 — study authenticated boundary nodes/terminal roots: how Nexo can prove a dependency traversal is complete at a declared boundary without assuming the boundary itself is trustworthy.
