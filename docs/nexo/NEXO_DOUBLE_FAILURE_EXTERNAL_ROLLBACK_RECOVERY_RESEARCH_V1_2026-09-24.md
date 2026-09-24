# NEXO — DOUBLE-FAILURE / EXTERNAL ROLLBACK / RECOVERY RESEARCH V1
Date: 2026-09-24
Status: RESEARCH / ARCHITECTURAL PRECONDITION
Implementation: BLOCKED. No V21.

## Scope
Attack sequence:
external commit → Nexo crash before observation → resource rollback/replacement → stale observer → recovery → second crash → repeated recovery.

## Research cross-check
TUF explicitly distinguishes authenticity from freshness and documents rollback, freeze, and mix-and-match attacks; signed metadata can be authentic yet stale, and snapshot metadata is used to preserve a consistent view. etcd documents quorum loss, snapshot restore, and the need to treat restored state as a recovery event rather than ordinary continuation. These are research inputs/analogies, not claims that Nexo follows either system.

## Findings
DF-01: A single crash boundary is insufficient; recovery itself can crash after partial reconciliation. Recovery must be resumable and idempotent.
DF-02: Recovery progress is not authority. A durable recovery checkpoint cannot by itself release execution.
DF-03: External commit can be real even when local history says only ATTEMPTED.
DF-04: External rollback can make a previously observed effect disappear from current state; this does not prove it never occurred.
DF-05: Resource replacement creates a new incarnation; old evidence must be bound to old incarnation.
DF-06: A stale observer can return authentic but obsolete evidence. Authenticity does not establish freshness.
DF-07: Multiple observers can share the same stale/common-mode dependency and therefore cannot automatically corroborate one another.
DF-08: Repeated reconciliation must be monotonic with respect to authoritative context/evidence and must not overwrite newer findings with older observations.
DF-09: A recovery checkpoint can itself be stale after an external resource advances or changes incarnation.
DF-10: Recovery must revalidate the current resource incarnation and fence before using any restored participant state.
DF-11: If resource continuity is unavailable/UNKNOWN, claims requiring historical external truth may have to remain UNKNOWN even when local control state is healthy.
DF-12: Resource history compaction can create a proof boundary: if required historical evidence is gone, the claim cannot be promoted solely from current absence.
DF-13: Resource rollback can produce a mix-and-match context in which different resources expose states that never coexisted. A cross-resource claim must require ContextCompatibility.
DF-14: A numeric generation/version is not sufficient if a resource can be re-created with the same value. Incarnation/domain identity is required.
DF-15: Recovery-of-recovery needs its own fencing/currentness semantics. A recovery process restored from an older checkpoint must not regain an obsolete recovery lease.
DF-16: A recovery fence must survive the relevant crash/rollback threat or be re-established against an independent/current anchor before release.
DF-17: Local decommission records can be rolled back; external/resource-side rejection of old actors is required when resurrection is in the threat model.
DF-18: STOP state restored from an old snapshot cannot clear a newer STOP/fence boundary.
DF-19: Evidence accepted before a material context/continuity change must be invalidated or revalidated when the claim depends on currentness.
DF-20: A successful reconciliation at generation G does not authorize assumptions at G+1.
DF-21: A resource that was unreachable during recovery may have continued autonomous effects; communication loss is not proof of quiescence.
DF-22: Reconciliation must distinguish historical event evidence, current state, current fence state, and current authority.
DF-23: Recovery can converge only if its state machine has monotonic/idempotent transitions and explicit conflict handling; otherwise repeated crashes can oscillate state.
DF-24: If two recovery attempts disagree, the system needs a single authoritative recovery coordination domain or a fencing protocol preventing stale recovery actors from changing protected state.
DF-25: A continuity root cannot safely certify continuity solely from rollback-vulnerable state whose continuity it is supposed to prove.
DF-26: New logical context after restore must be explicit. Historical content may be restored, but current authority must be newly established/revalidated.
DF-27: External rollback plus stale observer is a compound epistemic failure: neither current state nor observation alone proves historical absence.
DF-28: Double-failure testing must inject crashes at each boundary: after external commit, before local record, after evidence acceptance, after fence update, during resource replacement, during reconciliation, after reconciliation commit, and during release.
DF-29: Claim-specific assurance can differ: a local historical claim may be supported while a cross-resource world-truth claim remains UNKNOWN.
DF-30: The architecture should prefer safe non-convergence (HOLD/QUARANTINE) over unsafe convergence based on stale or mixed-generation evidence.

## Recovery state concept
RECOVERY_STARTED
→ BASELINE_LOADED
→ CURRENT_CONTEXT_ESTABLISHED
→ UNCERTAINTY_INVENTORIED
→ RESOURCE_INCARNATIONS_VERIFIED
→ FENCES_ESTABLISHED/VERIFIED
→ RECONCILIATION_IN_PROGRESS
→ PARTIAL/CONFLICTING/RESOLVED
→ CLAIMS_RECOMPUTED
→ RELEASE_ELIGIBILITY_RECOMPUTED
→ EXPLICIT_RELEASE or HOLD/QUARANTINE.

A crash may occur at every arrow. Restart must resume from durable recovery facts but revalidate all currentness/continuity assumptions.

## Candidate invariants
INV-DF-01: Recovery MUST be resumable and idempotent across repeated crashes.
INV-DF-02: Recovery checkpoints MUST NOT by themselves grant normal execution authority.
INV-DF-03: Restored recovery state MUST be revalidated against the current recovery fence/epoch/context.
INV-DF-04: External rollback MUST NOT erase the historical fact that an effect may have occurred.
INV-DF-05: Evidence MUST bind to resource incarnation and freshness when the claim requires them.
INV-DF-06: Mixed-generation external state MUST NOT satisfy a cross-resource coherence claim without explicit compatibility proof.
INV-DF-07: Reconciliation results MUST NOT regress authoritative evidence/context to an older generation.
INV-DF-08: Resource replacement MUST prevent automatic inheritance of historical authority/capabilities.
INV-DF-09: Loss/uncertainty of resource continuity MUST degrade or block claims that depend on continuity.
INV-DF-10: STOP/decommission/recovery barriers MUST NOT regress through snapshot restoration.
INV-DF-11: A stale recovery actor MUST be fenced from protected state transitions.
INV-DF-12: Recovery MUST preserve UNKNOWN when no valid evidence resolves it.
INV-DF-13: Current state MUST NOT be substituted for historical event evidence.
INV-DF-14: A continuity mechanism MUST NOT derive its required continuity assurance solely from the same rollback-vulnerable state it protects.
INV-DF-15: Double-failure fault injection MUST cover every safety-relevant crash boundary before implementation assurance is claimed.

## Architectural consequence
The clean architecture likely needs a first-class distinction among:
- RecoveryProgress (what recovery has durably completed)
- RecoveryAuthority/Fence (whether recovery may perform a protected transition now)
- ExternalEffectHistory (what historical external evidence exists)
- ExternalEffectState (current reconciled classification)
- ResourceIncarnation (which external instance evidence belongs to)
- ContinuityAnchor (what establishes non-rollback/currentness)
- ReconciliationRecord (what was checked, against which context, and result)
These are candidates, not yet final canonical objects.

## Next attack
The next adversarial front is **double-recovery / split recovery ownership**:
two recovery actors start from different checkpoints or contexts, both believe they can reconcile/release, one is stale, and external effects are changing concurrently. Analyze recovery fencing, ownership transfer, lease expiry, stale recovery messages, concurrent reconciliation, and release linearization.
