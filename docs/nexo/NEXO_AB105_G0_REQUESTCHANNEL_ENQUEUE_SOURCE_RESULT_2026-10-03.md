# NEXO AB105 G0 — RequestChannel ENQUEUE Source Result — 2026-10-03

## Exact pinned source result
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42 (SocketServer path inspected at equivalent source commit bec089ce82688e6eec8ec57a8fb04f0aae058bc3).

RequestChannel:
- requestQueue is a java.util.concurrent.ArrayBlockingQueue[BaseRequest].
- sendRequest(request) performs requestQueue.put(request).
- receiveRequest() uses requestQueue.take(), and the timed form uses poll.

Processor:
- SocketServer Processor.processCompletedReceives constructs the Request and then directly calls requestChannel.sendRequest(req).
- The call occurs on the Processor/network execution path after selector completedReceives processing.

## Causal/JMM interpretation
The queue provides the known publication/synchronization boundary from ENQUEUE to a consumer DEQUEUE/TAKE. This is a real production synchronization primitive.

However, the exact code inspected does not establish a reverse/upstream edge from MetadataLoader W1 to Processor ENQUEUE. W1 is a plain aclCache assignment on the MetadataLoader publisher path; Processor later calls ArrayBlockingQueue.put independently. Temporal W1 < ENQUEUE remains insufficient to prove happens-before.

We must NOT infer a W1→ENQUEUE edge from:
- System.nanoTime ordering;
- D0_RETURN;
- request construction;
- selector processing;
- startup authorizer future;
- successful D1 DENIED;
- mere thread scheduling.

## Current epistemic state
🟢 Exact ENQUEUE operation identified: ArrayBlockingQueue.put.
🟢 Exact Processor call site identified.
🟢 ENQUEUE→DEQUEUE synchronization boundary remains established.
🟢 W1 execution path identified separately on MetadataLoader publisher thread.
🔵 W1→ENQUEUE JMM happens-before: UNKNOWN.
🔵 D1 ordinary aclCache read visibility: UNKNOWN.
🔵 stale read after W1: UNKNOWN.
🔵 incorrect authorization consequence: UNKNOWN.
🔴 vulnerability/security conclusion: NOT_DECLARED.

## Next target
Audit the Selector/network receive publication path only for any pre-existing synchronization that could causally originate from MetadataLoader. If no such cross-path edge exists, preserve UNKNOWN and design the next witness around a naturally occurring race without W1-gating.

## Frozen constraints
AB105.116R unchanged. AB105.117R not created. TLC not rerun. PR #94 not merged. No artificial latch/volatile/future/barrier. No repeat of v2 without a new hypothesis.
