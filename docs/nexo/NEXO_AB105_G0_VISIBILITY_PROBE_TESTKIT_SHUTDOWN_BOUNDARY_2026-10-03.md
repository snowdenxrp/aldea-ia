# AB105 G0 — KafkaClusterTestKit shutdown boundary audit — 2026-10-03

Pinned Kafka: 99b940733a9f6bc409457dba7108f08421d81e42.

The existing Nexo harness keeps KafkaClusterTestKit in try-with-resources. Its close() implementation:
- submits BrokerServer.shutdown() to the test executor;
- waits for all broker shutdown futures;
- then shuts down controllers;
- finally waits for all threads.

Therefore invoking cluster.close() after the producer's D1 future has completed is a post-measurement lifecycle action, not part of the W1→D1 race.

Important distinction:
- the shutdown implementation itself uses Futures/executor synchronization;
- this is acceptable only after D1_RESULT is already returned to the harness;
- it must never be used as a W1 detection mechanism or as a way to make AUTH observe W1.

This supports the planned owner-thread extraction model, subject to placing the diagnostic flush on the actual owner thread before it terminates.

No experiment executed.
AB105.116R unchanged.
