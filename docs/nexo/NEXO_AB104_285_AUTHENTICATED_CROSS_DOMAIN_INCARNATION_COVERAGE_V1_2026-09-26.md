# NEXO AB104.285 — Authenticated cross-domain/incarnation coverage

Date: 2026-09-26
Status: RESEARCH ONLY — no architecture implementation or semantic freeze.

## Question
Can authenticated graph/range proofs encode dependency completeness and negative evidence across multiple target incarnations/restores without collapsing distinct evidence domains?

## Evidence studied
RFC 9162 defines Merkle inclusion proofs as proof that a leaf belongs to a committed tree, and consistency proofs as proof that an older tree is represented consistently in a newer append-only tree. These proofs establish properties relative to a particular committed tree/log and its trust model; they do not by themselves establish current authorization, external target mutation, or global completeness.

## Findings
1. A graph/Merkle root authenticates a committed graph representation, not the semantics of every dependency unless scope, closure, and dependency edges are themselves committed.
2. Range/non-membership evidence is meaningful only relative to an authenticated universe/namespace and its coverage frontier. Absence from a committed subset is not global NOT_COMMITTED.
3. Cross-domain composition is not automatically coherent: valid proofs for authority, target operation registry, resource state, restore lineage, and archive coverage can all be individually valid yet describe different incarnations/frontiers.
4. A proof bound to target incarnation I must not become current evidence for incarnation J merely because hashes/signatures remain valid. An authenticated restore transition is needed to relate I→J; otherwise absence in J cannot downgrade a historical possibility in I.
5. Negative evidence spanning restores requires coverage over every incarnation and commit-point domain that could contain the operation, plus authenticated lineage/anti-rollback and retention semantics. A local non-membership proof cannot establish that global coverage.
6. Dependency completeness therefore needs explicit authenticated commitments to dependency edges, evidence-domain identity, frontier/coverage, incarnation, authority generation, and predecessor lineage. A root alone is insufficient.
7. Merkle consistency can establish append-only continuity inside one log, but cross-log/cross-domain coherence still needs explicit binding; the proof systems do not supply a generic cross-domain transaction boundary.

## Nexo carry-forward
Candidate evidence object remains evidence, not permission:
AUTHENTICATED_PROOF != CURRENT_AUTHORIZATION
and
LOCAL_ABSENCE_PROOF != GLOBAL_NOT_COMMITTED.

Candidate recovery rule: if proofs are incomparable, cross-incarnation coverage is missing, dependency closure is unproven, or restore lineage is not authenticated, classify the joint state as UNKNOWN/RECOVERY_INCOHERENT rather than synthesize executable permission.

## Explicit non-claims
- No architecture selected.
- No formal verification performed.
- No implementation performed.
- No semantic freeze declared.
- No claim that a Merkle/range proof can establish global negative evidence by itself.

## Next exact research step
AB104.286 — investigate authenticated cross-domain binding/atomic snapshot techniques (including transparency-log checkpoint binding, vector commitments/accumulators where relevant, and transactional/consensus snapshot semantics) and determine what they can and cannot prove about a single coherent recovery frontier.