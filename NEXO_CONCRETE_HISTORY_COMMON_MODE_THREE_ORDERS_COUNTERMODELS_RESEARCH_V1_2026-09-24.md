# NEXO — CONCRETE HISTORY, COMMON-MODE HYPERGRAPH, THREE ORDERS AND MINIMAL COUNTERMODELS RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No theorem claimed proven.

## 1. External cross-check

Abstract interpretation provides concrete/abstract semantic correspondence through abstraction/concretization and partial-order structures; reduced products exchange observations between domains to refine combined abstractions. This supports the direction of DACP, but Nexo's claim-scoped semantics remain to be defined. citeturn0search3turn0search4turn0search6

Lamport's refinement work confirms that refinement mappings can require auxiliary/history variables, while those variables need not alter the implementation behavior. This supports separating claim-relevant semantics from proof-supporting history, but does not mean arbitrary history is semantically discardable. citeturn0search24turn0search25

## 2. AB5-G1 — Concrete history space

Candidate concrete history:

H = (S0, τ, Obs, Eff, Auth, Dep, Bnd)

where:
- S0 = initial concrete state;
- τ = admissible transition/history relation;
- Obs = observations/evidence;
- Eff = external effects;
- Auth = authority state over time;
- Dep = dependency/common-mode relations;
- Bnd = environment/model boundary.

A claim should be evaluated over histories compatible with its scope and assumptions, not merely over one current state.

Candidate history semantics:
Hist(P) = { h | h is admissible under P's boundary and environment assumptions }.

This is a candidate semantic construction, not yet a theorem.

## 3. History identity must be explicit

Two histories can have the same final state but differ in:
- revocation;
- external effect;
- resource incarnation;
- authority epoch;
- ordering;
- causal path.

Therefore:
FINAL_STATE_EQUIVALENCE != HISTORICAL_EQUIVALENCE.

This preserves the earlier reconstruction/retention work.

## 4. AB5-G2 — Common-mode dependency hypergraph

Candidate:

G_dep = (V, E_dep, type, scope, interval, boundary)

A dependency edge may connect more than two vertices.

Examples:
- {worker1, worker2, scheduler} -- CONTROL_COMMON_MODE
- {providerA, providerB, rootKey} -- AUTHORITY_COMMON_MODE
- {effect1, effect2, auditStore} -- EVIDENCE_COMMON_MODE

Hyperedges are required when a common dependency only becomes visible at group level.

## 5. Common-mode closure

Candidate:

CMC_P(S,B,t) = all dependency vertices/hyperedges reachable from S through dependency types prohibited or relevant to claim P, within B and temporal interval t.

Important:
CMC is not universal reachability. It is parameterized by:
- claim P;
- dependency classes;
- temporal interval;
- boundary;
- threat model.

## 6. AB5-G3 — Threat-model parameterization

Independence is meaningless without specifying what counts as a common failure.

Candidate threat model:

TM = (
  prohibited_dependency_types,
  tolerated_dependency_types,
  failure_domain_scope,
  authority_scope,
  recovery_scope,
  evidence_scope,
  temporal_scope
)

Then:

Independent_P(S,B,TM) iff no prohibited dependency exists in CMC_P(S,B,TM).

This avoids treating physical/topological separation as a universal proof of independence.

## 7. Adversarial independence examples

A:
Two workers, same scheduler.
- independent processes: YES
- independent under scheduler-failure threat model: NO

B:
Two providers, same control root.
- independent providers: YES
- independent under common-control compromise model: NO

C:
Two effects, separate execution paths, shared recovery mechanism.
- execution separation: YES
- independent under recovery-failure model: NO

D:
Two witnesses, separate evidence stores, same observation source.
- evidence-store separation: YES
- observation independence: NO

The correct answer depends on TM, not on topology alone.

## 8. AB5-G4 — Three orders

Candidate structures:

I = information/precision preorder
T = claim/truth status structure
A = authority preorder

These must not be conflated.

Information refinement:
x <=I y means y retains at least the distinctions needed by x, under the relevant abstraction semantics.

Authority:
a <=A b means b's asserted authority contains a's authority, under identical identity/resource/currentness/boundary semantics.

Claim truth:
not necessarily a lattice until claim semantics are formalized.

## 9. Important correction: FALSE/UNKNOWN/TRUE is not automatically a lattice

The candidate result set:

FALSE, UNKNOWN, TRUE

is useful operationally but must not be assumed to have a valid mathematical ordering.

A claim can become:
TRUE -> UNKNOWN
when a previously hidden dependency invalidates a proof assumption.

Likewise:
TRUE -> FALSE
if a stronger, valid counterexample is discovered.

Therefore epistemic refinement does not guarantee monotone truth status.

## 10. Safer formulation

Use two relations rather than one:

KnowledgeRefines(k1,k2)

and

ClaimStatus(P,k)

Knowledge refinement describes information growth.

ClaimStatus describes the current justified assessment.

No monotonicity of ClaimStatus follows automatically from KnowledgeRefines.

This prevents a false theorem of the form:
more information => truth can only increase.

## 11. Authority relation candidate

Authority is better treated initially as a preorder rather than immediately asserting a partial order.

Reason:
distinct representations may be semantically equivalent for a claim while being syntactically different.

Define:
a ≼A b iff every authority consequence licensed by a is licensed by b under the same scope/currentness/boundary semantics.

Then quotienting by mutual entailment could produce a partial order if the equivalence relation and closure properties are established.

This is safer than assuming antisymmetry prematurely.

## 12. Authority and revocation

Candidate current authority:

CurrentAuth(h,t,r) =
AuthorityAt(h,t,r)
AND
¬RevokedBeforeOrAt(h,t,r)
AND
ValidDelegation(h,t,r)
AND
CurrentResourceIncarnation(h,t,r)
AND
BoundaryAllows(h,t,r)

All terms are intentionally schematic.

Historical authority:
WasAuthorized(h,t,r)

must remain distinct from CurrentAuth.

## 13. AB5-G6 — DACP reduction

Candidate reduction operator:

ρ_P(x)

must eliminate abstract combinations with no admissible concrete realization, while not eliminating any concrete state needed by the soundness contract.

Candidate soundness condition:

γ(ρ_P(x)) ⊇? γ(x)

Direction depends on whether γ denotes represented concrete states and whether reduction is precision-improving.

The exact relation MUST be fixed before formalization; no inequality is declared final here.

This is an explicit guard against importing a lattice direction incorrectly.

## 14. Minimal countermodel family

Before formal TLA+, create small adversarial concrete models.

CM1 — Hidden common scheduler
CM2 — Revoked authority hidden by abstraction
CM3 — Same resource identity, different incarnation
CM4 — Pairwise-compatible but jointly unrealizable witnesses
CM5 — Evidence stores independent, observation source shared
CM6 — Final states equal, histories differ
CM7 — Abstract DENY but external effect path still exists
CM8 — Compaction removes distinction later needed for historical claim
CM9 — Reduction improves knowledge but must not increase authority
CM10 — Boundary-local independence mistaken for world independence

Each countermodel should specify:
- concrete states;
- transitions;
- hidden distinction;
- abstraction;
- claim;
- expected justified result;
- expected unjustified result;
- boundary;
- dependency closure.

## 15. New principle — countermodels before theorem

For each proposed algebraic law:
1. write the candidate law;
2. construct minimal models attempting to falsify it;
3. only then formalize surviving law.

This is research methodology, not a proof technique by itself.

## 16. AB5-G7 — Boundary-indexed claims

Candidate claim identity:

P = (
  predicate,
  scope,
  boundary,
  temporal_scope,
  relational_arity,
  required_distinctions,
  threat_model,
  authority_requirements
)

Therefore:

Same predicate + different boundary != same claim.

Example:
“no external effect occurred”
inside Z3 is not equivalent to
“no effect occurred in Z4.”

## 17. AB5-G8 — Countermodel matrix

Candidate matrix dimensions:

Claim polarity:
- universal safety
- existence
- historical attribution
- current authority
- absence
- independence
- equivalence

Attack dimension:
- hidden history
- hidden dependency
- hidden authority epoch
- hidden resource incarnation
- hidden boundary
- hidden enforcement path
- witness inconsistency
- common mode
- compaction loss

The matrix should eventually ensure each claim class has at least one adversarial model for every relevant loss class.

## 18. New finding — proof obligations are claim-specific

There is no single generic “Nexo abstraction proof.”

Each claim needs its own proof contract:

PO(P) =
(
 representation,
 boundary,
 direction,
 required distinctions,
 history requirements,
 dependency requirements,
 authority requirements,
 witness requirements,
 counterexample requirements
)

This is consistent with the broader abstract-interpretation principle that correctness depends on the chosen correspondence between concrete and abstract semantics. citeturn0search8turn0search9

## 19. Candidate invariants AD6-01..AD6-20

AD6-01 FINAL_STATE_EQUIVALENCE_DOES_NOT_IMPLY_HISTORICAL_EQUIVALENCE
AD6-02 CONCRETE_HISTORY_MUST_MODEL_CLAIM_RELEVANT_TEMPORAL_DISTINCTIONS
AD6-03 COMMON_MODE_CLOSURE_IS_HYPERGRAPH_CLAIM_SCOPED
AD6-04 COMMON_MODE_REQUIRES_THREAT_MODEL
AD6-05 TOPOLOGICAL_SEPARATION_DOES_NOT_PROVE_INDEPENDENCE
AD6-06 INFORMATION_ORDER_IS_NOT_AUTHORITY_ORDER
AD6-07 CLAIM_STATUS_ORDER_MUST_NOT_BE_ASSUMED
AD6-08 KNOWLEDGE_REFINEMENT_DOES_NOT_IMPLY_TRUTH_MONOTONICITY
AD6-09 AUTHORITY_SHOULD_INITIALly_BE_TREATED_AS_PREORDER
AD6-10 HISTORICAL_AUTHORITY_IS_DISTINCT_FROM_CURRENT_AUTHORITY
AD6-11 REVOCATION_MUST_BE_CURRENTNESS_SENSITIVE
AD6-12 DACP_REDUCTION_REQUIRES_EXPLICIT_CONCRETIZATION_DIRECTION
AD6-13 COUNTERMODELS_PRECEDE_FORMAL_THEOREMS
AD6-14 BOUNDARY_IS_PART_OF_CLAIM_IDENTITY
AD6-15 SAME_PREDICATE_WITH_DIFFERENT_BOUNDARY_IS_NOT_SAME_CLAIM
AD6-16 PROOF_OBLIGATIONS_ARE_CLAIM_SPECIFIC
AD6-17 WITNESS_AND_COUNTEREXAMPLE_REQUIREMENTS_ARE_CLAIM SPECIFIC
AD6-18 HIDDEN_DEPENDENCY_IS_A_SEMANTIC_LOSS
AD6-19 CURRENT_AUTHORITY_REQUIRES_REVOCATION_CLOSURE
AD6-20 ABSTRACT_REFINEMENT_MUST_NOT_AMPLIFY_EXTERNAL_AUTHORITY

## 20. Updated frontier

AB5-G1 advanced: concrete history structure candidate.
AB5-G2 advanced: dependency hypergraph/common-mode closure candidate.
AB5-G3 advanced: threat-model parameterization.
AB5-G4 advanced: three distinct order structures identified.
AB5-G5 remains open: unified multi-sorted mathematical framework.
AB5-G6 advanced: DACP reduction obligations identified; exact concretization direction remains open.
AB5-G7 advanced: boundary-indexed claim identity.
AB5-G8 advanced: minimal countermodel matrix.

New frontier:
AB6-G1 formalize history transition semantics.
AB6-G2 formalize hypergraph dependency closure.
AB6-G3 formalize threat-model semantics.
AB6-G4 determine exact order/preorder structures.
AB6-G5 formalize claim-status semantics without false monotonicity.
AB6-G6 formalize concretization direction and reduction.
AB6-G7 instantiate countermodels as finite abstract systems.
AB6-G8 only after these, derive first TLA+ state variables.

## Verification boundary

No implementation. No TLA+ execution. No theorem claimed proven.
