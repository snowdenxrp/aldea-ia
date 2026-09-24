# NEXO — Security-Relevance Predicate and Closure-Boundary Self-Definition Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Attack the definition of which dependencies are security-relevant. Prevent the authority being evaluated from choosing a permissive dependency predicate that excludes inconvenient dependencies and then using the resulting closure as proof of independence.

## 2. Core distinction
DEP_C(x,y) is not a neutral fact. It is a claim-scoped semantic relation.
Therefore:
DEPENDENCY_DEFINITION != DEPENDENCY_FACT
SECURITY_RELEVANCE_PREDICATE != AUTHORITY_POLICY
CLAIM_SCOPE != DEPENDENCY_SCOPE

## 3. Predicate capture attack
Naive pattern:
Authority A defines Dep_C.
Evaluator computes closure using Dep_C.
Closure excludes a dependency that would undermine A.
Evaluator declares an independent root.
Authority A becomes current.

Result: the authority effectively defined the conditions of its own independence.

Candidate rule:
THE CLAIM-BEARING AUTHORITY MUST NOT BE THE SOLE SOURCE OF THE SECURITY-RELEVANCE PREDICATE USED TO JUSTIFY THAT AUTHORITY.

## 4. Three sources of dependency relevance
R0 Constitutional relevance: fixed by the trust foundation for the protected property.
R1 Claim-derived relevance: derived from the exact security property and effect scope.
R2 Environment-derived relevance: determined by an explicit bounded environment contract.

All three need traceability. R1/R2 cannot silently override R0 for protected invariants.

## 5. Negative-space attack
An authority may define dependency relevance positively:
include A, B, C.
The attacker uses D because D was never listed.
Therefore closure definitions must address the negative space:
what categories are explicitly excluded, why they are excluded, and what happens if an excluded category becomes security-relevant.

Candidate:
EXCLUSION_REQUIRES_JUSTIFICATION_AND_REVALIDATION_TRIGGER.

## 6. Security-relevance lattice
Instead of boolean relevant/not relevant:
Q0 UNKNOWN
Q1 OBSERVED_NONRELEVANT_FOR_CLAIM
Q2 RELEVANT_TO_ASSURANCE
Q3 RELEVANT_TO_AUTHORITY
Q4 RELEVANT_TO_EXTERNAL_ENFORCEMENT
Q5 CRITICAL_TO_CLAIM_SAFETY

Transitions to higher relevance invalidate any claim that assumed the lower classification unless revalidated.

## 7. Property-relative relevance
A dependency can be irrelevant to one property and critical to another.
Example:
KMS may be irrelevant to a local computation claim but critical to a claim about authority signature validity.
Therefore relevance must be represented as:
Relevant(dependency, claim, property, scope, context).
Never:
Relevant(dependency) = global boolean.

## 8. Counterfactual relevance test
Candidate method:
Ask whether changing, compromising, removing, delaying, or replacing dependency D can change the truth of property P under the claim context.
If yes, D is security-relevant for P unless a stronger protected boundary blocks the causal path.
This is a semantic test, not merely a topology test.

## 9. Causal relevance versus administrative dependency
Not every operational dependency is security-relevant.
Conversely, a component with no obvious control-plane edge may still be security-relevant if it can influence an effect, authority decision, evidence interpretation, or enforcement boundary.
Therefore dependency analysis must include causal/effect paths, not only software import graphs.

## 10. Authority-controlled relevance attack
An authority can attempt to classify its own enforcement mechanism as 'implementation detail' and exclude it.
Candidate invariant:
AN AUTHORITY-CONTROLLED COMPONENT CANNOT BE DECLARED OUTSIDE THE CLAIM BOUNDARY SOLELY BY THE AUTHORITY UNDER EVALUATION.

Exclusion must be justified by the trust foundation, an explicit environment contract, or a stronger independently anchored boundary.

## 11. Boundary selection attack
Moving the boundary can make dependencies disappear:
Boundary B1 includes provider P.
Boundary B2 starts after P.
Claim under B2 says P is external and trusted.
If B2 is chosen by the same authority being evaluated, the boundary is self-serving.

Candidate:
BOUNDARY_SELECTION_IS_SECURITY_RELEVANT_AND_MUST_BE_PROTECTED_FOR_STRONG_CLAIMS.

## 12. Environment contract as explicit assumption
An environment contract can legitimately state:
Provider P is outside the Nexo control boundary.
But then the claim must say:
we assume P satisfies contract X.
It cannot silently become:
P is trusted because the graph omitted P.

Assumption transitions:
ASSUMED → VERIFIED
ASSUMED → INVALIDATED
ASSUMED → UNKNOWN
Any loss of the assumption must trigger claim degradation or invalidation.

## 13. Adversarial completeness testing
A closure model should be attacked by candidate hidden dependencies:
identity
key management
policy source
clock
DNS/network
admin/operator
update/bootstrap
recovery
callbacks
retries/redrives
resource replacement
shared storage
shared model/provider
observability
configuration
compiler/build
hardware/firmware
hypervisor/runtime.

The purpose is not to prove that the list is universal. It is to test whether the claimed closure boundary handles categories that can alter the protected property.

## 14. Differential closure
Compute closure under multiple independently constructed dependency predicates or threat-model views.
If results differ on security-relevant nodes:
→ closure disagreement
→ claim cannot use the narrower closure silently.

Candidate:
CLOSURE_DISAGREEMENT_ON_SECURITY_RELEVANT_DEPENDENCY → HOLD / REASSESS.

This is not automatically independent evidence if the analyses share the same trust root/toolchain.

## 15. Monotonicity direction
Adding a confirmed security-relevant dependency should not make a previously unsafe claim become stronger.
Candidate monotonicity:
CLOSURE_EXPANSION_WITH_SECURITY_RELEVANT_NODE → CLAIM_SCOPE_MUST_STAY_OR_DECREASE_UNLESS_REVALIDATED.

Removing a dependency from the closure is not neutral; it is a semantic transition requiring justification.

## 16. Predicate versioning
The relevance predicate itself needs identity/version:
PredicateID
PredicateGeneration
SemanticProfile
ClaimScope
EnvironmentContract
Assumptions
Exclusions
InvalidationTriggers.

Evidence produced under PredicateGeneration G0 cannot automatically justify a G1 authority decision if the predicate changed materially.

## 17. Meta-circularity test
To determine whether the relevance predicate is circular:
Trace every semantic rule used to decide relevance.
If a rule's validity ultimately depends on the authority/claim being justified, mark the support cycle.
If no independent anchor remains, the relevance classification cannot establish current authority.

## 18. Proposed protected boundary
Constitutional/Trust Foundation defines a minimum protected relevance floor for safety-critical claims.
Claim-specific analysis may ADD dependencies.
Environment contracts may BOUND dependencies only where the boundary itself is independently justified.
Authority policy may choose stricter operational controls, but cannot remove dependencies from the constitutional floor.

Conceptual order:
CONSTITUTIONAL RELEVANCE FLOOR
→ CLAIM-SPECIFIC RELEVANCE EXPANSION
→ ENVIRONMENT BOUNDARY
→ DEPENDENCY CLOSURE
→ ASSURANCE
→ AUTHORITY.

## 19. External cross-check
NIST defines a trust model as a collection of assumptions characterizing the trustworthiness of components, which supports treating trust assumptions as explicit model inputs rather than invisible facts. NIST's threat-modeling guidance frames threat modeling as modeling attack and defense aspects of a selected entity/environment, and NIST SP 800-192 emphasizes checking access-control models for inconsistency and incompleteness rather than assuming the model perfectly captures the intended policy. citeturn0search0turn0search8turn0search9

NIST material on recovery also stresses understanding system boundaries, trust relationships, identities, and security dependencies; undocumented administrative or infrastructure paths can preserve attacker access after recovery. This supports treating boundary selection and hidden dependencies as explicit security concerns, not mere implementation details. citeturn0search15

## 20. Candidate invariants
SR-01 SECURITY_RELEVANCE_IS_CLAIM_AND_PROPERTY_RELATIVE
SR-02 AUTHORITY_UNDER_EVALUATION_CANNOT_SOLELY_DEFINE_ITS_OWN_RELEVANCE_PREDICATE
SR-03 DEPENDENCY_FACT_IS_DISTINCT_FROM_DEPENDENCY_DEFINITION
SR-04 EXCLUSIONS_REQUIRE_JUSTIFICATION_AND_INVALIDATION_TRIGGERS
SR-05 AUTHORITY_CONTROLLED_COMPONENTS_CANNOT_BE_EXCLUDED_SOLELY_BY_THAT_AUTHORITY
SR-06 BOUNDARY_SELECTION_IS_SECURITY_RELEVANT
SR-07 UNKNOWN_RELEVANCE_IS_NOT_NONRELEVANCE
SR-08 SECURITY_RELEVANCE_CAN_INCREASE_AND_TRIGGER_INVALIDATION
SR-09 CLOSURE_DISAGREEMENT_ON_RELEVANT_DEPENDENCIES_BLOCKS_NARROW_CLAIM
SR-10 CLOSURE_EXPANSION_CANNOT_INCREASE_ASSURANCE_WITHOUT_REVALIDATION
SR-11 PREDICATE_VERSION_IS_PART_OF_ASSURANCE_CONTEXT
SR-12 RELEVANCE_RULES_MUST_HAVE_TRACEABLE_TRUST BASIS
SR-13 CONSTITUTIONAL_RELEVANCE_FLOOR_CANNOT_BE_WEAKENED_BY_OPERATIONAL_POLICY
SR-14 ENVIRONMENT_BOUNDARIES_CANNOT_SELF-AUTHORIZE
SR-15 MODELLED_NONRELEVANCE_DOES_NOT_PROVE_REAL-WORLD_NONRELEVANCE

## 21. Open gaps
SG1. Formal definition of causal relevance and counterfactual dependency.
SG2. Formal semantics for the constitutional relevance floor.
SG3. How to construct adversarial completeness tests systematically.
SG4. How to compare multiple dependency predicates without false independence.
SG5. How to prove boundary completeness for dynamic open-world providers.
SG6. How to encode relevance changes in TLA+ without state explosion.
SG7. How to refine relevance analysis into executable implementation without trusting the implementation to define its own boundary.
SG8. How to connect relevance closure to effect-path closure and enforcement boundary closure without double-counting or omissions.

## 22. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.