# NEXO AB36M — CONSISTENT HISTORIES, CONCRETIZATION AND LOSSSET RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Objective
AB36L established a claim-relative semantic information preorder. AB36M defines the next semantic layer: which concrete histories remain possible under a closure representation, and which distinctions are lost.

## 2. Concrete universe
For fixed claim P, boundary B, assumptions T, and temporal/evidence contract E, define Hist(P,B,T,E) as the concrete histories admitted by the modeling contract. This is not the set of all physically imaginable histories; it is the contract-scoped universe.

## 3. Concretization candidate
For closure K:
CH_P(K) = { h in Hist(P,B,T,E) : h satisfies every semantic constraint represented by K }.
A representation is therefore interpreted by the set of concrete histories it permits.

## 4. Important distinction
CH_P(K) is a semantic interpretation, not merely a decoding function. Two different representations may have the same CH_P set and therefore be equivalent for the claim even if their fields, identifiers, or storage layouts differ.

## 5. Empty concretization
If CH_P(K) = empty set, K is inconsistent with the contract. It must not automatically produce TRUE_JUSTIFIED. Candidate result: INCONSISTENT / MODEL-ERROR, or UNKNOWN if inconsistency itself is intentionally abstracted. This blocks vacuous truth from becoming a safety certificate.

## 6. Decisive assessment
For a claim predicate Truth_P(h):
- TRUE_JUSTIFIED only if every h in CH_P(K) satisfies Truth_P and the evidence/closure obligations are satisfied.
- FALSE only if every relevant interpretation or an explicitly witnessed concrete history establishes violation according to the claim contract.
- UNKNOWN if CH_P(K) contains both satisfying and violating histories, or required evidence/order/linkage is unresolved.
The exact FALSE semantics remain claim-contract dependent; do not silently equate existence of one violating history with universal FALSE unless the claim is defined that way.

## 7. LossSet candidate
Loss_P(K) is the set of P-relevant distinctions between histories in CH_P(K) that the representation does not preserve enough to separate.
A useful characterization is relational: d is lost if there exist h1,h2 in CH_P(K) that differ on d while K cannot distinguish them under the claim observation/refinement contract.

## 8. Loss is not deletion
A physical event can be deleted while its semantic distinction remains encoded by an order relation, hyperedge, summary, or immutable admission linkage. Conversely, retaining an event record does not guarantee that the representation preserves the relation needed by P_AA.

## 9. Claim-relative loss
Loss_P(K) differs by claim. A distinction irrelevant to P_AA may be safely abstracted while remaining crucial to a future accounting or provenance claim. Therefore reclamation must be claim-scoped or governed by an explicit future-claim universe.

## 10. Equivalence via concretization
Candidate sufficient condition:
K1 ≈_P K2 if CH_P(K1) = CH_P(K2) and the same claim-relevant observation/refinement obligations hold.
Equal concretization is stronger and cleaner than field equality. However, equal CH alone may still be insufficient if provenance/independence obligations are part of the claim contract and are not represented in CH.

## 11. Countermodel CM-AA379
K1 and K2 have equal visible fields but different CH sets because K1 preserves a hidden historical order distinction. Field equality is therefore insufficient for semantic equivalence.

## 12. Countermodel CM-AA380
K1 and K2 have equal CH sets but one representation lacks witness provenance required by a claim about independent evidence. They are equivalent for P_AA if provenance is outside P_AA, but not for the broader independence claim. Equivalence must therefore be claim-indexed.

## 13. Countermodel CM-AA381
K permits both ISSUE→ADMIT→REVOKE and ISSUE→REVOKE→ADMIT. Both satisfy the same current-state summary. If P_AA distinguishes admission-time validity, CH contains both a satisfying and violating history. Decisive TRUE is forbidden; result must be UNKNOWN unless further evidence resolves order.

## 14. Countermodel CM-AA382
K retains the exact admission record and current authority but loses the binding between the admission and its used authority. Multiple authority records become compatible with K. The concretization set expands and TRUE_JUSTIFIED can no longer be issued safely.

## 15. Countermodel CM-AA383
K preserves UsedAuth and UsedBridge but omits the relation binding the bridge to the authority. Histories with a mismatched bridge become possible. This confirms that node retention is not relation completeness.

## 16. Countermodel CM-AA384
K preserves all pairwise relations but omits a joint policy+delegation hyperedge. A history satisfying every pairwise constraint but violating the joint semantic condition remains in CH. Hyperedge completeness is therefore required where the claim depends jointly on components.

## 17. Monotonicity of concretization
Under the semantic information preorder:
K1 <=_P K2 should imply CH_P(K2) subseteq CH_P(K1).
More precise information permits fewer concrete histories. This reverses the direction of the history-set inclusion compared with information precision.
This is a key order duality:
more semantic information -> fewer consistent histories.

## 18. Closure monotonicity revisited
If Close_P is monotone in semantic information order, then its concretization should be anti-monotone in history-set inclusion. This gives a concrete test for closure monotonicity.

## 19. LossSet and concretization
Loss_P(K) cannot simply mean “all fields omitted.” It should capture distinctions for which multiple concrete histories remain possible and the representation lacks a claim-relevant discriminator.
A compressed representation may omit many fields while Loss_P(K) remains empty for P_AA.

## 20. Soundness condition
Candidate non-amplification:
If K emits TRUE_JUSTIFIED, then every h in CH_P(K) satisfies P_AA and all required evidence/refinement conditions.
If K cannot establish that universally, it must not emit TRUE_JUSTIFIED.
This is the central bridge from closure semantics to claim soundness.

## 21. UNKNOWN condition
UNKNOWN is appropriate when:
1. CH contains both P-true and P-false histories;
2. required order is unresolved;
3. UsedAdmissionContext is not uniquely reconstructible;
4. required bridge/invalidation relation is missing;
5. assumptions/boundary are unresolved;
6. provenance needed by the claim is unresolved.
UNKNOWN must not be collapsed to FALSE.

## 22. Empty versus broad concretization
CH=empty means inconsistency, not safety.
CH=one history can support a decisive claim only if that history is contract-valid and all required evidence/refinement conditions hold.
CH=many histories can still support TRUE if all satisfy P_AA.
Thus cardinality alone is irrelevant.

## 23. Future claims
A closure may have Loss_PAA(K)=empty while Loss_Q(K) is nonempty for another claim Q. Therefore current claim safety does not imply future claim reconstructibility.
This links directly to ClaimDebt/LatentClaimRegistry/RetentionEpoch research.

## 24. Candidate refinement relation
R_AA(C,H,K) should require:
- H in CH_AA(K);
- actual admission linkage preserved;
- all P_AA-required distinctions represented or conservatively unresolved;
- no abstract authority amplification;
- claim observation agrees;
- boundary and assumptions agree.

## 25. New countermodels CM-AA385–392
385 empty concretization falsely treated as TRUE;
386 equal fields but different concretization;
387 equal concretization but different claim provenance requirements;
388 mixed true/false histories hidden by current-state summary;
389 admission linkage ambiguity;
390 bridge-authority relation omission;
391 pairwise-complete but hyperedge-incomplete closure;
392 P_AA-complete closure silently reused for a stronger future claim.

## 26. Result
The semantic chain is now candidate-defined:
Concrete histories -> claim-scoped semantic closure -> CH_P(K) -> Loss_P(K) -> claim assessment.
The central soundness criterion is universal over CH_P(K) for decisive TRUE_JUSTIFIED. This prevents an abstraction from manufacturing safety by collapsing distinct concrete histories.

## 27. AB36N frontier
1. Define Loss_P formally as an equivalence-separating relation.
2. Attack union/composition of closures using CH intersections/unions.
3. Determine sufficient conditions for K1 <= K2 exactly when CH(K2) subseteq CH(K1).
4. Analyze empty/inconsistent concretizations and vacuous truth.
5. Connect CH/Loss to R_AA and UsedAdmissionContext.
6. Derive closure composition laws before returning to TLA+.
