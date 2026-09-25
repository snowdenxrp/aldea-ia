# NEXO AB36J — CLOSURE LAWS / COUNTERMODEL ATTACKS RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Continuity
AB36I established that closure composition must distinguish justified evidence-based restriction of the concrete history set from silent narrowing caused by representation loss. This round attacks candidate algebraic laws directly.

Lamport's official Auxiliary Variables paper confirms that refinement mappings may require history variables that record past behavior; it also distinguishes history, prophecy, and stuttering variables. This supports using auxiliary history in the specification, but does not establish any Nexo-specific theorem.

## 2. Closure object
Use a claim-scoped closure object conceptually:
K = <Retained, Relations, Hyperedges, OrderFacts, BoundaryFacts, Assumptions, LossSet, UnknownConditions>
with a concretization/consistency interpretation CH(K,C).
A closure is not merely a subset of nodes.

## 3. Law L1 — Monotone information addition
Candidate: if K2 retains every claim-relevant distinction of K1 plus additional soundly interpreted information, then CH(K2,C) should be a subset of CH(K1,C).
This is not valid for arbitrary added fields: adding an untrusted or semantically incompatible field cannot legitimately narrow histories.
Result: CONDITIONAL.

## 4. Law L2 — Sound intersection
Candidate: Sound(K1,C) AND Sound(K2,C) implies Sound(K1 intersection K2,C).
Counterexample: K1 preserves policy order; K2 preserves delegation order; intersection preserves neither. A joint policy+delegation invalidation can distinguish TRUE/FALSE histories.
Result: REFUTED without additional compatibility/closure conditions.

## 5. Law L3 — Sound union
Candidate: Sound(K1,C) AND Sound(K2,C) implies Sound(K1 union K2,C).
Information-wise this is plausible if both closures share the same semantic interpretation and compatible assumptions. Incompatible boundary/assumption contracts can make the union ill-typed or misleading.
Result: CONDITIONALLY ACCEPTABLE only with compatible claim scope, boundary, semantics, and provenance. Union does not imply minimality.

## 6. Law L4 — Canonical minimal closure
Candidate: every claim has one unique smallest sound closure.
Counterexample: K1 retains policy history, K2 retains an equivalent delegation-derived summary; neither contains the other, and both can be sufficient.
Result: REFUTED as a universal uniqueness claim. Correct target: a set of incomparable minimal closures or a canonical closure only after an explicit cost/order function is chosen.

## 7. Law L5 — Quotient by current state
Candidate: histories with equal current semantic state are equivalent for P_AA.
Refuted by H1: ISSUE then ADMIT then REVOKE and H2: ISSUE then REVOKE then ADMIT. Same final current state, different historical admission validity.
Result: REFUTED for historical-at-admission claims.

## 8. Law L6 — Fixed-point closure is sufficient
Candidate: if typed dependency expansion reaches a fixed point, closure is sound.
Refuted as stated: reaching a syntactic fixed point proves only that the chosen expansion rules stopped. It does not prove omitted distinctions are non-decisive.
Required extra obligation: every omitted distinction must be shown claim-irrelevant, or evaluation becomes UNKNOWN.
Result: FIXED-POINT COMPLETION is not SOUNDNESS.

## 9. Law L7 — Pairwise edge completeness
Candidate: if every pairwise dependency is retained, the claim is safe.
Refuted by a joint hyperedge countermodel: three components can be jointly required while every pair appears compatible.
Result: PAIRWISE COMPLETENESS is not JOINT COMPLETENESS.

## 10. Law L8 — UNKNOWN monotonicity
Candidate: losing information can only move TRUE/FALSE to UNKNOWN and never restore a decisive result.
Too strong. New independent evidence can legitimately move UNKNOWN to TRUE or FALSE. What must be prohibited is changing UNKNOWN to a decisive result solely because relevant distinctions were discarded.
Result: replace with EVIDENCE-SENSITIVE MONOTONICITY.

## 11. Law L9 — Composition
Candidate: NonAmplifying(P1,C) AND NonAmplifying(P2,C) implies NonAmplifying(P2 after P1,C).
Refuted without a history-set compatibility condition. P2 can narrow the concretization set by silently treating a discarded distinction as fixed.
Required composition contract: CH(P2(P1(H)),C) must be justified by the sequential contracts and cannot exclude a P1-compatible violating history without an explicit sound restriction.
Result: REFUTED as unconditional; CONDITIONAL with compositional concretization preservation.

## 12. Law L10 — Safe reclamation transitivity
Candidate: SafeReclaim(K1,C) AND SafeReclaim(K2,C) implies SafeReclaim(K1 intersection K2,C).
Refuted by the same complementary-retention countermodel as L2.
Result: REFUTED without joint closure analysis.

## 13. Three kinds of narrowing
A. Evidence narrowing: a new justified fact removes concrete histories.
B. Semantic-contract narrowing: the claim explicitly restricts admissible histories.
C. Representation narrowing: abstraction simply cannot distinguish histories.
Only A/B can legitimately shrink the consistency set; C must produce UNKNOWN when the distinction is claim-relevant.

## 14. Countermodel family CM-AA343–352
343 complementary policy/delegation closures.
344 policy+delegation joint invalidation.
345 equal current state/different historical order.
346 syntactic fixed point with hidden omitted dependency.
347 pairwise-complete but hyperedge-incomplete closure.
348 UNKNOWN to TRUE after loss only.
349 P1/P2 composition narrowing.
350 incompatible boundary union.
351 future claim after reclamation.
352 evidence-vs-representation narrowing confusion.

## 15. Candidate algebraic interface
For claim C:
- Close_C(X) = least closure generated by typed dependencies, if all dependency rules are defined.
- CH_C(K) = concrete histories consistent with K under explicit assumptions.
- Loss_C(K) = claim-relevant distinctions not represented by K.
- Sound_C(K) = every decisive abstract claim is valid for all histories in CH_C(K).
- UnknownSafe_C(K) = unresolved claim-relevant ambiguity is exposed as UNKNOWN.
- Compatible_C(K1,K2) = same claim semantics, compatible boundaries, assumptions, provenance, and interpretation.
These are candidate definitions, not proven algebra.

## 16. Key result
We have now refuted several attractive but unsafe universal laws rather than merely adding requirements: intersection soundness; unique minimal closure; current-state quotient for historical claims; fixed point implies soundness; pairwise completeness implies joint completeness; unconditional composition; and unconditional reclamation transitivity.

This is progress: the architecture is becoming smaller by eliminating false algebraic assumptions.

## 17. AB36K frontier
1. Define evidence-vs-representation narrowing formally.
2. Define CH_C(K) and Loss_C(K) with an explicit history equivalence.
3. Derive sufficient, not universal, conditions for union/composition soundness.
4. Attack Close_C idempotence, extensiveness, and monotonicity.
5. Determine whether typed closure can be made a genuine least fixed point under a claim-specific lattice.
6. Connect closure algebra to the eventual refinement relation.
7. Only after surviving these attacks, return to the conservative TLA+ model.
