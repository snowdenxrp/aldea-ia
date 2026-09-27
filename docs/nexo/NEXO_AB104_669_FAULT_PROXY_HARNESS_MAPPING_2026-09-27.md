# NEXO AB104.669 — Real-broker fault-proxy harness mapping
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Verified current Apache Kafka harness
- `EmbeddedKafkaCluster(1)` is the established integration-test pattern for the fault proxy.
- `KafkaProtocolFaultProxy.inFrontOf(cluster.bootstrapServers())` starts a local proxy and exposes `proxy.bootstrapServers()` for clients.
- The proxy rewrites Metadata/FindCoordinator advertised addresses back to itself, so producer bootstrap can use the proxy endpoint.
- `disconnectOn(ApiKeys.PRODUCE).forClient(clientId).once()` is deterministic and scoped to the producer client ID.
- The proxy applies DISCONNECT only after it has read the broker's Produce response. It then closes the connection without forwarding that response.
- `FaultRule.timesTriggered()` and `timesMatched()` provide direct evidence that the rule fired/matched.
- Existing trunk integration tests already exercise EmbeddedKafkaCluster + proxy + producer/consumer, but their existing Produce fault test uses injected error, not response loss.
- Existing proxy test infrastructure therefore removes the previous harness uncertainty. The remaining gap is the exact response-loss test itself.

## Minimal executable experiment
1. `EmbeddedKafkaCluster cluster = new EmbeddedKafkaCluster(1)`.
2. `cluster.start()`.
3. Create one topic, one partition, replication factor 1.
4. Start `KafkaProtocolFaultProxy.inFrontOf(cluster.bootstrapServers())`.
5. Generate unique `clientId` and unique `effectId`.
6. Configure producer:
   - bootstrap = `proxy.bootstrapServers()`
   - client.id = unique clientId
   - acks = all
   - retries = 0
   - linger.ms = 0
   - request.timeout.ms = 1000
   - delivery.timeout.ms = 3000
   - String serializers
7. Arm:
   `FaultRule rule = proxy.disconnectOn(ApiKeys.PRODUCE).forClient(clientId).once();`
8. Send exactly one uniquely identifiable record containing effectId.
9. Capture producer Future/callback failure. Expected class is a response-path network failure; do not translate it into NOT_COMMITTED.
10. Assert `rule.timesTriggered() == 1`.
11. Independently create a KafkaConsumer using **cluster.bootstrapServers()**, not proxy.bootstrapServers(), with a distinct client.id.
12. Read from earliest on the exact topic/partition and locate the unique effectId.
13. If found, record exact offset and classify:
    ProducerClientOutcome = FAILED_ACK
    BrokerRecordObservation = PRESENT
    OverallEffectOutcome = UNKNOWN_FROM_PRODUCER / PRESENT_BY_INDEPENDENT_OBSERVATION
14. If not found before the defined read deadline, classify only:
    BrokerRecordObservation = NOT_OBSERVED
    and keep commit status UNKNOWN. Do not call absence NOT_COMMITTED.
15. Preserve producer exception, proxy rule evidence, and consumer observation as separate evidence records.

## Why the direct consumer matters
The proxy can close the producer response path while the broker remains untouched by the client-side failure. Reading directly from the broker removes the proxy from the observation path and avoids conflating producer acknowledgement with broker state.

## Current harness evidence boundary
VERIFIED:
- EmbeddedKafkaCluster(1) integration setup.
- Proxy bootstrap endpoint.
- Response-path DISCONNECT after broker response arrival.
- Client-ID scoped deterministic trigger.
- Independent consumer pattern.

NOT_IMPLEMENTED:
- Exact disconnectOn(PRODUCE) response-loss test.

NOT_EXECUTED:
- No actual test run in AB104.669.

BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.670: inspect the current producer/consumer test utilities and exact Gradle source-set dependencies so the response-loss test can be placed in the smallest correct Kafka integration-test module without inventing dependencies or changing production code.
