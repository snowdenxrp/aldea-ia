# NEXO — AB10 AUTHORITY ORDER, CURRENTNESS, FENCE, ATTEMPT IDENTITY AND MINIMAL DOMAIN ADVERSARIAL RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No theorem claimed proven.

## 0. Scope

This round attacks AB9-G1..G8 before any TLA+ module is drafted.

Selected first claim remains:

P_AA:
  every internally admitted effect has a currently valid Z1 authority matching the exact admission binding.

The model stops at Z1 -> Z3 admission. It does not assert external execution or Z4 world effect.

## 1. External cross-check

Lamport's TLA+ material supports using invariants for safety and refinement mappings for implementation-to-higher-level correspondence. Auxiliary/history variables can be introduced when needed to construct a refinement mapping. citeturn0search4turn0search24turn0search25

Cousot's work emphasizes that correctness of abstraction depends on the chosen concrete/abstract correspondence, and reduced products can exchange information between domains to obtain a more precise abstraction. citeturn0search12turn0search26

These sources support methodology only; they do not establish Nexo's properties.

## 2. AB10-G2 — Authority order attack

A simple set-inclusion order is insufficient unless the consequence universe is fixed.

Candidate claim-scoped authority preorder:

a ⪯A,P b iff every authority consequence relevant to P under the same subject/resource/incarnation/currentness/boundary that follows from a also follows from b.

This is not a generic permission-set order.

Required fixed context:
- subject;
- resource;
- resource incarnation;
- authority epoch/currentness;
- boundary;
- policy baseline;
- claim P.

Without these, two apparently comparable authorities can differ in a way that makes the comparison unsound.

## 3. Historical vs current authority

Candidate predicates:

WasAuthorized(a,h,t0)
CurrentAuthorized(a,h,t)

CurrentAuthorized requires more than historical existence.

Candidate:

CurrentAuthorized =
WasAuthorized
AND epoch_is_current
AND not_revoked
AND delegation_valid
AND resource_incarnation_current
AND policy_compatible
AND boundary_allows

This is a candidate semantic definition, not yet a theorem.

Key invariant candidate:

HISTORICAL_AUTHORITY_MUST_NOT_BE_PROMOTED_TO_CURRENT_AUTHORITY.

## 4. Authority order is contextual, not global

Counterexample:

A1 authorizes resource R incarnation 7.
A2 authorizes R incarnation 8.

Treating A1 and A2 as globally ordered by permission-set inclusion can erase the incarnation distinction.

Therefore authority comparison must either:
- include incarnation/currentness in the compared object; or
- refuse comparison when those dimensions differ.

Candidate result:
AUTHORITY_INCOMPARABLE rather than forced ordering.

## 5. AB10-G3 — Epoch and revocation semantics

A currentness predicate must distinguish at least:

EPOCH_MATCH
REVOCATION_CLEAR
DELEGATION_VALID
RESOURCE_INCARNATION_MATCH
POLICY_COMPATIBLE
BOUNDARY_ALLOWED

A stale epoch is not equivalent to revocation.

Why this matters:
- stale epoch may arise from succession/rotation;
- revocation may target a still-current epoch;
- both invalidate admission, but for different reasons and potentially different recovery/reconciliation behavior.

Candidate structured invalidity:

AuthorityValidity =
VALID
STALE_EPOCH
REVOKED
DELEGATION_INVALID
INCARNATION_MISMATCH
POLICY_INCOMPATIBLE
BOUNDARY_DENIED
UNKNOWN

UNKNOWN is epistemic and must not be treated as another form of invalidity.

## 6. Epoch semantics must be claim-specific

Higher epoch does not automatically mean:
- more authority;
- newer truth;
- valid current authority.

Epoch is an ordering/context mechanism, not a universal truth order.

Candidate invariant:

EPOCH_MONOTONICITY_DOES_NOT_IMPLY_AUTHORITY_MONOTONICITY.

This preserves the previously established rule:
higher generation != current authority.

## 7. AB10-G4 — Fence analysis

Fence can be modeled in three ways:

F1: Fence is part of Authority.
F2: Fence is a separate admission capability bound to Authority.
F3: Fence is a temporal freshness witness used by the admission protocol.

Adversarial result:
Treating F1/F2/F3 as interchangeable is unsafe.

A fence can establish protocol ordering/freshness without independently granting semantic permission.

Therefore candidate decomposition:

Authority:
  WHO + WHAT + WHERE + WHICH INCARNATION + EPOCH

Fence:
  WHETHER THIS ADMISSION INSTANCE IS STILL FRESH/VALID FOR THE PROTOCOL

This is a design hypothesis, not a proven universal rule.

## 8. Fence reuse countermodel

Sequence:

1. authority A at epoch E1 is valid;
2. fence F1 issued;
3. authority context rotates to E2;
4. F1 remains syntactically valid;
5. admission uses F1.

If F1 does not bind to the current authority context, a syntactically valid fence can authorize an invalid admission.

Therefore:

FENCE_VALIDITY != FENCE_SYNTAX_VALIDITY

Candidate requirement:

FenceValidity must be evaluated against the authority/currentness context.

## 9. AB10-G5 — Policy baseline compatibility

Policy version must not be treated as interchangeable with authority epoch.

Candidate compatibility relation:

PolicyCompatible(P_auth, P_current, C)

where C is an explicit compatibility relation.

Do not assume:
P_auth <= P_current
implies compatibility.

Do not assume:
P_current is newer
implies safe compatibility.

Policy changes may be non-monotonic.

Candidate invariant:

POLICY_VERSION_ORDER_DOES_NOT_IMPLY_POLICY_COMPATIBILITY.

## 10. Policy and authority are separate semantic dimensions

An authority can be valid while the policy under which the requested admission is evaluated has changed.

Therefore:

VALID_AUTHORITY + INCOMPATIBLE_POLICY
=> NOT_ADMISSIBLE

unless an explicit transition/compatibility rule says otherwise.

This avoids hidden authority amplification through policy interpretation.

## 11. AB10-G6 — Operation vs attempt identity

Candidate identities:

OperationIdentity =
logical requested operation

AttemptIdentity =
one concrete attempt to realize that operation

One operation can have:
A1, A2, A3 attempts.

Therefore:

OperationIdentity != AttemptIdentity

Authority may be:
- operation-scoped;
- attempt-scoped;
- both.

The first model must not silently choose one.

## 12. Attempt-binding requirement

Candidate:

BindingScope(A) ∈
{OPERATION, ATTEMPT, OPERATION_AND_ATTEMPT}

If authority is attempt-scoped:

Auth(A1) cannot automatically authorize A2.

If authority is operation-scoped:

A2 may inherit authority only if the specification explicitly permits it and preserves all required currentness/incarnation/policy/fence conditions.

Candidate invariant:

RETRY_DOES_NOT_IMPLICITLY_INHERIT_AUTHORITY.

## 13. Hidden temporal distinction

AB9's original candidate state stored current authority and admitted effects.

Countermodel shows that this may be insufficient:

At t1:
A is valid.
Effect E admitted.

At t2:
A is revoked.

If abstract state stores only current authority, it cannot determine whether E was validly admitted at t1.

Therefore the admitted-effect record must preserve either:
- the authorization snapshot relevant to admission; or
- enough history to reconstruct it.

This is a major AB10 result.

## 14. Minimal admission authorization snapshot

Candidate:

AdmissionAuthorizationSnapshot =
(
  subject,
  resource_id,
  resource_incarnation,
  capability,
  scope,
  authority_epoch,
  policy_baseline,
  delegation_digest,
  fence_context,
  admission_time
)

Not every field is necessarily required in the final domain.

But the snapshot must preserve every distinction on which P_AA depends at admission time.

## 15. AB10-G7 — Deriving the abstract domain from countermodels

Countermodel -> required distinction:

CM-AA1 stale epoch -> authority_epoch + admission_time/currentness rule
CM-AA2 revocation -> revocation state/history
CM-AA3 incarnation -> resource_incarnation
CM-AA4 scope -> scope
CM-AA5 capability -> capability
CM-AA6 fence reuse -> fence_context + binding
CM-AA7 policy -> policy_baseline + compatibility
CM-AA8 retry confusion -> attempt_id + binding scope
CM-AA9 historical/current confusion -> temporal authority semantics
CM-AA10 external success -> explicit boundary exclusion

Therefore the minimal candidate domain cannot be merely:

currentAuthority + admittedEffects.

It needs an admission-time authorization snapshot or an equivalent history mapping.

## 16. AB10-G8 — Finite-domain sufficiency attack

For bounded P_AA, a finite domain remains plausible, but only if all semantic relations are finite.

Candidate finite carriers:

Subject = finite set
Operation = finite set
Attempt = finite set
Resource = finite set
Incarnation = finite set
Epoch = finite set
Capability = finite set
Scope = finite set
Policy = finite set
Fence = finite set

However, adding arbitrary history length would make the state space explode.

Therefore candidate strategy:

retain only the finite admission-time snapshots required by the claim, not the entire concrete history.

This is a candidate abstraction strategy, not yet a proof.

## 17. Countermodel: snapshot deletion

CM-AA11:

1. E admitted under valid A/E1.
2. Admission snapshot discarded.
3. Current state shows A/E2.
4. Later audit asks whether E was validly admitted under E1.

If the abstraction cannot distinguish:
- E admitted under valid E1
from
- E admitted under invalid/stale E1,

then the abstraction is claim-incomplete for historical admission validity.

Expected result:
HISTORY_INCOMPLETE / UNKNOWN,
not a fabricated TRUE or FALSE.

## 18. Countermodel: current-state aliasing

CM-AA12:

Two histories end in identical current state:

H1:
E admitted while authority valid.

H2:
E admitted while authority invalid.

After revocation/rotation, current state is identical.

Therefore:

FINAL_STATE_EQUIVALENCE != ADMISSION_HISTORY_EQUIVALENCE.

A current-state-only abstraction is insufficient for P_AA if the claim includes historical validity of prior admissions.

## 19. Representation consequence

For P_AA, representation must preserve an admission-history equivalence:

c1 ≡AA c2

only if no P_AA-relevant admission validity distinction differs between c1 and c2.

Thus generic state equivalence is insufficient.

Candidate:

Rep_AA(c,a)
requires preservation of the authorization snapshot or an equivalent sufficient witness for every admitted effect still within P_AA's temporal scope.

## 20. Reduced-product implication

Authority, policy, incarnation, and fence are not independent dimensions.

A Cartesian product can represent them, but independent component reasoning may miss cross-component constraints.

Cousot's reduced-product work explicitly studies exchanging observations among abstract components to obtain more precise results. citeturn0search26turn0search8

Nexo implication:

The first abstract domain may need a reduced relation between:
Authority × Incarnation × Policy × Fence

rather than four independent facts.

But we must not assume a reduced product is automatically sound for P_AA; the reduction operator itself needs a claim-specific correspondence.

## 21. Stronger candidate invariant set AD10

AD10-01 AUTHORITY_ORDER_IS_CLAIM_SCOPED
AD10-02 AUTHORITY_COMPARISON_REQUIRES_FIXED_CONTEXT
AD10-03 HISTORICAL_AUTHORITY_IS_NOT_CURRENT_AUTHORITY
AD10-04 CURRENTNESS_REQUIRES_EPOCH_REVOCATION_DELEGATION_INCARNATION_POLICY_BOUNDARY
AD10-05 UNKNOWN_AUTHORITY_VALIDITY_IS_NOT_INVALIDITY
AD10-06 EPOCH_ORDER_DOES_NOT_IMPLY_AUTHORITY_ORDER
AD10-07 FENCE_VALIDITY_IS_NOT_SYNTAX_VALIDITY
AD10-08 FENCE_MUST_BIND_TO_REQUIRED_AUTHORITY_CONTEXT
AD10-09 POLICY_ORDER_DOES_NOT_IMPLY_POLICY_COMPATIBILITY
AD10-10 POLICY_COMPATIBILITY_IS_EXPLICIT
AD10-11 OPERATION_IDENTITY_IS_DISTINCT_FROM_ATTEMPT_IDENTITY
AD10-12 RETRY_DOES_NOT_IMPLICITLY_INHERIT_AUTHORITY
AD10-13 ADMISSION_VALIDITY_IS EVALUATED_AT_ADMISSION_TIME
AD10-14 HISTORICAL_ADMISSION_VALIDITY_REQUIRES_SNAPSHOT_OR_EQUIVALENT_HISTORY
AD10-15 FINAL_STATE_EQUIVALENCE_DOES_NOT_IMPLY_HISTORY_EQUIVALENCE
AD10-16 CURRENT_STATE_ONLY_ABSTRACTION_MAY_BE_CLAIM_INCOMPLETE
AD10-17 ABSTRACTION_MUST_PRESERVE_P_AA_RELEVANT_ADMISSION_DISTINCTIONS
AD10-18 COMPONENT_PRODUCTS_REQUIRE_CROSS_COMPONENT_COMPATIBILITY
AD10-19 REDUCTION_OPERATOR_REQUIRES_CLAIM_SPECIFIC_SOUNDNESS
AD10-20 EXTERNAL_SUCCESS_REMAINS_OUTSIDE_P_AA

## 22. AB10 status

AB10-G1: ADVANCED — P_AA attacked for hidden temporal state.
AB10-G2: ADVANCED — claim-scoped authority preorder candidate.
AB10-G3: ADVANCED — epoch/revocation/currentness distinctions separated.
AB10-G4: ADVANCED — fence separated from semantic authority.
AB10-G5: ADVANCED — policy compatibility separated from version ordering.
AB10-G6: ADVANCED — operation/attempt binding formalized as a required choice.
AB10-G7: ADVANCED — countermodels derive required domain dimensions.
AB10-G8: OPEN — finite-domain sufficiency not yet established.

## 23. New frontier

AB11-G1 — formalize the exact authority consequence universe used by ⪯A,P.
AB11-G2 — formalize currentness as a temporal predicate.
AB11-G3 — determine whether revocation is state, event, or both.
AB11-G4 — derive the minimal fence semantics from concrete admission protocol.
AB11-G5 — define policy compatibility without assuming monotonic versions.
AB11-G6 — define operation/attempt binding semantics.
AB11-G7 — construct the smallest complete admission snapshot.
AB11-G8 — test whether the resulting domain is closed under transitions.
AB11-G9 — attack reduced-product soundness.
AB11-G10 — only then draft the TLA+ state machine.

## Verification boundary

No implementation.
No TLA+ execution.
No TLC execution.
No theorem claimed proven.
