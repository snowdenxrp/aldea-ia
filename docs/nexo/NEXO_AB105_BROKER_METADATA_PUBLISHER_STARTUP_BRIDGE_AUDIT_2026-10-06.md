# NEXO AB105 — BROKER METADATA PUBLISHER / STARTUP BRIDGE AUDIT — 2026-10-06

Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
AB105.116R unchanged. AB105.117R NOT_CREATED. TLC NOT_RERUN.

## New exact-pinned finding

BrokerMetadataPublisher.onMetadataUpdate executes publishers sequentially on the metadata-loader callback path. The ACL publisher is invoked directly:

BrokerMetadataPublisher.onMetadataUpdate(...)
→ aclPublisher.onMetadataUpdate(delta, newImage, manifest)
→ ACL mutation / W1.

The class owns firstPublishFuture, but its completion is in the finally block of onMetadataUpdate and is explicitly used by BrokerServer only during initial startup.

BrokerServer waits for:
- initialCatchUpFuture;
- brokerMetadataPublisher.firstPublishFuture;
- authorizer readiness futures;
- SocketServer enableRequestProcessing.

These are startup/admission gates. They do not create a per-incremental-ACL-update bridge from a later W1 to a later request ENQUEUE.

## Important exclusion

The exact-pinned BrokerServer source shows request processing is enabled only after startup authorizer futures complete. Once running, incremental ACL updates do not route through firstPublishFuture or the startup authorizer futures.

Therefore the previously suspected lifecycle/readiness path is now narrowed:
- startup publication/readiness: VERIFIED;
- incremental W1 → request admission bridge through these futures: NOT IDENTIFIED.

## Current causal boundary

W1:
MetadataLoader event-handler thread
→ BrokerMetadataPublisher.onMetadataUpdate
→ AclPublisher
→ StandardAuthorizerData.aclCache plain write

Request:
independent SocketServer Processor
→ RequestChannel.sendRequest / ENQUEUE
→ KafkaRequestHandler / DEQUEUE
→ authorization / D1 aclCache plain read

Known synchronization:
- MetadataLoader KafkaEventQueue internal lock: publication only within that queue.
- RequestChannel ArrayBlockingQueue: ENQUEUE → DEQUEUE.
- Startup futures/readiness: startup only.

Unknown:
- W1 → ENQUEUE JMM HB.
- W1 → D1 aclCache visibility.
- stale-read manifestation.

## Classification

🟢 Exact pinned BrokerMetadataPublisher path inspected.
🟢 ACL publisher is called directly during metadata publication.
🟢 firstPublishFuture identified as startup-only publication/readiness mechanism.
🟢 Request admission readiness path identified as startup-only.
🔵 Incremental W1 → ENQUEUE JMM edge: UNKNOWN / NOT IDENTIFIED.
🔵 W1 → D1 visibility: UNKNOWN.
🔴 Vulnerability: NOT ESTABLISHED.

## Next target

Continue only with production cross-domain mechanisms after startup:
- BrokerMetadataPublisher / MetadataLoader completion callbacks;
- metadata version/offset gates consulted by request admission;
- broker lifecycle state transitions that are actually read by Processor/request handling;
- any shared volatile/atomic/concurrent structure touched by both the metadata and request paths.

Do not add synchronization, rerun G0, rerun TLC, modify AB105.116R, or create AB105.117R.
