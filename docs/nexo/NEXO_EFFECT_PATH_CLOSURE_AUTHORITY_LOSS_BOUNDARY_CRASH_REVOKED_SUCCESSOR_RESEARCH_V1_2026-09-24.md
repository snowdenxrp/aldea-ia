# NEXO EFFECT-PATH CLOSURE AUTHORITY-LOSS BOUNDARY CRASH REVOKED-SUCCESSOR RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## 1. Research target
Attack the complete authority-loss corridor at exact transition boundaries:
AUTHORITY_LOST → BOUNDED_SAFETY → SUCCESSOR_CANDIDATE → SUCCESSOR_ACTIVE → RELEASE.

The central question:
Can any protected effect, delegated capability, queued continuation, provider redrive, compensation, recovery worker, or late observation bypass the constitutional transition and obtain or exercise current authority?

External formal-methods cross-check:
TLA+ models concurrent/distributed systems as state machines with initial states and next-state relations, and invariants can be checked over reachable states; refinement can be expressed as one state machine implementing another. citeturn0search2turn0search12
SANY checks syntax/semantic issues, TLC checks executable specifications for safety/liveness, and TLAPS supports mechanically checked hierarchical proofs. citeturn0search8turn0search16
These sources support the future verification approach, not Nexo's correctness.

## 2. Core boundary
Candidate protected boundary:
AUTHORITY_LOSS_CUTOFF

At this boundary, all protected work must be classified:
1. already linearized;
2. admitted but not linearized;
3. prepared;
4. queued;
5. delegated;
6. externally attempted;
7. externally unknown;
8. compensation/recovery/update continuation.

No category may be silently treated as cancelled or completed.

## 3. Strong closure property
Candidate:
NO_PROTECTED_EFFECT_ESCAPES_AUTHORITY_LOSS_CLOSURE

A protected effect can continue only if one of these is true:
- it was already externally linearized under valid authority and is being reconciled;
- a current successor authority explicitly re-admits/continues it under a valid continuity contract;
- it is inside the preauthorized safety envelope and cannot amplify authority;
- it is explicitly quarantined/fenced.

Otherwise it must be blocked.

## 4. Queued effects
Queue state is not authority.

A command queued before authority loss may be:
QUEUED_OLD_CONTEXT
and must carry:
- authority epoch;
- constitutional context;
- capability lineage;
- policy/invariant generation;
- effect identity;
- scope/fence generation;
- resource incarnation;
- dependency closure.

At execution boundary:
CURRENT_CONTEXT == QUEUED_CONTEXT
or explicit continuation transition is required.

Rule:
QUEUED != AUTHORIZED.

## 5. Delegated child capabilities
Delegated capabilities cannot survive an authority cutoff merely because their parent credential was historically valid.

Revocation closure must include:
- descendants;
- queued child effects;
- retries/redrives;
- callbacks;
- delayed jobs;
- provider continuations;
- cached capabilities;
- recovery workers.

A generation/root revocation is sufficient only if every protected effect boundary enforces that generation.

## 6. Callback and redrive attack
Provider callback may arrive after:
- predecessor root cutoff;
- recovery owner transfer;
- STOP;
- successor activation.

Therefore callback acceptance requires current context validation.

Historical correlation:
CALLBACK_FOR_OLD_EFFECT != CURRENT_AUTHORITY_TO_CONTINUE_EFFECT.

A callback may be accepted as evidence without being granted authority to trigger a new protected effect.

## 7. Provider continuation
If external provider can continue an effect after Nexo loses authority, Nexo cannot claim the effect stopped merely because its local worker stopped.

State must remain:
EXTERNAL_EFFECT_UNKNOWN
until resource-side enforcement or reconciliation establishes the required property.

## 8. Compensation attack
Compensation is a new protected effect.

Therefore:
COMPENSATION_RECOMMENDATION != COMPENSATION_AUTHORITY
COMPENSATION_COMMIT != HISTORICAL_ERASURE
COMPENSATION_SUCCESS != RESTORED_WORLD_STATE

A compensation proposed under predecessor authority becomes stale at cutoff unless a continuation contract explicitly preserves it.

## 9. Recovery worker attack
A recovery worker created before authority loss cannot automatically become successor authority.

Its context must bind:
- recovery epoch;
- recovery owner;
- constitutional context;
- trust anchor;
- membership;
- ordering domain;
- scope;
- fence;
- dependency closure.

After context invalidation:
RECOVERY_WORKER_STALE → FENCE/STOP/QUARANTINE.

## 10. Crash at predecessor cutoff
Critical window:
1. predecessor cutoff committed;
2. successor activation not yet committed;
3. process crashes.

Correct state:
AUTHORITY_UNAVAILABLE or SUCCESSION_PENDING.

Not:
SUCCESSOR_CURRENT.

The absence of the successor commit cannot be inferred from an in-memory flag.

## 11. Crash after successor activation
Critical window:
1. successor activation committed;
2. assurance publication not committed;
3. crash.

On recovery, current successor must be reconstructed from the authoritative ordering domain, not from local progress.

If successor currentness cannot be reconstructed:
AUTHORITY_UNAVAILABLE / QUARANTINED.

## 12. Crash after release eligibility
If:
RELEASE_ELIGIBLE committed
but:
EXPLICIT_RELEASE not committed,

then normal authority is not restored.

Rule:
ELIGIBILITY != AUTHORITY.

## 13. Root revocation immediately after successor activation
Scenario:
A predecessor → B successor
B becomes current
then B root is revoked immediately.

B's descendants must be evaluated against the revocation cutoff.

This requires:
ROOT_RELIANCE_CLOSURE
to include:
- active authority;
- capability lineage;
- assurance bundles;
- queued effects;
- external continuations;
- recovery ownership;
- compaction certificates;
- claims.

Root revocation must not be reduced to deleting one root record.

## 14. Late compromise evidence
If evidence arrives after release suggesting predecessor or successor compromise:
- classify evidence;
- bind to observation context;
- establish authoritative order;
- determine compromise interval;
- compute dependent closure;
- invalidate/degrade affected authority and claims;
- fence affected effects;
- reconcile external state.

Late evidence does not automatically prove the entire world state.

## 15. Hidden update/bootstrap path
Update and bootstrap are effect paths.

A stale component must not obtain new authority by:
- installing a newer artifact;
- bootstrapping a new process;
- restoring a configuration;
- loading an old snapshot;
- changing policy/config;
- changing trust roots.

Every such path needs its own protected admission and constitutional context.

## 16. Effect-path closure
Candidate object:
AuthorityLossEffectPathClosure

Fields:
- closure_id;
- authority_cutoff;
- constitutional context;
- effect paths;
- delegated descendants;
- provider continuations;
- queues;
- callbacks;
- retries;
- compensation;
- recovery;
- update/bootstrap;
- resource incarnations;
- dependency/common-mode closure;
- enforcement boundaries;
- unknown set;
- verification method;
- claim scope;
- invalidation triggers.

The closure is claim-specific and cannot be assumed globally complete in an open world.

## 17. Closure failure
If effect-path completeness cannot be established:
EFFECT_PATH_CLOSURE_UNKNOWN.

Then:
- no global release;
- no global containment claim;
- no assumption that hidden continuations are absent;
- use weaker claim or remain quarantined.

This preserves:
OPEN_WORLD != CLOSED_WORLD.

## 18. Partial closure
If paths A and B are verified but C is unknown:
CLAIM_SCOPE <= VERIFIED_CLOSURE_SCOPE.

We can still assert:
A and B are contained,
without asserting:
all effects are contained.

## 19. Successor continuation of pre-cutoff effect
A successor may continue a pre-cutoff effect only through:
ContinuationAuthorization

It must bind:
- original effect identity;
- attempt lineage;
- predecessor context;
- successor context;
- compatibility contract;
- resource incarnation;
- current policy/invariants;
- current scope/fence;
- external effect state;
- assurance requirements.

Continuity of effect identity does not imply continuity of authority.

## 20. Double successor race
If B and C both become candidates:
B: successor prepared
C: successor prepared

Only one may become current if the protected claim requires uniqueness.

If the ordering domain cannot establish B-before-C or C-before-B:
SUCCESSION_ORDER_UNKNOWN
→ no current authority.

UNKNOWN_ORDER != either order.

## 21. Reconciliation cannot create authority
A reconciliation agent may discover that B's effects exist.

That evidence does not authorize B.

Therefore:
WORLD_OBSERVATION != AUTHORITY_RECONSTRUCTION.

Reconciliation can inform succession but cannot self-authorize it.

## 22. Assurance publication race
A successor may have all evidence locally but lack current publication authority.

Therefore:
ASSURANCE_PREPARED != CURRENT_ASSURANCE.

Publication requires:
- current publisher authority;
- current generation;
- current constitutional context;
- current dependency closure;
- current fence;
- current resource incarnation;
- no unresolved invalidation.

## 23. Resource-side fence race
If predecessor fence and successor release race at a resource:
the resource-side enforcement boundary needs an authoritative fence/epoch check.

If Nexo cannot control that final boundary:
Nexo must weaken its claim.

This preserves:
INTERNAL_STOP != EXTERNAL_QUIESCENCE.

## 24. End-to-end transition protocol
Candidate:

AUTHORITY_LOSS_DETECTED
→ FREEZE_PROTECTED_ADMISSION
→ CLOSE_EFFECT_PATHS
→ INVALIDATE_STALE_CAPABILITIES
→ FENCE_OLD_CONTEXT
→ CLASSIFY_INFLIGHT_EFFECTS
→ PRESERVE_EXTERNAL_UNKNOWN
→ ENTER_BOUNDED_SAFETY
→ PREPARE_SUCCESSOR
→ VALIDATE_TRUST/MEMBERSHIP/ORDER
→ COMMIT_SUCCESSOR_ORDER
→ VERIFY_PREDECESSOR_ENFORCEMENT
→ REVALIDATE_SUCCESSOR_CONTEXT
→ RECONCILE_EXTERNAL_EFFECTS
→ RECOMPUTE_ASSURANCE
→ PUBLISH_SUCCESSOR
→ DERIVE_RELEASE_ELIGIBILITY
→ EXPLICIT_RELEASE
→ NORMAL_OPERATION

Any crash returns through durable state reconstruction.
Any critical UNKNOWN returns to HOLD/QUARANTINE.

## 25. Stronger end-to-end invariant
Candidate:
NO_AUTHORITY_CROSSING_WITHOUT_PROTECTED_TRANSITION

For every protected effect e:
If e is executed under current authority context C2 after predecessor context C1 is cut off, then there exists an authoritative succession/continuation transition T such that:
- T orders C1 cutoff before C2 execution;
- T validates current trust/membership;
- T closes or explicitly carries forward effect identity;
- T establishes required fencing;
- T survives crash/restart;
- T's publication is current;
- T's claim scope does not exceed verified enforcement.

## 26. Recovery-of-recovery
If any step in the protocol crashes:
- durable progress may be retained;
- authority is never inferred from progress;
- current ownership must be reacquired;
- all context generations must be rechecked;
- stale prepared state is rejected;
- protocol resumes from a protected boundary.

This is the same semantic rule already established for reconciliation and assurance.

## 27. Formal model decomposition
Future formal specification should separate:
A. Constitutional context and authority order
B. Effect-path closure
C. capability/delegation revocation
D. external effect uncertainty
E. successor transition
F. fencing/enforcement
G. assurance publication
H. crash/restart
I. late evidence/invalidation

TLA+ is well suited to asynchronous state-machine modeling, and its refinement approach provides a natural later mapping from abstract transition contracts to implementation behavior. citeturn0search12turn0search2

A future model must not claim that TLC checking a finite abstraction proves arbitrary open-world external behavior.

## 28. New invariants
EPC-01: queued work does not carry authority across a constitutional cutoff automatically.
EPC-02: delegated descendants are inside revocation closure.
EPC-03: callbacks cannot create protected authority solely from historical effect identity.
EPC-04: provider continuation remains externally uncertain until required enforcement/reconciliation.
EPC-05: compensation is a new protected effect.
EPC-06: stale recovery workers cannot become successor authority.
EPC-07: crash between cutoff and successor commit leaves authority unavailable/pending.
EPC-08: crash after successor commit reconstructs currentness from authoritative state, not local progress.
EPC-09: release eligibility does not grant authority.
EPC-10: successor root revocation propagates through RootRelianceClosure.
EPC-11: late compromise evidence can invalidate/degrade dependent claims.
EPC-12: update/bootstrap paths are protected effect paths.
EPC-13: unknown effect-path closure prevents stronger global claims.
EPC-14: partial closure can publish only claim-scoped weaker assurance.
EPC-15: effect identity continuity does not imply authority continuity.
EPC-16: reconciliation cannot self-authorize.
EPC-17: prepared assurance is not current assurance.
EPC-18: resource-side fence conflicts prevent unsupported external-quiescence claims.
EPC-19: unknown succession order prevents current-authority publication.
EPC-20: recovery progress/checkpoints never substitute for protected authority transitions.
EPC-21: every protected authority crossing requires an authoritative transition with crash semantics.
EPC-22: hidden effect paths are included in the closure contract.
EPC-23: open-world incompleteness cannot be silently promoted to absence.
EPC-24: concrete implementation must refine the end-to-end abstract transition.

## 29. Architectural consequence
The authority-loss corridor now connects directly to the earlier effect/revocation work:

CONSTITUTIONAL TRUST
→ AUTHORITY ORDER
→ AUTHORITY LOSS CUTOFF
→ REVOCATION CLOSURE
→ EFFECT-PATH CLOSURE
→ BOUNDED SAFETY
→ SUCCESSION
→ FENCE
→ RECONCILIATION
→ ASSURANCE
→ EXPLICIT RELEASE

This is not a single state machine in the final design; it is a composition of protected state machines sharing explicit ordering and dependency contracts.

## 30. Next gate
Next attack:
COMPACTION / MEMORY RECLAMATION DURING AUTHORITY LOSS AND SUCCESSION.

Specifically:
- what if raw revocation evidence is compacted while a successor transition is pending?
- what if the only evidence of an old capability is in a causal summary?
- what if a late callback arrives after compaction?
- what if root rotation invalidates the compaction certificate?
- what if the summary itself depends on the trust context being replaced?
- what if recovery needs reclaimed history to establish predecessor cutoff?

Target property:
NO_RECLAMATION_MAY_ERASE_INFORMATION_REQUIRED_TO_PROVE_OR_FENCE_AUTHORITY_SUCCESSION.

## Verification status
No SANY/TLC execution.
No TLAPS proof.
No implementation refinement.
No runtime/fault-injection verification.
No correctness guarantee.
