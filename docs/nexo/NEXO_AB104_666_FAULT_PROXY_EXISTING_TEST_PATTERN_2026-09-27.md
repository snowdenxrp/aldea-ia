# NEXO AB104.666 — verified existing fault-proxy integration pattern

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED/EXECUTED.

Exact current Kafka trunk source was located via repository code search.

Verified existing tests:
- `streams/integration-tests/src/test/java/org/apache/kafka/streams/integration/FaultProxyExampleIntegrationTest.java`
- `FaultProxyDelayIntegrationTest.java`
- `SourceTopicChangelogRestoreIntegrationTest.java`
- `clients/src/test/java/org/apache/kafka/test/faultproxy/KafkaProtocolFaultProxyTest.java`

The strongest reusable pattern is `FaultProxyExampleIntegrationTest`:
1. `EmbeddedKafkaCluster(1)` is started.
2. `KafkaProtocolFaultProxy.inFrontOf(cluster.bootstrapServers())` fronts the single broker.
3. A deterministic `FaultRule` is registered with `.once()`.
4. The application is configured to use `proxy.bootstrapServers()`.
5. Input can be produced directly to the real broker to bypass the proxy when desired.
6. A separate consumer connects directly to the broker and validates committed output.
7. The test asserts the fault actually fired via `timesTriggered()` and independently verifies the final state through the consumer.

This proves that the fixture is already integrated into real Kafka integration tests and that the single-broker + proxy + independent consumer architecture is not hypothetical. citeturn0search0

Important distinction:
The existing example uses `injectError(ApiKeys.END_TXN, Errors.PRODUCER_FENCED).once()`, not `disconnectOn(PRODUCE)`. Therefore it validates the harness architecture, trigger accounting, and independent verification pattern, but it does NOT yet prove the exact Produce-response-loss scenario required by AB104.

No current verified `disconnectOn(PRODUCE)` test was found in the repository search results. Thus the remaining task is to adapt the proven integration pattern to `PRODUCE`, with a uniquely identified record and a direct broker consumer as the independent observation.

Evidence:
EXISTING_PROXY_INTEGRATION_TEST=VERIFIED
SINGLE_BROKER_PATTERN=VERIFIED
INDEPENDENT_CONSUMER_VERIFICATION=VERIFIED
FAULT_TRIGGER_ACCOUNTING=VERIFIED
EXACT_PRODUCE_RESPONSE_DROP_TEST=NOT_FOUND
TEST_IMPLEMENTED_IN_NEXO=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.667 — inspect `FaultRule` trigger/client-scoping semantics and the existing delay/restore tests to determine the exact safe way to target only the producer's `PRODUCE` response and avoid accidentally dropping consumer Produce/other client traffic.
