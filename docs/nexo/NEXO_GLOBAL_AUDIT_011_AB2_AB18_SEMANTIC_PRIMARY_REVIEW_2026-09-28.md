# NEXO GLOBAL-AUDIT-011 — AB2–AB18 PRIMARY SEMANTIC REVIEW — 2026-09-28

Status: additive audit / research only. No implementation. No V21. No V20 patching. No SANY/TLC/TLAPS execution. No semantic promotion to proof.

## Executive correction
The previous AB1–AB49 matrix marked AB1–AB6 as UNKNOWN. This pass recovered primary artifacts for the numbered AB2–AB18 frontier and also recovered an important predecessor research sequence. However, the predecessor artifact is not explicitly labeled AB1, so AB1 remains UNKNOWN rather than being inferred from chronology.

## Recovered AB2–AB18 primary chain
AB2 6afc83a053a800e32d634ca45192b55e84cb19fe — abstraction relation / authority / loss / composition.
AB3 69117612c41a0966602d0ac05d035d6d3dc52233 — authority loss / relational claims / composition adversarial research.
AB4 9d260a3a097c44ad411f5855ce33d8bdddf15057 — joint realizability / common-mode closure / DACP.
AB5 df253f1aaff837580a34af72aeb0ac242df42401 — concrete history / common-mode hypergraph / three orders / countermodels.
AB6 44a5ff4a11334eed4ddb909c86cec46e8541ea05 — history transitions / dependency closure / order discipline.
AB7 d9cdeb933541afd87f72dcd181b57c4c5aea338c — adversarial semantics / closure / preorders / countermodels.
AB8 bc24cfda0fdcf4e056725758e54630aab17894a6 — ClaimAssessment / invalidation / witness / refinement.
AB9 ceddc8a13c0f400799b7496ba10c0f138263a342 — first P_AA / authorization-to-admission safety boundary.
AB10 bf077f2a7fc2d10fe7cc2ef769d2577487aaeda2 — authority order / currentness / fence / attempt domain.
AB12 690159da590a6e5a6fabf853e06abe59091a2c28 — temporal scope / transitions / reduction.
AB13 0f919ff602b92cd03af33222bd1158f74feedc5f — minimal P_AA state / history representation.
AB14 7fab30d19060a8b8a11c9a4f1130464938584e19 — state/history minimization / P_AA equivalence.
AB15 fea6a96619b9f7b5352ad1c479a8c47944bd9703 — admission binding quotient / transition stability / lease reduction.
AB16 bcb1e7a82030dfe3bc039a158eb18dd568dfe14a — exact Rep_AA / transition matrix / quotient coverage.
AB17 b7669578a7bd0f1dec538047b7025c26dff85fca — cross-entity binding / reduced-product research.
AB18 321fc62a8e648809702f2747a89755208f6d9227 — relational binding quotient / lease bridge completeness.

AB11 remains unresolved as an independent numbered artifact: AB12 directly follows AB10 in the recovered ancestry.

## Predecessor research frontier
Immediately preceding AB2 is 61e052b3119c2ba43a271d024249bfe53ff41391, with parent d875b4346c51f47b0f1925fe40c7f5bd30e2a4d5. Its artifact is explicitly an abstraction-soundness/claim-direction research document but is not explicitly numbered AB1. It therefore remains a predecessor frontier, not an invented AB1.

## Semantic findings by phase

### AB2–AB3: representation and authority are claim-relative
Primary research establishes representation/refinement as the safer primitive than assuming a universal alpha/gamma/Galois structure. Soundness is claim-scoped. Authority ordering is distinct from information precision, and abstraction must not amplify authority. Loss is typed by claim impact; relational arity matters for independence/common-mode claims. These are candidate semantics, not proven theorems. fileciteturn539file0 fileciteturn540file0

### AB4–AB6: history, joint realization, dependencies and closure
The research separates joint witness realizability from claim truth, and pairwise compatibility from global realizability. Common-mode closure is claim/threat/boundary/temporal dependent. Concrete history is first-class for historical/effect semantics; final-state equality does not imply historical equivalence. Closure algebraic laws remain candidates until the typed temporal semantics are formalized. fileciteturn537file0 fileciteturn536file0

### AB7–AB8: epistemic status, invalidation, witnesses and refinement
AB7 makes claim status a transition relation rather than an assumed monotone lattice and distinguishes world truth from current justification. It requires concretization for abstract counterexamples. AB8 separates world predicate from justification, makes invalidation reasons explicit, requires joint witness realizability, and treats auxiliary/history variables as a refinement aid only when the distinction is not part of the actual claim semantics. fileciteturn528file0 fileciteturn524file0

### AB9–AB10: first formal target and admission boundary
AB9 selects P_AA: every internally admitted effect must have a currently valid Z1 authority matching the exact admission binding. The first model boundary is Z1→Z3; external Z4 effect is deliberately excluded. AB10 then shows that current authority, epoch, revocation, delegation, policy compatibility, resource incarnation, fence freshness, and operation/attempt binding cannot be collapsed into a generic boolean or historical snapshot. fileciteturn525file0 fileciteturn526file0

### AB12–AB14: temporal scope and semantic state/history split
AB12 makes temporal scope explicit and distinguishes decision, admission, interval, historical and reconstruction claims. It shows that state minimization is a behavioral equivalence problem. AB13 derives a candidate AAState plus auxiliary history and explicitly warns that coverage is not completeness. AB14 finds that AuthorityContext, ResourceIncarnation and PolicyContext are presently non-eliminable under the attack basis; PendingDecision is conditional, while AdmissionBindingClass is required semantically but compressible. fileciteturn527file0 fileciteturn529file0 fileciteturn530file0

### AB15–AB18: quotient stability, relational binding and lease bridge
AB15 defines P_AA-equivalence behaviorally over future continuations, not current fields, and derives a candidate lease/fence bridge. AB16 makes Rep_AA explicit and adds a transition coverage matrix. AB17 proves by adversarial construction that scalar-valid components can form an invalid joint tuple, requiring relational/reduced-product semantics and two-element identity domains for direct cross-entity coverage. AB18 gives the strongest candidate relational Binding_PAA predicate and a candidate complete LeaseBridge; it removes PendingDecision only as a candidate architectural reduction, explicitly not as a proof. fileciteturn531file0 fileciteturn532file0 fileciteturn533file0 fileciteturn534file0

## Major audit result
The AB2–AB18 research does NOT establish the final P_AA quotient or lease bridge. It establishes a progressively stronger adversarial basis and candidate semantics. The critical unresolved boundary is exactly where later AB19+ work continues: whether the candidate admission quotient is stable under every relevant future transition and whether the bridge/support representation is sufficient without circularly encoding the quotient.

## Preserved UNKNOWN / NOT-PERFORMED
- AB1 identity: UNKNOWN.
- AB11 independent artifact: UNKNOWN.
- P_AA quotient congruence: UNKNOWN.
- Future-observation sufficiency: UNKNOWN.
- Lease bridge completeness as a theorem: UNKNOWN.
- PendingDecision eliminability as a proved fact: UNKNOWN.
- Finite-domain completeness: UNKNOWN.
- Formal TLA+ model verification: NOT_PERFORMED.
- TLC/TLAPS/SANY execution for this frontier: NOT_PERFORMED.

## Important correction to earlier matrix
AB2–AB10 and AB12–AB18 should no longer be described merely as “chronology recovered; semantics pending.” Primary semantic artifacts have now been directly inspected and should be classified as EXACT PRIMARY RESEARCH with the limitations above.

## AB1 recovery status
The predecessor chain before AB2 is now known to contain substantial abstraction/hypergraph research, including 61e052b and its ancestors. But because no recovered artifact in this pass explicitly identifies itself as AB1, assigning one would be an inference. Keep AB1 UNKNOWN until an explicit primary mapping is recovered.

## Next exact action
GLOBAL-AUDIT-012: targeted recovery of the missing AB11 and explicit AB1 mapping; then compare AB2–AB18 candidate semantics against the primary AB19–AB40 artifacts to detect semantic drift before AB19+ conclusions are accepted.

## DO-NOT-REPEAT
Do not repeat broad AB19–AB49 ancestry recovery.
Do not promote candidate quotient/bridge semantics to proof.
Do not call the AB18 candidate final architecture.
Do not treat finite-domain attack coverage as completeness.
Do not convert UNKNOWN to FALSE merely because a witness was not found.
