# NEXO AB51 — PAA TERNARY JOINT-SEPARATOR / HYPEREDGE CLOSURE RESEARCH — 2026-09-25

Status: RESEARCH ONLY. No implementation, no TLC, no TLAPS, no semantic freeze.

## 1. Continuity and persistence

Parent research artifact:
AB50 — NEXO_AB50_PAA_BOUNDED_TRANSITION_SYSTEM_FUTURE_OBSERVATION_COLLISION_SEARCH_RESEARCH_V1_2026-09-25.md

AB50 is already persisted on main:
d9d6ae59574e43af7d75891208189864aeb7798c

AB51 does not replace or rewrite AB49/AB50. It extends them.

The purpose of this round is narrower than AB50:
determine whether a genuine arity >= 3 semantic residual can survive when all unary, pairwise, protocol-specific, linkage, order and invalidation observations are equal.

## 2. Critical result from the TLA+ cross-check

The distinction between semantic variables and auxiliary variables must remain explicit.

An auxiliary variable may be introduced to make a refinement mapping expressible without becoming part of the abstract observable semantics. Therefore:

- implementation history may contain more information than Q_AA;
- a refinement mapping may use auxiliary information;
- auxiliary information does not automatically justify adding a new abstract state variable;
- conversely, if removing a relation changes an abstract P_AA observation or changes the enabled legal abstract continuation, that relation cannot be dismissed merely as auxiliary.

This gives AB51 a two-stage test:

A. semantic necessity:
does the relation change P_AA-relevant future behavior?

B. representational necessity:
does that relation require an independent abstract component, or can it be reconstructed/encoded by existing relations or auxiliary mapping data?

These questions must not be conflated.

## 3. New mathematical stress test: pairwise projections do not determine a ternary relation

AB50 correctly observed:

PAIRWISE COMPLETENESS != JOINT RELATIONAL COMPLETENESS.

AB51 makes this precise.

Let three event attributes be x,y,z in {0,1}. Consider:

R_even = {(x,y,z) | x + y + z is even}

R_odd  = {(x,y,z) | x + y + z is odd}

R_even and R_odd have identical unary projections and identical binary projections:

- every unary value 0 and 1 occurs;
- every pair (x,y), (x,z), (y,z) occurs.

Yet the ternary relations are different.

Therefore no reconstruction function that sees only the unary and binary projections can distinguish these two relations in general.

This is a structural counterexample to the inference:

"all pairwise relations are equal, therefore the joint relation is equal."

It is NOT yet a P_AA collision.

For it to become a P_AA collision, the legal transition system must contain a future transition whose enabling/validity semantics can observe the joint predicate.

Thus the correct AB51 question is not merely:

"Can a ternary relation exist?"

It is:

"Can a legal P_AA transition read a ternary distinction that is invisible to every retained lower-arity projection?"

## 4. Joint-read criterion

Define a future transition t as having a semantic read-set Read(t).

A candidate ternary relation J is P_AA-relevant only if there exists a legal continuation t such that:

1. J differs between two histories H1,H2;
2. all retained lower-arity facts are equal;
3. Read(t) can distinguish J(H1) from J(H2);
4. t changes a P_AA observation, a P_AA-relevant enabled continuation, or a required UNKNOWN/PENDING outcome;
5. the difference is not removable as concrete stuttering.

If no legal transition can read the distinction, J may be concrete information but is not a semantic residual for this claim.

This prevents the architecture from collecting arbitrary higher-order historical facts.

## 5. Hyperedge necessity theorem target

The round does NOT claim a theorem.

The target statement is:

A k-ary hyperedge is semantically necessary for P_AA only when there exist legal histories H1,H2 such that:

- Q_lower(H1) = Q_lower(H2)
- J_k(H1) != J_k(H2)
- the histories remain legal under the same claim/boundary/threat assumptions
- some legal future continuation reads J_k
- the continuation produces different P_AA observations
- no deterministic reconstruction from Q_lower plus protocol semantics exists.

Here Q_lower contains all currently retained unary/binary/protocol/linkage/order/invalidation/support facts.

If the joint relation is different but never read by any legal P_AA transition, it is not required by the abstract claim.

## 6. Minimal ternary separator families

AB51 must enumerate ternary candidates systematically rather than relying only on H1-H5.

Candidate event roles are drawn from:

AUTH_REVOKE
POLICY_CHANGE
DELEGATION_CHANGE
RESOURCE_REINCARNATE
LEASE_RENEW
LEASE_EXPIRE
LEASE_CONSUME
RETRY
RECHECK
MUTATION
DECIDE
ADMIT
BOUNDARY_CHANGE

For every unordered event triple {A,B,C}, enumerate:

- all legal bindings;
- all admissible orderings;
- concurrent/partial-order variants;
- invalidation-edge variants;
- protocol-specific variants;
- admission-link variants;
- replay/consumption variants where applicable.

Do not treat event-type triples as sufficient. Event identity and claim-relevant bindings remain part of the comparison.

## 7. Lower-arity equality gate

A candidate pair H1,H2 is eligible for hyperedge analysis only if all of the following are equal:

1. claim and threat model
2. boundary context
3. authority context at admission
4. resource and incarnation
5. policy context
6. delegation context
7. actual admission linkage
8. AdmissionBindingClass
9. protocol semantics
10. all unary event facts
11. all retained pairwise order facts
12. all retained pairwise invalidation facts
13. bridge/recheck linkage
14. lease interval/expiry/renewal/consumption/replay facts
15. retained auxiliary history allowed by AB49

If any lower-arity fact differs, the case is not a genuine hyperedge residual. Record it as a lower-arity separator and preserve the evidence.

## 8. Partial-order requirement

The search must not reduce temporal semantics to a total timestamp tuple.

For every candidate triple, compare:

- A < B < C
- A < C < B
- B < A < C
- B < C < A
- C < A < B
- C < B < A
- A || B with C ordered relative to both
- B || C with A ordered relative to both
- A || C with B ordered relative to both
- all legal partial orders permitted by the protocol

The relation itself must be compared modulo the existing order abstraction.

A collision caused merely by omitted order information is not a hyperedge discovery; it means OrderAndLinearizationFacts are incomplete.

## 9. Invalidation closure requirement

For each ternary candidate, compute:

- direct invalidation edges;
- transitive invalidation consequences;
- protocol-specific invalidation;
- invalidation timing;
- whether invalidation changes historical linkage or only future validity;
- whether renewal/recheck/consume observes the invalidation.

A claimed ternary residual must survive closure of these existing invalidation relations.

Otherwise it is absorbed by InvalidationFacts.

## 10. Protocol-specific closure

### ATOMIC

Test whether the joint distinction changes:

- legal linearization;
- relevant interleaving;
- admission linkage;
- invalidation ordering;
- atomic commit/admit behavior.

If all effects are derivable from linearization/order/invalidation/linkage, do not add a hyperedge.

### LEASE

Test whether the joint distinction changes:

- renewal authority;
- lease interval;
- expiry;
- bridge linkage;
- consumption;
- replay;
- policy/delegation/epoch/incarnation invalidation.

If the result is derivable from the lease state machine and retained bridge facts, the ternary relation is absorbed.

### RECHECK

Test whether the joint distinction changes:

- exact fact-set;
- fact-set mutation;
- recheck order;
- attempt identity;
- result actually consumed by admission;
- policy/delegation/boundary applicability.

A relation that merely restates an already retained recheck fact-set or order is redundant.

## 11. Joint relation versus hyperedge representation

AB51 introduces an important distinction.

A hyperedge may be:

A. a semantic primitive;
B. a derived relation over EventDAG nodes;
C. an auxiliary mapping artifact;
D. a compressed representation of already retained relations.

Only A requires semantic expansion.

B may be enough if the relation is computed from concrete history and preserved by refinement.

C does not alter abstract semantics.

D is representational packing and must not be mistaken for a new semantic dimension.

Therefore the question "do we need hyperedges?" is underspecified.

The correct questions are:

1. Is a higher-order distinction P_AA-relevant?
2. Is it irreducible from retained semantics?
3. Must the abstract state expose it?
4. Or can the refinement mapping compute it from auxiliary/concrete information?

## 12. Read-set closure

For each protocol transition, define the smallest semantic read-set needed to determine:

- whether the transition is legal;
- which admission linkage it uses;
- which P_AA observation it emits;
- whether UNKNOWN/PENDING is required.

Then define:

Closure(Q) = all relations reconstructible from Q that are observable by every legal future transition.

A candidate relation outside Closure(Q) is a residual only if some legal transition reads it.

This provides a stronger elimination route for HistorySupport:

HistorySupport need not remain an independent semantic variable if every P_AA-relevant fact it contains is reconstructible by the transition read-sets from retained semantics or safely produces UNKNOWN.

## 13. Hyperedge absorption decision table

For every candidate J:

CASE A:
J reconstructible from retained facts.
Result: ABSORB.

CASE B:
J not reconstructible, but no legal P_AA transition reads J.
Result: NONSEMANTIC_FOR_PAA; do not add to Q_AA.

CASE C:
J not reconstructible and a legal transition reads J, but the distinction only changes an auxiliary/stuttering step.
Result: ABSORB_AS_AUXILIARY.

CASE D:
J not reconstructible, a legal transition reads J, and P_AA differs.
Result: GENUINE_SEMANTIC_RESIDUAL.

CASE E:
The transition semantics needed to determine whether J is read are themselves unspecified.
Result: UNKNOWN_DUE_TO_MISSING_SEMANTICS.

This is the core AB51 classification.

## 14. Future-observation collision remains the final arbiter

Current observation equality is insufficient.

For each candidate:

Obs_AA(H1) == Obs_AA(H2)

does not close the case.

We require:

FutureObs_AA(H1) == FutureObs_AA(H2)

under the compared legal continuation family, modulo the explicitly defined observation equivalence and stuttering rules.

If they differ, the abstraction has a future collision.

UNKNOWN remains distinct from FALSE.

## 15. HistorySupport elimination sharpened

The earlier reconstruction function was:

ReconstructHS(Linkage, Order, Invalidation, ProtocolSpecificFacts, AuxiliaryHistory)

AB51 adds:

ReconstructHS must also be read-set complete.

That means:

1. every reconstructed support fact needed by a legal transition is available;
2. no future oracle is consulted;
3. no authority is synthesized;
4. no historical admission linkage is rewritten;
5. boundary is preserved;
6. if multiple reconstructions remain and they enable different P_AA observations, output UNKNOWN/PENDING.

If all retained support is either reconstructible or semantically unreadable for P_AA, HistorySupport may be removable from the abstract kernel.

This is stronger than merely showing that a support record can be serialized.

## 16. LeaseBridge / AdmissionBindingClass

AB51 keeps the distinction.

A future transition may need both:

- the identity/class of the admission binding;
- the historical transport/bridge relation that explains how the authorization reached that admission.

A successful merge requires a deterministic mapping:

LeaseBridge = f(AdmissionBindingClass, Order, Invalidation, ProtocolSemantics, Support)

and the function must preserve future observations.

If two histories have the same AdmissionBindingClass but different bridge semantics and future renewal/replay/admission differs, the merge is invalid.

No merge is declared in AB51 without a collision search.

## 17. Four-event escalation gate

A four-event search is permitted only after a ternary family passes all of:

- lower-arity equality;
- protocol closure;
- order closure;
- invalidation closure;
- reconstruction attempt;
- read-set test;
- future-observation test.

If a ternary residual survives, escalate to the smallest four-event extension that can actually read it.

Do not search arbitrary four-event combinations merely because the domain permits them.

This prevents combinatorial expansion without semantic justification.

## 18. Candidate canonical witness

The canonical mathematical witness for a genuine ternary gap is:

H_even and H_odd have identical unary and binary projections but different ternary relation.

This witness proves only non-reconstructibility from lower-arity projections.

To upgrade it to a P_AA collision, construct a legal future transition:

T_joint = if J(A,B,C) then AdmitUsingRequiredLink else UNKNOWN/FALSE

subject to the actual protocol semantics.

If T_joint is not legal in ATOMIC, LEASE, or RECHECK, the witness remains mathematical but not P_AA-semantic.

This distinction is mandatory.

## 19. Expected bounded-search outputs

AB51 must report independently:

T1 — ternary mathematical non-reconstructibility:
FOUND / NOT_FOUND

T2 — legal protocol ternary residual:
FOUND / NOT_FOUND / UNKNOWN

T3 — P_AA future collision:
FOUND / NOT_FOUND / UNKNOWN

T4 — genuine abstract hyperedge necessity:
FOUND / NOT_FOUND / UNKNOWN

T5 — HistorySupport eliminability:
SUPPORTED_BOUNDED / REFUTED_BOUNDED / UNKNOWN

T6 — LeaseBridge merge:
SUPPORTED_BOUNDED / REFUTED_BOUNDED / UNKNOWN

No item may be promoted to theorem solely from a finite bound.

## 20. Semantic-freeze gate

Semantic freeze remains prohibited unless all of these are satisfied:

1. no surviving P_AA-relevant ternary residual within the tested model;
2. any discovered higher-order relation is reconstructible or nonsemantic;
3. four-event escalation has been completed where justified;
4. HistorySupport reconstruction is closed enough to state a precise candidate;
5. LeaseBridge/AdmissionBindingClass relation is resolved or explicitly retained;
6. quotient congruence has been attacked under every legal transition class;
7. refinement obligations are written;
8. exact TLA+ abstract variables are defined;
9. auxiliary variables are explicitly separated from abstract semantic variables;
10. only then begin TLC/TLAPS work.

AB51 does not satisfy this gate.

## 21. Current status after AB51 analysis

Established:

- AB50 is persisted and intact.
- Pairwise completeness cannot logically imply arbitrary ternary completeness.
- The parity-style witness demonstrates that lower-arity projections can be identical while a genuine ternary relation differs.
- Such a difference is not automatically a P_AA residual.
- A legal future transition must be able to read the joint distinction and expose it through P_AA.
- Hyperedge necessity and abstract-state necessity are separate questions.
- Auxiliary refinement information must not be confused with observable semantic state.

Still OPEN:

- exhaustive bounded ternary protocol search;
- existence of a legal P_AA ternary residual;
- four-event escalation;
- EventDAG representation;
- HistorySupport elimination;
- LeaseBridge/AdmissionBindingClass merge;
- exact quotient congruence;
- semantic freeze;
- TLA+ model;
- TLC/TLAPS.

Status labels for the next machine search:

TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN
TERNARY_PAA_COLLISION = UNKNOWN
HYPEREDGE_SEMANTIC_NECESSITY = UNKNOWN
HS_ELIMINATION = UNKNOWN
BRIDGE_MERGE = UNKNOWN

These labels are intentionally conservative. They record what the analysis establishes and what remains unverified.

## 22. Next action

The next concrete research pass should instantiate the AB50 bounded transition system with the read-set closure above and enumerate all event triples up to the current bound.

For each projection-equivalence class:

1. verify lower-arity equality;
2. detect irreducible ternary relation;
3. construct the smallest legal continuation that can read it;
4. compare P_AA observations;
5. attempt reconstruction;
6. classify the result;
7. escalate only surviving semantic residuals to four events.

No implementation should begin before this search is complete enough to support a semantic model.
