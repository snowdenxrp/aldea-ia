# NEXO AB105 G0 — JMM Publication Boundary Audit — 2026-10-02

## Scope
Follow-up to the AB105 G0 ordering-witness/JMM analysis. This audit inspects the fixed Kafka reference commit `99b940733a9f6bc409457dba7108f08421d81e42` without modifying Kafka, AB105.116R, AB105.117R, or rerunning TLC.

## Findings

### 1. Metadata publication thread boundary — DEMONSTRATED
`AclPublisher.onMetadataUpdate()` is invoked by `MetadataLoader.maybePublishMetadata()`.

`MetadataLoader` explicitly documents that it maintains its own thread and uses that thread for all callbacks into publishers. The loader owns a `KafkaEventQueue`; Raft commit/snapshot callbacks append work to that queue. Therefore the ACL update is serialized through the metadata-loader event-queue thread.

### 2. Broker publisher path — DEMONSTRATED
`BrokerMetadataPublisher.onMetadataUpdate()` invokes:
`aclPublisher.onMetadataUpdate(delta, newImage, manifest)`.

This establishes the concrete path:
Raft metadata callback -> MetadataLoader event queue -> BrokerMetadataPublisher -> AclPublisher -> ClusterMetadataAuthorizer.

### 3. Incremental ACL update — DEMONSTRATED
For incremental ACL deltas, `AclPublisher` iterates the ordered changes and calls `addAcl()` or `removeAcl()` on the `ClusterMetadataAuthorizer`.

For removal, `StandardAuthorizerData.removeAcl()` computes a new immutable `AclCache` and then performs the plain assignment:
`aclCache = aclCacheSnapshot;`

### 4. Authorization reader — DEMONSTRATED
`StandardAuthorizerData.authorize()` eventually calls `findAclRule()`, which reads:
`AclCache aclCacheSnapshot = aclCache;`

The `aclCache` field is non-volatile.

### 5. Outer volatile publication — DEMONSTRATED
`StandardAuthorizer` declares:
`private volatile StandardAuthorizerData data`

However, incremental `addAcl()` / `removeAcl()` operate on the existing `StandardAuthorizerData` object. They do not themselves assign the volatile `data` field.

Therefore the current evidence does NOT establish a happens-before edge from the incremental plain `aclCache` write to a concurrent authorization read merely because the reader first obtains `StandardAuthorizerData` through the volatile `data` reference.

## Epistemic status

- 🟢 Metadata-loader thread / callback serialization: demonstrated.
- 🟢 Concrete ACL update path: demonstrated.
- 🟢 Plain `aclCache` write and plain `aclCache` read: demonstrated.
- 🟢 Volatile outer `data` field: demonstrated.
- 🔵 A distinct happens-before edge from incremental `aclCache` write to concurrent `authorize()` read: NOT YET DEMONSTRATED.
- 🔵 Reachable stale-read / incorrect authorization outcome under the Java Memory Model: UNKNOWN.
- 🔴 No claim of vulnerability or bug is made from these observations alone.

## Important distinction
The MetadataLoader event queue proves serialization among metadata-loader callbacks. It does not, by itself, prove publication to arbitrary request/authorization threads. The remaining investigation must therefore trace the request-side execution boundary and any synchronization/publication primitive shared with the metadata-loader path.

## Next action
Trace the concrete request-side path into `StandardAuthorizer.authorize()` and determine whether it shares a lock, monitor, volatile publication, Future/CompletionStage synchronization, executor handoff, or other formal JMM happens-before edge with the metadata-loader update path.

Do not treat temporal ordering observed by the witness as a JMM guarantee.
