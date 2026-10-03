# AB105 G0 — Processor owner-thread flush gate — 2026-10-03

Pinned Kafka: 99b940733a9f6bc409457dba7108f08421d81e42.

Verified Processor lifecycle:
- run() executes on the Processor KafkaThread.
- run() finally executes closeAll() on that same Processor thread.
- Processor.close() performs beginShutdown(), then thread.join().
- Therefore a recorder flush placed in the Processor thread's final cleanup can execute before the external join returns, while remaining after the measured D1 result.

Gate consequence:
- The test must not read Processor ThreadLocal state before Processor.close()/join().
- The owner-thread cleanup must perform the flush itself.
- The test may read the resulting artifact only after join.
- No W1 signal is needed to trigger the flush.

MetadataLoader has the analogous owner-thread event-queue cleanup path already audited.

No implementation or workflow execution yet.
AB105.116R unchanged.
