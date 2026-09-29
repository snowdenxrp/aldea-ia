# AB104.962R — resource identity versus operation identity under partial multi-call execution

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Can a provider resource identifier be treated as the complete identity of the operation that produced or modified it when one provider operation may execute multiple underlying calls, partially apply, or have an idempotency token with finite lifetime?

## Fresh evidence
AWS Cloud Control API states that a single resource operation can consist of multiple calls to the underlying service and can fail after only some requested changes are applied; it does not roll back the resource to its previous state. It separately recommends client tokens to disambiguate retries. Cloud Control API also states that a client token is valid for 36 hours; after expiration, the same token is treated as a new request. Its resource-identifier model defines a primary identifier as unique for a resource of a given type in an AWS account and Region, while operation requests have their own request/client tokens. These are separate identity layers.

## Findings
1. A resource identifier identifies a resource under the provider's resource-identity contract; it does not by itself identify the complete historical operation that produced or changed that resource.
2. One operation may have multiple underlying calls and partial application. Therefore operation outcome cannot be reconstructed solely from the final resource identifier or final resource state.
3. Client-token identity is a separate retry/request identity. Cloud Control API explicitly gives it a finite 36-hour lifetime; after expiry, the same token can represent a new request.
4. A provider resource identifier may remain stable while multiple operations act on that resource; conversely, one logical operation may affect multiple underlying resources/effects. Thus RESOURCE_ID != OPERATION_ID in the general case.
5. A final resource state can be compatible with multiple historical operation histories. The state alone therefore does not prove which operation sequence produced it.
6. A request token can prove retry/request identity only within its documented scope and retention window. It cannot be promoted to a timeless global operation identity.
7. When an operation partially applies, evidence must preserve at least the operation/request identity, affected resource identities, underlying-effect evidence, and terminal/UNKNOWN status separately.
8. Cancellation is not equivalent to rollback: Cloud Control API documents that cancellation can leave a request partially completed and does not terminate asynchronous downstream operations already started.
9. No new top-level interaction class is justified. The result strengthens I15, I18, I19, I21, I22 and classes 7, 11, 12, 19; class 20 remains conditional on an explicit cross-domain atomicity contract.

## Anti-collapse
RESOURCE_ID != OPERATION_ID
REQUEST_TOKEN != RESOURCE_ID
REQUEST_TOKEN != TIMELESS_GLOBAL_OPERATION_ID
FINAL_STATE != COMPLETE_HISTORY
PARTIAL_APPLY != ATOMIC_COMMIT
CANCEL_REQUEST != ROLLBACK
CANCELLED_REQUEST != DOWNSTREAM_EFFECT_ABSENT
TOKEN_EXPIRY != HISTORICAL_ERASURE
UNKNOWN != FAILED

## Classification
Primary: I15, I18, I19, I21, I22; classes 7, 11, 12, 19.
Secondary: class 20 only where a cross-domain atomic boundary is explicitly claimed.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.962R closes another identity-collapse path: a provider resource ID is not a substitute for operation identity, and a client token is not a timeless operation identity. Because one provider operation can partially apply across multiple underlying calls, Nexo must preserve operation/request identity, resource identity, effect evidence, and outcome separately. Where the mapping is incomplete, preserve UNKNOWN rather than infer a complete historical operation from final state.
