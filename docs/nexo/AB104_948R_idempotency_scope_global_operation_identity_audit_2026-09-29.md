# AB104.948R — idempotency scope versus global operation identity audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does a provider idempotency key establish one global operation/effect identity, or only deduplication within the provider's declared scope?

## Fresh evidence
AWS EC2 documents regional and zonal idempotency explicitly. A RunInstances client token can provide idempotency within one Region while the same request and token can be used in another Region and result in another launch. AWS also documents parameter mismatch behavior and distinguishes the idempotency scope from the global system. AWS Proton documents client-token expiry; after expiration, reuse can create a new resource.

## Scenario
R1 submits (K, X) in scope S1.
R1 becomes UNKNOWN.
R2 submits the same (K, X) in scope S2.
If the provider's contract scopes K to S, the provider can legitimately treat R2 as a new idempotent operation in S2.

Therefore:
SCOPE_LOCAL_IDEMPOTENCY != GLOBAL_OPERATION_IDENTITY.

## Findings
1. An idempotency key is not inherently globally unique.
2. The provider's declared scope is part of the identity semantics.
3. The same key+payload can denote separate provider operations in distinct scopes when the contract permits it.
4. A local idempotency replay proves deduplication only within that provider scope; it does not prove that no corresponding effect exists in another scope.
5. Cross-region/failover routing must not silently reinterpret a scoped key as a globally unique operation identity.
6. A local result of "already processed" cannot, by itself, close an UNKNOWN held against another scope.
7. Conversely, an effect observed in another scope does not prove that the first scope's operation was absent.
8. Expiration or scope changes can create a new deduplication epoch without proving the historical effect absent.
9. A correction/compensation remains a new operation/effect and needs an explicit relation to the historical effect.
10. No new top-level class is justified; the evidence reinforces I15/I22, I18, I19, I21, class 11 and class 12, with class 20 where a local atomicity claim crosses scopes.

## Required identity tuple refinement
For provider-side idempotency evidence, the effective key should be interpreted as:
(provider, operation/API, idempotency_scope, idempotency_key, parameter_binding, retention_epoch)

This is evidence metadata, not yet a frozen Nexo architecture.

## Anti-collapse
IDEMPOTENCY_KEY != GLOBAL_OPERATION_ID
IDEMPOTENCY_SCOPE != RESOURCE_IDENTITY
SAME_KEY_ACROSS_SCOPES != SAME_OPERATION
LOCAL_DEDUP_HIT != GLOBAL_EFFECT_ABSENCE
KEY_EXPIRY != HISTORICAL_ERASURE
REGIONAL_SUCCESS != GLOBAL_SUCCESS
RETRY != CORRECTION
UNKNOWN != FAILED

## Classification
Primary: I15/I22, I18, I19, I21, class 11, class 12.
Secondary: class 20 when cross-scope atomicity is claimed.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
Provider idempotency is a scoped contract, not a universal operation identity primitive. Nexo must preserve the provider and scope that gave an idempotency result before using that result as evidence about an UNKNOWN operation.
