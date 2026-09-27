# NEXO AB104.664 — trunk fault-proxy availability and real-broker test design

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED/EXECUTED.

Fresh verification against Apache Kafka `trunk`:
- `clients/src/testFixtures/java/org/apache/kafka/test/faultproxy/KafkaProtocolFaultProxy.java` is present on trunk.
- The current implementation explicitly supports a single upstream broker and rewrites metadata/coordinator addresses back to the proxy.
- `disconnectOn(ApiKeys)` operates in `pumpResponses`, after the broker response frame has been read and matched to the in-flight request header.
- `disconnectOn(PRODUCE).once()` therefore drops the broker response after it reached the proxy.
- `delayOn(PRODUCE, Duration)` delays that broker response before forwarding it.
- The proxy is explicitly single-broker; multi-broker bootstrap is rejected. This constrains the first experiment to a single-broker embedded cluster. 

Web search did not return a usable exact source result, so the current-trunk GitHub source is the authoritative evidence for this step.

Smallest real-broker experiment design (not implemented):
1. Start a single-broker EmbeddedKafkaCluster.
2. Start KafkaProtocolFaultProxy in front of that broker.
3. Configure producer bootstrap to proxy address; give producer a unique client.id and deterministic record key/value.
4. Ensure the record is eligible for broker append and use an acknowledgement setting whose broker-side response can be returned after processing.
5. Register `disconnectOn(PRODUCE).once()` and constrain the rule to the producer client if the fixture's current DSL permits client scoping.
6. Produce exactly one uniquely identified record and capture the producer-side timeout/disconnect state.
7. Independently consume/read the target topic/partition after the producer failure path settles.
8. Compare authoritative observed record identity/offset against the producer attempt. Treat producer timeout as UNKNOWN until the independent observation resolves it.
9. Record whether a retry produced a second record; do not collapse attempts merely because application-level send was one logical operation.

Important test-design caveat:
The proxy proves that a broker response reached the proxy, but the first experiment must still validate the actual broker record state independently. A single-broker cluster is appropriate to validate response-path ambiguity, not to make claims about replicated durability or failure tolerance.

Evidence:
TRUNK_PROXY_SOURCE_VERIFIED=YES
POST_BROKER_RESPONSE_DROP=VERIFIED
POST_BROKER_RESPONSE_DELAY=VERIFIED
SINGLE_BROKER_LIMIT=VERIFIED
REAL_TEST_IMPLEMENTED=NO
REAL_TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.665 — inspect existing Kafka tests using `KafkaProtocolFaultProxy` on trunk and identify exact EmbeddedKafkaCluster/producer/consumer setup patterns plus whether `forClient(...)` is currently used for PRODUCE, without inventing an unverified test API.
