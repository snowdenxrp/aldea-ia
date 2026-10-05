# NEXO AB105 BrokerMetadataPublisher / Request-Callback Boundary Audit — 2026-10-05

## Scope
Follow-up to indirect synchronization audit. Inspect BrokerMetadataPublisher, MetadataLoader publisher sequencing, and KafkaRequestHandler callback scheduling for a broker-local HB path from ACL W1 to D1.

## Fixed source
Kafka commit/pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## Findings

### BrokerMetadataPublisher
MetadataLoader invokes publishers on its own loader thread in publisher order. BrokerMetadataPublisher calls its component publishers synchronously, including aclPublisher.onMetadataUpdate(...).

firstPublishFuture is completed in finally after the first BrokerMetadataPublisher publication. It is a startup/readiness future, not a per-metadata-update publication future. No later request admission path is shown awaiting it.

Therefore MetadataLoader thread → BrokerMetadataPublisher → AclPublisher/W1 is same-thread program order, while firstPublishFuture does not establish steady-state W1→D1.

### MetadataLoader
handleCommit schedules metadata processing onto its KafkaEventQueue; maybePublishMetadata then invokes registered publishers synchronously on the loader/event-queue thread. This establishes sequencing inside the metadata publication domain.

No per-update completion object is handed from maybePublishMetadata/AclPublisher into the request handler path. Metrics such as last-applied provenance do not constitute synchronization unless a request path reads them through a defined synchronization mechanism, and no such path was identified.

### KafkaRequestHandler callback mechanism
KafkaRequestHandler has a callback rescheduling facility. A callback can be sent back through RequestChannel as a CallbackRequest, which is then dequeued and executed on a request-handler thread.

This is a real request-channel publication path, but it is downstream of an already existing request/callback context. The inspected mechanism does not connect the MetadataLoader/AclPublisher W1 mutation to the authorization D1 of a new request.

Thus it cannot be promoted into a W1→D1 HB edge without an additional causal handoff from W1 into that callback mechanism. None was identified.

### Important distinction
The existence of MetadataLoader EventQueue → AclPublisher → W1 and independently RequestChannel → KafkaRequestHandler → D1 does not compose into W1→D1 merely because both use concurrency infrastructure.

The JMM requires an actual synchronization relation/path connecting the two domains. Java concurrency guarantees cover specific operations such as concurrent-collection handoff, Executor submission, Future.get, locks, latches, etc.; they do not make unrelated queues globally ordered. Oracle JMM/concurrency documentation confirms this requirement.

## Epistemic state
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- MetadataLoader → W1 sequencing: IDENTIFIED.
- RequestChannel → handler dequeue: IDENTIFIED.
- W1 → RequestChannel publication: NOT IDENTIFIED.
- CallbackRequest mechanism: REAL but NOT A W1→D1 BRIDGE.
- Stale read: NOT OBSERVED / NOT DISPROVEN.
- Security impact: NOT ESTABLISHED.

## DO-NOT-REPEAT
No PR92/93/94 rerun.
No TLC rerun.
No artificial volatile/latch/barrier/Future.
No interpretation of firstPublishFuture as a steady-state ACL publication barrier.

## Next frontier
Inspect the exact RequestChannel implementation and any producer-side send path for new requests, then check whether any request publication operation is causally downstream of W1 itself rather than merely temporally after it.
