# NEXO — EFFECT OUTCOME AMBIGUITY + COMPENSATION SELECTION RESEARCH V1
Date: 2026-09-24
Status: RESEARCH / ARCHITECTURAL PRECONDITION
Implementation: BLOCKED. No V21.

## Research cross-check
AWS Builders Library describes ambiguity after a timeout where a side effect may have occurred even though the caller received no response, and recommends reconciliation plus idempotent request identity for safe retries. AWS Step Functions separates Retry/Catch behavior and supports redrive of unsuccessful executions while preserving successful history. These are research inputs, not compliance claims.

## Findings
EUA-01: UNKNOWN means insufficient evidence to classify the external outcome; it is not failure.
EUA-02: Timeout is not proof of non-execution.
EUA-03: Retrying an UNKNOWN non-idempotent effect can create duplicates.
EUA-04: Idempotency can make retry safe against duplicate execution, but does not prove retry is semantically desirable now.
EUA-05: Reconciliation is the preferred information-gathering transition when the external system exposes sufficient effect identity/history.
EUA-06: Reconciliation itself is protected and may also return UNKNOWN.
EUA-07: Compensation without sufficient knowledge of the original outcome can create a second effect against both possible worlds.
EUA-08: Unconditional compensation is unsafe for a general UNKNOWN effect.
EUA-09: Compensation may be admissible under UNKNOWN only if the effect class provides a proven bounded safety property across all allowed original outcomes.
EUA-10: If compensation is safe in one possible world but unsafe in another, it cannot be chosen under unresolved uncertainty.
EUA-11: Non-idempotent compensation can itself duplicate under repeated recovery.
EUA-12: Compensation requires its own stable identity and reconciliation semantics.
EUA-13: Known CONFIRMED original effect allows consideration of compensation as a new protected transition, subject to current policy/authority.
EUA-14: Known REJECTED/NO_EFFECT under claim-adequate evidence normally needs no compensation, subject to current context.
EUA-15: UNKNOWN with no safe branch-invariant compensation defaults to HOLD/QUARANTINE.
EUA-16: Waiting can be valid when external state may become observable later; waiting does not resolve UNKNOWN by itself.
EUA-17: Reconciliation changes UNKNOWN only when evidence satisfies identity, context, freshness and dependency requirements.
EUA-18: A stale negative observation cannot prove NO_EFFECT.
EUA-19: Resource replacement/incarnation can invalidate previous observations.
EUA-20: External history compaction can create a proof boundary; absence beyond it is not necessarily proof of absence.
EUA-21: Idempotent retry may be safer than compensation, but current authority/fence/policy still must be validated.
EUA-22: A provider status query tied to the same effect identity can potentially resolve ambiguity without issuing a new side effect.
EUA-23: Without reliable reconciliation or idempotent semantics, unresolved UNKNOWN may require quarantine.
EUA-24: Resource fencing prevents future stale execution but cannot retroactively classify a prior UNKNOWN.
EUA-25: STOP can block additional effects while leaving the original outcome UNKNOWN.
EUA-26: Recovery ownership cannot convert UNKNOWN to known world truth.
EUA-27: Compensation cannot substitute for missing evidence unless safety is proven across all possible original outcomes.
EUA-28: Retry, compensation and reconciliation are distinct effect classes.
EUA-29: Local timeout/error code alone is insufficient for recovery action selection when world outcome is ambiguous.
EUA-30: Decision inputs must include effect class, idempotency, observability, reversibility, conflict footprint, current STOP/fence/context and claim requirements.
EUA-31: A theoretically safe action under UNKNOWN may exist when it monotonically moves the world toward a safe absorbing state; this must be proven per effect class.
EUA-32: Compensation is itself an external effect and requires external fencing/currentness.
EUA-33: Original and compensating effects may race; their conflict footprint must be coordinated.
EUA-34: If original remains in flight, compensation can create order inversion; protocol must control or explicitly tolerate it.
EUA-35: Unknown provider ordering may remain UNKNOWN_ORDER and block strong causal claims.
EUA-36: Retry/compensation budgets are safety controls because each attempt can alter the world.
EUA-37: Policy/version change can make a retry semantically different; revalidation is required.
EUA-38: Stable effect identity prevents accidental new semantics but does not authorize execution.
EUA-39: Confirmed original and successful compensation are separate world events; history and current state must both be represented.
EUA-40: If uncertainty cannot be reconciled and the invariant tolerates no uncertainty, quarantine is a legitimate safety state.

## Decision matrix
UNKNOWN + idempotent retry + current context + adequate provider semantics -> RETRY MAY BE ADMISSIBLE.
UNKNOWN + reliable status/history query -> RECONCILE.
UNKNOWN + proven branch-invariant safety-preserving compensation -> COMPENSATE MAY BE ADMISSIBLE.
UNKNOWN + non-idempotent + no reliable reconciliation -> HOLD/QUARANTINE.
UNKNOWN + ambiguous compensation -> HOLD/QUARANTINE.
CONFIRMED + authorized compensation -> NEW PROTECTED COMPENSATION EFFECT.
REJECTED/NO_EFFECT + claim-adequate evidence -> normally NO COMPENSATION.
Any required dependency/fence/authority UNKNOWN -> HOLD/REVALIDATE/QUARANTINE.

## Strong conclusion
There is no universal safe rule of UNKNOWN -> retry or UNKNOWN -> compensate. Safe action is effect-class-specific and claim-specific.
Candidate principle: SAFE_UNDER_UNKNOWN must be proven over every allowed world state consistent with current evidence. If no single recovery action is safe across that uncertainty set, recovery must not guess.

## Candidate objects
EffectOutcomeUncertaintySet, RecoveryDecisionPolicy, CompensationEffectBinding, ReconciliationCapability, RetryClass, EffectClass. All remain OPEN candidates.

## Candidate invariants
INV-EUA-01..14 cover UNKNOWN semantics, non-idempotent retry blocking, compensation proof, evidence freshness/context, separation of recovery ownership from world truth, protected retry/compensation, uncertainty-safe action selection, non-regression, UNKNOWN_ORDER and safety budgets.

## Architectural consequence
Recovery needs an explicit outcome-uncertainty model rather than a generic failed/succeeded flag. UNKNOWN is a first-class epistemic state with an uncertainty set and claim-dependent admissible actions. A generic recovery engine must not invent compensation semantics; effect classes need their own proven recovery contract.

## Open
Formal uncertainty sets; proof framework for branch-invariant compensation; effect-class taxonomy; provider reconciliation; cross-resource atomicity; ambiguous-outcome fault injection; quarantine liveness.

## Next attack
UNCERTAINTY SET + MULTI-RESOURCE PARTIAL COMMIT: multiple resources have partially known outcomes; some confirmed, others UNKNOWN; compensation on one may conflict with unresolved effects on another. Analyze whether uncertainty can be safely decomposed or must remain a joint transaction-level UNKNOWN.
