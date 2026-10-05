# NEXO AB105 Indirect Synchronization / D0 Network Boundary Audit — 2026-10-05

## Scope
Follow-up to the definitive W1→D1 HB matrix. Inspect indirect synchronization candidates and clarify the CompletableFuture/controller-to-client boundary without rerunning experiments or adding synchronization.

## Evidence
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

### AclPublisher
AclPublisher.onMetadataUpdate runs the ACL delta application directly in the MetadataLoader publisher callback. Incremental changes call ClusterMetadataAuthorizer.addAcl/removeAcl in ordered iteration. There is no per-update Future returned to request processing. The only explicit Future completion in this class is initial-load completion.

### ClusterMetadataAuthorizer
createAcls/deleteAcls return CompletableFuture stages that complete after controller-side mutation has been called and the ACL change has been persisted to the cluster metadata log. This is a controller/metadata-log completion contract, not evidence that a target broker's MetadataLoader has applied the record locally.

### Critical boundary
Even if D0_RETURN is causally downstream of controller persistence through CompletableFuture completion, the later client request is issued through the network. A Java Memory Model happens-before edge is not automatically created from controller-thread actions to a broker request-handler thread merely because a client observed a completed RPC and then sent another RPC. The JMM's Executor/Future/concurrent-collection guarantees apply to specified in-process synchronization operations; they do not turn an inter-process network round trip into a Java synchronizes-with edge.

Therefore the chain:

controller persistence → D0_RETURN → client sends next request → target broker ENQUEUE → D1

does NOT by itself establish:

W1 → HB → D1.

It also does not prove W1 happened after/before controller persistence on the target broker; local W1 remains the MetadataLoader/AclPublisher application event.

## Indirect synchronization sweep
No new production W1→D1 synchronization edge was identified through:
- per-update CompletableFuture handed from AclPublisher to request admission;
- Executor submission from W1 to the request-handler path;
- Future.get awaited by request admission;
- lock/condition/semaphore/latch bridging W1 to D1;
- concurrent-collection handoff carrying the ACL-update publication into D1.

Existing RequestChannel ENQUEUE→DEQUEUE remains a real in-process queue publication edge, but the producer-side object is the request, not the independent W1 ACL mutation.

## Epistemic state
- HB(W1→D1): UNKNOWN / NOT IDENTIFIED.
- W1→ENQUEUE: temporal ordering may be observed, but JMM HB remains NOT IDENTIFIED.
- D0_RETURN: controller/metadata-log completion, NOT local W1 completion barrier.
- Stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- Security vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
Do not rerun PR92/PR93/PR94/G0 or TLC.
Do not add volatile/latch/barrier/Future synchronization to force W1→D1 ordering.
Do not treat D0_RETURN→client request as a Java HB edge.

## Next frontier
Audit any remaining broker-local callback/executor path that can carry MetadataLoader/AclPublisher completion into request admission, with special attention to BrokerMetadataPublisher composition and any lifecycle/readiness callbacks.