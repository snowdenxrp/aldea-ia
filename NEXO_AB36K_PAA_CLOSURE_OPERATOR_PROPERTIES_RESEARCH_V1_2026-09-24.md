# NEXO AB36K — CLOSURE OPERATOR PROPERTIES RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. External cross-check
Lamport's official Auxiliary Variables paper states that refinement mappings can require auxiliary variables and that history variables record past behavior. It explicitly focuses on safety specifications. This supports the use of auxiliary history in the eventual formal model, but does not prove the Nexo closure operator.

## 2. Candidate closure operator
For a claim C, define a typed seed S and a dependency relation D_C over claim-relevant entities, relations, hyperedges, order facts, boundary facts, and evidence dependencies.
Candidate Close_C(S) is the least set closed under D_C, provided the dependency rules are sound and claim-scoped.

## 3. Extensiveness
Candidate law: S subseteq Close_C(S).
This is structurally desirable: closure should not discard its seed. But it must be interpreted over semantic facts, not physical storage objects. A normalization step may replace a raw fact with an equivalent typed summary. Therefore physical subset inclusion is too strong; semantic inclusion is the right candidate.
Result: ACCEPT as a semantic law, CONDITIONAL on defining a representation/refinement relation.

## 4. Idempotence
Candidate law: Close_C(Close_C(S)) = Close_C(S).
If Close_C is genuinely a closure operator over a fixed semantic universe and fixed dependency rules, idempotence should follow from least-closure construction. But if each invocation changes assumptions, boundary, claim scope, or evidence epoch, idempotence can fail legitimately.
Result: ACCEPT only for fixed claim, boundary, assumptions, evidence interpretation, and dependency universe. Otherwise use indexed operators rather than claiming global idempotence.

## 5. Monotonicity
Candidate law: S1 subseteq S2 => Close_C(S1) subseteq Close_C(S2).
For positive dependency rules this is natural. It fails if adding facts can invalidate or replace prior facts and the operator is defined over mutable semantic states rather than monotone fact sets. Therefore the operator should operate on a typed fact/history universe with explicit INVALIDATES/REPLACES relations rather than silently deleting predecessors.
Result: CONDITIONAL. Monotonicity is plausible for the closure construction, not for current-state normalization.

## 6. Fixed point versus soundness
Even if extensiveness, idempotence, and monotonicity hold, soundness does not follow automatically. Soundness requires that every dependency rule is claim-sound and that the initial seed contains every claim-relevant root.
Therefore:
closure-algebra laws != claim-soundness proof.

## 7. Least fixed point
A least fixed point is meaningful if the semantic universe is a suitable ordered domain and the closure transformer is monotone over that domain. The existence of a least fixed point does not by itself establish that the selected dependency relation is complete for P_AA.
The key separation is:
LFP EXISTENCE != DEPENDENCY COMPLETENESS != CLAIM SOUNDNESS.

## 8. Countermodel CM-AA353
A syntactically monotone closure omits a dependency type entirely. It reaches a stable fixed point but misses a policy/delegation hyperedge that changes P_AA. Thus fixed point is reached while claim closure is incomplete.

## 9. Countermodel CM-AA354
A normalization replaces an old authority fact with a current summary. Physical monotonicity fails, but semantic closure can remain sound if historical linkage is preserved elsewhere. This shows why raw set inclusion is the wrong algebraic order for Nexo.

## 10. Countermodel CM-AA355
Close_C is called under a changed boundary. The second invocation adds/removes Z4 dependencies. Apparent idempotence fails because the operator parameters changed. Correct response: Close_(C,boundary1) and Close_(C,boundary2) are different operators.

## 11. Countermodel CM-AA356
Evidence epoch changes between calls. The closure grows because new evidence legitimately narrows ConsistentHistories. Again, global idempotence is the wrong claim; epoch-indexed closure is required.

## 12. Semantic closure order
Candidate order should compare claim-relevant semantic information, not raw field sets:
K1 <=_C K2 iff every claim-relevant distinction represented by K1 is represented or soundly summarized by K2 under the same claim contract.
This allows compression without falsely treating equivalent summaries as information loss.

## 13. Closure transformer
Candidate:
F_C(K) = K union DirectDeps_C(K) union JointDeps_C(K) union OrderDeps_C(K) union BoundaryDeps_C(K) union EvidenceDeps_C(K), followed by semantic normalization that preserves the claim contract.
The normalization must never erase a distinction required to reconstruct UsedAdmissionContext or AuthValidAt; if it cannot preserve it, the assessment becomes UNKNOWN.

## 14. Idempotence attack
For fixed parameters, any second closure pass should add nothing. To establish this, every derived relation must itself be included in the dependency universe. Otherwise a hidden second-order dependency can appear only on pass two.
This makes second-order dependency enumeration a required adversarial test.

## 15. Monotonicity attack
Adding a seed can legitimately create new INVALIDATES or REPLACES relations. The closure set can therefore gain information while simultaneously making an earlier claim unsupported. This is not a contradiction: information closure and claim assessment are different functions.
Thus:
CLOSURE MONOTONICITY != CLAIM-ASSESSMENT MONOTONICITY.

## 16. New countermodels CM-AA357–364
357 hidden second-order dependency after first fixed point;
358 semantic-equivalent normalization mistaken for deletion;
359 boundary parameter change mistaken for non-idempotence;
360 evidence epoch change mistaken for non-idempotence;
361 added seed invalidates previous authority while closure grows;
362 mutable current-state normalization breaks raw monotonicity;
363 joint hyperedge generated only after multiple derived facts;
364 closure reaches fixed point but UsedAdmissionContext remains unreconstructible.

## 17. Candidate laws surviving attack
1. Semantic extensiveness: closure preserves or soundly summarizes its seed.
2. Parameterized idempotence: fixed claim/boundary/assumption/evidence semantics imply no further closure growth.
3. Conditional semantic monotonicity: adding semantic facts cannot hide already retained claim-relevant distinctions.
4. Fixed point is a completion property, not a soundness proof.
5. Closure algebra and claim assessment must remain separate layers.

## 18. AB36L frontier
1. Define the semantic information preorder precisely.
2. Define normalization/refinement so compressed summaries count as retained distinctions.
3. Formalize second-order/joint dependency generation.
4. Attack parameterized monotonicity with INVALIDATES/REPLACES.
5. Define the exact boundary between closure completeness and claim soundness.
6. Derive the smallest closure contract needed by P_AA.
7. Then connect it to the concrete refinement relation and only afterward return to TLA+.
