# NEXO — SCC / Dependency Closure / Rooted Authority Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Analyze large cyclic authority-assurance-evidence graphs. Determine when a strongly connected component (SCC) is genuinely anchored by an independent root and when apparent external support is itself downstream of the SCC.

## 2. Core distinction
SCC membership is structural, not proof of compromise.
An SCC can contain legitimate mutual dependencies. The safety question is whether the SCC has a justified external support path that is independent for the exact claim.

Definitions:
SELF-SUPPORTING_SCC = SCC whose claim validity ultimately depends only on nodes/edges whose authority or assurance is derived from that SCC.
ROOT-SUPPORTED_SCC = SCC with an explicit support path to an independently anchored trust/order/enforcement boundary, with dependency closure showing the support does not re-enter the SCC through an equivalent dependency.

## 3. The hidden-cycle problem
Naive graph search can falsely report an external root:
R → X → A → B → R
where R appears outside the SCC {A,B}, but R's validity depends on A/B through another dependency path.
Therefore graph-theoretic reachability is insufficient. Root support requires dependency-closed provenance and trust-domain analysis.

## 4. Proposed support classification
S0: No external support.
S1: Syntactic external support only.
S2: External support with unresolved dependency closure.
S3: External support with closed dependency closure but shared trust/failure domain.
S4: External support with independent failure/trust boundary but unresolved semantic compatibility.
S5: Claim-specific independently anchored support with semantic compatibility and protected ordering.

Only S5 may support current-authority derivation, and even S5 is a candidate design rule pending formal proof.

## 5. SCC condensation is not enough
Condensing SCCs into a DAG is useful for topology, but it can hide semantic cycles in dependency edges, evidence provenance, recovery authority, key roots, or shared infrastructure.
Therefore each SCC node must carry a dependency closure, not merely incoming/outgoing graph edges.

Candidate object: SCCSupportCertificate
Fields:
scc_id
claim_id
claim_scope
candidate_root_id
root_generation
support_path
dependency_closure
trust_domain_closure
failure_domain_closure
semantic_context
authority_epoch
policy/invariant generation
effect/resource scope
ordering domain
revalidation requirements
invalidations
publication generation

## 6. Independent-root test
Candidate predicate:
IndependentRoot(R, Claim C) requires:
1. R is anchored outside the authority/assurance/evidence SCC under analysis.
2. The support relation is protected and explicitly typed.
3. Dependency closure of R does not rely on the SCC for the property being proven.
4. Trust/failure-domain closure does not collapse R and the SCC into the same effective dependency.
5. Semantic context is compatible with C.
6. Root generation/order is current and unambiguous.
7. Revocation/invalidation state is current.
8. The claimed scope does not exceed the root's verified scope.

## 7. Anti-circularity condition
Candidate invariant:
NO_PROOF_NODE_MAY_BE_USED_AS_AN_INDEPENDENT_SUPPORT_ROOT_IF_ITS_VALIDITY_DEPENDS_ON_THE_CLAIM_BEING_PROVEN.

Stronger form:
NO_CURRENT_AUTHORITY_MAY_BE_DERIVED_FROM_A_SUPPORT_GRAPH_WHOSE_DEPENDENCY-CLOSED_REACHABILITY_TO_ROOTS_CONTAINS_NO_INDEPENDENTLY_ANCHORED_ROOT.

## 8. Self-support through infrastructure
Attack example:
Authority SCC depends on a KMS.
KMS policy is authorized by a policy engine.
Policy engine's configuration is signed by a governance key.
Governance key validity is established through a recovery authority.
Recovery authority is derived from the original Authority SCC.

Even though the visible graph appears to contain KMS/policy/governance nodes outside the SCC, the dependency closure returns to the SCC.
Result: no independent root for current authority.

## 9. Shared-root attack
Two assurance branches may look independent:
Assurance A ← verifier A ← root R
Assurance B ← verifier B ← root R
If the claim requires independent assurance, both branches have the same root dependency.
Therefore:
TWO_BRANCHES_WITH_ONE_ROOT != TWO_INDEPENDENT_ASSURANCE_SOURCES.

## 10. Root support must be claim-specific
A root may independently anchor artifact integrity but not current authorization.
Example:
R proves artifact authenticity.
It does not automatically prove policy currentness, authority epoch, resource identity, external enforcement, or world outcome.
Therefore root support is typed by property:
ARTIFACT_ROOT
IDENTITY_ROOT
ORDER_ROOT
AUTHORITY_ROOT
ENFORCEMENT_ROOT
EVIDENCE_ROOT
RECOVERY_ROOT
These are not interchangeable without an explicit composition contract.

## 11. Cycles involving recovery
Recovery is especially dangerous because it can appear to be the independent root after authority failure.
Candidate rule:
RECOVERY_AUTHORITY_MUST_NOT_BECOME_AN_INDEPENDENT_ROOT_FOR_MISSION_AUTHORITY_SOLELY_BY_VALIDATING_ITS_OWN_RECOVERY_CHAIN.
Recovery must have an independent constitutional/safety/recovery trust contract or remain bounded safety/quarantined.

## 12. Cycles involving compaction
Compaction may delete the very evidence needed to prove that a root was independent.
Therefore:
ROOT_RELIANCE_METADATA_MUST_OUTLIVE_ANY_HISTORY_WHOSE_DELETION_IT_JUSTIFIES.
Compaction certificate support must be closed before reclamation and cannot depend on reclaimed evidence.

## 13. Cycles involving delegation
Child capability → verifier → assurance → parent authority → child capability is not independent support.
Delegation lineage is a dependency edge, not a root.
Parent currentness must be independently established before child authority can be current.

## 14. Cycle breaking
Proposed safe sequence:
FREEZE_AUTHORITY_AMPLIFICATION
→ IDENTIFY_SCC
→ EXPAND_SEMANTIC_AND_DEPENDENCY_CLOSURE
→ CLASSIFY_EXTERNAL_SUPPORT
→ TEST_INDEPENDENT_ROOT
→ INVALIDATE_SELF_SUPPORTING_CLAIMS
→ FENCE_AFFECTED_AUTHORITY
→ RECOMPUTE_ASSURANCE
→ RECONCILE_EFFECTS
→ PUBLISH_ONLY_THE_MAXIMUM_SUPPORTED_CLAIM

If root support is unresolved:
AUTHORITY_UNRESOLVED / QUARANTINE / BOUNDED_SAFETY_ONLY.

## 15. Formalization target
Future TLA+ model should represent typed support edges, SCC membership, dependency closure, root classes, semantic contexts, authority epochs, invalidation, and protected publication.
The abstract safety property should be phrased as reachability prohibition: no state with CURRENT_AUTHORITY for claim C is reachable unless an independent root satisfying the claim-specific root predicate exists.
Implementation correspondence must then refine the abstract variables through an explicit mapping; Lamport's TLA+ material describes refinement mappings as the mechanism for showing that a lower-level specification implements a higher-level specification. citeturn0search25turn0search5

## 16. External architecture cross-check
NIST SP 800-193 separates protection, detection, and recovery mechanisms for platform integrity and treats recovery as a security mechanism rather than assuming that integrity evidence alone establishes current authority. This supports keeping root integrity, detection/evidence, and recovery semantics distinct, although NIST does not define Nexo's proposed graph model. citeturn0search24turn0search1

## 17. Open questions
Q1. How to algorithmically determine whether a root's dependency closure re-enters an SCC under dynamic dependencies?
Q2. How to represent trust/failure-domain independence without pretending it is binary?
Q3. How to compose multiple independent roots without accidentally creating a new circular composition?
Q4. How to handle a root that is independent for one property but dependent for another?
Q5. How to make SCC closure computation itself non-self-supporting?
Q6. How to formalize dynamic root rotation while preserving historical attribution?
Q7. How to prove the implementation's dependency graph faithfully represents the abstract dependency graph?

## 18. Verification boundary
No formal execution. No SANY/TLC/TLAPS result. No implementation refinement result. No runtime/fault-injection/deployment correctness claim.