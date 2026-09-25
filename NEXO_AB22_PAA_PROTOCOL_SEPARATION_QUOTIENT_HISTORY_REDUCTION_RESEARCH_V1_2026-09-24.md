# NEXO AB22 — P_AA PROTOCOL-SEPARATION ATTACK, QUOTIENT STABILITY AND HISTORY/LEASE REDUCTION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No formal proof claimed.

## 1. External cross-check

Lamport's auxiliary-variable work distinguishes history variables, prophecy variables and stuttering variables; history variables record past behavior and are introduced when needed to construct a refinement mapping. Stuttering steps leave relevant abstract variables unchanged. This supports keeping protocol mechanism separate from the claim while retaining history needed by the mapping. Abstract interpretation likewise treats abstract transfer functions as summaries that may lose information, so a reduction must be justified by the properties it preserves.

## 2. Attack target

AB21 separated:
P_AA claim semantics
from
L1 atomic admission
L2 lease/fence admission
L3 admission recheck.

AB22 attacks whether this separation accidentally makes the abstract predicate too weak.

The required condition is:

For every admitted attempt e,t:
AuthAtAdmission(e,t)
must require all P_AA-relevant facts, regardless of which protocol realizes them.

Therefore L1/L2/L3 may differ internally but cannot differ in the set of admissible claim-level outcomes.

## 3. Protocol attack countermodels

CM-AA75 — stale lease with atomic authority:
A lease is syntactically present but its authority basis is stale. L2 must reject it.

CM-AA76 — valid authority without required lease:
If the selected protocol is L2, current authority alone must not satisfy admission.

CM-AA77 — recheck omits delegation:
L3 must reject if delegation is P_AA-relevant.

CM-AA78 — recheck omits incarnation:
L3 must reject after resource reincarnation.

CM-AA79 — recheck omits policy:
L3 must reject after incompatible policy change.

CM-AA80 — atomic protocol hides order:
If L1 is claimed atomic, no intermediate revocation/admission race may be observable inside the abstract atomic step.

CM-AA81 — lease protocol hides expiry:
A lease-expiry transition cannot be hidden if admission semantics can change.

CM-AA82 — protocol-dependent result:
Construct the same claim-level context and make L1 accept while L2 rejects solely because of implementation mechanism. This is a specification inconsistency unless the claim explicitly includes protocol assumptions.

CM-AA83 — recheck after state mutation:
A concrete recheck observes a newer context than the one used for decision. The abstract bridge must represent the resulting admission context, not the obsolete decision context.

CM-AA84 — lease transfer:
A lease is copied to another subject/resource/operation/attempt. It must fail joint binding.

CM-AA85 — lease renewal after authority loss:
Renewal cannot manufacture current authority.

CM-AA86 — recheck/lease disagreement:
Lease says valid while a P_AA-relevant currentness predicate says invalid. The claim must resolve this through the complete conjunction, not choose one signal.

## 4. Stronger semantic form

Replace protocol-specific intuition with:

AuthAtAdmission(e,t) :=
  ∃a,b :
    AuthorityValid(a,t)
    ∧ CompleteBinding(b,e,a,t)
    ∧ FreshnessOrAtomicityValid(b,e,t)
    ∧ PolicyCompatible(a,b,t)
    ∧ DelegationValid(a,b,t)
    ∧ IncarnationCompatible(a,b,e,t)
    ∧ BoundaryAllowed(e,t).

The final predicate is still claim-scoped. The protocol determines how these facts are established and maintained.

## 5. New finding: LeaseBridge cannot be reduced to freshness alone

A reduction such as:

ReducedFenceLeaseContext = {fresh, expired}

is unsound for P_AA.

Counterexamples CM-AA75, 84, 85 and 86 show that future admission behavior depends on:
- authority binding;
- subject;
- operation/attempt;
- resource/incarnation;
- policy;
- delegation;
- replay binding;
- boundary scope;
- temporal validity.

Therefore the bridge is a relational object, not a timer.

## 6. New finding: AdmissionBindingClass and LeaseBridge overlap but are not automatically identical

AdmissionBindingClass represents the claim-relevant equivalence class of the admitted tuple.

LeaseBridge represents the mechanism carrying authorization from decision/check to admission.

They may be merged only if their future transition behavior is identical under the chosen protocol model.

They must remain separate if:
- bridge validity can change while the admission tuple remains unchanged; or
- multiple bridge instances can authorize the same binding class with different future behavior.

Current status: separation retained; merge not established.

## 7. Transition stability attack

Candidate equivalence:

h1 ≡AA h2 iff Normalize_PAA(h1)=Normalize_PAA(h2) and all relevant future continuations have the same P_AA result.

To prove transition stability, for every allowed concrete transition c -> c':
if M(c)=M(c'), then corresponding abstract successors must remain equivalent, or the abstraction must expose UNKNOWN/PENDING.

New countermodel:

CM-AA87 — hidden future split:
Two histories map to the same six-component state now, but a later concrete renewal/recheck operation consults different historical data and produces different admission outcomes.

This demonstrates that state equality alone is insufficient; future transition behavior must be part of the quotient definition.

## 8. History reduction attack

Candidate removal tests:

H1 remove prior authority issuance event.
H2 remove prior revocation event.
H3 remove prior delegation change.
H4 remove prior policy change.
H5 remove prior incarnation event.
H6 remove prior lease issuance/replay event.
H7 remove prior attempt creation event.
H8 remove admission temporal position.

If removal changes a future P_AA result while AA_Norm remains equal, that item cannot be discarded from the refinement-supporting history.

## 9. New countermodels from history reduction

CM-AA88 — deleted revocation history makes a stale bridge appear current.
CM-AA89 — deleted incarnation history aliases old/new resource generations.
CM-AA90 — deleted delegation history makes revoked delegation appear valid.
CM-AA91 — deleted policy history makes an incompatible policy appear compatible.
CM-AA92 — deleted attempt history aliases retry attempts.
CM-AA93 — deleted temporal position changes whether lease was admitted before or after expiry.
CM-AA94 — deleted bridge issuance history makes replay indistinguishable from fresh issuance.

These do not necessarily force every event into AA_Norm. They force the refinement mapping to retain enough auxiliary history to distinguish future behavior.

## 10. New principle

MINIMAL_ABSTRACT_STATE != MINIMAL_REFINEMENT_HISTORY

A smaller AA_Norm can be correct if auxiliary history supplies the distinctions needed by the refinement mapping.

Conversely, deleting history because it is absent from AA_Norm is unsound when future behavior depends on it.

## 11. Protocol-parameter contract

Introduce a claim-level parameter:

ProtocolClass ∈ {ATOMIC, LEASE, RECHECK}

The first model may quantify over one class at a time.

But the semantic contract remains invariant:

ProtocolClass does not change AuthorityValid, CompleteBinding, or the required P_AA binding dimensions.

This lets us test protocol refinements separately without changing the safety claim.

## 12. Revised finite model strategy

Do NOT put all three protocol classes into one first state machine.

Use separate configurations:
M_ATOMIC
M_LEASE
M_RECHECK

All three must instantiate the same P_AA semantic contract.

This reduces accidental mixing of incompatible transition assumptions.

No symmetry reduction is claimed.

## 13. Quotient stability status

The six-component state remains viable but is not yet proven sufficient.

The attack set now explicitly tests:
- protocol separation;
- lease relational completeness;
- history dependence;
- future transition stability;
- retry identity;
- temporal ordering.

## 14. Candidate invariants

AD22-01 PROTOCOL_CLASS_DOES_NOT_CHANGE_PAA_SEMANTICS
AD22-02 LEASE_VALIDITY_DOES_NOT_CREATE_AUTHORITY
AD22-03 COMPLETE_BINDING_IS_PROTOCOL_INDEPENDENT
AD22-04 PROTOCOL_RECHECK_CANNOT_OMIT_PAA_RELEVANT_FACTS
AD22-05 ATOMICITY_CANNOT_HIDE_A_PAA_RELEVANT_INTERLEAVING
AD22-06 LEASE_IS_NOT_REDUCIBLE_TO_FRESHNESS_ALONE
AD22-07 ADMISSION_BINDING_CLASS_AND_LEASE_BRIDGE_ARE_NOT_IDENTICAL_BY_DEFAULT
AD22-08 QUOTIENT_STABILITY_IS_FUTURE_BEHAVIORAL
AD22-09 HISTORY_DELETION_REQUIRES_FUTURE_BEHAVIORAL_EQUIVALENCE
AD22-10 MINIMAL_ABSTRACT_STATE_IS_DISTINCT_FROM_MINIMAL_REFINEMENT_HISTORY
AD22-11 RETRY_IDENTITY_REMAINS_EXPLICIT
AD22-12 PROTOCOL_SPECIFIC_RESULTS_MUST_NOT_CHANGE_CLAIM_SEMANTICS

## 15. AB22 status

G1 advanced — protocol/claim separation attacked.
G2 advanced — lease reduction attacked.
G3 advanced — AdmissionBindingClass/LeaseBridge relationship clarified.
G4 advanced — history reduction attack basis.
G5 advanced — future behavioral quotient requirement.
G6 advanced — protocol-specific finite configurations.
G7 open — exact quotient completeness.
G8 open — exact predicate definitions.
G9 open — TLA+ drafting.

## 16. AB23 frontier

1. Define exact mathematical predicates AuthorityValid, CompleteBinding, PolicyCompatible, DelegationValid, IncarnationCompatible and FreshnessOrAtomicityValid.
2. Construct a protocol-independent semantic kernel.
3. Derive three concrete protocol refinements from that kernel.
4. Attack the kernel with CM-AA75..94.
5. Only if the kernel survives, draft the first TLA+ module.
