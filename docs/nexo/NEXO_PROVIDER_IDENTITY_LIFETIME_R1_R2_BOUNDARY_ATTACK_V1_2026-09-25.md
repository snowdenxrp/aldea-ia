# NEXO PROVIDER IDENTITY LIFETIME AND R1-R2 BOUNDARY ATTACK V1 — 2026-09-25

## Scope
AB104.168 studies effect_identity lifetime, idempotency retention, parameter immutability, resource-incarnation binding and stale-owner rejection. Goal: define the minimum evidence separating R1 from R2 and determine what remains true after key expiry or resource replacement.

## External evidence
RFC 9110 says idempotent requests may be retried after communication failure because repeating them has the same intended effect; non-idempotent requests should not be automatically retried unless the client can establish idempotence or non-application. This supports treating ambiguous non-idempotent effects as unresolved. citeturn0search0turn0search7

AWS EC2 documents client-token idempotency with exact-parameter matching. It also scopes idempotency: for some operations it is regional or zonal, meaning the same token can represent separate effects in different scopes. Therefore effect_identity must bind not only a token but its provider/resource scope. citeturn0search1turn0search5

Stripe documents that idempotency results can be automatically removed after at least 24 hours; after pruning, reusing the key can create a new request. Stripe also compares parameters and saves results only after endpoint execution begins. Therefore expiry is loss of deduplication protection, not historical proof of non-execution. citeturn0search3turn0search4

## Effect identity contract
A bare idempotency key is insufficient. Nexo effect_identity should bind provider/intermediary identity domain, operation_id, concrete effect key, immutable parameter digest, resource_id, resource_incarnation, provider scope, capability contract/version, retry_generation, creation/admission revision, retention/expiry semantics, and reconciliation locator when available.

Changing any protected parameter or resource scope creates a different semantic request and must not silently reuse the old identity.

## Lifetime states
ACTIVE_DEDUP — provider guarantees duplicate recognition within its documented scope/window.
RECONCILABLE — deduplication may be gone or insufficient, but authoritative lookup can still resolve the original effect.
EXPIRED_UNRESOLVED — provider no longer guarantees deduplication and no authoritative historical evidence proves outcome.
TERMINAL_EVIDENCED — authoritative provider evidence proves confirmed/rejected outcome.

An identity entering EXPIRED_UNRESOLVED cannot be promoted to ABSENT merely because the provider forgot its idempotency record.

## Key-expiry attack
K1 active key + same parameters: R1 can safely retry only within documented provider identity scope. This is duplicate-safe retry, not proof that the first request never executed.

K2 active key + changed parameters: behavior such as AWS IdempotentParameterMismatch demonstrates that identity and parameters are coupled. Nexo must reject this as an identity-contract violation; it must not reinterpret it as a new effect under the same identity. citeturn0search1

K3 expired key + no outcome: all classes preserve uncertainty. R0 UNKNOWN/HOLD. R1 may reconcile only if authoritative historical lookup remains. R2 fencing can prevent stale action now but does not prove historical non-execution. R3 improves this only if its transaction scope covers the relevant history.

K4 expired key + authoritative outcome: outcome can become terminal if evidence is bound to exact effect identity and resource incarnation. Expiry does not invalidate authenticated historical evidence.

## Resource-incarnation binding
A provider token can be idempotent only within its documented scope. AWS regional/zonal examples demonstrate that the same client token can correspond to separate effects when scope changes. Therefore effect_identity = token + identity domain + resource scope + immutable request binding. citeturn0search1

A replacement resource receives a new resource_incarnation. An old effect identity cannot silently migrate to it. Explicit continuity, if proven, is a separate continuity claim.

## R1 versus R2
Minimum R1: provider supplies exact effect-identity idempotency, authoritative lookup/reconciliation, or an equivalent documented mechanism preventing a repeated same-identity request from creating an additional effect. R1 does not require stale-owner rejection at the provider boundary.

Minimum R2: R1-level effect identity safety PLUS a provider/resource enforcement point that conditionally rejects stale authority, using a current fence generation/epoch/token, resource incarnation/version, conditional mutation predicate, and enforcement on every path capable of producing the protected effect.

A provider is not R2 if the fence is checked only by Nexo before dispatch, an intermediary can bypass it, another API path can mutate the same resource without the predicate, resource replacement resets the fence without continuity binding, stale workers can still submit accepted mutations, or the fence is merely advisory.

## Stale-owner attack
Owner A admits effect E; ownership transfers to B. A later sends E. R1 idempotency may prevent duplicate effect but does not necessarily reject A as stale authority. R2 requires provider rejection at the mutation boundary using current fence/resource context. A local generation check before network dispatch is not R2 because a race can occur after the check.

Therefore: R1 controls effect identity. R2 controls effect identity plus mutation authority.

## Intermediary attack
A provider may be R2 while a queue, worker, proxy or broker is not. If an intermediary can duplicate, delay, replay, substitute parameters, route to a replacement resource, or accept work without preserving fence context, the effective protected path is limited by the weakest relevant enforcement boundary. Every effect-capable intermediary belongs in the protected-path inventory.

## Evidence after expiry/replacement
Evidence remains authoritative after key expiry if it is tied to the exact immutable effect identity, relevant resource incarnation, authoritative source, integrity protection, sufficient causal attribution, and is not invalidated by later replacement/epoch rules.

A provider saying it no longer remembers a key is not evidence that the effect never happened. A provider record stating effect E completed at resource incarnation R7 remains evidence for E@R7 even if the idempotency cache later expires.

## Derived invariants
ID1 Effect identity is scoped, not just a random key.
ID2 Immutable parameter binding is part of identity.
ID3 Idempotency expiry removes duplicate-prevention guarantees; it does not prove non-execution.
ID4 Resource replacement creates a new incarnation unless continuity is proven.
ID5 R1 may make same-identity retry safe without excluding stale owners.
ID6 R2 requires provider/resource enforcement of current authority at the mutation boundary.
ID7 A pre-dispatch local check is not provider fencing.
ID8 Every mutation-capable intermediary belongs in the protected-path inventory.
ID9 Historical evidence can remain authoritative after key expiry if identity/resource binding and integrity remain valid.
ID10 New ownership cannot reinterpret an unresolved old effect as a new effect merely because the old key expired.
ID11 Safe retry and proof of non-execution are separate claims.
ID12 Capability class is scope-specific and cannot be silently promoted.

## Architecture consequence
The clean architecture should treat effect_identity as a durable, immutable, scoped identity object with an explicit retention/reconciliation lifecycle. retry_generation is subordinate to the logical operation/effect identity and cannot erase unresolved history.

R1/R2 is a claim contract: R1 identity/reconciliation safety; R2 identity/reconciliation plus enforced stale-authority rejection; R3 transactional scope over all claimed participants.

No implementation or provider selection follows yet.

## AB50–AB58 residuals preserved
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED

## DO-NOT-REPEAT
- Do not treat idempotency-key expiry as proof of non-execution.
- Do not reuse an identity after parameter/resource-scope change.
- Do not call a local preflight generation check R2 fencing.
- Do not ignore intermediary bypass paths.
- Do not let new ownership reinterpret old unresolved effects.
- Do not silently migrate an effect identity across resource incarnations.
- Do not implement V21 or select a provider from this research alone.
- Do not claim CI/test PASS without fresh evidence.

## EXACT NEXT ACTION
Attack R1/R2 contracts with adversarial provider-path cases: stale worker through every alternate mutation API, intermediary replay after fence rotation, resource replacement with reused provider token, identity-cache eviction followed by late completion, and concurrent reconciliation versus new admission. Then define the minimal provider evidence required to promote a capability from R1 to R2 without relying on provider marketing terminology.
