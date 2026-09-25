# NEXO — Closure Dependency Graph, Hyperedges and Safe Composition Research V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Objective
Refine typed closure composition into a graph/hypergraph model that can represent relations involving several closure dimensions at once, detect hidden cross-domain dependencies, and define when a composed closure is safe to publish.

## External cross-check
Lamport's refinement material defines implementation through an explicit refinement mapping between specifications, and his auxiliary-variable work shows that additional history information may be introduced to construct such a mapping. This supports modeling closure context as an abstract semantic object rather than equating it with raw implementation storage. citeturn0search24turn0search0
NIST's 2025 evidence-management report treats retention, preservation, integrity and disposition as separate lifecycle concerns, while NISTIR 8387 discusses the distinctive preservation problems of digital evidence. This reinforces that closure/reclamation must preserve integrity and provenance under an explicit lifecycle context. citeturn0search1turn0search5

## 1. Central finding
Ordinary graph edges are insufficient for some Nexo closure relationships.
A single dependency may simultaneously connect:
- a claim;
- an assurance proof;
- an effect path;
- an enforcement boundary;
- a resource incarnation;
- a retention obligation;
- a trust root.
This is naturally represented as a typed hyperedge rather than unrelated pairwise edges.

## 2. Candidate `SafetyClosureHypergraph`
Nodes may include:
- Claim;
- RequiredDistinction;
- Dependency;
- Evidence;
- AuthorityContext;
- OrderingContext;
- EffectPath;
- EnforcementBoundary;
- ResourceIncarnation;
- RetentionArtifact;
- LatentClaim;
- TrustRoot;
- Policy/Invariant;
- ProofContext;
- EnvironmentBoundary.
Hyperedges are typed relations such as REQUIRES, SUPPORTS, INVALIDATES, TRANSFORMS, BOUNDS, ENFORCES, RETAINS, CONSUMES, REPLACES, COMPOSES, and CAUSALLY_PRECEDES.

## 3. Why pairwise closure can be unsound
Suppose a claim requires a relation involving:
`effect E + resource incarnation R + authority epoch A + provider contract P`.
Four pairwise facts may all be true while the four-way relation is false.
`PAIRWISE_VALIDITY != JOINT_RELATIONAL_VALIDITY`.
Therefore composition must preserve hyperedge semantics where the security property depends on the combination.

## 4. Closure component as a projection
RC, ADC, EC, FC and retention can be treated as projections of a larger typed safety hypergraph.
Projection is safe only if the omitted hyperedges cannot change the property being claimed.
`LOCAL_PROJECTION_VALID != GLOBAL_CLOSURE_VALID`.
This connects directly to earlier abstraction-soundness and hidden-hyperedge research.

## 5. Projection boundary
Candidate `ClosureProjectionContract` binds:
- source hypergraph context;
- target closure type;
- omitted node/edge classes;
- security properties preserved;
- loss/unknown set;
- environment boundary;
- dependency closure;
- verification method;
- invalidation triggers.
A projection cannot silently widen authority or claim scope.

## 6. Cross-closure hyperedges
Examples:
`Claim → EffectPath → EnforcementBoundary`
means the claim's effect-prevention property depends jointly on the path and its last enforcement boundary.
`Claim → Evidence → TrustRoot → OrderingContext`
means assurance depends on all four contexts.
`RecoveryObligation → RetainedArtifact → ResourceIncarnation → EffectHistory`
means reclamation must preserve a specific historical relation.

## 7. Safe composition criterion
A composed closure is publishable only if every security-relevant hyperedge needed for the claim is either:
1. represented explicitly in the retained closure;
2. preserved by a verified abstraction/refinement relation;
3. excluded by a verified environment boundary that makes it irrelevant to the claim.
Otherwise the result is UNKNOWN or a weaker claim.

## 8. Hidden hyperedge attack
An attacker or modeling error can omit a relation that is not visible in pairwise closure results.
Example:
R1, A1 and P1 are each individually compatible with E, but only the tuple `(E,R1,A1,P1)` is valid. A hidden substitution of R2 can preserve every pairwise check while violating the joint contract.
This is another reason `PAIRWISE_COMPATIBLE != SETWISE/JOINED COMPATIBLE`.

## 9. Closure certificates
Candidate `ClosureCompositionCertificate` contains:
- claim/property;
- source closure components;
- hypergraph scope;
- composition contract;
- required hyperedges;
- preserved hyperedges;
- omitted/unknown hyperedges;
- dependency/common-mode closure;
- temporal/causal bridge;
- authority/order/trust context;
- resource incarnations;
- invalidation/currentness;
- resulting claim scope;
- verification method.

## 10. Hypergraph fixed point
The fixed-point process becomes:
`K0 → expand typed nodes → expand required hyperedges → recompute projections → detect new dependencies → update K → repeat`.
Convergence means semantic equivalence of the resulting context, not merely equal node counts.
`SAME_NODE_SET != SAME_CLOSURE_SEMANTICS`.

## 11. Hyperedge monotonicity
Adding a security-relevant hyperedge should not silently reduce the required closure under the semantic ordering.
However, a newly discovered relation may invalidate a prior claim or shrink its publishable scope.
Therefore monotonicity applies to the discovered support structure, not necessarily to claim strength.

## 12. Safe non-monotone publication
Example:
Before discovery: strong claim C0 is published.
New dependency discovered: closure expands and enforcement is unresolved.
Safe result:
`C0 → C1 weaker claim` or `C0 → UNKNOWN/HOLD`.
Unsafe result:
retain C0 because the new dependency is inconvenient.

## 13. Hyperedge and common-mode closure
Two apparently separate roots can share one hidden hyperedge through a common trust root, policy source, artifact pipeline, operator, clock, recovery system or observability channel.
Independence must therefore be evaluated on the composed hypergraph, not by counting nodes.
`N_ROOTS != N_INDEPENDENT_ROOTS`.

## 14. Hyperedge and retention
A retention artifact may preserve all individual IDs but lose the relation among them.
That can destroy the claim.
`IDENTITY_RETENTION != RELATION_RETENTION`.
Therefore summaries must preserve security-relevant relations, not merely object identifiers.

## 15. Hyperedge and compaction
Compaction can safely replace a large subgraph with a certificate only if the certificate preserves every claim-relevant hyperedge in the contracted subgraph.
Candidate `HypergraphContractionCertificate` binds the contracted region, boundary, preserved properties, internal dependencies, residual edges, loss/unknown set and independent support.

## 16. Hyperedge and resource replacement
Same provider ID does not imply same resource incarnation.
A historical effect relation may therefore require a hyperedge containing:
`EffectIdentity + ProviderExecution + ResourceIncarnation + AuthorityContext + CausalContext`.
Removing any component can make the historical relation ambiguous.

## 17. Hyperedge and recovery
Recovery should recompute the relevant hypergraph from current authority/order/trust context plus retained history.
Snapshot restoration must not simply restore an old closure graph and publish it as current.
`RESTORED_CLOSURE != CURRENT_CLOSURE`.

## 18. Hyperedge and formal refinement
Future TLA+ abstraction should expose only the hyperedges needed by the abstract claim while using auxiliary/history variables to establish the refinement mapping from implementation behavior.
Lamport explicitly describes refinement mappings in terms of defining higher-level variables from lower-level variables and shows that auxiliary variables can be introduced to make such mappings possible. citeturn0search24turn0search0

## 19. Candidate safety property
Candidate:
`PublishedClaim(P) => RequiredHyperedgeClosure(P) is verified, current, context-compatible, non-circular, dependency-closed, and within the verified environment/enforcement boundary.`
This is a target property, not a formal proof.

## 20. Candidate invariants
HG-01 CLOSURE_RELATIONS_ARE_TYPED
HG-02 SECURITY_RELEVANT_MULTIWAY_RELATIONS_ARE_HYPEREDGES_OR_SOUNDLY_ABSTRACTED
HG-03 PAIRWISE_VALIDITY_CANNOT_SUBSTITUTE_FOR_REQUIRED_JOINT_RELATIONAL_VALIDITY
HG-04 PROJECTION_CANNOT_WIDEN_CLAIM_SCOPE
HG-05 OMITTED_HYPEREDGES_REQUIRE_EXPLICIT_IRRELEVANCE_OR_BOUNDARY_PROOF
HG-06 NEW_SECURITY_RELEVANT_HYPEREDGE_INVALIDATES_AFFECTED_CLOSURE_UNTIL_REVALIDATED
HG-07 CLAIM_DEGRADATION_MAY_RESULT_FROM_CLOSURE_EXPANSION
HG-08 HYPERGRAPH_INDEPENDENCE_REQUIRES_COMMON_MODE_CLOSURE
HG-09 RETENTION_MUST_PRESERVE_REQUIRED_RELATIONS_NOT_ONLY_IDENTITIES
HG-10 COMPACTION_REQUIRES_SOUND_HYPERGRAPH_CONTRACTION
HG-11 RESOURCE_INCARNATION_IS_PART_OF_RELEVANT_EFFECT RELATIONS
HG-12 RECOVERY_MUST_RECOMPUTE_CURRENT_RELEVANT_CLOSURE
HG-13 RESTORED_CLOSURE_CANNOT_AUTOMATICALLY_BE_CURRENT
HG-14 CLOSURE_CERTIFICATES_CANNOT_SELF-JUSTIFY_REQUIRED_SUPPORT
HG-15 PUBLISHED_SCOPE_MUST_NOT_EXCEED_VERIFIED_HYPEREDGE_CLOSURE.

## 21. Open gaps
HG-G1 Formal typed hypergraph semantics.
HG-G2 Hyperedge-to-TLA+ representation.
HG-G3 Sound projection criteria.
HG-G4 Hypergraph contraction/refinement proof.
HG-G5 Efficient fixed-point computation.
HG-G6 Dynamic hyperedge discovery.
HG-G7 Common-mode hyperedge inference.
HG-G8 Formal non-amplification under contraction.
HG-G9 SANY/TLC/TLAPS model.
HG-G10 Implementation refinement and fault injection.

## Verification boundary
No formal execution performed. No implementation correctness claim. No runtime or deployment correctness claim.