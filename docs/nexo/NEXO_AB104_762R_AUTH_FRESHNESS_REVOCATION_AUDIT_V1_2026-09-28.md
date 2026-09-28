# NEXO AB104.762R — AuthHelper authorization freshness / revocation audit

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation, no V21, no formal verification claim.

## Scope
Audit the AB104.761R open question: whether Kafka's `AuthHelper.filterByAuthorized` or related authorization path caches/memoizes authorization in a way that could preserve stale authorization after ACL revocation or credential/session changes.

## Evidence inspected

1. Apache Kafka `AuthHelper` source:
`filterByAuthorized(requestContext, operation, resourceType, resources, ...)` groups resource names, constructs `Action` objects, and invokes `authZ.authorize(requestContext, actions)`. The helper itself contains no authorization-result cache or memoization. Its `authorize` path likewise delegates to the configured authorizer for each call. If no authorizer is configured, it allows by configuration semantics. Source: Apache Kafka AuthHelper at Google Git mirror / current repository lineage.

2. Kafka `StandardAuthorizer`:
The built-in KRaft authorizer stores its current authorization data in a volatile `StandardAuthorizerData data` reference. Each `authorize` call snapshots the current `data` reference and evaluates the action against that current ACL data. The authorizer therefore does not reuse a prior per-request authorization decision across later calls. Source: Apache Kafka StandardAuthorizer.java.

3. Kafka `StandardAuthorizerData`:
Authorization evaluates the supplied request context's principal and client address against the ACL data. The current ACL cache/data is consulted for the authorization call; matching DENY takes precedence over ALLOW, with default behavior depending on configuration. Source: Apache Kafka StandardAuthorizerData.java.

4. Kafka Authorizer SPI:
Kafka explicitly defines `authorize` as a synchronous API intended for use with locally cached ACLs. ACL creation/deletion are asynchronous APIs, and implementations may complete them asynchronously when remote metadata/state propagation is required. This establishes that authorization freshness depends on the local authorizer state being current; the API does not itself define a universal revocation fence across every broker/request already in flight.

5. Kafka KRaft startup/publishing path:
For StandardAuthorizer-like metadata-log authorizers, ACL metadata is published through `AclPublisher`. Kafka's broker/controller startup code explicitly waits for authorizer metadata readiness before normal request processing, and comments identify the metadata publisher/high-watermark relationship. This supports the distinction between authorizer-local current state and cluster-wide propagation/ordering.

6. Kafka security model:
ACLs are stored in cluster metadata for KRaft and authorization is performed by the configured authorizer. ACL deletion is a control-plane operation; the security documentation does not claim that an already-created request is retroactively cancelled when its authorization basis changes.

## Findings

A. AUTHHELPER_RESULT_CACHE = NOT FOUND.
No result cache/memoization was found in the audited AuthHelper path. Each Produce authorization call reaches the configured Authorizer with the request context and current action set.

B. STALE_AUTH_FROM_AUTHHELPER_CACHE = NOT SUPPORTED BY SOURCE.
The stale-decision hypothesis cannot be attributed to AuthHelper retaining an old authorization result.

C. LOCAL_AUTHORIZER_STATE = MATERIAL.
StandardAuthorizer evaluates against its current local authorization data. Therefore freshness is bounded by the state that has actually reached that broker/controller authorizer.

D. REVOCATION_PROPAGATION != REQUEST_REVOCATION.
Deleting an ACL updates authorization state through the metadata/control path; this does not by itself prove cancellation of a Request object that was already admitted/queued or whose authorization decision has already been made.

E. REQUEST_CONTEXT != LIVE_AUTHORITY_EPOCH.
The audited Produce path passes the existing RequestContext into AuthHelper. The evidence does not show a generic authority epoch/revocation token being checked immediately before the external effect.

F. CUSTOM_AUTHORIZERS REMAIN OPEN.
The Authorizer SPI permits custom implementations. A custom authorizer can have its own cache/freshness semantics. Therefore absence of caching in Kafka's built-in AuthHelper/StandardAuthorizer must not be generalized into a property of every configured authorizer.

G. CREDENTIAL CHANGE IS A SEPARATE QUESTION.
ACL revocation and credential/session invalidation are not equivalent. The present audit establishes no AuthHelper decision cache, but it does not establish that every credential change necessarily invalidates an already-authenticated connection or already-created Request at the exact effect boundary.

## Nexo interpretation

The Kafka evidence strengthens the boundary:

CURRENT_AUTHORIZATION_RESULT
is a point-in-time decision over
(request context, action, authorizer state).

It is not automatically:

CURRENT_AUTHORITY_AT_EFFECT_TIME.

For Nexo, an authorization result used to admit a protected external effect must therefore have an explicit freshness/revocation boundary if revocation during the operation is part of the safety property.

Candidate invariant (OPEN, not yet architecture-final):
If authority can be revoked after admission and before external effect, the final effect gate must either:
1. revalidate against a current authority generation/fence, or
2. hold a protected lease/fence whose validity is checked by the effect executor/resource,
with the exact semantics depending on the effect protocol.

This is a design consequence, not an implementation claim.

## Evidence status

AUTHHELPER_RESULT_CACHE: SOURCE_AUDITED_NO_CACHE_FOUND
STANDARD_AUTHORIZER_CURRENT_STATE_LOOKUP: SOURCE_CONFIRMED
ACL_UPDATE_ASYNC_INTERFACE: SOURCE_CONFIRMED
ACL_METADATA_PUBLISHING_PATH: SOURCE_CONFIRMED
ALREADY_QUEUED_REQUEST_AUTO_CANCEL_ON_REVOCATION: NOT_ESTABLISHED
REVOCATION_RECHECK_IMMEDIATELY_BEFORE_PRODUCE_APPEND: NOT_ESTABLISHED
CUSTOM_AUTHORIZER_FRESHNESS: UNKNOWN
CREDENTIAL_CHANGE_INVALIDATES_EXISTING_REQUEST: UNKNOWN
AUTHORITATIVE REVOCATION FENCE: NOT_ESTABLISHED

## Exact next action

AB104.763R:
Audit the actual ACL mutation-to-authorizer propagation path and tests, then identify an executable Kafka interleaving for:
ALLOW observed -> ACL revoke committed -> broker authorization state updated/not updated -> already-created Produce Request reaches append.
Determine whether Kafka has an explicit synchronization point that can be used as revocation freshness evidence, and whether an already-authorized request is rechecked after that point.

Do not treat source recipes as executed tests.
Do not infer Nexo correctness from Kafka behavior.
