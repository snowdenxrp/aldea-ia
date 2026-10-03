# NEXO AB105 G0 — JMM Publication Boundary Conclusion — 2026-10-02

## Final audit conclusion for the current boundary

The complete inspected path now covers both sides of the candidate visibility edge:

### Metadata/update side
Raft metadata callback
-> MetadataLoader KafkaEventQueue / metadata-loader thread
-> BrokerMetadataPublisher
-> AclPublisher.onMetadataUpdate
-> ClusterMetadataAuthorizer
-> StandardAuthorizer.removeAcl
-> StandardAuthorizerData.removeAcl
-> plain write: aclCache = new immutable cache

### Request/authorization side
data-plane request queue
-> KafkaRequestHandler
-> KafkaApis.handle
-> AuthHelper.authorize / filterByAuthorized
-> Authorizer.authorize
-> StandardAuthorizer.authorize
-> volatile read of data
-> StandardAuthorizerData.authorize
-> plain read of aclCache

## What the audit establishes

1. The request side is executed by Kafka request-handler threads. Authorization is performed synchronously from request handling through AuthHelper into the Authorizer; there is no observed Future/CompletionStage boundary between the request handler and StandardAuthorizer.authorize for the ordinary authorization call.
2. The RequestChannel/request-handler queue is the request-delivery mechanism. It establishes the lifecycle of the request reaching the handler, but the inspected path does not establish that an ACL metadata update completed on the MetadataLoader thread happens-before an independently arriving request on the data-plane handler thread.
3. AuthHelper is a direct delegation layer: it calls Plugin.get().authorize(...) and does not add synchronization around the authorizer call.
4. Therefore no independent request-side synchronization primitive was found that closes W1 -> R1.
5. The earlier volatile read of StandardAuthorizer.data remains insufficient for incremental aclCache writes because addAcl/removeAcl mutate the already-published StandardAuthorizerData object without republishing data.

## Conclusion

The audit is now complete at the source-path level inspected for G0.

Result:
- 🟢 Concrete cross-thread update/read path identified.
- 🟢 Metadata side and request side are distinct execution contexts.
- 🟢 Incremental aclCache write is plain.
- 🟢 Authorization aclCache read is plain.
- 🟢 Outer data reference is volatile.
- 🟢 AuthHelper is a direct delegation and adds no synchronization.
- 🔵 No W1 -> R1 happens-before edge has been identified in the inspected path.
- 🔵 A stale-cache observation after an update remains UNKNOWN.
- 🔵 Incorrect authorization/exploitability remains UNKNOWN.
- 🔴 No vulnerability claim is made.

## Consequence for the experiment

The real-broker witness is not invalid. Its observed W1 -> later request ordering remains runtime evidence. It simply cannot be promoted to a JMM guarantee.

The next scientifically useful step is no longer another source-path reread. It is a minimal focused concurrency witness against the exact pinned Kafka commit, designed to distinguish:
A) merely delayed metadata propagation / expected temporal behavior,
from
B) an authorization request that reaches the authorizer after the update has completed on the metadata side but still reads the old aclCache.

No Kafka production code is patched. No TLC rerun is required for this boundary conclusion. AB105.116R remains untouched and AB105.117R is not created by this audit.

## DO-NOT-REPEAT

Do not repeat MetadataLoader/AclPublisher/AuthHelper source tracing unless new evidence changes the path. The source-level publication question has been audited to the request boundary. Preserve the UNKNOWN distinction between missing formal HB and demonstrated stale authorization.
