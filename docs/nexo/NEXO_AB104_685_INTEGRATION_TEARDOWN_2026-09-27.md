# NEXO AB104.685 — Deterministic integration-test teardown
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Current Apache Kafka pattern
The existing fault-proxy integration test uses EmbeddedKafkaCluster(1), cluster.start(), try/finally around the cluster, try-with-resources around KafkaProtocolFaultProxy, and try-with-resources around KafkaProducer/KafkaConsumer. The proxy is closed before cluster.stop(), matching resource ownership: proxy depends on the broker.

## Nexo-specific correction
The existing example closes the producer before the consumer/verifier because it is a normal success/retry test. That ordering MUST NOT be copied into the response-loss experiment before independent observation, because producer close may wait for pending work.

Frozen Nexo teardown:
- observation phase happens before producer close;
- direct verifier remains independent from producer lifecycle;
- verifier result is captured into immutable evidence before cleanup;
- cleanup errors are recorded separately and cannot rewrite PRESENT/NOT_OBSERVED/READ_PATH_ERROR;
- proxy closes after producer/verifier evidence;
- cluster stops last;
- teardown is best-effort and must not be used to classify broker state.

## Failure masking rule
Verifier failure = READ_PATH_ERROR, not NOT_OBSERVED.
Cleanup exception = CLEANUP_ERROR and cannot convert a previously captured observation.
Setup failure before the fault experiment is armed = HARNESS_SETUP_FAILURE, not an external-effect result.

## Frozen lifecycle
SETUP -> ARM_FAULT -> PRODUCE -> CAPTURE_PRODUCER -> DIRECT_VERIFY -> FREEZE_EVIDENCE -> CLEANUP

The evidence-freeze point is before producer/proxy/cluster teardown.

## Evidence status
VERIFIED:
- current Apache nested resource pattern;
- proxy-before-cluster teardown dependency;
- need to separate normal example teardown from Nexo response-loss observation ordering.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.686: inspect the fault-proxy lifecycle itself (start/close/thread termination) and determine whether close can race with the direct verifier or whether the evidence-freeze boundary fully isolates it.
