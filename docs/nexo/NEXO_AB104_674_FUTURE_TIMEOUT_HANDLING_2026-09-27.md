# NEXO AB104.674 — Future timeout handling
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Verified
Kafka integration tests use both:
- `producer.send(record).get()` for ordinary completion/failure assertions;
- `producer.send(record).get(timeout, TimeUnit)` where a bounded wait is needed.

The current client integration suite contains `assertThrows(ExecutionException.class, () -> producer.send(record).get())` for producer failures. Other current tests use bounded `get(..., TimeUnit.SECONDS)` when controlling test duration.

## Decision for AB104 response-loss test
Use a bounded Future wait:
`producer.send(record).get(PRODUCER_WAIT_SECONDS, TimeUnit.SECONDS)`

Catch and record:
- `ExecutionException`: ProducerClientOutcome=FAILED_EXCEPTION; retain cause type only as diagnostic evidence.
- `TimeoutException` from Future.get: ProducerClientOutcome=FAILED_TIMEOUT.
- `InterruptedException`: restore interrupt and classify test infrastructure interruption; do not call it broker outcome.
- unexpected RuntimeException: ProducerClientOutcome=FAILED_OTHER and fail the test only if it indicates a harness/programming error.

The assertion must be:
`assertFalse(success)`
or equivalent explicit state capture—not a specific exception message.

## Critical distinction
There are two different TimeoutException concepts:
1. `java.util.concurrent.TimeoutException` from the bounded Future.get call: the test stopped waiting.
2. Kafka producer `org.apache.kafka.common.errors.TimeoutException`: producer-side operation timeout.

Neither means NOT_COMMITTED.

The test should preserve the wrapper/cause information as diagnostics, but its authoritative effect classification remains the independent direct-broker read.

## Why bounded get is preferable
A naked `get()` could wait for the producer's delivery timeout and make the test duration depend on producer configuration. The bounded get gives a deterministic test-level observation boundary while still allowing the proxy disconnect to surface.

The producer's `delivery.timeout.ms` remains the client operation boundary; the Future wait is only the test observer boundary.

## Proposed constants
- FUTURE_WAIT = 10 seconds maximum.
- producer delivery.timeout.ms = 3000 ms from AB104.668.
These are test-observer values, not claims about broker commit timing.

## Status
VERIFIED:
- current Kafka test conventions for Future.get;
- bounded get usage;
- ExecutionException assertion pattern.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.675: inspect current fault-proxy `disconnectOn(PRODUCE)` lifecycle and `timesMatched/timesTriggered` semantics once more at source level, then freeze the exact evidence assertions before implementation.
