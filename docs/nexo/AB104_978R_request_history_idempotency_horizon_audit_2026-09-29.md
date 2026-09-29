# AB104.978R — request-history expiry is distinct from idempotency expiry

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
After the Cloud Control ClientToken idempotency horizon expires, can the still-retained RequestToken history be used to recover the original operation identity?

## Fresh evidence
AWS documents two separate horizons. ClientToken provides idempotency for 36 hours; after that, the same ClientToken is treated as a new request. Separately, Cloud Control resource operation requests and their RequestToken tracking records expire after seven days. GetResourceRequestStatus uses RequestToken to retrieve the current state of that particular resource operation request. AWS also documents that a request may partially complete and that downstream asynchronous work may continue after cancellation.

## Findings
1. ClientToken retention and RequestToken/request-record retention are separate mechanisms with different horizons.
2. During the overlap, RequestToken can provide request-specific historical tracking even though it is not the same identifier as ClientToken.
3. After ClientToken expiry but before request-record expiry, the original RequestToken may still provide evidence about the original request; therefore token expiry alone does not immediately imply total loss of provider-side request evidence.
4. After the seven-day request-record horizon, Cloud Control no longer provides that RequestToken tracking record through the documented request-status mechanism.
5. Therefore provider evidence has layered horizons: idempotency horizon < request-observability horizon, and neither horizon equals effect lifetime.
6. A retained RequestToken record can establish facts about the original request, but it does not automatically establish complete historical effect lineage, especially where downstream asynchronous operations or partial application are possible.
7. Consequently, Nexo must distinguish: deduplication identity, request-tracking identity, effect identity, and durable historical lineage.
8. No new top-level interaction class is justified. This sharpens I15/I19/I21/I22 and classes 3, 12, 15, 17, 18, 19.

## Anti-collapse
CLIENT_TOKEN_HORIZON != REQUEST_TOKEN_HORIZON
REQUEST_RECORD_RETENTION != EFFECT_LIFETIME
REQUEST_TOKEN != EFFECT_ID
REQUEST_STATUS_HISTORY != COMPLETE_EFFECT_HISTORY
TOKEN_EXPIRY != EVIDENCE_ERASURE
REQUEST_RECORD_EXPIRY != EFFECT_ABSENCE
UNKNOWN != FAILED

## Classification
Primary: I15.
Interactions: I19, I21, I22; classes 3, 12, 15, 17, 18, 19.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.978R establishes that provider retention is multidimensional. Cloud Control's 36-hour idempotency horizon and seven-day request-observability horizon must not be collapsed into one lifetime, and neither should be treated as an effect lifetime. Durable Nexo history therefore cannot depend solely on either provider token mechanism.
