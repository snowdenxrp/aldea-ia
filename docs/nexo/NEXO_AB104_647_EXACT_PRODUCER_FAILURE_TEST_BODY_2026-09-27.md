# NEXO AB104.647 — exact current ProducerFailureHandlingTest body

Date: 2026-09-27
Status: RESEARCH ONLY.

Direct current Apache Kafka source was successfully retrieved from the canonical GitHub repository at:
clients/clients-integration-tests/src/test/java/org/apache/kafka/clients/producer/ProducerFailureHandlingTest.java
Blob SHA: d06a29d72ad332961e7917bad83fabd1a0de3633

The current class is a KRaft cluster integration test with 2 brokers. Exact tests include:
- too-large record with ack=0: metadata offset -1;
- too-large record with ack=1: ExecutionException;
- oversized replication cases with ack=all;
- nonexistent topic / wrong broker list / invalid partition timeout behavior;
- send after producer close -> IllegalStateException;
- internal-topic rejection under multiple auto-create configurations;
- not-enough-replicas after broker shutdown, accepting NotEnoughReplicasException, NotEnoughReplicasAfterAppendException, or TimeoutException.
The source also shows retries=0, request timeout 30000 ms, max block 10000 ms, and buffer memory 30000 in the helper producer configuration.

This closes the prior exact-test-body retrieval gap for ProducerFailureHandlingTest itself. It does NOT establish MockClient fault-injection coverage and does NOT constitute execution of the tests.

Evidence:
EXACT_TEST_BODY_VERIFIED=YES
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

Important implication for E642/E641: the current ProducerFailureHandlingTest is primarily broker/integration failure behavior, not the previously hypothesized MockClient response-queue unit-fault matrix. Those are distinct evidence surfaces.

EXACT NEXT ACTION: AB104.648 — locate the current canonical MockClient path (likely under clients/src/test/java/.../internals or testFixtures), retrieve its exact source, and map actual response/error queue primitives to E642-1..E642-3 and E642-5..E642-8. Do not assume the path until retrieved.
