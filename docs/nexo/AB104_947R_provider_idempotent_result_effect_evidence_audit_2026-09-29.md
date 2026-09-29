# AB104.947R — provider idempotency result replay versus authoritative effect evidence audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When a provider returns the original saved idempotent result on a retry, what exactly is proven, and what remains an independent evidence question?

## Fresh evidence
Stripe documents that an idempotent request reusing the same key returns the same result as the first request and that parameters are compared to prevent accidental key reuse. Stripe's API reference also distinguishes request processing from later asynchronous state changes for some resources, meaning a successful idempotent HTTP result is not universally identical to final domain completion. AWS idempotency guidance distinguishes request deduplication from the business outcome and requires callers to interpret the downstream result according to the service contract.

## Scenario
P1(K,X,A1) is submitted.
The caller loses the response and records UNKNOWN.
R2 retries P1 with the same K and identical X within the provider's valid idempotency window.
Provider returns the saved result associated with K.
That result may represent:
- accepted/created request;
- a synchronous committed effect;
- an asynchronous operation whose final state is pending;
- a business-level failure recorded by the provider.

## Findings
1. A provider's replayed idempotent response can establish that the provider recognized K as the same request under its contract.
2. It can establish the provider's stored result for that key, but the semantic meaning of that result depends on the provider's API contract.
3. If the result explicitly guarantees committed effect, it can resolve the corresponding UNKNOWN to CONFIRMED for that provider effect.
4. If the result only means accepted/queued, final external effect remains a separate state and may still be UNKNOWN/PENDING.
5. A saved provider result does not automatically establish authorization validity at the original execution time; authority assessment remains a separate provenance question.
6. Reusing K with identical payload can be a true retry; reusing K with a changed semantic payload is not made equivalent by the key.
7. If provider retention expires, the same K may no longer replay the original result; a new request may be created.
8. The local system should store the provider response/evidence with its scope, timestamp, key, payload binding, and semantic result type rather than reducing it to a generic SUCCESS.
9. If a later compensation is required, it is a new operation/effect even when it references the provider's original idempotent request.
10. Existing classes remain sufficient: I15/I22, I19, I21, class 11, class 12, I9 when authority matters, I18 for namespace/incarnation, and class 20 at local/provider atomicity boundaries. No new top-level class.

## Representation
P1(K,X,A1) -> UNKNOWN
R2(K,X,A1) -> PROVIDER_SAVED_RESULT(R)
Interpret R according to contract:
- R=COMMITTED_EFFECT -> UNKNOWN -> CONFIRMED
- R=ACCEPTED/PENDING -> UNKNOWN remains PENDING/UNKNOWN
- R=BUSINESS_FAILURE -> FAILED if authoritative semantics establish non-execution
- R=AMBIGUOUS -> UNKNOWN remains

## Anti-collapse
IDEMPOTENT_RESPONSE != GENERIC_SUCCESS
PROVIDER_SAVED_RESULT != UNIVERSAL_EFFECT_PROOF
ACCEPTED != COMMITTED
QUEUED != COMPLETED
SAME_KEY+SAME_PAYLOAD != SAME_AUTHORIZATION
IDEMPOTENCY_RESULT != AUTHORIZATION_PROOF
KEY_RETENTION != EFFECT_RETENTION
UNKNOWN != FAILED
COMPENSATION != RETRY

## Classification
Primary: I15/I22, I19, I21, class 11, class 12.
Secondary: I9, I18, class 20 where applicable.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
An idempotent retry response is evidence about provider request identity and the provider's recorded result. It becomes effect evidence only to the extent the provider contract explicitly gives that meaning. Nexo must therefore retain result semantics instead of collapsing every replayed response into SUCCESS.
