# NEXO AB105 SocketServer Producer-Side HB Audit — 2026-10-05

## Fixed source
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## Exact producer path
The data-plane Processor processes completed socket receives on its network/processor thread. It parses the request header, constructs RequestContext and Request, then calls requestChannel.sendRequest(req). There is no MetadataLoader, AclPublisher, metadata offset wait, authorizer Future, lock, condition, or ACL-publication callback between socket receive processing and sendRequest in the inspected path.

The resulting local chain is:
network receive → parse/construct Request → sendRequest → ArrayBlockingQueue publication → receiveRequest → KafkaRequestHandler → D1.

The RequestChannel queue supplies HB from actions preceding sendRequest to actions after removal of that request, but the producer-side actions here are socket/request construction actions. They are not causally downstream of W1.

## Consequence for W1→D1
The exact producer-side path closes the queue edge but leaves the critical predecessor edge open:
W1 → [NOT IDENTIFIED] → network Processor sendRequest → HB → handler → D1.

A request arriving after W1 in wall-clock time is therefore still only temporal ordering unless an additional synchronization edge connects W1 to the network processor. No such edge was identified in this path.

A controller/client sequence such as D0_RETURN → client sends a new network request is an inter-process protocol sequence, not a Java in-process synchronizes-with edge between the controller/metadata-loader thread and the broker request-handler thread.

## Epistemic state
- Network Processor → sendRequest: IDENTIFIED.
- sendRequest → receiveRequest: IDENTIFIED HB.
- receiveRequest → D1: IDENTIFIED program order.
- W1 → network Processor/sendRequest: NOT IDENTIFIED.
- W1 → D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- security vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
No PR92/93/94/G0 rerun.
No TLC rerun.
No artificial synchronization.

## Next frontier
The direct producer path is now bounded. Remaining useful source audit should focus only on any broker-local cross-domain mechanism that could publish metadata state into the network/request domain (for example an explicit metadata-applied callback, shared lock, executor handoff, or state publication read by the processor). If none exists, the source result remains a bounded NOT-IDENTIFIED-HB finding, not proof of stale execution.
