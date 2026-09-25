# NEXO — JOINT REALIZABILITY, COMMON-MODE CLOSURE AND DEPENDENCY-AWARE PRODUCT RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No V21. No TLA+ execution.

## 1. External cross-check

Abstract interpretation literature supports Cartesian products and reduced products; reduced products can exchange information between component abstractions and derive facts unavailable to independent analyses. This supports the direction of a dependency-aware product, but does not itself define Nexo's authority/effect/history semantics. citeturn0search35turn0search1

Relational abstractions are a recognized way to preserve relationships between entities rather than merely individual properties. citeturn0search36

## 2. AB4-G1 — Joint realizability

Candidate definition:

JR_P(W) iff there exists at least one concrete context c satisfying claim scope P such that every witness component in W is jointly represented by c and all required cross-component relations hold.

This is deliberately existential.

For universal claims, existence of one compatible concrete history is NOT sufficient to prove the universal claim.

Therefore:

JOINT_REALIZABILITY != CLAIM_TRUTH.

It is a prerequisite for combining witnesses, not a proof of the resulting claim.

## 3. Witness compatibility relation

For witnesses Wi and Wj:

Compat_P(Wi,Wj)

is necessary but pairwise compatibility is not sufficient for an arbitrary witness set.

Require:

JointCompat_P(W1,...,Wn)

which means there exists a common concrete realization satisfying all pairwise and higher-order constraints.

Candidate invariant:
PAIRWISE_COMPATIBILITY_DOES_NOT_IMPLY_JOINT_COMPATIBILITY.

## 4. Synthetic-history attack

Example:

W1: operation O occurred under authority epoch E7.
W2: resource incarnation is R9.
W3: provider execution identity is P12.

Suppose:
- W1 is individually valid;
- W2 is individually valid;
- W3 is individually valid;
- W1/W2 are pairwise compatible;
- W2/W3 are pairwise compatible;
- W1/W3 are pairwise compatible.

There may still be no concrete history satisfying all three simultaneously because a hidden transition relation can prohibit E7 + R9 + P12.

Therefore a complete witness set needs higher-order constraints, not just pairwise checks.

## 5. Common-mode closure

Candidate:

CMC(S,B) = transitive closure of all dependencies that can place elements of S under a common failure, authority, recovery, provider, control, or evidence root within boundary B.

The exact dependency classes are claim-specific.

Examples:
- common issuer;
- common key/revocation root;
- common scheduler;
- common provider control plane;
- common hypervisor;
- common recovery mechanism;
- common database;
- common observability path.

This does NOT mean all shared infrastructure automatically destroys independence. The independence claim must define which common modes are prohibited.

## 6. Independence claim

Candidate:

Independent_P(S,B) iff CMC(S,B) contains no prohibited common-mode dependency for claim P.

Thus:

different process != independent
different host != independent
different provider != independent
different region != independent

unless the claim's threat model defines those distinctions as sufficient.

This avoids turning an engineering topology into a universal independence theorem.

## 7. Common-mode closure is directional

A dependency may matter for one claim and be irrelevant to another.

Example:
- shared monitoring can invalidate an independence claim;
- the same shared monitoring may be irrelevant to an accounting-total claim.

Therefore:

CMC_P(S,B)

must be claim-scoped.

## 8. Common-mode closure and authority

A common authority root can create correlation even if execution paths differ.

Candidate dependency classes:

AUTHORITY_COMMON_MODE
CONTROL_COMMON_MODE
RECOVERY_COMMON_MODE
PROVIDER_COMMON_MODE
RESOURCE_COMMON_MODE
OBSERVATION_COMMON_MODE
EVIDENCE_COMMON_MODE

This extends the earlier separation:
INDEPENDENCE != PROCESS_SEPARATION.

## 9. AB4-G2 — Dependency-Aware Claim Product

Candidate structure:

DACP_P = Product(
  AuthorityDomain,
  HistoryDomain,
  EffectDomain,
  RetentionDomain,
  DependencyDomain,
  BoundaryDomain
)

plus cross-domain relations:

REQUIRES
INVALIDATES
SUPPORTS
COMMON_MODE
CAUSALLY_PRECEDES
CURRENT_AT
BOUNDED_BY

The cross-domain relations are semantically necessary because independent component summaries can jointly create impossible combinations.

## 10. DACP is not a normal Cartesian product

A Cartesian product can combine component abstract states, but the concrete meaning is an intersection of component concretizations. Reduced products improve precision through information exchange. citeturn0search35

For Nexo, an ordinary product is insufficient when the required property depends on relations that are not represented in any component.

Therefore DACP needs explicit relational/hyperedge semantics rather than only tuple components.

## 11. Reduction operator candidate

Candidate:

ρ_P : DACP_P -> DACP_P

with intended properties:

- reductive: ρ_P(x) is no less precise than x;
- meaning-preserving: concretization does not gain impossible concrete states;
- idempotent if full reduction is achieved;
- monotone if required by the chosen lattice.

Iterated reduction is a known technique in abstract interpretation, but Nexo must not assume these algebraic properties until its concrete/abstract domains are formally defined. citeturn0search8

## 12. Critical distinction: reduction vs claim strengthening

A reduction can improve precision without granting authority.

Therefore:

ρ_P(x) may transform
UNKNOWN -> PROVEN_TRUE

for a knowledge claim, but cannot transform:
UNAUTHORIZED -> AUTHORIZED

unless the authority semantics independently justify the new authority.

Candidate invariant:
REDUCTION_DOES_NOT_GRANT_AUTHORITY.

## 13. AB4-G5 — Claim-result lattice candidate

Do not collapse epistemic states into Boolean truth.

Candidate preliminary result set:

PROVEN_TRUE
PROVEN_FALSE
UNKNOWN
ABSTRACT_ONLY_TRUE
ABSTRACT_ONLY_FALSE
WITNESS_PENDING
JOINT_REALIZABILITY_PENDING
CONCRETIZATION_PENDING
HISTORY_INCOMPLETE
DEPENDENCY_UNKNOWN
SCOPE_EXCEEDED
AUTHORITY_UNRESOLVED
BOUNDARY_UNRESOLVED

These are candidate semantic outcomes, not yet a proven lattice.

Important:
UNKNOWN is not necessarily below FALSE or TRUE in an ordinary truth order.

It may require a separate epistemic ordering.

## 14. Two orders are likely required

Candidate distinction:

Truth order:
FALSE < UNKNOWN < TRUE

is probably insufficient because UNKNOWN is not semantically between false and true.

Epistemic order may instead model information growth:

LESS_INFORMATION <= MORE_INFORMATION

where UNKNOWN can refine into TRUE or FALSE.

Therefore Nexo likely needs at least:
- semantic truth/claim status;
- epistemic information precision.

Authority requires a third distinct order.

This gives:

TRUTH_ORDER != INFORMATION_ORDER != AUTHORITY_ORDER.

This is a major structural finding.

## 15. New adversarial attack — information monotonicity trap

Suppose a summary initially proves:
“No conflicting effect observed.”

Later, additional evidence reveals a hidden effect.

The information refinement can move the claim from:
PROVEN_TRUE -> PROVEN_FALSE

if the original claim's assumptions were insufficient.

Therefore a claim is only monotone under information refinement when its proof semantics guarantee monotonicity.

This must be specified per claim type.

## 16. AB4-G6 — Composed abstraction equivalence

Two abstractions A and B may be extensionally equivalent for one claim P but not another claim Q.

Candidate:

Eq_P(A,B)

iff they preserve exactly the distinctions required by P within the same scope/boundary semantics.

Therefore:

Eq_P(A,B) does not imply Eq_Q(A,B).

This continues the established rule that equivalence is claim-scoped.

## 17. New attack — hidden correlation

Two summaries can each expose the same individual facts as the concrete system while omitting the fact that the facts share one causal dependency.

Thus:

NODE_FACT_PRESERVATION != DEPENDENCY_PRESERVATION.

This is the strongest current reason to keep hyperedges first-class.

## 18. New attack — boundary leakage

Suppose abstraction A proves independence only inside Z3.

If the real common-mode dependency exists in Z4, A cannot prove world-level independence.

Therefore:

MODEL_BOUNDARY != WORLD_BOUNDARY.

A claim may be valid:
- internally;
- at an interface;
- at an external effect boundary;
- in the world.

The target boundary must be explicit in every claim contract.

## 19. Candidate invariants AD5-01..AD5-20

AD5-01 JOINT_REALIZABILITY_IS_EXISTENTIAL
AD5-02 JOINT_REALIZABILITY_IS_NOT_CLAIM_TRUTH
AD5-03 PAIRWISE_COMPATIBILITY_DOES_NOT_IMPLY_JOINT_COMPATIBILITY
AD5-04 WITNESS_COMBINATION_REQUIRES_COMMON_REALIZATION
AD5-05 COMMON_MODE_CLOSURE_IS_CLAIM_SCOPED
AD5-06 COMMON_MODE_IS_DEPENDENCY_NOT_TOPOLOGY_ONLY
AD5-07 INDEPENDENCE_REQUIRES_EXPLICIT_THREAT_MODEL
AD5-08 PROCESS_SEPARATION_DOES_NOT_PROVE_INDEPENDENCE
AD5-09 AUTHORITY_COMMON_MODE_IS_A_DEPENDENCY_CLASS
AD5-10 OBSERVATION_COMMON_MODE_IS_A_DEPENDENCY_CLASS
AD5-11 DACP_REQUIRES_CROSS_DOMAIN_RELATIONS
AD5-12 DACP_IS_NOT_MERELY_CARTESIAN_PRODUCT
AD5-13 REDUCTION_MUST_BE_MEANING_PRESERVING
AD5-14 REDUCTION_MUST_NOT_GRANT_AUTHORITY
AD5-15 CLAIM_RESULT_IS_NOT_A_SIMPLE_BOOLEAN
AD5-16 EPISTEMIC_ORDER_IS_DISTINCT_FROM_TRUTH_ORDER
AD5-17 AUTHORITY_ORDER_IS_DISTINCT_FROM_INFORMATION_ORDER
AD5-18 INFORMATION_REFINEMENT_MAY_REVEAL_COUNTEREXAMPLES
AD5-19 ABSTRACTION_EQUIVALENCE_IS_CLAIM_SCOPED
AD5-20 DEPENDENCY_PRESERVATION_IS_SEPARATE_FROM_NODE_PRESERVATION

## 20. Updated frontier

AB4-G1 advanced: joint realizability defined as existential common concrete realization.
AB4-G2 advanced: DACP candidate structure defined.
AB4-G3 advanced: claim-scoped common-mode closure defined.
AB4-G4 remains open: exact authority algebra.
AB4-G5 advanced: distinct truth/information/authority orders identified; exact lattices remain open.
AB4-G6 advanced: claim-scoped equivalence identified; formal relation remains open.

New:
AB5-G1 formalize concrete history space and joint-realization relation.
AB5-G2 formalize common-mode dependency graph/hypergraph and closure.
AB5-G3 formalize threat-model parameterization of independence.
AB5-G4 formalize three-order interaction.
AB5-G5 determine whether a unified multi-sorted order structure is preferable.
AB5-G6 prove soundness of DACP reduction.
AB5-G7 formalize boundary-indexed claim semantics.
AB5-G8 construct minimal adversarial countermodels for each claim polarity.

## Verification boundary

Research only. No implementation. No formal model checking. No theorem claimed proven.
