# NEXO AB24 — P_AA TRANSITION-LEVEL KERNEL ATTACKS, EXACT NEXT CANDIDATE, AND QUOTIENT OBLIGATIONS V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No formal proof claimed.

## 1. Continuity check

AB23 defined six protocol-independent semantic components and CM-AA95..106. This round attacks the predicates through transitions rather than isolated states and checks whether the candidate kernel survives future behavioral splitting.

Lamport's material confirms that TLA+ executions are state sequences with steps, that the definition of a step matters for concurrent systems, and that refinement may require history variables. A refinement mapping is a claim about behaviors, not merely a field-by-field state conversion.

## 2. Critical correction to the AB23 formula

AB23 used:

Admit(e,t) => exists a,b : Valid(a,b,e,t)

Adversarial analysis found a semantic hole: mere existence of some valid authorization witness does not establish that the admitted effect actually used that witness.

New requirement:

UsedAdmissionContext(e,a,b,t)

must identify the authorization context and bridge actually associated with the admission linearization point.

Candidate:

P_AA :=
  forall e,t,a,b :
    UsedAdmissionContext(e,a,b,t) =>
      AuthorityValid(a,t)
      AND CompleteBinding(b,e,a,t)
      AND PolicyCompatible(a,b,t)
      AND DelegationValid(a,b,t)
      AND IncarnationCompatible(a,b,e,t)
      AND AdmissionProtocolValid(b,e,t)

Equivalent existential form is permitted only if the existential witness is explicitly tied to the actual admission event:

AdmitUsing(e,a,b,t) => ...

An unrelated valid witness must never satisfy the claim.

## 3. Predicate non-circularity

The kernel predicates must not prove one another by hidden duplication.

Recommended semantic separation:

AuthorityValid:
  current authority consequences only.

CompleteBinding:
  structural/relational binding of actual admission to the authority context.

PolicyCompatible:
  policy semantics required at admission.

DelegationValid:
  delegation-chain semantics required at admission.

IncarnationCompatible:
  resource-generation semantics.

AdmissionProtocolValid:
  protocol-specific bridge/linearization semantics.

Thus:

CompleteBinding does NOT imply AuthorityValid.
PolicyCompatible does NOT imply AuthorityValid.
DelegationValid does NOT imply AuthorityValid.
Lease freshness does NOT imply AuthorityValid.

The predicates jointly establish P_AA.

## 4. Transition-level attack basis

T1 AuthorityIssue:
  creates a historical authority candidate but does not by itself make every existing bridge valid.

T2 AuthorityRevoke:
  invalidates current authority while preserving historical fact that it once existed.

T3 EpochAdvance:
  does not grant authority and may invalidate an old authority snapshot.

T4 DelegationChange:
  may invalidate an unchanged capability/scope.

T5 PolicyChange:
  may invalidate an otherwise identical bridge.

T6 ResourceReincarnate:
  invalidates bindings tied to the prior incarnation.

T7 LeaseIssue:
  creates a protocol bridge only when all required binding fields are present.

T8 LeaseExpire:
  invalidates lease-based admission even if authority remains current.

T9 AttemptCreate:
  establishes a distinct attempt identity.

T10 Retry:
  must not inherit authorization implicitly from another attempt.

T11 Decide:
  creates a decision context; decision validity is not automatically admission validity.

T12 Admit:
  must reference the actual authorization/bridge context used.

T13 Abort:
  does not establish that an external effect never occurred.

T14 Stutter:
  is allowed only when all abstract P_AA-relevant variables remain unchanged.

## 5. New countermodels

CM-AA107 — unrelated valid witness:
A valid authorization exists for subject S1/operation O1 while admission actually uses an invalid S2/O2 context. The old existential formula incorrectly passes.

CM-AA108 — stale witness alias:
Two authority contexts have equal visible capability/scope but different epochs. Only one is current.

CM-AA109 — policy-valid historical bridge:
bridge is structurally valid and historically policy-compatible but current policy is incompatible.

CM-AA110 — delegation-valid-at-issue:
delegation was valid when lease was issued but revoked before admission.

CM-AA111 — incarnation-valid-at-issue:
resource was valid at lease issue but reincarnated before admission.

CM-AA112 — lease freshness without semantic binding:
lease is temporally fresh but lacks subject/operation/attempt/incarnation binding.

CM-AA113 — decision witness substitution:
decision was authorized under a1 but admission references b bound to a2.

CM-AA114 — retry inheritance:
attempt 2 reuses attempt 1's bridge without an explicit binding rule.

CM-AA115 — recheck partiality:
recheck verifies authority and policy but omits delegation or incarnation.

CM-AA116 — atomic split:
authorization and admission are modeled as separate steps while the protocol class claims ATOMIC.

CM-AA117 — hidden invalidation:
an invalidating transition occurs between lease issue and admission but is absent from the bridge validity predicate.

CM-AA118 — temporal alias:
two histories have identical current fields but opposite ordering of revoke/admit; P_AA differs.

CM-AA119 — stuttering disguise:
a P_AA-relevant transition is incorrectly classified as stuttering.

CM-AA120 — protocol-only split:
same abstract semantic state produces different P_AA result solely because implementation protocol changed, without a protocol assumption changing.

## 6. Exact abstract Next candidate

Let:

AA_Norm =
  <Auth, Inc, Policy, Delegation, Lease, AdmissionClass>

Candidate abstract transition relation:

Next_AA ==
  IssueAuthority
  \/ RevokeAuthority
  \/ AdvanceEpoch
  \/ ChangeDelegation
  \/ ChangePolicy
  \/ ReincarnateResource
  \/ IssueLease
  \/ ExpireLease
  \/ CreateAttempt
  \/ RetryAttempt
  \/ Decide
  \/ Admit
  \/ Abort
  \/ Stutter

Each action must specify:
- precondition;
- fields changed;
- fields that must remain unchanged;
- cross-component invalidations;
- effect on AdmissionClass;
- whether a prior bridge remains valid;
- whether historical support must be retained.

## 7. Cross-component transition rules

Authority revoke:
  Auth changes.
  Existing Lease may become semantically invalid even if lease syntax is unchanged.

Policy change:
  Policy changes.
  Existing Lease may become invalid.

Delegation change:
  Delegation changes.
  Existing Lease may become invalid.

Resource reincarnation:
  Incarnation changes.
  Existing Lease and AdmissionClass bindings to old incarnation become invalid.

Epoch advance:
  Auth/currentness changes.
  Existing bridge may become stale.

Lease expiry:
  Lease changes.
  Authority need not change.

Attempt creation/retry:
  AdmissionClass changes.
  Authority need not change.

These cross-effects prevent componentwise transition reasoning from being sufficient.

## 8. Future behavioral quotient

State equality is insufficient.

Define candidate:

h1 ≈AA h2 iff

1. their mapped AA_Norm states are equivalent;
2. their retained auxiliary histories provide the same P_AA-relevant distinctions;
3. for every allowed future environment/transition continuation C,
   the corresponding future admission outcomes are identical;
4. if the abstraction cannot establish (3), the result is UNKNOWN rather than TRUE.

This is intentionally stronger than current-state equality.

## 9. History-variable obligation

A history variable is legitimate only if it supplies information required for refinement while not changing the externally represented abstract behavior.

If deleting a history distinction causes a future P_AA split, that history distinction is not removable merely because the current AA_Norm tuple is unchanged.

Candidate test:

Delete d from history.
Construct h1,h2 identical after deletion.
Search continuation C such that:
  P_AA(h1,C) != P_AA(h2,C).

If found:
  d is required support.

Lamport's auxiliary-variable treatment specifically shows why a history variable can be required for a refinement mapping when current implementation state cannot reconstruct the higher-level behavior.

## 10. Transition-level completeness criterion

For each concrete transition τ:

If τ can change any P_AA-relevant consequence, then one of the following must hold:

A. M_AA maps τ to a corresponding abstract transition;
B. τ maps to a sequence of abstract transitions whose composition preserves the claim;
C. τ is genuinely stuttering because AA_Norm and all required auxiliary semantics are unchanged;
D. the abstraction explicitly yields UNKNOWN/PENDING.

No P_AA-relevant transition may silently disappear.

## 11. Boundary of external effects

Admit is the Z1→Z3 authorization boundary.

The model must not convert:
  Admit
into:
  ExternalEffectOccurred.

Likewise:
  Abort
does not prove
  ExternalEffectNeverOccurred.

Provider execution remains outside P_AA.

## 12. Protocol classes

ATOMIC:
  admission linearization point and authorization are one semantic atomic transition.

LEASE:
  authorization is established before admission and carried through a complete bound lease whose validity can be invalidated by relevant state changes.

RECHECK:
  admission evaluates the complete P_AA predicate against current state.

These are protocol refinements of the same claim, not three different definitions of authorization safety.

## 13. Current unresolved issue

The exact semantics of UsedAdmissionContext must be tied to implementation history.

If the implementation does not expose which authority/bridge actually authorized the admission, the refinement mapping may need auxiliary history to reconstruct that relation.

If that relation cannot be reconstructed, P_AA cannot safely be upgraded from UNKNOWN to TRUE.

## 14. Finite-model basis

Keep current candidate bounds:
Subjects=2
Operations=2
Attempts=2
Resources=2
Incarnations=2
Epochs=2
Policies=2
Delegations=2
Leases=2
Capabilities/Scopes=2
Temporal positions=3
Boundary=B0 fixed.

These remain hypotheses, not completeness guarantees.

## 15. AB24 result

Major semantic correction:

The P_AA witness must be the authorization context actually used by the admission, not merely any valid context existing somewhere in the state.

The transition relation now has an explicit candidate and cross-component invalidation semantics.

The future-behavioral quotient is the remaining key barrier before formalization.

No TLA+ module is drafted yet because UsedAdmissionContext, quotient completeness, and exact transition pre/postconditions still require closure.

## 16. AB25 frontier

1. Formalize UsedAdmissionContext from concrete admission history.
2. Derive exact pre/postconditions for every Next_AA action.
3. Generate complete traces for CM-AA95..120.
4. Attack future quotient with hidden-history continuations.
5. Determine whether three temporal positions suffice.
6. Freeze the semantic kernel only if no unrepresented future split remains.
7. Then draft TLA+.
