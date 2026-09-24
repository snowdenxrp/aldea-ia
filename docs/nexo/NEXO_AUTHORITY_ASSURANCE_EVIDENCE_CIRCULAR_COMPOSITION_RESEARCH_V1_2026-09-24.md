# NEXO — Authority + Assurance + Evidence Circular Composition Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/runtime/deployment verification claimed.

## 1. Attack objective
Attack the composition of three distinct layers—Evidence, Assurance, and Authority—to determine whether mutually dependent claims can accidentally bootstrap current authority without an independent root or protected transition.

Core rules:
EVIDENCE_SUPPORTS_ASSURANCE != ASSURANCE_CREATES_AUTHORITY
AUTHORITY_MAY_REQUIRE_ASSURANCE != ASSURANCE_MAY_CREATE_AUTHORITY
VALIDITY_OF_EACH_LAYER != VALIDITY_OF_THE_COMPOSED_CYCLE

## 2. External architectural cross-check
RFC 9334 RATS explicitly separates Evidence, Verifier appraisal, Attestation Results, and Relying Party decisions. Evidence is appraised by a Verifier; the resulting Attestation Result is consumed by the Relying Party. It also identifies trust anchors and warns that appraisal policy integrity is necessary. This supports keeping evidence, appraisal/assurance, and authority/admission as distinct roles and artifacts. RFC 9334 also warns that when an entity performs multiple roles, designers must evaluate emergent risk rather than assuming the individual role properties remain sufficient. citeturn0search0turn0search1
RFC 9999 (published July 2026) further formalizes protocol-agnostic RATS conceptual messages and their wrapper context, reinforcing that message meaning and role interaction context must remain explicit across transport/encoding changes. citeturn0search2turn0search3

## 3. Circular attack patterns
CE-A Evidence E proves Assurance A; A is then treated as proof that E is trustworthy. Without an independent trust anchor, this is circular.
CE-B Assurance A grants Authority U; U controls the policy or verifier that generates A. This can create self-authorizing policy.
CE-C Authority U selects the evidence source E; E is then used to prove U's authority. Selection and proof collapse into one trust cycle.
CE-D Two components mutually attest each other: A validates B, B validates A, but neither has an independent root.
CE-E Recovery authority validates its own recovery evidence and then uses the result to grant mission authority.
CE-F Human emergency approval is accepted because the machine assurance layer says the human identity is trustworthy, while the machine assurance layer is accepted because the human approves it.
CE-G A composite quorum is used to validate the assurance system that defines quorum membership. The quorum thereby validates its own membership.
CE-H Evidence is compacted/deleted because a certificate says it is safe to delete; the same certificate depends on the deleted evidence.
CE-I A proof cache is used to validate current authority; current authority is then used to declare the proof cache current.
CE-J Root rotation: successor authority is considered current because a certificate signed by the predecessor says so, while predecessor validity is itself being decided by the successor.
CE-K Policy update: new policy is accepted because the old policy authorizes it, then the new policy is used to retroactively validate the old authorization context.
CE-L Cross-layer composition: Evidence(E) → Assurance(A) → Authority(U) → new Evidence(E2), where E2 is used to strengthen A without independent provenance.

## 4. Trust graph separation
Maintain distinct graphs:
Evidence Dependency Graph (EDG)
Assurance Dependency Graph (ADG)
Authority Dependency Graph (AuDG)
Effect Dependency Graph (EffectDG)
World/Reconciliation Dependency Graph (WDG)

Edges between graphs must be typed and directional. No generic trust edge should mean both 'supports evidence', 'creates assurance', and 'grants authority'.

## 5. Root requirement
Candidate rule:
EVERY_CURRENT_AUTHORITY_CLAIM_MUST_HAVE_A_NON-CIRCULAR_TRUST_PATH_TO_A_CURRENT_AUTHORITY_ROOT
An authority root may be constitutional, cryptographic, organizational, or otherwise explicitly defined by the system, but the root's currentness and scope must themselves be governed by an independent protected transition.

Root existence is not sufficient: the root can be stale, revoked, partitioned, compromised, or itself dependent on a circular claim.

## 6. Cycle analysis
Construct a directed dependency graph and compute strongly connected components (SCCs).
Candidate rule:
AUTHORITY/ASSURANCE SCC WITH NO INDEPENDENT_TRUST_ANCHOR -> UNRESOLVED / DENY
An SCC may be allowed for coordination, but it must not create authority beyond an externally rooted envelope.

## 7. Mixed-layer cycle
A dangerous cycle has the shape:
EVIDENCE → ASSURANCE → AUTHORITY → POLICY/VERIFIER → EVIDENCE
This must not be treated as a valid proof merely because every edge is individually well-typed.

Candidate property:
NO_CLAIM_MAY_BE_USED_TO_JUSTIFY_A_TRUST_EDGE_THAT_IS_REQUIRED_TO_ESTABLISH_THE_CLAIM_ITSELF.

## 8. Bootstrap boundary
Bootstrap authority may establish limited machinery needed to initialize trust, but it must not silently become ordinary mission authority.
Candidate:
BOOTSTRAP_AUTHORITY ⊄ MISSION_AUTHORITY unless an explicit protected transition transfers a bounded scope.

Recovery authority follows the same rule.

## 9. Assurance composition boundary
An assurance result can support admission only under the exact policy that consumes it. It cannot redefine the policy, verifier trust anchors, membership, or authority semantics that determine whether the assurance result is valid.
Candidate:
ASSURANCE_CONSUMER_CONTEXT != ASSURANCE_PRODUCER_CONTEXT unless explicitly compatible and protected.

## 10. Authority-to-evidence feedback
Authority may legitimately determine which evidence is requested, but request selection must not turn the requested evidence into self-validating evidence.
Candidate separation:
AUTHORITY_SELECTS_EVIDENCE_REQUEST != AUTHORITY_IS_PROVEN_BY_REQUEST_SELECTION
Evidence provenance must remain independently bound.

## 11. Human emergency boundary
Human authorization can be an explicit external authority source, but the architecture must not use machine assurance to prove the human's authority while simultaneously using the human's authorization to prove the machine assurance. If both are mutually required, a separate constitutional/root mechanism is required.

## 12. Compaction boundary
Any certificate authorizing deletion/compaction of evidence must have a dependency closure that survives the deletion.
Candidate:
CERTIFICATE_DEPENDENCY_CLOSURE_MUST_OUTLIVE_THE_INFORMATION_IT_JUSTIFIES_RECLAIMING
This extends prior compaction research.

## 13. Candidate objects
TrustRoot; TrustPath; TrustEdge; AssuranceRoot; AuthorityRoot; EvidenceDependencyGraph; AssuranceDependencyGraph; AuthorityDependencyGraph; CrossLayerTrustEdge; CircularityCertificate; BootstrapAuthority; RecoveryAuthority; RootRelianceClosure; AuthorityOrigin; TrustCycleAnalysis.

## 14. Candidate invariants
CE-01 EVIDENCE_DOES_NOT_AUTOMATICALLY_CREATE_AUTHORITY
CE-02 ASSURANCE_DOES_NOT_AUTOMATICALLY_CREATE_AUTHORITY
CE-03 AUTHORITY_DOES_NOT_SELF-JUSTIFY_ITS_REQUIRED_ASSURANCE
CE-04 EVERY_CURRENT_AUTHORITY_CLAIM_REQUIRES_A_NON-CIRCULAR_CURRENT_TRUST_PATH
CE-05 AUTHORITY/ASSURANCE SCC_WITHOUT_INDEPENDENT_ROOT_CANNOT_CREATE_CURRENT_AUTHORITY
CE-06 TRUST_EDGES_ARE_TYPED_AND_DIRECTIONAL
CE-07 BOOTSTRAP_AUTHORITY_CANNOT_SILENTLY_AMPLIFY_TO_MISSION_AUTHORITY
CE-08 RECOVERY_AUTHORITY_CANNOT_SELF-GRANT_MISSION_AUTHORITY
CE-09 POLICY_OR_VERIFIER_CONTROL_CANNOT_BE_DERIVED_FROM_THE_ASSURANCE_IT_GENERATES
CE-10 EVIDENCE_PROVENANCE_CANNOT_BE_ESTABLISHED_BY_THE_AUTHORITY_THAT_SELECTS_IT_ALONE
CE-11 COMPACTION_AUTHORIZATION_CANNOT_DEPEND_ON_THE_INFORMATION_IT_RECLAIMS
CE-12 ROOT_ROTATION_REQUIRES_PROTECTED_SUCCESSION_ORDER_AND_NON-CIRCULAR_CURRENTNESS
CE-13 CROSS-LAYER_COMPOSITION_REQUIRES_EXPLICIT_TRUST_EDGE_TYPES
CE-14 MUTUAL_ATTESTATION_WITHOUT_AN_INDEPENDENT_ROOT_IS_NOT_CURRENT_AUTHORITY
CE-15 VALID_COMPONENT_CLAIMS_DO_NOT_AUTOMATICALLY_VALIDATE_THE_COMPOSITE_CYCLE

## 15. Formalization target
Model Evidence, Assurance, Authority, Policy, TrustRoot, and TrustEdge as distinct typed nodes. Define which edges may support which claims. Compute SCCs and require an independent root path for current authority. Model root rotation, recovery, bootstrap, human emergency approval, compaction, and policy update as explicit transitions.
For eventual TLA+ work, the abstract property should state that every current authority state has a non-circular derivation from the protected constitutional/root boundary. A refinement proof would then show the implementation preserves that abstract property; this is a future verification target, not a current result. citeturn0search25

## 16. Verification boundary
No SANY/TLC verification. No implementation refinement. No runtime testing. No fault injection. No deployment verification.