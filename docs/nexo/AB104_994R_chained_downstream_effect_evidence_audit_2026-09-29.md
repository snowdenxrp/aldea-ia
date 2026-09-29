# AB104.994R — chained downstream calls can leave intermediate effects while the handler remains IN_PROGRESS or retries

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When a resource handler performs multiple downstream API calls, does handler-level continuation/replay imply that every prior downstream call is known to have committed exactly once, or must each call retain its own effect evidence/idempotency semantics?

## Fresh evidence
AWS CloudFormation's progress-chaining documentation describes a handler as a sequence of API-call contexts: initiate a call, transform the request, make the service call, optionally handle errors, optionally stabilize, then continue or report success. The framework can resume a chain after it was halted, including after stabilization waits lasting minutes or hours. The Kinesis example explicitly chains creation, tagging, encryption and other operations. citeturn0search0

AWS's handler contract separately requires create/update handlers to remain IN_PROGRESS until desired state is reached, and notes that multiple API calls and wait periods may be required. It also requires handler-level create idempotency for the same idempotency token, while stating that this contract assumes no other concurrent interaction on the resource. citeturn0search2

AWS's ProgressEvent schema describes CallbackContext as arbitrary state/metadata passed between subsequent retries, for example a resource identifier used to continue stabilization polling. It is continuation state, not a universal ledger proving every prior downstream effect. citeturn0search4

## Findings
1. A chained handler is a sequence of downstream effect boundaries, not one indivisible effect merely because CloudFormation exposes one handler operation.
2. A previous downstream call can have completed while a later call is still pending, fails, or is retried; handler status IN_PROGRESS does not erase the earlier effect.
3. Framework continuation/replay establishes where the handler resumes, but does not by itself establish global exactly-once semantics for every downstream API call.
4. Each mutating downstream boundary needs its own idempotency/effect contract, or an explicitly documented transaction/atomicity contract that covers it.
5. Handler-level SUCCESS means the handler's declared desired-state contract has been satisfied; it does not, without an explicit contract, become proof that every historical intermediate attempt was exactly once or that every external effect has a single immutable execution history.
6. A retryable error after a prior successful call cannot be collapsed into EFFECT_ABSENT merely because the overall handler has not yet succeeded.
7. Conversely, an eventual handler SUCCESS does not prove that an earlier failed/ambiguous attempt produced no effect unless the downstream contract supplies that evidence.
8. This strengthens the distinction between operation identity, per-call/effect identity, continuation state, and effect evidence.

## Anti-collapse
HANDLER_IN_PROGRESS != NO_PRIOR_EFFECT
HANDLER_SUCCESS != ALL_INTERMEDIATE_CALLS_EXACTLY_ONCE
CALL_CHAIN_RESUME != GLOBAL_EFFECT_LEDGER
CALL_CONTEXT != EFFECT_COMMIT_PROOF
RETRYABLE_ERROR != EFFECT_ABSENCE
FINAL_RESOURCE_STATE != COMPLETE_EFFECT_HISTORY
HANDLER_IDEMPOTENCY != MULTI_API_CHAIN_IDEMPOTENCY

## Classification
Primary: I3, I15, I19, I21, I22.
Interactions: classes 3, 4, 6, 11, 12, 15, 16, 17, 19.
Conditional: class 20 only if the system explicitly claims atomicity across the complete downstream chain.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.994R confirms that a multi-call handler must not be modeled as one atomic external effect by default. Continuation metadata and handler-level idempotency can preserve operation progress, but downstream calls remain separate effect boundaries unless an explicit atomic contract says otherwise. Nexo must preserve each boundary's identity, retry semantics, idempotency scope, and effect evidence.
