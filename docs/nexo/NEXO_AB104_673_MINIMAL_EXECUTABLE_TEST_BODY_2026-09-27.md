# NEXO AB104.673 — Minimal executable test body
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact existing utilities/patterns verified
Current Kafka trunk's `FaultProxyPlainClientsExampleIntegrationTest` already demonstrates:
- `EmbeddedKafkaCluster(1)` lifecycle;
- one-partition topic creation;
- `KafkaProtocolFaultProxy.inFrontOf(cluster.bootstrapServers())`;
- plain `KafkaProducer` through the proxy;
- plain `KafkaConsumer`;
- bounded polling with `ConsumerRecords`;
- `FaultRule.timesTriggered()`.

Current integration utilities also provide synchronous producer helpers, but those are NOT appropriate for the response-loss experiment because they flush/close and are designed to establish successful production, not preserve the failed producer outcome. citeturn0search0

## Smallest executable body
No new utility is needed.

The eventual test can be one JUnit integration method in the existing source set:
1. cluster = new EmbeddedKafkaCluster(1); start;
2. create topic with 1 partition / RF=1;
3. proxy in front of cluster;
4. clientId = unique fixed test identifier;
5. effectId = unique key/value token;
6. configure producer:
   - bootstrap = proxy.bootstrapServers()
   - acks=all
   - retries=0
   - linger.ms=0
   - request.timeout.ms=1000
   - delivery.timeout.ms=3000
   - serializers=String
   - client.id=clientId
7. arm:
   `proxy.disconnectOn(ApiKeys.PRODUCE).forClient(clientId).once()`
8. call `send(record).get(...)`;
9. require that the future does NOT yield successful RecordMetadata; store failure as ProducerClientOutcome only;
10. assert fault trigger count = 1;
11. construct a NEW verifier KafkaConsumer with bootstrap = cluster.bootstrapServers() (bypass proxy), earliest, unique group;
12. poll until deadline for exact effectId;
13. if exact record appears, store topic/partition/offset and classify PRESENT;
14. if deadline expires, classify NOT_OBSERVED;
15. verifier failure classifies READ_PATH_ERROR;
16. never derive NOT_COMMITTED from either timeout or absence.

## Why helper reuse is intentionally limited
`IntegrationTestUtils.produceKeyValuesSynchronously` waits/flushes and therefore obscures the exact failed acknowledgement boundary being studied. Direct `KafkaProducer.send(...).get(...)` is the correct minimal surface.

## Evidence assertion
The strongest first-run positive result is:
ProducerClientOutcome = FAILED_*
FaultRule.timesTriggered = 1
BrokerRecordObservation = PRESENT(topic, partition, offset)

That combination directly demonstrates the response-loss ambiguity.

A negative observation remains:
BrokerRecordObservation = NOT_OBSERVED
and does not collapse UNKNOWN.

## Scope
This is a single-broker/RF=1 experiment. It validates response-loss ambiguity and the evidence separation, not replicated durability or Nexo-wide correctness. The fault proxy is explicitly internal test infrastructure and supports deterministic `disconnectOn` rules. citeturn0search2

## Status
VERIFIED:
- existing utilities and test conventions;
- minimal direct-producer path;
- no new infrastructure required.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.674: inspect the exact `KafkaProducer.send(...).get(timeout)` behavior and current test conventions for bounded Future waits, then decide the precise timeout handling without writing the test yet.
