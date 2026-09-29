# AB104.955R — idempotency record survival versus resource incarnation after delete/recreation

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence pending until commit returned.

## Question
Does survival, expiry, or scope of a provider idempotency record track the lifetime of the deleted resource, and can a late delete retry therefore become a request against a successor incarnation?

## Fresh evidence
AWS ECS documents that RunTask idempotency is cluster-scoped: the same client token is a distinct request in another cluster, and a reused token with changed parameters conflicts. AWS EC2 documents regional and zonal idempotency scopes; the same token can legitimately represent separate idempotent request domains in different scopes. AWS Proton documents endpoint-specific delete semantics: retries after deletion can return historical metadata or an empty response, while its client-token create APIs can expire after eight hours and, after original-resource deletion, a retry can create a new resource. These are explicit provider contracts, not universal semantics.

## Findings
1. Idempotency-record lifetime is not intrinsically the same thing as resource lifetime.
2. Provider idempotency scope is part of operation identity; a token alone is insufficient.
3. A provider may retain enough historical binding to replay a completed delete without acting on a successor resource, but this must be established by that endpoint's contract.
4. Conversely, provider contracts can explicitly allow an expired token to become a new operation; therefore TOKEN_EXPIRY != HISTORICAL_ERASURE is not equivalent to saying every provider preserves the old binding.
5. A delete/recreate sequence with the same visible resource identifier therefore requires explicit target-incarnation semantics. Current lookup alone cannot establish that a late retry is still bound to I1.
6. A provider-specific idempotency response can be evidence about the historical operation, but only to the extent the contract states what that response means. It must not be promoted automatically to proof of current resource state.
7. Same client token across different provider scopes can legitimately identify different operations; therefore reuse of a token outside its original scope is not necessarily a retry.
8. If the provider's documented semantics do not bind the late request to the historical incarnation, Nexo must preserve UNKNOWN or require explicit reconciliation rather than silently retargeting to I2.
9. No new top-level interaction class is justified. The evidence strengthens I15/I18/I19/I21/I22 and class 12; class 20 remains conditional on a claimed atomic boundary.

## Anti-collapse
IDEMPOTENCY_RECORD_SURVIVAL != RESOURCE_SURVIVAL
TOKEN_SCOPE != RESOURCE_IDENTITY
TOKEN_EXPIRY != HISTORICAL_ERASURE
DELETE_REPLAY != SUCCESSOR_TARGET
RESOURCE_ID_REUSE != OPERATION_ID_REUSE
CURRENT_LOOKUP != HISTORICAL_BINDING
RETRY != RETARGET
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
Provider idempotency retention and resource lifetime are separate dimensions. A late delete retry after recreation cannot be interpreted from a visible resource ID or token alone. The provider contract must define scope, parameter binding, retention, and historical-target behavior; otherwise the safe semantic result is UNKNOWN/reconciliation rather than silent retargeting.
