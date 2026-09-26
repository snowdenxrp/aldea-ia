# NEXO AB104.284 — Authenticated Range / Non-Membership Proofs and Coverage Limits
Date: 2026-09-26
Status: RESEARCH ONLY — no architecture implementation or semantic freeze.

## Findings
1. Merkle inclusion proves that a supplied leaf is in a committed tree when the proof path reconstructs the trusted root. RFC 9162 also defines consistency proofs for append-only history. These are local proofs about committed structure, not automatic proofs of global completeness.
2. Sparse Merkle trees can provide succinct membership and non-membership proofs because the authenticated structure defines the full key space and empty branches. This is materially stronger for absence than an ordinary Merkle root, but it still proves absence only relative to the authenticated key space/state represented by that root.
3. Ordered authenticated trees can prove non-membership through neighboring/bounding keys. That proves a key is absent from the authenticated ordered set, not that no relevant record exists outside the committed set or outside the declared namespace/coverage frontier.
4. Range proofs can authenticate a contiguous region of an ordered structure. For Nexo, a range proof can therefore help establish that a declared revision/key interval is covered, but a range proof does not by itself establish that the interval is the complete universe of possible commit points. The universe boundary must itself be authenticated.
5. For dependency closure, a proof that every currently listed dependency is included is weaker than a proof that the closure is complete. Completeness requires an authenticated rule for which edges/nodes are possible, a canonical graph encoding, a declared scope, and a coverage frontier that rules out omitted relevant dependencies. If an omitted dependency remains possible, the safe result is UNKNOWN.
6. For negative evidence such as NOT_COMMITTED, the proof must cover every admissible commit point for the operation: target identity and incarnation, namespace, authority/fence generation, relevant revision/range, and retention/rollback boundary. Absence from a smaller authenticated range is not sufficient.
7. Candidate research composition: authenticated root + explicit universe/scope + range/non-membership proof + coverage frontier + lineage/freshness/authority binding + target incarnation + retention/anti-rollback evidence. This is a candidate evidence pattern, not an architecture decision.
8. Important limit: authenticated completeness of one domain does not prove cross-domain atomicity. A perfectly proven target registry range can still be insufficient to determine whether an external mutation occurred if the mutation and registry are not in the same authoritative commit domain.

## Boundary rules
- NONMEMBERSHIP_IN_AUTHENTICATED_UNIVERSE != GLOBAL_ABSENCE.
- COMPLETE_RANGE != COMPLETE_SYSTEM_HISTORY unless the universe and coverage frontier are authenticated.
- COMPLETE_DEPENDENCY_SUBGRAPH != COMPLETE_DEPENDENCY_CLOSURE unless closure semantics are authenticated.
- AUTHENTIC_ABSENCE != NOT_COMMITTED when restore, retention, incarnation, or authority coverage is incomplete.
- If any required coverage dimension is missing or contradictory, preserve UNKNOWN/CONFLICT.

## Evidence consulted
- RFC 9162, Certificate Transparency v2.0.
- Dahlberg, Pulls, Peeters, Efficient Sparse Merkle Trees: Secure (Non-)Membership Proofs.
- Compact Sparse Merkle Trees literature on ordered authenticated non-membership proofs.

## Carryover
AB50→AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.
AB104.256/257/259 and prior PENDING items remain PENDING. No V21, no implementation, no silent migration, no overwrite/delete.

## Next exact action
AB104.285 — investigate whether authenticated graph/range proofs can encode dependency completeness and negative evidence across multiple incarnations/restores without collapsing distinct evidence domains.

## DO-NOT-REPEAT
Do not treat a non-membership proof, range proof, sparse Merkle root, or authenticated ordered-set proof as global proof of non-execution, complete system history, current authorization, or cross-domain atomicity.