# NEXO AB104.646 — Gitiles test-path discovery

Date: 2026-09-27
Status: RESEARCH ONLY.

Official Apache Kafka Gitiles was searched directly. It confirms that the current Kafka repository documents targeted execution of:
./gradlew clients:clients-integration-tests:test --tests org.apache.kafka.clients.producer.ProducerFailureHandlingTest.testCannotSendToInternalTopic
and exposes current repository commits/trees. citeturn0search0turn0search8

A significant path distinction was found: older Kafka history contains ProducerFailureHandlingTest under the core module (for example kafka.api.ProducerFailureHandlingTest), while current documentation points to clients:clients-integration-tests. citeturn0search1turn0search3

The exact current source body still was not retrieved in this step. Therefore:
EXACT_TEST_BODY_VERIFIED=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

Do not infer current MockClient APIs or assertions from the historical path.

EXACT NEXT ACTION: AB104.647 — follow the current Gitiles clients/clients-integration-tests tree and commit history to retrieve the exact ProducerFailureHandlingTest source; then locate the current MockClient source and inspect response/error queue primitives line-by-line.
