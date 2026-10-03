# NEXO AB105 G0 — Selector/Processor Causal Audit — 2026-10-03

Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## Result
Pinned SocketServer confirms the data plane uses independent Processor threads, each with its own selector. `processCompletedReceives` constructs the request and calls `requestChannel.sendRequest(req)` on that Processor path.

`enableRequestProcessing` uses authorizer futures only to delay startup of acceptors/processors. The source explicitly describes this as startup sequencing; it does not provide a per-ACL-update synchronization path.

The SocketServer-level synchronized blocks protect server lifecycle/configuration operations. No inspected path connects MetadataLoader's ACL W1 write to a later Processor receive/ENQUEUE operation through those locks.

## Boundary
🟢 MetadataLoader W1 path remains distinct from network Processor path.
🟢 Processor → ArrayBlockingQueue.put is exact.
🟢 Queue publication to consumer remains the known ENQUEUE→DEQUEUE synchronization edge.
🟢 Startup authorizer future is not a post-update publication primitive.
🔵 W1→ENQUEUE JMM happens-before remains UNKNOWN.
🔵 ordinary aclCache read visibility remains UNKNOWN.
🔵 stale read and incorrect authorization remain UNKNOWN.
🔴 vulnerability/security conclusion NOT_DECLARED.

## Next
The remaining source audit should inspect the concrete Selector implementation only to verify whether request receive completion crosses any shared synchronization that could originate from MetadataLoader. If absent, stop source inference and preserve UNKNOWN; do not manufacture a race result.

Frozen: AB105.116R unchanged; AB105.117R not created; TLC not rerun; PR #94 not merged; no artificial W1 gate.
