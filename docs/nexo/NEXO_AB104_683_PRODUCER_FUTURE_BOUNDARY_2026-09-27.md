# NEXO AB104.683 — Producer Future completion boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current source finding
The current Kafka producer path is:
ProducerRecord -> ProducerBatch.tryAppend() -> FutureRecordMetadata -> ProduceRequestResult.

FutureRecordMetadata.get(timeout) waits on ProduceRequestResult and throws java.util.concurrent.TimeoutException only when the future has not completed within the caller's wait interval.

When a batch completes exceptionally, ProducerBatch.completeExceptionally()/done() stores the RuntimeException in ProduceRequestResult and then completes the latch. FutureRecordMetadata.valueOrError() exposes that as ExecutionException.

Crucial source invariant:
ProducerBatch.done() explicitly permits a batch that was first marked FAILED/ABORTED to later receive a broker SUCCESS response. The later success is logged and does not rewrite the already-completed user Future.

## Frozen producer assertion
For the response-loss experiment:
1. Call send(record).get(10, TimeUnit.SECONDS).
2. Successful RecordMetadata is a test failure because the target fault is supposed to suppress the response.
3. ExecutionException means the producer Future completed exceptionally; record the cause class for diagnostics only.
4. java.util.concurrent.TimeoutException means the test stopped waiting; classify as FAILED_TIMEOUT and do not infer broker state.
5. InterruptedException restores interrupt status and is a harness interruption, not broker state.
6. Do not assert exact exception message text.
7. Never convert any producer-side failure into NOT_COMMITTED.

## Stronger epistemic boundary
A producer-side Future only reports the client's completion state. It is not an authoritative observation of whether the broker appended the record when the response path was disrupted.

The independent direct-broker verifier remains mandatory.

## Status
VERIFIED:
- Future timeout vs exceptional completion boundary;
- producer Future completion path;
- FAILED-then-late-SUCCESS behavior at batch state level;
- exception-message-independent assertion design.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.684: inspect the exact test lifecycle/cleanup ordering so producer close cannot accidentally wait for or alter the response-loss observation before the independent verifier runs.
