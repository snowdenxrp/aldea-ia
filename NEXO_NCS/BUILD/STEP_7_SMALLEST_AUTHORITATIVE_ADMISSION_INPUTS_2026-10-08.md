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
