# NEXO AB105 G0 — Synchronization Path Finding

Date: 2026-10-02
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## New source-level finding

The pinned Kafka source contains an explicit concurrency warning in `AclPublisher.onMetadataUpdate`: ACL changes are applied while the Authorizer continues returning authorization results in other threads. The publisher intentionally performs the ACL delta in order to avoid exposing an invalid intermediate ACL state.

The actual path is:

metadata loader thread
  -> AclPublisher.onMetadataUpdate(...)
  -> aclsDelta.changes().forEach(...)
  -> ClusterMetadataAuthorizer.removeAcl(key)
  -> StandardAuthorizer.removeAcl(id)
  -> StandardAuthorizerData.removeAcl(id)
  -> aclCache = aclCache.removeAcl(id)

request thread(s)
  -> StandardAuthorizer.authorize(...)
  -> curData = data   // volatile outer publication
  -> StandardAuthorizerData.authorize(...)
  -> findAclRule(...)
  -> aclCacheSnapshot = aclCache // plain inner field read

`AclPublisher` explicitly states that authorization continues in other threads while these changes are applied.

## Important source facts

1. `ClusterMetadataAuthorizer` requires its methods to be thread-safe.
2. `StandardAuthorizerData` explicitly says it is not thread-safe.
3. `StandardAuthorizer.data` is volatile.
4. `StandardAuthorizerData.aclCache` is plain, not volatile.
5. `removeAcl` constructs a new immutable `AclCache` and then performs a plain assignment to `aclCache`.
6. `AclCache` itself is immutable: its internal maps/sets are final and updates return a new `AclCache`.
7. `StandardAuthorizer.authorize` reads the volatile `data`, but normal ACL add/remove does not reassign `data` after mutating `data.aclCache`.

## Consequence

The source establishes a concrete candidate visibility boundary: the outer `volatile data` publication does not automatically constitute a happens-before edge for subsequent plain writes to the already-published `StandardAuthorizerData.aclCache` field.

This is not yet a proof of an exploitable stale authorization result. A complete conclusion still requires either:

- finding another synchronization edge in the metadata-loader/request path that publishes `aclCache`, or
- constructing an execution witness that demonstrates the reader observing a stale ACL cache after the removal has been observed as complete by the experiment.

## Relation to real-broker witness

Run 37079062681 observed two broker-local W1 cache-update events per cycle and post-D0 request admission after both W1 observations in 10/10 cycles. Cycle 9 showed the second broker's W1 after D0_RETURN but before ENQUEUE.

Therefore the experiment proves the observed temporal relation, but timestamps alone do not create JMM happens-before.

## Next action

Trace the actual MetadataLoader publication/executor boundary and the request-handler handoff. Determine whether there is a lock, volatile publication, executor queue, Future/CompletionStage, or other JMM synchronization edge connecting the ACL mutation to the authorization read. Do not patch production code yet. Do not claim a race as proven until this boundary is resolved or a stale-read execution is captured.

AB105.116R unchanged.
AB105.117R not created.
TLC not rerun.
