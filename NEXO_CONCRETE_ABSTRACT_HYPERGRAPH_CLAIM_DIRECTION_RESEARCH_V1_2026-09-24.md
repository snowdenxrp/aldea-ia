# NEXO — Concrete/Abstract SafetyClosureHypergraph and Claim-Direction Research V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, no V21, no V20 patching, no SANY/TLC/TLAPS execution.

## Objective

Advance AB-G1, AB-G2 and AB-G3 without collapsing distinct meanings of soundness.

## External cross-check

Abstract interpretation separates concrete and abstract domains and defines soundness relative to their semantic relationship; sound abstraction is typically conservative and may be incomplete. Refinement mappings relate behaviors at different semantic levels. Hyperproperties require relational reasoning over sets of traces. citeturn0search27turn0search2turn0search26turn0search24

These sources are methodological evidence only and do not prove Nexo correctness.

## 1. Concrete domain

Candidate:

Hc = (Vc, Ec, tv, te, att, rel, hist, bnd)

where:
- Vc = typed concrete vertices;
- Ec = typed hyperedges;
- tv/te = vertex and hyperedge typing;
- att = semantic attributes;
- rel = temporal/causal/order relations;
- hist = retained historical distinctions;
- bnd = authority, enforcement and environment boundaries.

A concrete execution context may additionally be:

Cc = (Hc, Tc, Ic, Wc)

with traces/executions Tc, invalidation/currentness Ic and explicit world/environment assumptions Wc.

The graph is not the complete external world.

## 2. Abstract domain

Candidate:

Ha = (Va, Ea, tva, tea, atta, rela, lossa, bnda)

Abstract vertices/hyperedges may summarize multiple concrete elements. loss records distinctions not represented.

Do not assume a total abstraction function prematurely.

Candidate concretization:

gamma : Ha -> P(Hc)

where gamma(a) is the set of concrete contexts represented by a.

A representation relation:

c |= a

may be the primary primitive; alpha/gamma can be introduced later if the domain supports them.

## 3. Claim semantics

A claim is candidate:

P = (scope, polarity, predicate, boundary, required_distinctions, history_requirement, currentness_requirement, relational_arity)

Ordinary state/trace claims evaluate one semantic object. Hyperproperties evaluate sets/tuples of traces. This distinction is established in the hyperproperty literature. citeturn0search24turn0search26

Candidate polarity:

UNIVERSAL_SAFETY
ABSENCE
EXISTENCE
HISTORICAL_ATTRIBUTION
CURRENT_AUTHORITY
CONTAINMENT
EQUIVALENCE
INDEPENDENCE
ORDER
COUNT_QUORUM
HYPERPROPERTY
COMBINED
UNKNOWN

## 4. ClaimDirectionContract

Candidate:

CD(P) =
(type, scope, boundary, direction, required_vertices, required_hyperedges,
 required_relations, required_history, required_currentness,
 allowed_unknown, witness_rule, counterexample_rule)

This specifies what must be preserved before an abstract result can support a concrete claim.

## 5. Soundness is multidimensional

The word SOUND alone is underspecified.

Distinguish:

PROOF_SOUNDNESS
COUNTEREXAMPLE_SOUNDNESS
WITNESS_SOUNDNESS
TRACE_COVERAGE
CLAIM_COMPLETENESS

A system can be sound but incomplete for a claim.

## 6. Proof-soundness

For a universal safety claim, an accepted abstract result may support a concrete conclusion only when the abstraction/refinement relation guarantees that the relevant concrete contexts are covered and the safety predicate, transitions/traces, initial conditions and boundaries are preserved as required.

Therefore:

Safe(Abstract) => Safe(Concrete)

is NOT a universal rule. It requires the appropriate sound overapproximation/refinement semantics.

The earlier candidate:

alpha(Reach(C)) subseteq Reach(A)

remains only a coverage condition, not a sufficient Nexo theorem.

## 7. Counterexample-soundness

An abstract violation is not automatically a concrete violation.

Candidate requirement:

an accepted abstract counterexample must have a concrete witness in its concretization satisfying the concrete violation predicate.

Thus:

ABSTRACT_COUNTEREXAMPLE != CONCRETE_COUNTEREXAMPLE

without concretization.

Possible result: CONCRETIZATION_PENDING or UNKNOWN.

## 8. Witness-soundness

For existential/historical claims, an abstract witness must concretize to a concrete witness satisfying provenance, authority, temporal, resource-incarnation and boundary requirements.

Thus:

ABSTRACT_EXISTENCE != CONCRETE_EXISTENCE

without witness correspondence.

## 9. Claim-completeness

Completeness means the abstraction retains enough information for every concrete result relevant to P to have an abstract classification under the contract.

Soundness and completeness are independent.

## 10. UNKNOWN

If a required distinction is absent, the result may remain UNKNOWN.

Candidate rule:

MissingRequiredDistinction(P,A)
=> conclusion(P,A) cannot exceed UNKNOWN

unless an independent proof establishes irrelevance.

## 11. Preserve_P

Candidate:

Preserve_P(Hc,Ha) requires, as applicable:

1. required vertices represented;
2. required hyperedges represented or soundly summarized;
3. temporal/causal relations preserved;
4. authority/currentness distinctions preserved;
5. resource incarnations preserved where relevant;
6. dependency/common-mode relations preserved where relevant;
7. omitted information represented in Loss/Unknown when claim-relevant;
8. boundary assumptions explicit;
9. claim scope not widened;
10. no stronger authority inferred than concrete support permits.

This is a candidate definition, not a theorem.

## 12. Hyperedge preservation

Pairwise vertex/edge preservation is insufficient when P depends on a joint relation.

Required hyperedges must be:
- preserved directly;
- soundly abstracted;
- or proven irrelevant under the explicit boundary.

NODE_PRESERVATION != HYPEREDGE_PRESERVATION.

PAIRWISE_VALIDITY != JOINT_RELATIONAL_VALIDITY.

## 13. Authority and currentness

Abstraction must not amplify authority.

Historical:

was_authorized = TRUE

does not imply:

is_currently_authorized = TRUE

if revocation, authority epoch or successor context was lost.

Candidate rule:

ABSTRACT_AUTHORITY_SCOPE <= CONCRETE_AUTHORITY_SCOPE

under a future formal authority ordering.

## 14. Historical existence and absence

A retained witness can support historical existence if sufficient for P.

Absence of a retained witness does not prove historical absence unless the retention/observation boundary is absence-capable for that event class.

NO_WITNESS != NO_EVENT.

## 15. Hyperproperties

Independence, common-mode exclusion and noninterference-like claims may require multiple executions/traces.

Candidate:

RelationalArity(P) = k

and for k > 1 the abstraction must preserve the required cross-execution relation. Hyperproperties are specifically defined as sets of properties/traces and cannot always be reduced to a single-trace property. citeturn0search24

## 16. Composition

A1 sound for P plus A2 sound for P does NOT automatically imply A2(A1(H)) sound for P.

Composition requires compatible:
- domains;
- loss sets;
- boundaries;
- currentness;
- relational semantics;
- refinement relations.

PAIRWISE_ABSTRACTION_SOUNDNESS != COMPOSED_SOUNDNESS.

## 17. Adversarial cases

- Hidden revocation: historical authorization survives, current authority does not.
- Hidden common-mode provider: two witnesses appear independent but share a dependency.
- Hidden enforcement bypass: DENY is modeled but effect path remains reachable.
- Hidden resource incarnation: same provider ID represents different concrete resources.
- Abstract existence: summary says an effect occurred but lacks sufficient identity/provenance.
- Abstract counterexample: abstract combination is impossible concretely.

## 18. Candidate invariants

AD2-01 SOUNDNESS_IS_CLAIM_SCOPED
AD2-02 APPROXIMATION_DIRECTION_IS_CLAIM_DEPENDENT
AD2-03 PROOF_COUNTEREXAMPLE_WITNESS_SOUNDNESS_ARE_DISTINCT
AD2-04 CLAIM_COMPLETENESS_IS_DISTINCT_FROM_SOUNDNESS
AD2-05 UNDERAPPROXIMATION_CANNOT_BY_ITSELF_PROVE_UNIVERSAL_SAFETY
AD2-06 OVERAPPROXIMATION_CANNOT_BY_ITSELF_PROVE_EXISTENCE
AD2-07 ABSTRACT_COUNTEREXAMPLE_REQUIRES_CONCRETE_CORRESPONDENCE
AD2-08 ABSTRACT_WITNESS_REQUIRES_CONCRETE_WITNESS_CORRESPONDENCE
AD2-09 UNKNOWN_IS_A_VALID_SOUND_RESULT
AD2-10 LOSS_IS_CLAIM_AND_DIRECTION_TYPED
AD2-11 REQUIRED_HYPEREDGES_MUST_BE_PRESERVED_OR_JUSTIFIABLY_OMITTED
AD2-12 NODE_PRESERVATION_DOES_NOT_IMPLY_HYPEREDGE_PRESERVATION
AD2-13 AUTHORITY_MUST_NOT_BE_AMPLIFIED_BY_ABSTRACTION
AD2-14 CURRENT_AUTHORITY_REQUIRES_CURRENTNESS_PRESERVATION
AD2-15 HISTORICAL_ABSENCE_REQUIRES_ABSENCE_CAPABLE_CLOSURE
AD2-16 RELATIONAL_CLAIMS_REQUIRE_RELATIONAL_SEMANTICS
AD2-17 MODEL_BOUNDARY_MUST_NOT_BE_CONFUSED_WITH_WORLD_BOUNDARY
AD2-18 COMPOSED_ABSTRACTIONS_REQUIRE_COMPOSITION_SOUNDNESS
AD2-19 CLAIM_SCOPE_MUST_NOT_EXCEED_VERIFIED_ABSTRACTION_SCOPE
AD2-20 SOUNDNESS_MUST_INCLUDE_REQUIRED_ENVIRONMENT_ASSUMPTIONS

## 19. Frontier after this round

AB-G1 advanced, not closed: domain candidates exist; algebraic structure and admissible abstraction class remain open.

AB-G2 advanced, not closed: ClaimDirectionContract structure exists; complete formal semantics/order remain open.

AB-G3 advanced, not closed: proof-, counterexample-, witness-soundness and completeness are separated; formal necessary/sufficient theorems remain open.

New focused gaps:
AB2-G1 choose representation relation vs alpha/gamma as primary primitive.
AB2-G2 define authority-scope ordering.
AB2-G3 formalize Loss/Unknown semantics.
AB2-G4 formalize k-trace relational abstraction.
AB2-G5 composition theorem for sequential abstractions.
AB2-G6 exact counterexample concretization conditions.
AB2-G7 exact negative-evidence capability for historical absence.
AB2-G8 state vs auxiliary/history variables for these semantics.

## Verification boundary

Research only. No theorem proven. No TLA+ execution. No SANY/TLC/TLAPS. No implementation change. No runtime/deployment verification.
