# NEXO — JOINT UNCERTAINTY / STATE-SPACE REDUCTION / INTERACTION CLOSURE — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can Nexo reduce a potentially enormous joint uncertainty space without deleting a possible world that matters to a safety claim?

## External cross-check

TLA+ defines safety checking over all behaviors represented by a model, and its tools can check invariance properties. TLC is an explicit-state model checker; Apalache provides symbolic checking for bounded executions and inductive invariants under finite-data assumptions. Lamport also documents symmetry as a way to reduce state space, while the reduction must preserve the behaviors relevant to the checked property. citeturn0search5turn0search8turn0search26

AWS's idempotency guidance reinforces that retry safety depends on an explicit operation contract and that a timeout can leave the client uncertain about whether a side effect happened; reconciliation or an idempotent contract can reduce the uncertainty. citeturn0search0turn0search2

## Core result

State-space reduction is safe only when it is a **claim-preserving abstraction**, not merely a computational shortcut.

Therefore:

`REDUCED_MODEL == SAFE` only if the reduction preserves every distinction capable of changing the truth of the target safety claim.

And:

`UNKNOWN_WORLD != IRRELEVANT_WORLD`

unless irrelevance is established by a proof obligation tied to the claim.

## 1. The wrong approach

A naive recovery engine could collapse worlds such as:

W1: A1 occurred.
W2: A1 did not occur.
W3: A1 occurred and retry remains active.
W4: A1 and A2 occurred.
W5: A1 occurred before compensation.
W6: compensation occurred before A1.

into one label such as `UNKNOWN`.

That is computationally cheap but potentially unsafe because later actions can distinguish those worlds.

Likewise, collapsing two resources because they currently expose the same state is unsafe if their incarnations, histories, fences or downstream continuations differ.

## 2. Claim-relative abstraction

The correct abstraction target is not “the whole world.” It is:

`ABSTRACTION(world, claim)`

Two concrete worlds may be merged only if they are indistinguishable with respect to every future behavior relevant to the claim.

Candidate equivalence:

`W1 ≈_C W2`

iff every allowed future protected transition relevant to claim C has the same safety classification in W1 and W2.

This is stronger than equality of current observations.

## 3. Future-distinguishability test

A candidate merge is unsafe if there exists a future action A such that:

`SAFE(W1,A,C) != SAFE(W2,A,C)`

Therefore a reduction needs a witness search for distinguishing actions.

If such a witness exists, the worlds must remain separate for that claim.

If no witness exists under the declared model/environment assumptions, merging may be admissible as an abstraction candidate.

This produces a useful principle:

`MERGE only when SAFETY-EQUIVALENCE is established.`

## 4. Dimensions that cannot be casually erased

For Nexo's safety claims, potentially distinguishing dimensions include:

- effect outcome;
- attempt identity;
- active provider continuation;
- causal order;
- resource incarnation;
- fence generation;
- authority epoch;
- policy/invariant version;
- topology generation;
- dependency closure;
- effect-path closure;
- shared footprint;
- queue/child-effect state;
- STOP/recovery state;
- continuity context;
- external history availability;
- evidence freshness;
- recovery ownership;
- absorption boundary.

If changing one dimension can change whether an action is safe, it is part of the claim-relevant abstract state.

## 5. Monotonic uncertainty reduction

Evidence should reduce U only when it excludes worlds with claim-adequate evidence.

Bad rule:

`OBSERVATION → DELETE WORLDS`

Better rule:

`AUTHENTICATED + CONTEXT_BOUND + FRESH + CLAIM_ADEQUATE OBSERVATION → REMOVE ONLY INCONSISTENT WORLDS`

If an observation is compatible with multiple worlds, all compatible worlds remain.

Contradictory evidence should not be resolved by preference or arrival order; it creates `ORDER_CONFLICTING`, `EVIDENCE_CONFLICT`, or another explicit degraded state.

## 6. Evidence must be scoped to the uncertainty it reduces

An observation that proves:

`R1.state = SAFE`

does not automatically prove:

`E1 never happened`

or:

`R2.state = SAFE`

or:

`provider queue contains no E1 continuation`.

Therefore every evidence record needs an explicit claim/property scope.

Candidate:

`EvidenceReductionClaim = (Evidence, Context, Property, ExcludedWorlds)`

This prevents broad inference from narrow observations.

## 7. Interaction closure before reduction

Before reducing joint uncertainty, compute the relevant interaction closure.

Candidate closure:

`IC(E) = direct footprint + shared physical resources + queues + child effects + provider continuations + shared authority + shared recovery + dependencies + boundaries + claims`.

If a supposedly irrelevant actor/resource can still produce a protected effect in the claim's scope, it cannot be removed from the model.

This connects directly to the previous EffectPathClosure research.

## 8. Boundary-based reduction

Open-world systems make complete enumeration difficult.

Therefore a world can sometimes be abstracted away if every relevant effect path from it crosses a boundary B that is proven enforceable for claim C.

Candidate condition:

`ALL_RELEVANT_PATHS(W → protected_effect) CROSS B`

and:

`B_ENFORCED(C)`

Then internal details behind B may be abstracted for C, provided B's contract is preserved.

This is not global omniscience; it is claim-relative boundary closure.

## 9. Safe absorbing state as an abstraction boundary

An absorbing safe state can collapse historical distinctions only if every remaining distinction is irrelevant to future safety.

Candidate condition:

`ABSORBING(C) ∧ EFFECT_PATH_CLOSED(C) ∧ STALE_PATHS_FENCED(C)`

then historical worlds may become equivalent **for future safety claims** even while historical outcome remains UNKNOWN.

Important:

`ABSORBED != HISTORY_RESOLVED`.

## 10. Reduction classes

Candidate classification:

R0 EXACT — no abstraction.
R1 SYMMETRY — interchangeable identities under preserved assumptions.
R2 STUTTER/ORDER — internal steps irrelevant to the claim.
R3 HISTORY QUOTIENT — histories equivalent under claim semantics.
R4 BOUNDARY ABSTRACTION — internal environment hidden behind enforced boundary.
R5 ABSORPTION — future behavior constrained so historical distinctions cannot affect the claim.
R6 ASSUMPTION ABSTRACTION — distinctions removed only under explicit environment assumptions.

Every reduction carries:

- source model;
- target model;
- equivalence/abstraction relation;
- assumptions;
- preserved properties;
- excluded properties;
- boundary dependencies;
- invalidation triggers.

## 11. State-space reduction must preserve bad traces

For safety, the critical requirement is not preserving every implementation detail. It is preserving every behavior capable of reaching a forbidden state.

Candidate requirement:

`BAD_TRACE_CONCRETE ⇒ BAD_TRACE_ABSTRACT`

for every safety-relevant trace under the abstraction's assumptions.

If the abstract model can accidentally remove a concrete bad trace, the reduction is unsound.

The reverse implication is not necessarily required: an abstraction may conservatively report a possible violation that the concrete system cannot realize.

That is acceptable for safety, though it can reduce liveness/usability.

## 12. Conservative over-approximation

For safety analysis, a useful direction is:

`Concrete behaviors ⊆ Abstract behaviors`

The abstract model may contain extra behaviors, but should not omit concrete dangerous behavior.

This creates a principled reason why `UNKNOWN` can remain conservative.

However, over-approximation cannot justify real-world authority. A model proving an abstract property does not prove implementation enforcement until refinement is established.

## 13. Three different reductions

Nexo must not conflate:

### Computational reduction
Used to make formal analysis tractable.

### Epistemic reduction
Used when evidence genuinely excludes worlds.

### Operational containment
Used to make future worlds irrelevant by fencing/absorbing effects.

These are fundamentally different.

`MODEL_REDUCTION != EVIDENCE_REDUCTION != WORLD_CONTAINMENT`.

## 14. Symmetry is conditional

Two actors can be treated symmetrically only if swapping their identities preserves all claim-relevant properties.

Symmetry breaks when actors differ in:

- authority;
- resource incarnation;
- trust root;
- fence generation;
- recovery ownership;
- policy version;
- effect interaction;
- external history;
- dependency domain.

Therefore symmetry reduction needs an explicit symmetry certificate, not merely equal current values.

## 15. Attempt symmetry

Multiple retries of an idempotent effect may sometimes be equivalent, but only if the provider contract guarantees the same semantic request identity and duplicate handling.

A retry on R1 and a retry on R2 are not symmetric if R1/R2 are different incarnations.

A retry before STOP and a retry after STOP are not symmetric.

A retry under policy P1 and P2 is not symmetric if the policy can alter the effect semantics.

## 16. Causal-order abstraction

If a claim does not depend on order, then multiple orderings may be quotiented into one partial-order class.

If the claim does depend on order, they must remain distinguishable until order is established.

Candidate relation:

`ORDER_RELEVANT(C, E1, E2)`.

If false, order can potentially be abstracted.

If true and order is unknown:

`STRONG_CLAIM → HOLD/DEGRADE`.

## 17. Interaction-graph reduction

The full graph may be large. A candidate reduction is to preserve only the connected component relevant to the protected claim.

But this is safe only after closure over:

- effect interactions;
- dependency edges;
- queue/child continuation edges;
- authority edges;
- fence edges;
- recovery edges;
- boundary edges;
- claim dependencies.

A graph cut that crosses an unresolved effect-capable edge is unsafe for the claim.

## 18. New object: AbstractionCertificate

Candidate fields:

- abstraction_id;
- claim_id;
- concrete_scope;
- abstract_scope;
- abstraction_relation;
- preserved_safety_properties;
- assumptions;
- boundary set;
- dependency closure version;
- topology version;
- policy/invariant version;
- continuity context;
- invalidation triggers;
- proof/evidence references;
- owner;
- status.

An AbstractionCertificate is evidence, not authority.

## 19. New object: DistinguishingWitness

If two worlds are proposed to merge, a witness can prove they are not equivalent:

`(W1,W2,A,C,property_difference)`.

Examples:

- A compensation is safe in W1 but unsafe in W2.
- A retry duplicates an effect in W1 but not W2.
- A release is legal in W1 but blocked by STOP in W2.
- R1 is fenced in W1 but R2 is active in W2.

One valid witness is enough to prevent that merge for claim C.

## 20. Candidate invariants INV-JU-01..24

INV-JU-01 UNKNOWN world is not automatically irrelevant.
INV-JU-02 World merging is claim-relative.
INV-JU-03 Merge requires safety-equivalence or conservative abstraction proof.
INV-JU-04 Any future distinguishing action blocks merge.
INV-JU-05 Evidence removes only worlds inconsistent with claim-adequate evidence.
INV-JU-06 Narrow evidence cannot justify a broader claim.
INV-JU-07 Contradictory evidence is explicit conflict, not silent selection.
INV-JU-08 Interaction closure precedes safe graph reduction.
INV-JU-09 Unknown effect-capable paths cannot be removed from a strong claim without a boundary proof.
INV-JU-10 Absorption does not resolve historical outcome.
INV-JU-11 Absorption can justify future-safety abstraction only after boundary closure.
INV-JU-12 Computational reduction is distinct from operational containment.
INV-JU-13 Epistemic reduction requires evidence.
INV-JU-14 Symmetry requires preserved claim-relevant properties.
INV-JU-15 Different resource incarnations are not symmetric by default.
INV-JU-16 Different authority/STOP/policy contexts are not symmetric by default.
INV-JU-17 Unknown causal order cannot be erased when order affects the claim.
INV-JU-18 Graph reduction must preserve all relevant interaction paths.
INV-JU-19 Abstract models used for safety may conservatively over-approximate behavior.
INV-JU-20 A safety proof on an abstract model is not implementation proof without refinement.
INV-JU-21 Abstraction certificates are not authority.
INV-JU-22 A distinguishing witness invalidates a proposed merge for the affected claim.
INV-JU-23 Assumption changes invalidate affected abstractions.
INV-JU-24 Context, dependency, topology or boundary changes invalidate affected abstraction certificates.

## 21. Formal model direction

The formal model should represent:

WorldSet = set of allowed abstract worlds.

UncertaintySet(E) = claim-relevant possible worlds/histories.

AbstractionRelation(C,W1,W2) = whether W1 and W2 are interchangeable for claim C.

Distinguishable(C,W1,W2) = exists future action/trace whose safety classification differs.

A candidate abstraction rule is:

`¬Distinguishable(C,W1,W2) ⇒ Mergeable(C,W1,W2)`

subject to environment, boundary and dependency assumptions.

For safety checking, the abstract transition system should conservatively preserve concrete bad behaviors.

## 22. New architecture consequence

The clean architecture now needs an explicit **Assurance Abstraction Plane** between raw uncertainty/evidence and strong claims.

It does not authorize anything.

It answers only:

“What distinctions must remain visible for this claim?”

Its pipeline candidate:

`RAW WORLD/EVIDENCE`
→ `INTERACTION CLOSURE`
→ `UNCERTAINTY SET`
→ `DISTINGUISHABILITY ANALYSIS`
→ `CLAIM-SPECIFIC ABSTRACTION`
→ `ABSTRACTION CERTIFICATE`
→ `CLAIM EVALUATION`

A change in boundary, dependency, policy, topology, incarnation, authority, STOP or effect interaction invalidates affected certificates.

## 23. Critical distinction

The architecture now has four ways to make uncertainty manageable:

1. **Learn** — obtain evidence that removes possible worlds.
2. **Prove irrelevant** — show worlds are safety-equivalent for the claim.
3. **Contain** — fence/absorb future effects so remaining differences cannot violate the claim.
4. **Refuse the claim** — keep HOLD/QUARANTINE when none of the above is sufficient.

This is safer than forcing every UNKNOWN into a guessed single world.

## 24. Open gaps

G-JU-01 formal proof of claim-relative equivalence.
G-JU-02 sound/completeness criteria for interaction closure.
G-JU-03 scalable distinguishing-witness generation.
G-JU-04 abstraction under dynamic topology.
G-JU-05 abstraction under provider open-world behavior.
G-JU-06 abstraction invalidation propagation.
G-JU-07 finite-state encoding of uncertainty sets.
G-JU-08 TLC symmetry/abstraction implementation and actual checking.
G-JU-09 refinement from abstract model to implementation.
G-JU-10 fault injection validating reduction assumptions.
G-JU-11 quantitative resource limits for uncertainty representation.
G-JU-12 proof that absorption boundary actually covers all relevant paths.

## Conclusion

The state-space explosion problem does not justify guessing away uncertainty.

The safe route is claim-relative abstraction:

`LEARN OR PROVE-EQUIVALENCE OR CONTAIN OR HOLD`.

No reduction becomes a safety guarantee until its assumptions, preserved behaviors, boundaries and refinement are actually verified.

## Next attack

**DYNAMIC SCOPE EXPANSION + DISCOVERED DEPENDENCIES + ABSTRACTION INVALIDATION RACE**

Question: what happens when Nexo has already issued an abstraction certificate, and a previously unknown dependency or effect path appears while an effect is in flight?

Research gate remains closed. No V21 implementation.
