# AB104.965R — request-token lifecycle versus historical operation identity

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does the provider's request-token lifecycle define the lifetime of the historical operation itself, or only the provider's ability to retrieve/manage that operation through its request-status interface?

## Fresh evidence
AWS Cloud Control API states that resource-operation requests are asynchronous and that RequestToken is used with GetResourceRequestStatus to track the current status. It also states that resource-operation requests expire after seven days. Separately, ProgressEvent identifies RequestToken as the unique token for the resource operation request, while Identifier identifies the resource and OperationStatus identifies current operation state.

## Findings
1. Expiration of a request-status record is not, by itself, proof that the historical operation or its effects ceased to exist.
2. Request-token retention therefore belongs to the provider's observability/control horizon, not automatically to the effect's lifetime.
3. A RequestToken can bind observations within its documented lifecycle; after expiration, absence of the request record is not historical-erasure evidence.
4. Resource Identifier, RequestToken, and OperationStatus remain distinct dimensions even before expiration.
5. A later resource observation may provide evidence about current state, but cannot automatically reconstruct an expired operation history.
6. Therefore provider request-record disappearance must be represented separately from operation outcome, effect existence, and historical evidence completeness.
7. This creates a direct reconciliation boundary: if the request record expires while effect evidence remains incomplete, Nexo must preserve UNKNOWN rather than convert request unavailability into FAILED/ABSENT.
8. No new top-level interaction class is justified. This strengthens I15, I18, I19, I21, I22 and classes 7, 11, 12, 17, 19.

## Anti-collapse
REQUEST_RECORD_EXPIRY != OPERATION_ERASURE
REQUEST_STATUS_UNAVAILABLE != EFFECT_ABSENT
REQUEST_TOKEN != RESOURCE_ID
REQUEST_TOKEN != GLOBAL_HISTORICAL_PROOF
CURRENT_RESOURCE_STATE != COMPLETE_EXPIRED_HISTORY
OBSERVABILITY_HORIZON != EFFECT_LIFETIME
UNKNOWN != FAILED

## Classification
Primary: I15, I18, I19, I21, I22; classes 7, 11, 12, 17, 19.
Secondary: class 20 where cross-domain atomicity is explicitly claimed.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.965R separates the provider's request-record retention horizon from the historical lifetime of the operation and its effects. Expiration of RequestToken observability must never be promoted to proof of effect absence or operation erasure. If authoritative historical evidence is incomplete after the provider record expires, preserve UNKNOWN and reconcile through whatever independent evidence remains.
