# AB105 G0 exact RequestChannel ordering audit — 2026-10-02

Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`.

## Exact source

Directly fetched pinned Kafka source:

- `core/src/main/scala/kafka/network/RequestChannel.scala`
- `core/src/main/scala/kafka/server/KafkaRequestHandler.scala`
- `core/src/main/scala/kafka/server/KafkaApis.scala`

### RequestChannel

`requestQueue` is an `ArrayBlockingQueue[BaseRequest]`.

`sendRequest(request)` performs `requestQueue.put(request)`.

`receiveRequest(timeout)` performs `requestQueue.poll(timeout, TimeUnit.MILLISECONDS)`; the no-timeout form uses `take()`.

Therefore the queue hand-off is a real producer/consumer publication edge for the Request object.

### Request handler

`KafkaRequestHandler.run()` calls `requestChannel.receiveRequest(...)`, then for a normal Request executes:

`request.requestDequeueTimeNanos(...)` -> `threadCurrentRequest.set(request)` -> `apis.handle(request, requestLocal)`.

No RequestChannel lock is held around `apis.handle()`.

### KafkaApis

`KafkaApis.handle()` dispatches the request by API key and eventually reaches the API-specific authorization calls. The request handler does not re-enter RequestChannel synchronization before authorization.

## Ordering consequence

There are two distinct executions:

1. `ACL W1 -> request enqueue -> request dequeue -> authorize R1`

   RequestChannel publication can provide a happens-before chain for actions before enqueue, including W1 if W1 truly precedes enqueue.

2. `request enqueue/dequeue -> ACL W1 -> authorize R1`

   The RequestChannel edge cannot publish a later W1 to the already-consumed request thread.

Thus RequestChannel is not itself a closure of `W1 -> R1`.

## New methodological boundary

The exact source confirms that a real-broker ordering diagnostic must timestamp at least:

- ACL mutation completion at the target broker (W1 / local `removeAcl()` return);
- RequestChannel enqueue;
- RequestChannel dequeue;
- authorization entry / decision.

The ordering witness must preserve the existing authorization race and must not add a lock, volatile gate, latch, or await between W1 and R1.

A positive `W1 < enqueue < dequeue < R1` ordering would show that the request-channel HB is available for that request. It would not prove a stale read.

A `dequeue < W1 < R1` ordering would show that RequestChannel cannot explain visibility of W1 for that authorization.

The experiment must keep these ordering classes separate rather than treating all post-D0 RPCs as equivalent.

## Epistemic state

`REQUEST_CHANNEL_QUEUE = VERIFIED`
`QUEUE_HB_FOR_PRE_ENQUEUE_ACTIONS = VERIFIED`
`W1_TO_R1_GLOBAL_HB = NOT_IDENTIFIED`
`STALE_READ = UNKNOWN`
`STALE_ALLOWED = NOT_OBSERVED_IN_CURRENT_RUNS`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`

No AB105.116R modification. No AB105.117R. No TLC rerun. No merge.
