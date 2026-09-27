# NEXO AB104.642 — concrete Kafka producer fault-test mapping

Date: 2026-09-27
Status: RESEARCH ONLY. No tests executed; no verification claim.

## Concrete source/test evidence
Apache Kafka exposes targeted producer failure-test execution through Gradle and has producer failure/integration test infrastructure. The current KafkaProducer source separates asynchronous send/buffering from broker completion and transaction commit; transactional commit timeout explicitly does not mean the request failed, and retrying the same transaction is the documented safe path rather than switching to a different operation. citeturn0search0turn0search3

## E641 mapping
- E641-1 response loss after broker acceptance: requires network/response suppression around ProduceResponse; existing producer integration infrastructure is suitable, but no execution here.
- E641-2 max.in.flight=1 retry: failure injection must occur after first send attempt and before response; expected result is retry under same logical producer request lineage, without claiming callback order is causal order.
- E641-3 max.in.flight>1 + idempotence disabled: inject failure into first batch while second is in flight; expected possibility is reorder after retry. This is a producer-semantics test, not yet executed.
- E641-4 idempotent failover: inject broker/leader failure after request transmission; expected producer identity/sequence continuity must be preserved. KafkaProducer's documented transactional/idempotent model requires preserving producer session lineage. citeturn0search3
- E641-5 transactional send succeeds, commit response lost: send callback cannot establish transaction COMMITTED; commit outcome requires transaction-coordinator reconciliation. KafkaProducer explicitly says commit timeout may occur while completion is still in progress and is safe to retry. citeturn0search3
- E641-6 delivery timeout + late acceptance: fault transport after broker acceptance and before client callback; expected Nexo state UNKNOWN until authoritative Kafka evidence.
- E641-7 callback success + consumer lag: compare RecordMetadata with consumer/read-to-end observation; producer ACK is not consumer convergence.
- E641-8 producer close with unresolved requests: finite close timeout leaves unresolved state; Nexo must not synthesize NOT_COMMITTED without evidence.

## MockClient boundary
MockClient/unit-level tests can deterministically inject responses/errors, but they do not prove broker persistence or cross-process durability. They are appropriate for protocol/state-machine coverage; integration/system tests are required for broker crash, leader failover, response loss and log visibility claims.

## New state rule
`UNIT_TEST_PASS` proves modeled client transition behavior only.
`INTEGRATION_TEST_PASS` can support Kafka-domain behavior under the tested deployment.
Neither alone proves Nexo external-effect atomicity or permanent historical reconstructability.

## Classification
- 🟢 Kafka test infrastructure as mechanism evidence.
- 🔵 Nexo adversarial harness mapping to stable operation/evidence identities.
- 🔴 treating MockClient success as broker durability or external-world verification.

## Exact next action
AB104.643: inspect concrete `MockClient` APIs and ProducerFailureHandling tests/source to identify exact injectable response/error primitives and build a one-to-one E642 fault-point table, still without executing tests.
