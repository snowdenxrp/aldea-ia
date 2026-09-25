# NEXO AB34 — R_AA ATTACK, REFINEMENT-PRESERVATION MATRIX, WITNESS MINIMIZATION, AND PROTOCOL-HIDING RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+, no TLC, no TLAPS, no formal proof claimed.

## 1. AB33 continuity audit

AB33 was re-read before this round. Its canonical relation is:

R_AA(C,H,A)

with correspondence, actual-admission linkage, recoverable order/bridge/binding, invalidation preservation, auxiliary history support, authority non-amplification, and UNKNOWN/PENDING for unresolved correspondence.

A repository code-search pass for the current implementation did not return matches for the abstract research terms. This does not establish absence from the implementation; it only means the current code search did not provide a direct implementation correspondence. Therefore no implementation-level refinement claim is made.

## 2. Direct attack on R_AA

R_AA is attacked by constructing C1,C2 with the same candidate abstract representation A but different P_AA-relevant future behavior.

A candidate R_AA is insufficient if any of the following can happen:
- a concrete admission has no unique abstract used context;
- two concrete histories map to one abstract state but diverge on a future admission assessment;
- an abstract authority consequence exists without a concrete counterpart;
- a required invalidation exists concretely but disappears abstractly;
- a historical linkage distinction is erased and later changes the assessment;
- protocol class is erased while future behavior differs.

## 3. Countermodels CM-AA271–282

CM-AA271 — USED-CONTEXT COLLAPSE:
Two concrete admissions have different linked authority contexts but identical scalar authority IDs. Abstract mapping merges them; future revocation affects one but not the other.

CM-AA272 — BRIDGE-SUBSTITUTION:
Two bridges carry different replay/expiry semantics but map to one abstract bridge identity. Same current fields, different future admission result.

CM-AA273 — POLICY-HISTORY LOSS:
Policy is currently compatible in both histories. One history contains a policy change after bridge issue; the other does not. A later admission diverges.

CM-AA274 — DELEGATION-HISTORY LOSS:
Same current delegation state, but different historical delegation transition relative to bridge issue causes different lease validity.

CM-AA275 — INCARNATION-HISTORY LOSS:
Same resource identity/current incarnation representation, but one bridge was issued for an older incarnation and one for the current incarnation.

CM-AA276 — RETRY-ALIAS:
Operation is equal but attempts differ. Mapping merges attempts; one bridge is one-shot, the other reusable.

CM-AA277 — DECISION-ADMISSION ORDER LOSS:
Same decision and admission records but different linearization relation. A revoke occurs between them in one history.

CM-AA278 — UNKNOWN-COLLAPSE:
Abstract mapping cannot reconstruct whether invalidation preceded admission. Treating this as TRUE or FALSE breaks conservative assessment. Correct result is UNKNOWN.

CM-AA279 — AUTHORITY AMPLIFICATION:
Abstract representation contains a valid authority consequence not represented by any concrete authority context.

CM-AA280 — PROTOCOL-HIDING:
ATOMIC and LEASE histories map to the same state, but lease expiry creates a future split.

CM-AA281 — RECHECK-HIDING:
RECHECK and DECISION-time semantics map together even though a required field changes between decision and admission.

CM-AA282 — STUTTER-FORGERY:
A concrete step changes retained history or future admission possibilities while visible abstract fields remain unchanged. It cannot be stuttering.

## 4. R_AA preservation obligations

For each concrete transition c -> c':

R1 State correspondence:
R_AA(c,h,a) implies every abstract semantic fact has a concrete counterpart.

R2 Linkage preservation:
Every actual admission remains associated with its actual authority/bridge/binding context.

R3 Invalidation preservation:
If a concrete event invalidates a P_AA-relevant context, the abstract state must invalidate it or become UNKNOWN.

R4 History-support preservation:
If future assessment depends on an omitted distinction, that distinction must remain reconstructible in H.

R5 Order preservation:
Every order relation that can affect actual admission validity remains represented or derivable.

R6 Protocol preservation:
The refinement retains enough information to apply the correct AdmissionProtocolValid semantics.

R7 No authority amplification:
Abstraction may not create authorization consequences absent from concrete state.

R8 Assessment conservatism:
Loss of a required distinction may produce UNKNOWN; it may not silently produce TRUE_JUSTIFIED.

R9 Future closure:
Equivalent mapped states must have equivalent sets of relevant future P_AA observations, or the mapping must remain non-equivalent/UNKNOWN.

R10 Boundary preservation:
Z1->Z3 claim scope remains fixed; no external Z4 success is inferred.

## 5. Action-by-action stress matrix

AUTH_ISSUE:
Must create an authority context and preserve its binding identity. Existing unrelated bridges cannot acquire it implicitly.

AUTH_REVOKE:
Must invalidate every dependent context according to the contract while retaining historical linkage.

EPOCH_ADVANCE:
Must not manufacture replacement authority. Stale contexts must become stale/unknown according to the contract.

DELEGATION_CHANGE:
Must propagate to every affected bridge/binding. Same current endpoint does not erase historical validity distinctions.

POLICY_CHANGE:
Must propagate compatibility changes. Version ordering alone is insufficient.

RESOURCE_REINCARNATE:
Must break old-incarnation bindings unless explicit semantics preserve them.

LEASE_ISSUE:
Must bind bridge to all P_AA-relevant dimensions. A syntactically valid identifier is not sufficient.

LEASE_EXPIRE:
Must preserve distinction among expired, consumed, and never-issued if those affect future observations.

ATTEMPT_CREATE/RETRY:
Must preserve attempt identity whenever retry semantics can differ.

DECIDE:
Must not become an implicit admission.

ADMIT:
Must create immutable linkage to the actual used context.

ABORT:
Must not imply external no-effect or historical erasure.

STUTTER:
Must preserve semantic state, linkage, history support, and future observation set.

## 6. Witness minimization

Candidate witness dimensions are classified:

Essential unless derivable:
subject
operation
attempt
resource
incarnation
authority context/currentness
capability/scope
policy compatibility
delegation validity
boundary
protocol class/semantics
freshness/replay

Potentially derivable:
explicit bridge ID
explicit decision ID
explicit fence ID
timestamps
event sequence numbers

A dimension can be removed only if a deterministic or claim-sound derivation exists from retained relations and preserves every future P_AA continuation.

This is behavioral minimization, not field-count minimization.

## 7. Protocol class as hidden semantic state

Question:
Can ProtocolClass be removed and retained only inside AdmissionProtocolValid?

Current answer:
Only if the semantics of AdmissionProtocolValid are uniquely determined by retained bridge/binding structure.

Counterexample:
ATOMIC and LEASE can have identical subject/resource/authority/policy fields, but only LEASE has an expiry obligation. If expiry cannot be derived elsewhere, removing ProtocolClass causes future behavior collapse.

Therefore ProtocolClass may be:
- explicit semantic state;
- derivable tag inside LeaseBridge;
- or encoded entirely in the structure of the bridge.

It cannot simply disappear without a derivability proof.

## 8. Forward simulation attack

A deliberately coarser abstraction that retains only:
AuthorityContext + ResourceIncarnation + PolicyContext + DelegationContext

fails because it loses:
- actual bridge;
- attempt binding;
- replay semantics;
- decision/admission linkage;
- protocol;
- relevant order.

A second abstraction adding LeaseBridge but not AdmissionBindingClass fails under subject/operation/attempt/resource substitutions.

A third adding AdmissionBindingClass but omitting history support fails under hidden invalidation/order cases.

Therefore the current minimum remains at least:
AuthorityContext
ResourceIncarnation
PolicyContext
DelegationContext
LeaseBridge
AdmissionBindingClass
plus claim-relevant auxiliary history.

This is a lower-bound result from countermodels, not a proof of global minimality.

## 9. New factorization condition

AdmissionOrderSupport can be eliminated as explicit state only if:

OrderNeeded(e) = f(AdmissionBindingClass(e), LeaseBridge(e), HistorySupport(e))

and f is:
- total for all represented histories;
- claim-sound;
- transition-preserving;
- future-behavior preserving.

If f is partial, undefined cases must map to UNKNOWN rather than arbitrary order.

## 10. Refinement relation status

R_AA now has explicit attack obligations and survives only conditionally.

We have NOT proved:
- totality of R_AA;
- existence of a mapping for all implementation states;
- transition preservation for all concrete actions;
- exact behavioral equivalence;
- minimality.

The correct status is:
CANDIDATE REFINEMENT RELATION / ADVERSARIALLY CONSTRAINED.

## 11. Important boundary correction

The current research claim remains strictly:
Z1 authorization/admission safety at the Z1 -> Z3 boundary.

It does NOT prove:
- external provider success;
- external-world effect;
- absence of later side effects;
- external cancellation;
- Z4 truth.

Those require separate C3/effect-path/enforcement claims.

## 12. AB34 result

The direct attack found no justification for weakening R_AA below the current six semantic components plus claim-relevant history.

The attack also showed that some apparently separate state may be encoded structurally, but only under a derivability/future-equivalence obligation.

The most important remaining unknown is not the existence of individual fields. It is whether a compact relational representation can preserve the complete future behavior required by P_AA.

## 13. AB35 frontier

1. Construct the smallest bounded abstract state/action system from the surviving lower bounds.
2. Enumerate 2-event and 3-event traces against R_AA manually before TLA+.
3. Define an explicit Assessment_AA observation operator and UNKNOWN propagation.
4. Attack whether history can be represented as an event DAG/partial order rather than an event log.
5. Derive the first candidate Init and Next mathematically.
6. Then draft, but do not yet claim verified, the first TLA+ module.
