# AB104.957R — idempotency response versus current-state observation after expiry/recreation

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When a provider accepts or responds to a late retry after idempotency expiry or resource recreation, can that response be treated as authoritative current-state evidence for the visible resource identifier?

## Fresh evidence
AWS ECS states that successful RunTask retries with the same client token and parameters return the original result, while its API follows eventual consistency and explicitly warns that state changes may not be immediately visible to subsequent commands. AWS Proton documents endpoint-specific idempotent delete behavior: a retry after deletion can return prior metadata or an empty response; asynchronous delete retries can return DELETE_IN_PROGRESS or an empty response depending on the original operation state. AWS Proton also documents create-token expiry after eight hours, after which a retry creates a new resource. AWS EC2 documents that idempotency scope can be regional or zonal, so token reuse can represent different operation domains.

## Findings
1. A provider retry response can contain historical operation evidence, current-state information, or both; the contract must identify which.
2. Returning an original resource detail on replay is evidence about the historical idempotent operation, but does not automatically establish that the resource remains in that state at observation time.
3. An empty response after deletion can establish only the delete endpoint's documented semantics; it must not be generalized into proof that every historical effect or successor incarnation is absent.
4. Eventual consistency creates a separate observation-time dimension: CURRENT_OBSERVATION(t2) != COMPLETE_HISTORY.
5. After token expiry, a provider may create a new operation/resource. A successful response from that new operation must not be retroactively attributed to the original O1.
6. If the visible identifier is reused, the response must be bound to an explicit resource incarnation or provider-generated resource identity before it can be used as evidence about I2.
7. Therefore a retry response is not a universal effect oracle: response semantics, operation identity, resource identity, and observation time remain separate evidence dimensions.
8. Nexo should preserve typed evidence rather than collapse all successful responses into COMMITTED_CURRENT_STATE.
9. No new top-level interaction class is justified. This strengthens I15/I18/I19/I21/I22 and classes 7, 12, and 19; class 20 remains conditional on an explicit atomic boundary.

## Anti-collapse
RETRY_RESPONSE != CURRENT_STATE
ORIGINAL_RESULT != CURRENT_STATE
OBSERVATION_TIME != EFFECT_TIME
TOKEN_EXPIRY != HISTORICAL_ERASURE
NEW_OPERATION != ORIGINAL_OPERATION
RESOURCE_ID_REUSE != SAME_INCARNATION
EMPTY_RESPONSE != UNIVERSAL_ABSENCE
UNKNOWN != FAILED

## Classification
Primary: I15, I18, I19, I21, I22; classes 7, 12, 19.
Secondary: I9 and class 20 only where authority/cross-system atomicity is explicitly involved.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
A provider's retry response must be interpreted according to the exact endpoint contract and observation time. It can be historical-operation evidence without being current-state proof, and a new successful operation after expiry must remain distinct from the original operation. After recreation, Nexo must bind evidence to the correct resource incarnation before making any current-state or safety claim.
