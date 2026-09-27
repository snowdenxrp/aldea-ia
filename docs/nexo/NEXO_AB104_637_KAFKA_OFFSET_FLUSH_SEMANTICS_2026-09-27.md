# NEXO AB104.637 — KafkaOffsetBackingStore + OffsetStorageWriter exact flush semantics

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation, no V21, no verification claim.

## Scope
Inspected current Apache Kafka Connect source for KafkaOffsetBackingStore and OffsetStorageWriter.

## Source evidence
- KafkaOffsetBackingStore stores offsets in a compacted Kafka topic and maintains an in-memory latest-value map populated by the consumed callback.
- get() calls offsetLog.readToEnd(), deliberately requiring the backing log to be read to its end before returning requested values; this avoids using stale in-memory state during reset/reconfiguration.
- set() submits each serialized key/value independently through KafkaBasedLog.send(); SetCallbackFuture completes only after all submitted producer callbacks succeed, and fails on the first callback error.
- KafkaOffsetBackingStore configures the producer with ByteArray serialization, delivery.timeout.ms=Integer.MAX_VALUE, and enable.idempotence=false in the current Connect implementation. Therefore the store callback is a producer-delivery/acknowledgement boundary, not by itself Nexo historical proof beyond Kafka storage semantics.
- The offsets topic is configured compacted; retention/compaction remains an evidence-lifetime boundary established by earlier AB104.620-636 work.

## OffsetStorageWriter exact semantics
1. offset() updates only the current in-memory map.
2. beginFlush() acquires a single-flush semaphore. It snapshots the current map into toFlush and replaces data with a fresh map, allowing new offsets to accumulate while the snapshot is written.
3. doFlush() serializes the snapshot. Key serialization adds the namespace; value serialization uses the configured converter. Format validation occurs before submission.
4. Serialization failure calls the caller callback with the error and returns null. This is a local failure before backing-store submission.
5. backingStore.set() is asynchronous. Completion is associated with currentFlushId.
6. If a write callback arrives after the flush has been cancelled/timed out and currentFlushId changed, handleFinishWrite() ignores the stale callback.
7. On current write error, handleFinishWrite() invokes cancelFlush(), merging toFlush back into data so offsets remain retryable.
8. On current write success, the writer releases the flush semaphore and clears toFlush. New offsets accumulated during the write remain in data and are not lost.
9. cancelFlush() is a local buffer rollback/requeue operation; it does not prove the backing store did not accept the old write. A late backing-store success can be ignored by the writer while the durable backend may already contain the earlier write.
10. Therefore writer state after timeout/cancel is not equivalent to backend outcome. Backend outcome can be UNKNOWN and requires reconciliation if the claim depends on whether the write reached durable Kafka state.

## Crash/fault windows F637
- F637-1 crash before beginFlush: offsets exist only in memory -> lost; no durable anchor.
- F637-2 crash after beginFlush before doFlush: snapshot is in memory only -> lost unless another independent path exists.
- F637-3 crash during serialization: no backend submission is implied; current snapshot may be unrecoverable locally.
- F637-4 crash after Kafka send but before callback: Kafka may have accepted/durably recorded the record while Connect has no local acknowledgement -> UNKNOWN until Kafka-side reconciliation.
- F637-5 producer callback error: do not infer that no record exists; retry/reconciliation semantics remain provider-dependent.
- F637-6 timeout/cancel followed by late success: writer can requeue the snapshot while Kafka may already contain the earlier write; duplicate/stale-write behavior must be reconciled at Kafka record/key level.
- F637-7 new offsets arrive during flush: they remain in the fresh data map and are not part of the old snapshot; successful old flush does not prove the newest in-memory value is durable.
- F637-8 Kafka compaction/restore after a successful write: current visible value may survive while historical write evidence disappears; absence of an old record cannot establish NOT_COMMITTED.

## Nexo consequence
The strongest claim boundary is layered:
OffsetBuffered -> SnapshotTaken -> Serialized -> Submitted -> Kafka-authoritative persisted/committed evidence -> ReconstructableEvidence.

OffsetStorageWriter callback SUCCESS != durable historical Nexo EvidenceRecord.
For a Kafka-backed Nexo claim, a durable EvidenceRecord should bind at minimum: connector/operation identity, Kafka cluster incarnation, offsets topic + partition, serialized offset identity/value digest, authoritative Kafka position/revision/observation point, task/generation context, and reconciliation status. For EOS source connectors, the earlier AB104.615-636 rule remains: the stronger anchor is the Kafka transaction containing source records + source offsets, not SourceTask callbacks.

## Classification
- 🟢 Recovered mechanism: snapshot-before-async-write, single in-flight flush, requeue on current write failure, stale-callback suppression.
- 🔵 Extension candidate: explicit Nexo EvidenceRecord binding to Kafka authoritative position + cluster incarnation + operation/generation.
- 🔴 Conflict: treating OffsetStorageWriter callback success or local flush completion as universal durable/external-effect proof.

## Open gaps
- Need exact KafkaBasedLog.send()/producer callback and relevant tests/source to refine the precise distinction between broker acknowledgement, local callback, and durable log visibility.
- Need source/tests for OffsetStorageWriter timeout/cancel paths to determine exact framework behavior around callback timeout and retries.
- Need executable fault injection before any runtime verification claim.

## Exact next action
AB104.638: inspect KafkaBasedLog.send()/producer callback and relevant tests/source to map send -> broker ack -> log visibility -> readToEnd and determine the minimum authoritative reconciliation evidence for a Kafka offset write after response loss.
