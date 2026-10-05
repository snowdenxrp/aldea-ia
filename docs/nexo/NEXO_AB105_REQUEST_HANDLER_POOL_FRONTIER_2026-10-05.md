# AB105 Request Handler Pool Frontier — 2026-10-05

Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

Inspected exact pinned file:
core/src/main/scala/kafka/server/KafkaRequestHandler.scala

Findings:
- KafkaRequestHandler receives requests through requestChannel.receiveRequest(300).
- After dequeue, it sets threadCurrentRequest and invokes apis.handle(request, requestLocal).
- Request handler uses ThreadLocal state for the current request; this is request-local execution context, not a W1 publication mechanism.
- AtomicInteger thread-pool counters/metrics are unrelated to ACL state and do not connect MetadataLoader/AclPublisher/W1 to request admission.
- resizeThreadPool/shutdown synchronized blocks concern pool lifecycle only, not ACL updates.

Epistemic consequence:
- DEQUEUE -> request handler: CLOSED / identified by program order.
- W1 -> request handler admission: still NOT IDENTIFIED.
- W1 -> D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale ACL read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

Do not repeat 117R, G0, TLC, PR92/93/94, or the already-covered D1 snapshot diagnostic. Do not add artificial synchronization.

Next frontier remains only a genuinely new cross-domain publication/shared-state mechanism.
