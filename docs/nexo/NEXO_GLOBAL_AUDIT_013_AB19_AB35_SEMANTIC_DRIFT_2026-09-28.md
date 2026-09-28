# NEXO GLOBAL-AUDIT-013 — AB19–AB35 SEMANTIC DRIFT REVIEW — 2026-09-28

Status: additive audit / research only. No implementation, no V21, no formal-verification claim.

## Scope
Cross-check AB19–AB35 against the obligations established by AB2–AB18. Exact commit ancestry is already recovered; this pass focuses on semantic evolution and classification, not another ancestry sweep.

## AB19–AB20
AB19 attacks deletion/minimization of the six candidate semantic components and introduces cross-component invalidation plus a candidate normalized P_AA state. AB20 turns that candidate into an explicit transition/refinement contract and adds an admission linearization point requirement. The important continuity is: AB18's relational quotient candidate is not treated as self-validating; AB19–20 require transition closure and a concrete-to-abstract mapping. AB20 explicitly remains research-only and states that formal proof/TLC have not been run. fileciteturn604file0 fileciteturn621file0

Classification: 🟢 strengthened obligation; 🔵 extension of the AB18 candidate. No contradiction.

## AB21–AB24
Commit titles establish the next sequence: abstract-next/history, protocol separation and quotient attacks, semantic kernel/protocol-independent predicates, and transition-level kernel attacks. This continues the AB2–18 distinction between claim semantics and implementation representation. It also shifts the question from "what fields are in the candidate state?" toward "what predicates and transitions are invariant across protocols?" This is an extension, not proof of a universal protocol quotient.

Classification: 🔵 extension. Sufficiency remains UNKNOWN.

## AB25–AB27
AB25 focuses on UsedAdmissionContext, transition schema, and hidden-history attacks; AB26 develops a transition table/bridge quotient and temporal order; AB27 narrows event order and refinement. This strengthens the earlier AB4–AB6 finding that history can be semantically relevant and that final-state equality is insufficient. The new UsedAdmissionContext direction should therefore be treated as a candidate explicit history/support object, not automatically as complete historical semantics.

Classification: 🟢 strengthened history obligation; 🔵 extension. Hidden-history completeness remains UNKNOWN.

## AB28–AB30
AB28 studies order dependency/concurrency; AB29 dependency graph/simulation; AB30 dependency tables/kernel factorization. This is consistent with the earlier joint-realizability and cross-component closure requirements. The danger is premature factorization: pairwise or graph-level dependency evidence does not by itself prove that all higher-order/common-mode dependencies have been captured.

Classification: 🟢 strengthened dependency analysis; 🔵 factorization extension. Higher-order closure remains UNKNOWN.

## AB31–AB35
AB31 introduces pair matrix/residual order; AB32 order support/abstract transitions; AB33 action contracts/protocol refinement; AB34 adversarial R_AA refinement; AB35 bounded abstract P_AA system. The sequence progressively operationalizes the earlier behavioral-equivalence idea into a bounded abstract system. It does not change the epistemic boundary: bounded abstract systems and attack matrices are evidence, not formal verification.

Classification: 🟢 strengthened adversarial basis; 🔵 extension toward an abstract system. Formal completeness remains UNKNOWN.

## Drift findings
1. No destructive semantic reversal was found between AB2–AB18 and AB19–AB35.
2. The strongest recurring refinement is from field minimization to behavioral/transition closure.
3. "Lease validity" is consistently treated as a relational, cross-component property rather than a boolean.
4. History/support becomes progressively more explicit, which is consistent with the early history-sensitive semantics.
5. Protocol-specific behavior is increasingly separated from a proposed protocol-independent kernel; this separation is a candidate abstraction, not a theorem.
6. Bounded finite/model artifacts repeatedly carry scope limits. They must not be promoted to universal proof.
7. The later FutureObs_PAA problem is a direct continuation of the unresolved transition-congruence obligation, not a newly invented requirement.

## No contradiction currently established
No AB19–AB35 artifact reviewed in this pass demonstrates that an earlier requirement can safely be removed. In particular, nothing here proves elimination of relational binding, history support, protocol-specific semantics, or future-observation obligations.

## Carry-forward UNKNOWN
P_AA quotient congruence = UNKNOWN.
Future-observation sufficiency = UNKNOWN.
UsedAdmissionContext completeness = UNKNOWN.
Higher-order dependency closure = UNKNOWN.
Protocol-independent kernel sufficiency = UNKNOWN.
Formal verification = NOT_PERFORMED.

## Next exact action
GLOBAL-AUDIT-014: inspect AB36A–Z as a research family and classify exactly which AB19–AB35 obligations each A–Z artifact attempts to close, including any counterexample, bounded-model, or TLA-related evidence. Then compare AB36 conclusions with AB41–AB49 to detect later reinterpretation.

## DO-NOT-REPEAT
Do not repeat AB19–AB35 ancestry recovery.
Do not treat commit titles alone as proofs.
Do not treat bounded model/attack absence as universal completeness.
Do not collapse FutureObs_PAA into AB35's bounded model.
