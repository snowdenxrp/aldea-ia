# NEXO AB105 — KafkaEventQueue lock boundary — 2026-10-06

## Scope
Audit whether MetadataLoader's KafkaEventQueue ReentrantLock can provide a cross-domain W1→D1 publication edge.

## 🟢 Exact pinned source
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

KafkaEventQueue uses one private ReentrantLock to protect its internal event list/state. The producer path locks it while enqueueing an EventContext and signals the condition. The event-handler thread later locks the same lock, removes the event, unlocks, and executes the event.

Therefore this lock can order operations participating in the queue's producer→event-handler handoff.

## 🔵 Critical boundary
AclPublisher/W1 executes from the MetadataLoader event-handler domain.

The D1 authorization path does NOT acquire this KafkaEventQueue's private lock. The request handler instead receives requests through RequestChannel and invokes the authorizer independently.

Therefore:
- KafkaEventQueue lock is a real synchronization mechanism for the queue's own producer→event-handler handoff.
- It is NOT a W1→D1 synchronization edge because D1 never acquires the same lock after W1.
- The lock cannot be used transitively merely because W1 happened on the event-handler thread; a later D1 thread still needs a concrete synchronization edge from that thread/domain.

## Result
This closes a plausible but invalid "KafkaEventQueue lock publishes ACLs to request handlers" bridge.

No runtime experiment created.

## Epistemic state
- W1→ENQUEUE JMM HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NOT IDENTIFIED.
- stale-read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
Do not reopen the MetadataLoader KafkaEventQueue private lock as a W1→D1 bridge unless code is found showing D1 acquires the same lock or a concrete release/acquire chain leaving that lock.
