# AB104.963R — provider resource identifier before terminal operation success

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If a provider exposes a resource identifier before the corresponding operation reaches terminal SUCCESS, can possession of that identifier be treated as proof that the resource operation committed successfully?

## Fresh evidence
AWS Cloud Control API documents that the primary resource identifier may be available before a resource operation reaches SUCCESS. Its ProgressEvent separately exposes the resource identifier, request token, operation type, and operation status. The documented statuses include PENDING, IN_PROGRESS, SUCCESS, FAILED, CANCEL_IN_PROGRESS, and CANCEL_COMPLETE. Cloud Control also documents that a request can be partially completed and that cancellation can leave changes applied without rollback. 

## Findings
1. Resource-identifier availability is not terminal-success evidence.
2. The same ProgressEvent deliberately exposes identifier and operation status as separate fields, confirming that resource identity and operation outcome are distinct protocol dimensions.
3. A resource identifier can therefore become observable while the operation remains IN_PROGRESS, later SUCCESS, FAILED, or CANCEL_COMPLETE.
4. Consequently, PROVIDER_ID_PRESENT != EFFECT_COMMITTED and PROVIDER_ID_PRESENT != OPERATION_SUCCESS.
5. A later SUCCESS status is evidence about the provider operation only within that operation/request context; it does not by itself prove every underlying external effect was atomically committed if the provider contract permits partial underlying work.
6. A FAILED or CANCEL_COMPLETE status does not justify erasing already-observed resource/effect evidence when the provider explicitly permits partial application.
7. Reconciliation must bind at least request token, resource identifier, operation status, observation time, and any provider-specific effect/handler evidence.
8. A resource identifier observed during IN_PROGRESS must not be used as a shortcut to authorize a downstream assumption that the resource already exists in its final intended state.
9. No new top-level interaction class is justified. The result strengthens I19/I21/I22 and classes 7, 11, 12, 19; class 20 remains conditional on an explicit atomicity contract.

## Anti-collapse
PROVIDER_ID_PRESENT != OPERATION_SUCCESS
PROVIDER_ID_PRESENT != EFFECT_COMMITTED
IN_PROGRESS != SUCCESS
FAILED != NO_EFFECT
CANCEL_COMPLETE != ROLLED_BACK
RESOURCE_ID != COMPLETE_HISTORY
OBSERVATION_TIME != EFFECT_TIME
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22; classes 7, 11, 12, 19.
Secondary: I15, I18 and class 20 where idempotency, identity, or cross-domain atomicity boundaries are explicit.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
A provider-generated identifier can be an early identity signal rather than a terminal outcome signal. Nexo must not promote identifier presence into success or effect commitment. Identity, operation status, underlying effects, and observation time remain separate evidence dimensions until the provider contract explicitly binds them.
