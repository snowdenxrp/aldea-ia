# AB104.993R — downstream idempotency propagation is an explicit contract obligation, not inherited automatically

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If a handler or upstream service has an idempotency token, does that token automatically make every downstream service call idempotent, or must the identity be explicitly propagated and honored at each downstream boundary?

## Fresh evidence
AWS Well-Architected guidance states that in event-driven architectures duplicate delivery can occur and recommends idempotency tokens. Critically, it states that services and consumers should pass the received idempotency token to downstream services, and that every downstream service in the processing chain is similarly responsible for implementing idempotency to avoid duplicate side effects. CloudFormation's handler contract separately requires create-handler idempotency for the same handler token, while its progress-chaining framework can sequence multiple downstream API calls.

## Findings
1. Idempotency is not automatically inherited merely because an upstream operation has an idempotency token.
2. AWS explicitly treats downstream propagation and downstream enforcement as separate responsibilities.
3. Therefore a handler-level token can identify/reconcile the handler operation while a downstream API may require its own binding of that identity to its own idempotency contract.
4. If the token is not propagated, or the downstream service does not honor it, duplicate side effects remain possible even when the upstream handler is idempotent.
5. If propagation is performed, that still does not prove global exactly-once semantics unless each relevant downstream boundary preserves the identity, payload binding, scope, and retention semantics.
6. This provides a concrete basis for treating idempotency scope as a chain property rather than a single global boolean.
7. No new top-level interaction class is justified. The finding reinforces I3/I15/I19/I21/I22 and classes 3, 6, 11, 12, 15, 16, 17, 19.

## Anti-collapse
UPSTREAM_IDEMPOTENCY != DOWNSTREAM_IDEMPOTENCY
TOKEN_EXISTENCE != TOKEN_PROPAGATION
TOKEN_PROPAGATION != DOWNSTREAM_ENFORCEMENT
HANDLER_IDEMPOTENCY != GLOBAL_EXACTLY_ONCE
SAME_LOGICAL_OPERATION != SAME_DOWNSTREAM_EFFECT
RETRY != EFFECT_ABSENCE
UNKNOWN != FAILED

## Classification
Primary: I3, I15, I19, I21, I22.
Interactions: classes 3, 6, 11, 12, 15, 16, 17, 19.
Conditional: class 20 only where an explicitly declared atomic/idempotent contract spans every relevant downstream boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.993R establishes that idempotency must be propagated and independently enforced across a distributed call chain. An upstream idempotency token does not automatically become a universal downstream effect identity. Nexo must model propagation, binding, scope, payload, retention, and enforcement separately for every effect boundary.
