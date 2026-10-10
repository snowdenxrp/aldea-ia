# AB105 G0 RPC RequestChannel publication-boundary audit — 2026-10-02

Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`.

## Request-handler path

The broker request path uses `KafkaRequestHandler` instances to receive requests from `RequestChannel` and then call `KafkaApis.handle(...)`. The handler therefore executes authorization on a request-handler thread, not on the metadata event-queue thread. The Kafka Authorizer API documents that `authorize(...)` is synchronous and is invoked on the request thread. 

At the source level already established for this investigation:
- metadata ACL mutation runs through MetadataLoader -> AclPublisher -> StandardAuthorizer.removeAcl() -> StandardAuthorizerData.removeAcl();
- StandardAuthorizerData replaces the plain `aclCache` field with a new immutable AclCache;
- StandardAuthorizer.authorize() snapshots volatile `data`, then StandardAuthorizerData.findAclRule() snapshots plain `aclCache`.

## RequestChannel synchronization boundary

Kafka's RequestChannel is a producer/consumer hand-off between network/processor threads and KafkaRequestHandler threads. Its request queue is a blocking queue; request submission uses a queue insertion operation and the handler receives the request using a corresponding queue removal operation.

A blocking queue hand-off is a real Java concurrency publication mechanism: actions performed by the producer before a successful queue insertion happen-before actions in the consumer after the corresponding removal. Therefore:

1. If the ACL mutation's plain `aclCache` write completes before the network/processor thread enqueues the RPC request, the queue hand-off can publish the mutation to the request-handler thread.
2. If the RPC request is already enqueued/dequeued before the ACL mutation occurs, that queue hand-off does not order the later mutation before the authorization read.
3. Therefore RequestChannel does not create a blanket metadata-mutation -> authorization happens-before edge. The ordering depends on the relative position of the ACL mutation and request publication.

This distinction is important for the AB105 G0 discriminator. A request that is genuinely submitted to the broker only after D0/removeAcl completion has an existing request-channel publication path that can explain visibility of the completed mutation without requiring a special ACL lock. A request already in flight before D0 remains a different temporal case.

## Consequence for the G0 hypothesis

The investigation must not collapse these two cases:

- `D0 -> request enqueue -> request dequeue -> authorize`: an existing queue publication edge may provide the required happens-before relationship.
- `request enqueue/dequeue -> D0 -> authorize`: the request-channel hand-off does not publish the later ACL mutation to that handler.

The existing G0 causal-v2 harness intentionally measures temporal overlap around `removeAcl()`, but it is not a full broker RequestChannel publication experiment. Its OVERLAP_ALLOWED observations therefore cannot be reinterpreted as proof of a production RequestChannel stale-read path.

The earlier real production-path witness (10 iterations, real StandardAuthorizer + real RPC request after D0) observed D1_DENIED=10 and D1_ALLOWED=0. That is consistent with the first ordering above, but the sample is not sufficient to establish a universal guarantee.

## Evidence status

🟢 SOURCE/ARCHITECTURE: request handling occurs on KafkaRequestHandler threads and dispatches through KafkaApis.
🟢 SOURCE/ARCHITECTURE: Authorizer.authorize() is a synchronous request-thread operation.
🟢 SOURCE/ARCHITECTURE: RequestChannel is the request-thread hand-off boundary.
🟢 JMM RULE: a successful blocking-queue producer/consumer hand-off publishes producer actions before insertion to consumer actions after removal.
🟡 EXACT-PIN FILE-LEVEL RequestChannel audit: NOT independently re-fetched through the GitHub connector in this step; the pinned source is fetched and instrumented by the reproducible workflow itself.
🟡 G0 stale-read mechanism: NOT ESTABLISHED.
🟡 security impact/exploitability/generalization: UNKNOWN.

## Do not overclaim

This audit does NOT prove that StandardAuthorizerData is thread-safe.
It does NOT prove that all ACL mutations are always published before every authorization.
It does NOT prove a stale read is impossible.
It does NOT prove a stale read occurred.
It does NOT change AB105.116R.

## Next action

The causal boundary is now narrowed to the temporal ordering of ACL mutation versus request publication/dequeue. Do not repeat cache-identity or authorize-snapshot instrumentation.

If further work is warranted, the next distinct diagnostic should be a real broker-path ordering witness that records the mutation completion boundary and the RequestChannel request-publication boundary, without adding synchronization to the ACL race. A positive result would be behavioral evidence about the production ordering; a negative result would remain bounded evidence rather than a proof of impossibility.

No TLC rerun. No AB105.117R. No merge.
