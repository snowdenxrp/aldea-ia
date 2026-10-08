# NCS STEP 7 — Smallest authoritative inputs for bounded admission
Date: 2026-10-08

## Status
PENDING — repository evidence is sufficient to define the input classes, but insufficient to derive a legitimate admission policy or authoritative selection rule.

## Scope
This does not reopen the closed 8-step semantics. It asks only what information must be authoritative for one bounded admission decision.

## MASTER
Admission is distinct from observation, equivalence, authority, validation, commit, execution, resolution and retry.
Provider/model output is proposal/evidence, not protected authority.
Claim-critical provenance must survive compression.
UNKNOWN must remain UNKNOWN.
No invented identity/queue/retry/tombstone/compatibility mechanism.

## AB
Historical evidence establishes:
- action+target equality is not semantic claim equivalence;
- admission/acceptance is distinct from commit/effect;
- severity-based selection can become an implicit policy;
- bounded selection can omit candidates without proving failure/resolution;
- derived/helper/cache values cannot be treated as complete authority boundaries;
- claim-specific dependencies matter.

## P/P112
Current repository evidence shows:
- production findings provide evidence/proposals, but not a demonstrated authoritative admission policy;
- legacy buildNexoMission sorts by severity before dedupe and then applies the historical eight-step bound;
- severity ordering is observable legacy behavior, but is not proven as the correct new-Core admission contract;
- current producer fields are insufficient to prove universal observation equivalence;
- current assistant reports do not expose a demonstrated durable run/report/sample identity;
- current mission persistence is a projection and loses claim-critical observation provenance.

## Candidate authoritative input classes
A bounded admission decision minimally needs distinguishable inputs from these semantic classes:

1. Candidate set — the candidate observations/claim proposals being considered. This is not an identity mechanism; it is the decision input.
2. Claim-specific evidence — evidence/provenance needed to determine eligibility under the claim's own semantics. Missing claim-critical evidence remains UNKNOWN.
3. Explicit admission policy/context — the rule that says which eligible candidates may enter the bounded mission set. Relevant policy/config/logic context must be explicit when it can affect the decision.
4. Bound — the historical bounded capacity is 8 and remains closed. The bound limits admission; it does not itself explain which candidates are selected.
5. Selection relation — an explicit authoritative rule for resolving competition when eligible candidates exceed the bound. Legacy severity ordering exists, but is not proven as the new-Core semantic rule.

These are minimum semantic categories, not an approved field schema.

## Not authoritative by itself
- provider/model confidence;
- action+target dedupe equality;
- observation existence;
- equivalence UNKNOWN;
- legacy missionId;
- generatedAt;
- execution idempotencyKey;
- global stateRevision;
- severity without an explicit policy defining its authority and semantics.

## Current decision
The repository does not currently justify implementing ADMITTED/NOT_ADMITTED from ObservationEnvelope alone.
The smallest defensible new-Core contract is to carry the candidate, claim-specific evidence, an explicit admission decision when one exists, and the evidence/context supporting that decision; otherwise preserve UNKNOWN/PENDING.
Do not manufacture a selection policy from legacy severity sorting.

## Future-countereffect analysis

### Severity-as-policy
Current benefit: deterministic legacy prioritization exists.
Future risk: severity becomes accidental universal scheduling authority and couples admission to producer-specific labels.
Contradiction risk: treating it as authoritative without proof would violate separation between observation evidence and explicit admission policy.
Evolution cost: future providers may use different severity semantics, making replacement a compatibility problem.

### Global stateRevision as admission proof
Current benefit: simple snapshot freshness signal.
Future risk: false confidence that all claim dependencies are covered.
Contradiction: established claim-specific dependency/provenance rules reject it as a universal semantic fence.
Evolution cost: later dependency-aware validation would have to undo the shortcut.

### Observation equality as admission dedupe
Current benefit: reduces candidate count.
Future risk: collapses distinct causal observations and changes which claims reach the bound.
Contradiction: violates claim-specific equivalence and UNKNOWN semantics.
Evolution cost: adding missing causal dimensions later changes historical equivalence behavior.

### Legacy mission metadata as identity
Current benefit: readily available lifecycle fields.
Future risk: binds pre-admission observations to post-admission identifiers.
Contradiction: observation identity and mission identity are distinct semantic layers.
Evolution cost: provider/device/run changes become constrained by legacy identifiers.

## Result
No admission policy is implemented in this checkpoint.
The architectural boundary is explicit:
Observation evidence + claim-specific evidence + explicit admission policy/context + bounded selection rule -> admission decision.
Only the first two evidence categories are concretely present today. The explicit authoritative selection policy remains PENDING.
If repository evidence cannot establish that policy without inventing semantics, preserve PENDING and move the unresolved decision into final Core distillation rather than patching legacy orchestration.

## Historical cross-check — AB104.402
AB104.402 independently establishes the relevant architectural direction:
- required admission context cannot be defined solely by the claim instance;
- protected semantic policy/rules outside the claim determine required context;
- missing required context yields UNKNOWN/HOLD/REVALIDATE rather than being treated as unconstrained;
- context schema integrity does not prove semantic completeness.

Applied here, this means the new Core admission decision cannot let an ObservationEnvelope or provider proposal define its own eligibility/selection authority. The policy and required context must come from the protected semantic layer.

This is a cross-check, not a new mechanism and not a reopening of AB research.


## Cross-check — historical PG-009 admission research
Historical PG-009 research provides a stronger candidate principle for the unresolved selection relation:
- admission should be policy-driven by effect/claim characteristics, not model confidence;
- increasing uncertainty, risk, blast radius, or loss of reversibility cannot silently increase autonomy;
- missing/ambiguous risk dimensions cannot silently become LOW;
- aggregate/global dependencies cannot be treated as independent when UNKNOWN;
- policy must record required guarantees, supplied guarantees, residual uncertainty, and rationale/evidence.

This is useful as an architectural constraint, but it does NOT justify importing the old PG-009 risk-profile machinery into STEP 7.

## New distinction: eligibility vs bounded selection
The evidence suggests two separate questions:
1. **Eligibility:** does this candidate satisfy the claim-specific evidence/policy prerequisites required to be considered admissible?
2. **Bounded selection:** when multiple eligible candidates compete for the fixed 8 slots, which policy-governed relation selects the admitted subset?

The current repository provides stronger evidence for the first architectural separation than for the second concrete relation. Legacy severity ordering answers neither safely by itself.

Therefore:
- severity is not promoted to authoritative selection;
- model confidence is not promoted;
- observation equivalence is not promoted;
- risk/effect characteristics may constrain future policy, but their concrete fields and authority for these mission findings are not yet established.

## Result of this research pass
The unresolved question is now narrower:
**What protected semantic policy, with what authoritative candidate attributes, decides the bounded subset once candidates are eligible?**

Current evidence does not establish that relation for the present producer findings without importing legacy semantics or inventing missing attributes.

Status remains **PENDING**, not UNKNOWN-as-failure.


## Additional repository cross-check — multiple legacy ranking semantics
A repository search found at least two different historical prioritization mechanisms:
- squad findings use severity ordering in the legacy Nexo planner;
- Lúmina agent planning uses goal-specific goalPressure() to rank plans.

These are not interchangeable semantics and neither is a demonstrated protected Nexo admission policy.

This matters because promoting a generic field such as priority would hide the source semantics:
- severity answers a producer/report classification question;
- goalPressure answers a Lúmina agent-goal urgency question.

Treating either as a universal admission authority would create semantic coupling and make future providers/agents conform to an accidental legacy ranking vocabulary.

Therefore the new Core must not define a universal priority field merely to make bounded selection easy. If a future admission policy needs ordering, its ordering relation must be explicit, claim/policy-scoped, provenance-supported, and independently authoritative.

### Future-countereffect conclusion
Current benefit of legacy ranking: deterministic behavior.
Future risk: one generic priority field becomes a hidden global scheduler and semantic compatibility constraint.
Contradiction risk: observation/proposal metadata would become admission authority without a protected policy contract.
Evolution cost: every future producer/provider would need to map its semantics into the old ranking scale.

No implementation change is authorized from this cross-check.


## PG-009 risk-aware admission cross-check — scope boundary
The canonical Nexo index exposes a much richer historical PG-009 risk-aware **effect admission** policy: governed effect profile, consequence/risk, likelihood, reversibility, observability, target consistency C0-C4, duplicate hazard, blast radius, authority criticality, compensation quality, plus governed admission states ADMIT/RESTRICTED/HUMAN_REQUIRED/BLOCKED. It also explicitly separates scheduler priority from authority.

This is strong evidence for a general principle but is **not** sufficient to become STEP 7's bounded mission-candidate selection relation:
- PG-009 governs consequential effect admission, not which observational candidates occupy a bounded mission list;
- several PG-009 dimensions (target capability, external effect class, compensation, duplicate hazard) are not established for the current assistant findings;
- importing the full profile would create premature coupling between observation admission and external-effect governance;
- the PG-009 artifacts are historical research/formal sketches and explicitly marked NOT TLC-VERIFIED in the canonical index.

Therefore PG-009 contributes constraints, not the missing selection algorithm. In particular, scheduler priority must not increase authority, and uncertainty cannot silently increase autonomy. The exact bounded-selection relation remains PENDING.

### Research conclusion
We have now exhausted the strongest recovered candidates without finding an already-authoritative policy that fits the present STEP 7 boundary. The remaining gap is genuinely architectural: define the protected semantic relation for selecting among eligible mission candidates, with explicit scope and future replaceability, rather than borrowing an unrelated effect-admission policy.


## Deeper branch cross-check — policy derivation is not candidate ranking
A broader historical branch was recovered in PG-009: protected decisions are derived through semantic chains such as `MISSION/CONSTITUTION -> GOAL -> HAZARD/FAILURE -> SAFETY OBJECTIVE -> INVARIANT -> ... -> ADMISSION`, and critical aggregate admission evaluates conflict domains, shared resources, dependencies, common-mode domains, cumulative exposure and global invariants.

This branch is relevant, but it does not reveal a ready-made ranking relation for STEP 7. It clarifies the architecture boundary:
- protected policy can determine **requirements/eligibility and safety constraints**;
- conflict/risk analysis can constrain which combinations are jointly admissible;
- none of that automatically defines a total order saying “candidate A occupies slot 1, candidate B slot 2”.

Therefore a future bounded-selection policy may need a **partial-order / eligibility-plus-selection** model rather than a universal scalar priority. If several candidates are jointly eligible and incomparable under protected policy, silently forcing a winner would itself be a new policy decision and must be governed explicitly.

Future-countereffect check: a scalar score would be easy to implement now, but risks hiding incomparable claims, turning safety constraints into optimization weights, and creating a permanent provider-facing ranking API. No score/ranking field is introduced.


## Selection safety cross-check — incomparability is not a tie to break
Historical Nexo evidence explicitly establishes that conflicting observations should produce CONFLICT/QUARANTINE rather than arbitrary winner selection, and AB104.782R states that CONFLICTING must not become an implicit winner-selection mechanism.

Applied carefully to STEP 7, this does **not** create a new admission algorithm. It establishes a negative constraint on any future selector:
- if protected policy establishes a meaningful incompatibility/conflict, the selector cannot silently choose a winner merely to fill the 8-slot budget;
- if candidates are genuinely incomparable but not conflicting, a deterministic tie-break may still require an explicit policy authority; it cannot be smuggled in as array order, timestamp, provider order, or generic score;
- unresolved selection authority therefore remains PENDING rather than being converted into arbitrary ordering.

This is useful because it narrows the design space without inventing a selector: the future relation must specify what happens to **eligible + comparable**, **eligible + incomparable**, and **conflicting** candidates separately.

Future-countereffect check: using input order as a tie-break gives deterministic output today but makes upstream enumeration order a hidden authority boundary and can change behavior when providers, concurrency, or data sources change. Rejected.


## Final cross-check of mission/goal semantics — objective is not a selector
The canonical requirements baseline states that every protected action requires explicit mission/goal context and must distinguish the objective from a proxy/metric (`REQ-M01`). It also requires mission changes to identify affected goals, claims, invariants and policies (`REQ-M04`). Research further requires critical requirements to carry an explicit conflict/precedence rule.

This provides a possible **source of authoritative selection context** in the future, but the repository does not define a protected precedence relation among the current heterogeneous observation claims. Therefore “goal/objective” cannot be promoted into a ranking function without an explicit precedence policy.

The result is stronger than simply “we found nothing”: the evidence establishes that selection authority must be rooted in protected mission/goal/policy semantics and distinguish objective from proxy, but it does not supply the missing relation for the current candidate set.

No new priority, score, tie-break, or goal-pressure adapter is introduced.


## Selector contract candidate — minimum properties, not implementation
A further cross-check found two strong constraints in the canonical architecture: `Goal Refinement Contract` carries objective, refinement type, justification, evidence, scope, constraints, success relation, required capabilities, policy version, authority epoch and expiry; and the authoritative-core boundary states that a metric is not authorization. Research also states that no metric/score/reward/result may by itself authorize a critical external effect.

For STEP 7 this supports a **minimum semantic contract for a future bounded-selection relation**, without selecting an algorithm:
1. **Policy-bound:** selection is evaluated under an explicit applicable policy/context, not provider-local preference.
2. **Objective-bound:** the relation is tied to an explicit mission/goal objective and must not silently substitute a proxy metric for that objective.
3. **Evidence-bound:** candidate attributes used by the relation must have provenance/epistemic status sufficient for the claim; missing critical inputs remain UNKNOWN.
4. **Scope-bound:** the relation declares the candidate population and fixed bound (8) to which it applies.
5. **Precedence-bound:** conflicts/incomparability require an explicit governed rule; absence of a rule is not permission for arbitrary tie-breaking.
6. **Authority-separated:** being selected does not authorize execution, commit, or external effect.
7. **Temporal-bound:** material policy/authority/evidence changes invalidate or require re-evaluation of the selection; selection is not permanent authority.
8. **Replaceable:** the relation is policy-scoped and versioned rather than exposed as a universal `priority`/`score` field.

### Future-countereffect check
- Scalar score: easy optimization, but hides policy meaning and creates permanent coupling. Reject as default.
- Input-order tie-break: deterministic but makes upstream enumeration an authority boundary. Reject.
- Model confidence: adaptable but provider-dependent and non-authoritative. Reject.
- Universal priority field: convenient cross-module vocabulary but freezes heterogeneous semantics into one ranking contract. Reject.
- Explicit policy-scoped relation: more work now, but preserves replaceability and lets different mission classes define different selection semantics. This is the only candidate currently consistent with the recovered constraints.

This is a **contract candidate for further review**, not an implementation decision and not yet sufficient to derive a concrete selection relation for current findings.


## Selector relation result — partial-order candidate, not yet implementation
A direct MASTER/AB cross-check strengthens the boundary. MASTER states that proxy satisfaction is not goal satisfaction, critical disagreement remains CONFLICT/UNKNOWN unless a prevalidated policy resolves it, and conflicting observations must not yield arbitrary winner selection. The canonical requirements also require explicit precedence for conflicting authorities and fail-safe behavior.

Therefore the currently strongest semantic candidate is **eligibility + policy-scoped partial-order selection**, rather than a universal scalar ranking:
- First establish eligibility under claim-specific evidence and applicable protected policy.
- Then apply an explicit policy-defined preference/precedence relation only where the policy establishes that relation.
- Comparable candidates may be ordered by that relation.
- Incomparable candidates are not silently ordered.
- Conflicting candidates are not silently resolved.
- If the fixed bound of 8 can be filled without inventing an ordering, select the supported subset.
- If more than 8 mutually incomparable/conflicting candidates require an arbitrary winner to fill the bound, the selector must preserve UNKNOWN/CONFLICT for the unresolved selection rather than use input order, timestamp, score, severity, provider order, or model confidence.
- Being selected remains distinct from authority/execution/commit.

This does **not** yet define the exact preference relation or what policy owns it. It is the first candidate relation that satisfies the recovered MASTER + AB constraints without introducing a universal ranking field. The next proof obligation is to test this relation against concrete heterogeneous producer classes and future evolution/countereffects before implementation.


## Adversarial selector matrix — heterogeneous candidates
The partial-order candidate was tested conceptually against representative producer classes already recovered from `src/assistants/squad.js`.

| Case | Eligibility/evidence | Policy relation | Result | Reason |
|---|---|---|---|---|
| Two NEGATIVE_RESOURCE candidates, distinct resource types | potentially eligible | none established | INCOMPARABLE | Resource identity alone cannot define universal preference |
| Two NEGATIVE_RESOURCE candidates, same resource but different amounts | claim-specific difference established | none established | INCOMPARABLE unless policy defines amount precedence | Amount magnitude is not automatically authority |
| NEGATIVE_RESOURCE vs ROUTINE_PHASE_MISSING | heterogeneous claims | none | INCOMPARABLE | Cross-claim ordering is absent |
| Two candidates with explicit protected mission precedence | eligible | A precedes B established by applicable policy | A precedes B | Governed relation, not score |
| Candidate missing claim-critical admission context | insufficient | relation cannot be evaluated | UNKNOWN | Missing context is not permission |
| Conflicting observations with no prevalidated resolution rule | conflict | none | CONFLICT | No arbitrary winner |
| More than 8 eligible candidates with enough policy relations to choose 8 | eligible | relation establishes supported maximal set | SELECT supported subset | Bound does not create new semantic priority |
| More than 8 eligible candidates where remaining candidates are mutually incomparable | eligible | unresolved | UNKNOWN/CONFLICT for unresolved selection | Never fill remaining slots with hidden tie-break |

### Countereffect finding
The strongest remaining risk is not the partial-order idea itself; it is **cross-claim comparability**. If the implementation introduces a generic relation such as `candidateA > candidateB` without carrying the policy/mission/claim context that makes that comparison valid, the partial order becomes a disguised universal priority system.

Therefore the relation must be scoped at least by the protected semantic context that establishes comparability. A relation between candidates from different claim classes cannot be inferred merely because both are eligible or because one has a larger numeric observation.

No implementation authorized yet. The next question is whether the current architecture contains a protected owner for this cross-candidate relation. If not, the selector must remain PENDING rather than inventing one.


## Protected owner identified — Policy/Admission boundary
The MASTER architecture provides the missing owner/context. Its canonical chain is `Mission/Goal → Request/Effect Identity → Policy/Admission → Coordination/Fencing → Execution`, and it defines a `Policy Contract` with id/version/hash, scope, evidence requirements, freshness, independence, thresholds/reference values, assumptions, failure conditions, tests, owner/authority, expiry and dependencies. The minimum authoritative-core boundary separately identifies version/policy/invariant admission as protected Core responsibility.

Therefore STEP 7 does not need to invent a new universal scheduler or selector authority. The **Policy/Admission boundary is the protected owner of the relation that determines whether eligible mission candidates are comparable/preferred for the bounded admission decision**, while Mission/Goal supplies objective and scope and Claim/Observation supplies evidence. This yields the semantic chain:

`Mission/Goal context + Claim/Observation evidence + applicable Policy Contract -> eligibility/comparability/preference relation -> bounded admission decision`

Important separation:
- Policy/Admission owns the protected relation; it does not become a scalar priority API.
- Mission/Goal defines what the mission is trying to accomplish; it does not by itself authorize candidate ordering.
- Claim/Observation supplies evidence; it cannot define its own authority.
- The fixed bound of 8 remains the already-closed admission constraint.
- Selection still does not authorize execution or commit.

This closes the previously unresolved **owner** question, but not the exact policy relation for current heterogeneous findings. A concrete relation still requires an applicable Policy Contract with explicit scope, precedence/comparability semantics, and failure behavior. If absent, the candidate relation remains UNKNOWN/PENDING rather than being inferred.

### Future-countereffect check
Creating a dedicated `SelectorAuthority` would duplicate the existing Policy/Admission boundary and create a second policy authority. Creating a universal `priority` field would leak one policy's semantics into future mission classes. Both are rejected. Reusing the protected Policy/Admission boundary preserves replaceability because different policy versions can define different claim-scoped relations without changing the Core transport contract.


## Pairwise-vs-set selection attack
The recovered conflict-domain architecture establishes that pairwise relations are not sufficient for all protected admissions: conflict can be represented over pairs/sets, and aggregate admission must evaluate active mission window, shared resources, dependency overlap, common-mode domains, cumulative exposure and global invariants. Therefore STEP 7 must not define bounded selection as a simple pairwise tournament.

Minimum semantic decomposition now supported:
1. **Candidate eligibility:** each candidate independently satisfies the applicable claim/policy prerequisites.
2. **Pairwise comparability/preference:** policy may establish A ≻ B where the comparison is valid.
3. **Set compatibility:** the selected set must jointly satisfy applicable conflict/invariant/dependency constraints.
4. **Bounded selection:** choose at most the fixed 8 candidates subject to 1–3.
5. **Unresolved selection:** if multiple admissible sets remain and policy provides no valid relation to distinguish them, do not invent a winner through input order, timestamp, score, severity, or provider order.

### Why this matters
A candidate can be individually eligible while a combination is inadmissible. Conversely, two candidates can be individually incomparable while a third candidate changes the admissibility of the pair. Therefore a pure partial order over individual candidates cannot by itself prove that the selected 8 are safe/admissible.

### Future-countereffect result
A universal pairwise comparator would look simple but would force future mission classes into local ordering semantics and could miss set-level hazards. A universal set optimizer would be even worse: it would turn all mission semantics into one global optimization API. The safer architecture is **policy-scoped eligibility + policy-scoped pair/set constraints + bounded selection**, with unresolved relations remaining UNKNOWN/CONFLICT.

This is now the strongest candidate semantic shape. Exact policy fields/relations are still not frozen, and no implementation is authorized.


## Adversarial set cases — minimality of set-level constraints
The proposed semantic shape was attacked with concrete abstract cases:

- **A-B compatible, B-C compatible, A-C conflicting:** pairwise local preference/compatibility cannot be reduced to transitive safety. Set-level evaluation is required before admitting `{A,B,C}`.
- **A and B individually eligible, shared exclusive resource:** individual eligibility does not imply joint admissibility. The resource/conflict domain must be evaluated at set level.
- **A and B use distinct targets but share an UNKNOWN dependency:** distinct target IDs do not prove independence. Set admission remains UNKNOWN when required dependency completeness is missing.
- **A and B both eligible, but A's policy scope excludes the combined effect with B:** the set is inadmissible even though each candidate passes individually.
- **Two contradictory observations for the same protected claim:** contradiction is not a ranking signal. Without a prevalidated contradiction policy, the relevant candidate/set remains CONFLICT/UNKNOWN.
- **Eight candidates form an admissible set, ninth is incomparable but harmless:** the fixed bound permits the first admissible eight only if their selection is policy-supported; the bound itself does not establish why those eight outrank the ninth.
- **Nine candidates with multiple equally admissible 8-element sets and no policy distinction:** there is no justified unique selection. Returning an arbitrary eight would create hidden authority in enumeration order.

### Minimality result
The attack demonstrates that a set-level **compatibility/admissibility predicate** is genuinely necessary, but a universal optimizer is not. The Core contract should therefore expose the *semantic result* of policy evaluation, not a global optimization algorithm.

The unresolved issue is narrower now: how a Policy Contract expresses the admissibility/compatibility predicate and any permitted preference relation without introducing a universal schema prematurely. The next step is to test whether existing Policy/Claim/Conflict contracts already provide enough vocabulary to express this, before adding any new contract fields.


## Existing-vocabulary cross-check — pair/set semantics
The repository already contains sufficient *historical semantic vocabulary* to express the needed distinction without inventing a universal selector field:
- versioned conflict relation classifies **pairs/sets** as INDEPENDENT, COMMUTATIVE, ORDER_SENSITIVE, READ_WRITE, WRITE_WRITE, EFFECT_COLLISION, GLOBAL_INVARIANT_INTERACTION, COMMON_MODE, UNKNOWN;
- aggregate admission evaluates mission-window state including shared resources/authority, dependency overlap, common-mode domains, cumulative exposure, global invariants, unknowns and temporal window;
- higher-order interaction research explicitly establishes PAIRWISE_COMPATIBILITY != SET_COMPATIBILITY and models higher-order combinations against mission invariants;
- composite-effect research establishes individual admissibility != composite admissibility and requires recomputation of composite closure.

### Architectural consequence
No new generic `priority`, `score`, `selector`, or universal optimizer is justified. The semantic vocabulary points to a layered Policy/Admission evaluation:
`candidate eligibility → claim/policy-specific pair/set interaction classification → set admissibility → bounded selection`.
The exact current Policy Contract schema is still not proven to expose these historical interaction concepts as executable new-Core fields. Therefore **semantic sufficiency is established; schema sufficiency is NOT yet established**.

### Future-countereffect check
Reusing historical interaction concepts as semantic evidence preserves replaceability and avoids a new global selector API. Directly importing legacy objects/fields into Core would instead couple the new architecture to historical effect orchestration and prematurely widen scope. Therefore use the concepts as contract requirements/evidence, not legacy objects.

### Status
The pair-vs-set question is CLOSED at the semantic level: both pairwise and higher-order/set-level relations can be necessary, and neither subsumes the other. The remaining work is to determine the minimum protected Policy/Admission contract representation needed for STEP 7, without implementation until that representation is justified.


## Minimum protected Policy/Admission representation — derivation
Cross-checking MASTER Policy Contract, Goal/Claim contracts, and historical Conflict/Composite/Higher-Order contracts yields a smaller semantic requirement than a new selector schema.

A protected bounded-admission evaluation needs only these semantic inputs/results:
1. **Applicability context:** policy identity/version/scope plus mission/goal context establishing why this policy applies.
2. **Candidate evidence:** claim-specific observation/provenance/epistemic state sufficient for eligibility.
3. **Required-context rules:** protected policy requirements for freshness, independence, dependencies, assumptions and other claim-critical context; missing required context => UNKNOWN/HOLD.
4. **Interaction semantics:** an applicable policy/conflict contract capable of classifying relevant candidate pairs/sets, including UNKNOWN and higher-order/global-invariant interactions.
5. **Selection relation:** only where the applicable policy explicitly establishes a preference/precedence relation; absence is not permission for ranking.
6. **Set-admissibility result:** whether the candidate subset jointly satisfies applicable interaction/invariant/dependency constraints.
7. **Bound:** fixed 8, already closed.
8. **Decision state/evidence:** explicit ADMITTED / NOT_ADMITTED / UNKNOWN (or CONFLICT where the protected policy semantics require it) with evidence supporting the result.

### Important minimality observation
The Policy Contract itself does **not** need to contain every interaction rule as a monolithic field. Existing architecture supports policy references/dependencies plus separate claim/conflict/composite contracts. Therefore the minimum new-Core representation can be a protected **applicability/context binding** to the relevant versioned policy/claim/conflict semantics, rather than importing historical schemas wholesale.

### What is NOT required
- universal `priority` or `score`;
- generic selector authority;
- provider confidence;
- timestamp/input order as hidden precedence;
- legacy missionId/generatedAt as observation identity;
- a universal optimizer;
- new observation IDs solely to solve selection;
- queue/retry/tombstone/compatibility machinery.

### Future-countereffect attack
A monolithic Policy Contract containing every possible pair/set algorithm would become a permanent coupling point and make policy evolution equivalent to Core schema evolution. Conversely, a Policy Contract containing only a policy ID with no binding to its required interaction semantics would be too weak and could hide missing context. The minimum robust shape is therefore **versioned protected policy applicability + explicit required semantic dependencies + claim-specific interaction/selection results**, while leaving algorithms policy-scoped.

### Current conclusion
The repository supports deriving the semantic minimum without adding a new universal selector object. **Schema sufficiency remains PENDING** only for the exact machine representation/binding mechanism; semantic requirements are now sufficiently constrained to attack that representation next.


## Binding-representation attack — no new selector authority
The existing `ClaimEnvelope.policyContext` is a generic carrier, but its current implementation does not itself prove semantic validity, applicability, policy version binding, expiry, dependency completeness, or interaction-contract closure. Therefore merely placing an arbitrary object in `policyContext` would be insufficient and could create a false sense of policy authority.

The historical Policy Contract vocabulary already supplies the required semantic dimensions: policy id/version/hash, scope, evidence requirements, freshness, independence, thresholds/reference values, assumptions, failure conditions, tests, owner/authority, expiry and dependencies. Historical conflict contracts separately carry versioned pair/set interaction semantics. Semantic-version research also establishes that schema version, semantic version, policy version and authority epoch must remain distinct.

### Minimum representation candidate
The new Core should not invent a `SelectorAuthority`. If a future implementation needs a machine-readable admission binding, the smallest defensible shape is a **protected policy applicability binding** containing/referencing:
- policy identity + semantic version/hash;
- applicable mission/goal scope;
- authority/owner and authority epoch where required;
- validity/expiry;
- required evidence/context contract references;
- required conflict/interaction contract references and versions;
- dependency roots/closure required to interpret those contracts;
- explicit failure/UNKNOWN behavior.

This is a binding/reference to already governed semantics, not a new ranking algorithm or authority layer.

### Attack: can policy identity alone suffice?
No. Same policy identifier/bytes can be semantically insufficient if required interaction dependencies, reference values, authority epoch, expiry or claim-specific context are missing. `policy_id == policy_id` is not proof of applicability/completeness.

### Attack: can policyContext be reused as-is?
Only as a transport slot, not as proof. Its contents require a protected contract defining what constitutes a valid applicable policy binding. Otherwise a provider could populate policyContext and accidentally self-declare policy authority, violating the provider-proposes/Core-governs boundary.

### Attack: can policy version alone establish precedence?
No. Policy version establishes which semantics are referenced; it does not mean the policy contains a preference between heterogeneous candidates. If no governed precedence exists, comparison remains UNKNOWN/INCOMPARABLE.

### Future-countereffect
A dedicated selector object would duplicate Policy/Admission. An unconstrained `policyContext` object would become an untyped escape hatch. A monolithic policy schema would freeze all future interaction algorithms into Core. The protected applicability binding is the narrowest currently supported boundary.

### Result
Semantic minimum is now sufficiently constrained. **Machine representation is still PENDING implementation review:** before coding, the binding itself must be attacked for schema-version/policy-version/authority-epoch confusion, dependency incompleteness, cross-policy scope mismatch, expiry, and provider self-declaration.


## Binding integrity attack — version, epoch, scope, expiry, dependency closure
The binding was attacked against the existing architecture rather than inventing a new compatibility layer.

### 1. schema_version vs semantic_version vs policy_version vs authority_epoch
These dimensions cannot be collapsed. A representation/schema change does not necessarily change policy meaning; a policy meaning change can occur without changing bytes; an authority epoch changes which authority context is current. A valid binding must not use one field as a substitute for the others. If a critical dimension is required and missing, the result is UNKNOWN/REVALIDATE.

### 2. Scope mismatch
A valid policy can still be inapplicable because its mission/goal/resource/effect scope does not cover the candidate. Policy existence + version validity is insufficient. Protected Core must evaluate applicability; provider-supplied scope cannot self-authorize it.

### 3. Expiry / temporal validity
Policy validity is claim-relative and temporal. An unexpired policy does not prove evidence or authority context is current, and an expired policy cannot remain valid merely because its bytes are unchanged. Material policy, authority, evidence, world, or dependency changes require re-evaluation.

### 4. Dependency closure
A policy may depend on reference values, conflict/interaction semantics, verifier/claim contracts, or other governed roots. policy id/version/hash without resolving required dependencies is not semantic closure. Missing, stale, incompatible, or UNKNOWN required dependencies prevent silent admission.

### 5. Provider self-declaration
A provider may propose a policy reference in policyContext, but that is input/evidence only. Core must resolve applicability against protected policy/authority state. The candidate cannot be the authority for the policy governing itself.

### 6. Future-countereffect result
A single token combining schema+semantic+policy+epoch would simplify today's code but create ambiguity and future coupling. Requiring every consumer to understand every low-level contract would create a universal schema. The narrower boundary is: protected policy applicability is resolved by Core from versioned governed contracts and declared dependencies; candidates carry context/evidence, not authority.

### 7. Current conclusion
The semantic requirement is sufficiently attacked to proceed to exact representation review. No implementation is authorized yet. The next proof obligation is whether existing ClaimEnvelope.policyContext can be made semantically typed by contract/reference without adding a new top-level mechanism, or whether a dedicated protected field is genuinely necessary. Any new field must first prove policyContext cannot express the protected binding without becoming an untyped escape hatch.


## Exact representation review — `ClaimEnvelope.policyContext`
Repository evidence now permits a sharper conclusion.

### Existing capability
`ClaimEnvelope` already has `policyContext`, and it is detached/immutable at construction. MASTER explicitly defines a Policy Contract with id/version/hash, scope, evidence requirements, freshness, independence, thresholds/reference values, assumptions, failure conditions, tests, owner/authority, expiry and dependencies. The canonical semantic chain is CLAIM → POLICY → REFERENCES → VERIFIER → EVIDENCE → RESULT → DECISION.

### What `policyContext` cannot safely mean by itself
The current field is structurally an arbitrary detached value. It does not validate that the referenced policy exists, is applicable to the mission/goal, is current, has complete dependencies, is within expiry, or is authorized under the current authority epoch. Therefore changing only the caller's convention would not create a protected semantic boundary.

### What this does NOT justify
It does not justify a new top-level `PolicyBinding` object yet. Doing so before proving necessity would duplicate the existing ClaimEnvelope boundary and create another place where policy semantics could drift.

### Minimum conclusion
The preferred direction is to **type the existing `policyContext` contractually at the ClaimEnvelope boundary**, while keeping policy resolution/authority outside the candidate/provider. The typed context must be a reference/binding to already governed Policy/Claim/Conflict/Reference/Verifier semantics, not an embedded copy of all algorithms.

The protected semantics therefore become:
`ClaimEnvelope.policyContext` → governed policy applicability/reference context → Core resolves existence + version/semantic identity + scope + validity/epoch + dependency closure → admission/validation uses the resolved semantics.

A provider may propose this context, but Core must independently resolve and validate it. A context that cannot be resolved completely yields UNKNOWN/REVALIDATE; it does not become authority by being present in the claim.

### Structural warning
There is one remaining schema question: whether the typed `policyContext` should contain a compact policy reference plus dependency references, or a fully resolved protected semantic snapshot. These are not equivalent. A live reference risks temporal drift if evaluated later; an embedded snapshot risks duplication and stale semantics. The choice must be made from the lifecycle/validation boundary, not convenience.

### Status
**PENDING — exact internal shape only.** The top-level boundary should not expand yet. The next attack is reference-vs-resolved-snapshot semantics, including when resolution occurs, what is retained as provenance, and how epoch/expiry changes invalidate a previously resolved context. No implementation yet.
