# NEXO — Retention Fixed Point, Monotonicity, Cycles and Non-Termination Research V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Objective
Determine when joint claim retention closure can converge to a stable fixed point, when cycles are harmless, when cycles force retention expansion, and when dynamic/open-world dependency discovery prevents a strong fixed-point claim.

## 1. External cross-check
NIST's 2025 Evidence Management Steering Committee report explicitly addresses retention, preservation, integrity and disposition of evidence; NIST's digital-evidence preservation guidance also notes long-term provider/format/transition concerns. This supports treating retention state as a lifecycle with explicit preservation and transition obligations rather than ordinary storage cleanup. citeturn0search0turn0search24
Lamport's TLA+ material states that specifications are state machines and that TLC is generally run on finite-state models; his auxiliary-variable work explains that history variables can preserve past behavior needed for refinement mappings. This supports using a finite abstraction for checking a retention closure while keeping the distinction between the abstraction and the unbounded real system. citeturn0search12turn0search25

## 2. Closure as an operator
Let F(C,R,E) be the closure operator over claims C, retained information R and environment/dependency context E.
A safe fixed point requires:
`F(X) = X`.
But a syntactic fixed point is not enough: the closure must also be sound for the claim set.
Candidate states:
- FIXED_POINT_VERIFIED
- FIXED_POINT_WITH_BOUNDED_UNKNOWN
- NON_CONVERGENT
- OPEN_WORLD_UNKNOWN.

## 3. Monotonicity
A closure operator is useful if adding recognized security-relevant obligations cannot remove previously required distinctions.
Candidate monotonicity:
`X ⊆ Y => F(X) ⊆ F(Y)` for the relevant semantic ordering.
This is a design target, not yet a theorem.
If adding a claim makes an earlier retained distinction disappear, the operator is not monotone under that ordering and the abstraction needs redesign.

## 4. Inflationary closure
Another desirable property:
`X ⊆ F(X)`.
Closure should add recognized requirements rather than silently discard them.
An implementation may later compact equivalent information, but semantic support cannot be silently reduced during closure computation.

## 5. Idempotence
At a true fixed point:
`F(F(X)) = F(X)`.
If a second closure pass discovers new requirements that the first pass missed, the first result was not a fixed point.
This is especially important when dependency discovery, effect-path closure and claim activation interact.

## 6. Cyclic claims
Example:
`P1 requires H2`.
`P2 requires H1`.
`H1 is needed to establish the relation used by P1`.
`H2 is needed to establish the relation used by P2`.
This is not automatically circularly unsound. The key question is whether the support graph has an independent root and whether each dependency is justified without relying on the claim being established.

## 7. Unsupported SCC
An SCC in the claim/support graph with no external support boundary is dangerous:
`CLAIM → SUPPORT → CLAIM`.
If the only justification for the SCC is internal to the SCC, the support is circular and must not create assurance.
Candidate rule:
`UNSUPPORTED_SCC → DENY/HOLD`.

## 8. Rooted cycles
A cycle may be acceptable for coordination if an external trusted root bounds it.
Example:
`P1 ↔ P2`, both governed by an independently established constitutional/ordering root.
The root does not prove the claims directly; it bounds the transition semantics and prevents the cycle from self-authorizing.
`ROOTED_COORDINATION_CYCLE != SELF_SUPPORTING_ASSURANCE_CYCLE`.

## 9. Claim-dependency versus evidence-dependency cycles
A cycle in claims is not identical to a cycle in evidence.
We must distinguish:
- claim dependency graph;
- evidence support graph;
- authority dependency graph;
- effect dependency graph;
- retention dependency graph.
An SCC analysis must not collapse these graphs into one undifferentiated graph.

## 10. Cross-graph closure
A claim may require evidence, which requires a retained artifact, whose integrity depends on a trust root, while an external-effect claim also requires an enforcement boundary.
Therefore joint closure is a product of several typed closures, not one generic graph traversal.
Candidate:
`JointSafetyRetentionClosure = RC ∪ ADC ∪ EC ∪ FC ∪ RecoveryRetention ∪ ClaimRelations` with explicit typed edges and composition semantics.

## 11. Monotone growth versus semantic compression
Raw closure may grow monotonically while the physical representation shrinks through a verified abstraction.
This resolves an apparent contradiction:
`SEMANTIC_CLOSURE_GROWS` while `STORAGE_BYTES_SHRINK`.
The abstraction must preserve the closure-relevant distinctions even when raw events are reclaimed.

## 12. Cyclic minimization trap
Suppose P1 and P2 each appear to need only a summary of H, but each summary assumes the other summary preserves a relation.
Independent minimization can produce:
`S1 valid only if S2 retains relation R`.
`S2 valid only if S1 retains relation R`.
If R is not independently preserved, the pair forms an unsupported assurance cycle.
Therefore joint minimization must verify the support graph after composition.

## 13. Fixed-point algorithm shape
Candidate conceptual algorithm:
`INITIALIZE recognized claims and contractual latent obligations`
`→ compute claim relations`
`→ compute required distinctions`
`→ expand relevance/dependency closure`
`→ expand effect/enforcement/recovery closure where applicable`
`→ detect SCCs and common-mode dependencies`
`→ classify unsupported cycles`
`→ build a sufficient semantic representation`
`→ recompute support closure over that representation`
`→ repeat until semantic fixed point or bounded unknown`.
This is an architecture research shape, not an implementation prescription.

## 14. Termination problem
An open-world environment can continually reveal new dependencies.
Then no global fixed point may exist.
Examples: provider discovers new callback path, resource is replaced, recovery creates a new effect, new membership appears, policy changes, root rotates.
In such a world the correct state is not false convergence; it is a bounded claim with explicit environment assumptions or UNKNOWN.

## 15. Bounded fixed point
A practical strong claim may define a boundary:
`EFFECT_BOUNDARY`, `ENVIRONMENT_CONTRACT`, `TIME_INTERVAL`, `RESOURCE_SET`, `PROVIDER_CONTRACT`.
Within that boundary, a fixed point may be achievable even if the whole universe is open.
`GLOBAL_FIXED_POINT_UNKNOWN` does not imply `BOUNDARY_FIXED_POINT_UNKNOWN`.

## 16. Environment changes
A previously verified fixed point is invalidated if a change crosses the closure boundary.
Relevant changes include:
- new effect path;
- new dependency;
- resource incarnation;
- policy/invariant generation;
- root/trust generation;
- membership/quorum generation;
- enforcement boundary;
- recovery obligation;
- recognized new claim.

## 17. Retention epoch
Candidate `RetentionEpoch` should identify the context under which the retention closure was computed.
It should bind at least claim set, policy/invariant, trust/order, dependency/effect/enforcement closure, resource incarnations, latent obligations and environment boundary.
Old retention workers must not publish decisions under a newer epoch.

## 18. Closure widening
If a new dependency is discovered, closure may widen.
Widening is itself a protected semantic transition when it affects safety claims.
Old minimality is not silently preserved:
`OLD_MINIMALITY + NEW_RELEVANT_DEPENDENCY != CURRENT_MINIMALITY`.

## 19. Closure shrinking
Closure may shrink only after a protected fact establishes that a dependency/obligation no longer affects the claim within the defined boundary.
Administrative disappearance, timeout, or lack of telemetry is not enough.
`NO_OBSERVED_DEPENDENCY != PROVEN_NO_DEPENDENCY`.

## 20. Claim deletion
When a claim expires, the closure can potentially shrink, but only after checking latent/recovery/policy obligations and whether other claims consume the same support.
Claim deletion is therefore a closure event, not merely a database deletion.

## 21. Non-convergence handling
Candidate outcomes:
- `FIXED_POINT_VERIFIED`: strong claim may proceed.
- `FIXED_POINT_WITH_BOUNDED_UNKNOWN`: only claims compatible with the unknown boundary may proceed.
- `NON_CONVERGENT`: no strong minimization claim.
- `OPEN_WORLD_UNKNOWN`: require explicit boundary, weaker claim or quarantine.

## 22. Relationship to TLA+ checking
A future finite model can encode bounded claim sets, dependency graphs, SCCs, epochs and reclamation transitions and check candidate invariants.
But TLC checking a finite abstraction cannot establish arbitrary unbounded real-world convergence or completeness.
Refinement must show that the finite/abstract representation preserves the relevant safety property of the implementation model. citeturn0search12turn0search25

## 23. Candidate invariants
JF-01 CLOSURE_IS_TYPED_AND_CLAIM_SCOPED
JF-02 CLOSURE_IS_INFLATIONARY_UNDER_SEMANTIC_ORDER
JF-03 CLOSURE_IS_MONOTONE_WHEN_NEW_OBLIGATIONS_ARE_ADDED
JF-04 VERIFIED_FIXED_POINT_IS_IDEMPOTENT
JF-05 UNSUPPORTED_ASSURANCE_SCC_CANNOT_CREATE_CLAIM
JF-06 ROOTED_COORDINATION_CYCLE_CANNOT_AMPLIFY_AUTHORITY
JF-07 CLAIM_EVIDENCE_AUTHORITY_EFFECT_RETENTION_GRAPHS_REMAIN_TYPED
JF-08 SEMANTIC_CLOSURE_MAY_GROW_WHILE_PHYSICAL_STORAGE_SHRINKS_ONLY_WITH_VERIFIED_ABSTRACTION
JF-09 JOINT_MINIMIZATION_MUST_RECHECK_COMPOSITE_SUPPORT
JF-10 OPEN_WORLD_NONCONVERGENCE_CANNOT_BE_PUBLISHED_AS_GLOBAL_FIXED_POINT
JF-11 BOUNDED_FIXED_POINT_REQUIRES_EXPLICIT_ENVIRONMENT_BOUNDARY
JF-12 RELEVANT_ENVIRONMENT_CHANGE_INVALIDATES_AFFECTED_RETENTION_EPOCH
JF-13 CLOSURE_WIDENING_CANNOT_REUSE_OLD_MINIMALITY_WITHOUT_REVALIDATION
JF-14 CLOSURE_SHRINKING_REQUIRES_PROTECTED_NEGATIVE_EVIDENCE_OR_BOUNDARY_CHANGE
JF-15 CLAIM_EXPIRATION_REQUIRES_LATENT_AND_SHARED_CONSUMER_RECHECK
JF-16 NON_CONVERGENCE_REQUIRES_WEAKER_CLAIM_OR_HOLD_QUARANTINE
JF-17 RETENTION_EPOCH_MUST_BIND_ALL_SECURITY_RELEVANT_CONTEXT
JF-18 TLC_FINITE_MODEL_RESULTS_MUST_NOT_BE_PRESENTED_AS_UNBOUNDED_REAL-WORLD_PROOF.

## 24. Open gaps
JF-G1 Formal semantic lattice/order for retention representations.
JF-G2 Proof of monotonicity under typed closure composition.
JF-G3 Fixed-point existence conditions.
JF-G4 Termination/boundedness conditions.
JF-G5 Formal SCC semantics across multiple dependency graphs.
JF-G6 Rooted-cycle non-amplification proof.
JF-G7 Dynamic open-world boundary semantics.
JF-G8 Joint minimization with multiple incomparable bases.
JF-G9 Formal TLA+/TLC/TLAPS model and refinement.
JF-G10 Implementation/storage refinement and fault injection.

## Verification boundary
No formal execution performed. No implementation correctness claim. No runtime or deployment correctness claim.