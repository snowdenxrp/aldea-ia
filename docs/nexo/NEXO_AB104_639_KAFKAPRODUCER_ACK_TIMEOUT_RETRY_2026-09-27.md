# NEXO AB104.639 — KafkaProducer ACK/timeout/retry semantics

Date: 2026-09-27
Status: RESEARCH ONLY. No Nexo implementation or runtime verification.

## Findings
- Current KafkaProducer.send() is asynchronous: it appends to an internal buffer and returns before broker completion. The background I/O thread transmits batches.
- `acks=all` means a request is considered complete only after the full configured ISR durability condition; KafkaProducer documents this as the most durable setting. Automatic retries are enabled by default, with delivery.timeout.ms bounding retry behavior.
- A successful producer callback supplies RecordMetadata (topic/partition/offset/timestamp) and therefore gives a concrete Kafka log position for that producer acknowledgement. It remains scoped to the Kafka producer/cluster lineage; it is not proof of downstream observation or external effect.
- A timeout/transport failure is not sufficient to infer NOT_COMMITTED: the request may have reached the broker before the client learned the result. This preserves UNKNOWN until authoritative reconciliation.
- KafkaProducer documents that idempotence prevents duplicates from producer retries within one producer session, but application-level re-sends cannot be deduplicated by Kafka's producer idempotence. Therefore retrying an UNKNOWN operation with a newly-created application identity remains a distinct Nexo operation unless the original identity is preserved.
- KafkaBasedLog explicitly forces `acks=all` and `max.in.flight.requests.per.connection=1`; this reduces reordering risk for retried sends but does not change the epistemic distinction between producer acknowledgement and independent reconciliation. citeturn0search0turn0search2

## Fault windows F639
- F639-1 send buffered, process crashes before transmission -> NOT_COMMITTED may be provable locally only if producer lifecycle guarantees it never reached Kafka; otherwise preserve UNKNOWN.
- F639-2 request transmitted, response/callback lost -> UNKNOWN; reconcile by stable identity/record metadata or authoritative log observation.
- F639-3 callback success with RecordMetadata -> strong Kafka-domain commit evidence, bound to cluster incarnation and topic/partition/offset.
- F639-4 automatic retry after retriable failure -> producer-level idempotence can suppress duplicate records when enabled and within one session; application-level new send identity is not equivalent.
- F639-5 delivery timeout -> failure to obtain completion within configured lifetime, not universal proof of absence.
- F639-6 broker failover/leader movement -> metadata remains valid only within the relevant Kafka cluster/log lineage; cluster restoration/reincarnation requires the earlier incarnation binding.
- F639-7 transactional producer timeout -> transaction outcome requires transaction-state reconciliation; a send callback inside a transaction is not equivalent to committed transaction outcome.

## Nexo consequence
Minimum Kafka producer evidence candidate:
`KafkaClusterIncarnation + ProducerSession/TransactionalIdentity + ProducerAttemptID + TopicPartition + RecordMetadata(offset) + Contract/ValueDigest + observation timestamp + reconciliation generation`.

Claim ladder refined:
`Buffered < Sent/Attempted < ProducerACK+RecordMetadata < ReadToEndObserved < ReconstructableHistoricalEvidence`.

For non-transactional Kafka offset storage, RecordMetadata plus cluster/log lineage is strong participant-local evidence. For EOS source connectors, the authoritative claim remains the committed Kafka transaction containing source records + source offsets, not an individual send callback. citeturn0search1

## Classification
- 🟢 Kafka producer ACK + RecordMetadata as scoped participant-local evidence.
- 🟢 `acks=all` + bounded retries as Kafka durability mechanism.
- 🔵 Nexo wrapper preserving logical operation identity across UNKNOWN/retry and binding Kafka incarnation.
- 🔴 Treating timeout/error as NOT_COMMITTED without reconciliation; treating callback success as global/external effect proof.

## Exact next action
AB104.640: inspect Kafka producer tests and sender/record-accumulator paths around timeout, retriable errors, duplicate suppression, leader failover, and callback ordering; convert F639 into executable adversarial test specifications before any implementation step.
