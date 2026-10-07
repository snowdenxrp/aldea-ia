# NEXO AB105 — RequestChannel producer boundary — 2026-10-06

## Scope
Identify the exact producer thread/domain that performs RequestChannel.sendRequest(req), following the queue publication chain one step earlier.

## 🟢 Exact pinned source
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

In core/src/main/scala/kafka/network/SocketServer.scala, Processor.processCompletedReceives() constructs the Request and then directly calls:
requestChannel.sendRequest(req)

RequestChannel.sendRequest() performs:
requestQueue.put(request)

KafkaRequestHandler.receiveRequest() later removes that Request and invokes ApiRequestHandler.handle().

## 🔵 Exact chain now established
Network Selector/Processor thread
→ construct Request
→ RequestChannel.sendRequest
→ ArrayBlockingQueue.put
→ KafkaRequestHandler.receiveRequest
→ KafkaApis.handle
→ AuthHelper / authorizer D1

The RequestChannel queue therefore provides a real publication edge from the SocketServer producer thread to the request-handler thread.

## 🔴 Missing link remains
The ACL W1 mutation occurs in the MetadataLoader/AclPublisher event-handler domain.

No concrete synchronization edge has been identified from that W1 thread to the SocketServer Processor thread before Processor.processCompletedReceives() performs sendRequest().

Therefore the queue's HB edge starts at the SocketServer Processor producer, not at W1.

## Result
This closes the exact producer-boundary ambiguity. The next meaningful source frontier is whether any concrete synchronization/publication path connects MetadataLoader/AclPublisher W1 to the SocketServer Processor thread before sendRequest().

No runtime experiment created.

## Epistemic state
- W1→SocketServer producer HB: UNKNOWN / NOT IDENTIFIED.
- W1→ENQUEUE HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
Do not audit RequestChannel.put/poll again as an isolated bridge. Its producer and consumer endpoints are now exact. Focus only on W1→SocketServer Processor publication.
