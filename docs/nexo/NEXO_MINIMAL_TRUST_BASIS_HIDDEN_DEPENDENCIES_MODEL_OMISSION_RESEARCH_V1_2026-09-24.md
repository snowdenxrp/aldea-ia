# NEXO — Minimal Trust Basis Hidden Dependencies and Model Omission Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Determine whether a MinimalTrustBasis can be computed soundly when hidden dependencies exist and when the formal model may omit real-world dependencies.

## 2. Core distinction
MODEL_DEPENDENCY_CLOSURE != REAL_DEPENDENCY_CLOSURE
MODEL_ROOT_INDEPENDENCE != REAL_ROOT_INDEPENDENCE
ABSENCE_FROM_MODEL != ABSENCE_IN_REAL_WORLD

A model can prove a property of the modeled system while the real system contains an omitted dependency. Therefore model completeness relative to the security claim is itself a proof obligation.

## 3. Hidden dependency classes
HD0 explicitly modeled
HD1 omitted but irrelevant to claim
HD2 omitted and potentially relevant
HD3 unknown relevance
HD4 adversarially hidden dependency

HD2-HD4 cannot be silently treated as absent for a strong independence claim.

## 4. Claim-specific dependency closure
Do not seek universal closure. For claim C, define a security-relevant dependency predicate Dep_C(x,y).
Then:
Closure_C(root) = least dependency-closed set under Dep_C, subject to the environment/model assumptions.
The predicate itself becomes part of the claim context and must be anchored or explicitly assumed.

## 5. Hidden-edge counterexample
Suppose the modeled graph is:
Root R → Verifier V → Claim C.
The model proves R is independent.
Real deployment contains an unmodeled dependency:
V → SharedAdmin A → Authority SCC.
The real path closes back into the authority being evaluated.
Therefore the model's independence proof is unsound for the real claim unless the omitted edge is outside the claim boundary by contract.

## 6. Open-world versus bounded-world closure
Four modes:
CLOSED_WORLD: all relevant effect/dependency paths are enumerated by contract.
BOUNDARY_WORLD: only dependencies crossing a defined boundary are relevant; boundary completeness is protected.
ASSUMED_WORLD: omitted dependencies are explicit assumptions, not facts.
UNKNOWN_WORLD: closure completeness is unresolved.

Strong current-authority claims should require CLOSED_WORLD or an appropriately proven BOUNDARY_WORLD. ASSUMED_WORLD can support only claims that explicitly expose the assumptions. UNKNOWN_WORLD cannot support strong independence.

## 7. Minimal basis computation
Candidate algorithmic objective:
Find one or more dependency-closed, independently anchored bases B such that B is sufficient for claim C.
Do not require a unique minimum. There may be multiple incomparable minimal bases.
Return a set of candidate bases plus residual assumptions and unresolved dependencies.

Candidate result:
BasisSet(C) = {B1, B2, ... Bn} + residual assumptions + unresolved set.
If every candidate basis contains a common compromised dependency D, the claim's effective independence is bounded by D.

## 8. Minimality must not become an attack
An optimizer could remove dependencies until a basis appears independent.
Therefore minimality is subordinate to sound closure:
FIRST_SOUND_CLOSURE → THEN_MINIMIZE.
Never:
MINIMIZE → DEFINE_CLOSURE.

Candidate invariant:
MINIMIZATION_CANNOT_REMOVE_A_SECURITY_RELEVANT_DEPENDENCY_REQUIRED_BY_THE_CLAIM.

## 9. Hidden dependency discovery
Potential discovery mechanisms:
static dependency manifests
runtime call graphs
identity/trust graphs
SBOM/provenance
configuration dependency graphs
network/control-plane topology
resource-side enforcement paths
operator/admin paths
update/bootstrap/recovery paths
shared infrastructure inventory
common-mode analysis
adversarial red-team discovery.

No single mechanism proves completeness for every claim.

## 10. Discovery evidence versus closure truth
A scanner reporting no dependency is evidence of observation, not proof of absence.
Therefore:
NO_DISCOVERED_EDGE != NO_EDGE.
Absence claims require a completeness contract or a weaker claim.

## 11. Model omission and formal checking
Formal model checking can establish properties of the modeled state space. Lamport's model-checking material describes TLC as checking invariants and step-simulation/refinement for a specified model. It does not make an omitted real-world behavior disappear; the abstraction/refinement relation remains essential. citeturn0search16turn0search15

Candidate formal obligation:
MODEL_CLOSURE_SOUND_FOR_CLAIM(C) means every real behavior/dependency relevant to C is represented by, bounded by, or explicitly excluded by a trusted environment contract.

## 12. Environment contract
Introduce candidate EnvironmentClosureContract:
environment_id
claim_scope
allowed_dependency_classes
boundary_definition
enumeration mechanism
omission policy
unknown handling
update/invalidation triggers
trust anchor
verification method
assumptions
expiry/review.

The contract constrains what can legitimately be claimed; it does not magically prove the physical world matches the contract.

## 13. Anti-amplification property
An environment contract must not expand authority merely by declaring the environment closed.
Candidate:
ENVIRONMENT_CONTRACT_CAN_BOUND_CLAIM_SCOPE_BUT_CANNOT_SELF-AUTHORIZE_CURRENT_AUTHORITY.

Boundary completeness must be separately justified by the protected trust foundation/enforcement boundary.

## 14. Dynamic hidden dependencies
Dependencies can appear after admission:
dynamic service discovery
provider failover
callback
retry/redrive
resource replacement
delegation
update/bootstrap
recovery
operator intervention.

Therefore closure is not a one-time property. Admission context must bind the closure generation and define invalidation/widening rules.

Candidate:
NEW_SECURITY_RELEVANT_DEPENDENCY = NEW_CONTEXT_UNTIL_PROVEN_WITHIN_EXISTING_BOUNDARY.

## 15. Basis stability
A MinimalTrustBasis can become stale without any explicit root compromise.
Changes include:
policy generation
membership
root generation
dependency graph
resource incarnation
toolchain
artifact/config
environment boundary
ordering domain.

Thus:
VALID_MINIMAL_BASIS_AT_T0 != CURRENT_MINIMAL_BASIS_AT_T1.

## 16. Multiple bases and failover
If B1 and B2 are alternative bases, switching from B1 to B2 is a trust transition, not a transparent optimization.
Required:
compatibility check
currentness
scope check
dependency closure
revocation/invalidation
protected publication
authority revalidation.

## 17. Root discovery cannot grant root authority
Finding an object that appears independent is only discovery evidence.
Pipeline:
DISCOVER → AUTHENTICATE → CONTEXT-BIND → DEPENDENCY-CLOSE → INDEPENDENCE-CLASSIFY → ASSURANCE → AUTHORITY-ADMISSION.

Discovery never directly changes authority.

## 18. NIST cross-check
NIST describes roots of trust as inherently trusted foundations and notes that vulnerabilities in underlying components can compromise mechanisms relying on them. NIST SP 800-193 also requires chains of trust to be anchored in a root of trust. This supports treating hidden underlying dependencies as security-relevant rather than assuming a chain is independent merely because its visible elements differ. citeturn0search0turn0search12

## 19. Candidate invariants
HB-01 MODEL_CLOSURE_IS_NOT_REAL_CLOSURE
HB-02 MODEL_ABSENCE_IS_NOT_REAL_ABSENCE
HB-03 UNKNOWN_DEPENDENCY_IS_NOT_NO_DEPENDENCY
HB-04 STRONG_INDEPENDENCE_REQUIRES_CLOSURE_OR_EXPLICIT_BOUNDARY_ASSUMPTION
HB-05 FIRST_SOUND_CLOSURE_THEN_MINIMIZE
HB-06 MINIMIZATION_CANNOT_REMOVE_SECURITY_RELEVANT_DEPENDENCIES
HB-07 DISCOVERY_NO-RESULT_DOES_NOT_PROVE_ABSENCE
HB-08 ENVIRONMENT_CONTRACT_BOUNDS_CLAIMS_BUT_DOES_NOT_SELF-AUTHORIZE
HB-09 DYNAMIC_NEW_DEPENDENCY_REQUIRES_CONTEXT_REVALIDATION
HB-10 VALID_BASIS_AT_T0_DOES_NOT_IMPLY_CURRENT_BASIS_AT_T1
HB-11 ALTERNATIVE_BASIS_SWITCH_IS_A_TRUST_TRANSITION
HB-12 MODEL_CLOSURE_SOUNDNESS_IS_A_SEPARATE_PROOF OBLIGATION
HB-13 CLAIM_SCOPE_CANNOT_EXCEED_VERIFIED_CLOSURE_SCOPE
HB-14 ROOT_DISCOVERY_CANNOT_DIRECTLY_GRANT_AUTHORITY
HB-15 HIDDEN_COMMON_MODE_DEPENDENCY_LIMITS_INDEPENDENCE

## 20. Open gaps
HG1. Formal representation of real-world-to-model closure soundness.
HG2. How to establish boundary completeness without assuming the conclusion.
HG3. Efficient hidden dependency discovery and adversarial completeness.
HG4. Formal treatment of dynamic dependency emergence.
HG5. Multiple incomparable MinimalTrustBasis composition.
HG6. Finite-model abstraction that preserves relevant hidden dependency classes.
HG7. Toolchain/build dependencies of the closure evaluator.
HG8. Whether a practical bounded environment can ever support the strongest authority claims without a physical enforcement boundary.

## 21. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.