# AB105.109R — classification of formal guards: state vs derived predicate vs external input

Date: 2026-09-30
Chain: AB105.108R -> AB105.109R

## Objective
Resolve the remaining formal ambiguity before model checking by classifying every guard used by the Nexo skeleton.

## Primary evidence
TLA+ permits state variables to represent the system state while predicates/actions describe properties and transitions over that state; Init describes legal initial states and Next the allowed state transitions. citeturn0search0turn0search1
Type-correctness is naturally expressed as an invariant/predicate rather than as a separate runtime state, reinforcing the distinction between stored state and derived predicates. citeturn0search1

## 1. Classification rule

STATE = information whose value persists as part of the modeled system state and can change through Next.
DERIVED = a pure predicate/function computed from current state and declared evidence; it does not independently mutate.
EXTERNAL_INPUT = information introduced by the environment/adversary or by an evidence source; it becomes modeled state only when the specification says it is recorded.
ASSUMPTION = an environmental constraint on behaviors, not evidence that the system has observed.

## 2. Guard classification

CurrentAuthority -> DERIVED from authority state + epoch + validity evidence.
DecisionValid -> DERIVED from decision state + policy/version + validity boundary.
RequiredEvidenceFresh -> DERIVED from observation/evidence state + freshness policy.
RequiredCoverage -> DERIVED from evidence coverage state + decision requirement.
RequiredDependencyAssurance -> DERIVED from dependency graph/appraisal + decision requirement.
AtomicityRequirementSatisfied -> DERIVED from declared consequence class + available atomicity capability.
StopBlocking -> DERIVED from stop state + policy.
SuccessorIdentityValid -> DERIVED from identity/incarnation state.
PredecessorFenceEnforced -> DERIVED from fence state + enforcement evidence.
EffectsReconciled -> DERIVED from expected/observed/unobservable effects + reconciliation state.
ExclusivityProven -> DERIVED from authority-transfer state + predecessor/successor evidence + policy.
ReconstructionComplete -> DERIVED from reconstruction state and coverage/order/fork/terminality evidence.

## 3. Persistent state variables
The following remain STATE because later transitions must be able to observe their history/persistence:
- authority_epoch
- authority_state
- runtime_id / incarnation_id
- recorded observations/evidence
- claim/appraisal/decision records
- operation_id / operation_phase
- replay/idempotency state
- stop/fence state and recorded enforcement evidence
- expected/observed/unobservable effects
- reconciliation records
- atomicity capability declaration
- reconstruction state
- recovery/migration state
- successor-exclusivity appraisal record.

## 4. External inputs
External inputs include:
- newly received evidence;
- provider acknowledgements/events;
- authority decisions from an external authority service;
- observed effect status;
- clock/freshness observations;
- network delivery/reordering/loss;
- crash/restart events;
- adversarial or malformed inputs.

An input does not become trusted merely because it is received. Its provenance, freshness, coverage and appraisal determine the derived predicates that may use it.

## 5. Environmental assumptions
These remain ASSUMPTIONS rather than state:
- fairness assumptions used for liveness;
- eventual delivery assumptions, when a liveness claim requires them;
- provider termination assumptions;
- availability assumptions for authority/evidence services;
- cryptographic primitive assumptions;
- storage durability assumptions.

An assumption must never be used as if it were observed evidence.

## 6. Re-audit of the main guards

CanExecute = CurrentAuthority /\ DecisionValid /\ RequiredEvidenceFresh /\ RequiredCoverage /\ RequiredDependencyAssurance /\ ~StopBlocking /\ AtomicityRequirementSatisfied

All components are DERIVED predicates over STATE + recorded evidence, except their underlying evidence may originate as EXTERNAL_INPUT.

CanReleaseSuccessor = SuccessorIdentityValid /\ CurrentAuthority /\ PredecessorFenceEnforced /\ EffectsReconciled /\ ExclusivityProven

All components are DERIVED predicates.

CanDeclareTerminalHistory = ReconstructionComplete /\ CoverageExhausted /\ OrderingResolved /\ ForksResolved /\ TerminalityProven

All components are DERIVED predicates over reconstruction state/evidence.

## 7. Adversarial classification attacks

C1 — Treat CurrentAuthority as stored boolean.
Rejected: it can become stale when epoch/evidence changes.

C2 — Treat STOP_ENFORCED as an assumption.
Rejected: enforcement is an evidence-backed state transition, not a wish.

C3 — Treat external ACK as a derived fact without recording provenance.
Rejected: the ACK is an input/evidence item first.

C4 — Treat fairness as evidence.
Rejected: fairness constrains behavior; it does not establish an observed event.

C5 — Treat freshness as permanent state.
Rejected: freshness is a derived appraisal against a validity boundary.

C6 — Treat atomicity capability as inferred from a successful run.
Rejected: capability must be declared/verified independently of one successful operation.

C7 — Treat reconciliation result as raw observation.
Rejected: reconciliation is derived from immutable observations/effects.

C8 — Treat historical reconstruction completeness as a provider fact.
Rejected: it is an appraisal derived from coverage/order/fork/terminality evidence.

## 8. Formalization consequence
The ambiguity identified in AB105.108R is resolved without changing semantics.
The formal model should store evidence and durable semantic state, while computing decision guards as derived predicates. Environment assumptions must remain explicitly parameterized.
This also prevents circular reasoning such as 'CanExecute is true because the model says CanExecute is true.'

## Result
GUARD_CLASSIFICATION = RESOLVED
STATE_VS_DERIVED_VS_INPUT_VS_ASSUMPTION = EXPLICIT
SEMANTIC_CHANGE = NONE
SAFETY_AUDIT_REENTRY = READY
FORMAL_PROOF = NOT_PERFORMED
MODEL_CHECKING = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.110R — rebuild the skeleton with this classification and perform a transition-level invariant attack, including stale-input, delayed-input, duplicated-input and adversarial-input cases. This is the last pre-model-checking semantic audit unless a contradiction appears.