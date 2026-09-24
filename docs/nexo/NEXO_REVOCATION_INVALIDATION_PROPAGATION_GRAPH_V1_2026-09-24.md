# NEXO REVOCATION AND INVALIDATION PROPAGATION GRAPH V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation.

## 1. Research basis

NIST SP 800-160 Rev. 1 frames secure operation in terms of secure state transitions and protective failure/recovery: when a system detects an insecure state or an impending insecure transition, it should prevent propagation and move toward a protected halt/recovery state. NIST SP 800-53 includes access-authorization revocation, information-flow enforcement, session termination, separation of duties and least privilege. citeturn0search1turn0search24

This supports treating revocation as a propagation problem, not merely as changing one authorization record.

## 2. Core model

A safety-relevant change is an event C.

C
→ impacted objects
→ impacted transitions
→ impacted queued/cached/replicated work
→ impacted evidence
→ impacted claims
→ impacted external-effect uncertainty
→ required fencing
→ required revalidation
→ resulting state.

Core rule:

CHANGE != LOCAL MUTATION.

A change is complete only when all safety-relevant dependents have either:
1. been updated consistently;
2. been invalidated/fenced;
3. been proven unaffected;
4. or been isolated in HOLD/RESTRICT/QUARANTINE.

## 3. Change classes

C-01 Authority revocation
C-02 Authority expiry
C-03 Policy change
C-04 Invariant change
C-05 VersionSet change
C-06 STOP activation
C-07 Recovery initiation
C-08 Evidence stale/invalidated
C-09 Dependency compromise or assurance collapse
C-10 Identity decommission
C-11 Trust-root change
C-12 Schema/semantic change
C-13 Reconciliation-generation change
C-14 Clock/time trust loss
C-15 Storage rollback
C-16 Common-mode independence collapse.

## 4. Dependency graph

The canonical dependency direction is:

CONTEXT CHANGE
→ AUTHORITY / FENCE / VERSION / EVIDENCE STATE
→ OPERATION / QUEUE / CACHE / WORKER
→ EXTERNAL EFFECT
→ EVIDENCE
→ CLAIM
→ RELEASE ELIGIBILITY.

Propagation is not necessarily symmetric.

For example:
- policy change can invalidate evidence;
- evidence invalidation normally does not rewrite historical policy;
- STOP can fence execution without changing historical commits;
- decommission can invalidate current authority while preserving historical evidence.

## 5. Authority revocation

Event:

REVOKE(AUTHORITY_CONTEXT)

Immediate consequences:
- current authority becomes non-current;
- new protected admission using that context is rejected;
- queued work bound to the context becomes stale unless explicitly revalidated;
- cached authority becomes non-authoritative;
- workers holding stale authority/fence cannot pass the final execution gate;
- recovery release using the stale context is rejected.

Existing committed history is not retroactively erased.

Critical distinction:

REVOCATION OF CURRENT AUTHORITY
!=
ERASURE OF HISTORICAL COMMIT.

## 6. Authority expiry

Expiry is a temporal invalidation.

When expired:
- authority cannot authorize new protected effects;
- stale work must be revalidated;
- lease expiry changes coordination state, not external-world truth;
- evidence freshness must be evaluated independently;
- expiry must not be interpreted as proof that an external effect did not happen.

No transition:

EXPIRED → NOT_APPLIED.

## 7. Policy change

Policy change may affect:
- authorization;
- queued operations;
- prepared operations;
- active execution;
- evidence validity;
- verification;
- recovery release;
- update admission.

Required impact analysis:

POLICY_VERSION(old)
→ affected requirements/invariants
→ affected transitions
→ affected operations/claims
→ revalidation or invalidation.

A policy change does not automatically rewrite historical facts; it changes which current claims/actions are admissible.

## 8. Invariant change

Invariant changes require stronger handling than ordinary configuration changes because they alter the definition of acceptable state/transition.

Potential consequences:
- current authorization becomes stale;
- protected transitions must use the new invariant baseline;
- evidence verified only under the old invariant may become stale for claims requiring the new baseline;
- formal proof artifacts depending on the old invariant context become stale;
- cached verification cannot silently remain valid.

Therefore:

INVARIANT_VERSION is part of critical context identity.

## 9. VersionSet change

A VersionSet change is treated as a context transition, not simply a software deployment.

Potentially affected:
- active gate;
- verifier;
- recovery fence;
- policy;
- schema;
- trust root;
- dependency graph;
- evidence;
- formal context;
- queued work.

If the safety meaning changes, existing evidence/claims may require revalidation even when the executable component itself did not change.

## 10. STOP activation

STOP propagation:

STOP_REQUESTED
→ STOP_ENFORCING
→ all protected execution paths fenced
→ queued work blocked
→ stale workers rejected
→ recovery constrained
→ new authorization/admission restricted according to STOP scope
→ STOP_VERIFIED
→ reconciliation.

STOP does not imply:
- external effect reversal;
- world-state certainty;
- historical commit deletion.

Therefore:

STOPPED != NO_EFFECT.

## 11. Recovery initiation

Recovery is an invalidation boundary.

Recovery initiation should invalidate or quarantine:
- in-memory authority assumptions;
- stale execution leases;
- cached admission;
- uncertain worker state;
- assumptions about external effects;
- non-current configuration;
- unverified checkpoint-derived state.

Checkpoint data may reconstruct state, but does not reconstruct authority.

## 12. Evidence stale/invalidated

Evidence invalidation propagation:

EVIDENCE INVALID
→ dependent claim set
→ claims become STALE/INVALID
→ ReleaseEligibility recomputed
→ HOLD/RESTRICT/REVALIDATE as required.

A claim cannot remain VERIFIED_FOR_CLAIM merely because its original evidence record still exists.

Important distinction:

EVIDENCE EXISTS
!=
EVIDENCE CURRENT
!=
CLAIM CURRENT.

## 13. Dependency compromise

If dependency D becomes untrusted or its assurance drops:

D
→ dependent components
→ dependent evidence
→ dependent claims
→ dependent release decisions.

The system must calculate the transitive closure of affected claims.

If an independence assumption depended on D, multiple apparently separate claims may degrade together.

Common-mode collapse therefore participates in invalidation propagation.

## 14. Identity decommission

Decommission propagation:

IDENTITY DECOMMISSION
→ revoke authority
→ revoke delegations
→ fence workers
→ close leases
→ invalidate active credentials
→ block recovery through old identity
→ block update/bootstrap reuse
→ reconcile pending effects
→ preserve historical evidence
→ durable closure.

No resurrection path may restore the identity's protected capabilities.

## 15. Trust-root change

Trust-root change is especially broad.

Potentially affected:
- identity validation;
- artifact signatures;
- evidence provenance;
- configuration admission;
- recovery images;
- update channels;
- dependency attestations.

Therefore trust-root rotation/change must trigger an explicit impact analysis rather than being treated as a normal parameter update.

## 16. Schema / semantic change

Schema compatibility is not sufficient.

A change can preserve syntax while changing meaning.

Therefore:

SCHEMA COMPATIBLE
!=
SEMANTICALLY COMPATIBLE.

Potentially affected:
- persisted state;
- EffectBinding interpretation;
- evidence semantics;
- migration records;
- verification claims;
- formal correspondence.

Migration must establish semantic preservation or explicitly invalidate affected state.

## 17. Reconciliation-generation change

A reconciliation generation identifies a distinct reconciliation context.

When it changes:
- previous reconciliation assumptions may become stale;
- competing reconcilers must be fenced;
- old evidence may need invalidation;
- a new generation cannot claim the old generation's authority merely by having a larger number.

Generation is coordination metadata, not external-world truth.

## 18. Clock/time trust loss

Clock trust loss can affect:
- authority expiry;
- lease expiry;
- evidence freshness;
- stop deadlines;
- recovery deadlines.

Therefore time-source compromise cannot simply be handled as “current time unavailable.”

The affected semantics must enter HOLD/RESTRICT/REVALIDATE according to the claim's dependence on time.

## 19. Storage rollback

Storage rollback may resurrect:
- old authority;
- old leases;
- old VersionSet;
- old evidence;
- old decommission state;
- old recovery state.

Required defenses:
- monotonic/fenced epochs where applicable;
- durable external identity;
- rollback detection;
- current trust-root/configuration checks;
- rejection of stale state as current authority.

Snapshot restoration is state reconstruction, not temporal truth restoration.

## 20. Propagation algorithm

Conceptual algorithm:

1. Record change event with immutable identity.
2. Determine changed semantic context.
3. Traverse authoritative dependency graph.
4. Identify directly affected objects.
5. Compute transitive affected set.
6. Classify each object:
   - update;
   - invalidate;
   - fence;
   - quarantine;
   - unaffected with evidence.
7. Propagate to queues/caches/replicas/workers.
8. Propagate to evidence and claims.
9. Recompute release eligibility.
10. Reconcile uncertain external effects.
11. Persist impact result.
12. Require explicit revalidation where necessary.
13. Record residual assumptions.

No derived “all clear” flag may replace this dependency-aware computation.

## 21. Failure semantics

If propagation itself fails or is incomplete:

Do not assume:
- no dependent object exists;
- old authority is safe;
- evidence remains valid;
- queued work is harmless;
- external effects are absent.

Default for unresolved safety impact:

HOLD / RESTRICT / QUARANTINE / REVALIDATE.

The exact degraded state is claim-specific.

## 22. New invariants

INVPROP-01: every safety-relevant context change has an explicit impact-analysis event.
INVPROP-02: impact analysis traverses transitive safety dependencies.
INVPROP-03: revocation blocks future use without rewriting historical commits.
INVPROP-04: stale queued work cannot bypass current authorization.
INVPROP-05: cached authorization cannot survive invalidation as current authority.
INVPROP-06: evidence invalidation propagates to dependent claims.
INVPROP-07: policy/invariant/VersionSet changes can invalidate dependent claims.
INVPROP-08: STOP propagation fences every in-scope execution path.
INVPROP-09: recovery initiation invalidates unsafe pre-recovery assumptions.
INVPROP-10: dependency compromise propagates through dependent claims.
INVPROP-11: decommission fences every authority-restoring path.
INVPROP-12: trust-root change triggers explicit dependency impact analysis.
INVPROP-13: semantic migration requires preservation evidence or explicit invalidation.
INVPROP-14: reconciliation generation is coordination metadata, not world truth.
INVPROP-15: clock failure cannot silently establish expiry/freshness truth.
INVPROP-16: storage rollback cannot silently restore current authority.
INVPROP-17: incomplete invalidation cannot produce a normal assurance result.
INVPROP-18: no single cached “revoked/valid” bit substitutes for dependency-aware invalidation.

## 23. Result

The architecture now needs an explicit **Invalidation Plane** alongside the previously identified safety, recovery, update, evidence and coordination mechanisms.

Its conceptual responsibility is:

CHANGE
→ IMPACT
→ FENCE / INVALIDATE
→ REVALIDATE
→ RECONCILE
→ RESTORE ASSURANCE.

This is not a generic event bus.

It is a safety-semantic propagation mechanism whose outputs may remove authority or invalidate claims.

## 24. Next research gate

Next: investigate **durability, crash consistency and replay of the invalidation plane itself**.

Questions:
- What if the change commits but invalidation propagation crashes?
- What if invalidation commits but the change record is missing?
- What if a worker reads between the two?
- What if storage rolls back one side?
- What if two invalidations race?
- What if a recovered node replays an old invalidation?
- What is the authoritative ordering/linearization point?
- What minimum durable state must survive restart?

Architecture remains blocked.