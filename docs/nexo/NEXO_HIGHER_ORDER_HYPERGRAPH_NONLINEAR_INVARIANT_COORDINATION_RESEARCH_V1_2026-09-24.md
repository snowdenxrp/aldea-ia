# NEXO - HIGHER-ORDER INTERACTION HYPERGRAPH / NONLINEAR INVARIANT / CONSERVATIVE COORDINATION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can Nexo compute a minimal safe coordination domain when no pairwise conflict exists, but a combination of three or more effects violates a mission invariant?

## External cross-check

TLC reduces state exploration through symmetry only when the specification and checked properties are actually invariant under the declared permutations; Lamport's TLC documentation explicitly warns that symmetry assumptions can affect temporal checking. citeturn0search28

Partial-order reduction relies on independence/commutativity conditions, and research literature defines independence in terms of commutativity and preservation of enabledness. Incorrect reduction assumptions can be unsound. citeturn0search0turn0search1

Recent 2026 work on reduction for structured concurrent programs treats commutativity as a powerful reduction principle while noting that dynamic concurrency and composition make scaling it challenging. citeturn0search2

TLC is an explicit-state model checker/simulator for executable TLA+ specifications and can check safety and liveness properties, but this project has not yet executed the formal model. citeturn0search12turn0search29

## Core result

A pairwise interaction graph is not sufficient for arbitrary mission invariants.

Required structure:

EFFECTS / TRANSITIONS
→ PAIRWISE INTERACTIONS
→ HIGHER-ORDER INTERACTIONS
→ MISSION INVARIANT
→ COORDINATION DOMAIN

A hyperedge represents a combination whose joint presence can change the truth of the claim even when every pair is individually compatible.

Therefore:

PAIRWISE_COMPATIBILITY != SET_COMPATIBILITY

and:

GRAPH_CLOSURE != HYPERGRAPH_CLOSURE.

## Canonical counterexample

Mission invariant:

A + B + C <= 10

Effects:

E1 consumes 4
E2 consumes 4
E3 consumes 3

Pairs are safe:
E1+E2 = 8
E1+E3 = 7
E2+E3 = 7

Triple:
E1+E2+E3 = 11

The mission invariant creates a 3-way interaction hyperedge:

{E1,E2,E3} -> M_capacity.

## Nonlinear and temporal interactions

The same problem occurs with multiplicative thresholds, min/max constraints, rates, temporal occupancy, causal chains and conservation laws.

For example, two effects can be pairwise safe while their combined temporal overlap violates a duration or rate limit.

Thus the interaction closure must preserve every state dimension capable of changing the mission claim, not merely direct read/write overlap.

## Candidate object: HigherOrderInteraction

Fields:
- interaction_id;
- claim_id;
- effect_set;
- attempt_set;
- scope_context_set;
- resource/incarnation set;
- provider set;
- mission invariant;
- interaction arity;
- interaction type;
- aggregate function;
- temporal constraints;
- causal constraints;
- uncertainty set;
- allowed interleavings;
- excluded worlds;
- proof/contract;
- assumptions;
- coordination requirement;
- invalidation triggers;
- verification status.

## Candidate object: InteractionHypergraph

Nodes:
- effects;
- attempts;
- resources;
- providers;
- queues;
- recovery actions;
- compensation actions;
- mission invariants;
- claims.

Hyperedges may represent:
- shared aggregate;
- shared physical resource;
- shared temporal budget;
- causal dependency;
- shared uncertainty;
- joint compensation;
- joint fencing;
- shared provider;
- shared continuity;
- nonlinear invariant;
- group mutual exclusion;
- higher-order capacity;
- common recovery path.

## Higher-order closure

For claim M:

HOC(M) = least fixed point containing every effect and domain whose state can change the truth of M, including higher-order combinations.

PAIRWISE_CLOSURE = all known pairwise interactions.

HIGHER_ORDER_CLOSURE = all claim-relevant combinations.

The second may be much larger.

## Scope computation consequence

The previous CCD rule:

CCD = EFFECT/INVARIANT INTERACTION CLOSURE + AUTHORITATIVE COORDINATION REQUIREMENTS

must now become:

CCD = HYPERGRAPH CLAIM CLOSURE + AUTHORITATIVE COORDINATION REQUIREMENTS

with conservative handling of unknown hyperedges.

If exact higher-order closure cannot be computed, Nexo must:
1. overapproximate;
2. establish a safe abstraction;
3. establish an absorbing/enforcement boundary;
4. weaken the claim;
5. HOLD/QUARANTINE.

It cannot silently underapproximate.

## Conservative overapproximation

If Nexo cannot determine whether E1,E2,E3 have a nonlinear interaction, treating them as potentially interacting enlarges CCD and reduces liveness.

Assuming no interaction because no pairwise edge was found can create false safety.

Therefore:

UNDERAPPROXIMATION_OF_SAFETY_INTERACTIONS -> PROHIBITED_FOR_STRONG_CLAIMS.

OVERAPPROXIMATION -> POSSIBLE_FALSE_BLOCKING / LIVENESS_COST.

This follows the Nexo safety asymmetry:

FALSE_STALE is preferable to FALSE_CURRENT.

## Bounded abstraction

Overapproximation cannot become global paralysis.

Candidate abstraction levels:

L0 exact effect hypergraph
L1 claim-state projection
L2 aggregate/resource envelopes
L3 interaction-preserving abstraction
L4 compositional assume/guarantee
L5 bounded safety envelope
L6 enforcement-boundary reduction

Each reduction needs a claim-specific soundness contract.

## Candidate AbstractionContract

Fields:
- abstraction_id;
- claim_id;
- concrete domain;
- abstract domain;
- abstraction map;
- concretization relation;
- preserved predicates;
- preserved transitions;
- preserved interaction classes;
- preserved temporal properties;
- preserved uncertainty;
- preserved resource/incarnation distinctions;
- preserved boundary/fence semantics;
- omitted behavior;
- environment assumptions;
- soundness status;
- refinement relation;
- invalidation triggers.

Critical rule:

ABSTRACTION_MAY_FORGET_DETAILS only if FORGOTTEN_DETAILS_CANNOT_CHANGE_CLAIM_TRUTH.

If that cannot be established:

UNKNOWN / no strong reduction.

## Projection hazard

A projection that tracks only resource_usage <= 10 but drops duration, incarnation, provider retry, pending queue or compensation can look safe while the concrete system violates a temporal or causal invariant.

Therefore:

PROJECTION_COMPLETE_FOR_CLAIM is itself a proof obligation.

## Hyperedge compression

A large concrete set may be represented by an aggregate component, such as:

E1,E2,E3,E4,E5 -> ResourceBudgetComponent

if the abstraction preserves every property relevant to the mission claim.

But aggregate validity must preserve:
- maximum consumption;
- timing;
- release;
- retries;
- uncertainty;
- incarnation;
- compensation;
- causal constraints.

## Compositional decomposition

Candidate CompositionalProofContract:

For components A and B, A guarantees GA under assumptions AA and B guarantees GB under assumptions AB.

Composition is valid only if:
- assumptions are satisfied;
- shared dependencies are included;
- shared footprint is represented;
- guarantees compose to the mission invariant;
- no hidden higher-order interaction remains;
- circular assumptions are resolved under the existing proof-trust rules.

Therefore:

LOCAL_PROOF(A) + LOCAL_PROOF(B) != GLOBAL_PROOF(A+B)

without a composition contract.

## Higher-order uncertainty

A joint uncertainty set can be larger and structurally different from independent scalar uncertainties because correlations matter.

Therefore:

JOINT_UNCERTAINTY must preserve correlations where they affect the claim.

Candidate predicate:

SAFE_UNDER_JOINT_HYPERUNCERTAINTY(A,U,M,C)

iff every allowed concrete world and every permitted relevant interleaving represented by U preserves M after action A.

If the abstraction is conservative, proving this over the abstract domain may discharge the concrete claim. If abstraction soundness is unknown, no promotion.

## Interaction arity

U1 unary
P2 pairwise
H3 ternary
H4+ higher-order
M mission-wide

A mission-wide interaction is not automatically a failure; it means the invariant itself may impose a broad aggregate constraint.

The objective remains:

MINIMAL SAFE COORDINATION DOMAIN

not:

MINIMUM NUMBER OF EDGES.

## Nonlinear mission invariants

Candidate classes:
- additive budgets;
- multiplicative constraints;
- ratios;
- min/max thresholds;
- temporal windows;
- rate limits;
- conservation laws;
- mutual exclusion;
- graph connectivity;
- path-dependent invariants;
- cumulative irreversible effects.

The invariant's mathematical structure determines which abstraction is safe.

## Higher-order scope widening

A scope expansion can introduce an effect that is pairwise compatible with every current effect but jointly incompatible with their aggregate.

Therefore:

SCOPE_WIDENING -> RECOMPUTE_HIGHER_ORDER_IMPACT

not merely:

SCOPE_WIDENING -> CHECK_PAIRWISE_CONFLICTS.

## Recovery

Recovery can itself introduce higher-order interactions:

old E1 UNKNOWN
+
new E2
+
compensation C1
+
provider retry R1.

The recovery action can create a new hyperedge even when none existed before.

Therefore recovery is a participant in the interaction hypergraph.

## Candidate invariant family INV-HOI-01..36

01 Pairwise compatibility does not imply set compatibility.
02 Higher-order interaction is claim-specific.
03 Mission invariants can induce hyperedges without pairwise conflicts.
04 Unknown hyperedge is not absent hyperedge.
05 Safety closure must be conservative for strong claims.
06 Underapproximate interaction closure is prohibited unless irrelevant by proof.
07 Overapproximation may reduce liveness but preserve safety.
08 Projection completeness is a proof obligation.
09 Aggregate abstraction must preserve claim-relevant behavior.
10 Temporal constraints belong in higher-order closure.
11 Causal chains belong in higher-order closure.
12 Correlated uncertainty must not be replaced by independent intervals without proof.
13 Recovery actions belong in closure.
14 Compensation belongs in closure.
15 Provider retry/redrive belongs in closure.
16 Resource replacement belongs in closure.
17 Shared physical resources belong in closure.
18 Mission budgets belong in closure.
19 Nonlinear invariants may require hyperedges.
20 Scope widening requires higher-order impact recomputation.
21 Scope reduction requires proof that removed domains cannot affect the claim.
22 Compositional proof requires explicit assumptions/guarantees.
23 Circular assumptions cannot silently discharge composition.
24 Abstraction cannot silently create authority.
25 Reduction certificate is not authority.
26 Safe abstraction must preserve relevant interleavings.
27 Temporal abstraction must preserve intermediate safety.
28 Higher-order UNKNOWN prevents strong reduction unless bounded by enforcement.
29 Mission-wide constraints may legitimately require broad coordination.
30 Broad coordination should be reduced only through sound abstraction.
31 Recovery cannot rely on pairwise state alone.
32 Hypergraph closure may require fixed-point computation.
33 Safe non-convergence is preferred to false-current composition.
34 Tool/model reductions require explicit soundness assumptions.
35 Actual TLC/SANY execution remains separate from design.
36 Implementation refinement remains open.

## Candidate theorem

Not formally proven:

If an abstraction preserves all claim-relevant interaction hyperedges, aggregate/temporal/causal constraints, uncertainty correlations, recovery/compensation paths and enforcement boundaries, then coordination may be computed over the abstraction instead of the concrete hypergraph without weakening the target claim.

If any preserved property is UNKNOWN, the abstraction cannot justify a stronger claim.

## Architecture consequence

The clean architecture now needs an:

INTERACTION HYPERGRAPH

between:

EFFECT DISCOVERY
and
COORDINATION DOMAIN COMPUTATION.

Flow:

DISCOVER EFFECTS
→ COMPUTE DIRECT FOOTPRINT
→ BUILD PAIRWISE GRAPH
→ DISCOVER HIGHER-ORDER CONSTRAINTS
→ BUILD HYPERGRAPH
→ APPLY CLAIM-SPECIFIC ABSTRACTION
→ VERIFY CLOSURE/SOUNDNESS
→ COMPUTE MINIMAL SAFE CCD
→ PROTECTED ADMISSION.

This is a major refinement of the previous graph-only architecture.

## Formalization target

Future finite model:
- E1,E2,E3;
- nonlinear mission invariant;
- pairwise-safe states;
- violating triple;
- dynamic scope widening;
- recovery action;
- correlated UNKNOWN;
- temporal overlap;
- abstraction mode;
- reduced CCD;
- full CCD.

Required safety property:

NO_PROTECTED_ADMISSION_UNDER_REDUCED_CCD_UNLESS_REDUCTION_PRESERVES_ALL_CLAIM_RELEVANT_INTERACTIONS.

Actual SANY/TLC execution remains an open gate. TLC supports explicit-state safety/liveness checking, and its symmetry machinery requires justified symmetry assumptions. citeturn0search12turn0search28

## Next attack

HIGHER-ORDER HYPERGRAPH
+
ABSTRACTION
+
ASSUME/GUARANTEE
+
UNKNOWN
+
RECOVERY

Question:

Can an abstraction accidentally hide a higher-order interaction and thereby make a locally valid compositional proof appear globally valid?

This attacks whether Nexo can establish sound compositional reduction rather than merely a conservative-looking approximation.