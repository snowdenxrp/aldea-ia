# NEXO AB105 G0 — PR94 ↔ PR93 RequestChannel HB reconciliation
Date: 2026-10-04

## Canonical state
- Base checkpoint: 1a7912c2158da740b1978ebd6dfb3524fa770966
- AB105.116R: UNCHANGED
- AB105.117R: NOT CREATED
- TLC: NOT RERUN
- PR #94: DRAFT / workflow-local diagnostic
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## Question audited
Whether the observed temporal sequence
W1 → ENQUEUE → DEQUEUE → D1
creates a JMM happens-before edge that publishes the StandardAuthorizerData.aclCache mutation from W1 to D1.

## Source facts recovered

### W1
PR #94 instruments the pinned Kafka source at:
StandardAuthorizerData.removeAcl():
  AclCache aclCacheSnapshot = aclCache.removeAcl(id);
  aclCache = aclCacheSnapshot;
  NEXO_ORDER ACL_W1 ...

The W1 event is emitted by the thread executing the metadata ACL mutation.

### RequestChannel
At the same Kafka pin:
RequestChannel owns:
  private val requestQueue = new ArrayBlockingQueue[BaseRequest](queueSize)

sendRequest(request):
  requestQueue.put(request)

receiveRequest(timeout):
  requestQueue.poll(timeout, TimeUnit.MILLISECONDS)

Therefore the RequestChannel queue is a real concurrent publication mechanism. If a thread performs ordinary writes and then calls sendRequest/put, and another thread later receives the same queue element, the queue handoff can provide the corresponding JMM synchronization/visibility edge for actions sequenced before the put.

### Critical separation
PR #94 does NOT perform ENQUEUE from the W1 metadata thread.

The workflow-local W1 instrumentation is inside StandardAuthorizerData.removeAcl(), while ENQUEUE is instrumented inside RequestChannel.sendRequest(). A real client Produce request reaches sendRequest through the broker's network/request-processing path. The W1 log includes the metadata mutation thread name; ENQUEUE logs the thread executing sendRequest.

Thus the required first link for a transitive HB chain is missing:
  W1 write --po--> ENQUEUE

No program-order edge exists between two different threads merely because the events are timestamp-ordered.

### D1
KafkaRequestHandler.run() performs:
  val req = requestChannel.receiveRequest(300)
  ...
  case request: Request =>
      ...
      apis.handle(request, requestLocal)

So DEQUEUE → D1 has same-thread program order for the request-handler execution.

### Authorizer read
StandardAuthorizer.authorize() performs:
  StandardAuthorizerData curData = data;
  ...
  curData.authorize(...)

StandardAuthorizer.data is volatile, but removeAcl() does not assign a new StandardAuthorizer.data object. It mutates the existing StandardAuthorizerData by replacing its plain aclCache field.

StandardAuthorizerData.authorize()/findAclRule() then reads:
  AclCache aclCacheSnapshot = aclCache;

Therefore a RequestChannel ENQUEUE→DEQUEUE edge does not, by itself, publish the W1 aclCache write. It publishes actions sequenced before ENQUEUE on the ENQUEUE thread, not arbitrary actions performed earlier by the metadata thread.

## HB graph result

Potential queue edge:
  ENQUEUE --synchronizes-with--> DEQUEUE
  DEQUEUE --po--> D1

But the required edge:
  W1 --po--> ENQUEUE
is absent.

Therefore the transitive chain:
  W1 -> ENQUEUE -> DEQUEUE -> D1
cannot be promoted to JMM HB from the observed temporal ordering alone.

The current result is:

  HB(W1 → D1) = NOT IDENTIFIED / UNKNOWN

This is stronger than merely saying “timestamps are not HB”: the exact PR94 instrumentation reveals that W1 and ENQUEUE are executed in distinct execution domains, so RequestChannel publication cannot be used as the missing W1 publication edge.

## Important nuance
D0_RETURN occurs before the test issues the D1 Producer request, and the real-broker witness repeatedly observed W1 before the subsequent authorization decision. That is temporal/causal workflow ordering, not by itself a JMM publication proof from the metadata mutation to the request-handler thread.

A separate HB path could only change this result if source audit establishes a synchronization chain from the W1-producing metadata thread to the thread that executes ENQUEUE (or another synchronization edge directly carrying the W1 write). No such edge has been identified in the inspected PR93/PR94 paths.

## Evidence classification
🟢 Source fact: RequestChannel uses ArrayBlockingQueue put/poll.
🟢 Source fact: KafkaRequestHandler handles the dequeued Request on the request-handler thread.
🟢 Source fact: StandardAuthorizer.data is volatile; steady-state removeAcl mutates plain aclCache inside the existing data object.
🟢 Source fact: PR94 W1 and ENQUEUE instrumentation are in different execution domains.
🔵 Derived JMM conclusion: RequestChannel publication does not close W1→D1 because W1→ENQUEUE program order is absent.
🟡 Runtime temporal witness: W1→ENQUEUE→DEQUEUE→AUTH observed in prior PR94 runs; temporal ordering only.
🔴 Not established: stale-read execution, exploitability, security impact.

## DO-NOT-REPEAT
- Do not rerun PR92 cache-identity diagnostics.
- Do not rerun PR93 source/visibility audit.
- Do not rerun PR94 solely to establish this HB point.
- Do not add volatile/latch/barrier/future synchronization to manufacture W1→D1 HB.
- Do not rerun TLC.
- Do not create AB105.117R.

## Next frontier
Audit the remaining possible publication path between the metadata ACL mutation and the network/request thread that executes RequestChannel.sendRequest(), especially the metadata/controller response path surrounding D0_RETURN. The target is not another runtime race run; it is identification or elimination of a legitimate synchronization edge that could connect W1 to the ENQUEUE thread.
