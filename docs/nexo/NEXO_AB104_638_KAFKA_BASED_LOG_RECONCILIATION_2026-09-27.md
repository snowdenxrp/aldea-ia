# NEXO AB104.638 — KafkaBasedLog send/ack/read-to-end reconciliation boundary

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation or runtime verification.

## Findings
- Current Apache Kafka Connect KafkaBasedLog delegates send directly to KafkaProducer.send(..., callback). The returned Future<RecordMetadata> is the producer future; callback completion is therefore Kafka producer completion semantics, not a separate Nexo durable-history record.
- KafkaBasedLog creates its internal producer with `acks=all` and `max.in.flight.requests.per.connection=1`, explicitly described in source as ensuring durable writes and preventing reordering when retry is enabled. This is scoped to Kafka's write path, not external-world atomicity. citeturn0search0
- `readToEnd()` first calls producer.flush(), then captures current partition end offsets and consumes until consumer position reaches those offsets. Thus a successful read-to-end callback is stronger than merely observing producer callback completion: it establishes that the backing consumer has consumed through the captured log-end positions. It still is not a permanent historical proof because compaction/restore/lineage limits remain. citeturn0search0
- With READ_COMMITTED, KafkaBasedLog deliberately avoids relying only on consumer end offsets because open transactions may not be represented; it uses an Admin end-offset path and errs conservatively. citeturn0search0
- The work thread retries timeout/retriable failures while reading to log end. Unexpected failures fail the queued read-to-end callbacks. citeturn0search0
- Apache's KAFKA-8586 documents a historical failure where source records were treated as successfully sent before actual producer callback completion, demonstrating why dispatch/callback boundaries must not be conflated. The issue was resolved, but the incident remains useful evidence that callback/error handling is part of the correctness boundary. citeturn0search1

## Refined claim ladder
`SEND_REQUESTED < PRODUCER_CALLBACK_SUCCESS < KAFKA_LOG_POSITION_OBSERVED < READ_TO_END_OBSERVED < RECONSTRUCTABLE_HISTORICAL_EVIDENCE`

The first four are different evidence states. A producer callback alone does not prove that the current Connect consumer has incorporated the record. `readToEnd` gives a stronger current-observation anchor, but historical reconstructability still depends on retention/compaction and cluster incarnation.

## Fault windows F638
- F638-1 send returns Future, process crashes before callback -> Kafka outcome may be committed or not; UNKNOWN until authoritative reconciliation.
- F638-2 callback reports error -> do not equate error with absence without provider-specific evidence.
- F638-3 callback succeeds, consumer has not yet read record -> producer acknowledgement is not equivalent to local state convergence.
- F638-4 producer flush returns but read-to-end cannot establish target end due timeout/retriable failure -> persistence may exist while local observation remains incomplete.
- F638-5 record exists in Kafka but compacted historical evidence later disappears -> current absence cannot prove NOT_COMMITTED.
- F638-6 cluster/authority incarnation changes between write and reconciliation -> old log position requires lineage/incarnation binding.

## Nexo consequence
For a Kafka-backed EvidenceRecord, the minimum strong reconciliation tuple should distinguish:
`KafkaClusterIncarnation + TopicPartition + RecordKey/EffectIdentity + RecordMetadata/Offset + ProducerAttemptIdentity + ObservationPosition + ReadToEndObservation + ReconciliationGeneration`.

`ProducerCallbackSuccess != ReadToEndObserved != PermanentHistoricalProof`.
For EOS source connectors, AB104.615-636 remains authoritative: the Kafka transaction containing source records and source offsets is the stronger source-side claim boundary; SourceTask callbacks are post-commit signals, not the transaction's durable proof.

## Exact next action
AB104.639: inspect KafkaProducer send/RecordMetadata/acks and relevant producer tests plus Kafka transaction/read-committed semantics to pin the exact meaning of producer callback success, timeout, and metadata offset under response loss, retry, broker failover, and transaction boundaries.
