# NEXO AB105 G0 — Client completion/network boundary audit — 2026-10-03

## Source findings
Pinned Kafka source and the exact v2 harness were inspected.

The test performs:
1. target broker processes the ACL deletion;
2. AdminClient.deleteAcls(...).all().get() returns to the test JVM;
3. producer.send(...).get(...) is invoked for D1;
4. the producer asynchronously buffers/sends through its background I/O path;
5. the target broker receives D1 and enters RequestChannel.

KafkaProducer source documents send() as asynchronous: it adds the record to a pending-send buffer and a background I/O thread transmits it.

KafkaAdminClient.deleteAcls() creates a client-side KafkaFutureImpl and completes it when the client receives/processes the DeleteAcls response. The exact v2 test then continues in the same client JVM.

## Crucial boundary
The AdminClient future completion is a client-JVM event. The broker W1 write and the client future completion are in different JVMs/processes. Java Memory Model happens-before is not established across that process/network boundary merely because a response was received.

Therefore:
D0_RETURN -> client-side produce invocation is program order,
but it does NOT establish:
target-broker W1 -> D0_RETURN,
and consequently does not establish:
target-broker W1 -> target-broker ENQUEUE.

This reinforces the existing UNKNOWN classification rather than resolving it.

## What is established
- D0_RETURN can occur before target W1 in observed cycles 4/5.
- D0_RETURN -> produce invocation is test-JVM program order.
- producer send is asynchronous and uses a background I/O path.
- target W1 < target ENQUEUE was temporally observed 10/10.

## What remains UNKNOWN
- W1 -> ENQUEUE JMM edge.
- W1 -> target authorization-reader visibility.
- stale cache read.
- incorrect authorization consequence.
- exploitability/generalization/production impact.

## Methodological consequence
Do not use D0_RETURN or the AdminClient future as a substitute for target-broker W1. A future completion or network response cannot manufacture a cross-process JMM happens-before edge.

No new witness run is justified by this audit alone.

## Frozen
AB105.116R unchanged.
AB105.117R not created.
TLC not rerun.
PR #94 remains draft/unmerged.
