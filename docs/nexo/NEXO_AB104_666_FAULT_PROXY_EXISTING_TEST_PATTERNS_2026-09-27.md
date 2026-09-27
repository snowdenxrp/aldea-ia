# NEXO AB104.666 — existing fault-proxy test patterns

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED/EXECUTED.

Exact Apache Kafka trunk source inspection found reusable integration patterns.

VERIFIED:
1. `clients/src/test/java/org/apache/kafka/test/faultproxy/KafkaProtocolFaultProxyTest.java` verifies the proxy rejects multi-broker bootstrap and accepts a single broker.
2. `streams/integration-tests/src/test/java/org/apache/kafka/streams/integration/FaultProxyPlainClientsExampleIntegrationTest.java` uses `EmbeddedKafkaCluster(1)`, creates a topic, places `KafkaProtocolFaultProxy` in front of `cluster.bootstrapServers()`, injects a one-shot `ApiKeys.PRODUCE` error, points a `KafkaProducer` at `proxy.bootstrapServers()`, then points an independent `KafkaConsumer` at the same proxy and verifies all records are consumed.
3. The plain-client example therefore proves the exact test scaffolding for PRODUCE fault injection + independent readback already exists in trunk.
4. `FaultProxyExampleIntegrationTest.java` separately shows a verifier can bypass the proxy and read directly from `cluster.bootstrapServers()` when the faulted client is the Streams application.
5. No verified existing test was found that uses `disconnectOn(ApiKeys.PRODUCE)` specifically to suppress the broker response after the broker has processed the Produce request. Existing examples use `injectError(PRODUCE)` and `injectError(END_TXN)`.

Critical distinction:
- `injectError(PRODUCE)` changes the broker response; it is NOT equivalent to response loss.
- `disconnectOn(PRODUCE)` is the required seam for the timeout/late-response ambiguity experiment because the proxy receives the broker response and disconnects before forwarding it.
- Existing test scaffolding can be reused, but the actual response-loss test remains a new test specification.

AB104.665 correction:
The prior step stated no existing fault-proxy test usage had been located. That was incomplete. Exact source search now establishes existing fault-proxy integration tests, including a PRODUCE fault example. The narrower statement remains true: no existing `disconnectOn(PRODUCE)` test was verified.

Epistemic state:
FAULT_PROXY_SOURCE=VERIFIED
EXISTING_PRODUCE_FAULT_TEST=VERIFIED
EXISTING_DISCONNECT_PRODUCE_TEST=NOT_VERIFIED
BROKER_RESPONSE_LOSS_TEST=NOT_IMPLEMENTED
BROKER_DURABILITY_VERIFIED=NO
TEST_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.667 — inspect the exact `FaultRule`/DSL semantics for `disconnectOn(PRODUCE)` and client scoping (`forClient(...)` if present), then define the smallest response-loss integration test without inventing unsupported API.
