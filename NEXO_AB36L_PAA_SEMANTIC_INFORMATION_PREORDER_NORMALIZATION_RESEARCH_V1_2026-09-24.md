# NEXO AB36L — SEMANTIC INFORMATION PREORDER, NORMALIZATION AND CLOSURE RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Starting point
AB36K established that raw set inclusion is insufficient for Nexo closure algebra. The current target is a claim-relative semantic information preorder that permits lossless compression/summarization while detecting actual loss of P_AA-relevant distinctions.

## 2. Semantic information preorder
For fixed claim C, boundary B, assumptions A, and interpretation epoch E, candidate:
K1 <=_C K2 iff every C-relevant distinction represented by K1 is either explicitly represented by K2 or recoverably summarized by K2 under the same contract.
This is intentionally weaker than physical subset inclusion.

## 3. Preorder, not immediately partial order
Reflexivity is expected. Transitivity requires composition of representation/refinement relations. Antisymmetry should NOT be assumed because two different representations may be semantically equivalent.
Therefore the safe starting point is a preorder. A partial order may be obtained only after quotienting by semantic equivalence.

## 4. Semantic equivalence
Candidate K1 ~=_C K2 iff K1 <=_C K2 and K2 <=_C K1, under identical claim/boundary/assumption/evidence contracts and with equivalent future P_AA behavior.
This is stronger than identical fields and weaker than identical concrete history.

## 5. Normalization
Normalization N_C(K) is acceptable only if:
1. K ~=_C N_C(K), or
2. any lost distinction is explicitly marked as unresolved and assessment is forced to UNKNOWN where it matters.
Thus normalization cannot silently convert representational loss into semantic certainty.

## 6. Compression countermodel CM-AA365
Two concrete authority records differ in historical revocation order. A compact summary retains only current authority. The summary is not equivalent for historical P_AA. Therefore current-state compression is not a valid normalization for this claim.

## 7. Compression countermodel CM-AA366
Two bridge records differ in internal identifiers but preserve all P_AA-relevant bindings, protocol semantics, replay state, and future behavior. They may be equivalent under the preorder despite different physical representation. This shows why identifier preservation is not automatically semantic preservation.

## 8. Compression countermodel CM-AA367
Two summaries expose the same current assessment but differ in future behavior after a policy change. They are not equivalent because P_AA behavioral equivalence quantifies over allowed future continuations.

## 9. Compression countermodel CM-AA368
A summary omits UsedAdmissionContext but happens to have only one valid authority in the current state. It must not be treated as equivalent: a future continuation can introduce a second authority and expose witness substitution. Actual linkage is a semantic distinction unless reconstructible.

## 10. Information addition versus claim strength
Adding represented facts can increase semantic information while changing the assessment TRUE_JUSTIFIED -> FALSE or TRUE_JUSTIFIED -> UNKNOWN. Therefore the information preorder is independent from the claim-assessment ordering.

## 11. Normalization and INVALIDATES/REPLACES
INVALIDATES and REPLACES must be represented as semantic relations, not destructive mutation. A replacement may establish a new current fact without erasing historical support needed by P_AA.
Candidate normalized structure:
Facts + Relations + Hyperedges + OrderFacts + BoundaryFacts + Assumptions + LossSet + UnknownConditions.

## 12. Second-order dependency closure
A derived relation can trigger a new hyperedge. Therefore F_C must be closed over its own derived outputs, not only over the initial seed. A fixed point is reached only when no rule can add a semantically new dependency.

## 13. Joint dependency generation
If facts x and y jointly imply dependency z, storing independent closures of x and y is insufficient. The closure system must support typed hyperedges whose antecedent is a tuple/set of facts.
Pairwise closure completeness is not joint closure completeness.

## 14. Parameterized operator
Use:
Close_{C,B,A,E}(K)
where C=claim, B=boundary, A=assumptions/threat model, E=evidence interpretation/current evidence epoch.
This avoids false global idempotence claims when semantic parameters change.

## 15. Candidate algebra
For fixed parameters:
1. Extensiveness: K <= Close(K).
2. Idempotence: Close(Close(K)) ~= Close(K).
3. Monotonicity: K1 <= K2 => Close(K1) <= Close(K2), only if dependency rules are monotone over the chosen semantic domain.
4. Least-fixed-point claim is valid only after the domain/order and monotone transformer are explicitly defined.

## 16. Monotonicity attack CM-AA369
K2 adds a revocation relation to K1. The closure grows in semantic information but the claim assessment can become FALSE. This does not violate closure monotonicity.

## 17. Monotonicity attack CM-AA370
K2 replaces an assumption with a stricter incompatible assumption. Raw inclusion cannot represent the change correctly. This demonstrates that assumptions must be parameterized or typed rather than mixed into ordinary facts.

## 18. Monotonicity attack CM-AA371
A joint hyperedge becomes derivable only after adding two facts separately. A naive componentwise monotonicity proof misses the hyperedge. Closure monotonicity therefore requires monotonicity of the complete typed hypergraph transformer, not each edge rule in isolation.

## 19. Closure completeness versus claim soundness
Candidate separation:
ClosureComplete_C(K): every dependency needed to decide or conservatively assess C is represented/reconstructible.
ClaimSound_C(K): any decisive assessment emitted from K holds for every consistent concrete history represented by K.
Closure completeness is not sufficient for claim soundness; claim soundness does not imply minimal closure.

## 20. Smallest closure contract for P_AA
A candidate P_AA closure must support reconstruction of:
- actual AdmissionRecord identity;
- actual UsedAuth and UsedBridge linkage;
- authority validity at admission position;
- resource incarnation;
- policy compatibility at relevant position;
- delegation validity at relevant position;
- protocol/lease/recheck semantics;
- freshness/replay/consumption where protocol requires it;
- relevant ordering/invalidation relations;
- boundary permission;
- sufficient evidence or explicit UNKNOWN.

## 21. New countermodels CM-AA372–378
372 normalization loses historical revocation order;
373 equivalent physical identifiers falsely treated as semantic difference;
374 same current assessment but different future behavior;
375 hidden UsedAdmissionContext becomes ambiguous after future authority issuance;
376 destructive REPLACES erases historical support;
377 assumption mutation falsely treated as fact addition;
378 closure-complete representation emits decisive claim despite inconsistent concretization set.

## 22. Result
The correct algebraic object is emerging as a claim-parameterized semantic closure domain, not a plain powerset of records.
The preorder must account for representation/refinement, future behavior, actual admission linkage, historical order, hyperedges, assumptions and boundary.

## 23. AB36M frontier
1. Define ConsistentHistories(P,K) over the semantic preorder.
2. Define Loss_C(K) as distinctions separating concrete histories that remain possible under K.
3. Prove/attack the relationship between preorder equivalence and equal concretization sets.
4. Derive sufficient conditions for sound union/composition of closures.
5. Connect closure completeness to R_AA and the admission observation function.
6. Only then revisit whether a least-fixed-point formulation is genuinely justified.
