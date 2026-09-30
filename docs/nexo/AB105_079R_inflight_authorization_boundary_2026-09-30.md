# AB105.079R — long-running / in-flight authorization boundary

Date: 2026-09-30
Chain: AB105.078R -> AB105.079R

## Objective
Determine whether authorization to start an operation remains sufficient while it executes, and define the evidence states needed when STOP or revocation arrives after execution has begun.

## Fresh primary evidence
AWS CloudFormation permits cancellation only while a stack update is in UPDATE_IN_PROGRESS. A successful cancellation transitions the operation into rollback rather than erasing the already-started operation. [AWS CancelUpdateStack] citeturn0search0turn0search3
AWS documents that rollback itself can fail, leaving UPDATE_ROLLBACK_FAILED, and can require a later ContinueUpdateRollback operation. Skipped resources can be marked UPDATE_COMPLETE while remaining inconsistent with the stack template. [AWS ContinueUpdateRollback] citeturn0search5turn0search7
AWS also documents in-progress StackSet operations with explicit RUNNING, SUCCEEDED, FAILED and CANCELLED states, showing that operation cancellation/completion is distinct from the initial authorization/request event. [AWS StackInstanceComprehensiveStatus] citeturn0search11

## Finding
Authorization to START an operation and authorization/evidence for what happens DURING and AFTER the operation are separate claims.

Therefore:
AUTHORIZED_TO_START != AUTHORIZED_AT_EVERY_LATER_INSTANT
CANCEL_REQUESTED != OPERATION_STOPPED
OPERATION_CANCELLED != ZERO_PRIOR_EFFECT
OPERATION_SUCCEEDED != EVERY_EXPECTED_EFFECT_PROVEN
ROLLBACK_COMPLETE != PROOF_THAT_FORWARD_EFFECTS_NEVER_EXISTED

## Normative in-flight contract
An effectful operation must carry at least:
- OPERATION_ID
- AUTHORIZATION_DECISION_ID
- AUTHORITY_EPOCH_AT_START
- STARTED_AT
- EXECUTION_STATE
- STOP/REVOCATION_OBSERVATIONS
- EFFECT_EVENTS
- COMPLETION_STATE
- FINAL_RECONCILIATION_STATE

Execution states:
AUTHORIZED_TO_START
STARTED
IN_FLIGHT
STOP_REQUESTED
REVOCATION_OBSERVED
STOPPING_OR_ROLLING_BACK
COMPLETED
FAILED
CANCELLED
UNKNOWN

These are operation states, not claims that every underlying physical effect shares the same state.

## Critical rule for STOP
When STOP arrives after STARTED, Nexo must not rewrite history as if the operation never started.

Required decomposition:
1. Authorization at start.
2. Operation accepted/started.
3. STOP or revocation requested.
4. Enforcement/acknowledgement observed or UNKNOWN.
5. Subsequent effect events.
6. Final operation state.
7. Reconciliation of expected versus observed effects.

If step 4 is UNKNOWN, the system cannot claim STOP was enforced before subsequent effects.

## Long-running operation rule
Authorization freshness must be evaluated at explicit enforcement checkpoints chosen by operation type.
For non-interruptible or already-committed provider work, later revocation may prevent new work without undoing work already committed. Therefore Nexo must distinguish:
- authority to initiate
- authority to continue
- authority to perform a new side effect
- ability to compensate/rollback
- actual observed effect.

No universal assumption is made that revocation retroactively invalidates an already committed effect.

## Reconciliation requirement
At completion, Nexo needs an independent effect reconciliation:
EXPECTED_EFFECTS vs OBSERVED_EFFECTS vs UNOBSERVABLE_EFFECTS

Possible final evidence states:
EFFECT_COMPLETED
EFFECT_PARTIALLY_OBSERVED
EFFECT_FAILED
EFFECT_CANCELLED_BEFORE_EFFECT
EFFECT_UNKNOWN

Provider operation success/failure/cancellation cannot substitute for resource-level reconciliation.

## Adversarial cases checked
1. STOP immediately after start -> prior acceptance remains historical fact.
2. STOP during provider execution -> later effects may still occur; must be evidenced.
3. Revocation during rollback -> rollback is a new effect path, not proof of absence of prior mutation.
4. Operation reports CANCELLED -> does not prove zero prior effects.
5. Operation reports SUCCEEDED -> does not prove every expected resource-level effect.
6. Rollback completes -> does not prove forward effects never existed.
7. Rollback fails -> final physical/configuration state can remain unresolved.
8. Retry after failure -> new operation identity must not be merged with the original.
9. Missing effect evidence -> UNKNOWN, not NO_EFFECT.
10. Long-running operation crosses authority epoch -> new side effects require a fresh authority check unless an explicit invariant covers them.

No new generic physical-incarnation, configuration/drift, or causal-provenance edge was discovered.

## Status
AUTHORIZATION_EFFECTIVE_PERMISSION_GENERIC_BRANCH = OPEN
AUTHORIZATION_FRESHNESS_REVOCATION = NORMATIVELY_DEFINED_WITH_PROVIDER-DEPENDENT_ENFORCEMENT
IN_FLIGHT_AUTHORIZATION = NORMATIVELY_DEFINED

The generic model now distinguishes authorization, operation state, revocation/STOP state, and observed effects.

## Next exact direction
AB105.080R — adversarial integration of authorization freshness + in-flight operations with the existing STOP/epoch/fencing model. Goal: determine whether any missing generic invariant remains before closing the authorization branch.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.