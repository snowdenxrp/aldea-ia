# NEXO AB104.764R — ACL mutation → metadata publication → broker authorizer freshness

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation and no executed race test.

## Scope

Audit the Kafka KRaft path from ACL mutation through metadata publication into the broker's StandardAuthorizer, and determine what synchronization/freshness boundary is actually established for an already-running Produce request.

## Findings

### 1. ACL state is persisted in the KRaft metadata log

StandardAuthorizer stores ACLs in the metadata log. Kafka's KIP-801 states that brokers continuously read metadata up to their local last stable/high-water point, so a broker's authorization state corresponds to some point on the metadata timeline. The active controller can be slightly ahead of other nodes.

### 2. AclPublisher is the broker-side application boundary

Current Kafka AclPublisher.onMetadataUpdate receives a MetadataDelta and MetadataImage. For non-snapshot deltas, it iterates aclsDelta.changes() in performed order and calls ClusterMetadataAuthorizer.addAcl(...) or removeAcl(...).

The source explicitly states that authorization continues concurrently while changes are applied, and that changes must be applied in order so invalid intermediate ACL states are not exposed.

For snapshot loads, loadSnapshot(...) replaces ACL state as a coherent snapshot.

### 3. StandardAuthorizer has a current mutable ACL state

StandardAuthorizer keeps a volatile StandardAuthorizerData data. authorize() snapshots that reference and evaluates actions against it. addAcl and removeAcl mutate the authorizer's current data under the implementation's synchronization discipline.

Therefore:
- a later authorization call can observe the newer ACL state after removeAcl;
- an authorization decision already returned to KafkaApis is not automatically recomputed merely because StandardAuthorizerData later changes.

### 4. Metadata readiness is not continuous global revocation synchronization

Kafka's startup path explicitly waits for authorizer metadata to become available before normal request processing. Controller code says metadata publishers do not publish until the controller has caught up to the high watermark.

This establishes an initialization/readiness barrier, not a per-request revocation barrier.

### 5. No audited source establishes cancellation/revocation of an in-flight Produce request

The combined source path remains:
ACL mutation committed/persisted → metadata consumed by broker → AclPublisher applies removeAcl → future authorize() calls see the new state
while an already-running request can have:
authorize(ALLOW) → authorizedRequestInfo → ReplicaManager → append
without a generic second ACL check.

The sources do not establish that an in-flight request is interrupted when the ACL state changes.

## Strongest supported interleaving

I = request authorization completes with ALLOW
R = ACL deletion becomes committed in metadata
P = broker AclPublisher applies removeAcl
A = same request reaches append

The source permits the ordering I < R < P < A and does not identify a mechanism that forces A to fail merely because P occurred after I.

It also permits I < R < A < P because broker metadata propagation is not instantaneous.

These are source-derived orderings, NOT executed race results.

## Critical distinction

Kafka therefore gives us a useful evidence model:
- metadata ordering: ACL changes are ordered in the metadata stream;
- broker-local freshness: each broker authorizes using its current locally applied ACL state;
- request authorization: authorization is performed when KafkaApis handles the request;
- effect revocation: no generic source-backed fence was found that revalidates a previously authorized Produce operation immediately before append.

## Test evidence status

Searches for an explicit upstream test reproducing ALLOW → revoke → in-flight Produce → append did not return a matching deterministic test in the searched source surface.

This does NOT prove no such test exists anywhere in the full Kafka repository. It only means no matching test was established by this audit.

## Nexo interpretation

This strengthens the architecture requirement:
AUTHORIZATION_AT_ADMISSION and AUTHORIZATION_AT_EFFECT must be modeled as separate concepts whenever authority can be revoked during an operation.

A durable Nexo effect contract cannot safely treat an old admission decision as equivalent to current authority unless the contract explicitly defines the freshness interval/fence and its semantics.

The Kafka case also shows why a simple authority_epoch field is insufficient unless the protected effect checks that epoch/freshness at the correct boundary. The exact Nexo mechanism remains OPEN.

## Evidence ledger

ACL_STORAGE_IN_METADATA_LOG: SOURCE CONFIRMED
ACL_CHANGE_ORDER_PRESERVED: SOURCE CONFIRMED
BROKER_LOCAL_AUTHORIZE_STATE: SOURCE CONFIRMED
INITIAL_AUTHORIZE_READINESS_BARRIER: SOURCE CONFIRMED
PER_REQUEST_REVOCATION_FENCE: NOT FOUND
IN_FLIGHT_PRODUCE_CANCELLATION_ON_ACL_REVOCATION: NOT ESTABLISHED
EXECUTED_REVOCATION_RACE: NO
DETERMINISTIC_UPSTREAM_RACE_TEST_FOUND: NOT ESTABLISHED
CUSTOM_AUTHORIZER_FRESHNESS: OPEN

## Exact next action

AB104.765R:
Inspect the actual DeleteAcls request path and the StandardAuthorizer ACL mutator path (createAcls/deleteAcls → controller mutation → metadata record → broker publication). Establish whether completion of the administrative delete request itself is a sufficient freshness point for the issuing client, or only a control-plane completion point. Then compare this with the broker-local publication point and preserve any ambiguity.

Do not equate AdminClient DeleteAcls success with global effect revocation unless source evidence establishes that ordering.
