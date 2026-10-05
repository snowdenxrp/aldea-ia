# NEXO AB105 — Controller → Broker ACL Propagation Frontier (2026-10-05)

## Pin
Kafka exact source pin:
99b940733a9f6bc409457dba7108f08421d81e42

## New source-audit findings

### AclMutator / QuorumController
- AclMutator is implemented by QuorumController and its create/delete methods are asynchronous futures.
- QuorumController is explicitly single-threaded; its public API is futures-based.
- The future for each controller operation is documented to complete only after operation results are durable to the metadata log.
- createAcls/deleteAcls call appendWriteEvent(...), which executes AclControlManager create/delete and produces metadata records.
- deleteAcls produces RemoveAccessControlEntryRecord records.

### Controller → broker application
- The metadata record is not itself the broker-side StandardAuthorizerData mutation.
- MetadataDelta/metadata loading replays RemoveAccessControlEntryRecord.
- MetadataLoader/MetadataBatchLoader applies the resulting metadata delta and then invokes metadata publishers.
- BrokerMetadataPublisher invokes AclPublisher, which eventually calls StandardAuthorizerData.removeAcl on the broker metadata-loader thread.

### Important separation
Controller future completion / metadata-log durability does NOT establish that the broker serving D1 has already:
1. consumed the metadata record,
2. built/applied the corresponding metadata image/delta,
3. executed AclPublisher.removeAcl/W1.

A separate broker catch-up observation exists in Kafka tests via loader.lastAppliedOffset(), and the loader metric is described as the last offset processed by all publishers. However, the inspected request path does not wait on that per-update/per-broker state before ENQUEUE/D1.

## Epistemic state
- Controller persistence → broker W1: TEMPORAL/ARCHITECTURAL PATH CONFIRMED, but the exact synchronization/publication edge to D1 is NOT IDENTIFIED.
- W1 → ENQUEUE: NOT IDENTIFIED.
- W1 → D1 JMM HB: UNKNOWN / NOT IDENTIFIED.
- stale ACL read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.
- W1 → R1: UNKNOWN.

## Key consequence
The frontier is now narrower:
**controller durability → broker metadata-log catch-up → AclPublisher/W1 → request admission/D1**.

The existence of a metadata-log durability future is not a substitute for a broker-serving-D1 catch-up barrier.

## DO-NOT-REPEAT
Do not repeat 117R/G0/TLC/PR92/PR93/PR94, D1 snapshot diagnostic, Plugin construction, RequestChannel ENQUEUE→DEQUEUE, KafkaRequestHandler DEQUEUE→handler, or artificial synchronization.

## Next genuinely new question
Determine whether the production request-serving broker has any mechanism that converts its own metadata-loader applied-offset/current-image state into an admission barrier for ACL-sensitive requests. If none exists, record that absence without converting it into proof of a stale read.
