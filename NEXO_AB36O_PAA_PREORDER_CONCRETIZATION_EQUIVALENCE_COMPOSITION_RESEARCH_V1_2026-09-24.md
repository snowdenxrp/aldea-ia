# NEXO AB36O — PREORDER, CONCRETIZATION EQUIVALENCE AND COMPOSITION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. External cross-check
Lamport's official material states that refinement mappings relate lower-level state to higher-level concepts and that auxiliary/history variables may be required to construct such mappings. This supports treating our semantic representation as a refinement problem rather than a raw field comparison. It does not prove the Nexo preorder. [Lamport Auxiliary Variables](https://lamport.org/pubs/auxiliary.pdf)

## 2. Target equivalence
Candidate semantic equivalence for fixed claim contract P:
K1 ≈P K2 iff they have the same claim-relevant concretization and the same observation/refinement obligations.

## 3. Reverse concretization inclusion
Candidate implication:
K1 ≤P K2 => CH_P(K2) ⊆ CH_P(K1).
This direction follows conceptually when K2 contains all semantic constraints of K1 plus possibly more. The reverse implication requires an expressiveness/completeness assumption: every semantic restriction representable in the contract must be representable in the closure language.

## 4. Why reverse implication is not automatic
If the closure language cannot express a distinction, two closures can have equal-looking constraints while their intended meanings differ. Conversely, a very expressive representation can encode a restriction not visible in a restricted field language. Therefore CH inclusion alone defines semantic precision only relative to an adequately expressive contract.

## 5. Galois-style warning
A Galois connection or insertion must not be asserted merely because we have alpha/gamma-shaped functions. We would need explicit domains, orders, monotonicity, adjunction law, and compatibility with the claim semantics. For now use representation/refinement and concretization directly.

## 6. Safe characterization candidate
Under a claim-complete representation language L_P:
K1 ≤P K2 iff CH_P(K2) ⊆ CH_P(K1).
This can serve as a semantic characterization rather than a physical data ordering.

## 7. Countermodel CM-AA408
L_P omits historical order. K1 and K2 have identical representable fields, while one intended concrete meaning excludes REVOKE→ADMIT and the other does not. The language is not claim-complete, so reverse characterization fails.

## 8. Countermodel CM-AA409
L_P can encode order but not joint policy+delegation hyperedges. CH inclusion computed from pairwise fields is therefore unsound for P_AA. Hyperedge expressiveness is part of claim completeness.

## 9. Countermodel CM-AA410
Two closures have identical CH sets but different witness provenance. They may be equivalent for P_AA, yet not for an independence claim. Thus equivalence is indexed by the claim contract.

## 10. Countermodel CM-AA411
Two closures have the same current CH but different future-extension sets after a permitted policy event. If CH is defined only over the current prefix, current equality is insufficient. Define CH over complete contract-scoped histories or explicitly include future continuation semantics.

## 11. Future closure
For behavioral equivalence, candidate stronger relation:
K1 ≈P K2 iff for every allowed future environment continuation, corresponding future observations remain equivalent and actual admission linkage/refinement obligations remain equivalent.
This is why current-state equality is insufficient.

## 12. Composition
For compatible conjunction:
CH(Compose_and(K1,K2)) = CH(K1) ∩ CH(K2).
For safe forgetting/over-approximation:
CH(Forget(K)) ⊇ CH(K).
These are semantic laws, not raw record operations.

## 13. Composition and protocol classes
ATOMIC, LEASE and RECHECK can share the same P_AA claim contract only if each protocol maps to the same semantic AdmissionProtocolValid predicate and preserves actual linkage, invalidation, temporal semantics, replay/freshness, and boundary obligations. Protocol-specific concrete histories may differ while their claim-relevant observations coincide.

## 14. Countermodel CM-AA412
An ATOMIC representation and LEASE representation both expose "valid at admission" but only the lease representation requires an interval bridge. If the bridge expiry history is absent, the apparent equality is not claim-complete.

## 15. Countermodel CM-AA413
A RECHECK representation records a final check but omits which authority facts were re-established. A static bridge summary can falsely make it look equivalent to ATOMIC. Protocol semantics must remain explicit until equivalence is demonstrated.

## 16. Joint realizability
Composition of closure witnesses requires existence of at least one concrete history jointly realizing all selected components and cross-relations. Pairwise consistency is insufficient.

## 17. Loss under forgetting
If Forget(K) admits new histories that differ on a P-relevant distinction, Loss_P must grow or the assessment must become UNKNOWN. If all newly admitted histories still satisfy P_AA, information was lost but decisive universal safety may remain valid; this is why loss and claim failure are distinct.

## 18. Empty concretization
CH=empty remains inconsistent, not TRUE_JUSTIFIED. This must be preserved by all composition operators.

## 19. Candidate semantic laws surviving attack
1. Semantic precision is best defined over claim-relative concretization.
2. Reverse inclusion characterizes the information preorder only under claim-complete expressiveness.
3. Equal current concretization is insufficient if future behavior or auxiliary obligations matter.
4. Protocol unification requires semantic equivalence, not field equality.
5. Composition requires contract compatibility and joint realizability.
6. Loss is not synonymous with claim failure.

## 20. New countermodels CM-AA414–420
414 non-expressive closure language;
415 hyperedge-incomplete precision order;
416 provenance-sensitive claim mismatch;
417 current-prefix equality with future split;
418 atomic/lease false equivalence;
419 recheck/atomic false equivalence;
420 pairwise-compatible but jointly unrealizable composition.

## 21. AB36P frontier
1. Define claim-complete representation language for P_AA.
2. Define complete-history versus prefix concretization precisely.
3. Formalize future continuation equivalence without prematurely calling it bisimulation.
4. Attack protocol unification with complete ATOMIC/LEASE/RECHECK traces.
5. Connect semantic preorder to R_AA and Observation_AA.
6. Determine whether a reduced product can represent the closure without residual semantic dimensions.
