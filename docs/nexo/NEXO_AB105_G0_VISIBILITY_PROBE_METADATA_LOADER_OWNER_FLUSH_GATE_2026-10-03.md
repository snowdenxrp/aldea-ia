# AB105 G0 — MetadataLoader owner-thread flush gate — 2026-10-03

Pinned Kafka: 99b940733a9f6bc409457dba7108f08421d81e42.

Exact source path:
metadata/src/main/java/org/apache/kafka/image/loader/MetadataLoader.java

Verified:
- MetadataLoader owns a KafkaEventQueue.
- The queue is constructed with ShutdownEvent() as its cleanup event.
- MetadataLoader.beginShutdown() calls eventQueue.beginShutdown("beginShutdown").
- MetadataLoader.close() calls beginShutdown(); eventQueue.close().
- KafkaEventQueue close synchronously waits for its event-handler thread.
- ShutdownEvent.run() performs publisher cleanup on the event-handler/owner thread.

Therefore the neutral flush hook can be placed in the existing ShutdownEvent.run() after its publisher-cleanup loop. It runs on the same thread that owns the MetadataLoader event queue and only during normal shutdown, after the D1 measurement window if the harness follows the previously audited order.

Important:
- Do not use W1 to trigger shutdown.
- Do not publish ThreadLocal state through a shared object during the race.
- The recorder remains thread-confined until ShutdownEvent.run().
- The owner thread can serialize its recorder after the measurement window closes.
- External extraction happens only after eventQueue.close() returns.

Gate: PASS for exact MetadataLoader owner-thread hook.
Implementation still NOT performed.
