# AB104.960R — provider identity non-reuse and observation binding audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Is a provider-generated resource identifier sufficient by itself to prove that a later observation refers to the same historical incarnation?

## Fresh evidence
AWS ECS states that a successful RunTask retry with the same client token and parameters returns the original result and exposes task ARNs, while idempotency is scoped to the cluster. AWS EC2 documents regional/zonal idempotency and eventual consistency; a just-created resource ID can temporarily produce a NotFound response even though the resource exists. AWS Proton documents that client-token expiry or deletion of the original resource can cause a retry to create a new resource, while delete retries have endpoint-specific historical semantics. AWS Cloud Control API recommends unique client tokens and notes that one resource operation may involve multiple underlying calls and partial application.

## Findings
1. A provider-generated identifier is stronger than a visible name only if its uniqueness/reuse semantics are explicitly established by the provider contract.
2. Provider identity alone is therefore not a universal proof of historical continuity; its domain, lifetime, reuse policy, and observation semantics must be known.
3. Eventual-consistency NotFound is not proof of historical absence or deletion.
4. A later successful read of the same provider identifier is stronger evidence of continuity than a visible-name match, but still requires the provider's identity semantics and observation time.
5. If an identifier is guaranteed unique/non-reused within the relevant provider domain, it can close the identity edge between historical operation and later observation; if not, lineage remains incomplete.
6. Token scope and provider-resource identity remain separate: the same token can identify distinct operations across scopes, while a resource identifier may have its own lifetime and reuse rules.
7. A partial underlying operation can create a resource/effect without yielding a single atomic external fact; operation identity therefore cannot be collapsed into resource-state identity.
8. Nexo should model an explicit identity-contract predicate before treating provider IDs as immutable historical anchors: uniqueness scope, non-reuse guarantee, lifetime, issuer/domain, and observation semantics.
9. No new top-level interaction class is justified. This strengthens I18/I19/I21/I22 and classes 7, 11, 12, and 19; class 20 remains conditional on an explicit atomic boundary.

## Anti-collapse
PROVIDER_ID != AUTOMATIC_GLOBAL_IDENTITY
PROVIDER_ID_REUSE_POLICY != TOKEN_SCOPE
NOT_FOUND(t2) != HISTORICAL_ABSENCE
SAME_PROVIDER_ID != SAME_OPERATION
SAME_VISIBLE_ID != SAME_INCARNATION
TEMPORAL_PROXIMITY != LINEAGE_PROOF
PARTIAL_APPLY != ATOMIC_COMMIT
UNKNOWN != FAILED

## Classification
Primary: I18, I19, I21, I22; classes 7, 11, 12, 19.
Secondary: I15 and class 20 where idempotency/atomicity boundaries are explicit.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
A provider-generated resource ID is useful binding evidence, not a universal identity oracle. Nexo must first establish the provider's identity contract—scope, uniqueness, non-reuse, lifetime, and observation semantics—before using that ID to join historical operation evidence to a later observation. Otherwise the identity edge remains UNKNOWN.
