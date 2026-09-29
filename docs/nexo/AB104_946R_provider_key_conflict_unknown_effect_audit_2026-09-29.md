# AB104.946R — provider idempotency conflict response versus prior UNKNOWN effect audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If a failover retry reuses the original provider idempotency key with a different payload and the provider rejects the reuse, what can that rejection actually prove about the original UNKNOWN attempt?

## Fresh evidence
Stripe's idempotent request documentation states that the first request's result is saved for a key and subsequent requests with the same key return the saved result; parameters are compared to prevent accidental reuse. Stripe also documents that idempotency keys are retained for a bounded period and that after expiry a new request may be treated as new. AWS idempotency guidance similarly requires stable identity across retries and warns that the same key must represent the same semantic request. Microsoft Idempotent Consumer guidance distinguishes duplicate suppression from external-effect completion and requires reconciliation for uncertain external calls.

## Scenario
P1(K,X,A1) is submitted and becomes UNKNOWN.
After failover, R2 submits P2(K,Y,A2), with Y different from X.
Provider returns KEY_PARAMETER_CONFLICT / equivalent conflict.
Local system now knows that the provider associated K with a prior request or considers the reuse incompatible.
The question is whether this proves P1 executed.

## Findings
1. A parameter-conflict response can establish a provider-level identity/payload inconsistency for K within the provider's retained scope.
2. It does not by itself prove P1's external effect committed.
3. It does not prove P1 failed.
4. It does not prove the provider never received P1.
5. If provider documentation guarantees that a stored first result exists whenever a conflict is returned, that is evidence of provider-side persistence of the original request/result record; whether that record means external effect committed still depends on the provider's contract.
6. If the provider returns the original saved result for an identical retry, that can resolve the retry's relationship to the original request under the provider contract; it still does not justify changing historical authority or payload.
7. If the key has expired, a later conflict/non-conflict may have different semantics and cannot be interpreted using the old retention assumptions.
8. The local system must preserve the original UNKNOWN state until authoritative effect evidence resolves it, unless the provider contract explicitly supplies sufficient effect-state evidence.
9. A correction with Y should not be forced through K merely to inherit deduplication; it is a separate semantic operation unless the provider contract explicitly defines K as a mutable/correction identity.
10. This remains existing I15/I22, I19, I21, I9, class 11 and class 12; I18 if key namespace/incarnation changes; class 20 at the local/provider transaction boundary. No new top-level class.

## Representation
P1(K,X,A1) -> UNKNOWN
P2(K,Y,A2) -> KEY_PARAMETER_CONFLICT
Facts:
- K has provider-level conflict evidence.
- P1 outcome remains UNKNOWN unless provider evidence resolves it.
- P2 is not silently transformed into P1 or a correction of P1.
If authoritative provider result says P1 committed: UNKNOWN -> CONFIRMED.
If authoritative provider result says P1 did not execute: UNKNOWN -> FAILED.
Otherwise: UNKNOWN remains.

## Anti-collapse
KEY_CONFLICT != EFFECT_COMMITTED
KEY_CONFLICT != EFFECT_FAILED
KEY_CONFLICT != REQUEST_NEVER_RECEIVED
PROVIDER_RECORD != EFFECT_PROOF
SAME_KEY != SAME_PAYLOAD
IDENTITY_CONFLICT != HISTORY_REWRITE
KEY_EXPIRY != EFFECT_ABSENCE
CORRECTION != RETRY
UNKNOWN != FAILED

## Classification
Primary: I15/I22, I19, I21, I9, class 11, class 12.
I18 applies for namespace/incarnation changes.
Class 20 applies at local/provider atomicity boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
A provider idempotency conflict is useful evidence about identity and parameter binding, but it is not automatically an effect-outcome oracle. Nexo must preserve the distinction between provider request record, effect occurrence, authorization, and reconciliation outcome.
