# AB105.108R — adversarial audit of the formal skeleton

Date: 2026-09-30
Chain: AB105.107R -> AB105.108R

## Objective
Attempt to violate each frozen safety invariant using only transitions allowed by the abstract skeleton. Separately identify the minimum environmental assumptions needed for liveness. This is an audit, not a proof.

## Primary evidence
TLA+ distinguishes safety properties, which assert that bad states are never reached, from liveness properties, which require progress assumptions; fairness is used to constrain behaviors that continually enable an action. citeturn0search0turn0search2
Refinement is the appropriate later boundary for showing that a concrete implementation preserves the abstract behavior rather than redefining it. citeturn0search1

## 1. Safety attack matrix

### S1 — Authority safety
Attack: DECIDED -> StartOperation after authority becomes stale.
Guard blocks execution because CanExecute requires current authority.
RESULT: PASS.

### S2 — STOP safety
Attack: STOP_REQUESTED -> STOP_ENFORCED without enforcement evidence.
Transition requires enforcement evidence.
RESULT: PASS.

### S3 — Fence safety
Attack: FENCE_ISSUED -> FENCE_ENFORCED by local state change only.
Local issuance is insufficient; enforcement evidence is required.
RESULT: PASS.

### S4 — Successor safety
Attack: successor obtains fresh authority and is immediately released.
Release requires predecessor fence enforcement, reconciliation and exclusivity proof.
RESULT: PASS.

### S5 — Effect/authorization separation
Attack: observed effect causes AUTHORIZATION_PROVEN to become true.
No transition permits that inference.
RESULT: PASS.

### S6 — Unknown preservation
Attack: UNKNOWN_AUTHORITY -> ALLOW solely because time advanced.
No such transition exists.
RESULT: PASS.

### S7 — Reconstruction safety
Attack: missing successor + terminal record -> COMPLETE history.
Terminality requires coverage/order/fork/terminality proof.
RESULT: PASS.

### S8 — Replay safety
Attack: duplicate request with same operation identity -> NEW_OPERATION.
Replay recognition routes to existing operation identity.
RESULT: PASS.

### S9 — Recovery safety
Attack: restored checkpoint -> current authority automatically.
Recovery requires reauthorization.
RESULT: PASS.

### S10 — Atomicity safety
Attack: RECONCILIABLE_NON_ATOMIC capability used for ATOMIC consequence.
CanExecute requires AtomicityRequirementSatisfied.
RESULT: PASS.

### S11 — Reconciliation safety
Attack: reconciled effects -> ATOMIC.
No inference exists.
RESULT: PASS.

### S12 — Identity safety
Attack: same external identifier at T1/T2 -> same incarnation.
No transition converts identifier equality into continuity proof.
RESULT: PASS.

## 2. Cross-boundary attacks

### X1 — stale decision + current authority
A decision may remain stale even when authority is current.
Result: DecisionValid remains independently required.
PASS.

### X2 — current authority + stale evidence
Current authority does not refresh unrelated evidence.
Result: freshness requirement remains independent.
PASS.

### X3 — STOP + current authority
Current authority does not cancel STOP.
PASS.

### X4 — fence enforced + unknown old effect
Fence enforcement does not prove absence of an already-issued effect.
Reconciliation remains required.
PASS.

### X5 — complete checkpoint + unknown external outcome
Checkpoint completeness does not erase unacknowledged effects.
Reconciliation remains required.
PASS.

### X6 — fresh evidence + dependency conflict
Freshness cannot resolve dependency conflict.
Conflict state remains explicit.
PASS.

## 3. Liveness assumption audit

Safety does not prove that anything eventually happens. Minimum assumptions must be explicit:

L1 — Communication: required messages eventually have a delivery opportunity, or the system must permit UNKNOWN rather than promise progress.
L2 — Authority service: a fresh authority decision can eventually be obtained, or recovery remains blocked.
L3 — Fence mechanism: if eventual STOP/fencing is a requirement, the enforcement mechanism must provide a stated eventual-enforcement assumption.
L4 — Storage: durable state required for recovery is eventually readable, or recovery remains blocked.
L5 — Effect observation: external outcome can eventually be observed/reconciled, or the system must tolerate permanent UNKNOWN.
L6 — Fair scheduling: continuously enabled internal actions are not starved indefinitely.
L7 — Provider termination: a concrete external operation eventually reaches a documented terminal/observable state if the contract requires termination.

None of these assumptions is silently adopted as a theorem.

## 4. Important distinction
Some liveness properties may be impossible under permanent partition or unavailable authority. In those cases the correct semantic result is BLOCKED/UNKNOWN, not a false progress claim.

Therefore:
SAFETY = environment-independent to the extent encoded by the model.
LIVENESS = assumption-dependent.

## 5. Formal gap discovered
The skeleton currently treats `DecisionValid`, `RequiredEvidenceFresh`, `RequiredCoverage`, `RequiredDependencyAssurance`, and `AtomicityRequirementSatisfied` as predicates without yet defining whether they are instantaneous state variables, derived predicates, or externally-appraised inputs.
This is a formalization detail that must be fixed before proof because otherwise the transition relation is underspecified.
It is not a new architecture branch.

## Result
SAFETY_ADVERSARIAL_AUDIT = PASSED
ALL_12_CORE_INVARIANTS = SURVIVED
CROSS_BOUNDARY_ATTACKS = SURVIVED
LIVENESS_ASSUMPTIONS = EXPLICITLY_BOUNDED
NEW_SEMANTIC_BRANCH = NONE
FORMAL_PROOF = NOT_PERFORMED
MODEL_CHECKING = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.109R — resolve the remaining formalization ambiguity: classify each guard/predicate as state, derived predicate, or external assumption/input, then re-run the invariant audit. This is necessary before any actual model checking.