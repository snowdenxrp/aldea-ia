# AB104.956R — expired idempotency token versus successor incarnation audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
After a resource is deleted and recreated, what can be inferred when the original idempotency token has expired and a late retry arrives?

## Fresh evidence
AWS Proton explicitly documents that some client-token create APIs expire tokens after eight hours and that retrying with an expired token creates a new resource; it also states that retrying after the original resource is deleted creates a new resource. Its idempotent delete APIs have different endpoint-specific semantics: after deletion, a retry may return prior metadata or an empty response, while asynchronous deletes can return DELETE_IN_PROGRESS or an empty response depending on completion. AWS ECS documents a 24-hour RunTask token TTL bounded by resource lifetime plus one hour, and says retries with the same token and parameters return the original result while parameter changes can produce ConflictException. AWS EC2 documents that idempotency scope can be regional or zonal, so identical tokens can denote distinct operations in different scopes.

## Findings
1. Token expiry can terminate the provider's idempotency relationship without proving anything about historical resource existence.
2. A provider may deliberately define an expired retry as a new operation; therefore an expired token is not a historical-operation identity by itself.
3. Resource deletion can also be a provider-defined boundary for idempotency on some endpoints; this is endpoint-specific, not a universal rule.
4. Therefore TOKEN_EXPIRED cannot be normalized to either HISTORICAL_EFFECT_ABSENT or RETRY_IS_SAME_OPERATION.
5. If the same visible resource identifier is later assigned to I2, an expired late retry cannot be inferred to target I2 merely because I1 no longer exists.
6. Conversely, if the provider contract explicitly defines the expired retry as a new operation, the retry must receive a new operation identity; it must not inherit O1 merely because the client reused K.
7. Same token + different scope can also be a distinct operation even without expiry; scope belongs in the identity tuple.
8. Provider retry responses can establish only the semantics promised by that endpoint's contract. A successful response is not automatically evidence that the historical effect was absent before the retry.
9. For Nexo, the identity decision must precede any current-resource mutation decision: determine provider scope, token status, parameter binding, and target incarnation before treating a late retry as replay, new operation, conflict, or UNKNOWN.
10. No new top-level interaction class is justified. The evidence strengthens I15/I18/I19/I21/I22 and class 12; class 20 remains conditional on an explicit atomic boundary.

## Anti-collapse
TOKEN_EXPIRED != HISTORICAL_ERASURE
TOKEN_EXPIRED != SAME_OPERATION
TOKEN_EXPIRED != SUCCESSOR_TARGET
RESOURCE_DELETED != OPERATION_FORGOTTEN
RESOURCE_ID_REUSE != RETRY_RETARGET
SAME_TOKEN != SAME_OPERATION
SAME_TOKEN_DIFFERENT_SCOPE != SAME_IDENTITY
NEW_OPERATION != CORRECTION
UNKNOWN != FAILED

## Classification
Primary: I15, I18, I19, I21, I22, class 12.
Secondary: I9 and class 20 only where authority/cross-system atomicity is explicitly involved.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
An expired idempotency token is an identity/retention fact, not an effect-outcome oracle. Depending on the provider contract, an expired retry may be rejected, treated as a new operation, or otherwise handled endpoint-specifically. After resource recreation, Nexo must not infer successor targeting from the visible identifier or from token reuse. If the provider contract cannot establish the historical target or the new-operation boundary, preserve UNKNOWN and require reconciliation rather than silently mutating I2.
