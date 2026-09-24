# NEXO — Causal Continuity Evidence and Anti-Circularity Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Define the minimum evidence and trust structure required to establish that a successor context is a legitimate continuation of a predecessor without allowing the continuity claim to justify itself.

## 2. Core finding
A continuity claim requires an independent or already-established support basis.

`CONTINUITY_CLAIM != CONTINUITY_PROOF`.
`EVIDENCE_OF_CONTINUITY != AUTHORITY_TO_DECLARE_CONTINUITY`.
`A_SUCCESSOR_CANNOT_PROVE_ITS_OWN_AUTHORITY_BY_ASSUMING_ITS_OWN_CONTINUITY`.

## 3. Anti-circularity rule
For a claim C about successor B being a safe continuation of predecessor A:

The support graph for C must not contain a cycle in which C, or a claim whose validity depends on C, is required to establish C.

Candidate rule:

`SELF_SUPPORTING_CONTINUITY_CYCLE -> DENY`.

If the support graph has an SCC with no independent trusted root capable of establishing the relevant property, the continuity claim is not independently established.

This extends the earlier assurance-root and compaction-circularity research.

## 4. Evidence classes

E0 — IDENTIFIER MATCH
Same ID/name/hash. Useful for lookup only.

E1 — SIGNED ASSERTION
An authenticated actor asserts continuity. Proves authorship of assertion, not truth of continuity.

E2 — PROTECTED STATE TRANSITION
A protected transition records predecessor/successor relation under an established authority.

E3 — CAUSAL BRIDGE EVIDENCE
Evidence binds predecessor and successor through an explicit causal relation and ordering context.

E4 — EXTERNAL RESOURCE ATTESTATION
The resource/provider independently reports the predecessor/successor relation.

E5 — CROSS-DOMAIN CORROBORATION
Independent failure-domain evidence supports the relation.

E6 — VERIFIED CONTINUITY CLAIM
Required evidence and dependency closure have been validated for a specific property.

E7 — CURRENT AUTHORITY CONTINUITY
E6 plus current authority, trust, policy, effect-path, enforcement, resource and invalidation conditions.

No evidence class automatically implies E7.

## 5. Independence is claim-specific
Two records from different services are not automatically independent.

Independence requires analysis of shared:
- hardware
- host/kernel/hypervisor
- runtime
- storage
- network/DNS
- clock
- identity provider
- KMS/trust root
- policy/config
- artifact/update source
- dependency/toolchain
- model/provider
- data
- operator/admin
- observability
- coordination/recovery stores.

This follows the earlier common-mode research: process separation or different models do not automatically create independent assurance.

## 6. Evidence must bind the transition
Candidate `ContinuityEvidenceBinding`:
- source_context_id
- target_context_id
- relation
- property_scope
- source_generation
- target_generation
- authority context
- ordering context
- resource incarnations
- dependency closure
- effect-path closure
- enforcement boundary
- trust context
- transformation/translation context
- invalidation context
- observation context
- freshness/currentness rule.

An unbound statement such as "restored from snapshot X" is insufficient for current authority.

## 7. Causal bridge types and evidence floor

SAME_OBJECT:
Requires protected identity continuity and no relevant incarnation break.

RESTORED_FROM:
Requires snapshot provenance plus current-context revalidation. Never restores authority automatically.

REPLACED_BY:
Requires predecessor cutoff and explicit new incarnation identity. Historical continuity may be established; authority continuity requires new authorization.

RETRIED_AS:
Requires stable EffectIdentity and attempt lineage. Does not restore authority.

REDRIVEN_AS:
Requires provider continuation semantics and current effect-path/enforcement validation.

DELEGATED_FROM:
Requires delegation lineage, attenuation, revocation closure and current parent authority.

ROTATED_FROM:
Requires protected root/key/credential transition and cutoff semantics.

MIGRATED_FROM:
Requires semantic translation/equivalence for the protected property.

RECONCILED_WITH:
Requires reconciliation evidence and resource incarnation binding; reconciliation success is not historical erasure.

UNKNOWN:
No continuity may be inferred.

## 8. Minimal evidence principle
Do not require universal evidence when the claim is narrower, but do not allow weaker evidence to support a stronger claim.

Candidate:

`RequiredEvidence(C) = closure of dependencies necessary to establish property C`.

For example:
- historical attribution may need identity + ordering + evidence;
- current authorization needs authority + policy + invalidation + trust;
- external prevention needs effect-path + enforcement closure;
- world-history claim needs external reconciliation evidence.

## 9. Evidence monotonicity is not guaranteed
More evidence can reveal:
- conflicting generations;
- hidden dependencies;
- stale witnesses;
- resource replacement;
- authority revocation;
- common-mode correlation.

Therefore:

`MORE_EVIDENCE != STRONGER_CLAIM`.

Adding evidence can weaken or invalidate a claim.

## 10. Negative evidence
Absence of an expected event is not automatically evidence that the event did not occur.

Examples:
`NO_TELEMETRY != NO_EFFECT`
`NO_ACK != NO_EXECUTION`
`EMPTY_QUEUE != NO_HISTORICAL_EFFECT`
`NO_CALLBACK != NO_CONTINUATION`.

Negative claims require an enforcement/observation contract capable of supporting the absence claim.

## 11. Evidence freshness
Freshness cannot be reduced to wall-clock age.

Candidate freshness dimensions:
- authority generation
- dependency generation
- effect-path generation
- enforcement generation
- resource incarnation
- trust generation
- policy/invariant generation
- partition/reconciliation generation
- causal position.

Thus:

`FRESH_TIMESTAMP != FRESH_ASSURANCE`.

## 12. Evidence invalidation
A continuity record becomes invalid for a property when a relevant context changes.

Invalidation triggers include:
- authority cutoff;
- policy/invariant change;
- dependency closure change;
- effect-path expansion;
- enforcement boundary change;
- resource replacement;
- root rotation;
- delegation revocation;
- schema/parser/verification profile change;
- partition conflict;
- trust compromise;
- discovery of a previously omitted dependency.

Historical evidence can remain historically valid while becoming unusable for current claims.

## 13. Evidence projection
A continuity claim may be projected from a lower-level fact to a higher-level claim only through an explicit transformation.

Candidate:

`EvidenceProjection(source_claim, target_claim, contract)`.

Projection must define:
- source property;
- target property;
- preserved distinctions;
- loss set;
- unknown propagation;
- assumptions;
- dependency closure;
- non-amplification;
- currentness requirements.

Rule:

`PROJECTION_CANNOT_WIDEN_AUTHORITY`.

This connects directly to the earlier semantic-translation/equivalence research.

## 14. Independent root
Candidate `ContinuityRoot`:
- root type;
- trust anchor;
- ordering anchor;
- dependency closure;
- failure-domain closure;
- semantic scope;
- authority generation;
- invalidations;
- assumptions;
- verification method.

The root must establish the property being used to justify the continuity claim without depending on that same continuity claim.

## 15. Support graph
Model continuity support as a directed graph:

nodes:
- claims
- evidence
- roots
- transitions
- contexts.

edges:
- SUPPORTS
- DERIVED_FROM
- REQUIRES
- INVALIDATES
- TRANSFORMS
- COMPOSES.

For claim C, compute its dependency closure.

Reject:
- self-support;
- unsupported SCC;
- hidden dependency;
- invalidated support;
- support from stale authority;
- support from an incompatible generation;
- support whose scope is narrower than C.

## 16. Counterexample: restore self-authorization
A restored process contains:
`authority = ACTIVE`.

It loads a snapshot certificate saying:
`previous_context = VALID`.

It then uses the snapshot certificate to conclude:
`current_context = VALID`.

This is circular because the restored state is being used to establish the current authority that is needed to trust the restored state as current.

Correct:
RESTORE → quarantine → authenticate current identity → establish current trust/order → reconcile current authority → validate continuity → explicit release.

## 17. Counterexample: provider acceptance
Provider accepts a redrive using an old operation ID.

Naive:
"Provider accepted it, therefore old authority continues."

Correct:
Provider acceptance establishes an external event. It does not retroactively establish Nexo's current authority.

If the provider is the last effect-capable boundary, current prevention may depend on provider-side fencing semantics. Otherwise only a weaker claim is available.

## 18. Counterexample: same key after rotation
Old and new certificates verify under a still-valid cryptographic key.

That does not prove they share the same current authorization context.

Key validity, artifact authenticity, historical participation and current authority remain separate properties.

## 19. Counterexample: two independent-looking witnesses
Witness A and Witness B both report continuity.

If both depend on the same compromised identity provider and same coordination database:

`2 witnesses != 2 independent roots`.

The claim strength must be computed after common-mode closure.

## 20. Temporal evidence chain
Candidate safe sequence:

`SOURCE_CONTEXT_VERIFIED`
→ `TARGET_CONTEXT_VERIFIED`
→ `CAUSAL_BRIDGE_BOUND`
→ `DEPENDENCY_CLOSURE_VERIFIED`
→ `INVALIDATION_CHECKED`
→ `PROPERTY_PRESERVATION_VERIFIED`
→ `CURRENT_CONTEXT_REVALIDATED`
→ `CLAIM_PUBLISHED`.

A failure at any stage yields HOLD, INVALIDATED, UNKNOWN, or QUARANTINED according to the claim contract.

## 21. Formal implication
The future model should represent continuity support as a graph or relation rather than a boolean.

Candidate predicates:
- `CausalBridgeValid(A,B,P)`
- `SupportClosure(C)`
- `IndependentRoot(C)`
- `Current(C)`
- `Compatible(A,B,P)`
- `Invalidated(C)`
- `AuthorityEligible(C)`.

A central invariant is:

`AuthorityEligible(C) => Current(C) / SupportClosureComplete(C) / NoUnsupportedCircularity(C) / ScopeBound(C)`.

The exact formula remains a design candidate and must not be treated as a proven theorem.

Lamport's formal work supports this style: refinement correctness is expressed as an implementation specification implying a higher-level specification under a refinement mapping, while invariants are properties required of every reachable state. citeturn0search25turn0search4

## 22. Candidate invariants
CE-01 CONTINUITY_CLAIM_REQUIRES_EXPLICIT_SUPPORT
CE-02 SELF_SUPPORTING_CONTINUITY_CYCLE_IS_REJECTED
CE-03 UNSUPPORTED_SCC_CANNOT_ESTABLISH_CURRENT_CONTINUITY
CE-04 IDENTIFIER_MATCH_IS_NOT_CAUSAL_PROOF
CE-05 SIGNATURE_VALIDITY_IS_NOT_CONTINUITY_TRUTH
CE-06 HISTORICAL_CONTINUITY_IS_NOT_CURRENT_AUTHORITY
CE-07 RESTORE_CANNOT_SELF_AUTHORIZE_CURRENTNESS
CE-08 RESOURCE_REPLACEMENT_REQUIRES_INCARNATION_AWARE_CONTINUITY
CE-09 EVIDENCE_SCOPE_MUST_COVER_CLAIM_SCOPE
CE-10 EVIDENCE_PROJECTION_CANNOT_WIDEN_AUTHORITY
CE-11 UNKNOWN_CONTINUITY_CANNOT_BE_PROMOTED_TO_CURRENT
CE-12 NEGATIVE_EVIDENCE_REQUIRES_AN_ABSENCE-CAPABLE_CONTRACT
CE-13 FRESHNESS_REQUIRES_RELEVANT_CONTEXT_CURRENTNESS
CE-14 COMMON-MODE_DEPENDENCIES_REDUCE_EFFECTIVE_INDEPENDENCE
CE-15 INVALIDATED_SUPPORT_CANNOT_SUPPORT_CURRENT_CLAIMS
CE-16 MORE_EVIDENCE_MAY_REDUCE_OR_INVALIDATE_CLAIM_STRENGTH
CE-17 CURRENT_AUTHORITY_REQUIRES_CURRENT_SUPPORT
CE-18 CONTINUITY_PROPERTY_SCOPE_MUST_BE_EXPLICIT

## 23. Synthesis
We now have a three-level anti-circularity boundary:

1. Continuity must have a causal bridge.
2. The causal bridge must have a support closure.
3. The support closure must terminate at an independent/previously-established root for the claimed property.

Therefore:

`CURRENTNESS`
cannot be established merely by:
`CURRENTNESS`
or by a chain that eventually assumes the same currentness.

## 24. Open gaps
CR1 Formal graph-theoretic definition of unsupported SCC for assurance.
CR2 Minimal independent root for each continuity property.
CR3 Efficient dynamic support-closure recomputation.
CR4 Interaction between support closure and SafetyClosure fixed point.
CR5 Byzantine witnesses and equivocation in continuity evidence.
CR6 Continuity under simultaneous fork, root rotation and resource replacement.
CR7 Formal negative-evidence contracts.
CR8 Evidence compaction while retaining anti-circularity.
CR9 Implementation refinement from provider APIs to causal bridges.
CR10 SANY/TLC/TLAPS validation.

## 25. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.