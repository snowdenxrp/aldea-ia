# AB105.107R — formal specification skeleton: Init / Next / invariants

Date: 2026-09-30
Chain: AB105.106R -> AB105.107R

## Objective
Translate the frozen semantic boundary into a formal, implementation-free skeleton. This artifact deliberately stops before concrete protocol or production code.

## Primary evidence
TLA+ specifications conventionally separate Init, Next, and liveness; Next describes possible state transitions, while safety properties can be checked independently. citeturn0search0turn0search2
Refinement mappings provide the formal relationship between an abstract specification and a lower-level implementation, so implementation details need not contaminate the abstract Nexo model. citeturn0search1

## 1. Abstract variables

V = {
  phase,
  authority, authority_epoch,
  identity, incarnation,
  observation_freshness, observation_coverage,
  evidence_dependency, evidence_conflict,
  claim_state, appraisal_state, decision_state,
  operation_id, operation_phase, replay_state,
  fence_state, stop_state,
  expected_effects, observed_effects, unobservable_effects,
  reconciliation_state,
  atomicity_capability,
  reconstruction_state,
  recovery_state,
  successor_exclusivity
}

These are semantic variables, not implementation objects.

## 2. Init skeleton

Init requires:
- a valid initial runtime identity/incarnation;
- an explicitly defined initial authority state;
- no consequential operation already authorized without a decision;
- empty or explicitly declared effect sets;
- no unproven successor exclusivity claim;
- reconstruction/recovery state consistent with whether startup is fresh or restored;
- all unknown conditions represented explicitly rather than defaulted to safe/true.

Formally:
Init == IdentityValid /\ AuthorityInitialized /\ NoUnjustifiedEffect /\ ExplicitUncertainty /\ ValidInitialPhase

## 3. Next skeleton

Next == \/ Observe
         \/ Appraise
         \/ Decide
         \/ RecheckAuthority
         \/ StartOperation
         \/ AdvanceOperation
         \/ RequestStop
         \/ EnforceStop
         \/ FencePredecessor
         \/ EstablishSuccessorAuthority
         \/ ObserveEffect
         \/ ReconcileEffects
         \/ Reconstruct
         \/ ReauthorizeRecovery
         \/ AppraiseExclusivity
         \/ ReleaseSuccessor
         \/ RecoverFailure
         \/ RecognizeReplay

Every action must either change an allowed variable consistently with its guard or leave the semantic state unchanged. An external acknowledgement cannot by itself manufacture a stronger semantic state than its contract proves.

## 4. Core safety invariants

S1 — Authority safety
Consequential execution requires the authority predicate required by the Decision Contract.

S2 — STOP safety
STOP_REQUESTED never implies STOP_ENFORCED without enforcement evidence.

S3 — Fence safety
FENCE_ISSUED never implies FENCE_ENFORCED.

S4 — Successor safety
SUCCESSOR_AUTHORITY never implies SUCCESSOR_EXCLUSIVITY.

S5 — Effect/authorization separation
EFFECT_OBSERVED never proves AUTHORIZATION_PROVEN, and AUTHORIZATION_PROVEN never proves EFFECT_OBSERVED.

S6 — Unknown preservation
UNKNOWN_* cannot transition to a stronger positive state without an explicit evidence/decision rule.

S7 — Reconstruction safety
PARTIAL/UNKNOWN reconstruction never implies terminal historical state.

S8 — Replay safety
Recognized replay cannot become a distinct new operation merely because it is retried.

S9 — Recovery safety
Reconstruction/restoration never automatically transfers current authority.

S10 — Atomicity safety
A capability weaker than the consequence class cannot be silently treated as satisfying the stronger class.

S11 — Reconciliation safety
RECONCILED does not imply ATOMIC or ZERO_PRIOR_EFFECT.

S12 — Identity safety
Identifier equality alone cannot establish incarnation continuity.

## 5. Explicit guards

CanExecute == CurrentAuthority /\ DecisionValid /\ RequiredEvidenceFresh /\ RequiredCoverage /\ RequiredDependencyAssurance /\ !StopBlocking /\ AtomicityRequirementSatisfied

CanReleaseSuccessor == SuccessorIdentityValid /\ CurrentAuthority /\ PredecessorFenceEnforced /\ EffectsReconciled /\ ExclusivityProven

CanDeclareTerminalHistory == ReconstructionComplete /\ CoverageExhausted /\ OrderingResolved /\ ForksResolved /\ TerminalityProven

These predicates are intentionally stronger than simple phase checks.

## 6. Liveness is NOT claimed
The skeleton does not yet assert that STOP eventually becomes enforced, recovery eventually releases, reconciliation eventually completes, or operations eventually terminate.
Those are liveness/fairness properties and require explicit environmental assumptions.

## 7. Adversarial inspection of the skeleton

A1 — Can DECIDED bypass authority refresh? No; CanExecute requires current authority.
A2 — Can STOP_REQUESTED be treated as STOP_ENFORCED? No.
A3 — Can a restored runtime inherit authority automatically? No.
A4 — Can partial history become terminal? No.
A5 — Can effect acknowledgement prove authorization? No.
A6 — Can a retry create a new operation? Not if replay identity matches.
A7 — Can weaker atomicity satisfy stronger consequence silently? No.
A8 — Can successor release occur before predecessor fencing/effect reconciliation? No.
A9 — Can UNKNOWN become positive merely by time passing? No.
A10 — Can identity equality alone prove continuity? No.

## 8. Remaining formal gaps
1. Exact mathematical domains/types for each variable.
2. Complete action guards and state updates.
3. Environment/adversary model.
4. Explicit safety proof obligations.
5. Explicit liveness/fairness assumptions and properties.
6. Refinement boundary for implementation.
7. Finite abstraction/model-checking parameters.

None of these currently requires a new semantic branch; they are formalization work against the frozen contracts.

## Result
FORMAL_SKELETON = CREATED
INIT_NEXT_BOUNDARY = DEFINED
CORE_SAFETY_INVARIANTS = ENUMERATED
UNKNOWN_STOP_FENCING_SEMANTICS = PRESERVED
NEW_BEHAVIOR_CHANGING_BRANCH = NONE
FORMAL_PROOF = NOT_PERFORMED
MODEL_CHECKING = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.108R — adversarial audit of the formal skeleton itself: search for a transition that can violate any frozen invariant, and separately identify the minimum environment assumptions required for liveness. Do not write production code.