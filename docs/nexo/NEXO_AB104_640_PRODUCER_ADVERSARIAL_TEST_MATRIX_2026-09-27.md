# NEXO AB104.640 — Producer Sender/RecordAccumulator adversarial semantics

Date: 2026-09-27
Status: RESEARCH ONLY. No implementation or runtime verification.

## Findings
- RecordAccumulator explicitly treats deliveryTimeoutMs as the upper bound for reporting record success/failure and tracks batch expiry. Batches are re-enqueued on retry; with idempotence/transactions, sequence state is retained to prevent unsafe reordering or duplicate acceptance.
- Current Kafka source explicitly warns that when an idempotent batch is retried, changing producer ID/sequence would be unsafe because the previous attempt may already have been accepted. This directly supports preserving the original logical attempt identity through UNKNOWN/retry.
- Producer configuration documents that retries resend the same record; with idempotence disabled and max.in.flight > 1, retry can reorder batches. KafkaBasedLog's max.in.flight=1 avoids this particular reordering mechanism, but it does not remove response-loss ambiguity.
- Producer tests/issues confirm timeout/error paths are active correctness surfaces. A current Kafka issue records `testDeliveryTimeoutAndLingerMsConfig`, while another current issue demonstrates that an unbounded producer close can loop indefinitely on a retriable transaction-abort path; finite close timeout behaves differently. These are implementation observations, not Nexo verification.

## Executable adversarial specifications E640
- E640-1: send request accepted by broker, response lost; client retries/reconnects. Assert one logical record identity and UNKNOWN until authoritative metadata/log reconciliation.
- E640-2: transient failure on first batch, second batch succeeds; idempotence=false and max.in.flight>1. Assert possible reorder; Nexo cannot infer causal order from send-call order alone.
- E640-3: same scenario with idempotence enabled. Assert producer sequence fencing prevents unsafe duplicate/reorder within producer session; still scope evidence to Kafka participant.
- E640-4: delivery timeout expires after multiple retriable attempts. Assert timeout does not become NOT_COMMITTED without evidence that the broker never accepted the record.
- E640-5: retry of an in-flight idempotent batch after broker failover. Assert original producer ID/epoch/sequence lineage is retained; do not mint a new logical effect identity.
- E640-6: callback ordering with multiple batches/partitions. Assert each callback binds its own RecordMetadata and logical attempt; callback arrival order is not global commit order.
- E640-7: transactional send callback succeeds but transaction commit is UNKNOWN. Assert record callback cannot promote transaction outcome to COMMITTED.
- E640-8: finite producer close while requests remain unresolved. Assert unresolved sends remain UNKNOWN unless authoritative outcome evidence exists.

## Nexo consequence
The producer path now has a precise boundary:
`RecordBuffered -> RequestAttempted -> KafkaACK/RecordMetadata -> TransactionCommitted(if transactional) -> ReadToEndObserved -> HistoricalReconstructable`.

No implementation is justified yet. The next research target is to inspect concrete Kafka producer tests for E640-1..8 and determine which can be mapped to actual existing tests versus newly designed fault injection.

## Classification
- 🟢 recovered Kafka mechanisms: batch expiry, retry/re-enqueue, producer sequence lineage, participant-local ACK metadata.
- 🔵 Nexo extension: stable logical operation identity spanning response-loss/retry/reconciliation.
- 🔴 conflict: timeout/error => NOT_COMMITTED; callback => global effect; send order => causal commit order.

## Exact next action
AB104.641: inspect concrete KafkaProducer/ProducerFailureHandling/MockClient tests for E640-1..8, record exact existing coverage and uncovered windows, without claiming execution unless actually run.
