# NEXO AB33 — P_AA ACTION CONTRACTS, CROSS-PROTOCOL ATTACKS, AND REFINEMENT RELATION V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+. No TLC. No TLAPS. No formal proof claimed.

## 1. Methodological cross-check

Lamport's official material states that refinement mappings connect a lower-level implementation to a higher-level specification, that auxiliary/history variables may be introduced to construct such mappings, and that stuttering steps leave the relevant abstract variables unchanged. His Byzantine Paxos example reports checking safety refinements with TLC before attempting proofs. These sources support the workflow, not Nexo's correctness.

## 2. Canonical action contract

For every abstract action A use:

A = <Pre_A, Post_A, Frame_A, Invalidation_A, HistorySupport_A, AdmissionLink_A>

The contract must identify:
- what must be true before the action;
- what semantic facts become true afterward;
- what must remain unchanged;
- which existing bridges/bindings become invalid;
- what historical distinction must be retained;
- whether an actual admission linkage is created, changed, or consumed.

A field change without its relational consequences is not a complete abstract transition.

## 3. AUTH_ISSUE

Pre:
- issuer has authority to issue;
- subject/resource/scope/capability are well-formed;
- epoch/policy/delegation context is coherent.

Post:
- a new authority context exists;
- its identity/resource/incarnation/epoch/policy/delegation/boundary consequences are fixed.

Frame:
- unrelated authority contexts and unrelated admissions unchanged.

Invalidation:
- none for existing unrelated contexts;
- future admissions cannot silently use the new authority for old bindings unless explicitly linked.

History:
- issuance event retained if later historical authorization assessment depends on it.

AdmissionLink:
- none.

## 4. AUTH_REVOKE

Pre:
- revocation targets an existing authority or authority epoch.

Post:
- current validity is removed for the targeted context.

Invalidation:
- dependent leases/bridges/bindings become invalid when their contract says revocation is relevant.

Critical distinction:
- revocation does NOT rewrite historical admission linkage.
- historical use remains evidence of what was used; current validity is separately evaluated.

## 5. EPOCH_ADVANCE

Post:
- current authority epoch changes according to the model.

Invalidation:
- epoch-bound authority/bridges whose epoch no longer matches become stale.

Counter-risk:
- epoch monotonicity alone does not establish replacement authority or admission validity.

## 6. DELEGATION_CHANGE

Post:
- delegation context changes.

Invalidation:
- every bridge/binding whose validity depends on the changed delegation chain is re-evaluated.

Joint requirement:
- delegation validity must be evaluated against the actual authority context, not an unrelated valid chain.

## 7. POLICY_CHANGE

Post:
- policy context changes.

Invalidation:
- affected bridge/binding contexts are invalid or unknown according to the policy compatibility contract.

Version number alone is not semantic compatibility.

## 8. RESOURCE_REINCARNATE

Post:
- resource incarnation changes.

Invalidation:
- old-incarnation bridges/bindings cannot silently authorize the new incarnation.

Resource identity alone is insufficient.

## 9. LEASE_ISSUE

Pre:
- an authorized issuer establishes a bridge for a specific subject/operation/attempt/resource/incarnation/authority/policy/delegation context.

Post:
- LeaseBridge is created with protocol class, freshness, replay rule, and all P_AA-relevant bindings.

Invalidation:
- any later context change specified as lease-invalidating must invalidate it.

Critical:
- a lease is not authority itself.
- a lease is not external effect.

## 10. LEASE_EXPIRE

Post:
- targeted bridge is no longer admissible under its freshness contract.

Historical linkage remains unchanged.

Replay state must distinguish expired, consumed, and never-issued where those distinctions affect P_AA.

## 11. ATTEMPT_CREATE / RETRY

Create:
- creates a distinct attempt identity when the protocol requires it.

Retry:
- must not silently inherit authorization/bridge state merely because operation identity is unchanged.

If retry inheritance is permitted, it must be an explicit protocol rule and preserve subject/resource/incarnation/policy/delegation/authority/boundary binding.

## 12. DECIDE

Pre:
- actual decision context exists.

Post:
- a decision/bridge reference can be created.

The decision is not itself admission.

For ATOMIC, decision and admission may share one semantic point.
For LEASE, decision creates/refreshes a bridge subject to future validity.
For RECHECK, decision is not sufficient evidence of admission authorization.

## 13. ADMIT

Pre:
- an actual admission event is linked to the authority/bridge/binding context actually used.

Post:
- immutable AdmissionRecord exists.

Safety assessment:
AuthorityValid
AND CompleteBinding
AND PolicyCompatible
AND DelegationValid
AND IncarnationCompatible
AND AdmissionProtocolValid.

No existential witness may be substituted for the actual linked context.

## 14. ABORT

ABORT does not imply:
- external cancellation;
- no external effect;
- historical erasure.

It may remove pending abstract obligations only if the claim contract explicitly permits that reduction.

## 15. STUTTER

A concrete step may map to abstract stuttering only if:
- all abstract semantic state is unchanged;
- actual admission linkage is unchanged;
- required retained history support is unchanged;
- future P_AA observation possibilities are unchanged.

This follows the methodological meaning of stuttering as leaving relevant variables unchanged.

## 16. Cross-protocol attack

ATOMIC:
CM-AA255 — hidden state changes between supposed atomic decision/admission point.
CM-AA256 — implementation splits atomicity while abstract model hides the split.

LEASE:
CM-AA257 — lease remains syntactically present after authority revocation.
CM-AA258 — lease survives resource reincarnation.
CM-AA259 — lease replayed across attempts.
CM-AA260 — lease valid at issue but policy/delegation changes before admission.

RECHECK:
CM-AA261 — recheck omits delegation.
CM-AA262 — recheck omits incarnation.
CM-AA263 — recheck omits policy.
CM-AA264 — recheck validates current context but not actual admission binding.
CM-AA265 — recheck occurs after a relevant mutation.

Cross-protocol:
CM-AA266 — all three produce identical final scalar state but different actual admission semantics.
CM-AA267 — protocol class omitted from quotient creates future behavior split.
CM-AA268 — protocol class retained but bridge semantics differ under same class.
CM-AA269 — atomic protocol incorrectly inherits lease replay rules.
CM-AA270 — recheck incorrectly inherits decision-time validity.

## 17. Protocol unification result

One claim kernel remains viable:

AuthAtAdmission(e,t) :=
∃ actual linked a,b :
AuthorityValid(a,t)
AND CompleteBinding(b,e,a,t)
AND PolicyCompatible(a,b,t)
AND DelegationValid(a,b,t)
AND IncarnationCompatible(a,b,e,t)
AND AdmissionProtocolValid(b,e,t)

But protocol-specific refinement obligations remain mandatory.

Thus:
ONE CLAIM KERNEL
+
THREE REFINEMENT CONTRACTS

is currently preferable to three separate safety claims.

## 18. Refinement relation candidate

Define:

R_AA(C,H,A) iff
1. current abstract semantic context A corresponds to concrete context C;
2. every abstract authority consequence has a concrete counterpart;
3. every actual admission in C has a corresponding abstract admission;
4. its UsedAdmissionContext is preserved;
5. required order/bridge/binding facts are recoverable;
6. invalidation relations are preserved;
7. omitted distinctions are represented in H;
8. no abstract authority exceeds concrete authority;
9. unresolved correspondence yields UNKNOWN/PENDING rather than fabricated equivalence.

This is a forward simulation candidate, not yet a proof.

## 19. Transition obligation

For every concrete step C -> C':
if R_AA(C,H,A), then there must exist A' and H' such that:
- A -> A' is a legal abstract step, OR
- A' is the same abstract state under legitimate stuttering;
- R_AA(C',H',A');
- all newly relevant admissions have correct assessments.

If no corresponding abstract step can be justified, refinement fails or the assessment becomes unresolved.

## 20. Refinement vs exact quotient

Forward simulation is sufficient candidate machinery for conservative safety abstraction.

It is NOT yet enough to claim exact behavioral equivalence.

Exact quotient would additionally require the abstraction to preserve and reflect the relevant future observation behavior.

Do not call this bisimulation yet.

## 21. Minimal witness structure attack

A witness for P_AA cannot be merely:
<authority_id, bridge_id>.

Minimum candidate relational witness must recover:
subject, operation, attempt, resource, incarnation, capability/scope, authority epoch/currentness, policy context, delegation validity, boundary, protocol bridge/freshness/replay semantics.

If a field is absent, prove it is derivable from preserved relations before removing it.

## 22. AB33 conclusion

The action contracts expose a recurring rule:

STATE UPDATE != SEMANTIC TRANSITION.

Every action must update its cross-component invalidation and history obligations.

The three protocol classes can share one semantic safety kernel, but only under protocol-specific refinement contracts.

The refinement relation is now concrete enough to attack, but not yet stable enough to encode in TLA+.

## 23. AB34 frontier

1. Attack the exact R_AA relation with implementation/abstract countermodels.
2. Test whether every action preserves R_AA.
3. Minimize the witness structure component-by-component.
4. Determine whether protocol class can be represented solely inside AdmissionProtocolValid without becoming hidden semantic state.
5. Attack forward simulation against a deliberately coarser abstraction.
6. Only after R_AA survives, write the first abstract TLA+ specification.
