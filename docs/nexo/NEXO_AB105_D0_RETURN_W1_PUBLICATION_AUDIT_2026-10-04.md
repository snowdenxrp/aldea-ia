# NEXO AB105 — D0_RETURN vs W1 publication audit
Date: 2026-10-04

## Finding
The remaining candidate path through D0_RETURN does NOT establish W1 -> ENQUEUE -> D1 HB.

At Kafka pin 99b940733a9f6bc409457dba7108f08421d81e42:

1. Broker AclPublisher receives metadata updates on the MetadataLoader thread. MetadataLoader documentation states it maintains its own thread and uses that thread for all publisher callbacks.
2. AclPublisher applies ACL deltas synchronously inside onMetadataUpdate(), calling ClusterMetadataAuthorizer.removeAcl(), which reaches StandardAuthorizerData.removeAcl() and replaces the plain aclCache field.
3. DeleteAcls on the controller does not wait for the broker's AclPublisher callback. AclApis.handleDeleteAcls() obtains CompletionStages from authorizer.deleteAcls() and responds after those stages complete.
4. ClusterMetadataAuthorizer.deleteAcls() explicitly documents/completes its future once the relevant controller deleteAcls has been called and the ACL deletion has been persisted to the cluster metadata log. It does not state that every broker MetadataLoader/AclPublisher has applied the change locally.
5. Therefore D0_RETURN is a controller/metadata-log completion point, not a local-broker-W1 completion point.
6. A client subsequently sending a Produce request creates the network-thread ENQUEUE. Temporal D0_RETURN -> client send -> ENQUEUE does not supply a W1 -> ENQUEUE HB edge, because D0_RETURN can complete before the target broker's local AclPublisher executes W1.
7. The RequestChannel queue can supply ENQUEUE -> DEQUEUE publication, and DEQUEUE -> D1 is same-handler program order. Those edges do not carry the earlier W1 write unless W1 is itself sequenced-before ENQUEUE or another synchronization chain connects the metadata-loader thread to the ENQUEUE thread.

## Correct HB graph
Known candidate edges:
- metadata-loader event queue -> W1: same metadata-loader execution sequence.
- ENQUEUE -> DEQUEUE: RequestChannel/ArrayBlockingQueue publication.
- DEQUEUE -> D1: handler-thread program order.

Not established:
- W1 -> D0_RETURN
- D0_RETURN -> ENQUEUE as publication of the W1 write
- W1 -> ENQUEUE
- W1 -> D1

The important correction is that **D0_RETURN cannot be used as a proxy for W1**.

## Epistemic classification
🟢 Source-verified: MetadataLoader publisher callbacks run on its own loader thread.
🟢 Source-verified: AclPublisher applies ACL delta synchronously during that callback.
🟢 Source-verified: ClusterMetadataAuthorizer.deleteAcls futures are tied to controller mutation + persistence to the metadata log, not broker-local publisher completion.
🟢 Source-verified: RequestChannel provides the enqueue/dequeue handoff.
🔵 Derived JMM conclusion: D0_RETURN does not close W1 -> ENQUEUE -> D1 HB.
🟡 Prior runtime witness: W1 temporally precedes ENQUEUE/DEQUEUE/AUTH in the real-broker diagnostic; this remains temporal evidence only.
🔴 Not established: stale read, exploitability, security impact.

## Stronger consequence
The search did not merely fail to find a synchronization edge: the DeleteAcls API contract identifies a completion condition that is explicitly upstream of broker-local metadata application. Therefore the obvious D0_RETURN -> client request path is insufficient to publish the W1 cache replacement.

## Continuity correction
A later repository closure note incorrectly said AB105.117R was not created. Direct GitHub history proves that AB105.117R **exists**:
- commit: 604a692b753bfac69a88819c58e95d92f594e881
- run: 37098764557
- job: 111133973894
- artifact: 11265332252
- artifact SHA-256: d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c

AB105.117R remains temporal/raw broker evidence and explicitly leaves W1 -> R1 and JMM W1 -> authorization as UNKNOWN. This correction does not change the HB conclusion.

## Protected state
AB105.116R unchanged.
AB105.117R EXISTS / VERIFIED_RAW_EVIDENCE.
TLC not rerun.
W1 -> D1 HB remains UNKNOWN / NOT IDENTIFIED.
