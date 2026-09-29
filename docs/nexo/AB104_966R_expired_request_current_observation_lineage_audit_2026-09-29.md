# AB104.966R — request-token expiration versus independent resource evidence

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
After a provider request record expires, can an independent current resource observation be used to reconstruct the expired operation, or does it only establish current-state evidence?

## Fresh evidence
AWS Cloud Control API states that RequestToken is used to track a resource operation request and that resource operation requests expire after seven days. GetResourceRequestStatus returns a ProgressEvent containing RequestToken, Identifier, Operation, OperationStatus, EventTime, and optionally ResourceModel. AWS also documents that resource identifiers can be available before SUCCESS and that a request may partially apply. Therefore the request record and the resource observation are related but distinct evidence sources.

## Findings
1. After request-record expiry, a current resource observation remains evidence about the resource at its observation time; it is not automatically a reconstruction of the expired operation history.
2. A current observation can corroborate a historical operation only when an explicit provider identity/lineage contract binds the observation to that operation.
3. Same resource identifier plus temporal proximity is insufficient by itself to reconstruct the full expired request, especially where multiple operations can modify the same resource.
4. A current state can be compatible with multiple historical histories; therefore state matching is not historical uniqueness proof.
5. If the expired request's terminal status is unavailable and the current resource state does not uniquely bind to that request, the operation outcome remains UNKNOWN/partially reconstructed.
6. If the provider contract explicitly guarantees immutable/non-reused identity and exposes sufficient historical linkage, the current observation can strengthen the historical binding, but only within that contract.
7. The evidence model should distinguish:
   - expired request record,
   - current resource observation,
   - historical operation identity,
   - identity/lineage contract,
   - reconstructed relation and confidence.
8. No new top-level interaction class is justified. This strengthens I18/I19/I21/I22 and classes 7, 12, 17, 19; I15 remains relevant to request-token/idempotency retention.

## Anti-collapse
CURRENT_OBSERVATION != EXPIRED_OPERATION_HISTORY
SAME_RESOURCE_ID != SAME_HISTORICAL_OPERATION
TEMPORAL_PROXIMITY != LINEAGE_PROOF
CURRENT_STATE_MATCH != HISTORICAL_UNIQUENESS
REQUEST_RECORD_EXPIRY != RESOURCE_ERASURE
RESOURCE_OBSERVATION != OPERATION_TERMINAL_STATUS
UNKNOWN != FAILED

## Classification
Primary: I18, I19, I21, I22; classes 7, 12, 17, 19.
Secondary: I15 and class 20 where idempotency/atomicity boundaries are explicit.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
Expiration removes a provider observation/control record; it does not automatically make current resource state a historical replay of that operation. Nexo should join current observations to expired operations only when the provider contract supplies sufficient identity and lineage evidence. Otherwise preserve a partial reconstruction and UNKNOWN outcome rather than infer historical uniqueness from present state.
