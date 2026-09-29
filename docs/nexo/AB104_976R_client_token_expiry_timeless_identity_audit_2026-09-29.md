# AB104.976R — client-token expiry breaks timeless retry identity

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does the same Cloud Control ClientToken remain a timeless operation identity after its idempotency horizon expires?

## Fresh evidence
AWS documents that ClientToken is an idempotency identifier for create, delete, and update resource requests. A ClientToken is valid for 36 hours once used; after that, a resource request using the same ClientToken is treated as a new request. AWS also documents ClientTokenConflictException when the token is still recognized as having been used in another resource request. The same API separately identifies the target resource with Identifier and the resource-type handler version with TypeVersionId. AWS recommends a unique token for every resource operation.

## Findings
1. ClientToken is an idempotency identity within a bounded retention horizon, not a timeless global operation identifier.
2. Before expiry, reuse can be recognized as a retry/conflict under the Cloud Control contract; after expiry, the same token can denote a new resource request.
3. Therefore SAME_CLIENT_TOKEN_AFTER_EXPIRY does not prove SAME_OPERATION.
4. SAME_CLIENT_TOKEN + SAME_IDENTIFIER + SAME_TYPE_VERSION_ID still does not restore timeless operation identity after expiry; those fields identify different semantic dimensions.
5. Token expiry does not prove that the historical effect disappeared, was reversed, or never occurred.
6. A post-expiry retry may therefore create a new operation/effect while remaining superficially identical on token/resource/type-version fields.
7. This is an explicit instance of the previously established I15 temporal idempotency boundary, interacting with I18/I19/I21/I22. No new top-level class is justified.
8. If a system needs identity beyond the provider's retention horizon, it requires an independent durable operation identity and historical lineage record outside the provider token itself.

## Anti-collapse
CLIENT_TOKEN != TIMELESS_OPERATION_ID
TOKEN_EXPIRY != EFFECT_ABSENCE
SAME_TOKEN_AFTER_EXPIRY != SAME_OPERATION
SAME_TOKEN + SAME_IDENTIFIER != SAME_HISTORY
TYPE_VERSION_ID != OPERATION_ID
NEW_REQUEST_AFTER_EXPIRY != HISTORICAL_RETRY_PROOF
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
AB104.976R establishes a concrete bounded-idempotency boundary: Cloud Control itself treats a reused ClientToken after 36 hours as a new request. Nexo must therefore never use a provider idempotency token as the sole timeless operation identity. Historical identity must survive independently if the system needs to reason about effects beyond the provider's idempotency horizon.
