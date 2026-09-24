# NEXO — RECONCILIATION-OF-RECONCILIATION AND SECOND-FAILURE RESEARCH
Date: 2026-09-24
Status: RESEARCH ONLY — CLEAN ARCHITECTURE DESIGN — NOT IMPLEMENTED — NOT SANY/TLC VERIFIED

## 1. Attack
Previous round assumed partition healing starts a reconciliation. This round attacks the reconciler itself:
- reconciliation crashes midway;
- a second partition occurs;
- a new external effect appears during reconciliation;
- a stale reconciliation resumes;
- the external provider changes state while reconciliation is in progress;
- recovery restores an older reconciliation checkpoint;
- two reconciliation owners operate concurrently.

## 2. External cross-check
Raft documents that a committed command may be followed by a client retry after the leader crashes before the response; unique persistent serial numbers are used to prevent re-execution. This validates preserving effect identity and deduplication state across recovery, but Nexo still must account for providers that do not enforce the same contract. citeturn0search24turn0search0

Raft also distinguishes current authoritative state from stale local observations for linearizable reads, reinforcing that a recovered local checkpoint cannot by itself establish current authority. citeturn0search24

## 3. Core finding
Reconciliation is itself a stateful protected process.

Therefore:
RECONCILIATION PROGRESS != RECONCILIATION AUTHORITY
RECONCILIATION CHECKPOINT != CURRENT WORLD TRUTH
RECONCILIATION COMPLETION != EXTERNAL EFFECT ABSENCE

A reconciler can fail after producing a correct partial result, and a later reconciler must distinguish completed facts, incomplete work, stale facts, invalidated facts, and evidence whose source is no longer current.

## 4. Second-failure window
1. Partition A/B create uncertain effects.
2. Partition heals.
3. Reconciler R1 acquires ownership.
4. R1 establishes facts F1.
5. R1 crashes.
6. A second partition occurs.
7. A new authority context or provider effect E3 appears.
8. R2 restarts from R1 checkpoint.
9. R2 sees F1 plus stale control context.
10. R2 must not publish current release from that checkpoint.

Rule:
OLD RECONCILIATION CONTEXT + NEW WORLD EVENTS = REVALIDATION REQUIRED

## 5. Reconciliation generation
Candidate object: ReconciliationGeneration.

Each reconciliation execution is bound to:
- reconciliation generation
- authority epoch
- stop epoch
- recovery epoch
- fence generation
- root generation
- policy/invariant generation
- dependency graph generation
- resource incarnations
- effect-path closure
- external observation generation

A later generation does not automatically invalidate every fact; it must evaluate context compatibility.

## 6. Checkpoint semantics
A checkpoint stores progress, not authority.

It may restore:
- inspected effects;
- completed provider queries;
- immutable authenticated evidence;
- deterministic classifications whose context remains valid.

It must not automatically restore:
- current authority;
- current ownership;
- current release eligibility;
- current provider state;
- current fence;
- current world truth.

CHECKPOINT RESTORE != AUTHORITY RESTORE
CHECKPOINT RESTORE != WORLD RESTORE

## 7. Reconciliation ownership
Only one authoritative reconciliation owner should control a protected scope at a time, or ownership transfer must be serialized/fenced.

OLD_OWNER → INVALIDATED/FENCED
NEW_OWNER → CURRENT

Lease timeout alone is insufficient when global authority loss is unknown.

A stale reconciler must be rejected at the protected publication boundary.

## 8. Publication boundary
Candidate guard:
CURRENT_RECONCILIATION_OWNER
AND CURRENT_RECONCILIATION_GENERATION
AND CURRENT_AUTHORITY_CONTEXT
AND CURRENT_STOP/RECOVERY_STATE
AND CURRENT_FENCE
AND CURRENT_EFFECT_SCOPE
AND CURRENT_RESOURCE_INCARNATIONS
AND CURRENT_DEPENDENCY_CONTEXT
AND NO_UNRESOLVED_REQUIRED_INVALIDATION

Only then may a reconciliation result contribute to a release claim.

## 9. Second partition during reconciliation
If the network partitions again:
- freeze protected admission;
- do not assume either partition is globally authoritative;
- preserve reconciliation evidence;
- prevent stale publication;
- establish a new authoritative coordination domain;
- identify effects produced during the interval;
- rebuild affected interaction/uncertainty closure;
- reconcile again.

Recursive structure:
RECONCILIATION
→ FAILURE/PARTITION
→ NEW UNCERTAINTY
→ RECONCILIATION OF RECONCILIATION

Immediate convergence is not required. Safe non-convergence:
HOLD / QUARANTINE / SAFETY_ONLY

## 10. New effect during reconciliation
If reconciliation observes resource R at S1 and external effect E3 changes R to S2 before publication, S1 may remain historical evidence but cannot automatically be current truth.

If causal order is unknown, current-state claims may remain UNKNOWN.

## 11. Reconciliation can create effects
Cancellation, compensation, repair, rollback, migration, fencing, and cleanup are external effects when they cross the provider boundary.

They require:
EffectIdentity
AttemptIdentity
EffectInteractionContract
ResourceIncarnation
AuthorityContext
EffectCommit semantics
Evidence/reconciliation linkage

RECONCILIATION EFFECT != INTERNAL BOOKKEEPING

## 12. Recursive effect closure
If reconciliation creates effects, those effects can create new uncertainty:

ORIGINAL EFFECTS
→ RECONCILIATION EFFECTS
→ SECONDARY PROVIDER EFFECTS
→ CALLBACKS/RETRIES/CONTINUATIONS
→ NEW UNCERTAINTY
→ RECONCILIATION

This extends prior EffectPathClosure research.

Completeness is always relative to a defined effect boundary, not an assumed closed universe.

## 13. Cross-reconciler race
R1 may classify E1/E2 as conflict while R2 classifies them as compatible using newer evidence.

Neither result becomes authoritative merely because it completed first.

Publication compares:
- context;
- evidence generations;
- dependency closure;
- effect-path closure;
- authoritative owner;
- current fences;
- claim scope.

## 14. Monotonicity
Some reconciliation facts can be monotonic:
- immutable historical effect identities;
- authenticated immutable evidence;
- durable ownership history;
- append-only causal records.

Other dimensions are non-monotonic:
- current authority;
- current world state;
- release eligibility;
- current resource state;
- current assurance.

Thus reconciliation is only partially monotonic.

## 15. Candidate object: ReconciliationContinuityContext
Fields:
- reconciliation generation
- predecessor generation
- authority continuity
- root generation
- stop/recovery/fence epochs
- effect scope
- resource incarnations
- provider contract versions
- evidence generations
- dependency closure fingerprint
- effect-path closure fingerprint
- ownership epoch
- publication boundary version

Purpose: prove that resumed reconciliation continues a compatible protected context, or force reconstruction.

## 16. Candidate object: ReconciliationBoundary
Defines exactly what a reconciliation claim covers:
- effects;
- resources;
- providers;
- callbacks;
- retries;
- child effects;
- delegated capabilities;
- evidence sources;
- time/order assumptions;
- environmental assumptions.

An unclosed boundary cannot support a stronger completeness claim than its verified closure.

## 17. Candidate state machine
R0 UNSTARTED
→ R1 OWNED
→ R2 CONTEXT_BOUND
→ R3 EFFECT_SCOPE_FROZEN
→ R4 OBSERVING
→ R5 CLASSIFYING
→ R6 CONFLICT_ANALYSIS
→ R7 RECONCILIATION_EFFECTS
→ R8 REVALIDATING
→ R9 PUBLICATION_READY
→ R10 PUBLISHED
→ R11 RELEASE_ELIGIBLE

Failure/invalidations:
→ STALE
→ FENCED
→ QUARANTINED

R10 PUBLISHED != WORLD_TRUTH
R11 RELEASE_ELIGIBLE != EXECUTION_AUTHORITY

## 18. New invariants
RR-01 Reconciliation authority is current-context bound.
RR-02 Reconciliation progress cannot restore authority.
RR-03 A stale reconciliation cannot publish current release eligibility.
RR-04 A second partition invalidates assumptions of global coordination that depended on the lost connection.
RR-05 New external effects during reconciliation expand the affected closure.
RR-06 Reconciliation-created external effects are ordinary protected effects.
RR-07 Immutable historical facts may survive context invalidation, but current claims may not.
RR-08 Release eligibility is recomputed after required reconciliation and context changes.
RR-09 Checkpoint restore cannot resurrect stale ownership, authority, fence, or release.
RR-10 Safe non-convergence is HOLD/QUARANTINE, not forced completion.
RR-11 A reconciliation claim cannot exceed its verified boundary closure.
RR-12 Two concurrent reconcilers require explicit serialized ownership or claim-specific conflict coordination.

## 19. Adversarial fixtures
RR-A01 crash before first fact.
RR-A02 crash after partial classification.
RR-A03 crash after compensation effect.
RR-A04 second partition during reconciliation.
RR-A05 provider changes state between observation and publication.
RR-A06 stale checkpoint after root rotation.
RR-A07 stale checkpoint after resource replacement.
RR-A08 old reconciler publishes after ownership transfer.
RR-A09 two reconcilers publish concurrently.
RR-A10 reconciliation creates callback-triggering effect.
RR-A11 callback creates new external effect.
RR-A12 provider history becomes unavailable.
RR-A13 provider exposes current state but incomplete causal history.
RR-A14 reconciliation checkpoint rolls back.
RR-A15 dependency graph changes during reconciliation.
RR-A16 policy/invariant changes during reconciliation.
RR-A17 stop asserted during reconciliation effect.
RR-A18 recovery begins while reconciliation ownership is active.
RR-A19 reconciliation completes but hidden provider continuation remains.
RR-A20 repeated partition/heal cycles prevent stable closure.

## 20. Distillation
CARRY_FORWARD:
- checkpoint != authority
- reconciliation ownership fencing
- publication boundary
- effect-path closure
- UNKNOWN preservation
- safe non-convergence
- resource incarnation binding
- current-context revalidation

REWORK:
- ReconciliationGeneration
- ReconciliationContinuityContext
- ReconciliationBoundary
- exact monotonicity rules
- recursive reconciliation protocol

REJECT:
- resume from checkpoint and immediately release
- first reconciler completion wins
- newest timestamp wins
- local reconciliation completion == external quiescence
- compensation == historical erasure

OPEN:
- formal recursive reconciliation model
- liveness/convergence conditions
- SANY/TLC
- provider-specific refinement
- implementation refinement
- fault injection

## 21. Status
RESEARCH COMPLETE FOR THIS ATTACK ROUND.
DESIGN CANDIDATE ONLY.
NO V21 IMPLEMENTATION.
NO FORMAL CORRECTNESS CLAIM.
NO RUNTIME CORRECTNESS CLAIM.
