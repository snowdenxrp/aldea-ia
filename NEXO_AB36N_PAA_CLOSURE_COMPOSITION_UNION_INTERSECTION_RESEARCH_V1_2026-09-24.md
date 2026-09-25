# NEXO AB36N — CLOSURE COMPOSITION, UNION/INTERSECTION AND CONCRETIZATION LAWS RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Cross-check
Lamport's official Auxiliary Variables material treats refinement mappings and auxiliary/history variables within safety specifications. This supports separating representation/refinement machinery from the concrete safety state, but does not establish Nexo's closure laws. citeturn0search1

## 2. Central question
Given two claim-scoped closures K1 and K2, when can they be combined without manufacturing or deleting concrete histories incorrectly?

## 3. Concretization baseline
CH_P(K) is the set of contract-scoped concrete histories satisfying the semantic constraints represented by K.
The information preorder candidate is K1 <=P K2 when K2 represents at least all P-relevant distinctions of K1.
Expected dual property:
K1 <=P K2 => CH_P(K2) subseteq CH_P(K1).
This is a candidate law, not yet a theorem.

## 4. Conjunction-style composition
If K1 and K2 are compatible constraints over the same claim/boundary/assumption contract, the natural semantic composition K1 ⊗ K2 should correspond to:
CH_P(K1 ⊗ K2) = CH_P(K1) ∩ CH_P(K2).
This is valid only when both closures use compatible meanings for shared symbols, temporal scope, authority epochs, resource incarnations, protocol semantics, and boundary assumptions.

## 5. Countermodel CM-AA393 — incompatible assumptions
K1 assumes boundary B0 and K2 assumes B1. Their raw intersection can appear precise but has no single coherent contract. Composition must reject or reparameterize rather than silently intersect.

## 6. Countermodel CM-AA394 — incompatible time semantics
K1 interprets policy validity at decision time; K2 at admission time. Their conjunction is not a simple set intersection until temporal semantics are normalized.

## 7. Countermodel CM-AA395 — incompatible identity semantics
K1 treats resource identity as resource incarnation; K2 treats them as the same key. Intersection can create false compatibility. Identity semantics must be part of the contract.

## 8. Compatible conjunction
If contracts are compatible and constraints have a common semantic interpretation, intersection-style composition is candidate-sound: it narrows CH rather than inventing histories.
However, narrowing may make CH empty. Empty CH is inconsistency, not TRUE_JUSTIFIED.

## 9. Union-style abstraction
A representation that forgets a distinction may correspond to a semantic union of histories:
CH_P(K_join) = CH_P(K1) ∪ CH_P(K2)
under an appropriate common contract.
This is useful for safe over-approximation, but it reduces precision and can force UNKNOWN.

## 10. Countermodel CM-AA396 — unsafe field union
Taking all fields from K1 and K2 without preserving their provenance can accidentally create a synthetic history combining facts that never coexisted. Therefore structural field union is NOT equivalent to semantic history union.

## 11. Countermodel CM-AA397 — witness mixing
K1 contains a valid authority witness and K2 contains a valid bridge witness, but they belong to different concrete histories. Naive union can manufacture a combined valid witness. The composition must preserve joint realizability.

## 12. Countermodel CM-AA398 — hyperedge loss
K1 and K2 each retain pairwise facts. Their union omits a joint policy+delegation incompatibility relation. The resulting abstraction can admit a history that neither original closure safely represented.

## 13. Composition soundness condition
Candidate:
Compatible_P(K1,K2) AND a semantics-preserving composition operator Compose_P imply CH_P(Compose_P(K1,K2)) is exactly the intended semantic combination (intersection for conjunction, union/over-approximation for forgetting), with provenance and hyperedges preserved.

## 14. Concretization equality and equivalence
If CH_P(K1)=CH_P(K2) and all claim observation/refinement obligations match, K1 and K2 are candidate-equivalent for P. Equal field sets are neither necessary nor sufficient.

## 15. Relation to LossSet
For safe forgetting F:
CH_P(F(K)) should be a superset of CH_P(K).
If the enlargement includes histories that differ on a P-relevant distinction, Loss_P(F(K)) must expose that loss and decisive TRUE must be blocked unless all newly admitted histories still satisfy P_AA.

## 16. Safe over-approximation
Over-approximation is safe for universal safety only when every abstract history represents a possible concrete history under the refinement contract and the claim is evaluated universally over the abstract concretization. An over-approximation that invents authority cannot be used as evidence of safety.

## 17. Countermodel CM-AA399 — abstract authority amplification
K forgets which authority was used and the abstraction assigns a generic "authorized" fact. CH then contains histories with no concrete authorized counterpart. This violates no-authority-amplification.

## 18. Intersection is not automatically minimal
K1 ⊗ K2 can be sound and still retain redundant relations. Soundness and minimality remain independent.

## 19. Union is not automatically complete
K1 ∪ K2 may preserve many fields while omitting the relation/hyperedge that explains how they jointly constrain a history. Node union is not claim completeness.

## 20. Closure composition law candidate
For fixed compatible contract C:
- semantic conjunction corresponds to history-set intersection;
- semantic forgetting/over-approximation corresponds to a history-set superset;
- semantic equivalence corresponds to equal relevant concretization plus observation/refinement equivalence.
No universal raw-data union/intersection law is valid.

## 21. Empty-history rule
If composition yields CH=empty, classify as inconsistent under the contract. Do not transform contradiction into universal safety.

## 22. Joint realizability requirement
Before composing witnesses from different closures, require a joint concrete history realizing all selected components and cross-relations. This reuses JR_P from earlier research and prevents witness splicing.

## 23. New countermodels CM-AA400–407
400 boundary mismatch;
401 temporal-scope mismatch;
402 identity/incarnation mismatch;
403 synthetic field union;
404 witness splicing across histories;
405 hyperedge loss under union;
406 over-approximation inventing authority;
407 sound intersection with redundant closure proving minimality falsely.

## 24. Result
The algebra is not ordinary set algebra. The semantic object is a contract-indexed representation whose meaning is its concretization set plus claim-relevant observation/refinement obligations.
Composition must therefore operate on semantic contracts, not raw records.

## 25. AB36O frontier
1. Formalize compatibility and joint realizability for closure composition.
2. Derive exact conditions under which information preorder is equivalent to reverse concretization inclusion.
3. Formalize safe forgetting and LossSet growth.
4. Connect composition to R_AA and no-authority-amplification.
5. Attack abstraction composition across different protocol classes.
6. Only after these survive, reconsider a least-fixed-point theorem and TLA+ encoding.
