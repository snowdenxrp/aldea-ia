# NEXO CONTINUITY — AB105 G0 Ordering Audit — 2026-10-03

## Scope
Audit of PR #94 real-broker ordering witness at pinned Kafka `99b940733a9f6bc409457dba7108f08421d81e42`.

## New finding
The witness does **not causally force** the D1 request to occur after W1.

In the exact harness:
1. Test thread completes `admin.deleteAcls(...).all().get()` and records `D0_RETURN`.
2. It immediately calls `produce(producer)`.
3. `KafkaProducer.send()` uses the producer's own asynchronous/buffered path; the request later reaches the broker processor and `RequestChannel.sendRequest()`.
4. W1 is executed on the metadata-loader callback thread when `aclCache = aclCacheSnapshot` completes.
5. The harness does not observe W1 and then perform a synchronized handoff to the producer/request path. It only records timestamps.

Therefore an observed ordering such as:
`ACL_W1 timestamp < ENQUEUE timestamp`
is **temporal evidence only**, not a Java Memory Model happens-before edge from W1 to the request.

## Consequence
This is stronger than merely saying “JMM HB not proven”: the current harness itself contains no explicit causal dependency W1 -> D1 admission. It relies on the runtime schedule to produce W1-before-ENQUEUE.

That is acceptable for detecting an actual stale-read occurrence if one is observed, but it is insufficient to establish that the request was causally submitted after W1, and therefore insufficient to prove or disprove the W1 -> R1 visibility property.

## Existing source facts retained
- MetadataLoader callbacks run on its metadata-loader thread.
- RequestChannel uses ArrayBlockingQueue; ENQUEUE -> DEQUEUE provides normal queue publication.
- StandardAuthorizer's volatile outer `data` does not republish later plain `aclCache` mutations.
- `aclCache` itself is non-volatile and replaced with an immutable snapshot.

## Epistemic state
- 🟢 Exact PR #94 harness inspected.
- 🟢 W1 instrumentation is after the plain `aclCache` assignment.
- 🟢 D1 request path is asynchronous from the test's `Producer.send()`.
- 🔴 No causal W1 -> producer/request admission edge in the harness.
- UNKNOWN: whether a stale-read execution is legal/observable.
- UNKNOWN: W1 -> R1 vulnerability status.
- AB105.116R unchanged.
- AB105.117R not created.
- TLC not rerun.

## DO-NOT-REPEAT
Do not treat W1 timestamp < ENQUEUE timestamp as a happens-before proof. Do not add a latch/volatile/barrier solely to manufacture W1 -> D1 ordering.

## Next audit target
Trace the producer/client-to-broker processor path and identify any real synchronization that could accidentally provide the missing causal edge. Separately determine whether the experiment can observe a stale read without manufacturing synchronization.
