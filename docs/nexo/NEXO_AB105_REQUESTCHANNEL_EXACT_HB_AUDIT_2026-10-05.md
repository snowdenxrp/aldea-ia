# NEXO AB105 RequestChannel Exact HB Audit — 2026-10-05

## Fixed source
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## Exact RequestChannel finding
RequestChannel owns two independent ArrayBlockingQueue instances: requestQueue and callbackQueue. sendRequest() performs requestQueue.put(request). receiveRequest() removes from requestQueue via poll/take. Under the Java concurrent-collection memory-consistency contract, actions before placing an element into a BlockingQueue happen-before actions after another thread removes/accesses that element. This makes ENQUEUE→DEQUEUE a genuine HB edge.

However, the HB edge starts with actions preceding the requestQueue.put() in the producer thread. The ACL W1 mutation occurs on the MetadataLoader publisher thread. The inspected RequestChannel implementation contains no operation that causes W1 to execute-before sendRequest() for a new client request.

Therefore:
W1 → sendRequest(): NOT IDENTIFIED
sendRequest() → receiveRequest(): IDENTIFIED HB
receiveRequest() → D1: IDENTIFIED by request-handler program order
W1 → D1: remains UNKNOWN / NOT IDENTIFIED.

## Callback queue
sendCallbackRequest() uses a separate callbackQueue ArrayBlockingQueue and adds a WakeupRequest to requestQueue when possible. Its HB applies to actions before the callback enqueue and after callback dequeue. It does not create a bridge from MetadataLoader/AclPublisher W1 unless W1 itself causally precedes that callback enqueue. No such causal path was identified.

## Important consequence
The exact RequestChannel source strengthens the earlier result: queue synchronization is real, but it synchronizes the producer's preceding actions with the consumer. It does not retroactively import unrelated MetadataLoader writes merely because the request is enqueued after W1 in wall-clock time.

## Epistemic state
- ENQUEUE→DEQUEUE HB: IDENTIFIED.
- W1→ENQUEUE HB: NOT IDENTIFIED.
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read: NOT OBSERVED / NOT DISPROVEN.
- security vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
No PR92/93/94/G0 rerun.
No TLC rerun.
No artificial synchronization.

## Next frontier
Trace the exact SocketServer/Processor producer path immediately before sendRequest(), then determine whether any producer-side action is causally downstream of metadata publication or merely temporally follows it.
