# NEXO — Joint Claim Retention, Claim Debt and Fixed-Point Reclamation Research V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Objective
Study what happens when several claims share retention dependencies, when minimizing one claim can damage another, and when claims can appear dynamically after compaction. The goal is a joint retention closure rather than independent per-claim minimization.

## Web cross-check
NIST's evidence-management work treats retention, preservation, integrity and disposition as explicit evidence-management concerns, while its digital-evidence preservation guidance highlights the special preservation problems of digital objects. This supports treating reclamation as a controlled lifecycle transition rather than ordinary garbage collection. citeturn0search8turn0search13
Lamport and Merz describe history variables as a way to retain past behavior needed for refinement, and Lamport's data-refinement material shows how a lower-level representation can implement a higher-level abstraction. This supports the distinction between raw implementation history and a jointly sufficient abstract history. citeturn0search24turn0search12

## 1. Independent minimization is not enough
For claims P1 and P2:
`MIN(P1) + MIN(P2)` is not automatically sufficient for `P1 AND P2`.
The missing element can be a relation connecting the two claims: common transaction, causal branch, authority generation, resource incarnation, ordering domain, policy generation, or shared dependency.

## 2. Joint Claim Dependency Closure
Candidate `JointClaimDependencyClosure` contains:
- active claims;
- recognized latent/recovery claims;
- required distinctions for each claim;
- cross-claim relations;
- shared dependencies;
- common-mode/failure-domain closure;
- effect-path/enforcement closure where relevant;
- temporal intervals and causal bridges;
- current policy/invariant/root/membership context;
- retention obligations;
- invalidation triggers.

Candidate rule:
`JOINT_CLOSURE = FIXED_POINT(UNION(INDIVIDUAL_CLAIM_CLOSURES, CROSS_CLAIM_RELATIONS, LATENT_OBLIGATIONS))`.
This is a research formulation, not yet a proven algorithm.

## 3. Claim debt
Candidate `ClaimDebt` means a recognized future or recovery-relevant claim whose supporting distinctions are not currently needed by an active claim but are contractually recognized as potentially required.
`NO_CURRENT_CLAIM != NO_RELEVANT_FUTURE_CLAIM`.
A reclamation transition must account for claim debt before deleting information.

## 4. Latent claims
Candidate `LatentClaimRegistry` records obligations that can become active later, such as:
- recovery after a crash;
- post-incident forensic attribution;
- dispute resolution;
- reconciliation of an unresolved external effect;
- root/membership succession review;
- policy/invariant rollback analysis;
- legal/privacy retention obligations where explicitly applicable.
Latent does not mean every imaginable future claim must be retained forever. The registry itself must be bounded by an explicit contract.

## 5. Avoiding infinite retention
An unrestricted claim-debt concept would make reclamation impossible.
Therefore latent retention must itself have:
- scope;
- property set;
- temporal horizon or event boundary;
- responsible authority;
- dependency closure;
- invalidation rules;
- review/expiry;
- explicit release condition.
`LATENT_OBLIGATION != UNIVERSAL_FUTURE_POSSIBILITY`.

## 6. Fixed-point reclamation
Proposed reasoning loop:
`ACTIVE CLAIMS → LATENT CLAIMS → REQUIRED DISTINCTIONS → SHARED RELATIONS → DEPENDENCY CLOSURE → RETENTION BASIS → POSSIBLE RECLAMATION → NEW CLAIM/RECOVERY CONSEQUENCES → RECOMPUTE`.
Stop only when the closure reaches a fixed point or an explicitly bounded unknown state.

## 7. Reclamation race with claim activation
Three cases:
1. Claim activation is ordered before reclamation cutoff → retention must include it.
2. Reclamation is ordered before claim activation and the claim was outside the recognized retention contract → the new claim may remain unsupported/UNKNOWN; reclamation is not retroactively undone.
3. Ordering is unknown → HOLD/QUARANTINE.
This preserves the earlier distinction between control order, propagation order and world order.

## 8. Shared evidence creates coupling
Suppose P1 and P2 both depend on H.
If H is compacted independently for P1, the resulting summary may destroy a relation required by P2.
Therefore every retention object needs an explicit `Consumers`/`ClaimSet` relation, or an equivalent dependency index, so deletion is evaluated against all recognized consumers.

## 9. Claim-specific summaries
A summary S can be sufficient for P1 while being insufficient for P2.
That does not make S invalid.
It means S has a property-scoped support contract.
`S_SUPPORTS(P1) != S_SUPPORTS(P2)`.

## 10. Composite summary
A summary intended to support multiple claims needs a joint preservation certificate.
Candidate `JointRetentionCertificate` binds:
- claim set;
- joint required distinctions;
- cross-claim relations;
- retained representation;
- loss/unknown set;
- support graph;
- environment boundary;
- generation/currentness;
- invalidation triggers;
- reclamation boundary.

## 11. Claim removal
When P1 expires, evidence used only by P1 may become reclaimable, but only after checking:
`ACTIVE_CLAIMS ∪ LATENT_CLAIMS ∪ RECOVERY_OBLIGATIONS ∪ RETENTION_POLICY_REQUIREMENTS`.
Claim expiration therefore does not imply immediate physical deletion.

## 12. Claim migration
If P1 is replaced by P1' with different semantics, the retention basis must be recomputed.
`SEMANTICALLY_RENAMED_CLAIM != SAME_CLAIM`.
Changing the wording, schema, policy or proof obligation can change required distinctions.

## 13. Proof cache interaction
A cached proof for P cannot serve as a retention basis merely because it was once valid.
The cache must bind to the retained representation and current proof context.
If the proof context depends on reclaimed history, the proof becomes stale or unverifiable.

## 14. Recovery as a latent consumer
Recovery is not merely another operational process. It can require historical distinctions that normal operation does not.
Examples: predecessor cutoff, stale authority, unresolved external effects, resource incarnation, reconciliation lineage, root transition and branch provenance.
Therefore recovery obligations belong in the joint retention closure.

## 15. External effects as latent consumers
An unresolved external effect may require history after the original mission claim appears finished.
`MISSION_FINISHED != ALL_HISTORICAL_EFFECT_OBLIGATIONS_CLOSED`.
Retention must not erase the identity/lineage needed to reconcile such effects.

## 16. Common-mode and independence obligations
If a claim requires independent corroboration, retaining multiple records from one common source does not satisfy the requirement.
Joint retention therefore includes the support graph and common-mode closure, not merely the count of retained records.
`MORE_RECORDS != MORE_INDEPENDENCE`.

## 17. Dynamic dependency discovery
If a new security-relevant dependency is discovered, every affected retention certificate must be re-evaluated.
A previously minimal basis can become insufficient without any change to the retained bytes.
This is why retention currentness must be context-bound.

## 18. Safe outcomes
A reclamation analysis can yield:
- RETAIN;
- COMPACT_WITH_SAME_CLAIM;
- COMPACT_WITH_WEAKER_CLAIM;
- HISTORICAL_ATTRIBUTION_ONLY;
- UNKNOWN/INSUFFICIENT;
- QUARANTINE.
It must never silently convert unsupported history into a stronger claim.

## 19. Candidate protected transition
`REQUEST_RECLAMATION → FREEZE_INTERSECTING_CLAIMS → COMPUTE_JOINT_CLOSURE → INCLUDE_CLAIM_DEBT → COMPUTE_REQUIRED_DISTINCTIONS → BUILD_ABSTRACTION → VERIFY_SUPPORT_AND_NONCIRCULARITY → COMMIT_SUMMARY → COMMIT_RECLAMATION_AUTHORIZATION → RECLAIM → VERIFY_ALL_RETAINED_CLAIMS → PUBLISH`.
Any relevant context change invalidates the pending transition.

## 20. Fixed-point safety rule
Candidate property:
`PUBLISHED_CLAIMS ⊆ CLAIMS_SUPPORTED_BY_VERIFIED_RETAINED_CLOSURE`.
More strongly, for a joint claim set C:
`C_PUBLISHED ⊆ ClaimsSupported(FixedPointRetentionClosure(C, latent_obligations, environment))`.
This is a candidate formal target, not a proven theorem.

## 21. Relation to TLA+
Lamport's history-variable approach provides a useful formal analogue: the specification may carry abstract historical information needed to establish a higher-level property even when the implementation need not retain every raw event. The Nexo challenge is to define the abstraction boundary and show that it preserves the exact joint claims. citeturn0search24turn0search0

## 22. Candidate invariants
JR-01 INDEPENDENT_MINIMIZATION_MUST_NOT_BYPASS_JOINT_CLAIM_CLOSURE
JR-02 JOINT_CLOSURE_INCLUDES_CROSS_CLAIM_RELATIONS
JR-03 LATENT_CLAIMS_ARE_BOUNDED_CONTRACTUAL_OBLIGATIONS
JR-04 LATENT_OBLIGATION_IS_NOT_UNIVERSAL_FUTURE_POSSIBILITY
JR-05 CLAIM_ACTIVATION_AND_RECLAMATION_REQUIRE_AUTHORITATIVE_ORDER
JR-06 UNKNOWN_ORDER_REQUIRES_HOLD_OR_QUARANTINE
JR-07 SHARED_EVIDENCE_MUST_TRACK_ALL_RECOGNIZED_CONSUMERS
JR-08 SUMMARY_SUPPORT_IS_PROPERTY_AND_CLAIM_SET_SPECIFIC
JR-09 CLAIM_EXPIRATION_DOES_NOT_IMPLY_IMMEDIATE_RECLAMATION
JR-10 CLAIM_SEMANTIC_CHANGE_REQUIRES_RECOMPUTATION
JR-11 PROOF_CACHE_CANNOT_REPLACE_RETAINED_PROOF_CONTEXT
JR-12 RECOVERY_OBLIGATIONS_ARE_RETENTION_CONSUMERS
JR-13 UNRESOLVED_EXTERNAL_EFFECTS_ARE_RETENTION_CONSUMERS
JR-14 INDEPENDENCE_REQUIRES_FAILURE_DOMAIN_CLOSURE
JR-15 NEW_SECURITY_RELEVANT_DEPENDENCY_INVALIDATES_AFFECTED_MINIMALITY
JR-16 INFORMATION_LOSS_CANNOT_STRENGTHEN_ANY_JOINT_CLAIM
JR-17 RECLAMATION_MUST_VERIFY_ALL_RECOGNIZED_CLAIMS_AFTER_COMMIT
JR-18 PUBLISHED_CLAIMS_MUST_FIT_VERIFIED_RETAINED_CLOSURE
JR-19 RECLAMATION_TRANSITION_MUST_BE_INVALIDATED_BY_RELEVANT_CONTEXT_CHANGE
JR-20 FIXED_POINT_FAILURE_OR_OPEN_WORLD_UNKNOWN_PREVENTS_STRONG_RECLAMATION.

## 23. Open gaps
JR-G1 Formal fixed-point construction.
JR-G2 Termination/boundedness of claim-closure computation.
JR-G3 Formal semantics for latent claims.
JR-G4 Dynamic claim activation race model.
JR-G5 Joint minimization optimization.
JR-G6 Cross-claim dependency graph extraction.
JR-G7 Formal abstraction/refinement of summaries.
JR-G8 Byzantine/common-mode effects on joint retention.
JR-G9 SANY/TLC/TLAPS encoding.
JR-G10 Implementation/storage refinement.

## Verification boundary
No formal execution performed. No implementation correctness claim. No runtime correctness claim. No deployment correctness claim.