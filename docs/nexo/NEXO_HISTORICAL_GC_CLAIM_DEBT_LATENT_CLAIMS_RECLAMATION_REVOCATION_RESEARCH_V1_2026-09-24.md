# NEXO — Historical GC Claim Debt, Latent Claims, Reclamation Revocation and Re-Expansion V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Objective
Continue the historical-reclamation line by attacking a subtle case: after compaction, a future recovery/dispute/new claim may require distinctions that were not required by the claim set considered at reclamation time.

## Central finding
`NO_CURRENT_CLAIM != NO_FUTURE_RELEVANT_CLAIM`.
`CLAIM_SCOPE_AT_RECLAMATION != CLAIM_SCOPE_AT_RECOVERY`.
`COMPACTION_CANNOT_CREATE_A_RIGHT_TO_FORGET_SECURITY_DISTINCTIONS_REQUIRED_BY_A_RECOGNIZED_RECOVERY/ASSURANCE CONTRACT`.

## 1. Claim debt
Candidate `ClaimDebt`: the set of properties no longer directly reconstructable from retained history but still potentially required by an explicitly recognized recovery, assurance, audit, dispute, or reconciliation contract.
Claim debt is not proof that the missing history was unsafe to delete; it is an explicit statement of which future claims are no longer supportable.

## 2. Latent claim registry
Candidate `LatentClaimRegistry` records bounded classes of future claims that retention policy promises to preserve, such as historical attribution, root succession, effect reconciliation, incident reconstruction, resource-incarnation continuity, and dispute resolution.
It must not be an unbounded promise to preserve everything.

## 3. Reclamation must check latent obligations
Safe reclamation candidate:
`ACTIVE_CLAIMS ∪ RECOGNIZED_LATENT_CLAIMS ∪ RECOVERY_OBLIGATIONS`.
If the retained summary cannot support one of these claims, either retain more information or explicitly transition the claim to a weaker supported class before reclamation.

## 4. Claim expansion after compaction
A new claim appearing later cannot retroactively make an already lawful reclamation unsafe if the claim was genuinely outside the recognized retention contract.
But the system must not silently treat the new claim as supported.
The result may be `UNSUPPORTED_HISTORICAL_CLAIM` or `UNKNOWN`, not reconstructed certainty.

## 5. Reclamation revocation
Reclamation itself may need to be revoked or suspended when a protected transition changes the set of required historical distinctions before the reclamation commit.
Candidate rule: policy/invariant/root/recovery changes that intersect a pending reclamation dependency closure invalidate the pending reclamation authorization.

## 6. Race: new recovery versus reclamation
Case A: recovery requirement is ordered before reclamation authorization → reclamation must include the new requirement.
Case B: reclamation is authoritatively committed before recovery requirement → later recovery cannot assume reclaimed information exists.
Case C: ordering is unknown → HOLD/QUARANTINE; do not choose the favorable order.

## 7. Race: root rotation versus reclamation
If a pending root rotation requires predecessor provenance and reclamation is simultaneously pending, both transitions must share the relevant SafetyOrderingDomain or an explicitly proven equivalent ordering mechanism.
`ROOT_CUTOFF_ORDER != RECLAMATION_ORDER` cannot be left implicit.

## 8. Race: incident/dispute versus reclamation
An incident flag or dispute request may itself be an effect of a protected transition. If it freezes relevant retention, the freeze must be authoritative and durable; a UI flag or best-effort message is not sufficient.

## 9. Retention fence
Candidate `RetentionFence` prevents reclamation of a protected historical scope while a dependent transition is unresolved.
Fields should bind scope, claim classes, authority/order generation, retention policy generation, effect/resource closure, recovery context, owner, expiry/review and invalidation.

## 10. Reclamation epoch
Candidate `RetentionEpoch` prevents stale reclamation workers from deleting data after policy, root, membership, effect, resource, or claim-context changes.
`STALE_RECLAMATION_WORKER != AUTHORIZED_RECLAMATION`.

## 11. Idempotent reclamation is not enough
Replaying a reclamation request safely requires more than idempotency. The system must ensure that a replay cannot apply an old deletion authorization to a new retention context.
AWS guidance notes that retries can execute operations more than once and that idempotency tokens help only when the service contract actually provides the required idempotent semantics. This supports binding reclamation identity to its protected context rather than treating a retry token as authority. citeturn0search0turn0search1

## 12. Historical auxiliary state in formalization
Future TLA+ modeling can represent claim-relevant history with auxiliary/history variables. Lamport and Merz describe history variables as recording past behavior to support refinement mappings. This is useful for modeling reclamation as a state transition while retaining abstract history needed by claims. citeturn0search24turn0search25

## 13. Reclamation and effect identity
If an effect is compacted, its stable effect identity must survive whenever future reconciliation can reference it. Otherwise a late provider callback may be impossible to bind to the historical effect and must remain UNKNOWN rather than being attached by heuristic similarity.

## 14. Reclamation and provider idempotency
An idempotency key is not a historical proof. It can help classify repeated attempts under a provider contract, but it cannot by itself prove that an effect occurred only once, that a compensation erased history, or that a resource incarnation remained unchanged.

## 15. Reclamation and common-mode independence
If two summaries were generated from the same compromised dependency, deleting the raw dependency evidence does not make the summaries independent. Common-mode closure must survive whenever independence is part of the claim.

## 16. Reclamation and Byzantine provenance
Equivocation records, branch identity, signer membership generation, ordering context and predecessor cutoff may be claim-relevant even when signatures remain valid. A valid signature surviving compaction does not preserve the semantics of the branch that produced it.

## 17. Reclamation and privacy
Privacy-driven minimization can require deletion of data that is not necessary for a security claim. Where security provenance is itself personal data, the architecture needs a protected policy defining the minimum safety residue and claim degradation when more deletion is required. Privacy deletion must not be silently converted into a security claim.

## 18. Claim-support lattice after reclamation
Candidate states:
`FULL_SUPPORT → COMPACT_SUPPORT → ATTRIBUTION_ONLY → CURRENTNESS_UNSUPPORTED → UNKNOWN/QUARANTINED`.
Transitions may weaken claims. They must not silently strengthen them.

## 19. Recovery from an already compacted state
Recovery should first load the retained compaction certificate and tombstones, determine supported claim classes, identify missing bridges, and only then decide whether recovery can proceed. Missing historical support is an input to recovery state, not something recovery may fabricate.

## 20. Candidate invariants
RGX-01 NO_CURRENT_CLAIM_DOES_NOT_IMPLY_NO_RECOGNIZED_FUTURE_CLAIM
RGX-02 RECLAMATION_MUST_INCLUDE_RECOGNIZED_LATENT_CLAIMS
RGX-03 NEW_CLAIM_AFTER_RECLAMATION_CANNOT_CREATE_MISSING_HISTORY
RGX-04 UNSUPPORTED_HISTORICAL_CLAIM_MUST_NOT_BE_PROMOTED
RGX-05 INTERSECTING_POLICY/ROOT/RECOVERY_CHANGES_INVALIDATE_PENDING_RECLAMATION
RGX-06 UNKNOWN_RECLAMATION_ORDER_BLOCKS_UNSAFE_COMMIT
RGX-07 RETENTION_FENCE_IS_AUTHORITATIVE
RGX-08 STALE_RECLAMATION_WORKER_CANNOT_DELETE_UNDER_NEW_CONTEXT
RGX-09 RECLAMATION_RETRY_CANNOT_WIDEN_OR_REFRESH_AUTHORITY
RGX-10 IDEMPOTENCY_TOKEN_IS_NOT_RECLAMATION_AUTHORITY
RGX-11 EFFECT_IDENTITY_MUST_SURVIVE_WHEN_REQUIRED_FOR_RECONCILIATION
RGX-12 COMPACTION_CANNOT_CREATE_INDEPENDENCE
RGX-13 VALID_SIGNATURE_DOES_NOT_REPLACE_BRANCH_PROVENANCE
RGX-14 PRIVACY_MINIMIZATION_MUST_HAVE_EXPLICIT_SAFETY_RESIDUE_POLICY
RGX-15 CLAIM_STRENGTH_MAY_DECREASE_AFTER_RECLAMATION_BUT_NOT_INCREASE_FROM_INFORMATION_LOSS
RGX-16 RECOVERY_MUST_CONSUME_COMPACTION_BOUNDARY_BEFORE_RELEASE
RGX-17 RETENTION_EPOCH_CHANGES_INVALIDATE_STALE_RECLAMATION
RGX-18 RECLAMATION_SCOPE_MUST_NOT_EXCEED_VERIFIED_RETENTION_CLOSURE.

## 21. Open gaps
RGX-G1 Formal latent-claim enumeration.
RGX-G2 Claim-debt semantics.
RGX-G3 RetentionFence formal ordering.
RGX-G4 ReclamationEpoch refinement.
RGX-G5 Privacy/safety residue composition.
RGX-G6 Dynamic claim introduction.
RGX-G7 Reclamation/provider callback interaction.
RGX-G8 Byzantine provenance under minimization.
RGX-G9 Formal refinement and finite-model abstraction.
RGX-G10 SANY/TLC/TLAPS validation.

## Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.