# NEXO AB104.283 — Authenticated Graph Commitments / Merkle-Style Summaries and Limits
Date: 2026-09-26
Status: RESEARCH ONLY — no architecture implementation or semantic freeze.

## Question
Can a compact authenticated graph commitment (e.g. Merkle-style root) establish dependency completeness and negative evidence strongly enough for Nexo recovery?

## Findings
1. Merkle commitments compress a structured set/tree into a root, but the root is not by itself a proof of a particular member. RFC 9162 defines inclusion proofs as the additional path needed to recompute the root, and consistency proofs as evidence that two tree heads represent consistent append-only histories. Therefore ROOT + claimed item is insufficient; the proof and the committed domain/size are part of the evidence.
2. A root alone does not establish non-membership/absence. Authenticated non-membership requires a structure and proof semantics designed for absence (e.g. sparse Merkle trees or authenticated ordered structures). Research literature on sparse Merkle trees explicitly treats both membership and non-membership proofs as separate operations.
3. For a dependency graph, a single graph root can commit to an encoded graph only if the encoding is canonical and the scope is explicit. It does not automatically prove that the graph is complete. A verifier needs an authenticated coverage boundary/frontier plus a proof that the queried dependency closure is fully represented within that boundary. Otherwise an omitted dependency can remain invisible while the root is internally consistent.
4. Inclusion of every dependency discovered so far is not equivalent to proving all dependencies that exist. Completeness is a statement about the universe being covered, not merely about integrity of the supplied subset. Candidate evidence therefore needs both (a) authenticated graph content and (b) authenticated coverage/closure semantics.
5. Negative evidence is stronger than absence from a committed subset. To claim NOT_COMMITTED, the commitment must cover every possible commit point relevant to the operation, namespace/resource, target incarnation, authority/fence generation, and retention interval. A compact digest over only observed records cannot establish the required universal absence claim.
6. Freshness/current authority remain separate. RFC 9162's signed tree head binds a tree state and size, while consistency proofs relate tree heads; neither concept alone establishes Nexo's current authority, target incarnation, or current admissibility. These must remain separate evidence dimensions.
7. Candidate compact certificate (research candidate, not selected architecture): graph_root + canonical_encoding_id + scope/namespace + coverage_frontier + closure/graph_semantics_version + target_identity/incarnation + authority_root/epoch/config + predecessor_digest + freshness/anti-rollback evidence + authenticated inclusion/non-inclusion proof(s) + dependency commitment + retention/expiry semantics + integrity/authenticity binding.
8. Minimality is unresolved. Exact representation of graph coverage, closure completeness, non-membership, authority freshness, and anti-rollback is not selected. Do not convert this candidate tuple into an implementation requirement yet.

## Security/epistemic boundary
- VALID_ROOT != COMPLETE_GRAPH.
- VALID_INCLUSION_PROOF != COMPLETE_DEPENDENCY_CLOSURE.
- ABSENT_FROM_COMMITTED_SUBSET != TARGET_NOT_COMMITTED.
- AUTHENTIC_COMMITMENT != CURRENT_AUTHORIZATION.
- CONSISTENT_TREE_HEADS != CROSS-DOMAIN_ATOMICITY.
- If coverage/closure completeness cannot be authenticated, result remains UNKNOWN rather than being upgraded to NOT_COMMITTED or VERIFIED.

## Evidence consulted
- RFC 9162, Certificate Transparency v2.0: Merkle root, inclusion proofs, consistency proofs, signed tree heads, append-only auditing.
- Dahlberg, Pulls, Peeters, “Efficient Sparse Merkle Trees: Caching Strategies and Secure (Non-)Membership Proofs”, IACR ePrint 2016/683: authenticated non-membership semantics.

## Nexo carryover
AB50→AB58 residuals remain unchanged:
- TERNARY_MATH_GAP = FOUND
- TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
- TERNARY_PAA_COLLISION = UNKNOWN
- EVENTDAG_CLOSURE = PARTIAL
- RECONSTRUCTION = BOUNDED_ONLY
- SEMANTIC_FREEZE = NOT_DECLARED
- FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED
AB104.256/257/259 and other prior PENDING items remain PENDING.
No V21, no architecture implementation, no silent migration, no overwrite/delete of historical evidence.

## Next exact action
AB104.284 — study authenticated range/non-membership proofs and whether they can establish complete dependency/commit-point coverage without turning a local proof into a global completeness claim.

## DO-NOT-REPEAT
Do not claim that a Merkle root/hash/revision proves graph completeness, non-membership, non-execution, freshness, current authority, or target-side commit by itself.