# AB105 KafkaEventQueue boundary — 2026-10-05

Exact Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

Verified: MetadataLoader owns a KafkaEventQueue and its loader thread executes publisher callbacks. The exact KafkaEventQueue uses a ReentrantLock internally: enqueue locks/unlocks around queue insertion; the event-handler thread locks around removal/selection and then executes the selected event outside that lock.

Interpretation: this lock provides publication for events placed into this SAME KafkaEventQueue. It does not by itself create W1 -> D1 HB because D1 is executed by the independent request-handler path and no evidence here shows D1 being enqueued into the MetadataLoader KafkaEventQueue.

Therefore:
- MetadataLoader queue synchronization: VERIFIED.
- W1 -> D1 through that queue: NOT IDENTIFIED.
- W1 -> RequestChannel enqueue: NOT IDENTIFIED.
- W1 -> D1 HB: UNKNOWN.

Important: do not count the KafkaEventQueue's internal ReentrantLock as a bridge between metadata and data-plane domains unless a concrete cross-domain enqueue/lock handoff is found.

Next frontier: inspect concrete cross-domain callbacks, executor submission, concurrent-collection handoffs, or metadata-version/offset gates between AclPublisher completion and request authorization.

DO-NOT-REPEAT: PR92/93/94/G0, TLC, AB105.117R, artificial synchronization, StandardAuthorizer RW-lock hypothesis.
