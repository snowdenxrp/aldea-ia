# NEXO — COMPOSICIÓN DE EFFECT CONTRACTS / CLOSURE / SHARED FOOTPRINT — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
Can two individually admissible effects compose into an inadmissible composite effect when they share resources, queues, authority, recovery, compensation, dependencies or mission invariants?

## External cross-check
AWS states that idempotency must propagate through downstream services in an event-driven processing chain; a token that is not propagated can allow duplicate downstream side effects. AWS also warns that retrying non-idempotent operations can create duplicated results and that retries at multiple layers can compound attempts. citeturn0search0turn0search2
Abadi and Lamport's open-system work provides a formal basis for treating component guarantees as assumption/guarantee contracts and for reasoning about composition rather than assuming independently specified components automatically preserve a system-level property. citeturn0search25turn0search26

## Core result
YES.
Individual admissibility does NOT imply composite admissibility.
Candidate rule:
ADMISSIBLE(E1) ∧ ADMISSIBLE(E2) does not imply ADMISSIBLE(E1 ⊕ E2).
Composition requires a separate safety analysis.

## Canonical counterexample
E1 and E2 are individually safe and fenced, but share resource R. Their ordering can determine the safety invariant. Therefore individual contracts do not establish the contract of their interaction.

## New object: CompositeEffectContract
Candidate fields: composite_effect_id, member_effects, effect_interaction_graph, shared_resources, shared_queues, shared_authority, shared_recovery, shared_continuity, shared_dependencies, shared_boundaries, resource_incarnations, required ordering, commutativity assumptions, mutual exclusion requirements, joint uncertainty semantics, joint claim requirements, containment scope, coordination domain, aggregate retry/compensation policy, aggregate proof obligations, invalidation conditions, supported claim strength.

## Contract closure
Define CONTRACT_CLOSURE(S) as the transitive closure of all contract-relevant relationships for effect set S.
Closure includes direct effects, shared physical resources, shared queues, downstream children, provider continuations, shared authority, shared fences, shared recovery, shared trust roots, shared dependencies, shared continuity, ordering dependencies, claims affected by effects, compensation paths, retry/redrive paths, resource incarnations and effect-path boundaries.
If closure is incomplete, strong composite claims become UNKNOWN/HOLD.

## Interaction classes
DISJOINT; COMMUTATIVE; ORDER_SENSITIVE; MUTUALLY_EXCLUSIVE; CONDITIONALLY_COMPATIBLE; CONFLICTING; UNKNOWN.
DISJOINT may permit decomposition only after closure proof.
COMMUTATIVE still requires proof that relevant safety properties are order-independent.
ORDER_SENSITIVE requires authoritative ordering.
MUTUALLY_EXCLUSIVE requires shared coordination/fencing.
CONDITIONALLY_COMPATIBLE requires current state/context evaluation.
CONFLICTING requires an explicit protected protocol.
UNKNOWN blocks strong composition claims.

## New dependency and path effects
Composition can create a dependency D3 that did not exist in either individual effect.
Composition can also create new downstream paths, queues, child workflows or compensation paths.
Therefore INDIVIDUAL_CLOSURE is not COMPOSITE_CLOSURE, and EFFECT_PATH_CLOSURE must be recomputed for the composite.

## Joint uncertainty
An individual UNKNOWN can interact with a later effect that changes the resource state used for reconciliation.
Therefore U(E1 ⊕ E2) is not generally the union of U(E1) and U(E2).
Joint uncertainty remains mandatory.

## Composite causal order
Neither E1 nor E2 may individually require causal order, while their interaction may make order safety-relevant.
Therefore causal-order requirements must be derived from the composite claim.
ORDER_UNKNOWN remains a first-class blocking state where the claim depends on order.

## Composite compensation
An effect E2 that compensates E1 can itself change the world differently depending on whether E1 happened.
Therefore UNKNOWN(E1) does not imply COMPENSATE(E1). Compensation must be evaluated against joint uncertainty.

## Composite fencing
Individual fences may not create a combined safety order when effects share a physical resource, queue, provider account, control channel or downstream worker.
Thus individual fencing does not imply a composite fence.

## Composite CCD
The previous rule strengthens: CCD is the smallest authoritative coordination domain that must serialize or jointly validate all transitions capable of changing the truth of the composite claim.
CCD(E1 ⊕ E2) can therefore be larger than either individual CCD.
This is a safety consequence, not a deployment decision.

## Composite containment and absorption
Individual containment does not imply composite containment if shared queues or autonomous continuations remain active.
Likewise an absorbing state proven for E1 can cease to be safe when E2 remains capable of acting on the same footprint.

## Effect identity
Different effect IDs can still produce the same physical outcome, while one logical effect can create multiple provider attempts.
Candidate CompositeEffectIdentity = composite_id + member_effect_ids + interaction_context.

## End-to-end idempotency
AWS explicitly recommends propagating idempotency tokens through downstream services. This establishes the principle that LOCAL_IDEMPOTENCY is not necessarily END_TO_END_IDEMPOTENCY. citeturn0search0turn0search7
Therefore idempotency must be closed over the relevant effect path.

## Composite retry budget
Member retries, downstream retries, provider retries, redrive, compensation and recovery retries can interact.
AWS warns that retries at multiple layers can compound attempts and create retry storms. citeturn0search2
Candidate CompositeRetryBudget bounds all retry-producing paths relevant to the composite claim.

## New object: ContractClosure
Candidate fields: closure_id, member effects, direct footprint, interaction graph, effect-path closure, dependency closure, authority closure, coordination domain, containment domain, resource incarnations, queue/worker closure, recovery/compensation closure, continuity context, assumptions, required evidence, completeness status, freshness, invalidation triggers, computation evidence, owner and claim scope.
ContractClosure is an assurance object, not an authority grant.

## New object: CompositeClaim
Candidate fields: claim_id, composite effect identity, required invariant, member effects, contract closure, joint uncertainty, causal-order requirements, coordination domain, containment scope, evidence set, assumptions, current context, verification status and invalidation conditions.

## Candidate composition theorem
Research candidate, NOT formally proven:
If every member effect has a valid contract; contract closure is complete for the claim; every interaction is classified; ordering constraints are satisfied; joint uncertainty is safe for the allowed action; shared resources/fences/incarnations are current; downstream paths are covered; claim dependencies are current; the composite transition is admitted in its CCD; and the implementation refines the composite abstract model, then the composite claim may be evaluated from the composite contract.
This is a theorem candidate only.

## Decomposition rule
Composite claims cannot be decomposed merely because member effects are separately observable.
Decomposition requires proof of no cross-effect invariant, no shared relevant footprint, no required causal order, no shared authority/fence, no coupled compensation, no shared continuation, no shared resource incarnation, no joint uncertainty interaction and a decomposable claim.
Otherwise COMPOSITE_CLAIM_REQUIRED.

## Candidate invariants INV-CEC-01..32
01 Individual admissibility does not imply composite admissibility.
02 Composite closure includes interaction-generated dependencies.
03 Composite effect-path closure includes interaction-generated downstream paths.
04 Composite uncertainty is not generally the union of individual uncertainties.
05 Composite causal order is independently derived.
06 Composite fencing is not implied by individual fencing.
07 Composite containment is not implied by individual containment.
08 Composite absorption is not implied by individual absorption.
09 Local idempotency does not imply end-to-end idempotency.
10 Downstream idempotency must be closed over relevant effect paths.
11 Retry budgets are composite safety resources.
12 Provider retries belong to composite effect-path closure.
13 Shared resource incarnation is composite state.
14 Shared authority creates composite coordination requirements.
15 Shared recovery creates composite coordination requirements.
16 Shared compensation creates composite uncertainty.
17 Policy invalidation propagates across contract dependencies.
18 Topology changes invalidate affected composite closures.
19 Resource replacement invalidates affected composite closures.
20 Unknown interaction blocks strong composite claims.
21 Composite closure is not authority.
22 Composite claim is not world truth.
23 CCD is computed from composite safety interaction.
24 Containment scope covers composite effect paths.
25 Decomposition requires proof, not convenience.
26 Separate observability does not imply decomposability.
27 Separate providers do not imply independent failure domains.
28 Separate fences do not imply common safety order.
29 Separate effect IDs do not imply independent physical effects.
30 Composite admission is a protected transition.
31 Composite recovery is a new protected transition.
32 Composite verification must refine the composite abstract contract.

## Formal model direction
Candidate sets: Effects, Interactions, Resources, Queues, Providers, Dependencies, Policies, Fences, Incarnations, UncertaintySets, Claims, CoordinationDomains.
Candidate functions: COMPUTE_CONTRACT_CLOSURE(S,C), COMPUTE_INTERACTION_GRAPH(S), COMPUTE_COMPOSITE_CCD(S,C).
Candidate predicate COMPOSITE_ADMISSIBLE(S,C) requires closure completeness, interaction classification, current context, current fences/incarnations, allowed joint uncertainty, valid CCD authority and valid claim dependencies.

## Open-system consequence
Abadi/Lamport's open-system model is directly relevant: guarantees depend on explicit environment assumptions, and composition requires reasoning about those assumptions rather than silently treating components as closed and independent. citeturn0search25turn0search26
Therefore CompositeEffectContract must carry environment assumptions.

## Architectural consequence
The hierarchy is now:
EffectContract → individual effect assurance
CompositeEffectContract → interaction assurance
ContractClosure → transitive dependency/effect-path/authority/containment closure
CompositeClaim → claim-specific assertion
This sits above Protected Admission Kernel and below Mission / Goal / Intent.

## Remaining gaps
G-CEC-01 formal composition theorem.
G-CEC-02 complete interaction classification.
G-CEC-03 contract-closure completeness proof.
G-CEC-04 dynamic composition changes.
G-CEC-05 composite CCD minimality.
G-CEC-06 composite uncertainty state-space reduction.
G-CEC-07 composite containment/absorption.
G-CEC-08 end-to-end idempotency closure.
G-CEC-09 provider-specific composition contracts.
G-CEC-10 actual TLC/SANY.
G-CEC-11 implementation refinement.
G-CEC-12 fault-injection composition tests.

## Conclusion
INDIVIDUALLY SAFE does not mean COMPOSITIONALLY SAFE.
A composite effect is a new safety object. Its contract must be recomputed across interaction, shared resources, queues, dependencies, authority, fencing, recovery, compensation, uncertainty, causal order, effect-path closure, containment and mission invariants.

## Next attack
DYNAMIC COMPOSITION / RUNTIME EFFECT DISCOVERY / SCOPE WIDENING AFTER ADMISSION.
Question: if E1 was admitted under a complete composite contract, but execution dynamically discovers E2 or a new downstream dependency after admission, can the effect continue safely without silently widening its authority?
This directly attacks DISCOVERY → INVALIDATION → SCOPE WIDENING → ADMISSION → EXECUTION and may produce the final form of dynamic Contract Closure / Scope Freeze.