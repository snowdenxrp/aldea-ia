# NEXO AB25 — USED ADMISSION CONTEXT, CONCRETE HISTORY LINKAGE, NEXT PRE/POSTCONDITIONS, AND HIDDEN-HISTORY ATTACKS V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No formal proof claimed.

## 1. Method cross-check

Lamport's refinement material distinguishes the higher-level behavior from the lower-level representation and notes that refinement mappings may require auxiliary history variables when the implementation's current state does not contain enough information. History variables record past behavior and can be added without changing the behavior of the actual variables.

This round therefore does not treat UsedAdmissionContext as a semantic assertion that an admission was authorized. It must be reconstructed from concrete admission linkage/history, otherwise the predicate would be circular.

## 2. Critical semantic rule

Do NOT define:

UsedAdmissionContext(e,a,b,t) := "a and b are valid for e at t".

That would make P_AA tautological/circular.

Instead:

UsedAdmissionContext(e,a,b,t) is an evidence-of-binding relation derived from the admission transition/history:

- the admission event references the attempt e;
- the admission event references or is causally/transactionally linked to authorization context a;
- the admission event references or is linked to bridge b;
- the linkage occurs at the protocol's defined admission point;
- the mapping does not use AuthorityValid, PolicyCompatible, DelegationValid, or IncarnationCompatible to manufacture the linkage.

Thus:
USED/LINKED != VALID/AUTHORIZED.

## 3. Concrete admission record candidate

Claim-scoped admission record:

AdmissionRecord =
  operation_id
  attempt_id
  subject
  resource_id
  resource_incarnation
  capability
  scope
  authority_epoch
  policy_context
  delegation_context
  bridge_id
  protocol_class
  decision_reference
  admission_position
  boundary

Only fields needed to reconstruct P_AA-relevant linkage should survive minimization.

Provider execution identity remains outside P_AA.

## 4. UsedAdmissionContext candidate

Define:

UsedAdmissionContext(e,a,b,t,h) iff the concrete history h contains an admission record at t whose bound authority reference corresponds to a and whose bridge reference corresponds to b, with the attempt/operation/resource linkage corresponding to e.

This is a historical/relational fact, not an authorization judgment.

Then:

P_AA(h) :=
  forall actual admission records r:
    if UsedAdmissionContext(r,e,a,b,t,h)
    then
      AuthorityValid(a,t,h)
      AND CompleteBinding(b,e,a,t,h)
      AND PolicyCompatible(a,b,t,h)
      AND DelegationValid(a,b,t,h)
      AND IncarnationCompatible(a,b,e,t,h)
      AND AdmissionProtocolValid(b,e,t,h).

## 5. Why the distinction matters

CM-AA121 — semantic-link circularity:
If UsedAdmissionContext is defined using AuthorityValid, an invalid admission can never be represented as using an invalid context. The model would prove the claim by definition.

CM-AA122 — unrelated-valid-context:
A valid a/b exists elsewhere, but the admission record references a different invalid context. P_AA must fail.

CM-AA123 — missing-reference ambiguity:
Admission record has no authority/bridge reference and history cannot reconstruct one. Result must be UNKNOWN/PENDING, not TRUE.

CM-AA124 — forged bridge identifier:
bridge_id exists but maps to a different subject/attempt/resource. Identifier equality alone is insufficient.

CM-AA125 — decision-reference substitution:
admission points to decision D1 but D1 authorized a different attempt or resource than the admitted one.

CM-AA126 — historical reconstruction alias:
two historical contexts have identical current fields but different authority issuance/revocation histories; only history distinguishes which context was used.

CM-AA127 — protocol-observer mismatch:
implementation logs a decision but not the actual admission linkage. Decision evidence cannot automatically substitute for admission linkage.

## 6. Exact candidate abstract transition schema

For each abstract action use:

Pre_A(x,h)
Post_A(x,x',h,h')
Frame_A(x,x')
Invalidation_A(x,x')
HistorySupport_A(h,h')
AdmissionLink_A(x,h)

The action is valid only if:
Pre_A
AND Post_A
AND Frame_A
AND all required cross-component invalidations
AND required history support.

This avoids treating each AA_Norm component as independently mutable.

## 7. Authority transitions

### IssueAuthority

Pre:
  issuer is permitted to issue authority under B0.

Post:
  new authority context exists with an issuance position.

Frame:
  existing unrelated authorities unchanged.

No automatic effect:
  existing leases do not become valid merely because a new authority exists.

### RevokeAuthority

Pre:
  target authority exists.

Post:
  target is no longer current-valid.

Frame:
  historical issuance remains reconstructable.

Cross-effect:
  any bridge whose validity depends on that authority becomes invalid or UNKNOWN according to available evidence.

### AdvanceEpoch

Pre:
  epoch transition permitted.

Post:
  current epoch advances.

Critical rule:
  new epoch does not create a new authority.

Cross-effect:
  old epoch-bound authority/bridge may become stale.

## 8. Delegation transition

ChangeDelegation:

Post:
  delegation validity relation changes.

Required cross-effect:
  any bridge or authority consequence depending on the changed delegation must be re-evaluated.

Unchanged capability/scope is not evidence that authorization remains valid.

## 9. Policy transition

ChangePolicy:

Post:
  current policy context changes.

Required cross-effect:
  PolicyCompatible must be recomputed for affected bindings.

Version order is not compatibility.

## 10. Resource reincarnation

ReincarnateResource:

Post:
  resource incarnation changes.

Required cross-effects:
  old incarnation bindings become incompatible;
  leases tied to the old incarnation cannot remain valid merely because their freshness interval has not expired;
  admission classes bound to old incarnation cannot silently alias the new incarnation.

## 11. Lease transition

IssueLease:

Pre:
  issuer/authority is valid;
  complete binding information exists;
  protocol class is LEASE;
  issuance is allowed.

Post:
  lease exists with all required binding fields and validity interval.

Important:
  IssueLease does not create authority.

ExpireLease:

Post:
  lease is no longer protocol-valid.

Authority remains unchanged unless independently modified.

## 12. Attempt and retry

CreateAttempt:

Post:
  new attempt identity exists.

RetryAttempt:

Post:
  new attempt identity exists unless the protocol explicitly defines retry as the same attempt.

Default rule:
  operation identity != attempt identity.

A prior attempt's bridge is not inherited unless an explicit binding rule proves equivalence for P_AA.

## 13. Decision

Decide:

Pre:
  required authorization facts can be evaluated.

Post:
  decision context exists.

Critical:
  decision authorization != admission authorization.

A later invalidation can occur between decision and admission unless the selected protocol explicitly prevents it.

## 14. Admission

Admit:

Pre:
  actual admission linkage is established;
  protocol bridge is valid for the selected protocol class;
  all P_AA predicates hold for the linked context.

Post:
  an AdmissionRecord is created/observed at the admission position.

The abstract action must not infer external provider success.

Abort:

Post:
  internal admission state becomes aborted/cancelled as defined.

No inference:
  Abort != proof of external no-effect.

## 15. Stuttering

A concrete transition may map to Stutter only if:

1. AA_Norm is unchanged;
2. UsedAdmissionContext linkage relevant to P_AA is unchanged;
3. required history support is unchanged;
4. no P_AA-relevant future capability has changed.

A change hidden in auxiliary history that alters future P_AA is not safely classified as stuttering.

## 16. Hidden-history attacks

CM-AA128 — hidden revocation:
same AA_Norm now, but one history contains a revocation relevant to a later admission.

CM-AA129 — hidden reincarnation:
same current resource identifier, different prior incarnation history.

CM-AA130 — hidden delegation:
same current capability, different delegation history.

CM-AA131 — hidden policy transition:
same current policy identifier, different compatibility-relevant transition history.

CM-AA132 — hidden lease replay:
same lease fields, but one history shows prior consumption/replay.

CM-AA133 — hidden attempt:
same operation, different attempt history.

CM-AA134 — hidden admission order:
same final fields, different ordering between invalidation and admission.

CM-AA135 — hidden decision/admission bridge:
same decision record, different actual bridge linkage.

CM-AA136 — hidden boundary transition:
B0 is fixed in this model; any dynamic boundary event therefore must either be excluded by assumption or promoted into the model rather than silently ignored.

## 17. History minimization rule

A history item d may be removed only if:

For every pair h1,h2 differing only in d,
and every allowed future continuation C,

P_AA(h1,C) = P_AA(h2,C),

or the abstraction explicitly returns UNKNOWN/PENDING whenever the distinction cannot be recovered.

Therefore:

MINIMAL_HISTORY != MINIMAL_EVENT_LOG.

The target is the smallest history support that preserves all P_AA-relevant future distinctions.

## 18. New refinement contract

Candidate:

M_AA(c,h) = AA_Norm(c,h)

with a separate claim-scoped support relation:

Support_AA(c,h)

such that:

Rep_AA(c,h,a) requires:
- AA_Norm agreement;
- all P_AA-relevant admission linkage recoverable;
- all required history distinctions either represented or reconstructable;
- no hidden authority amplification.

A state mapping without support sufficiency is incomplete.

## 19. Temporal-position question

Three positions are currently proposed, but this round does NOT establish sufficiency.

At minimum, traces must distinguish:
1. before invalidation;
2. after invalidation but before admission;
3. after admission.

If the protocol permits multiple relevant events between these positions whose ordering changes P_AA, more positions or an ordered event structure may be necessary.

Therefore temporal cardinality remains open.

## 20. AB25 result

Major closure:

UsedAdmissionContext is now defined as an independently reconstructed historical/relational linkage, not as a disguised authorization predicate.

This eliminates a major circularity risk.

The abstract transition schema now explicitly separates:
- precondition;
- postcondition;
- frame;
- cross-component invalidation;
- history support;
- admission linkage.

CM-AA121..136 attack linkage, reconstruction, history minimization, and temporal ordering.

The six-component AA_Norm remains viable but is NOT formally frozen.

## 21. AB26 frontier

1. Build the complete transition table for every action with explicit pre/post/frame/invalidation/history rules.
2. Derive concrete trace witnesses for CM-AA107..136.
3. Attack the three-position temporal abstraction.
4. Test whether AdmissionBindingClass and LeaseBridge can be safely quotiented together.
5. Derive the exact behavioral equivalence relation.
6. Only then draft TLA+.
