# AB104.983R — callback re-invocation continuity is not effect continuity

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does CloudFormation's callback/progress-chaining mechanism, which resumes a handler after IN_PROGRESS, establish that all work initiated before the callback has completed or that no downstream effect occurred outside the handler's callback state?

## Fresh evidence
AWS documents that handlers can return IN_PROGRESS with CallbackContext so later invocations can continue work from where the handler stopped. The framework can resume a call chain after stabilization delays lasting minutes or hours. AWS's example explicitly chains service calls, stabilization, additional mutations, and finally a Read handler before returning the final successful response. The ProgressEvent schema describes CallbackContext as state/metadata passed between subsequent retries, including a resource identifier used to continue polling for stabilization.

## Findings
1. CallbackContext provides continuation state for the handler's workflow; it is not itself a durable ledger of every external effect.
2. A later callback invocation proves continuation of the handler protocol, not that all previously initiated external work has completed unless the handler/provider contract explicitly establishes that relation.
3. The documented chaining pattern can wait for stabilization before advancing to subsequent mutations, showing that handler-level sequencing can provide a scoped ordering guarantee.
4. That scoped ordering must not be generalized beyond the calls and stabilization conditions actually represented in the chain.
5. If an underlying service starts an asynchronous operation whose completion is not represented by the handler's stabilization predicate, the callback chain cannot by itself establish terminal completion of that operation.
6. Therefore CALLBACK_RESUMPTION != EFFECT_COMPLETION and CALLBACK_CONTEXT != EFFECT_LEDGER.
7. No new top-level interaction class is justified; the result reinforces I19/I21/I22 and classes 6, 11, 12, 17, 19. Class 20 remains conditional.

## Anti-collapse
CALLBACK_RESUMPTION != EFFECT_COMPLETION
CALLBACK_CONTEXT != EFFECT_LEDGER
IN_PROGRESS_RETRY != DOWNSTREAM_TERMINALITY
HANDLER_SEQUENCE != GLOBAL_SERIALIZATION
STABILIZATION_PREDICATE != ALL_EXTERNAL_EFFECTS
CONTINUATION_STATE != HISTORICAL_EFFECT_PROOF
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22.
Interactions: classes 6, 11, 12, 17, 19.
Conditional: class 20 where the provider explicitly declares a cross-domain atomic/ordering boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.983R establishes that CloudFormation callback/progress chaining is a continuation mechanism with scoped sequencing and stabilization semantics, not a universal external-effect ledger. Nexo must distinguish protocol continuation evidence from effect completion evidence and bind any stronger relation to the explicit handler/provider contract.
