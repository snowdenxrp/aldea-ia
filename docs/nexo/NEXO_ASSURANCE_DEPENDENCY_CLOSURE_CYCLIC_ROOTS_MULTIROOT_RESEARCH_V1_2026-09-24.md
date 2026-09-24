# NEXO — Assurance Dependency Closure / Cyclic Roots / Multi-Root Composition Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Unify continuity support, assurance roots, common-mode dependencies, forks, root rotation, Byzantine witnesses, and cyclic support into one protected concept: Assurance Dependency Closure (ADC).

## 2. Core finding
A root is not merely a node labeled "trusted". A root is a bounded support basis for a specific claim.

Therefore:
`ROOT_VALID != ROOT_SUFFICIENT`
`ROOT_SUFFICIENT != ROOT_INDEPENDENT`
`ROOT_INDEPENDENT != ROOT_CURRENT`
`ROOT_CURRENT != AUTHORITY`.

NIST defines roots of trust as highly reliable components performing critical security functions and notes that trust chains can extend from a root into other components; when one device relies on another for security functions, that relationship itself is critical to the trust chain. citeturn0search10turn0search25

## 3. Assurance Dependency Closure
For claim C define:
`ADC(C) =` all claims, evidence, roots, ordering anchors, transformations, dependencies and assumptions required to establish C for its stated property and scope.

The closure must be:
- claim-scoped;
- property-scoped;
- generation-bound;
- dependency-closed;
- invalidation-aware;
- failure-domain-aware;
- causally ordered;
- non-self-supporting.

## 4. Three graphs, not one
Keep distinct:
1. Assurance dependency graph: what supports a claim?
2. Authority dependency graph: what grants/derives authority?
3. Effect dependency graph: what can cause external effects?

They may reference one another, but a derived assurance node must not silently become authority, and an authority node must not redefine its own assurance dependencies.

This preserves the earlier rule:
`ASSURANCE != AUTHORITY != EFFECT`.

## 5. Root classes
R0 — CONSTITUTIONAL_ROOT
Defines the highest-level rules that bound the trust system.

R1 — ORDERING_ROOT
Establishes authoritative order for conflicting protected transitions.

R2 — IDENTITY/TRUST_ROOT
Establishes identity/key/trust relationships.

R3 — ASSURANCE_ROOT
Supports a specific assurance property.

R4 — ENFORCEMENT_ROOT
Supports evidence that the last effect-capable boundary enforces a required condition.

R5 — EXTERNAL_RESOURCE_ROOT
A provider/resource-side source that can establish a bounded external property.

R6 — HUMAN_EMERGENCY_ROOT
Explicitly bounded emergency authority under the constitutional contract; cannot redefine the constitution.

Root purpose must be explicit. A root valid for one property cannot automatically support another.

## 6. Minimal Trust Basis vs Assurance Dependency Closure
MinimalTrustBasis asks:
"What smallest independently anchored set could support this claim?"

ADC asks:
"What entire dependency/support closure is actually required for this particular claim in this particular context?"

First establish sound closure; only then minimize.

`MINIMIZE_BEFORE_SOUND_CLOSURE -> UNSOUND`.

A minimal set that omits a hidden relevant dependency is not a safe trust basis.

## 7. Circular assurance
Construct:
A supports B.
B supports C.
C supports A.

If no external support establishes the relevant property, the cycle cannot bootstrap truth.

Rule:
`UNSUPPORTED_ASSURANCE_SCC -> DENY`.

A cycle can coordinate already-established authority, but it cannot manufacture the authority/assurance property that the cycle is being used to prove.

## 8. Rooted cycles
A cycle may be acceptable if:
- an independent root establishes the boundary;
- the cycle operates inside that bounded envelope;
- composition semantics are explicit;
- no node amplifies the root's scope;
- invalidation propagates through the SCC.

Thus:
`ROOTED_COORDINATION_CYCLE != SELF_AUTHORIZING_CYCLE`.

## 9. SCC collapse
For analysis, a strongly connected component can be collapsed to a meta-node.

But collapse does not make it independent.

Candidate `AssuranceSCC`:
- member nodes;
- internal edges;
- external incoming support;
- external outgoing dependencies;
- property scope;
- generation vector;
- common-mode closure;
- root support;
- invalidations;
- composition contract.

If external support is absent or itself circular, the SCC remains unsupported.

## 10. Multiple roots
Two valid roots do not automatically compose.

`ROOT_A_VALID + ROOT_B_VALID != COMPOSITE_ROOT_VALID`.

Composition requires:
- target claim/effect;
- property;
- scope;
- semantic context;
- generations;
- ordering relation;
- dependency closure;
- failure-domain closure;
- trust relation;
- composition operator;
- invalidation behavior;
- non-amplification.

## 11. Root independence
Independence is claim-specific.

Two roots may be cryptographically separate but share:
- hardware;
- operator;
- IdP;
- KMS;
- root CA;
- policy source;
- CI/update pipeline;
- storage;
- network;
- model/provider;
- recovery system.

Therefore:
`N_ROOTS != N_INDEPENDENT_ROOTS`.

Candidate `RootIndependenceVector` records the relevant failure domains and shared dependencies for the exact claim.

## 12. Byzantine witnesses
A valid signature proves a key produced a signature, not that the signer behaved honestly.

A witness may:
- equivocate;
- sign incompatible successors;
- omit a dependency;
- report different states to different parties;
- be validly authenticated but compromised.

Therefore:
`VALID_SIGNATURE != HONEST_WITNESS`.

Evidence composition must account for equivocation and membership generation.

## 13. Quorum is not automatically independence
`COUNT >= K` is insufficient.

A threshold composition must bind:
- exact target;
- exact property;
- membership generation;
- signer distinctness;
- role requirements;
- transaction/causal context;
- ordering domain;
- trust/root generation;
- revocation state;
- dependency/failure-domain closure.

And:
`QUORUM_COUNT != QUORUM_INTERSECTION != FAILURE_DOMAIN_INDEPENDENCE`.

## 14. Forked assurance
A root or assurance graph can fork:

R → A
R → B

A and B may each be valid under local contexts but disagree.

Merge requires:
- branch identity;
- common predecessor;
- ordering;
- membership/trust generation;
- invalidations;
- dependency closure;
- semantic compatibility;
- explicit merge contract.

`VALID_BRANCH_A + VALID_BRANCH_B != VALID_MERGE`.

## 15. Root rotation
R0 → R1 must be treated as a protected trust transition.

Required conceptual order:
REQUEST
→ NEW_ROOT_AUTHENTICATED
→ NEW_TRUST_CONTEXT_BOUND
→ TRANSITION_PREPARED
→ OLD_ROOT_CUTOFF
→ AFFECTED_DESCENDANT_INVALIDATION
→ ENFORCEMENT_VERIFICATION
→ NEW_ROOT_ACTIVE
→ ASSURANCE_RECOMPUTATION
→ RECONCILIATION
→ OLD_ROOT_DECOMMISSION.

A certificate signed by R0 may remain historically authentic while becoming invalid for current assurance after cutoff.

## 16. Dynamic root discovery
If a new root is discovered dynamically, it must not silently enlarge the trust boundary.

`NEW_ROOT = NEW_TRUST_CONTEXT` until a protected transition proves compatibility/non-amplification.

This is the same structural rule previously found for dynamic trust discovery.

## 17. Assurance support cannot become authority
Suppose ADC proves:
"provider fence is enforced."

That evidence may support a containment/prevention claim.

It does not itself grant permission to perform an effect.

Therefore:
`ASSURANCE_STRENGTH != AUTHORITY_SCOPE`.

The authority plane still requires a current authority transition.

## 18. Authority cannot define its own ADC
Dangerous circular design:
"Authority A decides which dependencies are security-relevant."
Then A excludes itself from the dependency closure.
Then the closure proves A safe.

This is forbidden.

The earlier security-relevance work already established:
`AUTHORITY_UNDER_EVALUATION != SOLE_DEFINITION_OF_ITS_OWN_RELEVANCE_BOUNDARY`.

The ADC boundary must be anchored by constitutional/claim/environment rules outside the evaluated authority.

## 19. Effect-path dependency
If an assurance claim says:
"no forbidden effect can occur after cutoff,"
its ADC must include every relevant effect-capable path and the enforcement boundary.

Thus:
`ADC_{prevention} supseteq RC cup EC cup FC`.

This is not universal set equality; the exact closure remains claim-specific.

## 20. Recovery
Recovery introduces another root-like dependency.

Recovery authority may establish:
"we may reconcile/restore."

It cannot silently establish:
"we may resume normal mission authority."

Therefore:
`RECOVERY_ROOT != MISSION_AUTHORITY_ROOT`.

Recovery needs its own currentness, trust, ordering and dependency closure.

## 21. Human emergency root
Human emergency authorization can be a bounded safety root if explicitly defined.

But:
`HUMAN_EMERGENCY_ROOT != SECOND_CONSTITUTION`.

Emergency authority cannot rewrite the rules that define emergency authority while using those rewritten rules to validate itself.

This preserves the earlier second-constitution attack analysis.

## 22. Common-mode closure
For each ADC, compute shared dependencies across all support nodes.

If:
A and B are "independent" witnesses,
but both depend on D,
then D belongs in ADC.

If D is compromised or UNKNOWN:
the composite assurance must be reduced/invalidated according to the claim contract.

## 23. Claim-specific root basis
For claim C define:
`RootBasis(C)`
as the set of roots and protected boundaries sufficient to establish C.

Do not require every root in the system.

But:
`RootBasis(C)` must be dependency-closed.

Candidate property:
`NO_RELEVANT_UNCLOSED_ROOT_DEPENDENCY`.

## 24. Root substitution
A root may be replaced only through an explicit semantic transition.

Candidate:
`RootSubstitutionClaim(R0,R1,P)`.

Requirements:
- property preservation;
- trust compatibility;
- ordering continuity;
- dependency closure;
- failure-domain analysis;
- invalidation propagation;
- no scope amplification.

A valid R1 cannot be assumed equivalent to R0 merely because both sign the same artifact type.

## 25. Meta-assurance
A certificate can certify the validity of a root composition only if its own support does not depend on the composite root being justified.

Therefore:
`META_ASSURANCE != ASSURANCE_OF_ITS_OWN_SUPPORT`.

The proof support graph must bottom out at a root/assumption that is outside the claim's self-justifying cycle.

## 26. Formal model implication
The future TLA+ model should explicitly model:
- assurance graph;
- authority graph;
- effect graph;
- root membership/generation;
- dependency closure;
- SCCs;
- common-mode dependencies;
- fork/merge;
- root rotation;
- Byzantine equivocation;
- invalidation.

Candidate safety properties should forbid publication of current authority when the required ADC contains an unsupported/circular component.

Lamport's current material emphasizes that model checking tests properties over the behaviors represented by the model, while refinement proofs establish that a lower-level specification implements a higher-level one under an explicit mapping. This supports keeping ADC as an explicit modeled structure rather than treating it as an informal metadata field. citeturn0search5turn0search24

## 27. Candidate invariants
ADC-01 ASSURANCE_DEPENDENCY_CLOSURE_IS_CLAIM_SCOPED
ADC-02 ADC_MUST_BE_DEPENDENCY_CLOSED
ADC-03 UNSUPPORTED_ASSURANCE_SCC_CANNOT_ESTABLISH_CURRENT_CLAIM
ADC-04 ROOTED_CYCLE_CANNOT_AMPLIFY_ROOT_AUTHORITY
ADC-05 ROOT_VALIDITY_DOES_NOT_IMPLY_ROOT_SUFFICIENCY
ADC-06 ROOT_SUFFICIENCY_DOES_NOT_IMPLY_ROOT_INDEPENDENCE
ADC-07 ROOT_INDEPENDENCE_DOES_NOT_IMPLY_ROOT_CURRENTNESS
ADC-08 ROOT_CURRENTNESS_DOES_NOT_IMPLY_MISSION_AUTHORITY
ADC-09 MULTIPLE_ROOTS_REQUIRE_EXPLICIT_COMPOSITION
ADC-10 QUORUM_COUNT_DOES_NOT_ESTABLISH_INDEPENDENCE
ADC-11 VALID_SIGNATURE_DOES_NOT_ESTABLISH_HONEST_WITNESS
ADC-12 COMMON_MODE_DEPENDENCIES_ARE_PART_OF_ADC
ADC-13 ROOT_ROTATION_INVALIDATES_AFFECTED_CURRENT_ASSURANCE
ADC-14 DYNAMIC_ROOT_DISCOVERY_CANNOT_SILENTLY_WIDEN_TRUST
ADC-15 ASSURANCE_CANNOT_GRANT_AUTHORITY
ADC-16 AUTHORITY_CANNOT_SOLELY_DEFINE_ITS_OWN_ADC
ADC-17 EFFECT_PREVENTION_ADC_MUST_COVER_REQUIRED_EFFECT_AND_ENFORCEMENT_BOUNDARIES
ADC-18 RECOVERY_ROOT_CANNOT_SILENTLY_BECOME_MISSION_AUTHORITY
ADC-19 HUMAN_EMERGENCY_ROOT_CANNOT_REDEFINE_CONSTITUTION
ADC-20 META_ASSURANCE_CANNOT_SELF_JUSTIFY_ITS_SUPPORT
ADC-21 ROOT_SUBSTITUTION_REQUIRES_PROTECTED_COMPATIBILITY
ADC-22 FORKED_ROOTS_REQUIRE_ORDERED_MERGE_OR_QUARANTINE
ADC-23 INVALIDATED_SUPPORT_CANNOT_SUPPORT_CURRENT_CLAIMS
ADC-24 CLAIM_SCOPE_CANNOT_EXCEED_VERIFIED_ADC_SCOPE

## 28. New synthesis
We now have a stronger assurance hierarchy:

CONSTITUTIONAL BOUNDARY
→ ROOT / ORDERING BASIS
→ ASSURANCE DEPENDENCY CLOSURE
→ CLAIM-SPECIFIC ASSURANCE
→ CURRENTNESS
→ AUTHORITY
→ EFFECT
→ EXTERNAL WORLD.

Each arrow is a contract, not an automatic implication.

## 29. Open gaps
AD1 Formal ADC closure algorithm with dynamic dependencies.
AD2 Formal SCC support theorem and rooted-cycle conditions.
AD3 MinimalTrustBasis versus ADC relationship.
AD4 Byzantine witness/equivocation model inside ADC.
AD5 Multi-root composition algebra and non-amplification.
AD6 Root substitution under partial failure.
AD7 Dynamic root discovery in open-world environments.
AD8 ADC under compaction without losing anti-circularity.
AD9 Refinement mapping from implementation dependency discovery to abstract ADC.
AD10 Full SANY/TLC/TLAPS validation.

## 30. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.