# NEXO AB104.641 — Kafka producer test coverage vs E640 gaps

Date: 2026-09-27
Status: RESEARCH ONLY. No tests executed; no verification claim.

## Evidence reviewed
Current Apache Kafka source/test navigation and producer configuration were inspected. Kafka's repository documents running individual producer failure tests with Gradle. Current ProducerConfig defines delivery.timeout.ms as the upper bound for reporting success/failure, retry behavior, idempotence constraints, and max.in.flight ordering semantics. Kafka's end-to-end test framework validates producer acknowledgements separately from consumer-observed offsets. citeturn0search0turn0search1turn0search4

## Coverage classification
- E640-1 response loss after broker acceptance: PARTIAL design-level coverage; existing end-to-end ACK/consume validation is not itself proof of client-side response-loss reconciliation.
- E640-2 retries + max.in.flight>1 reorder: DOCUMENTED mechanism; requires targeted producer failure test to establish exact scenario behavior.
- E640-3 idempotent retry lineage: CONFIGURATION/implementation coverage exists in producer code; targeted failure injection still required for Nexo claim.
- E640-4 delivery timeout: CONFIGURATION semantics documented; targeted broker/network fault execution required.
- E640-5 failover while idempotent batch is in flight: existing integration infrastructure can exercise broker/leader failure, but no execution was performed here.
- E640-6 callback ordering: producer callbacks are per-record metadata/error callbacks; no global causal ordering guarantee should be inferred. Targeted test still required.
- E640-7 transactional send callback vs transaction outcome: producer docs/source explicitly separate transactional commit from individual send; targeted failure test required.
- E640-8 close with unresolved requests: producer close has explicit timeout/force-close behavior; targeted test required.

## Important Connect boundary
Current Kafka Connect Worker source deliberately configures its regular internal producer with `enable.idempotence=false`, `acks=all`, `max.in.flight.requests.per.connection=1`, and effectively unbounded delivery timeout. Therefore Connect's regular offset backing path cannot inherit Kafka's idempotent producer duplicate suppression merely because modern KafkaProducer defaults idempotence on. citeturn0search5

This strengthens the earlier AB104.637 conclusion: Nexo must treat the backing-store operation identity and Kafka key/value/offset reconciliation explicitly; local Connect callback success cannot be upgraded to a universal idempotent-effect claim.

## New adversarial matrix E641
E641-1 broker accepts then response lost + non-idempotent Connect producer; reconcile compacted topic.
E641-2 retry after transient failure with max.in.flight=1; verify no causal-order claim from callback order.
E641-3 two in-flight requests with idempotence disabled/max.in.flight>1; induce first failure and observe reorder possibility.
E641-4 idempotent producer failover; preserve producer session/sequence identity.
E641-5 transactional send succeeds but commit response lost; reconcile transaction state before declaring committed.
E641-6 delivery timeout followed by late broker acceptance; classify UNKNOWN rather than NOT_COMMITTED.
E641-7 callback success then consumer/read-to-end lag; distinguish producer ACK from local convergence.
E641-8 producer close timeout; preserve unresolved records as UNKNOWN until evidence.

## Classification
- 🟢 Existing evidence: producer configuration semantics; integration test infrastructure; separate producer ACK vs consumer-observation concepts.
- 🔵 Extension: executable Nexo reconciliation tests binding operation identity + Kafka incarnation + metadata.
- 🔴 Conflict: treating Connect callback as idempotent/global proof or callback order as causal order.

## Exact next action
AB104.642: inspect the concrete Kafka producer failure test implementations and mock-client fault injection APIs (not only test index/navigation), then map each E641 case to exact injected failure point and expected state.
