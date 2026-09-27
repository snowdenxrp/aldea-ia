# NEXO AB104.684 — Producer cleanup ordering
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current behavior
Current KafkaProducer.close() blocks until previously sent requests complete; close(Duration) waits up to the supplied timeout and then fails unsent/unacknowledged records when the timeout expires. flush() also blocks until previously sent records complete. Therefore neither should be placed before the independent broker observation in the response-loss experiment.

## Frozen lifecycle
1. Create cluster and topic.
2. Start proxy.
3. Create producer.
4. Arm disconnectOn(PRODUCE).forClient(clientId).once().
5. Send exactly one unique ProducerRecord.
6. Wait only for the producer Future outcome (bounded 10 s).
7. Capture fault-rule counters immediately.
8. Do NOT call producer.flush().
9. Do NOT call blocking producer.close() before the direct verifier.
10. Start/use a separate direct-broker verifier and classify PRESENT / NOT_OBSERVED / READ_PATH_ERROR.
11. Only after verifier evidence is captured, close the producer with a bounded timeout (or zero if cleanup itself must not extend observation).
12. Close verifier/proxy/cluster in normal teardown.

## Epistemic reason
Producer cleanup can itself wait for or force completion/failure of pending requests. That would contaminate the temporal boundary being measured. The direct verifier must therefore observe broker state before cleanup can change the producer-side lifecycle.

## Important nuance
A finite close timeout is cleanup behavior, not broker-state evidence. It must never be used to classify the external effect.

## Status
VERIFIED:
- current close/close(Duration)/flush semantics;
- cleanup ordering requirement.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.685: inspect current Kafka test teardown patterns for EmbeddedKafkaCluster + KafkaProtocolFaultProxy and freeze deterministic resource teardown without masking verifier failures.
