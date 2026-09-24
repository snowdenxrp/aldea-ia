# NEXO — BOUNDED UNCERTAINTY / ABSORBING SAFE STATE RESEARCH V1
Date: 2026-09-24
Status: RESEARCH / ARCHITECTURAL DESIGN ONLY
Verification: NOT SANY/TLC VERIFIED; NOT IMPLEMENTATION VERIFIED; NOT RUNTIME VERIFIED

## 1. Objective

Attack the question:

Can Nexo reduce coordination scope by moving an uncertain world into a safe absorbing state, without falsely classifying UNKNOWN external history?

Core distinction:

SAFE_STATE_TRANSITION != KNOWLEDGE_OF_PRIOR_OUTCOME

A monotonic safety action can reduce future risk without proving what happened before it.

## 2. External cross-check

AWS documents that timeout/error does not necessarily mean a remote side effect did not occur; reconciliation can remain necessary, and idempotency can make repeated requests safer. This directly supports keeping UNKNOWN as an epistemic state even after a later action is safely applied. AWS also notes that idempotency does not remove all semantic complexity around retries and late requests. citeturn0search0turn0search1

Raft provides a related control-plane lesson: committed state can be made stable across future leaders, and client serial numbers can prevent re-execution after a committed command whose response was lost. This is useful for durable control semantics, but it does not establish external-world truth. citeturn0search28turn0search30

TLA+ distinguishes safety from liveness and defines safety through bad finite prefixes; this supports modeling an absorbing safety state as a state-transition property while keeping eventual knowledge/recovery as a separate liveness/epistemic problem. citeturn0search29

## 3. The key discovery

An absorbing safe state may legitimately reduce future coordination requirements only if the safety claim being made is about FUTURE ADMISSIBLE EFFECTS.

It cannot, by itself, establish:
- that a prior effect never happened;
- that an UNKNOWN effect was rejected;
- that a historical external state is absent;
- that compensation is unnecessary;
- that the world has converged;
- that evidence from before the transition remains valid.

Therefore:

ABSORPTION CAN REDUCE FUTURE EFFECT SPACE

but:

ABSORPTION CANNOT RETROACTIVELY COLLAPSE HISTORY.

## 4. Candidate definition

A state S is a candidate safety-absorbing state for claim C if, once S is validly established:

1. every protected transition admitted from S preserves C;
2. every stale capability capable of violating C is rejected/fenced;
3. no unresolved external branch consistent with current evidence can violate C without a new protected transition;
4. leaving S requires an explicit protected transition;
5. the transition into S is itself correctly authorized, fenced, and verified at the required claim strength.

This is stronger than simply declaring a flag such as SAFE=true.

## 5. Safe absorbing state vs quarantine

Quarantine is usually a coordination/control state:

QUARANTINED → no ordinary protected effects.

An absorbing safe state is stronger:

SAFE_ABSORBING → allowed future operations are constrained so that the protected invariant remains true without requiring the original broad coordination set for every subsequent step.

Therefore not every quarantine is absorbing, and not every absorbing state is a quarantine.

## 6. Future safety vs historical truth

Suppose effect E is UNKNOWN:

World W1: E happened.
World W2: E did not happen.

Now apply a safety action A that prevents any further harmful interaction with the relevant resource.

If A is safe in both W1 and W2, then:

A ∈ SAFE_UNDER_UNCERTAINTY({W1,W2})

After A, the system may be able to prove a future invariant:

NO_NEW_EFFECT_CAN_VIOLATE_C

But it still cannot infer:

E_DID_NOT_HAPPEN.

The uncertainty set may therefore remain non-singleton even while the future safety condition becomes strong.

This is a critical architectural separation:

WORLD_HISTORY_UNCERTAINTY
+
FUTURE_SAFETY_GUARANTEE

can coexist.

## 7. Safe-under-uncertainty predicate

Candidate predicate:

SAFE_UNDER_UNCERTAINTY(A, U, C)

iff for every world/history w in uncertainty set U that is consistent with current evidence:

- applying A is authorized in w;
- A does not violate C in w;
- A does not create an unacceptable new effect;
- A does not depend on knowing which w is actual;
- all required fences/enforcement paths for A are current;
- all relevant downstream continuations are covered.

If any allowed world makes A unsafe:

A is NOT admissible under U.

This gives a formal bridge between the earlier EffectOutcomeUncertaintySet work and recovery decisions.

## 8. Absorbing-state candidate theorem

Candidate design theorem, NOT formally proven:

If:

A. U is the complete allowed uncertainty set for claim C;
B. A is SAFE_UNDER_UNCERTAINTY(A,U,C);
C. A's effect footprint is completely contained in the current enforced scope;
D. A establishes a state S in which all future protected transitions are C-preserving unless separately admitted;
E. stale actors/effects cannot bypass S;
F. S's enforcement survives relevant crash/restart/restore boundaries;

then future safety may be reasoned about from S without resolving every historical branch in U.

Important:
This theorem says nothing about whether the historical uncertainty has been resolved.

## 9. What "absorbing" must mean

Not merely:

state == SAFE

Instead:

For every permitted transition from S:

S --t--> S' implies C(S').

And any transition that could violate C must require leaving the protected absorbing regime through a new protected admission.

Thus absorbing is a property of the transition relation, not a boolean label.

## 10. Examples of possible absorbing actions

Potential candidates, subject to effect-specific proof:

- disable further actuation;
- advance a resource-side fence;
- revoke a capability;
- isolate a resource;
- close a protected ingress path;
- move a resource into a fail-safe mode;
- make a queue reject stale commands;
- deactivate a known child-effect path;
- place a domain under a verified containment boundary.

None is universally safe.

Each must be proven against the complete uncertainty set and actual effect footprint.

## 11. Fencing is not history classification

Advancing a fence can establish:

OLD_ACTORS_CANNOT_PRODUCE_NEW_PROTECTED_EFFECTS

if the resource enforces the fence.

It cannot establish:

OLD_ACTORS_DID_NOT_ALREADY_PRODUCE_EFFECTS.

Therefore:

FENCE_PROGRESS != HISTORICAL_RECONCILIATION

and:

FENCE_VERIFIED != EFFECT_OUTCOME_VERIFIED.

## 12. Absorption and coordination-domain reduction

Suppose a transaction originally spans:

A + B + C + D.

If a verified absorbing containment action makes C and D incapable of producing or receiving any protected effect relevant to claim C, then future coordination may potentially reduce to:

A + B.

But only after proving:

1. C/D are actually enforced;
2. no downstream queue or autonomous process remains capable of relevant effect;
3. no hidden shared footprint remains;
4. the containment action itself is complete at the required claim strength;
5. C/D cannot re-enter the interaction domain without a new protected transition;
6. evidence/authority semantics are updated.

Thus:

ABSORPTION → POSSIBLE SCOPE REDUCTION

not:

ABSORPTION → AUTOMATIC SCOPE REDUCTION.

## 13. Closure-preserving absorption

Candidate concept:

ABSORBING_CLOSURE(C,U)

A containment action A is closure-preserving if, after A, every unresolved path capable of affecting claim C is either:

- blocked;
- fenced;
- included in the remaining coordination domain;
- transformed into a new explicitly admitted effect;
- or explicitly tolerated by the claim contract.

This avoids the dangerous mistake:

"we made one resource safe, therefore we can forget everything around it."

## 14. Absorbing state can simplify uncertainty, but not erase it

There are two different transformations:

A. epistemic collapse:
U = {w1,w2} → {w}

B. safety-space collapse:
AllowedFutureEffects(U) → AllowedFutureEffects'(U)

The first requires evidence that distinguishes histories.

The second can happen without resolving history if a monotonic containment action is safe across all histories.

This is one of the strongest distinctions found in this round.

## 15. Monotonicity

Candidate definition:

An action A is safety-monotonic for claim C if, for every allowed world w:

Risk_C(A(w)) <= Risk_C(w)

and A cannot create a new prohibited effect that was impossible before A.

But numerical risk is not sufficient for the formal model.

The stronger version is state-based:

For every w ∈ U:
C_safe(w) AND A_allowed(w) => C_safe(A(w))

and A does not enlarge the protected effect set in a way not covered by the current authorization.

## 16. Absorbing state and compensation

This research closes an important loophole.

If E is UNKNOWN and a compensation C would be harmful in one possible world, then C cannot become admissible merely because the system first entered an absorbing state.

If the absorbing action itself safely blocks future effects, it may be preferable to compensation because it can preserve safety without needing to decide whether E happened.

But historical classification remains unresolved.

Therefore:

CONTAINMENT MAY BE SAFE_WHILE_UNKNOWN

while:

COMPENSATION MAY NOT BE SAFE_WHILE_UNKNOWN.

This is claim/effect-class specific, not universal.

## 17. Absorbing state and retries

An idempotent retry may be safe for some APIs, but idempotency alone does not prove that retry is semantically desirable for every uncertainty branch. AWS explicitly discusses reconciliation when a timeout leaves it unclear whether the remote effect occurred. citeturn0search0

Therefore:

RETRY_SAFE != HISTORY_RESOLVED

and:

IDEMPOTENT != UNIVERSALLY_SAFE_UNDER_UNKNOWN.

A safe absorbing action may be the correct branch when it blocks further harm without requiring the uncertain history to be classified.

## 18. Absorption and crash/restart

A candidate absorbing state is not valid unless its safety properties survive:

- process crash;
- restart;
- checkpoint restore;
- storage rollback;
- coordinator replacement;
- resource restart;
- stale actor resurrection;
- network partition;
- recovery-of-recovery.

If restoring an old state can reopen the previously blocked effect path, the state was not durably absorbing.

Thus:

ABSORBING_STATE requires continuity/fencing semantics.

## 19. Absorption and decommission

Decommission can look absorbing locally while old controllers remain capable of acting.

Therefore:

LOCAL_DECOMMISSION != ABSORBING_GLOBAL_STATE

unless old effect paths are fenced or otherwise rendered unable to violate the claim.

This connects the current work directly to earlier decommission and resource-fencing research.

## 20. Absorption and hierarchical containment

A child can enter an absorbing safe state without making the parent claim absorbing.

Conversely, a parent containment state may restrict descendants without proving every descendant's historical state.

Therefore:

CHILD_ABSORPTION != PARENT_ABSORPTION

unless the parent's protected invariant is shown to be insensitive to every remaining child branch.

Promotion remains a refinement/proof obligation.

## 21. Absorption and multiple ancestors

For multiple ancestors:

A child is absorbing only relative to the effective constraint closure.

If an ancestor retains a constraint that can be violated by the child leaving the local absorbing state, the local absorbing proof is insufficient.

Thus the candidate absorbing state must bind:

EffectiveSafetyScope
+
EffectiveConstraintClosure
+
relevant shared-footprint closure.

## 22. Safe absorbing state can reduce CCD

Candidate transformation:

CCD_before = {A,B,C,D}

A verified absorbing action establishes:

C,D → NO_RELEVANT_FUTURE_EFFECT

Then:

CCD_after = {A,B}

only if the proof establishes that C/D cannot reintroduce interaction.

This creates a principled way to reduce coordination without weakening safety.

The reduction itself is a protected transition:

CCD_REDUCTION_REQUEST
→ VERIFY_ABSORPTION
→ VERIFY_CLOSURE
→ VERIFY_FENCE
→ INVALIDATE_OLD_SCOPE
→ PROTECTED_SCOPE_REDUCTION_LINEARIZATION
→ NEW_SCOPE_ACTIVE

## 23. Scope reduction race

Adversarial sequence:

1. CCD = {A,B,C}.
2. C is supposedly absorbed.
3. coordinator reduces scope to {A,B}.
4. C's old queue contains delayed effect.
5. C's resource restarts.
6. stale controller resumes.
7. A/B release based on reduced scope.

Required result:

OLD_C_PATH must be rejected/fenced before scope reduction becomes valid.

Therefore:

SCOPE_REDUCTION != removing C from a database row.

It is a safety transition requiring enforcement evidence.

## 24. Candidate object: AbsorptionCertificate

Provisional object:

AbsorptionCertificate {
  absorption_id
  claim_id
  effect_scope
  uncertainty_set_id
  absorbing_state
  blocked_effect_classes
  protected_transition_id
  required_fences
  resource_incarnations
  topology_version
  dependency_closure_version
  authority_epoch
  policy/invariant versions
  enforcement_evidence
  completeness_evidence
  continuity_context
  invalidation_triggers
  release_conditions
}

Again:

AbsorptionCertificate != authority.

## 25. Candidate object: SafetyAbsorbingState

SafetyAbsorbingState {
  state_id
  claim_id
  allowed_transitions
  forbidden_transitions
  required_guards
  enforcement_boundary
  exit_transition
  scope
  continuity_requirements
  invalidation_rules
}

The state is valid only relative to a claim and context.

## 26. Exit from absorbing state

An absorbing state should not be exited by ordinary scheduling.

Candidate:

ABSORBING
→ EXIT_REQUESTED
→ CURRENT_CONTEXT_VALIDATED
→ CURRENT_CONSTRAINTS_VALIDATED
→ NEW_SCOPE_COMPUTED
→ FENCES/RESOURCES_VALIDATED
→ PROTECTED_EXIT_LINEARIZATION
→ NEW_ADMISSION_CONTEXT.

An old capability must not silently regain ordinary execution.

## 27. The "safe tombstone" pattern

A particularly strong candidate pattern emerged:

Instead of trying to prove that a historical object never had an unresolved effect, permanently move it into a state where that object can no longer produce relevant protected effects.

This resembles a safety tombstone:

HISTORICAL_UNKNOWN
→ FENCED/ISOLATED
→ ABSORBING_SAFE_STATE

The tombstone does not claim:

"nothing happened."

It claims:

"regardless of what happened, this object can no longer produce the prohibited future effect."

This may dramatically simplify recovery for some effect classes.

## 28. Limits of the safe tombstone

It fails if:
- external effects cannot actually be fenced;
- autonomous behavior continues;
- queues survive;
- replacement resources inherit the same capability;
- shared physical resources remain active;
- another actor can re-enable the path;
- the safety invariant concerns historical state rather than future effects;
- compensation depends on knowing whether the original effect occurred.

Therefore tombstoning is an effect-class-specific primitive, not a universal recovery strategy.

## 29. Candidate invariant family

INV-ABS-01:
Absorption cannot convert UNKNOWN historical outcome into NO_EFFECT.

INV-ABS-02:
An absorbing state is defined by its transition relation, not a boolean label.

INV-ABS-03:
A candidate absorbing action must be safe across every world in the relevant uncertainty set.

INV-ABS-04:
Absorption cannot silently expand authority.

INV-ABS-05:
Verified absorption may reduce future coordination scope only after enforcement and closure are proven.

INV-ABS-06:
Old effect paths must be fenced/rejected before scope reduction.

INV-ABS-07:
Resource incarnation changes invalidate absorption evidence when relevant.

INV-ABS-08:
Restoration cannot reopen an absorbed effect path without a new protected transition.

INV-ABS-09:
Absorption does not imply historical reconciliation.

INV-ABS-10:
Local absorption does not imply global containment.

INV-ABS-11:
Child absorption does not imply ancestor absorption.

INV-ABS-12:
Absorption validity is claim-specific.

INV-ABS-13:
Absorption evidence is context-bound and invalidatable.

INV-ABS-14:
A safe absorbing action must not create a new unacceptable effect under any allowed uncertainty branch.

INV-ABS-15:
If no branch-invariant safe action exists, recovery remains HOLD/QUARANTINE.

INV-ABS-16:
A scope reduction following absorption is itself a protected transition.

INV-ABS-17:
Absorption must survive relevant crash/restart/recovery boundaries or the claim must remain unverified.

INV-ABS-18:
Absorption does not grant authority to exit the absorbing state.

INV-ABS-19:
A safe tombstone may preserve safety while historical truth remains UNKNOWN.

INV-ABS-20:
A tombstone is invalid if any unbounded path remains capable of violating the protected claim.

## 30. Formal model candidate

Extend the uncertainty model:

U = set of allowed world histories.

For action a:

SafeUnder(a,U,C) =
  ∀w ∈ U:
    Enabled(a,w,C)
    ∧ Preserves(C,a,w)
    ∧ NoForbiddenNewEffect(a,w)
    ∧ EnforcementComplete(a,w)

Then:

Absorbing(a,U,C,S) requires:
  SafeUnder(a,U,C)
  ∧ Result(a,w) ∈ S for all w ∈ U
  ∧ FutureTransitions(S) preserve C
  ∧ Exit(S) is protected
  ∧ stale paths are fenced
  ∧ restoration cannot bypass S.

This is a candidate formalization, not a verified theorem.

## 31. New attack: uncertainty set expansion

A dangerous case:

U initially = {W1,W2}.

Recovery action A is proven safe for both.

But executing A discovers a previously unknown downstream queue Q, creating:

U' = {W1a,W1b,W2a,W2b}.

Therefore:

SAFE_UNDER_UNCERTAINTY(A,U,C)

does not automatically imply that all later actions are safe under U'.

Recovery can increase uncertainty.

The architecture must therefore recompute the uncertainty set or establish a new conservative boundary whenever material hidden footprint is discovered.

## 32. New attack: apparently absorbing state with hidden continuation

Sequence:

E → UNKNOWN
→ local resource disabled
→ local state = SAFE
→ hidden provider queue executes
→ downstream resource changes.

Local state was absorbing only under an incomplete footprint.

Therefore:

ABSORBING proof requires effect-path closure.

## 33. New attack: safe state with unsafe exit

A state can be absorbing for safety while every exit path is dangerous.

This is acceptable.

The architecture must not weaken the absorbing proof merely to guarantee liveness.

Safety-first consequence:

SAFE_ABSORBING + NO_SAFE_EXIT

is a valid terminal safety state.

This is not a failure of the safety model.

## 34. New attack: absorbing state and evidence invalidation

If the proof that an object is absorbed depends on evidence that later becomes stale, the absorbing claim may have to degrade even if the physical containment remains.

Therefore:

PHYSICAL_SAFETY_STATE != EVIDENCE_CLAIM

The architecture may know the world is probably still contained while lacking enough current evidence to publish a strong verification claim.

## 35. New architecture consequence

The clean architecture should likely distinguish:

1. WORLD_EFFECT_STATE
2. EFFECT_OUTCOME_UNCERTAINTY
3. SAFETY_ABSORBING_STATE
4. CONTAINMENT_STATE
5. COORDINATION_SCOPE
6. RELEASE_ELIGIBILITY

These are not interchangeable.

A possible state relation:

UNKNOWN_HISTORY
  ↓
SAFE_UNDER_UNKNOWN ACTION
  ↓
ABSORBING_SAFE_STATE
  ↓
COORDINATION_SCOPE MAY SHRINK
  ↓
HISTORICAL_RECONCILIATION REMAINS OPTIONAL/REQUIRED BY CLAIM
  ↓
RELEASE ONLY THROUGH NEW PROTECTED CONTEXT

## 36. Distillation

CARRY_FORWARD:
- UNKNOWN is first-class.
- Safe-under-uncertainty action predicate.
- Absorption is transition-property, not boolean.
- Future safety can improve without historical truth.
- Fencing can establish future exclusion, not historical absence.
- Scope reduction requires verified enforcement.
- Safe tombstone pattern.
- Absorption is claim-specific.
- Recovery may remain safe without resolving all historical uncertainty.

REWORK:
- Formal uncertainty-set semantics.
- Absorbing state object.
- Absorption certificate.
- Scope reduction protocol.
- Interaction with containment hierarchy.
- Crash/restore semantics.

OPEN:
- Formal proof in TLA+/TLC.
- Complete effect-path closure.
- Runtime enforcement.
- External provider-specific absorbing contracts.
- Resource replacement semantics.
- Quantitative/bounded uncertainty representation.

REJECTED:
- UNKNOWN → SAFE solely because local state changed.
- FENCE → historical NO_EFFECT.
- QUARANTINE flag → global absorbing proof.
- Local disable → global containment.
- Scope reduction by administrative deletion.

## 37. New open gaps

G-ABS-01:
Formal proof of SAFE_UNDER_UNCERTAINTY.

G-ABS-02:
Formal definition of absorbing state over transition relation.

G-ABS-03:
Proof that absorption preserves claim across all allowed worlds.

G-ABS-04:
Effect-path closure required for absorption.

G-ABS-05:
Absorption under hidden queues/child effects.

G-ABS-06:
Absorption under resource replacement/incarnation.

G-ABS-07:
Absorption under rollback/recovery-of-recovery.

G-ABS-08:
Formal scope reduction after absorption.

G-ABS-09:
Absorption + hierarchical/multi-ancestor containment.

G-ABS-10:
Absorption + external-world reconciliation.

G-ABS-11:
Absorption + evidence invalidation.

G-ABS-12:
TLC/SANY verification.

## 38. Gate

No V21 implementation.
No runtime construction.
No claim of formal correctness.

Next attack:
**ABSORBING STATE + CONCURRENT EFFECTS + HIDDEN DOWNSTREAM CONTINUATIONS**, followed by a formal finite-state reduction candidate for TLC.
