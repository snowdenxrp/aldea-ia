# NEXO AB104.649 — KafkaProducerTest + MockClient evidence surface

Date: 2026-09-27
Status: RESEARCH ONLY.

Current exact KafkaProducerTest source retrieved:
clients/src/test/java/org/apache/kafka/clients/producer/KafkaProducerTest.java
Blob SHA: 6180ffee369acbb1b7b7b9cab3ddf6f57c286a65

Verified directly from the current source:
- KafkaProducerTest imports org.apache.kafka.clients.MockClient.
- The file has tests that construct KafkaProducer with injected ProducerMetadata + MockClient.
- It contains producer configuration tests proving transactional/idempotent defaults and constraints.
- Current source also contains test helper paths around delivery timeout, transactions, ProduceResponse and metadata.
- A historical Apache diff demonstrates direct MockClient use in KafkaProducerTest for close/metadata blocking, with prepareResponse and assertions on the resulting exception; this historical evidence is not treated as current-body evidence.

Critical evidence distinction:
1. MockClient capability = injectable client behavior.
2. KafkaProducerTest assertion = producer-side behavior under injected client behavior.
3. Broker/integration test = actual broker-side behavior.
4. Consumer/read-to-end/reconciliation = downstream durable-state evidence.
These are not interchangeable.

The current KafkaProducerTest retrieval was truncated by tool output size, so exact method-level coverage for E642-1..8 has NOT been exhaustively enumerated from the current body. No method names are fabricated.

Web research found no reliable exact-result snippet for the specific E642 cases, so those remain OPEN until line-level extraction/search is available.

Evidence:
CURRENT_KAFKAPRODUCERTEST_BODY_VERIFIED=YES
CURRENT_METHOD_COVERAGE_EXHAUSTIVE=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.650 — retrieve the current KafkaProducerTest in bounded chunks/ranges (or exact search within the fetched body) and enumerate only tests that actually exercise ProduceResponse/error, retry, timeout, callback, or transaction completion through MockClient. Then map each assertion to E642-1..8.
