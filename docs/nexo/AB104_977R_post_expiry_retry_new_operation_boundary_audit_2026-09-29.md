# AB104.977R — post-expiry token reuse can be mistaken for retry without provider-history evidence

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
After Cloud Control's 36-hour ClientToken idempotency horizon, can a caller determine from the later request fields alone whether the request is a retry of the historical operation or a genuinely new operation?

## Fresh evidence
AWS states that ClientToken is valid for 36 hours and that after expiry the same token is treated as a new request. AWS also recommends unique client tokens for every resource operation so retries can be distinguished from new requests. The API exposes a separate RequestToken for tracking the resource operation request and a separate Identifier for the resource. AWS further documents that a resource operation can partially complete and that failure does not roll the resource back.

## Findings
1. After ClientToken expiry, the provider's idempotency layer no longer supplies the historical retry relation for that token.
2. Reusing the same token therefore does not let the caller infer, from token equality alone, that the later request is a retry.
3. The same resource Identifier does not close the gap because one resource can have multiple operations and state transitions.
4. The same TypeName/TypeVersionId likewise does not establish operation identity; it describes the resource type context, not the unique historical operation.
5. A new RequestToken tracks the later request, so the provider itself gives the later request a distinct request-tracking identity even when the expired ClientToken is reused.
6. If the original operation produced a durable external effect, the absence of an active idempotency relation does not erase that effect. The later request may therefore produce an additional effect.
7. Distinguishing "retry" from "new operation" after expiry requires an independent durable operation lineage or authoritative provider history outside the expired ClientToken relation.
8. No new top-level interaction class is justified. This is a sharper witness for I15, interacting with I18/I19/I21/I22 and classes 3, 12, 15, 17, 18, 19.

## Anti-collapse
POST_EXPIRY_TOKEN_EQUALITY != RETRY_PROOF
SAME_IDENTIFIER != SAME_OPERATION
SAME_TYPE_VERSION != SAME_OPERATION
NEW_REQUEST_TOKEN != HISTORICAL_RETRY_IDENTITY
TOKEN_EXPIRY != EFFECT_ERASURE
NO_ACTIVE_DEDUP_RELATION != NO_HISTORICAL_EFFECT
UNKNOWN != FAILED

## Classification
Primary: I15.
Interactions: I18, I19, I21, I22; classes 3, 12, 15, 17, 18, 19.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.977R strengthens the temporal idempotency boundary: once the provider's ClientToken horizon expires, token equality cannot by itself classify a later request as a retry of the historical operation. Nexo must preserve an independent durable operation lineage if retry/new-operation distinction must remain decidable beyond provider retention.
