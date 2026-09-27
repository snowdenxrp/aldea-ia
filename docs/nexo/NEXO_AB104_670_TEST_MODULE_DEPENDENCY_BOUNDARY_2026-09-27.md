# NEXO AB104.670 — Test module/source-set placement and dependency boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Result
The smallest already-proven host for the response-loss experiment is the existing `streams:integration-tests` integration-test source set, because current trunk already contains:
- `FaultProxyPlainClientsExampleIntegrationTest`
- `FaultProxyDelayIntegrationTest`
- imports of `EmbeddedKafkaCluster`, `KafkaProtocolFaultProxy`, `FaultRule`, `KafkaProducer`, `KafkaConsumer`
- JUnit integration tagging and timeout.

The current Kafka build places `KafkaProtocolFaultProxy` under `clients/src/testFixtures`, explicitly intended to be reusable from other modules. The repository build also enforces use of `testFixtures(project(':clients'))` rather than depending directly on another module's test output.

## Exact placement decision
Do NOT modify production code.
Do NOT add a new test-fixture implementation.
Add the eventual experiment beside the existing fault-proxy integration tests in:
`streams/integration-tests/src/test/java/org/apache/kafka/streams/integration/`

Candidate class:
`FaultProxyProduceResponseLossIntegrationTest`

Candidate method:
`producerReportsFailureWhileIndependentReaderObservesRecord()`

## Existing dependency evidence
The current existing fault-proxy integration test compiles against:
- KafkaProducer/KafkaConsumer
- EmbeddedKafkaCluster
- clients test fixtures containing KafkaProtocolFaultProxy/FaultRule.

This demonstrates the required dependency path is already available to this source set. No new production dependency is justified by the experiment.

## Test execution route
Repository documentation provides the module-scoped integration-test route:
`./gradlew streams:integration-tests:test --tests org.apache.kafka.streams.integration.<TestClass>.<TestMethod>`

The generic integration-test workflow is also documented by Kafka's current AGENTS/README.

## Test design boundary
The eventual test should:
1. Start EmbeddedKafkaCluster(1).
2. Create one topic/partition.
3. Start KafkaProtocolFaultProxy in front of the broker.
4. Use a unique producer client.id and unique effectId.
5. Arm `disconnectOn(PRODUCE).forClient(clientId).once()`.
6. Producer uses the AB104.668 bounded configuration.
7. Capture the producer failure without classifying commit state.
8. Verify proxy rule triggered exactly once.
9. Use a distinct KafkaConsumer connected directly to `cluster.bootstrapServers()`, bypassing the proxy.
10. Locate the unique record and capture offset if present.
11. Emit separate evidence for client outcome and broker observation.
12. Preserve NOT_OBSERVED as UNKNOWN rather than NOT_COMMITTED.

## Why streams:integration-tests is preferable now
A new clients integration-test module would duplicate existing harness usage. The existing Streams integration-test source set already demonstrates the complete EmbeddedKafkaCluster + fault proxy + plain producer/consumer path. Using it keeps the first experiment isolated to test code and avoids production changes.

## Important caveat
This source-set choice is a test-harness decision, not evidence that the test has run. No compilation or execution was performed in AB104.670.

VERIFIED:
- Existing integration test host and fault-proxy usage.
- Fault proxy is reusable test fixture infrastructure.
- Kafka build rules prohibit direct test-output dependencies and prefer testFixtures.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.671: inspect the existing direct-consumer utilities/read pattern in `streams:integration-tests` and determine the narrowest authoritative read boundary for proving PRESENT(offset) versus merely NOT_OBSERVED.
