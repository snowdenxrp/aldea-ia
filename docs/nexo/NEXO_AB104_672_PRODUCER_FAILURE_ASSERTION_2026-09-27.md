# NEXO AB104.672 — Producer failure assertion under ProduceResponse loss
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Verified current behavior
Current Kafka `KafkaProducer` documents asynchronous send and producer-side acknowledgement semantics; `acks=all` waits for the configured acknowledgement condition, but timeout does not prove the request was absent from the broker. citeturn0search3

Current `Sender` creates a Produce request with the configured request timeout and installs `handleProduceResponse` as the completion callback. Its batch expiry path fails an unresolved batch with `TimeoutException` and explicitly describes the condition as either the request not having been sent or no server response having been received. Therefore a timeout is deliberately not a commit-state proof.

## Assertion boundary for the experiment
Do NOT assert a specific exception message.
Do NOT assert a single concrete wrapper class unless the actual `Future.get()` result proves it in the executed test.
Do NOT classify the producer failure as NOT_COMMITTED.

The stable assertion should be behavioral:
1. `producer.send(record).get(...)` does not return successful RecordMetadata.
2. A failure/timeout is captured as ProducerClientOutcome.
3. The failure is recorded separately from BrokerRecordObservation.
4. The fault rule confirms the PRODUCE response-loss rule triggered exactly once.
5. The independent broker reader determines whether the unique effectId is PRESENT or NOT_OBSERVED.

For the base experiment, `retries=0` is important: it prevents an automatic second Produce attempt from turning the test into a retry-success experiment and keeps the first response-loss ambiguity isolated.

## Why this is safer
The proxy closes the client connection only after receiving the real Produce response from the broker. Therefore the producer can fail locally while the broker may already have accepted/appended the record. This is the exact ambiguity under study.

The producer exception type is implementation/client-path evidence only. The authoritative effect classification comes from the independent broker read.

## Current source evidence
- KafkaProducer documentation confirms send is asynchronous and acks control completion semantics. 
- Sender expiry code says an unresolved request may be unsent OR have received no server response.
- Sender constructs the Produce callback through handleProduceResponse.
- Kafka server Produce handling constructs and sends the response after append processing; the proxy sits between this response and the client.

## Safe test contract
ProducerClientOutcome:
- SUCCESS_METADATA
- FAILED_EXCEPTION
- FAILED_TIMEOUT
- FAILED_OTHER

BrokerRecordObservation:
- PRESENT(topic, partition, offset)
- NOT_OBSERVED
- READ_PATH_ERROR

These domains MUST remain independent.

## Status
VERIFIED:
- behavioral producer-failure assertion boundary;
- no need to depend on exception message;
- timeout/failure cannot be used as NOT_COMMITTED proof.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.673: inspect the exact existing test utilities for deterministic topic creation, producer properties, consumer polling, and timeout handling, then define the smallest executable test body without adding infrastructure.
