# NEXO AB104.668 — Produce response-loss test configuration and independent evidence
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Scope
Determine the smallest deterministic producer configuration for the already-verified KafkaProtocolFaultProxy response-path fault:
disconnect after broker response is received by the proxy, before the producer receives it.

## Verified Apache Kafka source facts
- Current Kafka ProducerConfig defines delivery.timeout.ms as the upper bound from send() return to success/failure, covering batching, broker acknowledgement, and retriable failures. It recommends delivery.timeout.ms >= request.timeout.ms + linger.ms.
- Sender.handleProduceResponse() treats a response-path disconnect as Errors.NETWORK_EXCEPTION.
- A response timeout is represented separately as Errors.REQUEST_TIMED_OUT.
- Sender.completeBatch() retries only while canRetry() is true; canRetry requires:
  1. batch has not reached delivery.timeout.ms,
  2. attempts < configured retries,
  3. batch is not done,
  4. error is retriable (or transaction manager permits retry).
- Therefore a response-path disconnect can be made single-attempt/deterministic with retries=0. This does NOT prove the record was not appended.
- With retries=0, the producer-side callback/future outcome is failure, while the external broker state remains independently UNKNOWN until observed.
- The existing fault proxy disconnectOn(PRODUCE).once().forClient(<unique-client-id>) is the correct response-path fault; blackholeClient must not be substituted.

## Proposed deterministic configuration
Use a single-broker EmbeddedKafkaCluster for the response-loss seam only:
- client.id = unique test-scoped producer identity
- acks = all
- retries = 0
- linger.ms = 0 (remove batching delay from the fault timing)
- request.timeout.ms = 1000 ms (or another bounded value safely above normal local request latency)
- delivery.timeout.ms = request.timeout.ms + linger.ms + margin; recommended test value 3000 ms
- enable.idempotence = false unless a separate idempotent retry variant is explicitly being tested
- batch.size = small / one-record-oriented
- proxy: disconnectOn(PRODUCE).forClient(clientId).once()

Rationale:
- acks=all makes the normal successful path request an acknowledgement, so dropping that response creates a genuine acknowledgement ambiguity rather than an acks=0 fire-and-forget case.
- retries=0 prevents a second producer attempt from mixing two distinct append attempts into the first seam test.
- linger.ms=0 removes intentional client-side batching delay.
- request.timeout.ms remains relevant to network timeout semantics, but the proxy disconnect should normally surface first as NETWORK_EXCEPTION rather than REQUEST_TIMED_OUT.
- delivery.timeout.ms must exceed request.timeout.ms + linger.ms; it should not be used as the primary fault trigger.

## Exact test sequence
1. Start one-broker EmbeddedKafkaCluster.
2. Create a dedicated topic with one partition.
3. Start KafkaProtocolFaultProxy in front of that broker.
4. Configure producer bootstrap through proxy and unique client.id.
5. Arm disconnectOn(PRODUCE).forClient(clientId).once().
6. Produce exactly one uniquely identifiable record: key/value containing a fresh test operation/effect identifier.
7. Capture producer callback/future result. Expected producer-side result: failure caused by response-path disconnect (NETWORK_EXCEPTION or equivalent surfaced exception).
8. Do NOT classify this producer result as NOT_COMMITTED.
9. Independently consume/read the target partition, bypassing the proxy where practical, or otherwise use an independent authoritative reader.
10. Search for the exact unique key/value and record its topic/partition/offset if present.
11. Record two separate claims:
   - ProducerClientOutcome = FAILED_TO_OBTAIN_ACK / NETWORK_EXCEPTION.
   - BrokerRecordObservation = PRESENT(offset) or ABSENT_AFTER_DEFINED_READ_BOUNDARY.
12. If the record is present, this demonstrates the critical ambiguity: producer reported failure while the broker had accepted/appended the record.
13. If absent, the test only establishes that the independent read did not observe the record within its defined boundary; it does NOT prove NOT_COMMITTED without a stronger authoritative absence proof.
14. Preserve proxy evidence (rule matched/triggered, client-id, API=PRODUCE) and independent reader evidence as separate evidence records.

## Evidence contract
Minimum fields:
- TestRunID
- ProducerClientID
- Topic
- Partition
- UniqueEffectID/key/value digest
- ProxyRule = disconnectOn(PRODUCE)
- ProxyScope = clientId
- ProxyTriggerCount
- ProducerOutcome
- ProducerExceptionClass
- ProducerAttemptCount
- IndependentReaderEndpoint
- ObservedRecord
- ObservedOffset
- ObservationTime
- ReadBoundary
- BrokerDurabilityVerified = NO unless replication/durability evidence is separately established
- NexoCorrectnessVerified = NO
- ExecutionStatus = NOT_EXECUTED until the test actually runs

## Important distinction
This experiment is deliberately narrower than replicated durability:
single-broker + response-loss can establish client/broker outcome divergence if the record is independently observed. It cannot establish survival across broker failure, replication loss, unclean election, or provider recovery.

## Epistemic labels
VERIFIED:
- Current ProducerConfig delivery-time semantics.
- Current Sender response-loss/disconnect classification.
- Current retry gate.
- Existing response-path fault proxy and client scoping from AB104.667.

NOT_IMPLEMENTED:
- This exact test.

NOT_EXECUTED:
- No broker experiment run in AB104.668.

UNKNOWN:
- Actual broker append outcome until independent reader executes.

BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Continuity
Historical AB104.656–667 remains intact. AB104.667 established the exact response-loss seam and client scoping. AB104.668 now fixes the producer configuration and evidence contract without claiming execution.

## Next exact step
AB104.669: inspect the current Kafka integration-test/proxy harness APIs needed to implement the smallest real-broker response-loss test, including how to obtain the proxy bootstrap endpoint, arm disconnectOn(PRODUCE).forClient(clientId).once(), and perform an independent direct-to-broker partition read with an exact unique record identity.
