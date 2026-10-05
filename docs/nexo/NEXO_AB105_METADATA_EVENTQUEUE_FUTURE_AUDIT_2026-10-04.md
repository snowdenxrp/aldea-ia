# NEXO AB105 — MetadataLoader EventQueue/Future Audit (2026-10-04)

## New source result
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

### 🟢 Verified
MetadataLoader has a dedicated KafkaEventQueue. All publisher callbacks are made from the loader thread.

installPublishers(...) returns a CompletableFuture, but that future completes when publishers are added to the loader queue and initialization is scheduled; it is a publisher-installation/startup mechanism, not a future emitted for each metadata update.

waitForAllEventsToBeHandled() exists, but is explicitly VisibleForTesting and is not part of the production ACL/request path.

maybePublishMetadata(...) invokes each installed publisher synchronously on the loader thread. After BrokerMetadataPublisher.onMetadataUpdate() returns, MetadataLoader updates metrics and continues; there is no production per-update future handed to request processing.

### Consequence
There is no generic MetadataLoader future that a later request-handler authorization call awaits for every ACL delta.

This closes another candidate synchronization hypothesis:
MetadataLoader EventQueue → per-update Future → D1 = NOT IDENTIFIED.

### Combined result
Startup: initial authorizer future / firstPublishFuture can establish readiness before inbound processing.

Steady-state incremental ACL:
- AclPublisher executes W1 on MetadataLoader thread.
- No per-update publication future to request handling identified.
- RequestChannel ENQUEUE→DEQUEUE remains a separate request-domain edge.
- Therefore HB(W1→D1) remains UNKNOWN / NOT IDENTIFIED.

### Epistemic status
🟢 Source absence result, bounded to inspected production path.
🔴 Not a proof that no synchronization exists anywhere in the entire system.
🔴 Stale-read execution not observed / not disproven.
🔴 Security impact not established.

## DO-NOT-REPEAT
Do not rerun PR92, PR93, PR94/G0, or TLC.
Do not add artificial synchronization to W1→D1.

## Next frontier
Inspect only whether request admission/SocketServer/authorizer invocation has a per-mutation dependency on metadata-loader progress (offset/future/condition/lock). If none exists, close this branch as bounded NOT-IDENTIFIED HB.
