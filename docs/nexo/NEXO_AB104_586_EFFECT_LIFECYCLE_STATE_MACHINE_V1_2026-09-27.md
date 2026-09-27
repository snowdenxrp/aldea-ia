# NEXO — AB104.586 — Máquina de estados completa del efecto

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
AWS Durable Execution distinguishes at-least-once and at-most-once retry semantics and explicitly states that neither alone guarantees exactly-once execution across a workflow. citeturn0search3
Durable workflow implementations separate durable history from side-effecting activity execution and treat UNKNOWN after lease/transport failure as a reconciliation condition rather than proof of absence. citeturn0search0turn0search1

## Canonical lifecycle
INTENT_RECORDED
→ ADMISSION_PENDING
→ ADMITTED
→ QUEUED
→ STARTING
→ EXECUTING
→ OUTCOME_PENDING
→ {COMMITTED | NOT_COMMITTED | UNKNOWN}

UNKNOWN
→ RECONCILIATING
→ {COMMITTED | NOT_COMMITTED | UNKNOWN}

COMMITTED
→ {CLOSED | COMPENSATION_PENDING | REPLAN_PENDING}
NOT_COMMITTED
→ {CLOSED | REPLAN_PENDING}

COMPENSATION_PENDING
→ COMPENSATION_ADMITTED
→ COMPENSATION_QUEUED
→ COMPENSATION_EXECUTING
→ {COMPENSATED | COMPENSATION_UNKNOWN | COMPENSATION_FAILED}

## Illegal transitions
- UNKNOWN → EXECUTING without reconciliation or an explicitly safe new effect identity.
- UNKNOWN → NOT_COMMITTED by timeout assumption.
- UNKNOWN → COMMITTED by local intent/ack assumption.
- COMMITTED → NOT_COMMITTED by local rollback of history.
- NOT_COMMITTED → COMMITTED without new authoritative evidence.
- STALE_ADMISSION → EXECUTING without fresh admission.
- EXPIRED_AUTHORITY → external mutation.
- OLD_INCARNATION → CURRENT_RESOURCE mutation.
- COMPENSATION → original-effect identity reuse.
- CLOSED → mutation without a new successor effect/mission transition.
- FAILED → automatic retry when the failure actually represents UNKNOWN.

## Orthogonal dimensions
A single enum is insufficient. Preserve separate dimensions:
- EffectOutcome
- AuthorityState
- AdmissionState
- Provider/ResourceIncarnation
- Fence/Epoch
- DependencyState
- Reversibility
- CompensationState
- ReconciliationState
- ClosureState.

This prevents a state such as “FAILED” from hiding UNKNOWN authority, partial commit, or an unresolved external outcome.

## Transition contract
Every transition should record:
- transition ID
- predecessor state/digest
- actor/authority identity
- graph/dependency version
- effect contract digest
- incarnation
- epoch/fence
- evidence references
- timestamp/order metadata
- resulting state.

A transition is a durable fact, not an instruction to silently mutate prior history.

## Root/composite effects
For multi-provider actions, the root lifecycle is derived from participant effects. A root may be PARTIAL_COMMIT or UNKNOWN_PARTS; it cannot become fully COMMITTED merely because orchestration reached its final step.

## Compensation
Compensation is a successor effect with its own lifecycle. It never edits the original COMMITTED fact into NOT_COMMITTED.

## Closure semantics
CLOSED means the control plane has no remaining required transition for that effect under its current contract. It does NOT necessarily mean the physical world is globally identical to the desired state.

Therefore distinguish:
CONTROL_CLOSED
vs
WORLD_STATE_VERIFIED.

## New invariants
1. UNKNOWN is terminal with respect to blind retry, but not necessarily terminal for reconciliation.
2. Every transition is monotonic in evidence/history even when world state changes.
3. Reconciliation may refine UNKNOWN but must preserve the prior UNKNOWN fact.
4. Compensation cannot erase original outcome evidence.
5. Authority validity and effect outcome are orthogonal.
6. Closure is not equivalent to world-state verification.
7. Composite root state is derived from participant truth.
8. Illegal transitions must be rejected explicitly, not merely ignored.

## Key result
AB104.586 converts the accumulated findings into a candidate state-machine boundary without implementing it. The model now has explicit places for UNKNOWN, stale admission, incarnation changes, compensation and composite partial commit.

OPEN:
- machine completeness/exhaustive transition audit;
- formal safety invariants;
- liveness assumptions;
- implementation/fault injection.

## Next exact step
AB104.587 — exhaustive transition audit: enumerate reachable combinations and prove/find missing transitions, especially around UNKNOWN + authority changes + compensation + incarnation replacement.