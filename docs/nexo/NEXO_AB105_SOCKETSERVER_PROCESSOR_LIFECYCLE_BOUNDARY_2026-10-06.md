# NEXO AB105 — SocketServer Processor lifecycle boundary — 2026-10-06

## Scope
Audit whether the SocketServer Processor thread has a lifecycle synchronization mechanism that could accidentally provide W1→Processor publication.

## 🟢 Exact pinned source
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

SocketServer Processor owns:
- AtomicBoolean shouldRun
- AtomicBoolean started
- its own KafkaThread
- request processing loop

The Processor loop repeatedly performs selector.poll() and processCompletedReceives(), where processCompletedReceives() eventually calls RequestChannel.sendRequest(req).

## 🔵 Lifecycle boundary
The AtomicBoolean fields are lifecycle controls. The inspected request path does not perform a per-request acquire/release against a lifecycle primitive that is causally downstream of MetadataLoader/AclPublisher W1.

The Processor is a long-lived thread. Its thread-start synchronization is startup-time publication, not a per-ACL-update publication mechanism.

Therefore:
- Processor startup can publish initialization state existing before thread.start().
- It does not establish W1→Processor HB for ACL updates occurring later on MetadataLoader's event thread.
- The per-request path from selector completion to RequestChannel.put remains independent of W1.

## Result
The SocketServer Processor lifecycle machinery does not close the missing W1→SocketServer Processor edge.

No runtime experiment created.

## Epistemic state
- W1→SocketServer producer HB: UNKNOWN / NOT IDENTIFIED.
- W1→ENQUEUE HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
Do not treat Processor thread start, shouldRun, or started as a per-update ACL publication primitive.
