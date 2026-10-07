# NEXO AB105 — RequestChannel concurrent-queue publication boundary — 2026-10-06

## Scope
Re-audit RequestChannel as a possible W1→D1 synchronization bridge, distinguishing its real queue happens-before guarantee from the unrelated metadata W1 action.

## 🟢 Exact pinned source
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

RequestChannel uses:
- ArrayBlockingQueue<BaseRequest> requestQueue
- ArrayBlockingQueue<BaseRequest> callbackQueue

The producer side calls requestQueue.put(request). KafkaRequestHandler calls requestQueue.poll(...) in receiveRequest() and then handles the returned Request on the request-handler thread.

## 🟢 Real synchronization guarantee
ArrayBlockingQueue is a java.util.concurrent collection. The Java memory-consistency contract gives a happens-before edge from actions in a producer thread before placing an object into a concurrent collection to actions after another thread accesses/removes that element.

Therefore RequestChannel genuinely publishes the request object and producer-thread state to the request-handler thread across the queue handoff.

## 🔵 Critical AB105 distinction
That queue edge starts from the thread performing RequestChannel.put(request).

The ACL W1 mutation occurs earlier in the MetadataLoader/AclPublisher domain, on a different thread.

The code inspected does not establish:
W1 → network/processor producer thread → requestQueue.put

The queue therefore provides:
request-producer actions → request-handler actions

but not:
Metadata W1 → request-producer actions.

Consequently, RequestChannel's strong concurrent-collection publication semantics cannot be promoted into a W1→D1 HB edge without an additional concrete bridge from W1 to the request producer.

## Result
This is a stronger refinement than the prior shorthand "RequestChannel is not sufficient": RequestChannel itself is a valid HB mechanism, but it begins too late in the causal chain to publish W1.

No runtime experiment created.

## Epistemic state
- W1→ENQUEUE JMM HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NOT IDENTIFIED.
- stale-read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
Do not reopen RequestChannel's ArrayBlockingQueue as the missing W1 publication primitive unless a concrete W1→request-producer synchronization edge is found.
