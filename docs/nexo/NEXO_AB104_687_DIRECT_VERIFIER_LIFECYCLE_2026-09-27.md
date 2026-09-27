# NEXO AB104.687 — Direct verifier lifecycle and bounded observation deadline
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Apache Kafka findings

Current trunk KafkaConsumer documents and implements manual partition assignment through assign(Collection<TopicPartition>). Manual assignment disables dynamic group coordination/rebalancing; after assign(), poll(Duration) fetches the assigned partition and the position is controlled by the consumer's current position/reset behavior. This is preferable for the verifier because the test needs one fixed topic/partition without group-rebalance state.

The current ClassicKafkaConsumer implementation checks that a user assignment exists before poll(), then executes the fetch path against the assigned partition. poll(Duration) is bounded by its Timer/timeout rather than by an externally extended test wait.

Current KafkaConsumer close(Duration) delegates to the consumer implementation. Current trunk internally bounds close work by the supplied close timeout and, for broker operations, requestTimeoutMs. Close can perform pending cleanup; therefore it is lifecycle/cleanup, not observation evidence.

Kafka 4.1+ also exposes CloseOptions; close(Duration) is deprecated in favor of close(CloseOptions), but the bounded-close semantics remain. The verifier should therefore freeze its evidence before any close operation.

## Frozen verifier configuration

- Direct broker bootstrap: cluster.bootstrapServers(), bypassing the fault proxy.
- One target TopicPartition(topic, 0).
- enable.auto.commit=false.
- auto.offset.reset=earliest.
- Manual assign(Collections.singleton(targetPartition)).
- No subscribe(), no group coordination, no offset commit.
- poll(Duration.ofMillis(500)).
- Absolute observation deadline captured once before the first poll: now + 10 seconds.
- Each poll timeout is min(500ms, remaining deadline).
- Never extend the deadline because of producer/proxy cleanup.
- Exact effect identity match remains the only PRESENT criterion.

## Frozen evidence state machine

UNSTARTED
-> OBSERVING
-> PRESENT | NOT_OBSERVED | READ_PATH_ERROR

PRESENT:
- exact effectId/header identity observed;
- capture topic, partition, offset;
- freeze immediately.

NOT_OBSERVED:
- every poll completed without read error;
- fixed absolute deadline elapsed;
- exact effect identity not observed;
- this is NOT_COMMITTED, and must remain epistemically weaker.

READ_PATH_ERROR:
- verifier could not complete reliable observation;
- no absence conclusion.

After any terminal observation state:
EVIDENCE_FREEZE -> CONSUMER_CLOSE -> PROXY_CLOSE -> CLUSTER_STOP

Consumer close duration is cleanup-only and cannot modify the already frozen observation classification.

## Why manual assignment is required

The Kafka source explicitly states that manual assignment does not use group coordination and that the assigned set changes only through assign(). This removes rebalances as a confounder in the narrow response-loss experiment.

The verifier therefore must not use subscribe() or committed group offsets. No automatic offset commit is permitted.

## Deadline rule

The deadline is an absolute timestamp/monotonic target established before observation begins. Each poll derives its remaining duration from that fixed deadline.

Forbidden:
- resetting the deadline after an empty poll;
- extending it because the producer is still cleaning up;
- extending it because proxy.close() is pending;
- using consumer.close() completion as evidence that the record was absent.

## Evidence boundary

PRESENT is authoritative observation of the record through the direct broker path.

NOT_OBSERVED only means the exact record was not observed by the direct verifier before the fixed observation deadline under a successful read path.

READ_PATH_ERROR means observation failed and must not be collapsed into absence.

Consumer close, proxy close, cluster stop, Future cancellation, and cleanup exceptions are separate lifecycle evidence and cannot rewrite the frozen broker observation.

## Status

VERIFIED:
- manual assignment avoids group coordination/rebalance;
- poll(Duration) is the bounded observation primitive;
- close(Duration) is bounded cleanup and must occur after evidence freeze;
- current Kafka source supports the lifecycle separation.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.688: inspect the direct verifier's offset initialization/reset semantics for manual assignment and determine whether the experiment must explicitly seekToBeginning() or can rely safely on auto.offset.reset=earliest, then freeze the exact starting-offset procedure.
