# NEXO — AB9 FIRST CLAIM SELECTION, AUTHORIZATION-TO-ADMISSION SAFETY AND MINIMAL ABSTRACT DOMAIN RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No theorem claimed proven.

## 0. Purpose

AB8 left the first formal claim open. This round selects a deliberately narrow claim family and attacks it before any TLA+ specification is written.

Selection principle:

CLAIM CONTRACT -> CONCRETE HISTORY -> REQUIRED DISTINCTIONS -> COUNTERMODELS -> REPRESENTATION -> ABSTRACT DOMAIN -> TLA+

The selected claim must be:
- universal safety rather than liveness;
- state/transition local enough for a first finite model;
- directly tied to the Z1/Z3 authority boundary;
- expressible without pretending that internal admission proves an external-world effect;
- strong enough to exercise epoch, revocation, incarnation, binding, policy, and fence semantics.

## 1. External methodological cross-check

Lamport describes TLA+ specifications as state machines whose next-state relation describes permitted steps, and identifies invariance as the primary form of property commonly checked for safety. TLC is an explicit-state model checker for finite-state instances; this supports using a bounded first model for falsification/model checking, not treating it as a proof of the unrestricted implementation. citeturn1search0turn1search1turn1search5

Lamport also documents that refinement mappings may require auxiliary/history variables, while those variables can remain auxiliary to the specification. citeturn1search3turn0search4

Cousot's abstract-interpretation work supports starting from transition/collecting semantics, making the concrete/abstract correspondence explicit, and composing abstractions systematically rather than assuming one universal abstraction. citeturn0search0turn0search2turn0search7

These sources support the method only. They do not prove any Nexo claim.

## 2. AB9-G1 — Selected first claim family

Selected claim:

AUTHORIZATION_TO_ADMISSION_SAFETY

Candidate natural-language form:

For every admitted internal effect, there exists a valid current Z1 authorization whose authority semantics authorize that exact effect binding at the admission boundary.

Important scope restriction:

ADMITTED_INTERNAL_EFFECT != EXTERNAL_EFFECT_OCCURRED

The claim says only that Z3/internal admission was justified by Z1 authority. It does NOT say:
- the external provider executed the effect;
- the effect succeeded;
- the effect was delivered to the outside world;
- no external effect occurred after timeout/stop;
- the external world is consistent with the internal record.

Those are separate C3/enforcement claims.

## 3. Exact boundary

First model boundary:

Z1 Authoritative Safety Core
        |
        | authorization-to-admission contract
        v
Z3 Effect/Observation Plane
        |
        | external provider interaction (OUT OF FIRST MODEL)
        v
Z4 External World

The first model therefore stops at the Z1 -> Z3 admission boundary.

This is intentional.

It avoids the invalid inference:

Z1 DENY -> Z4 NO_EFFECT

which was already identified as an enforcement-boundary gap.

## 4. Candidate formal claim

Let Admit(e,t) mean that internal effect e is admitted at time t.

Let Auth(a,t) mean that authority a is currently valid at t.

Let Matches(a,e,t) mean that:
- identity/subject matches;
- capability covers the effect;
- scope covers the resource;
- resource incarnation matches;
- authority epoch is current;
- delegation/revocation conditions are valid;
- policy/invariant baseline is compatible;
- admission fence is valid;
- the Z1->Z3 boundary permits the transition.

Candidate safety property:

P_AA:
  forall e,t:
    Admit(e,t) => exists a:
      Auth(a,t) / Matches(a,e,t)

This is a candidate specification statement, not yet a proven invariant.

## 5. Why this claim is the correct first target

It exercises multiple established distinctions without requiring the entire architecture:

- authority != capability;
- authority != effect;
- current authority != historical authority;
- resource identity != resource incarnation;
- operation identity != attempt identity;
- policy version != authority epoch;
- admission != external execution;
- internal decision != external world truth.

It also crosses a meaningful security boundary while keeping the first formal universe finite.

## 6. AB9-G2 — Concrete history semantics

Candidate concrete history:

H = (S0, e1, S1, e2, S2, ...)

Each relevant transition record may contain:

e = (
  operation_id,
  attempt_id,
  subject,
  authority_epoch,
  resource_id,
  resource_incarnation,
  capability,
  scope,
  policy_version,
  fence,
  action,
  admission_decision,
  revocation_state,
  temporal_position
)

Not every concrete field must survive into the abstract model.

The concrete history must nevertheless be rich enough to distinguish all countermodels that can falsify P_AA.

## 7. AB9-G3 — Required distinctions

For P_AA, the minimum candidate distinctions are:

R1 identity/subject
R2 operation_id
R3 attempt_id
R4 resource_id
R5 resource_incarnation
R6 authority_epoch
R7 authority validity/revocation
R8 capability/scope
R9 policy/invariant baseline relevant to admission
R10 fence/lease freshness
R11 admission event
R12 temporal position/currentness

Candidate non-required distinctions for the first model:

N1 provider execution identifier
N2 external provider state
N3 external world outcome
N4 telemetry/evidence transport
N5 historical compaction/reclamation
N6 multi-witness reconstruction
N7 common-mode independence

These may become required in later claims, but adding them now would destroy the purpose of a minimal first model.

## 8. Minimal abstract state candidate

Candidate abstract state:

A = (
  currentAuthority,
  currentResourceIncarnation,
  currentPolicyBaseline,
  currentFence,
  revocationState,
  pendingEffectBinding,
  admittedEffects
)

The abstract model should represent only P_AA-relevant facts.

A history variable may be added if needed to reconstruct the admission event or prove the refinement mapping.

## 9. Critical distinction: admission event vs admitted state

A set admittedEffects alone may be insufficient if the claim depends on the authority snapshot at the moment of admission.

Therefore two candidate representations must be tested:

Model A:
  admittedEffects stores all P_AA-relevant authorization snapshot fields.

Model B:
  admittedEffects stores only an effect identity, with history/auxiliary variables retaining the authorization snapshot.

Do NOT choose between them yet.

The choice depends on the refinement proof obligation and whether current state alone can reconstruct the admission-time authority.

## 10. Countermodel suite

CM-AA1 — stale authority epoch

Authority existed at epoch 4.
System moves to epoch 5.
Effect is admitted using epoch-4 authority.

Expected:
P_AA = FALSE.

CM-AA2 — revoked authority

Authority was valid.
Revocation occurs.
Admission uses revoked authority.

Expected:
P_AA = FALSE.

CM-AA3 — wrong resource incarnation

Resource R incarnation 7 is authorized.
Resource R is replaced with incarnation 8.
Admission targets incarnation 8 using incarnation-7 authority.

Expected:
P_AA = FALSE.

CM-AA4 — scope mismatch

Authority covers resource R1.
Admission targets R2.

Expected:
P_AA = FALSE.

CM-AA5 — capability mismatch

Authority permits action A.
Admission attempts action B.

Expected:
P_AA = FALSE.

CM-AA6 — fence reuse

A fence valid for an earlier authority context is reused after the authority context changes.

Expected:
P_AA = FALSE if fence freshness is claim-required.

CM-AA7 — policy baseline mismatch

Authority was evaluated against policy baseline P1.
Current admission semantics require P2.
Admission occurs without a valid P1/P2 compatibility relation.

Expected:
P_AA = FALSE.

CM-AA8 — operation/attempt confusion

Operation O has attempts A1 and A2.
Authority was valid for A1.
Admission is attributed to A2 without a valid authority binding.

Expected:
P_AA = FALSE.

CM-AA9 — historical-validity confusion

An old record proves that authority once existed.
No evidence establishes current validity.
Admission is justified solely from historical existence.

Expected:
P_AA = UNKNOWN or FALSE depending on concrete semantics; the model must not silently promote historical validity to current authority.

CM-AA10 — external-success confusion

Admission is valid but provider never executes.

Expected:
P_AA remains TRUE.

This countermodel protects the boundary:
valid admission does not imply external success.

## 11. Important negative result

The first claim MUST NOT contain:

Admit(e) => ExternalEffectOccurred(e)

That would collapse C1/C2 reasoning into C3.

The correct decomposition is:

P_AA:
  authorization -> internal admission

P_EA:
  admission -> effect-attempt semantics

P_EW:
  effect attempt -> external-world effect claim

P_AA does not prove P_EA or P_EW.

## 12. AB9-G4 — Smallest useful countermodel dimension

The first finite model does not need arbitrary many agents/resources.

Candidate minimum cardinalities:

Subjects: 1
Operations: 1
Attempts: 2
Resources: 1
Resource incarnations: 2
Authority epochs: 2
Policy versions: 2
Fences: 2
Actions: 2

This is only a candidate bound.

Before TLA+ execution, each dimension must be justified against CM-AA1..AA10.

If a dimension can be collapsed without eliminating a countermodel, remove it.

If a countermodel requires it, retain it.

## 13. AB9-G5 — Representation/refinement candidate

Concrete-to-abstract representation for P_AA:

Rep_AA(c,a)

iff the abstract state a preserves every distinction R1-R12 needed to determine whether each admitted effect has a matching valid authority at its admission point.

Candidate refinement mapping:

M_AA:
  (implementation_state, auxiliary_history)
  -> abstract_state_AA

Required property:

P_AA(concrete) must be reflected by P_AA(abstract) under the chosen soundness direction.

Do NOT yet assert:
Safe(Abstract) => Safe(Concrete)

The exact implication direction depends on the representation relation and claim polarity and must be formalized.

## 14. AB9-G6 — Is a finite abstract domain sufficient?

For this first claim, a finite abstraction appears plausible if:
- identities are bounded;
- epochs are bounded symbols;
- resource incarnations are bounded;
- policy baselines are bounded;
- fences are bounded;
- capability/scope relation is finite;
- admission events are finite in the bounded model.

But this is only a feasibility hypothesis.

The key question is not:
"Can TLA+ represent it?"

It is:
"Can the finite abstraction preserve every distinction required by P_AA for the countermodels and intended safety semantics?"

## 15. Threat-model scope

The first P_AA model does NOT attempt to prove independence.

Threat model:

TM_AA =
(
  stale_authority,
  revocation_race,
  incarnation_mismatch,
  scope_mismatch,
  capability_mismatch,
  fence_reuse,
  policy_mismatch,
  operation_attempt_confusion
)

Excluded:
- Byzantine provider;
- common-mode independence;
- external-world deception;
- telemetry corruption;
- arbitrary compromise of Z1 itself.

Those exclusions must be explicit rather than silently assumed.

## 16. Authority non-amplification

The first model must preserve:

Abstract knowledge of valid authority
    does not create
Abstract authority.

In particular:

historical_validity
!=
current_authority

and:

knowledge_that_authority_existed
!=
permission_to_admit_now.

## 17. First-model proof obligations

Before TLA+:

O1 Type correctness of all abstract state.
O2 Definition of current authority.
O3 Definition of matching.
O4 Definition of admission event.
O5 Explicit boundary between admission and external effect.
O6 Concrete-to-abstract representation relation.
O7 Required-distinction preservation.
O8 Countermodel coverage.
O9 No authority amplification under abstraction.
O10 Clear UNKNOWN semantics for insufficient currentness evidence.

Only after O1-O10 are specified should the first TLA+ module be drafted.

## 18. Formal-methods caution

TLC checks finite-state instances and is useful for finding violations of invariants. It does not, by itself, establish the unrestricted implementation theorem. Lamport distinguishes model checking from rigorous safety proofs and notes the role of invariance checking in the workflow. citeturn1search1turn1search5

Therefore the future verification ladder remains:

DESIGN
-> RESEARCH
-> CANDIDATE INVARIANT
-> FORMALIZED
-> TLC MODEL-CHECKED
-> TLAPS/OTHER PROOF
-> IMPLEMENTED
-> TESTED
-> RUNTIME VERIFIED
-> DEPLOYMENT VERIFIED

No promotion between levels without evidence.

## 19. AB9 status

AB9-G1: ADVANCED — first claim selected and boundary fixed.

AB9-G2: ADVANCED — concrete history schema drafted.

AB9-G3: ADVANCED — R1-R12 minimum distinctions identified as candidates.

AB9-G4: ADVANCED — CM-AA1..AA10 constructed.

AB9-G5: CANDIDATE — representation/refinement relation drafted.

AB9-G6: OPEN — finite abstraction sufficiency still needs adversarial proof/countermodel analysis.

AB9-G7: BLOCKED INTENTIONALLY — no TLA+ until O1-O10 are completed.

AB9-G8: BLOCKED INTENTIONALLY — no TLC until formal semantics are stable.

## 20. New frontier

AB10-G1 — attack whether P_AA is actually minimal or whether it hides necessary temporal state.

AB10-G2 — derive the exact authority order required for Matches.

AB10-G3 — formalize currentness/epoch/revocation semantics.

AB10-G4 — determine whether fence validity is independent, derived, or part of authority.

AB10-G5 — test policy baseline compatibility as an independent dimension.

AB10-G6 — attack operation_id/attempt_id semantics.

AB10-G7 — derive a minimal abstract domain from failed countermodels.

AB10-G8 — prove or refute finite-domain sufficiency for P_AA.

AB10-G9 — only then draft TLA+.

## Verification boundary

No implementation.
No TLA+ execution.
No TLC result.
No theorem claimed proven.
