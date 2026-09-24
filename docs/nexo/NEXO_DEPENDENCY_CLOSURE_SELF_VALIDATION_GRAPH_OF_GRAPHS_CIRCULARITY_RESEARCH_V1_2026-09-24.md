# NEXO — Dependency-Closure Self-Validation and Graph-of-Graphs Circularity Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Attack the mechanism that determines whether an authority/assurance/evidence SCC has an independent root. The evaluator itself must not become an implicit trust root whose correctness is justified by the authority being evaluated.

## 2. Fundamental distinction
DEPENDENCY_GRAPH != DEPENDENCY_GRAPH_TRUTH
CLOSURE_COMPUTATION != AUTHORITY
CLOSURE_RESULT != ROOT_TRUST
VERIFIED_CLOSURE != CURRENT_AUTHORITY

The closure evaluator may produce evidence about a graph. It must not automatically grant authority merely because it reports a root.

## 3. Graph-of-graphs model
Introduce typed layers:
G0 Constitutional / trust graph
G1 Authority graph
G2 Assurance graph
G3 Evidence/provenance graph
G4 Dependency/failure-domain graph
G5 Effect/resource graph
G6 Evaluator/toolchain graph

The evaluator's own dependencies belong to G6 and must be included when its result is used as security-relevant assurance.

## 4. The evaluator self-reference attack
Naive chain:
Authority A → evaluator E → 'independent root exists' → Authority A.
If E's correctness or trustworthiness depends on A, E cannot be the independent root for A.
Candidate rule:
EVALUATOR_TRUST_MUST_NOT_BE_DERIVED_FROM_THE_AUTHORITY_CLAIM_WHOSE_VALIDITY_THE_EVALUATOR_IS_USED_TO_ESTABLISH.

## 5. Two possible solutions
Solution A — trusted evaluator boundary:
The evaluator is inside an explicitly trusted foundation and its correctness is anchored outside the evaluated authority domain.
Solution B — independently verified evaluator:
The evaluator itself is represented as an implementation that refines a higher-level closure specification, with its assumptions and toolchain independently bounded.

Neither solution is automatically sufficient. A trusted evaluator is a new TCB element; an independently checked evaluator still needs a trusted basis for the checker/toolchain and semantic model.

## 6. Closure certificate is evidence, not authority
Candidate object: DependencyClosureCertificate.
It may state:
graph identity
graph generation
claim identity
scope
closure algorithm/profile
input dependency set
excluded/unknown dependencies
trust/failure-domain closure
root candidates
independence classification
semantic compatibility
ordering context
toolchain/evaluator identity
assumptions
freshness/invalidation

The certificate should enter the Assurance layer as evidence for a bounded claim. It must not directly mutate Authority state.

## 7. No implicit promotion
Required pipeline:
GRAPH SNAPSHOT → CLOSURE COMPUTATION → CERTIFICATE → ASSURANCE VALIDATION → AUTHORITY ADMISSION → PROTECTED AUTHORITY COMMIT.

Forbidden shortcut:
GRAPH SNAPSHOT → 'ROOT FOUND' → CURRENT AUTHORITY.

## 8. Unknown dependency handling
Open-world dependencies are the key attack surface.
If a dependency is UNKNOWN, the evaluator cannot silently treat it as absent.
Candidate rule:
UNKNOWN_DEPENDENCY != NO_DEPENDENCY.
Unknown relevant dependency → HOLD / weaker claim / quarantine unless an explicit bounded-environment contract proves that the omitted dependency is outside the claim boundary.

## 9. Evaluator dependency closure
The evaluator's own closure must include:
parser/canonicalization
algorithm implementation
configuration
policy
model/schema version
dependency libraries
runtime
OS/kernel/hypervisor when relevant
storage
clock/time source when relevant
identity/key source
trust root
graph source
serialization format
verification engine
compiler/build artifact where relevant
operator/admin path

Not every item is always security-relevant; the evaluator must establish a claim-specific closure.

## 10. Semantic circularity attack
Even with an external graph root, the meaning of 'dependency' can be defined by the same authority policy under evaluation.
Example:
Authority policy defines which dependencies count.
Evaluator uses that policy to compute closure.
Closure says policy is independent.
This is circular unless the semantic definition of the closure boundary is itself anchored independently or explicitly treated as an assumption.

Candidate:
CLOSURE_BOUNDARY_SEMANTICS_MUST_BE_EXTERNAL_TO_OR_EXPLICITLY_ASSUMED_BY_THE_CLAIM_BEING_PROVEN.

## 11. Representation attack
The graph can be cryptographically authentic while semantically incomplete.
SIGNED_GRAPH != COMPLETE_GRAPH.
VALID_DIGEST != COMPLETE_DEPENDENCY_CLOSURE.
Correct parser/canonicalization and signed semantic closure remain necessary.

This connects directly to the earlier parser/canonicalization research: cryptographic validity does not imply semantic validity.

## 12. Snapshot freshness attack
A perfectly valid closure certificate can become stale after:
root rotation
authority revocation
policy change
dependency change
artifact update
resource replacement
network/provider change
recovery transition
configuration change
membership change
ordering-domain change.

Therefore:
VALID_CLOSURE_CERTIFICATE != CURRENT_CLOSURE.

Currentness requires generation/context binding and invalidation/revalidation.

## 13. Circular proof through checker output
A checker can produce a valid result under an unsound model.
Therefore:
CHECKER_ACCEPTED != MODEL_SOUND
MODEL_SOUND != IMPLEMENTATION_CORRECT
IMPLEMENTATION_CORRECT != DEPLOYMENT_CORRECT

TLA+ refinement reasoning is useful precisely because an implementation must be related explicitly to a higher-level specification; Lamport describes the refinement theorem as Spec ⇒ HL!Spec, and his Byzantine Paxos example separately reports which safety refinements were mechanically checked. citeturn0search37turn0search5

## 14. Proposed Assurance Root boundary
Introduce an abstract IndependentAssuranceBoundary.
It does not grant authority. It establishes the minimum trusted basis from which a claim can be evaluated.
Candidate fields:
boundary_id
root_type
trust_anchor
ordering_anchor
semantic_profile
toolchain_profile
dependency_closure
failure_domain
assumptions
claim_scope
generation
invalidations
revalidation method.

An authority transition can consume an assurance result only if its required IndependentAssuranceBoundary is current and compatible.

## 15. Multiple evaluator problem
Running two evaluators does not automatically solve circularity:
E1 and E2 may share:
same graph source
same parser
same library
same trust root
same policy
same compiler
same administrator
same model
same hidden dependency.

Therefore:
TWO_EVALUATORS != INDEPENDENT_ASSURANCE.

Independent evaluator composition requires explicit failure-domain and semantic-independence contracts.

## 16. Minimal safe architecture
Trusted foundation
→ defines constitutional semantics and protected ordering
→ protects/anchors closure semantics
→ evaluator computes dependency closure
→ independent evidence records result
→ assurance validates certificate
→ authority layer decides admission
→ protected authority commit linearizes the transition.

The closure evaluator remains non-authoritative.

## 17. NIST cross-check
NIST SP 800-193 treats roots of trust as the firm foundation for security and explicitly describes logical roots for update, detection, and recovery. It also notes that a device relying on another device's security functionality creates a critical trust relationship. This supports the architectural conclusion that security dependencies must be explicit and that a supporting mechanism cannot simply be assumed independent. NIST does not, however, define Nexo's graph-of-graphs or SCC certificate model. citeturn0search36turn0search12

## 18. Candidate invariants
DCS-01 CLOSURE_COMPUTATION_DOES_NOT_EQUAL_AUTHORITY
DCS-02 CLOSURE_CERTIFICATE_DOES_NOT_EQUAL_CURRENT_AUTHORITY
DCS-03 EVALUATOR_TRUST_MUST_NOT_DERIVE_FROM_THE_CLAIM_UNDER_EVALUATION
DCS-04 UNKNOWN_DEPENDENCY_IS_NOT_NO_DEPENDENCY
DCS-05 SIGNED_GRAPH_IS_NOT_COMPLETE_GRAPH
DCS-06 VALID_CLOSURE_CERTIFICATE_IS_NOT_CURRENT_CLOSURE
DCS-07 CLOSURE_SEMANTICS_MUST_BE_ANCHORED_OR_EXPLICITLY_ASSUMED
DCS-08 MULTIPLE_EVALUATORS_DO_NOT_IMPLY_INDEPENDENCE
DCS-09 CHECKER_ACCEPTANCE_DOES_NOT_PROVE_MODEL_SOUNDNESS
DCS-10 MODEL_SOUNDNESS_DOES_NOT_PROVE_IMPLEMENTATION_CORRECTNESS
DCS-11 IMPLEMENTATION_CORRECTNESS_DOES_NOT_PROVE_DEPLOYMENT_CORRECTNESS
DCS-12 AUTHORITY_ADMISSION_REQUIRES_CURRENT_COMPATIBLE_ASSURANCE
DCS-13 SELF-SUPPORTING_DEPENDENCY_CLOSURE_CANNOT_ESTABLISH_INDEPENDENT_ROOT
DCS-14 EVALUATOR_DEPENDENCIES_MUST_BE_INCLUDED_WHEN_SECURITY_RELEVANT
DCS-15 CLAIM_SCOPE_MUST_NOT_EXCEED_VERIFIED_CLOSURE_SCOPE

## 19. Open gaps
G1. Formal definition of independent closure under dynamic graphs.
G2. How to model evaluator/toolchain trust without making the trusted foundation unmanageably large.
G3. How to prove the closure evaluator implementation refines the abstract closure specification.
G4. How to handle dependencies whose security relevance changes with the claim.
G5. How to compose multiple independent assurance boundaries without creating a new circular composition.
G6. How to handle graph updates concurrently with authority admission.
G7. How to preserve closure evidence across compaction and root rotation.
G8. How to express common-mode independence in a finite formal model.

## 20. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.