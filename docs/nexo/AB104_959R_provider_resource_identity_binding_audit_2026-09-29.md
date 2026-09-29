# AB104.959R — provider resource identity as the binding boundary audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When a retry response and a later read both exist after eventual consistency or recreation, what evidence binds them to the same resource incarnation?

## Fresh evidence
AWS ECS documents that RunTask idempotency is cluster-scoped and that a successful retry with the same token and parameters returns the original result. Its API documents eventual consistency and, on ConflictException, identifies existing task ARNs already associated with the client token. AWS Proton documents that idempotent create retries can return original resource detail data, while an expired token or a retry after original-resource deletion can create a new resource. Proton delete retries separately distinguish historical metadata, empty responses, and DELETE_IN_PROGRESS.

## Findings
1. Provider-generated resource identity can be the binding boundary between historical operation evidence and a later observation, when the provider contract guarantees its identity semantics.
2. A client token is not sufficient by itself: ECS scopes idempotency to the cluster, while the returned task ARN identifies the concrete task resource associated with the token.
3. A visible resource name or reusable identifier is weaker than an immutable/provider-scoped resource identity; matching the visible identifier after recreation does not establish continuity.
4. A replay response containing the original provider resource identity can establish historical association, but a later read must independently demonstrate that it refers to that same identity.
5. Eventual consistency can delay visibility of a mutation, so temporal proximity between replay and read is not lineage proof.
6. Token expiry or deletion can cause a provider to create a new resource under the same client-token value for certain endpoints; that new resource must receive a distinct operation/resource identity rather than inheriting historical identity.
7. Therefore the evidence graph should represent the binding relation explicitly: operation_id -> provider_resource_id -> incarnation/lineage -> observation.
8. If the provider exposes no stable identity capable of linking the historical operation to the later observation, the relation remains UNKNOWN even if the visible name matches.
9. This is an evidence/identity boundary, not a new top-level interaction class.

## Anti-collapse
CLIENT_TOKEN != RESOURCE_IDENTITY
VISIBLE_NAME != PROVIDER_RESOURCE_ID
REPLAY_RESPONSE != LATER_READ
TEMPORAL_PROXIMITY != LINEAGE_PROOF
SAME_VISIBLE_ID != SAME_INCARNATION
TOKEN_EXPIRY != HISTORICAL_ERASURE
NEW_RESOURCE != HISTORICAL_RESOURCE
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
The strongest binding evidence is not the reused client token or visible resource name but an explicit provider/resource identity whose semantics are contractually stable across the relevant observation window. Without that identity relation, Nexo must preserve UNKNOWN rather than infer continuity from matching names, tokens, or timestamps.
