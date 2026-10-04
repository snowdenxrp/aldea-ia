# NEXO CONTINUITY — AB105 G0 Ordering Audit — 2026-10-03

## Scope
Audit of PR #94 real-broker ordering witness at pinned Kafka `99b940733a9f6bc409457dba7108f08421d81e42`.

## New finding — D0_RETURN does not establish W1
The Admin API is asynchronous. `KafkaFuture.get()` makes the client wait for completion of the Admin operation, but the API contract does not make that completion equivalent to `AclPublisher` having executed the local `StandardAuthorizerData.aclCache` replacement on the broker under test.

The Admin API documentation also warns that ACL changes may take time to be reflected by `describeAcls`. Therefore `deleteAcls(...).all().get()` must not be treated as proof that W1 (`aclCache = C2`) has already occurred.

The witness therefore has three distinct events:
1. `D0_RETURN`: Admin future completed.
2. `W1`: metadata-loader/AclPublisher path installs the new `aclCache` snapshot.
3. `ENQUEUE`: D1 request enters the broker RequestChannel.

Current evidence does not establish `D0_RETURN -> W1`, nor `D0_RETURN -> ENQUEUE` as the specific synchronization needed to infer `W1 -> ENQUEUE`.

## Existing harness finding
The exact PR #94 harness does:
1. `admin.deleteAcls(...).all().get()` and records `D0_RETURN`.
2. Immediately calls `produce(producer)`.
3. `KafkaProducer.send()` uses its asynchronous/buffered client path; the broker request later reaches `RequestChannel.sendRequest()`.
4. W1 is executed on the metadata-loader callback thread when the plain `aclCache` reference assignment completes.
5. The harness does not observe W1 and then perform a synchronized handoff to the producer/request path. It records timestamps only.

Therefore an observed ordering such as `W1 timestamp < ENQUEUE timestamp` is temporal evidence only, not a Java Memory Model happens-before edge from W1 to the request.

## JMM consequence
`ENQUEUE -> DEQUEUE` has the normal queue publication relationship. That can publish the request object/state to the request handler. It does not retroactively publish an unrelated `aclCache` mutation from the metadata-loader thread.

The missing edge remains `W1 -> request admission` (or another real synchronization that is demonstrably equivalent).

## Epistemic state
- 🟢 Exact PR #94 harness inspected.
- 🟢 W1 instrumentation is after the plain `aclCache` assignment.
- 🟢 D1 request path is asynchronous from the test's `Producer.send()`.
- 🟢 Admin API `get()` is an operation-completion wait, not documented as a guarantee that local authorizer ACL visibility has completed.
- 🟢 Kafka documents that ACL changes may take time to appear in `describeAcls`, reinforcing that Admin completion and local visibility are distinct concepts.
- 🔴 No causal `W1 -> producer/request admission` edge in the harness.
- 🔴 No demonstrated `D0_RETURN -> W1` edge that would close the gap indirectly.
- UNKNOWN: whether a stale-read execution is legal/observable on the pinned implementation.
- UNKNOWN: W1 -> R1 vulnerability status.
- AB105.116R unchanged.
- AB105.117R not created.
- TLC not rerun.

## DO-NOT-REPEAT
Do not treat `D0_RETURN` as W1. Do not treat `W1 timestamp < ENQUEUE timestamp` as happens-before. Do not add a latch/volatile/barrier solely to manufacture W1 -> D1 ordering.

## Next audit target
Trace the exact AdminClient/controller completion path on the pinned version and determine what event completes the Admin future. Then compare that completion point with the metadata-loader `AclPublisher` callback. Separately trace Producer.send -> broker processor -> RequestChannel ENQUEUE for any synchronization that could accidentally bridge the paths.
