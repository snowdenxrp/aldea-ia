# AB104.992R — handler idempotency closes duplicate-resource creation, not universal downstream-effect duplication

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does the CloudFormation resource-handler idempotency contract guarantee that retries cannot duplicate any external side effect, or is its guarantee narrower?

## Fresh evidence
AWS's resource type handler contract requires create handlers to be idempotent and explicitly defines the guarantee in terms of not creating multiple resources for the same idempotency token. AWS also states that a create handler must not leak resources when re-invoked with the same token. Separately, AWS's progress-chaining framework can sequence multiple downstream API calls and resume the chain after stabilization. The ProgressEvent CallbackContext carries arbitrary continuation state/metadata between retries, rather than constituting a universal ledger for every downstream effect.

## Findings
1. CloudFormation create-handler idempotency explicitly prevents duplicate resource creation for the same idempotency token.
2. That is a scoped resource-creation guarantee, not a universal proof that every downstream API side effect made by the handler is globally idempotent.
3. A handler can perform multiple downstream calls; their individual idempotency/transaction semantics remain properties of those downstream APIs and the handler implementation.
4. Therefore same-token handler re-invocation does not by itself prove that every earlier downstream call was absent, duplicated, or exactly-once.
5. CallbackContext can preserve continuation metadata and the framework can resume a call chain, but this is not equivalent to a durable cross-service effect ledger.
6. If a downstream API has its own idempotency key or atomic contract, that evidence can close the specific downstream boundary; otherwise UNKNOWN remains possible after ambiguous failure/retry.
7. No new top-level interaction class is justified. The result reinforces I3/I15/I19/I21/I22 and classes 3, 6, 11, 12, 15, 16, 17, 19.

## Anti-collapse
HANDLER_IDEMPOTENCY != GLOBAL_EFFECT_IDEMPOTENCY
SAME_TOKEN != EXACTLY_ONCE_ALL_SIDE_EFFECTS
NO_DUPLICATE_RESOURCE != NO_DUPLICATE_DOWNSTREAM_EFFECT
CALLBACK_CONTEXT != EFFECT_LEDGER
RETRY != EFFECT_ABSENCE
DOWNSTREAM_IDEMPOTENCY_SCOPE != HANDLER_IDEMPOTENCY_SCOPE
UNKNOWN != FAILED

## Classification
Primary: I3, I15, I19, I21, I22.
Interactions: classes 3, 6, 11, 12, 15, 16, 17, 19.
Conditional: class 20 only where an explicit atomic/idempotent contract spans all relevant downstream effects.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.992R narrows the idempotency claim: CloudFormation requires handler-level create idempotency against duplicate resource creation, but that does not become a universal exactly-once guarantee for every downstream side effect. Nexo must bind idempotency evidence to the specific identity, scope, API, payload, retention, and effect boundary that the contract actually covers.
