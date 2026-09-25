# NEXO AB36G — CONSISTENT HISTORIES / LOSSSET / NON-AMPLIFICATION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No TLC run, no TLAPS proof, no implementation or runtime verification.

## 1. Continuity checkpoint
AB36F was reread before this round. It established claim-relative closure, exact-vs-UNKNOWN reconstruction, typed/hypergraph dependency closure, non-unique minimality, and candidate NON_AMPLIFYING_CLAIM_PROJECTION / UNKNOWN_ON_LOSS invariants. The repository's AB36E and AB36F artifacts remain historical evidence and are not replaced.

Lamport's official Auxiliary Variables paper describes refinement mappings and history variables as a way to retain past behavior needed for abstraction/refinement; this supports the methodology but does not validate any Nexo-specific mapping. citeturn0search1

## 2. Consistent history set
For an abstraction/projection P, abstract state A, and claim contract C, define conceptually:

ConsistentHistories(P,A,C) = { H | P(H,C) = A and H satisfies the concrete architectural assumptions relevant to C }.

The consistency set must be scope-bounded. It is not the set of every imaginable world history. The abstraction contract must state what concrete assumptions are admitted.

## 3. Why the consistency set matters
An abstract TRUE_JUSTIFIED result is sound only if every concrete history in the permitted consistency set supports the claim.

Candidate condition:

NonAmplifying(P,C,a,A) iff
  AssessAbstract_C(a,A) = TRUE_JUSTIFIED
  => for all H in ConsistentHistories(P,A,C), Claim_C(a,H) holds.

This is stronger than checking one representative history.

## 4. Indistinguishable-history attack
Construct H_T and H_F such that:
- P(H_T,C) = P(H_F,C) = A;
- Claim_C(a,H_T) = TRUE;
- Claim_C(a,H_F) = FALSE.

Then A cannot soundly justify TRUE for C. The safe result is UNKNOWN unless a common decisive FALSE witness exists.

This is the canonical projection-amplification countermodel.

## 5. LossSet
LossSet should not merely be a set of deleted objects. It should represent omitted distinctions capable of separating concrete histories.

Candidate shape:
LossSet(P,H,C) = set of distinctions d such that:
- d is not represented in P(H,C); and
- there exists an allowed H' consistent with the projection where d differs; and
- the difference can affect at least one predicate in claim C.

Therefore:
OMITTED_OBJECT != CLAIM_RELEVANT_LOSS.

An omitted object may be irrelevant; a single omitted ordering relation may be decisive.

## 6. Loss relevance
Candidate:
LossRelevant(d,C) iff there exist H1,H2 with the same retained abstraction and differing only in distinction d such that Assess_C differs or one concrete claim result differs.

If LossRelevant(d,C) is true and the remaining evidence does not decide C, the abstract evaluator must return UNKNOWN.

## 7. Common FALSE exception
Unknown-on-loss must not force UNKNOWN when a decisive FALSE witness is common to every consistent history.

If all H in ConsistentHistories(P,A,C) violate the same mandatory condition, abstract FALSE is sound even if unrelated distinctions were lost.

Thus:
LOSS => UNKNOWN is too strong.

Correct form:
LOSS + CLAIM-RELEVANT-AMBIGUITY + NO COMMON DECISIVE RESULT => UNKNOWN.

## 8. Scope-bounded world model
The consistency set must distinguish:
- assumptions guaranteed by Z0/Z1;
- modeled Z2/Z3 behavior;
- external Z4 facts that are intentionally abstracted;
- unknown/open-world behavior.

A boundary-bounded abstraction may quantify only over worlds satisfying explicit boundary assumptions. It must not silently convert an unmodeled Z4 dependency into absence.

Therefore:
MODEL_SCOPE != WORLD_SCOPE.

## 9. Hidden hyperedges
A projection can retain every node and still be unsound if it drops a hidden joint dependency.

Countermodel H-HYP1:
A, R, P individually appear compatible. A hidden hyperedge requires A+R+P jointly. H1 satisfies the joint relation; H2 changes only P's relation and becomes invalid. If projection drops the joint hyperedge, both may map to the same abstract state.

Therefore node retention is insufficient.

## 10. Hyperedge closure requirement
For every claim predicate p, closure must include not only direct supporting events but all hyperedges whose satisfaction/invalidation can alter p, plus dependencies needed to establish the identity, continuity and ordering of every endpoint of those hyperedges.

Candidate recursive rule:
Seed = claim predicates.
Expand by SUPPORTS/REQUIRES/INVALIDATES/BOUNDS/ENFORCES/CAUSALLY_PRECEDES dependencies.
For every selected hyperedge, include all endpoint identities and required ordering facts.
Repeat to a fixed point or bounded-UNKNOWN condition.

This is a typed closure process, not generic graph reachability.

## 11. Closure soundness target
Candidate theorem obligation:
If Closure_C(H) terminates with SOUND, then every claim-relevant distinction omitted by the closure is provably non-decisive for C within the declared scope.

If this cannot be shown, the closure result is UNKNOWN rather than SOUND.

No implementation or formal proof of this theorem exists yet.

## 12. Projection composition
For projections P1 then P2, non-amplification of P1 and P2 individually does not automatically prove non-amplification of P2∘P1 unless their scopes and consistency sets compose correctly.

Candidate composition obligation:
ConsistentHistories(P2∘P1,A,C) must equal or conservatively contain the histories admitted by the sequential abstraction contracts. If composition silently narrows the history set, it can manufacture false confidence.

Therefore:
PAIRWISE NON-AMPLIFICATION != COMPOSITIONAL NON-AMPLIFICATION.

## 13. Current-state projection attack
P_current discards all pre-current events and retains only current authority/policy/delegation/incarnation state.
CM-AA321: two histories with identical final state but different admission ordering produce TRUE vs FALSE historical validity. P_current maps them together; therefore it is not non-amplifying for historical-at-admission claims.

This directly reinforces AB36E CM-AA311–320.

## 14. Claim-strength monotonicity candidate
If an abstraction safely supports claim C at strength S, adding more retained distinctions may preserve or weaken the result to UNKNOWN, but must never legitimately transform FALSE into TRUE merely through loss of information.

Candidate safety order is not ordinary Boolean monotonicity. It is a claim-strength order where UNKNOWN is epistemically weaker than both decisive outcomes.

This requires a separate formal ordering; it must not be assumed to be lattice-monotone until defined.

## 15. Open-world boundary
If a dependency crosses into Z4 and the model has no complete authority over it, the abstraction must represent that dependency explicitly as an open-world assumption, external witness, or UNKNOWN-producing boundary.

It must not encode:
not represented -> absent.

This is necessary to preserve:
OBSERVATION != WORLD TRUTH.

## 16. New countermodels
CM-AA321 — identical current state, different historical admission order.
CM-AA322 — same node set, hidden joint hyperedge differs.
CM-AA323 — projection P1 is safe and P2 is safe under separate scopes, but P2 silently narrows P1's consistency set and composition yields an unjustified TRUE.
CM-AA324 — omitted Z4 dependency treated as absent.
CM-AA325 — omitted ordering distinction changes whether invalidation precedes admission.
CM-AA326 — two incomparable minimal closures each sound individually; forcing a canonical intersection drops a decisive distinction.
CM-AA327 — adding a stronger claim after compaction reveals that previously irrelevant-looking loss was claim-relevant; retention must therefore be claim/retention-epoch scoped.

## 17. Refinement mapping consequence
The eventual mapping must carry an explicit abstraction contract containing at least:
- claim scope;
- allowed concrete-history set;
- retained distinctions;
- LossSet;
- boundary assumptions;
- UNKNOWN policy;
- hyperedge closure status;
- authority/effect boundary.

A bare function `ImplementationState -> AbstractState` is insufficient to state the whole refinement obligation.

## 18. Status
Established as research findings/candidate invariants:
- ConsistentHistories must be scope-bounded and explicit;
- non-amplification is quantified over all concrete histories admitted by the abstraction contract;
- LossSet is a set of lost distinctions, not merely deleted objects;
- hidden hyperedges can invalidate node-preserving projections;
- pairwise non-amplification does not automatically compose;
- open-world Z4 dependencies must not become absence;
- minimal closures can be incomparable;
- stronger claims can expose previously hidden loss.

Still OPEN:
- exact mathematical syntax for ConsistentHistories;
- exact LossSet representation;
- claim-strength order;
- hyperedge closure fixed-point theorem;
- composition theorem;
- concrete implementation-to-abstract mapping;
- TLA+ encoding;
- TLC/TLAPS.

## 19. AB36H frontier
1. Define the claim-strength preorder formally.
2. Define ConsistentHistories and LossSet as mathematical objects.
3. Define hyperedge closure as a typed least/fixed point with bounded UNKNOWN.
4. Prove or refute composition of non-amplifying projections.
5. Attack canonical-minimal-closure selection.
6. Define the exact refinement mapping contract.
7. Only then encode the smallest conservative formal model.
