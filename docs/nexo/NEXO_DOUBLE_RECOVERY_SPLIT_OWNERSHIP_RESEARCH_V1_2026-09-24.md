# NEXO — DOUBLE-RECOVERY / SPLIT RECOVERY OWNERSHIP RESEARCH V1
Date: 2026-09-24
Status: RESEARCH / ARCHITECTURAL PRECONDITION
Implementation: BLOCKED. No V21.

## Scope
Two recovery actors begin from different checkpoints/contexts; both believe they can reconcile or release; one becomes stale while external effects change concurrently.

## Research cross-check
Raft uses monotonically increasing terms to identify obsolete leaders and rejects requests carrying stale terms; this demonstrates that ownership transfer requires a resource-side stale-actor rejection mechanism, not merely a local belief of ownership. Kubernetes Lease-based leader election uses optimistic concurrency on resourceVersion so concurrent acquisition attempts do not both succeed. These are analogies/research inputs, not proof of Nexo compliance. AWS Step Functions redrive preserves execution identity/history and does not simply restart all successful work, illustrating that recovery/redrive needs explicit semantics for what is replayed and what is retained.

## Findings
DR-01: Recovery ownership must have an authoritative current identity; local ownership state is insufficient.
DR-02: Recovery progress is not recovery authority.
DR-03: Recovery ownership transfer must invalidate the prior owner's protected ability to mutate/release, or stale-owner actions must be rejected at the protected sink.
DR-04: Lease expiry transfers coordination ownership only if acquisition is serialized/current; it does not prove the old actor stopped.
DR-05: A stale recovery actor can send delayed messages after ownership transfer; every protected recovery mutation must carry and validate a current fencing/epoch token.
DR-06: A recovery ACK is evidence of a transition at a point in time, not perpetual ownership.
DR-07: Recovery actor A can finish reconciliation after B has acquired ownership; A's result must be accepted only if its context remains current and compatible.
DR-08: Reconciliation results need generation/context binding; otherwise late results can overwrite newer findings.
DR-09: Two recovery actors may observe different external states legitimately because the world changes between observations; disagreement is not automatically corruption.
DR-10: Release must have a distinct protected linearization point. Passing pre-release checks is not enough if ownership/fence can change before release.
DR-11: Release eligibility is derived, not an authority token. A cached RELEASE_ELIGIBLE result becomes stale when relevant context changes.
DR-12: Ownership transfer during release requires atomic/equivalent protection of the release transition; otherwise A and B can both believe they released.
DR-13: A lease timeout based only on local wall clock is insufficient to prove old actor quiescence under clock/network faults.
DR-14: A new recovery owner must not inherit historical authority merely by restoring the old recovery checkpoint.
DR-15: Recovery checkpoint version and recovery ownership epoch are separate dimensions.
DR-16: A recovery checkpoint may be useful historical evidence while being ineligible to authorize current protected transitions.
DR-17: STOP authority, recovery ownership, reconciliation ownership and execution authority must remain distinct.
DR-18: Recovery may reconcile/repair safety state while execution remains fenced.
DR-19: A recovery actor must not grant itself execution authority through a recovery result.
DR-20: If recovery ownership store is unavailable or UNKNOWN, protected release must not infer that the current actor owns the scope.
DR-21: Ownership transfer must account for unresolved external effects; changing recovery owner does not change effect identity or world outcome.
DR-22: Concurrent reconciliation of the same external effect needs serialization, compare-and-set, generation checks, or an equivalent mechanism sufficient for the claim.
DR-23: Concurrent reconciliation of disjoint footprints may proceed if independence/conflict closure proves they are actually disjoint.
DR-24: Dynamic footprint discovery cannot silently expand a recovery actor's authority.
DR-25: Stale recovery messages can cause ABA-style resurrection if tokens are reused; recovery incarnation/fencing must be non-reusable or otherwise distinguish incarnations.
DR-26: Restarting a recovery process must produce a new recovery incarnation and revalidate current ownership.
DR-27: Resource-side fencing and recovery-side fencing solve different stale-actor boundaries; both may be required.
DR-28: A recovery owner may be current while the external resource is stale/UNKNOWN; ownership does not establish world truth.
DR-29: Recovery can safely converge only when required dependencies, evidence and external effects reach the claim's required assurance. Otherwise HOLD/QUARANTINE is valid convergence.
DR-30: If two recovery decisions conflict, the architecture needs a single authoritative decision domain or an explicit conflict-resolution protocol whose own stale-actor semantics are protected.
DR-31: A release decision cannot be based solely on a previous successful recovery attempt; currentness must be checked at the protected release boundary.
DR-32: Decommissioned recovery identities must not be reusable by restored actors.
DR-33: Policy/invariant/version changes during recovery invalidate affected progress/evidence and require revalidation.
DR-34: Recovery ownership should be claim/scope-specific; one global recovery owner may create unnecessary coupling, while too many independent owners can create cross-domain split-brain.
DR-35: Cross-scope recovery operations require explicit conflict/coordination semantics when their footprints overlap.
DR-36: The safest default under ambiguous recovery ownership is HOLD/QUARANTINE, not "last writer wins".

## Canonical candidate state
RecoveryOwnership:
- recovery_scope
- recovery_incarnation
- owner_identity
- authority_epoch
- recovery_epoch
- fence_epoch/token
- context_identity
- policy/invariant/version set
- dependency graph version
- acquisition linearization reference
- expiry semantics
- transfer/revocation state

RecoveryProgress:
- progress_id
- recovery_scope
- recovery_incarnation
- completed steps
- evidence/reconciliation references
- context identity
- status
- unresolved UNKNOWN/conflicts
- durable sequence

These are candidate objects; final schema remains OPEN.

## Release protocol candidate
CURRENT_OWNER_VALIDATED
→ CURRENT_CONTEXT_VALIDATED
→ REQUIRED_RECONCILIATION_COMPLETE
→ REQUIRED_EVIDENCE_VALIDATED
→ STOP/FENCE CONDITIONS VALIDATED
→ PROTECTED RELEASE LINEARIZATION
→ EXECUTION ENABLED.

Any ownership/context/evidence change before linearization invalidates the pending release.

## Candidate invariants
INV-DR-01: Protected recovery mutations MUST validate current recovery ownership/fence at the protected transition.
INV-DR-02: Recovery progress MUST NOT imply recovery authority.
INV-DR-03: Ownership transfer MUST prevent stale recovery actors from committing protected mutations.
INV-DR-04: Recovery ACK MUST NOT imply perpetual ownership/currentness.
INV-DR-05: Late reconciliation results MUST be rejected or merged only under explicit current-context/generation rules.
INV-DR-06: Release eligibility MUST be recomputed when relevant ownership/context/evidence changes.
INV-DR-07: Release MUST have a protected linearization point.
INV-DR-08: Recovery restart MUST use a new/non-reused recovery incarnation or equivalent anti-ABA mechanism.
INV-DR-09: Recovery checkpoint restoration MUST NOT restore authority/ownership automatically.
INV-DR-10: Recovery ownership uncertainty MUST block protected release.
INV-DR-11: STOP/recovery/execution authority MUST remain distinct.
INV-DR-12: Concurrent recovery operations MUST obey conflict-footprint semantics.
INV-DR-13: Recovery ownership transfer MUST be claim/scope-aware.
INV-DR-14: Decommissioned recovery identities MUST NOT regain protected authority through restoration.
INV-DR-15: Policy/invariant/version changes that affect recovery MUST invalidate/revalidate affected progress.
INV-DR-16: Ambiguous ownership MUST default to HOLD/QUARANTINE.

## Architecture consequence
Recovery needs its own protected coordination semantics, but recovery ownership is not itself execution authority. The minimum recovery coordination domain should be claim/scope-specific. Stale recovery actors must be rejected at the protected transition boundary, not merely expected to stop.

## Open questions
1. Exact ownership-store consistency mechanism.
2. Lease semantics under clock failure.
3. Cross-domain recovery ownership transfer.
4. Recovery conflict resolution when external world changes concurrently.
5. Formal linearization/refinement for recovery release.
6. Fault injection of delayed stale recovery messages.
7. Recovery-of-recovery under storage rollback.
8. Whether recovery ownership should share or separate the authority coordination domain.

## Next attack
**RECOVERY + STOP + EXTERNAL EFFECT RACE**:
STOP is activated while Recovery A reconciles; Recovery B acquires after expiry; an external effect is concurrently in flight; stale A/B messages arrive; resource-side fence changes; release and compensation race. Analyze whether STOP, recovery, fencing and external reconciliation compose without a semantic hole.
