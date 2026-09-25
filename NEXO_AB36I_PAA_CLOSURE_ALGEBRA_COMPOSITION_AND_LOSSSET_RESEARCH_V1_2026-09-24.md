# NEXO AB36I — CLOSURE ALGEBRA / COMPOSITION / LOSSSET RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC/TLAPS run, or proof claim.

## 1. Continuity checkpoint
AB36H remains unchanged. Its key obligations are claim-relative ConsistentHistories, non-amplification, explicit boundary scope, hyperedge preservation, and compositional soundness. AB36G likewise remains historical evidence. No earlier document is replaced.

## 2. Claim strength
Use a semantic preorder on claims:
C1 <= C2 iff every concrete history satisfying C2 also satisfies C1.
This orders propositions by logical strength. TRUE/FALSE/UNKNOWN are assessment outcomes and are not elements of this preorder.

## 3. ConsistentHistories
For projection P, abstract result A, and claim contract C:
CH(P,A,C) = {H | H satisfies the concrete scope/assumptions for C and P(H,C)=A}.
The scope contract is essential. Without it, the set becomes open-ended and no finite abstraction can claim completeness.

## 4. Sound TRUE condition
TRUE_JUSTIFIED(P,A,C) requires:
forall H in CH(P,A,C): Claim_C(H) is true,
and the abstraction contains every assumption needed to establish that universal statement.
A representative history is never enough.

## 5. LossSet algebra candidate
For a concrete history H and projection P, Loss(P,H,C) is the set of claim-relevant distinctions d for which there exists H' in CH(P,P(H,C),C) differing on d.
Loss is semantic. It can contain ordering, identity, continuity, causal, joint-relational, boundary, or evidence distinctions.

Candidate operations:
LossUnion = Loss(P1,H,C) union Loss(P2,H,C).
LossMonotonicity: a refinement that retains no additional distinction cannot legitimately reduce the set of compatible concrete histories unless it adds justified constraints.
This is a candidate property, not yet a theorem.

## 6. Important correction: loss is not monotone under every refinement
Adding information can reveal that previously possible histories were impossible. Therefore the compatible-history set may shrink when justified information is added. That is not amplification if the shrinkage is backed by retained evidence/contract semantics.
The forbidden operation is an unjustified shrinkage caused only by projection representation.

Thus we need to distinguish:
EVIDENCE_RESTRICTED_HISTORY_SET
from
REPRESENTATION_RESTRICTED_HISTORY_SET.

## 7. Projection contract
A projection P must expose:
- abstract state A;
- concretization/history set CH;
- boundary assumptions;
- claim scope;
- retained distinctions;
- LossSet;
- UNKNOWN conditions.
A bare tuple of retained fields is insufficient to specify sound abstraction.

## 8. Hypergraph closure operator
Let Seed(C) be claim predicates. Define typed expansion by hyperedges REQUIRES, SUPPORTS, INVALIDATES, BOUNDS, ENFORCES, RETAINS, CONSUMES, REPLACES, COMPOSES, CAUSALLY_PRECEDES.
A closure iteration adds:
1. every endpoint identity needed by a selected hyperedge;
2. every ordering distinction required by the edge;
3. every dependency required to establish endpoint continuity/authority/effect identity;
4. any boundary fact needed by the claim.
Stop only at a fixed point or at a declared bounded-UNKNOWN state.

## 9. Hidden-edge countermodel
C requires A+R+P jointly. The projection retains A,R,P but drops the hyperedge. H1 and H2 have identical retained nodes; only the joint relation differs. H1 satisfies C; H2 does not. Therefore node-complete projection can still be unsound.

## 10. Composition condition
For P1 then P2, define sequential concretization through the intermediate abstraction. A sufficient design condition is:
CH(P2(P1(H)),A,C) must not be smaller than the set justified by the explicit constraints retained by P2.
If P2 narrows CH solely because information was omitted by P1/P2, it is amplification.
If it narrows CH because it retains a verified constraint/evidence fact, narrowing is legitimate.

Candidate compositional rule:
NON_AMPLIFY(P1,C) + NON_AMPLIFY(P2,C) + JUSTIFIED_HISTORY_RESTRICTION(P2|P1,C) => candidate NON_AMPLIFY(P2∘P1,C).
This remains an open theorem obligation.

## 11. Closure intersection/union
Intersection is not generally sound because each closure may preserve a different decisive distinction.
Union preserves at least the distinctions of both inputs, but soundness still depends on consistent semantics and boundary assumptions. Union does not prove minimality.
Therefore closure algebra needs separate predicates:
SOUND, COMPLETE_FOR_CLAIM, MINIMAL, COMPATIBLE, COMPOSABLE.
They must never be collapsed into one boolean "safe" flag.

## 12. Quotient danger
Canonicalizing two states as equivalent is safe only if every claim in scope has the same result over their combined concretization set. Semantic equality must therefore be claim-relative.

Candidate:
Equivalent_C(A1,A2) iff their claim-relevant concretization sets are indistinguishable for every predicate in C's declared scope.
Structural equality is insufficient.

## 13. Future claims and retention
If reclamation is justified only for current claim universe U, a later claim C' outside U cannot silently inherit the old closure guarantee.
A retained RetentionEpoch/LatentClaimRegistry contract must either:
- prove C' was inside the protected universe;
- preserve the required distinctions; or
- force UNKNOWN for C'.

## 14. Boundary semantics
A Z4 dependency outside the declared model is not false. The abstract state must encode either:
BOUNDARY_ASSUMPTION,
EXTERNAL_WITNESS,
or UNKNOWN.
No representation shortcut may convert MODEL_ABSENCE into WORLD_ABSENCE.

## 15. New countermodels CM-AA335–342
CM-AA335: projection adds no real evidence but narrows CH by representation convention; produces false confidence.
CM-AA336: adding a justified revocation witness shrinks CH legitimately; a simplistic monotonicity rule incorrectly calls this amplification.
CM-AA337: closure intersection removes distinct policy/delegation hyperedges required jointly.
CM-AA338: quotient identifies two states whose current fields match but historical claim results differ.
CM-AA339: union combines closures with incompatible boundary assumptions and appears sound under either assumption separately.
CM-AA340: future claim outside the retention universe is evaluated using a historical closure that discarded decisive order.
CM-AA341: Z4 missing dependency is encoded as a null/empty value and treated as false.
CM-AA342: composition P1/P2 is sound only because P2 silently assumes a fact that P1 did not preserve or justify.

## 16. Current status
Research findings/candidates:
- claim strength is separate from assessment outcome;
- CH must be explicit and scope-bounded;
- LossSet is a semantic distinction set;
- justified evidence can legitimately shrink CH;
- representation-only narrowing of CH is forbidden;
- hypergraph closure must preserve joint relations and endpoint dependencies;
- closure operations require separate SOUND/COMPLETE/MINIMAL/COMPATIBLE/COMPOSABLE predicates;
- quotient equivalence must be claim-relative;
- retention must account for future claim scope;
- Z4 absence cannot be inferred from model absence.

Open:
- exact formal LossSet algebra;
- exact fixed-point operator and termination semantics;
- compositional theorem;
- quotient theorem;
- closure compatibility theorem;
- refinement mapping;
- TLA+ encoding and actual TLC/TLAPS validation.

## 17. AB36J frontier
1. Build explicit finite countermodel families for composition, intersection, union and quotient.
2. Attempt to refute each candidate algebraic law before accepting it.
3. Define a precise claim-relative equivalence relation.
4. Derive a conservative closure fixed point with UNKNOWN on unresolved dependencies.
5. Only if these survive adversarial attacks, freeze the abstraction/refinement interface.
