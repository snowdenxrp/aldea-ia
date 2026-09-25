# NEXO AB32 — ORDER SUPPORT, LEASE/BINDING FACTORIZATION, ASSESSMENT PROVENANCE, AND ABSTRACT NEXT V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+, no TLC, no TLAPS, no formal proof claimed.

## 1. External methodology cross-check

Lamport's current material confirms that auxiliary/history variables may be introduced to construct refinement mappings; stuttering variables are a separate mechanism; and refinement can be reasoned about using coarser-grained specifications. The Byzantine Paxos material explicitly describes checking safety refinements with TLC before attempting proofs. These are methodological supports, not evidence that Nexo's proposed model is correct.

## 2. Main AB32 question: can AdmissionOrderSupport disappear?

Candidate factorization:
Ord_AA = Order(AdmissionBindingClass) + Order(LeaseBridge) + ResidualOrder.

The important distinction is now:
SEMANTIC RELATION != TOP-LEVEL STATE VARIABLE.

AdmissionOrderSupport can be eliminated as an explicit component iff a reconstruction function exists:

ReconstructOrd_AA(AdmissionBindingClass, LeaseBridge, AuxiliaryHistory)

such that, for every P_AA-relevant concrete history:
1. every order fact required to assess the actual admission is reconstructed;
2. replay/consumption order is preserved;
3. invalidation-before-admission order is preserved;
4. decision/admission linearization is preserved;
5. retry/attempt linkage order is preserved;
6. future P_AA observations are unchanged;
7. if reconstruction is impossible, assessment is UNKNOWN rather than guessed.

This gives five obligations:
F1 Reconstruction completeness
F2 Transition preservation
F3 Future behavioral equivalence
F4 No hidden authority amplification
F5 UNKNOWN on unresolved reconstruction.

Current result: these obligations are NOT proven. Therefore AdmissionOrderSupport remains semantically required as a derived concept, but NOT justified as a separate state variable.

## 3. LeaseBridge vs AdmissionBindingClass

AdmissionBindingClass answers:
"Which relational admission tuple is actually being admitted?"

LeaseBridge answers:
"Which protocol mechanism carries the authorization facts from decision/issuance to admission?"

They overlap but have different semantic roles.

Candidate bridge fields:
subject, operation, attempt, resource, incarnation, authority epoch, policy context, delegation context, capability/scope, boundary, bridge id, protocol class, freshness/expiry, replay state, issuance/decision position.

Candidate binding class:
subject, operation, attempt, resource, incarnation, capability/scope, authority context, policy compatibility, delegation validity, boundary, protocol-relevant linkage.

A merge is safe only if the merged quotient preserves both roles for every future continuation.

## 4. New attack: merge LeaseBridge + BindingClass

CM-AA241: same binding tuple, different bridge protocol -> different admission validity.
CM-AA242: same bridge, different binding class -> different subject/resource admission.
CM-AA243: bridge valid at issue, policy changes before admission.
CM-AA244: bridge valid at issue, delegation changes before admission.
CM-AA245: bridge valid at issue, resource reincarnates before admission.
CM-AA246: bridge replayed on a different attempt.
CM-AA247: bridge reused across operation identities.
CM-AA248: bridge consumed once vs reusable bridge.
CM-AA249: atomic protocol represented with lease-like fields but no interval.
CM-AA250: recheck protocol has no persistent bridge but current context differs from decision context.

Result: no unconditional merge is justified.

## 5. Assessment provenance

Question: does provenance belong in semantic state?

Current answer: generally NO, unless provenance changes the semantics of the claim assessment itself.

Separate:
WorldTruth: what actually happened.
Evidence: retained observations/history.
Assessment: what the abstraction can soundly establish.
Provenance: why the assessment was established.

Candidate:
Assessment_AA ∈ {TRUE_JUSTIFIED, FALSE, UNKNOWN}
AssessmentReason is metadata unless future transitions can depend on it.

If two states have identical claim semantics and future P_AA behavior but different explanatory provenance, provenance is auxiliary, not semantic state.

Counterexamples:
CM-AA251: provenance-only difference, no future semantic difference -> should quotient away.
CM-AA252: provenance controls which witness can be reused -> then provenance is actually hidden semantic state and must be represented.
CM-AA253: evidence source identity changes independence/common-mode assumptions -> provenance becomes claim-relevant.
CM-AA254: same assessment but one witness is no longer within retention scope -> assessment changes under future continuation.

Therefore provenance classification is claim-relative and future-behavioral.

## 6. Typed UNKNOWN refinement

Do not use UNKNOWN as a third world-truth value.

Candidate semantic decomposition:
WorldStatus ∈ {TRUE, FALSE, NOT_ESTABLISHED}
AssessmentStatus ∈ {JUSTIFIED, UNJUSTIFIED}
Operationally expose:
TRUE_JUSTIFIED
FALSE
UNKNOWN

UNKNOWN means the current representation does not soundly establish either admissible conclusion.

A concrete world can be TRUE while abstract assessment is UNKNOWN.
A concrete world can be FALSE while abstract assessment is UNKNOWN.
This is essential for abstraction soundness.

## 7. First abstract transition system on paper

State candidate:
S = <AuthorityContext, ResourceIncarnation, PolicyContext, DelegationContext, LeaseBridgeSet, AdmissionBindingClasses, AuxiliaryHistory>

Initial condition:
- no admission is considered justified until an actual admission record/link exists;
- authority/policy/delegation/resource contexts are internally coherent;
- bridge/binding collections may be empty.

Next action classes:
AUTH_ISSUE
AUTH_REVOKE
EPOCH_ADVANCE
DELEGATION_CHANGE
POLICY_CHANGE
RESOURCE_REINCARNATE
LEASE_ISSUE
LEASE_EXPIRE
ATTEMPT_CREATE
RETRY
DECIDE
ADMIT
ABORT
STUTTER

The semantic transition rule is not "change one field." Every action must preserve/update every relation whose P_AA consequences can change.

## 8. Admission rule

For an actual admission record e at t, identify the linked authority a and bridge b from the admission linkage/history.

Then require:

AuthorityValid(a,t)
AND CompleteBinding(b,e,a,t)
AND PolicyCompatible(a,b,t)
AND DelegationValid(a,b,t)
AND IncarnationCompatible(a,b,e,t)
AND AdmissionProtocolValid(b,e,t)

No unrelated valid witness may satisfy the claim.

Historical linkage remains immutable evidence of what was used; later revocation does not rewrite the historical admission record.

## 9. Protocol unification

ATOMIC, LEASE, RECHECK can share the same semantic kernel if they implement the same abstract AdmissionProtocolValid predicate.

They must differ in refinement obligations:
ATOMIC: authorization and admission are one atomic semantic point.
LEASE: a bridge must remain valid through the admission interval and obey replay/expiry/binding rules.
RECHECK: required facts must be re-established at admission.

Therefore:
ProtocolClass != ClaimClass.
ProtocolClass selects refinement obligations, not a different safety property.

## 10. Stuttering condition

An implementation step may stutter at the abstract level only if:
- AA semantic state is unchanged;
- actual admission linkage is unchanged;
- all retained P_AA-relevant history support is unchanged;
- the set of allowed future P_AA observations is unchanged.

A hidden change that affects any of these cannot be called stuttering merely because visible scalar fields stayed equal.

## 11. AB32 result

1. AdmissionOrderSupport should remain a semantic relation/obligation, not a frozen top-level variable.
2. It can disappear from explicit state only after F1-F5 are demonstrated.
3. LeaseBridge and AdmissionBindingClass cannot yet be merged.
4. Assessment provenance is auxiliary by default, but can become semantic when it affects witness reuse, independence, retention, or future assessment.
5. UNKNOWN is epistemic/assessment state, not world truth.
6. ATOMIC/LEASE/RECHECK can share one claim kernel, but require protocol-specific refinement obligations.
7. We now have a paper-level abstract state and action vocabulary, but it is not yet ready for TLA+.

## 12. AB33 frontier

1. Derive exact pre/post/frame/invalidation/history-support/admission-link contracts for every abstract action.
2. Attack the unified protocol kernel with cross-protocol countermodels.
3. Determine the minimal witness structure required for AssessmentStatus.
4. Prove or refute the F1-F5 factorization obligations on bounded histories.
5. Define the exact refinement relation before writing TLA+.
6. Only if the relation stabilizes, draft the first TLA+ module.
