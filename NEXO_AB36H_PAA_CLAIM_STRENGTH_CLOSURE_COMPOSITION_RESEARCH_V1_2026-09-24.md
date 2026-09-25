# NEXO AB36H — CLAIM STRENGTH / CLOSURE COMPOSITION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, or proof claim.

## 1. Frontier
AB36G established ConsistentHistories, LossSet, and non-amplifying projection as the next semantic layer. AB36H attacks the composition question: whether individually safe projections remain safe when composed, and whether closure intersection/union preserves soundness.

## 2. Claim-strength preorder
Define a claim ordering by semantic strength, not by Boolean value. Candidate relation:
C1 <= C2 iff every concrete history satisfying C2 also satisfies C1.
Thus C2 is at least as strong as C1. UNKNOWN is not automatically a weakest truth claim; it is an assessment of insufficient evidence.

This prevents accidental equations such as UNKNOWN = FALSE or UNKNOWN = weak TRUE.

## 3. Projection non-amplification
For projection P and claim C, let Hist(P,a) be all concrete histories consistent with abstract state a.
A projection is non-amplifying for C if:
if AssessConcrete(h,C)=TRUE_JUSTIFIED for every h in Hist(P,a), then abstract TRUE_JUSTIFIED is permitted;
if Hist(P,a) contains both TRUE and FALSE histories, abstract TRUE_JUSTIFIED is forbidden.

A practical conservative rule is:
Mixed concrete outcomes => UNKNOWN, unless an independently justified common result exists.

## 4. Composition theorem obligation
P1 and P2 may each be non-amplifying over their own domains while P2∘P1 is not automatically non-amplifying.
The missing condition is preservation of the set of concrete histories relevant to the claim:
Hist(P2(P1(H))) must not silently become a strict subset of Hist(P1(H)) merely because P2 discarded distinctions.

Candidate composition contract:
P2 is history-set monotone with respect to the equivalence induced by P1, and neither projection may introduce a new TRUE_JUSTIFIED result absent from all compatible concrete histories.

This is a DESIGN CANDIDATE, not a theorem yet.

## 5. Countermodel family AB36H-C1
H1 and H2 are distinct concrete histories with different claim outcomes but identical P1 abstraction. P1 therefore yields UNKNOWN. A second projection P2 accidentally retains only the H1-compatible metadata. If P2 returns TRUE, composition has amplified authority.
Conclusion: every projection stage must preserve the ambiguity set or carry an explicit proof that discarded distinctions cannot affect the claim.

## 6. Intersection of closures
Intersection of two sound closures is NOT automatically sound. If closure A retains policy history and closure B retains delegation history, their intersection may retain neither.
Therefore:
SOUND(A) && SOUND(B) != SOUND(A ∩ B).

Union is safer for information preservation but can still fail minimality and can introduce incompatible semantic assumptions. Therefore:
SOUND(A) && SOUND(B) does not imply MINIMAL(SOUND(A ∪ B)).

## 7. Joint hyperedge implication
A closure is sound only if it preserves every hyperedge or an equivalent summary sufficient for every claim in scope. Preserving all incident nodes is insufficient.
Therefore:
NODE-COMPLETE != RELATION-COMPLETE != CLAIM-COMPLETE.

## 8. Claim-relative closure
The closure must be parameterized by:
- claim identity/type;
- temporal scope;
- boundary/world scope;
- admissible assumptions;
- assurance level;
- retained evidence/history contract.

Thus there is no universal smallest closure unless a universal claim universe and boundary are explicitly defined.

## 9. Future-claim hazard
A closure safe for claim C today may be unsafe for claim C' introduced later. Safe reclamation therefore requires either:
- a closed future-claim universe, or
- a retained latent-claim contract, or
- an explicit mechanism that prevents future claims from being treated as historically decidable after required distinctions were reclaimed.

This connects AB36H to ClaimDebt, LatentClaimRegistry, and RetentionEpoch from the earlier research.

## 10. Abstraction authority rule
An abstraction may summarize authorization facts but may not manufacture an authorization relation that does not exist in every compatible concrete history.
Candidate invariant:
ABSTRACT_AUTHORITY(a) => forall h in HistoriesConsistent(a): concrete authority relation required by the claim holds in h.

If not provable, assessment is UNKNOWN.

## 11. Boundary-bounded world
If the concrete world is only partially modeled, the abstraction must carry an explicit boundary contract. Outside-boundary dependencies are not false; they are unresolved unless a boundary axiom explicitly closes them.

WORLD_NOT_MODELED != WORLD_ABSENT.

## 12. New countermodels
CM-AA328: P1 preserves authority/policy but drops delegation; P2 reconstructs a TRUE claim using current delegation.
CM-AA329: two individually sound closures intersect and lose the only joint hyperedge needed for a claim.
CM-AA330: P1 produces UNKNOWN for mixed histories; P2 accidentally narrows the history set and produces TRUE.
CM-AA331: closure sound for current-authority claim is reused for historical-effect claim without preserving effect identity/order.
CM-AA332: finite boundary treats unmodeled Z4 dependency as false.
CM-AA333: future claim becomes decidable-looking after reclamation removed a distinction that was irrelevant to the old claim.
CM-AA334: two minimal incomparable closures are merged by an unsound common intersection.

## 13. AB36H conclusion
The next abstraction layer must not be defined as a simple graph projection. It needs a claim-relative history-set semantics and a non-amplification contract. Closure composition needs its own proof obligation.

## 14. AB36I frontier
1. Formalize HistoriesConsistent and claim-strength preorder.
2. Define a precise LossSet algebra.
3. Define hyperedge-preserving projection conditions.
4. Derive sufficient conditions for compositional non-amplification.
5. Attack union/intersection/quotient closure operators.
6. Connect retention reclamation to future claim admissibility.
7. Only then freeze the abstraction/refinement interface for TLA+.
