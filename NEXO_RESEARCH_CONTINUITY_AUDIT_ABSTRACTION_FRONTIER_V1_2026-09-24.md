# NEXO — Research Continuity and Abstraction Frontier Audit V1 — 2026-09-24

Status: AUDIT / RESEARCH ONLY.
No implementation. No V21. No V20 patching. No migration of historical code. No SANY/TLC/TLAPS execution. No runtime/deployment verification.

## 1. Audit purpose

This audit was performed after the abstraction-soundness round to ensure that accumulated research from the closure/hypergraph frontier was not silently dropped, overwritten, reinterpreted as new, or promoted to a stronger verification category.

Reviewed commit chain:
- 25fa8c306d53c8c3185c0d2ab5c2a30a8195fb4c — typed closure composition/order/refinement
- 2a60389883a5d45aeead6eda27b7af9636f2b031 — retention fixed points/non-convergence
- 2e07dea6ebc782d2d81aeb1fd6ec55a9cee25df4 — joint claim retention/fixed-point reclamation
- 1d9e8ef2a68e454c839462b25c4f0224897afac7 — property-specific retention/minimality
- 980b431fdf85c6755080640af4e4f72ff060d2db — claim-sufficient retention/minimization
- a853c509cef8535271c56a6a2f270814534491d3 — post-compaction reconstruction/missing history
- 09d2ea8c039a8e923fbece55e72ad6ff362cb0cb — typed closure hypergraph
- 96ae3af5216113f5bf3839796b1d0aa85650259e — hypergraph projection soundness/refinement
- d875b4346c51f47b0f1925fe40c7f5bd30e2a4d5 — claim-preserving hypergraph abstraction
- 61e052b3119c2ba43a271d024249bfe53ff41391 — abstraction soundness/claim direction

The recent GitHub commit ordering confirms 61e052b is currently the newest commit in this research sequence.

## 2. Continuity result

No previously identified principle was intentionally discarded.

Still active:
- RC != ADC != EC != FC
- closure composition is typed and claim-specific
- pairwise compatibility does not imply joint compatibility
- hyperedge semantics may be required
- fixed-point convergence is semantic, not merely syntactic
- open-world discovery can prevent global convergence
- bounded convergence is not global convergence
- retention is claim-relative
- minimality follows sound closure
- multiple incomparable minimal retention bases may exist
- reconstruction is not restoration of deleted history
- surviving evidence is not automatically sufficient evidence
- model projection is not world closure
- node preservation is not claim preservation
- hyperedge preservation is distinct from pairwise edge preservation
- currentness is distinct from historical validity
- authority cannot be amplified by abstraction
- UNKNOWN must not silently become TRUE or FALSE
- certificates cannot self-justify their own required support
- implementation refinement requires an explicit mapping
- hyperproperties need explicit relational treatment.

## 3. Important mathematical qualification discovered during audit

The latest research correctly discusses conservative over-approximation for a class of safety arguments, but this must not become a universal rule.

The shorthand
Safe(Abstract) => Safe(Concrete)
requires a sound over-approximation/refinement relation and a compatible safety property/semantics. Mere reachable-state inclusion is not by itself a complete refinement proof.

The earlier candidate
alpha(Reach(C)) subset Reach(A)
is therefore retained only as a candidate coverage condition, not as a sufficient Nexo theorem.

Additional obligations can include:
- initial-state correspondence;
- transition/trace correspondence;
- state abstraction/concretization relation;
- preservation of the bad-state predicate;
- environment/boundary compatibility;
- fairness/liveness obligations when relevant;
- authority/currentness semantics;
- hyperproperty semantics when the claim is relational across executions.

## 4. Adversarial correction: safety is not the only claim polarity

OVERAPPROXIMATION + PROVEN_ABSTRACT_SAFETY may support a concrete safety conclusion only under the established soundness conditions.

OVERAPPROXIMATION + ABSTRACT_EXISTENCE does not establish historical existence.
UNDERAPPROXIMATION + ABSTRACT_SAFETY does not establish universal concrete safety.
ABSTRACT_COUNTEREXAMPLE does not automatically equal a concrete counterexample.

## 5. Adversarial correction: soundness is multidimensional

The generic word sound is too ambiguous for future formalization.
Candidate dimensions remain:
- proof-sound;
- counterexample-sound;
- witness/existence-sound;
- trace-covering;
- claim-complete.

These must not be collapsed into one Boolean assurance field.

## 6. Hypergraph continuity

The hypergraph work remains structurally necessary.

PAIRWISE_VALIDITY != JOINT_RELATIONAL_VALIDITY.

Future projection/refinement must account for typed vertices, typed hyperedges, temporal/causal relations, authority/order context, resource incarnations, enforcement boundaries, common-mode dependencies, retention relations, trust/support roots and environment boundaries.

Removing a node or pairwise edge can still destroy a required multiway relation.

## 7. Retention continuity

The retention line remains connected to abstraction rather than replaced by it.

SOUND_CLOSURE
-> REQUIRED_DISTINCTIONS
-> CLAIM-DIRECTION-CORRECT ABSTRACTION
-> REVALIDATION
-> MINIMIZATION/RECLAMATION

Not:
COMPACTION
-> ASSUME_EQUIVALENCE.

Still mandatory:
- claim no longer active != event never occurred;
- compensated != historically erased;
- compacted != irrelevant;
- no current claim != no future relevant claim;
- reconstructed != restored original history.

## 8. Refinement continuity

The intended mapping remains:
ImplementationState × AuxiliaryHistory -> AbstractSafetyClosureContext

rather than mapping implementation state to an arbitrary convenient summary.

Lamport's current published material confirms that auxiliary/history variables can be needed to construct refinement mappings and that refinement is an explicit semantic relationship rather than an automatic consequence of similar data structures. This supports retaining auxiliary/history variables as a formal possibility, not as a claim that Nexo already implements them correctly.

External cross-checks:
- Lamport, Auxiliary Variables in TLA+: https://lamport.azurewebsites.net/tla/auxiliary/auxiliary.html
- Lamport, Auxiliary Variables paper: https://lamport.azurewebsites.net/pubs/auxiliary.pdf
- Cousot, Software Verification by Abstract Interpretation: https://www.di.ens.fr/~cousot/COUSOTtalks/SUNYSB-2008-01-18.shtml

These sources are methodological evidence only and do not prove Nexo correctness.

## 9. No accidental promotion of verification status

Current frontier categories remain DESIGN / RESEARCH FINDING / HYPOTHESIS / CANDIDATE INVARIANT as applicable.

Not established:
- FORMALIZED NEXO MODEL
- MODEL-CHECKED
- PROVEN
- IMPLEMENTED
- TESTED
- RUNTIME VERIFIED
- DEPLOYMENT VERIFIED.

SANY, TLC and TLAPS have not been run for this frontier.

## 10. Current open frontier

AB-G1 — Define concrete and abstract domains for SafetyClosureHypergraph.
AB-G2 — Define ClaimDirectionContract mathematically.
AB-G3 — Define proof-soundness, counterexample-soundness, witness-soundness and claim-completeness.
AB-G4 — Define abstraction/concretization or simulation/refinement relations.
AB-G5 — Define exact Preserve_P(H,H#).
AB-G6 — Define hyperedge preservation.
AB-G7 — Define boundary/environment assumptions.
AB-G8 — Prove authority non-amplification.
AB-G9 — Define historical existence/absence semantics.
AB-G10 — Define currentness preservation.
AB-G11 — Define hyperproperty/multi-execution semantics.
AB-G12 — Establish composition rules for multiple abstractions.
AB-G13 — Establish CEGAR/refinement obligations.
AB-G14 — Define evidence needed to convert UNKNOWN into a claim.
AB-G15 — Determine what belongs in TLA+ state variables versus auxiliary/history variables.
AB-G16 — Only then build the first bounded abstract TLA+ model.

## 11. Explicit non-loss rule

This audit does not replace any prior research document.
It does not modify V1–V20.
It does not close any gap.
It does not establish a theorem.
It exists to make continuity and strengthened qualifications explicit before the next formalization frontier.