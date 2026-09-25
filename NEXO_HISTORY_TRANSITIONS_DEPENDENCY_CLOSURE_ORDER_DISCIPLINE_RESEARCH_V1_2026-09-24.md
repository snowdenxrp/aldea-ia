# NEXO — HISTORY TRANSITION SEMANTICS, DEPENDENCY CLOSURE AND ORDER DISCIPLINE RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No theorem claimed proven.

## 1. External cross-check

Cousot's framework starts from transition-system operational semantics, collecting semantics, partial orders and fixpoints, then relates concrete and abstract properties through abstraction/concretization; compositional abstraction and reduced products are established techniques. This supports modeling Nexo's concrete history first and deriving abstractions from explicit correspondence rather than guessing an abstract state. citeturn0search2turn0search3

Lamport's work confirms that history variables can be added to a specification to construct refinement mappings, while remaining auxiliary rather than implementation behavior. It also distinguishes history variables from prophecy variables, reinforcing that refinement support must be classified explicitly. citeturn0search24turn0search25

## 2. AB6-G1 — History transition semantics

Candidate concrete transition system:

C = (S, Init, Next, Env, Eff, Auth, Dep)

A history h is a sequence s0,s1,... with:
- s0 satisfies Init;
- each adjacent pair satisfies Next;
- environment assumptions are satisfied;
- effect/authority/dependency observations are attached to the appropriate transitions or states.

The important correction is that external effects should not be inferred solely from final state.

Candidate:
EffectHistory(h) is a first-class projection of transitions/events, not a reconstruction from final state.

## 3. Event identity

A transition/event candidate identity:

EID = (operation_id, attempt_id, resource_incarnation, authority_epoch, provider_execution_id, temporal_position)

Not every claim requires every field, but a historical claim must specify which distinctions it requires.

Therefore:
EVENT_IDENTITY_IS_CLAIM_SCOPED.

## 4. State equality does not imply transition equality

Two histories may have:
same initial state,
same final state,
different transition traces.

This is a direct adversarial model for:
- compensation;
- rollback;
- retry;
- duplicated external effects;
- revoked/reissued authority;
- resource reincarnation.

Therefore:
STATE_TRACE_COLLAPSE_CAN_DESTROY_CLAIM_RELEVANT_HISTORY.

## 5. AB6-G2 — Dependency closure

Candidate dependency graph/hypergraph:

D = (V, E, tauE, scope, interval, boundary)

For claim P:

Closure_P(X) = least set containing X and closed under dependency relations relevant to P.

The closure operator should be tested for:
- extensiveness: X subset Closure_P(X);
- monotonicity: X subset Y => Closure_P(X) subset Closure_P(Y);
- idempotence: Closure_P(Closure_P(X)) = Closure_P(X).

These are candidate algebraic laws, not yet proven for the typed temporal hypergraph.

## 6. Temporal dependency matters

A dependency may exist only during an interval.

Example:
provider A and provider B shared recovery root from t10 to t20 but not t21.

Therefore dependency edges need temporal validity or versioning.

Ignoring time can create:
false independence, or
false non-independence.

Candidate:
DEPENDENCY_CLOSURE_IS_TIME_SENSITIVE.

## 7. Causal precedence is distinct from dependency

If A caused B, that does not necessarily mean A and B share a common failure mode.

Conversely, a common scheduler can create common-mode dependence without being the direct cause of every event.

Therefore:
CAUSAL_RELATION != COMMON_MODE_RELATION.

Both may be required in the hypergraph.

## 8. AB6-G3 — Threat-model semantics

Candidate threat model TM defines:
- adversary/failure classes;
- prohibited dependency classes;
- tolerated dependency classes;
- boundary;
- time interval;
- authority/recovery assumptions;
- observation/evidence assumptions.

Then independence is always relative to TM.

Candidate:
Independent_P(X | TM,B,I)

No universal unqualified independence predicate should exist.

## 9. Threat-model composition

Two claims can use different threat models over the same topology.

TM1 may prohibit shared scheduler.
TM2 may prohibit only shared cryptographic root.

Then:
Independent(X|TM1) and Independent(X|TM2)
can differ without contradiction.

Therefore:
INDEPENDENCE_IS_PARAMETERIZED_BY_THREAT_MODEL.

## 10. AB6-G4 — Order structures

Current candidate:
- information precision: preorder less-or-equal-I;
- authority entailment: preorder less-or-equal-A;
- claim status: relation induced by justified semantic predicates, not yet assumed to be an order.

A preorder is safer than a partial order because distinct representations may be mutually equivalent in consequences.

For information:
x less-or-equal-I y means y is at least as precise for the specified claim contract.

For authority:
a less-or-equal-A b means authority consequences of a are contained in b under identical identity/resource/currentness/boundary semantics.

These definitions remain candidates.

## 11. Equivalence classes

If:
x less-or-equal-I y and y less-or-equal-I x

then x and y may be equivalent with respect to the claim.

Likewise for authority.

But:
information equivalence does not imply authority equivalence;
authority equivalence does not imply effect equivalence.

This preserves the earlier equivalence hierarchy.

## 12. AB6-G5 — Claim status

Instead of forcing a lattice immediately, define:

Status_P(k) in CandidateStatus

where CandidateStatus contains:
TRUE_JUSTIFIED
FALSE_JUSTIFIED
UNKNOWN
PENDING_WITNESS
PENDING_JOINT_REALIZATION
PENDING_CONCRETIZATION
HISTORY_INCOMPLETE
DEPENDENCY_UNKNOWN
BOUNDARY_UNKNOWN
AUTHORITY_UNKNOWN
SCOPE_EXCEEDED

A future algebra may order these, but status values should first be given transition/refinement rules.

## 13. Safe status transition rule

A newly discovered fact may:
- strengthen evidence;
- weaken evidence;
- invalidate an assumption;
- reveal a counterexample;
- narrow claim scope;
- leave status unchanged.

Therefore no generic monotonicity rule over Status_P is accepted.

Only the evidence/knowledge relation can have a formally specified monotonicity property.

## 14. AB6-G6 — Concretization direction

Candidate concretization:

gamma_P(a) = set of concrete histories/contexts that satisfy representation relation Rep_P(c,a).

This avoids prematurely assuming that the abstract domain has a canonical lattice.

A Galois connection can later be introduced if the required orders and adjunction hypotheses are actually established. Cousot explicitly treats Galois connections as one possible formalization when the required approximation structure exists. citeturn0search3turn0search6

Therefore:
REPRESENTATION_RELATION_PRECEDES_GALOIS_CONNECTION.

## 15. Reduction semantics

A reduction rho_P should remove abstract combinations whose concretization is impossible or inconsistent with the claim contract.

Candidate soundness condition:
every concrete behavior represented before reduction remains represented after reduction, unless the reduction is explicitly a claim-strengthening operation with a separately justified contract.

The exact inclusion direction depends on the chosen precision ordering and is intentionally left OPEN.

## 16. AB6-G7 — Finite countermodels

Countermodels can now be specified as finite transition systems, but they should remain semantic test fixtures, not proof of the general property.

Each finite model needs:
- finite state set;
- Init;
- Next;
- event/effect labels;
- authority epochs;
- resource incarnations;
- dependency hyperedges;
- boundary;
- threat model;
- abstraction;
- target claim;
- expected justified status.

This makes them suitable for later bounded TLC experiments without prematurely calling them proofs.

## 17. Countermodel CM4 expanded — Helly-style trap

A family of witnesses may have all small subsets realizable while the complete set is not realizable.

Therefore no assumption of pairwise or bounded-subset sufficiency is safe without a proven structural property of the concrete domain.

Candidate invariant:
LOCAL_COMPATIBILITY_DOES_NOT_IMPLY_GLOBAL_REALIZABILITY.

## 18. Countermodel CM7 expanded — Enforcement gap

Abstract model:
DENY(effect)

Concrete model:
authorization denied in Z1,
but an already-issued capability or external queue permits effect in Z3/Z4.

Therefore:
DECISION_DENIAL != EFFECT_NONOCCURRENCE.

This directly preserves the core Nexo distinction:
Z1 authorizes/adjudicates; Z3 executes/observes; Z4 determines external reality.

## 19. Countermodel CM8 expanded — Compaction

Before compaction:
history distinguishes:
authorized(E7) -> revoked(E8) -> attempted(E8).

After compaction:
only current state remains.

A historical claim about whether the E7 authorization existed remains potentially answerable only if surviving evidence preserves the necessary distinctions.

Therefore:
COMPACTION_IS_A_SEMANTIC_TRANSFORMATION, not merely storage cleanup.

## 20. Countermodel CM9 expanded — Authority amplification

Abstraction removes an uncertainty about resource identity.

The refined model becomes precise enough to prove which resource is involved.

That may justify:
UNKNOWN -> TRUE

for an information claim.

It must not justify:
UNAUTHORIZED -> AUTHORIZED

unless an independent authority fact changed or was previously represented but hidden by an authority-preserving abstraction.

## 21. Candidate invariants AD7-01..AD7-20

AD7-01 HISTORY_IS_A_TRANSITION_SEMANTICS_NOT_FINAL_STATE_ONLY
AD7-02 EXTERNAL_EFFECT_HISTORY_IS_FIRST_CLASS_FOR_EFFECT_CLAIMS
AD7-03 EVENT_IDENTITY_IS_CLAIM_SCOPED
AD7-04 STATE_EQUALITY_DOES_NOT_IMPLY_TRACE_EQUALITY
AD7-05 DEPENDENCY_CLOSURE_IS_CLAIM_SCOPED
AD7-06 DEPENDENCY_CLOSURE_SHOULD_BE_EXTENSIVE
AD7-07 DEPENDENCY_CLOSURE_SHOULD_BE_MONOTONE
AD7-08 DEPENDENCY_CLOSURE_SHOULD_BE_IDEMPOTENT
AD7-09 TEMPORAL_DEPENDENCIES_REQUIRE_TIME_SENSITIVE_SEMANTICS
AD7-10 CAUSAL_RELATION_IS_NOT_COMMON_MODE_RELATION
AD7-11 INDEPENDENCE_REQUIRES_THREAT_MODEL
AD7-12 INDEPENDENCE_IS_BOUNDARY_AND_TIME_SCOPED
AD7-13 INFORMATION_AND_AUTHORITY_ARE_SEPARATE_PREORDERS
AD7-14 MUTUAL_INFORMATION_REFINEMENT_DOES_NOT_IMPLY_AUTHORITY_EQUIVALENCE
AD7-15 CLAIM_STATUS_IS_NOT_ASSUMED_TO_BE_A_LATTICE
AD7-16 STATUS_MONOTONICITY_IS_NOT_ASSUMED
AD7-17 REPRESENTATION_RELATION_PRECEDES_GALOIS_CONNECTION
AD7-18 CONCRETIZATION_MUST_BE_CLAIM_SCOPED
AD7-19 LOCAL_COMPATIBILITY_DOES_NOT_IMPLY_GLOBAL_REALIZABILITY
AD7-20 DECISION_DENIAL_DOES_NOT_PROVE_EFFECT_NONOCCURRENCE

## 22. Updated frontier

AB6-G1 advanced: transition/history semantics candidate.
AB6-G2 advanced: dependency closure laws identified.
AB6-G3 advanced: threat-model parameterization.
AB6-G4 advanced: information/authority preorders separated.
AB6-G5 advanced: status semantics separated from order assumptions.
AB6-G6 advanced: representation-first concretization.
AB6-G7 advanced: finite countermodel schema.
AB6-G8 remains intentionally deferred until semantic contracts stabilize.

New frontier:
AB7-G1 formalize admissible history and transition labels.
AB7-G2 formalize temporal hyperedge closure.
AB7-G3 formalize threat-model semantics and failure modes.
AB7-G4 establish preorder laws and quotient equivalence.
AB7-G5 formalize status transition relation.
AB7-G6 establish exact gamma/representation semantics.
AB7-G7 instantiate finite countermodels and attempt falsification.
AB7-G8 decide the minimal abstract state required for the first TLA+ model.

## Verification boundary

No implementation. No TLA+ execution. No theorem claimed proven.
