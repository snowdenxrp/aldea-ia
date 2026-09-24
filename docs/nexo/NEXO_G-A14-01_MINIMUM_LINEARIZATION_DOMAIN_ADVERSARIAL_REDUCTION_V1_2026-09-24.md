# NEXO G-A14-01 — Minimum Linearization Domain Adversarial Reduction
## Research + Code Study Delta V1 — 2026-09-24

Status: RESEARCH / ADVERSARIAL REDUCTION / PRE-FORMALIZATION
No implementation. No SANY/TLC proof.

## 1. Objective

Attack the candidate minimum protected linearization domain by attempting to remove one semantic field or relation at a time.

Candidate:
Identity/Lifecycle + Authority + Effect Identity + Fence + STOP relation + Safety Context + Accepted Currentness relation + Recovery ownership + Critical history/UNKNOWN floor.

The objective is not to prove minimality mathematically yet. It is to discover concrete safety counterexamples for reductions and identify which fields are genuinely semantic versus implementation conveniences.

## 2. Research cross-check

TLA+ distinguishes step refinement from data refinement. A lower-level transition may require multiple concrete steps to implement one abstract step, but the mapping must preserve abstract behavior. Stuttering steps are allowed only when the abstractly relevant state does not change. citeturn0search30turn0search0

TLA+ also describes invariants as properties that must hold in every reachable state; this is the appropriate level for the first reduction pass. citeturn0search4turn0search8

Raft's client serial-number mechanism directly supports keeping stable logical command identity in the replicated state machine across commit/response ambiguity. citeturn0search29

etcd demonstrates atomic comparison/update within one authoritative transaction domain, while serializable reads may be stale. This supports treating linearization-domain membership as a semantic property rather than merely a storage layout decision. citeturn0search7turn0search5

etcd's documented snapshot restore behavior is a concrete rollback counterexample: an internally integrity-checked snapshot may represent an older revision, so restore uses revision bumping and a new logical cluster identity to prevent stale history from being mistaken for the current cluster lineage. citeturn0search2

## 3. Reduction R0 — Full candidate

R0 contains:
- identity/lifecycle;
- authority;
- operation/effect identity;
- fence;
- STOP relation;
- safety context;
- accepted currentness relation;
- recovery ownership;
- critical history/UNKNOWN floor.

R0 is the reference candidate.

## 4. Reduction R1 — Remove Effect Identity

Counterexample:
1. Operation A is admitted.
2. External attempt occurs.
3. Response is lost.
4. State is UNKNOWN.
5. Recovery creates operation B with identical target/payload.
6. B is admitted as unrelated.

Result:
duplicate effect or erasure of unresolved identity.

Therefore stable operation/effect identity cannot be externalized from the authoritative domain unless an equivalent protected identity mechanism exists in another domain.

Finding:
EFFECT IDENTITY is SEMANTICALLY NECESSARY.

## 5. Reduction R2 — Remove Fence

Counterexample:
1. Actor A holds fence 10.
2. Recovery actor B obtains fence 11.
3. A remains alive with stale local state.
4. A attempts protected execution.
5. If the linearization domain does not own/validate the fence relation, stale A can race with B.

Result:
stale actor may pass a protected transition.

Finding:
FENCE is SEMANTICALLY NECESSARY for distributed/stale-actor execution unless an equivalent protected exclusion mechanism is formally shown.

## 6. Reduction R3 — Remove STOP relation

Counterexample:
1. Admission reads STOP=clear.
2. STOP is asserted in another domain.
3. Admission commits.
4. Executor acts after STOP.

Without a shared protected ordering relation, the architecture cannot establish whether the admission was before or after STOP for the safety property.

Finding:
STOP relation is SEMANTICALLY NECESSARY for any transition whose safety semantics are STOP-dominated.

Qualification:
The core need not store every STOP detail. It must contain the authoritative epoch/relation needed to order admission against STOP.

## 7. Reduction R4 — Remove Safety Context

Counterexample:
1. Admission is validated under VersionSet V1.
2. Policy/invariant context changes to V2.
3. The old admission remains usable.
4. Capability/effect reaches execution under V2 assumptions.

Result:
context substitution.

Finding:
A context-binding relation is SEMANTICALLY NECESSARY.

Qualification:
The full policy/invariant documents need not be inside the core; a protected context fingerprint/version/epoch is sufficient if invalidation is enforced.

## 8. Reduction R5 — Remove Currentness relation

Counterexample:
1. Protected replicas all restore from an old but internally consistent snapshot.
2. Internal state says authority epoch 10.
3. External currentness anchor indicates lineage 20.
4. No protected relation binds state to the current anchor.
5. Recovery treats internal agreement as current authority.

Result:
rollback resurrection.

etcd's snapshot restore behavior demonstrates the general issue: integrity of restored state does not imply that it is the current revision lineage. citeturn0search2

Finding:
CURRENTNESS RELATION is SEMANTICALLY NECESSARY whenever rollback detection depends on an external or independent continuity mechanism.

## 9. Reduction R6 — Remove Recovery ownership

Counterexample:
1. Recovery is initiated by two actors.
2. Both observe a pending operation.
3. Both attempt reconciliation/release.
4. There is no authoritative recovery owner/epoch.
5. Both can produce conflicting completion or capability state.

Result:
split-brain recovery.

Finding:
RECOVERY OWNERSHIP or an equivalent serialized recovery coordination mechanism is necessary.

Qualification:
A dedicated recovery-owner field is not mandatory if the same semantics are encoded by a generalized fence/lease/epoch mechanism. The semantic requirement is unique current recovery authority.

## 10. Reduction R7 — Remove Identity/Lifecycle anti-resurrection state

Counterexample:
1. Identity X is decommissioned.
2. Old snapshot restores X.
3. Restored X has apparently valid authority state.
4. No protected lifecycle closure prevents reuse.
5. X resumes.

Result:
identity resurrection.

Finding:
LIFECYCLE / ANTI-RESURRECTION relation is necessary.

Qualification:
This may be represented as an identity epoch or lifecycle floor rather than a separate lifecycle object.

## 11. Reduction R8 — Remove critical history/UNKNOWN floor

Counterexample:
1. External effect becomes UNKNOWN.
2. Record ages.
3. Compactor deletes the detailed record.
4. New operation with same semantic target is admitted.
5. Old external effect later appears.

Result:
duplicate effect or false reconciliation.

Finding:
A protected terminal/UNKNOWN history floor is necessary for as long as the system cannot prove that the unresolved identity is irrelevant.

This does not require infinite history. It requires a safe compaction frontier and durable summary.

## 12. Reduction R9 — Remove authority itself

Counterexample:
1. Capability exists.
2. Authority is revoked.
3. Executor retains capability.
4. No protected authority epoch is consulted.
5. Effect proceeds.

Result:
revoked authority remains effective.

Finding:
AUTHORITY is irreducible as a semantic concept.

Capability is not an authority substitute.

## 13. Reduction R10 — Remove all currentness and use only local revision

Counterexample:
1. Local revision reaches 100.
2. Full local state rolls back to revision 80.
3. All local replicas are restored consistently to 80.
4. Local revision remains internally monotonic from the restored system's perspective.
5. No independent continuity relation exists.

Result:
the system can incorrectly declare itself current.

Finding:
a local revision alone cannot establish currentness across full rollback.

## 14. Reduction R11 — Remove target/effect binding

Counterexample:
1. Authorization is valid for target T1.
2. Target binding changes to T2.
3. Capability remains otherwise valid.
4. Executor uses it against T2.

Result:
TOCTOU/cross-target authorization.

Finding:
exact target/effect context binding is required at the protected admission/effect boundary.

This can be represented as a fingerprint/reference rather than storing the complete target object.

## 15. Reduction R12 — Remove explicit VersionSet but retain generic context hash

Potentially safe only if the generic context hash has formally equivalent semantics:
- all safety-relevant policy/invariant/version dependencies included;
- invalidation rules complete;
- no hidden context expansion.

Therefore:
VERSIONSET is not necessarily a unique field.
CONTEXT BINDING is the semantic requirement.

This is an example of a field that may be an implementation representation rather than an irreducible semantic object.

## 16. Reduction R13 — Remove separate Recovery field

Potentially safe if:
- recovery authority is encoded by the same protected fence/epoch;
- recovery state is distinguishable from normal execution authority;
- recovery cannot self-upgrade;
- recovery-specific transitions are serialized.

Therefore:
RECOVERY OWNERSHIP is semantic, but a separate physical record is not necessarily required.

## 17. Reduction R14 — Remove separate STOP field

Potentially safe only if the general authority/fence state contains a formally equivalent STOP-dominance relation that survives restart and cannot be overwritten by ordinary execution.

Therefore:
STOP STATE as a separate object may be eliminated.
STOP DOMINANCE semantics cannot.

## 18. Reduction R15 — Remove separate Currentness field

Potentially safe only if the protected state contains an equivalent immutable/current lineage relation whose rollback detection is independently anchored.

Therefore:
CURRENTNESS RELATION cannot be removed.
Its representation can potentially be folded into a protected lineage/currentness witness record.

## 19. Result: semantic necessities vs representations

### Semantically necessary

1. Current authority relation.
2. Exact operation/effect identity.
3. Stale-actor exclusion/fence relation.
4. STOP-dominance relation.
5. Safety-context binding.
6. Currentness/anti-rollback relation.
7. Recovery ownership/exclusion.
8. Lifecycle anti-resurrection.
9. Critical UNKNOWN/history floor.
10. Exact target/effect binding.

### Potentially mergeable representations

- VersionSet + policy/invariant context → one protected SafetyContext.
- STOP object + authority/fence → one protected AdmissionGuard relation, if semantics are preserved.
- Recovery owner + general fence → one generalized CoordinationEpoch, if recovery-specific restrictions remain.
- Currentness relation + recovery lineage → one protected LineageContext, if cross-domain binding remains explicit.
- Lifecycle state + identity epoch → one IdentityLifecycle record.

This is a meaningful reduction.

## 20. Candidate compressed semantic kernel

The current candidate can therefore be reduced conceptually to:

PROTECTED_IDENTITY
PROTECTED_AUTHORITY
PROTECTED_EFFECT_BINDING
PROTECTED_COORDINATION
PROTECTED_SAFETY_CONTEXT
PROTECTED_CURRENTNESS_LINEAGE
PROTECTED_RECOVERY_STATE
PROTECTED_UNKNOWN_HISTORY

with derived predicates:

AdmissionValid
StopBlocking
AuthorityCurrent
FenceCurrent
CurrentnessValid
RecoveryEligible
EffectBindingValid
CompactionEligible

This is smaller than the earlier object list without removing the semantic protections.

## 21. Critical caveat

The reduction is not yet a proof of minimality.

A field can be semantically necessary while being represented by:
- a tuple;
- an epoch;
- a hash;
- a protected record;
- a state-machine variable;
- a derived predicate.

Conversely, two fields that look mergeable may become unsafe if their invalidation domains differ.

Therefore minimality must be defined semantically, not by number of database columns.

## 22. Pre-formal model shape

Candidate finite abstract state:

Identity:
ACTIVE / DECOMMISSIONED

Authority:
VALID / REVOKED

Coordination:
owner ∈ {NONE,A,B}
epoch ∈ small bounded set

STOP:
CLEAR / BLOCKING
stop_epoch ∈ small bounded set

Context:
V1 / V2

Currentness:
VALID / UNKNOWN / INVALID

Effect:
NONE / PENDING / UNKNOWN / TERMINAL

Recovery:
NONE / OWNED_A / OWNED_B / QUARANTINED

Admission:
NOT_ADMITTED / ADMITTED

The finite model should deliberately include crashes as transitions that can lose volatile state while preserving protected state, plus rollback transitions that restore an older protected snapshot and alter/lose the independent currentness relation.

## 23. Required invariants for first finite model

I1:
No effect is admitted without current authority.

I2:
No stale coordination owner can complete a protected effect.

I3:
STOP-blocked state cannot produce new protected admission.

I4:
UNKNOWN effect identity cannot be silently replaced by a new operation.

I5:
Invalid/unknown currentness cannot authorize current admission.

I6:
Decommissioned identity cannot regain normal authority.

I7:
Recovery cannot create normal authority without explicit release.

I8:
Context-incompatible admission cannot become current execution.

I9:
Terminal compaction cannot occur while protected UNKNOWN dependencies remain.

I10:
Target/effect binding cannot change after protected admission without re-admission.

I11:
A capability or derived executor credential cannot bypass the protected admission predicate.

I12:
A local state rollback cannot restore authority if currentness continuity is absent.

## 24. Adversarial conclusion

The attempted removals did NOT reveal a contradiction in the compressed kernel.

They did reveal that several apparent fields are representations of deeper relations rather than independent semantic necessities.

Most important:
- STOP can potentially fold into a general AdmissionGuard;
- recovery ownership can potentially fold into Coordination;
- VersionSet can fold into SafetyContext;
- currentness can fold into LineageContext.

What cannot disappear are the underlying relations.

## 25. Mini-audit

Result:
The minimum-domain hypothesis becomes smaller and more precise.

No candidate semantic protection was safely eliminated.

Five representation merges appear plausible and should be tested formally.

No implementation should begin from this reduction yet.

The next step is to build a bounded abstract model specifically to try to falsify the compressed kernel, not to declare it proven.

## 26. Status

Semantic minimum: DESIGN REFINED.
Representation compression: DESIGN CANDIDATE.
Finite model: SPECIFICATION PLANNED.
Formal proof: NOT PROVEN.
SANY/TLC: NOT RUN.
Implementation: NOT STARTED.
Architecture-build gate: CLOSED.

Next target:
Construct the bounded abstract model and first test the compressed kernel against STOP/admission, revoke/admission, fence takeover, currentness rollback, UNKNOWN retry, recovery-owner races, compaction, context activation, target substitution and capability bypass.
