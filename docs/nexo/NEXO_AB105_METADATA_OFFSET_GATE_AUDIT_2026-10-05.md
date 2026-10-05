# AB105 metadata-offset / request-admission gate audit — 2026-10-05

Exact Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

New candidate: MetadataLoader lastAppliedOffset / MetadataProvenance crossing into BrokerLifecycleManager.

Verified source chain:
1. MetadataLoaderMetrics stores lastAppliedProvenance in an AtomicReference and updates it after the image has been processed by all publishers.
2. MetadataLoader.lastAppliedOffset() reads that provenance.
3. BrokerServer supplies `() => sharedServer.loader.lastAppliedOffset()` to BrokerLifecycleManager.start().
4. BrokerLifecycleManager reads highestMetadataOffsetProvider when constructing BrokerHeartbeatRequestData.currentMetadataOffset.
5. This value is sent to the controller in broker heartbeats.

Critical boundary: this is broker lifecycle/controller communication, not the client request admission path. The audited BrokerLifecycleManager source contains startup catch-up/unfence futures and periodic heartbeats, but no path here that waits for a per-ACL metadata offset before RequestChannel enqueue or KafkaRequestHandler D1 authorization. The currentMetadataOffset is communicated outward to the controller; it is not consumed by AuthHelper/StandardAuthorizer.authorize as a request gate.

Therefore:
- 🟢 W1 -> lastAppliedProvenance publication is a real AtomicReference publication boundary for the metadata-loader progress metric/provenance.
- 🟢 lifecycle manager can observe that progress and report it in BrokerHeartbeatRequestData.
- 🟢 this does NOT establish W1 -> RequestChannel enqueue or W1 -> D1.
- 🟡 an indirect controller-response/fencing route is theoretically a separate path, but no evidence here makes it a per-update ACL authorization gate; startup catch-up/unfence is lifecycle gating, not incremental ACL gating.
- 🔴 stale ACL read remains unobserved/not disproven.
- 🔴 vulnerability remains unestablished.
- 🟡 W1 -> D1 JMM HB remains UNKNOWN.

Important distinction: `lastAppliedOffset` is a useful observability/provenance signal and startup/lifecycle readiness input. It is not evidence that each request waits for the ACL update offset before authorization.

Next frontier: inspect the controller heartbeat response / broker fencing state only for a possible path that disables or gates request processing after metadata progress. If no per-update request gate exists, close this candidate and retain UNKNOWN.

DO-NOT-REPEAT: PR92/93/94/G0, TLC, AB105.117R, artificial synchronization, RW-lock hypothesis, controller ACL persistence Future as W1 completion.
