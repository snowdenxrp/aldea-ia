# NEXO — Authority / Assurance / Evidence Cross-Composition and Independent Root Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/runtime/deployment verification claimed.

## 1. Attack objective
Attack simultaneous composition of authority claims, assurance claims, and evidence artifacts. Determine whether a cycle can cause each layer to validate another and thereby manufacture current authority without an independent root.

Core rules:
EVIDENCE != ASSURANCE
ASSURANCE != AUTHORITY
AUTHORITY != EFFECT
VALID_EVIDENCE + VALID_ASSURANCE != CURRENT_AUTHORITY
TRANSITIVE_VALIDITY_CHAIN != INDEPENDENT_AUTHORITY_ROOT

## 2. External formal cross-check
Lamport's TLA+ material distinguishes an implementation from a higher-level specification through an explicit refinement mapping and a theorem showing the lower-level specification implements the higher-level one. This is directly relevant: a chain of locally valid relations is not by itself a proof that the global semantic relation holds. His mechanically checked Byzantine Paxos example demonstrates safety by refinement and separately distinguishes what was checked for safety from what was not checked for liveness.

## 3. Three-graph attack
Model three distinct dependency graphs:
Evidence Graph: observations, signatures, witnesses, provenance.
Assurance Graph: claims that interpret evidence and establish bounded properties.
Authority Graph: current permissions, epochs, roots, delegation, succession.

Attack condition:
EVIDENCE(A) supports ASSURANCE(B)
ASSURANCE(B) supports AUTHORITY(C)
AUTHORITY(C) is then used to validate or generate EVIDENCE(A).

If no independent root or protected boundary breaks the cycle, the entire chain is self-supporting.
Required result: DENY as an independent proof of current authority.

## 4. Circular bootstrap cases
ACR-A Evidence signs an assurance certificate; assurance certificate grants the authority that is used to authenticate the evidence signer.
ACR-B Recovery authority validates its own recovery witness through a capability it issued.
ACR-C A delegated child capability is used to prove the parent authority from which the child was derived.
ACR-D Current authority validates a root-transition artifact whose validity is then used to establish current authority.
ACR-E Compaction certificate justifies deletion of the history that was the only independent basis for the certificate.
ACR-F Governance approval is authenticated only through an identity/trust context established by the governance decision itself.
ACR-G Assurance witness and authority register share a common compromised dependency, but are counted as independent.

## 5. Independent root requirement
Candidate rule:
NO_CURRENT_AUTHORITY_CLAIM_FROM_A_TRANSITIVE_CHAIN_UNLESS_THE_CHAIN_HAS_AN_INDEPENDENTLY_ANCHORED_TRUST_OR_ORDERING_ROOT.
Independence is claim-specific and must include failure-domain/trust-domain analysis. Different services, hosts, models, keys, or signatures do not automatically constitute independent roots.

## 6. Root types
Potential independent anchors:
Constitutional trust anchor
Protected safety ordering domain
Independent human recovery authorization where explicitly governed
Resource-side enforcement boundary
External provider attestation whose trust assumptions are independent of the authority chain
Previously committed authority state whose continuity and freshness are independently established

No anchor is universally independent; independence must be justified for the exact claim.

## 7. Authority-to-assurance feedback attack
Suppose authority C authorizes verifier V. V produces assurance B. B is then accepted as proof that C is current.
This creates:
C → V → B → C
Unless V/B contains an independently anchored fact about C, the cycle cannot prove C's currentness.
Candidate invariant:
CURRENTNESS_CANNOT_BE_ESTABLISHED_SOLELY_BY_A_TRANSITIVE_CHAIN_DERIVED_FROM_CANDIDATE_CURRENTNESS.

## 8. Evidence-to-authority feedback attack
Historical evidence can be authentic and still not authorize anything.
Candidate:
HISTORICAL_AUTHENTICITY_DOES_NOT_CREATE_CURRENT_AUTHORITY.
Evidence can establish what was observed or signed under a historical context, but current authority requires current root/generation/epoch/policy/membership/fence/dependency context.

## 9. Assurance-to-authority amplification
A high-confidence assurance claim may still have narrower scope than the authority it appears to support.
Candidate:
ASSURANCE_STRENGTH != AUTHORITY_SCOPE.
An assurance certificate may prove a property about R1 while a requested authority covers R1+R2+R3. Scope expansion requires a separate protected derivation.

## 10. Multi-root attack
Two roots can each be valid but not compatible.
ROOT_A_VALID + ROOT_B_VALID != JOINT_AUTHORITY.
If root generations, membership, ordering, policy, or trust assumptions are unresolved, current authority must remain unresolved.
Candidate:
TWO_VALID_ROOTS_WITHOUT_PROTECTED_ORDER -> AUTHORITY_UNRESOLVED.

## 11. Common-mode independence attack
Independence must survive dependency closure.
Examples of hidden common mode:
same HSM/KMS
same root CA
same identity provider
same policy source
same configuration artifact
same update pipeline
same coordination store
same compromised administrator
same network/DNS/clock
same model/provider
same recovery store
same observation source

Therefore witness count is not independent assurance cardinality.

## 12. Cycle-breaking protocol candidate
DETECT_CYCLE → FREEZE_AUTHORITY_AMPLIFICATION → IDENTIFY_SCC → COMPUTE_DEPENDENCY_CLOSURE → FIND_INDEPENDENT_ANCHOR → INVALIDATE_SELF-SUPPORTING_CLAIMS → FENCE_AFFECTED_AUTHORITY → RECONCILE_EXTERNAL_EFFECTS → RECOMPUTE_ASSURANCE → EXPLICIT_RELEASE

If no independent anchor exists:
→ BOUNDED_SAFETY_ONLY / QUARANTINE / AUTHORITY_UNRESOLVED

## 13. Candidate invariants
ACR-01 EVIDENCE_DOES_NOT_EQUAL_ASSURANCE
ACR-02 ASSURANCE_DOES_NOT_EQUAL_AUTHORITY
ACR-03 AUTHORITY_DOES_NOT_EQUAL_EFFECT_SUCCESS
ACR-04 TRANSITIVE_VALIDITY_DOES_NOT_CREATE_INDEPENDENT_AUTHORITY
ACR-05 CURRENTNESS_CANNOT_BE_ESTABLISHED_FROM_A_CHAIN_DERIVED_ONLY_FROM_CANDIDATE_CURRENTNESS
ACR-06 SELF-SUPPORTING_ASSURANCE/AUTHORITY CYCLES ARE INVALID
ACR-07 INDEPENDENCE_REQUIRES_FAILURE-DOMAIN_AND_TRUST-DEPENDENCY_CLOSURE
ACR-08 TWO_VALID_ROOTS_DO_NOT_IMPLY_COMPATIBLE_JOINT_AUTHORITY
ACR-09 HISTORICAL_EVIDENCE_CANNOT_RESURRECT_REVOKED_AUTHORITY
ACR-10 ASSURANCE_SCOPE_CANNOT_EXCEED_VERIFIED_PROPERTY_SCOPE
ACR-11 AUTHORITY_FEEDBACK_CANNOT_UPGRADE_EVIDENCE_INDEPENDENCE
ACR-12 COMPACTION_OR_DELETION_CERTIFICATES_CANNOT_SELF-JUSTIFY_THEIR_SUPPORTING_INFORMATION_LOSS
ACR-13 UNRESOLVED_CYCLE_OR_ROOT_ORDER -> AUTHORITY_UNRESOLVED
ACR-14 CYCLE_BREAKING_REQUIRES_A_PROTECTED_BOUNDARY_OR_INDEPENDENT_ANCHOR
ACR-15 COMPOSITE_AUTHORITY_REQUIRES_EXPLICIT_COMPOSITION_AND_DEPENDENCY_CLOSURE

## 14. Architectural synthesis
Nexo should keep Evidence, Assurance, and Authority as separate planes/graphs with typed edges. An edge must state what property it transfers and what it does not transfer.
Candidate edge types:
EVIDENCE_SUPPORTS_CLAIM
CLAIM_SUPPORTS_ADMISSION
AUTHORITY_PERMITS_EFFECT
EFFECT_GENERATES_EVIDENCE
AUTHORITY_INVALIDATES_CLAIM
ROOT_ANCHORS_ORDER
DEPENDENCY_CORRELATES_WITNESSES
None of these edges should be implicitly reversible.

## 15. Formalization target
Model EvidenceGraph, AssuranceGraph, AuthorityGraph, typed cross-graph edges, SCCs, dependency closure, independent roots, root compatibility, authority epochs, and feedback cycles. Prove that no current-authority state is reachable solely through a cycle lacking an independent protected anchor.
Use refinement mappings only after the abstract graph semantics are fixed. TLA+ supports such refinement reasoning, but Nexo has not yet executed SANY/TLC/TLAPS for this model.

## 16. Verification boundary
No SANY/TLC/TLAPS verification. No implementation refinement. No runtime testing. No fault injection. No deployment verification.