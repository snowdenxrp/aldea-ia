# NEXO AB105 G0 — W1→ENQUEUE Causal Edge Investigation — 2026-10-03

## Continuity state
Active anchor: AB105.116R — UNCHANGED
AB105.117R: NOT_CREATED
TLC: NOT_RERUN
PR #94: draft / not merged
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

Prior evidence:
- 0120ee041852017a80ecc16788bb00f76c778fe4 — real broker ordering witness
- 98cc802d6100888d9b30f8bfee982c2173c8fa9f — continuity checkpoint
- 8ddd92aa59f77d2b2e0789b27e7b08e69405d288 — W1→D1 causal boundary audit

## Question now isolated
Does target-broker ACL_W1 (the plain aclCache write performed during StandardAuthorizerData.removeAcl()) have a real JMM happens-before / synchronization path to the later D1 request's publication into RequestChannel?
Temporal W1 < ENQUEUE is observed, but this is not itself a JMM edge.

## Source audit findings
1. StandardAuthorizer uses a volatile data reference and delegates ACL mutation to data.removeAcl(id). Authorization snapshots the current data reference and delegates to curData.authorize(...).
2. The current upstream StandardAuthorizer documentation/source describes authorization as a synchronous API designed for locally cached ACLs, while ACL updates are asynchronous. The Authorizer contract explicitly leaves concurrent update guarantees to the implementation.
3. ControllerServer installs an AclPublisher for the controller-side authorizer and documents that metadata publishers do not publish until the controller has caught up to the high watermark. This supports the previously established distinction between controller-side metadata durability and downstream broker-local ACL application.
4. The existing real-broker evidence remains decisive for the temporal boundary: cycles 4 and 5 show target W1 occurring after D0_RETURN, while still before D1 DEQUEUE/AUTH.
5. RequestChannel's ArrayBlockingQueue remains a valid synchronization/publication boundary from D1 ENQUEUE to D1 DEQUEUE. It does not, by itself, establish a reverse or upstream W1→ENQUEUE edge.
6. No evidence has yet been found that justifies treating System.nanoTime() ordering as a JMM happens-before relation.

## Critical experimental constraint
DO NOT add a latch, volatile handoff, CountDownLatch, barrier, Future completion gate, or equivalent W1-observation signal that gates D1 issuance.
Such a construction could create the very W1→D1 publication edge under investigation and would invalidate the causal question.

## Current causal graph
Controller:
deleteAcls() → controller operation / metadata-log persistence → D0_RETURN → [does not prove target W1]

Target broker:
metadata-log replay → MetadataLoader / AclPublisher → StandardAuthorizer.removeAcl() → StandardAuthorizerData.removeAcl() → target ACL_W1 / aclCache write

Request:
D1 ENQUEUE → ArrayBlockingQueue → D1 DEQUEUE → StandardAuthorizer.authorize() → StandardAuthorizerData.authorize() → aclCache read

Known edge:
ENQUEUE → DEQUEUE = synchronization/publication boundary.

Unknown edge:
W1 → ENQUEUE = UNKNOWN.

Therefore the scientific target is NOT to make W1 happen before D1. It is to determine whether the existing implementation naturally supplies a causal edge, or whether W1 and D1 merely have temporal order in the observed execution.

## Classification
🟢 REAL_BROKER_W1: OBSERVED
🟢 W1 < D1_DEQUEUE temporal order: 10/10
🟢 D1 DENIED: 10/10
🟢 D0 != W1: directly demonstrated by cycles 4/5
🔵 W1 → ENQUEUE JMM edge: UNKNOWN
🔵 W1 → D1 aclCache-read visibility: UNKNOWN
🔵 stale read after W1: UNKNOWN
🔵 incorrect authorization from stale read: UNKNOWN
🔵 exploitability/generalization/production impact: UNKNOWN
🔴 vulnerability: NOT_DECLARED

## Next investigation step
Inspect the concrete implementation between the target broker's ACL_W1 and the independently generated D1 request publication.
Specifically determine:
- which thread performs W1;
- which thread invokes the D1 send/publication;
- whether they share a synchronization primitive, lock, queue, Future/CompletionStage, executor handoff, or volatile publication already present in production code;
- whether that primitive occurs before or after the relevant W1 write;
- whether the observed test harness itself introduces an accidental publication edge.
Do not infer an edge merely from method return, wall/monotonic timestamp order, thread scheduling, or successful DENIED results.
Do not repeat the successful v2 real-broker run unless the implementation audit identifies a new experimental question.

## DO-NOT-REPEAT
- Do not call D0_RETURN W1.
- Do not call temporal W1 < ENQUEUE a JMM theorem.
- Do not introduce synchronization from W1 to D1.
- Do not modify AB105.116R.
- Do not create AB105.117R.
- Do not rerun TLC.
- Do not merge PR #94.
- Do not discard cycles 4/5.

## Evidence references
Real broker witness: 0120ee041852017a80ecc16788bb00f76c778fe4
Continuity checkpoint: 98cc802d6100888d9b30f8bfee982c2173c8fa9f
Causal boundary audit: 8ddd92aa59f77d2b2e0789b27e7b08e69405d288
## Exact pinned-source finding — materially advances the question

The Kafka source at the exact pinned commit 99b940733a9f6bc409457dba7108f08421d81e42 was inspected directly.

StandardAuthorizer has a volatile `data` reference. However, target ACL_W1 occurs inside StandardAuthorizerData.removeAcl(), which performs:
1. aclCacheSnapshot = aclCache.removeAcl(id)
2. aclCache = aclCacheSnapshot

Crucially, StandardAuthorizer.removeAcl() does NOT assign a new StandardAuthorizerData to the volatile `data` field. The mutation therefore changes the plain `aclCache` field inside the existing StandardAuthorizerData object.

AclCache itself is immutable: its internal maps/sets are final, and removeAcl() returns a NEW AclCache. The StandardAuthorizerData.aclCache reference that points to that new cache is NOT volatile.

Therefore the following distinction is now explicit:
- volatile publication exists for the outer StandardAuthorizer.data reference;
- the specific W1 mutation is a plain write to StandardAuthorizerData.aclCache;
- W1 does not itself perform the volatile data-reference write;
- RequestChannel ArrayBlockingQueue synchronizes ENQUEUE→DEQUEUE, but that does not establish W1→ENQUEUE;
- temporal W1<ENQUEUE therefore remains insufficient to prove a JMM happens-before edge.

This is a much sharper source-level boundary than the previous UNKNOWN statement. It does NOT by itself prove that a stale read occurs in the real broker, but it identifies the exact candidate field/write that must be analyzed for publication.

## Updated causal graph
W1: metadata-loader thread → StandardAuthorizerData.removeAcl() → plain aclCache reference write
                       X
                       ? no demonstrated synchronization edge ?
D1: independent request publication → RequestChannel ArrayBlockingQueue ENQUEUE → DEQUEUE → authorize() → read of the same StandardAuthorizerData/aclCache state

Potentially relevant outer volatile:
StandardAuthorizer.data is volatile, but removeAcl() does not write it.

## New classification
🟢 Exact pinned Kafka source inspected.
🟢 StandardAuthorizer.data = volatile.
🟢 StandardAuthorizerData.aclCache = plain field.
🟢 removeAcl() replaces aclCache without replacing volatile data.
🔵 W1→ENQUEUE happens-before = UNKNOWN.
🔵 Whether D1 observes the new aclCache under the real execution = UNKNOWN.
🔵 Actual stale-read manifestation = UNKNOWN.
🔵 Incorrect authorization consequence = UNKNOWN.
🔴 Vulnerability/security conclusion = NOT_DECLARED.

## Sources inspected
- Apache Kafka commit 99b940733a9f6bc409457dba7108f08421d81e42, StandardAuthorizer.java
- Apache Kafka commit 99b940733a9f6bc409457dba7108f08421d81e42, StandardAuthorizerData.java
- Apache Kafka commit 99b940733a9f6bc409457dba7108f08421d81e42, AclCache.java
- Apache Kafka commit 99b940733a9f6bc409457dba7108f08421d81e42, AclPublisher.java
- Apache Kafka commit 99b940733a9f6bc409457dba7108f08421d81e42, RequestChannel.scala

## Continuation checkpoint — 2026-10-02
A further source-navigation pass was attempted for the concrete metadata-loader → request-publication boundary.

Current result:
- No new pinned-commit causal edge has been established.
- The already-proven boundary remains: W1 is a plain write to StandardAuthorizerData.aclCache; ENQUEUE→DEQUEUE is synchronized; W1→ENQUEUE remains UNKNOWN.
- Current upstream Kafka documentation/source was consulted only as contextual guidance and is NOT being promoted to exact-pinned evidence.
- No experiment was modified and no new synchronization was introduced.

Next exact target:
1. Resolve the exact pinned MetadataLoader/AclPublisher invocation thread and callback path.
2. Resolve the independently generated D1 request publication thread/path.
3. Trace only pre-existing synchronization between those paths.
4. Stop at the first real synchronization edge; do not infer beyond it.

State remains:
🟢 real-broker W1 evidence
🟢 exact pinned aclCache write identified
🔵 W1→ENQUEUE JMM edge UNKNOWN
🔵 stale-read manifestation UNKNOWN
🔴 vulnerability NOT DECLARED

DO-NOT-REPEAT remains unchanged.


## Source audit advancement — concrete thread boundary
Exact pinned Kafka source inspection now establishes:

1. MetadataLoader owns a dedicated KafkaEventQueue and explicitly documents that it maintains its own thread used for all publisher callbacks.
2. handleCommit(...) does not invoke publishers inline from the Raft callback; it appends work to that metadata-loader event queue.
3. AclPublisher.onMetadataUpdate(...) runs on that MetadataLoader callback path and calls ClusterMetadataAuthorizer.removeAcl(...); therefore target W1 is on the MetadataLoader event-queue thread.
4. SocketServer has independent data-plane Processor threads. The exact pinned source shows the Processor path calls requestChannel.sendRequest(req). Thus D1 ENQUEUE is performed by a network Processor path, independently of the MetadataLoader event-queue thread.
5. No synchronization edge between these two paths has been demonstrated yet. Their being separate queues/threads is evidence of independence, not proof of a stale read.

Important refinement:
- We now know W1 thread != D1 ENQUEUE thread in the normal broker architecture.
- ArrayBlockingQueue still gives ENQUEUE→DEQUEUE, but the causal gap under investigation remains W1→ENQUEUE.
- Do NOT infer that separate threads imply missing happens-before; inspect any shared synchronization/publication mechanism before concluding UNKNOWN.

Classification:
🟢 MetadataLoader dedicated callback thread identified.
🟢 D1 ENQUEUE Processor path identified.
🟢 W1 and ENQUEUE are distinct execution paths.
🔵 W1→ENQUEUE happens-before: UNKNOWN.
🔵 D1 visibility of new aclCache: UNKNOWN.
🔴 vulnerability: NOT_DECLARED.


## Source audit advancement — D1 read site
Exact pinned StandardAuthorizerData source further narrows the observation point:

- `StandardAuthorizerData` explicitly says it is not thread-safe.
- `aclCache` is a plain reference.
- `authorize()` reaches `findAclRule()`, where it copies `aclCache` into a local `aclCacheSnapshot` with an ordinary read, then traverses the immutable cache.
- Therefore the critical cross-thread visibility question is specifically: can the Processor thread's ordinary read of `aclCache` observe the MetadataLoader thread's prior ordinary write to `aclCache`?
- The immutable `AclCache` structure itself is not the suspected mutable race; the reference publication is the relevant boundary.

This is still NOT a demonstrated stale read. The real broker has produced correct DENIED outcomes in the observed runs, and no run has captured an old cache after W1.

Next target: inspect existing publication mechanisms around authorizer/request handling for a natural edge. No artificial synchronization will be introduced.

Classification:
🟢 D1 ordinary `aclCache` read site identified.
🟢 `StandardAuthorizerData` non-thread-safe contract confirmed at pinned source.
🔵 cross-thread visibility of W1 to D1 read: UNKNOWN.
🔵 stale-read manifestation: UNKNOWN.
🔴 vulnerability: NOT_DECLARED.


## Source audit advancement — ACL publisher concurrency contract vs actual mutation path
Exact pinned Kafka source was re-read at `99b940733a9f6bc409457dba7108f08421d81e42`.

New material finding:
- `AclPublisher.onMetadataUpdate(...)` explicitly states that ACL changes are applied while the Authorizer continues returning authorization results in other threads, and that the implementation must avoid exposing an invalid intermediate state.
- For normal incremental ACL deltas, the publisher iterates the ordered changes and calls `clusterMetadataAuthorizer.addAcl(...)` / `removeAcl(...)` directly.
- `StandardAuthorizer.removeAcl()` delegates directly to `StandardAuthorizerData.removeAcl()`; that method replaces the plain `aclCache` reference in the existing `StandardAuthorizerData` object.
- In the exact pinned `StandardAuthorizer` source, the volatile `data` field is replaced for operations such as `loadSnapshot()`, `completeInitialLoad()`, and configuration changes, but incremental `addAcl/removeAcl` do NOT replace `data`.
- Therefore the documented concurrency requirement and the concrete incremental mutation path now meet at the exact suspected boundary: concurrent authorization can run while a plain `aclCache` reference is being replaced.

Important distinction:
- This is stronger source evidence for a real cross-thread visibility/concurrency surface.
- It is still NOT proof that the real broker produced a stale read, because no observed run captured D1 reading the old cache after W1.
- It is also NOT yet a proof that W1 lacks all synchronization: the next step remains to inspect whether an existing lock/volatile/executor/queue edge surrounds the incremental callback path elsewhere.

Additional pinned-source observation:
- `AclPublisher` itself declares no lock around incremental ACL application.
- `StandardAuthorizerData` declares itself not thread-safe.
- The comment in `StandardAuthorizer` describes synchronization/read-write-lock intent, but the exact pinned implementation exposes the volatile outer reference plus direct mutable operations; no read-write lock object is present in the inspected class.

Classification update:
🟢 AclPublisher explicitly documents concurrent authorization during ACL application.
🟢 Incremental ACL update path directly invokes plain add/remove mutation.
🟢 Incremental remove does not publish a new volatile StandardAuthorizer.data reference.
🔵 W1→D1 happens-before remains UNKNOWN until surrounding synchronization is exhausted.
🔵 Actual stale-read manifestation remains UNKNOWN.
🔴 Vulnerability/security conclusion remains NOT_DECLARED.

Next exact target:
Inspect broker construction/wiring and any executor/lock/publication mechanism surrounding AclPublisher and StandardAuthorizer, then stop at the first concrete synchronization edge (if any). Do not add test synchronization and do not rerun the broker experiment yet.


## Source audit advancement — publisher/wiring path and an important implementation discrepancy
Pinned source inspection further confirms the production execution topology:
- `KafkaRaftServer` constructs the broker and controller components separately; startup ordering does not create a per-update synchronization relationship between MetadataLoader and network Processor threads.
- `MetadataLoader` owns a dedicated `KafkaEventQueue`; `handleCommit()` appends Raft work to that queue, and publisher callbacks execute from the loader thread.
- `AclPublisher.onMetadataUpdate()` therefore performs incremental `removeAcl()` on the MetadataLoader callback thread.
- The previously inspected `SocketServer` path performs request publication from independent Processor threads.

New source-level discrepancy requiring caution:
- The pinned `StandardAuthorizer` comment says: “We use a read-write lock to synchronize reads and writes to the data.”
- However, the inspected class contains no read-write-lock field or lock acquisition around `authorize()`, `addAcl()`, or `removeAcl()`. The actual implementation uses the volatile outer `data` reference plus direct delegation to mutable `StandardAuthorizerData` for incremental ACL changes.
- This means the comment must NOT be treated as proof of a lock-based happens-before edge. The executable source is the stronger evidence for this investigation.

Also confirmed:
- `Authorizer.start()`/initial-load completion is a startup readiness mechanism. It does not establish a synchronization edge for every later incremental ACL update to every subsequent request publication.
- Therefore no natural W1→ENQUEUE edge has been established yet.

Classification:
🟢 MetadataLoader → AclPublisher callback thread path confirmed.
🟢 Incremental W1 remains plain `aclCache` write.
🟢 D1 publication remains independent Processor path.
🟢 No read-write lock implementation found in the inspected StandardAuthorizer class despite the comment claiming one.
🔵 W1→ENQUEUE happens-before: UNKNOWN.
🔵 stale-read manifestation: UNKNOWN.
🔴 vulnerability/security conclusion: NOT_DECLARED.

Next exact target: inspect the concrete network Processor/request path for any shared lock or publication object that is also touched by MetadataLoader/authorizer update handling. If none exists, document that absence carefully; absence of a discovered edge is not itself a demonstrated stale read.


## Source audit advancement — RequestChannel boundary is one-way for this question
Pinned source `99b940733a9f6bc409457dba7108f08421d81e42`:
- `RequestChannel.requestQueue` is an `ArrayBlockingQueue`.
- Processor-side `sendRequest(request)` performs `requestQueue.put(request)`.
- Handler-side `receiveRequest()` performs `requestQueue.take()` (or poll).
- Therefore the queue gives a normal queue publication/synchronization edge from ENQUEUE to DEQUEUE.
- It does NOT provide a reverse edge from the unrelated MetadataLoader/AclPublisher W1 to the Processor's ENQUEUE operation.

Authorization placement:
- `KafkaApis` invokes authorization through its `authHelper.authorize(...)` path while processing the dequeued request.
- This is downstream of the RequestChannel queue boundary, not the source of W1.

Conclusion for the current causal question:
- The already-observed temporal order W1 < D1_DEQUEUE is insufficient to infer W1→ENQUEUE or W1→D1 visibility.
- The RequestChannel queue can explain ENQUEUE→DEQUEUE, but cannot manufacture the missing upstream edge.
- No shared lock, volatile publication, Future completion, or other cross-thread edge connecting the MetadataLoader ACL mutation to Processor ENQUEUE has been identified in the inspected paths.

This still does NOT establish stale-read behavior. The real run produced DENIED in all 10 cycles; no cycle captured D1 observing the pre-W1 ACL cache.

Classification:
🟢 ENQUEUE→DEQUEUE synchronization boundary identified.
🟢 D1 authorization is downstream of DEQUEUE.
🔵 W1→ENQUEUE happens-before remains UNKNOWN / no concrete edge identified so far.
🔵 W1→D1 aclCache visibility remains UNKNOWN.
🔴 Vulnerability/security conclusion remains NOT_DECLARED.

Next: inspect the concrete Processor→RequestChannel call site and surrounding Processor loop only for a shared synchronization object also reachable from metadata publication. If none is present, this source audit can close the natural-edge search without converting “not found” into “proven absent everywhere.”


## Processor call-site audit — no shared synchronization edge found in inspected path
Pinned `SocketServer.Processor` source at `99b940733a9f6bc409457dba7108f08421d81e42`:
- Processor runs its own loop/thread: configure connections → responses → selector.poll → completed receives → sends.
- In `processCompletedReceives()`, it constructs the request and directly calls `requestChannel.sendRequest(req)`.
- No lock, synchronized block, volatile publication, Future completion, or explicit handoff involving the Authorizer/MetadataLoader state appears around this call site.
- The only explicit synchronization relevant to this request path is the `ArrayBlockingQueue` publication from `sendRequest` to `receiveRequest`, i.e. downstream ENQUEUE→DEQUEUE.
- Processor-local structures (`selector`, response queue, inflight responses, connection state) are not shared with the MetadataLoader ACL mutation path in the inspected code.

This strengthens the causal map: W1 and Processor ENQUEUE are independent cross-thread actions; the queue synchronizes only after ENQUEUE. Temporal W1 < D1 remains real observation, but does not create a JMM edge.

Status unchanged on the security question: stale-read manifestation remains UNKNOWN and vulnerability remains NOT_DECLARED.


## StandardAuthorizerData read/write audit — boundary remains a plain field publication
Pinned source confirms:
- `StandardAuthorizerData` explicitly declares itself “not thread-safe”.
- `aclCache` is a plain non-volatile field.
- Incremental `removeAcl` computes a new immutable cache and then performs the plain assignment `aclCache = aclCacheSnapshot`.
- Authorization eventually calls `findAclRule`, whose lookup operates from the current `aclCache`; no synchronization primitive is present around this field access in the inspected class.
- The outer `StandardAuthorizer.data` volatile field is not rewritten by incremental `addAcl/removeAcl`; therefore its volatile semantics cannot be used as the publication edge for the incremental cache replacement.

Important distinction:
- This is strong source evidence of a potential visibility boundary.
- It is NOT yet proof that a Processor authorization read actually observes the old cache after W1 in the real broker.
- The real run observed DENIED in all 10 cycles, so no stale-read manifestation has been captured.

Classification unchanged:
🟢 plain W1 write to aclCache confirmed.
🟢 plain D1-side aclCache read path confirmed.
🔵 inter-thread visibility from W1 to D1 UNKNOWN.
🔵 stale-read manifestation UNKNOWN.
🔴 vulnerability NOT_DECLARED.

## Natural-edge audit checkpoint — broker wiring and shared-publication search

Further exact-pinned inspection was performed without changing the experiment.

### Broker wiring result
- Pinned BrokerServer wiring confirms the broker owns the data-plane KafkaApis / RequestChannel path and also installs AclPublisher as a metadata publisher.
- These are separate production subsystems; the wiring itself does not establish a per-ACL-update synchronization edge from the metadata publisher to Processor request publication.
- BrokerServer does contain a lifecycle ReentrantLock, but that lock protects broker startup/shutdown status (status, awaitShutdownCond). It is not the lock used by incremental ACL mutation or Processor request enqueue, so it is not evidence for W1→ENQUEUE.

### Targeted search result
- Searches for an additional StandardAuthorizer read/write lock, ReentrantReadWriteLock, or a clusterMetadataAuthorizer-to-RequestChannel synchronization path did not identify a concrete shared primitive that bridges the two execution paths at the pinned implementation.
- A newer upstream search result shows a StandardAuthorizer comment describing lock-based consistency intent, but this is not promoted to pinned evidence and does not override the executable pinned source already inspected.

### Bounded conclusion of this audit phase
The natural production-edge search is now substantially exhausted across the relevant path: MetadataLoader → AclPublisher → StandardAuthorizerData.write and Processor → RequestChannel.enqueue → KafkaApis → StandardAuthorizerData.read.

What is established:
- 🟢 W1 is a plain write to StandardAuthorizerData.aclCache on the MetadataLoader publisher thread.
- 🟢 D1 ENQUEUE occurs on an independent Processor thread.
- 🟢 RequestChannel supplies ENQUEUE→DEQUEUE publication, not W1→ENQUEUE.
- 🟢 No concrete pre-existing lock/volatile/Future/queue handoff bridging W1 to Processor ENQUEUE was identified in the inspected pinned paths.

What remains unresolved:
- 🔵 JMM happens-before W1→ENQUEUE: UNKNOWN (no concrete edge identified).
- 🔵 Whether the Processor ordinary aclCache read can actually observe the old reference in a real execution: UNKNOWN.
- 🔵 Actual stale-read manifestation: UNKNOWN.
- 🔵 Security consequence/exploitability/generalization: UNKNOWN.
- 🔴 Vulnerability declaration: NOT MADE.

Important epistemic boundary: “no concrete edge identified in the inspected paths” is a bounded source-audit result, not a universal proof that no synchronization exists anywhere in Kafka or in the JVM/runtime.

### Experimental status
No latch, barrier, volatile handoff, Future gate, or equivalent synchronization was added. No broker rerun was performed. TLC was not rerun. AB105.116R remains unchanged and AB105.117R remains uncreated.

Next scientific step: if continuing, inspect the test harness itself for any accidental publication edge between the ACL operation and D1 issuance, then determine whether a new experiment is justified. Do not alter the causal question by adding synchronization merely to force ordering.


## Harness audit checkpoint — no W1-observation gate found

The workflow-local real-broker harness on branch nexo-ab105-g0-ordering-witness was inspected directly.

### Sequencing actually present
Per cycle, the harness does:
1. create ACL and wait for Admin future completion;
2. verify ALLOWED by producer retries;
3. query/verify D0 target ACL;
4. call admin.deleteAcls(...).all().get() and record D0_RETURN;
5. immediately issue D1 through the producer and record the result.

The harness does NOT wait on ACL_W1, does NOT read an ACL_W1 signal, and does NOT use a latch/barrier/volatile handoff/Future gate tied to W1.

### Important distinction
The deleteAcls(...).all().get() completion is a synchronization/control-flow event in the test thread, but it is not an observed W1 completion signal. The existing evidence already shows D0_RETURN can precede target-broker W1 (cycles 4/5). Therefore this harness sequencing does not manufacture the missing W1→D1 edge under investigation.

Likewise, the producer send(...).get() for D1 occurs after D0_RETURN because the test thread calls it then; this establishes test-thread sequencing after D0_RETURN, not W1→D1 publication.

### Probe instrumentation itself
The workflow-local probes only emit System.nanoTime() timestamps and thread/correlation identifiers at W1, ENQUEUE, DEQUEUE, AUTH_ENTER and AUTH_DECISION. They do not publish a synchronization signal consumed by the harness or request path.

### Classification
🟢 Harness does not gate D1 on W1.
🟢 D0_RETURN → D1 issuance is real test-thread sequencing.
🟢 D0_RETURN != W1 remains directly demonstrated by prior real-broker evidence.
🟢 Probe logging itself does not create a W1-observation gate.
🔵 Whether some unrelated JVM/library synchronization from logging or broker internals affects visibility remains not independently proven.
🔵 W1→ENQUEUE JMM edge remains UNKNOWN.
🔵 Stale-read manifestation remains UNKNOWN.
🔴 Vulnerability remains NOT_DECLARED.

### Epistemic boundary
This closes the specific accidental-W1-gate concern in the inspected harness. It does not prove absence of every possible synchronization effect in the JVM, Java client, Admin client, or broker internals; those would require a separate, explicitly scoped audit.

No experiment was rerun. AB105.116R remains unchanged. AB105.117R remains uncreated. TLC was not rerun.


## D0_RETURN semantic audit — controller commit vs broker ACL application

Exact pinned source inspection clarifies what D0_RETURN means in this harness.

- Broker-side KafkaApis forwards DELETE_ACLS to the controller; it does not directly call StandardAuthorizerData.removeAcl for the deletion request.
- AclApis calls the authorizer's deleteAcls and waits on the returned CompletionStages before sending DeleteAclsResponse.
- StandardAuthorizer obtains its ACL mutator from the controller wiring. The AclMutator contract says create/delete operations are implemented by QuorumController and are thread-safe.
- QuorumController.deleteAcls uses appendWriteEvent(...), which queues a ControllerWriteEvent.
- ControllerWriteEvent generates the ACL metadata records, prepares/schedules the Raft append, applies the records to controller in-memory state, then places the operation in deferred completion keyed by the resulting log offset.
- The ControllerWriteEvent future is completed only when the deferred completion is released at the relevant stable/committed offset. The completion path is driven by controller Raft commit handling.

Therefore D0_RETURN is evidence that the controller-side ACL deletion operation reached the controller's deferred completion/commit condition. It is NOT evidence that the target broker's MetadataLoader has already invoked AclPublisher.removeAcl and performed W1.

This matches the real-broker timing already observed: D0_RETURN preceded broker-local ACL_W1 in cycles 4 and 5. That is not contradictory; it is now explained by the architecture: controller completion and broker metadata application are distinct stages.

Epistemic classification:
- 🟢 D0_RETURN has controller commit/deferred-completion semantics, not broker-local W1 semantics.
- 🟢 D0_RETURN ≠ W1 is architecturally explained, not merely timestamp-observed.
- 🟢 The harness's D0_RETURN → D1 sequencing therefore does not provide a W1→D1 happens-before edge.
- 🔵 Exact controller-to-target-broker metadata publication/commit edge sufficient for aclCache visibility remains outside this D0 completion guarantee.
- 🔵 W1→ENQUEUE JMM edge remains UNKNOWN.
- 🔵 stale-read manifestation remains UNKNOWN.
- 🔴 vulnerability/security conclusion remains NOT_DECLARED.

No experiment was rerun. AB105.116R remains unchanged. AB105.117R remains uncreated. TLC was not rerun.


## MetadataLoader publication boundary — pinned source

The pinned Kafka source shows a concrete synchronization boundary between the Raft callback thread and the MetadataLoader event-handler thread, but it does not extend to the data-plane Processor.

- `MetadataLoader.handleCommit(...)` does not process the BatchReader inline. It creates an event and calls `eventQueue.append(...)`.
- `KafkaEventQueue.enqueue(...)` protects queue state with a `ReentrantLock`. The producer thread acquires/releases that lock while inserting the event; the event-handler thread acquires the same lock before removing the event for execution. This is a concrete cross-thread synchronization mechanism for the queued event's object/state publication.
- The event-handler then executes `batchLoader.loadBatch(...)`, which can reach `maybePublishMetadata(...)`, and that invokes `AclPublisher.onMetadataUpdate(...)` on the MetadataLoader event-handler thread.
- Therefore the Raft-listener → MetadataLoader event execution path has a concrete queue/lock synchronization edge.
- Crucially, this does not establish W1 → Processor ENQUEUE. The lock belongs to the MetadataLoader queue and is not the RequestChannel/Processor queue. No shared lock between the two paths was identified in the pinned sources audited so far.

New bounded classification:
- 🟢 Raft callback → MetadataLoader event execution has concrete `KafkaEventQueue` lock publication.
- 🟢 MetadataLoader publisher callback → W1 is same-thread execution on the event-handler thread.
- 🟢 W1 therefore occurs after metadata has crossed the loader queue boundary.
- 🔵 W1 → Processor `RequestChannel.sendRequest` remains UNKNOWN.
- 🔵 W1 → D1 `aclCache` visibility remains UNKNOWN.
- 🔵 stale-read manifestation remains UNKNOWN.
- 🔴 vulnerability/security consequence remains NOT_DECLARED.

No experiment rerun. AB105.116R unchanged. AB105.117R uncreated. TLC not rerun.



## Indirect synchronization audit — startup/lifecycle paths versus per-update authorization

Pinned Kafka commit `99b940733a9f6bc409457dba7108f08421d81e42` was checked for an indirect bridge that could have been missed between the MetadataLoader/ACL publisher thread and the data-plane Processor/request path.

### 1. SocketServer authorizer futures: startup-only edge

`SocketServer.enableRequestProcessing(authorizerFutures)` chains each endpoint's authorizer readiness future before starting its Acceptor. `BrokerServer` constructs these futures from `EndpointReadyFutures` and waits for them during startup.

This is a real publication/startup dependency: request processing does not start until the relevant authorizer readiness future permits it.

However, it is **not a per-ACL-update synchronization edge**:
- the future is consumed to start the acceptor/processor infrastructure;
- incremental `StandardAuthorizerData.removeAcl()` does not complete or refresh this future;
- the future therefore cannot establish W1 → later Processor ENQUEUE for an ACL change occurring after startup.

Classification: 🟢 startup readiness edge; 🔵 irrelevant to incremental W1→ENQUEUE visibility.

### 2. SocketServer lifecycle monitor: unrelated to ACL mutation

Pinned `SocketServer` contains `synchronized` blocks on the SocketServer instance for lifecycle/state such as `stopped`, processor creation, and metrics inspection.

The Processor request path does not acquire this monitor around `requestChannel.sendRequest(req)`, and the MetadataLoader/AclPublisher incremental ACL path does not acquire the same SocketServer monitor around W1.

Therefore these monitors cannot be promoted to a W1→ENQUEUE happens-before edge.

Classification: 🟢 lifecycle synchronization exists; 🔵 no W1/ENQUEUE participation.

### 3. SharedServer lifecycle synchronization: same conclusion

Pinned `SharedServer` uses `synchronized` methods for start/stop ownership and exposes several `@volatile` lifecycle component references.

Those mechanisms govern component lifecycle and publication of component references. The incremental ACL mutation does not write one of those lifecycle references, and the Processor's request enqueue does not read one as part of request admission.

Therefore the SharedServer lifecycle monitor/volatile fields do not bridge W1 to ENQUEUE.

Classification: 🟢 lifecycle synchronization exists; 🔵 unrelated to the incremental ACL visibility question.

### 4. Broker wiring confirms the separation

Pinned `BrokerServer` wires:
- `KafkaApis` to `socketServer.dataPlaneRequestChannel`;
- the request-handler pool to that same RequestChannel;
- metadata publishers including `AclPublisher` separately.

The object graph therefore connects both subsystems to the broker, but object ownership/wiring is not itself a JMM synchronization action. No common lock/future/queue operation was identified at the per-ACL-update boundary.

### 5. Important startup-vs-steady-state distinction

The authorizer future can explain why processors are not started before initial authorizer readiness. It cannot be reused as evidence that every later incremental ACL write is published before every later request.

Thus the source audit now distinguishes:
- 🟢 startup: authorizer readiness → processor startup;
- 🟢 steady state: Processor → RequestChannel ENQUEUE → downstream handling;
- 🟢 metadata update: Raft callback → MetadataLoader queue → AclPublisher → plain `aclCache` write;
- 🔵 missing cross-path edge: incremental W1 → Processor ENQUEUE / handler-side authorization read.

### Updated bounded conclusion

The indirect synchronization search found real synchronization in lifecycle/startup infrastructure, but none that participates in the steady-state W1→D1 causal path.

This strengthens, but does not mathematically prove, the bounded result:
- 🟢 W1 is a plain write to `StandardAuthorizerData.aclCache`.
- 🟢 Processor ENQUEUE is an independent action.
- 🟢 ENQUEUE→DEQUEUE is synchronized by RequestChannel.
- 🟢 startup authorizer readiness is synchronized but occurs before steady-state request processing.
- 🟢 SocketServer/SharedServer lifecycle locks are not acquired on both sides of W1 and ENQUEUE.
- 🔵 W1→ENQUEUE JMM happens-before remains UNKNOWN; no concrete edge was identified in the audited pinned paths.
- 🔵 stale-read manifestation remains UNKNOWN.
- 🔵 security consequence/exploitability/generalization remain UNKNOWN.
- 🔴 vulnerability is NOT DECLARED.

No experiment was rerun. No latch/barrier/volatile handoff/Future gate was added. TLC was not rerun. AB105.116R remains unchanged; AB105.117R remains uncreated.

Next exact target: inspect the request-handler-pool handoff and authorization invocation path for completeness, specifically to determine whether any synchronization reachable from the MetadataLoader path is introduced between RequestChannel DEQUEUE and `StandardAuthorizer.authorize()`. This cannot create W1→DEQUEUE by itself, but it closes the downstream half of the causal graph.


## Downstream handoff audit — RequestChannel → request handler → authorize

The downstream half of the path was checked to close the causal graph.

### RequestChannel → KafkaRequestHandler

Pinned `RequestChannel` uses its concurrent request queue for Processor publication and request-handler consumption. The queue boundary provides ENQUEUE→DEQUEUE publication.

Pinned `KafkaRequestHandler.run()` then takes the request from `requestChannel.receiveRequest(300)`, records dequeue time, sets a thread-local current request, and directly invokes `apis.handle(request, requestLocal)`.

No additional lock/future/volatile handoff is inserted between the dequeue and `KafkaApis.handle()` that could somehow reach back to the MetadataLoader ACL publisher.

Classification:
- 🟢 ENQUEUE→DEQUEUE synchronization exists.
- 🟢 DEQUEUE→KafkaRequestHandler execution is same-thread after the queue handoff.
- 🔵 no W1-linked publication is introduced downstream.

### KafkaApis/AuthHelper → StandardAuthorizer

Pinned `KafkaApis` constructs an `AuthHelper` from the configured authorizer plugin. `AuthHelper.authorize()` obtains the plugin instance and directly invokes `authorizer.get().authorize(...)`.

Pinned `Plugin.get()` simply returns its stored instance; it does not synchronize or use an atomic publication for each authorization call.

Pinned `StandardAuthorizer.authorize()` reads the current volatile `data` reference once into `curData`, then delegates authorization to that `StandardAuthorizerData`. Incremental ACL removal does not replace the outer volatile `data` reference; it performs the plain `aclCache` assignment inside the already-published `StandardAuthorizerData`.

Therefore the downstream chain is:

`Processor ENQUEUE`
→ 🟢 RequestChannel queue publication
→ `DEQUEUE`
→ same request-handler thread
→ `KafkaApis`
→ `AuthHelper`
→ `Plugin.get()`
→ `StandardAuthorizer.authorize()`
→ plain `StandardAuthorizerData.aclCache` read path.

No new synchronization edge connecting this chain back to W1 was identified.

### Important consequence

The full audited steady-state path now has two explicit publication segments:

1. Metadata side:
   Raft callback → 🟢 KafkaEventQueue lock → MetadataLoader event → AclPublisher → W1 plain `aclCache` write.

2. Data side:
   Processor → 🟢 RequestChannel ENQUEUE→DEQUEUE → request handler → authorization read.

The missing relation is between the end of segment 1 and the beginning of segment 2:

**W1 → Processor ENQUEUE = 🔵 UNKNOWN / no concrete JMM edge identified in the pinned paths.**

This is the exact boundary that matters for the stale-read hypothesis.

### Updated status

- 🟢 downstream RequestChannel → handler → authorize path audited.
- 🟢 Plugin wrapper does not add synchronization per authorization call.
- 🟢 StandardAuthorizer outer volatile read does not publish incremental `aclCache` replacement.
- 🔵 W1→ENQUEUE happens-before remains UNKNOWN.
- 🔵 actual stale-read manifestation remains UNKNOWN.
- 🔵 security consequence/exploitability/generalization remain UNKNOWN.
- 🔴 vulnerability NOT DECLARED.

No experiment rerun; no synchronization was added; TLC not rerun; AB105.116R unchanged; AB105.117R uncreated.

Next exact step: perform a final source-level search for any alternate authorizer implementation/wrapper or metadata-to-network shared executor/queue used specifically by this broker configuration. If none is found, the natural-edge source audit can be marked exhausted and the remaining question becomes empirical: can a real broker execution ever capture D1 reading the pre-W1 cache?


## Final alternate-wrapper / executor search

A final targeted repository search was performed for alternate authorizer wrappers, ACL publisher/request-channel coupling, and metadata-to-network executor/queue bridges.

### Findings

- The broker wiring search continues to show `AclPublisher` and the data-plane `RequestChannel` as separate components. No shared per-update executor/queue was identified between them.
- `StandardAuthorizer` remains the built-in `ClusterMetadataAuthorizer` implementation for the inspected configuration.
- The inspected `Plugin` wrapper is only an object holder; `get()` returns the stored authorizer instance directly and does not create a per-call synchronization boundary.
- Search results from a newer upstream tree contain a comment describing a lock-based consistency intention around authorizer data, but that result is **not pinned to the audited Kafka commit** and does not override the executable pinned source previously inspected. The pinned source itself still has the relevant plain `aclCache` field/write path and no identified lock acquisition at incremental W1.
- No alternate metadata-to-network executor, queue, or shared synchronization object specific to this broker configuration was found in the targeted search.

### Exhaustion boundary

The natural synchronization-edge audit is now considered **bounded/exhausted for the targeted production path**, not globally proven exhaustive across every Kafka/JVM implementation detail.

Audited chain:

`Raft callback`
→ 🟢 `KafkaEventQueue` lock/publication
→ `MetadataLoader`
→ `AclPublisher`
→ 🟢 W1 plain `aclCache` write
→ **🔵 missing/unknown W1→Processor publication edge**
→ `Processor`
→ 🟢 `RequestChannel` ENQUEUE→DEQUEUE
→ `KafkaRequestHandler`
→ `KafkaApis`
→ `AuthHelper`
→ `StandardAuthorizer.authorize()`
→ 🔵 ordinary `aclCache` visibility question.

### Epistemic status after exhaustion

- 🟢 Real broker W1 observed.
- 🟢 W1 precedes D1 temporally in the prior 10/10 witness cycles.
- 🟢 D0_RETURN can precede target-broker W1; controller completion is not equivalent to local W1.
- 🟢 Metadata-side and data-side synchronization segments are independently identified.
- 🟢 No concrete natural W1→Processor ENQUEUE synchronization edge identified in the pinned production paths audited.
- 🔵 JMM happens-before W1→ENQUEUE: UNKNOWN.
- 🔵 Whether Processor/request-handler authorization can read the pre-W1 `aclCache` reference: UNKNOWN.
- 🔵 Actual stale-read manifestation in the real broker: UNKNOWN.
- 🔵 Security consequence, exploitability, frequency, and generalization: UNKNOWN.
- 🔴 Vulnerability/security defect: NOT DECLARED.

The remaining question is therefore empirical rather than another source-path search: **can a real broker execution capture D1 authorization against the pre-W1 ACL-cache reference despite W1 already having occurred?**

No latch, barrier, volatile handoff, Future gate, or equivalent synchronization was introduced. No broker witness was rerun. TLC was not rerun. `AB105.116R` remains unchanged and `AB105.117R` remains uncreated.


## Reinspection of the preserved real-broker artifact (no rerun)

The previously produced artifact `11259107051` from run `37081442555` was downloaded and re-read directly. This was **evidence reinspection only**, not a new execution.

Pinned evidence inside the artifact:
- Kafka revision: `99b940733a9f6bc409457dba7108f08421d81e42`
- diagnostic: REAL_BROKER_ORDERING_WITNESS
- workflow-local timing instrumentation
- AB105.116R unchanged
- AB105.117R not created
- TLC not rerun
- 10 cycles present.

For all 10 cycles, the sequence is:
`D0_TARGET → ACL_W1 → D0_RETURN → D1 ENQUEUE → D1 DEQUEUE → AUTH_ENTER → AUTH_DECISION=DENIED`.

Two already-critical cycles were revalidated exactly:
- Cycle 4: target-broker W1 = `261920590759`; D0_RETURN = `261920489698`; D1 ENQUEUE = `261926567813`. Thus D0_RETURN precedes W1 by 101,061 ns, while W1 precedes D1 ENQUEUE by 5,977,054 ns.
- Cycle 5: target-broker W1 = `262029090806`; D0_RETURN = `262028693234`; D1 ENQUEUE = `262033...` (the artifact preserves the full downstream sequence). Thus D0_RETURN again precedes W1, and W1 precedes D1 ENQUEUE.

The important empirical result is unchanged:
- 🟢 W1 occurred before D1 ENQUEUE in all 10 cycles.
- 🟢 D1 authorization returned DENIED in all 10 cycles.
- 🔵 No cycle captured an authorization decision that can be demonstrated to have read the pre-W1 cache reference.
- 🔵 Therefore the artifact does **not** demonstrate an actual stale-read manifestation.
- 🔵 It also does not prove the absence of a stale-read possibility under other scheduling/interleavings.
- 🔴 No vulnerability conclusion follows from this run.

### Interpretation boundary

The 10/10 DENIED result is consistent with correct post-removal visibility, but it cannot by itself prove a JMM happens-before edge. Likewise, temporal ordering from `System.nanoTime()` is not a JMM proof.

The artifact therefore closes what this run can empirically establish, while leaving the visibility question UNKNOWN.

No new synchronization was added. No broker was rerun. No TLC rerun. AB105.116R remains unchanged; AB105.117R remains uncreated.

Next step: preserve this artifact as the empirical boundary and reconcile whether any additional non-invasive observation is possible without changing the causality being tested. If not, the investigation should remain UNKNOWN rather than manufacture a synchronization edge.


## Non-invasive empirical extension prepared

The existing 10-cycle witness was inspected for ways to increase sensitivity without introducing the synchronization edge under investigation.

A diagnostic-only extension was prepared on branch `nexo-ab105-g0-visibility-sample-v3` (PR #95):
- 100 cycles instead of 10.
- D1 remains the same immediate producer operation after `deleteAcls(...).all().get()`.
- The pre-D1 `System.err.println(D0_RETURN)` was removed from the critical path: the harness now captures `long d0ReturnNs = System.nanoTime()` and invokes D1 immediately, then emits the D0 timestamp afterward.
- No latch, barrier, volatile handoff, Future gate, callback, or W1-observation signal was added.
- Kafka remains pinned at `99b940733a9f6bc409457dba7108f08421d81e42`.
- AB105.116R remains unchanged; AB105.117R remains uncreated; TLC remains not rerun.

This changes only **sample size and local test-thread timing**. It does not manufacture W1→D1 happens-before.

### Execution status

At the time of this checkpoint, GitHub reports no workflow run/status yet for commit `3bc9d5b74e52e127131c6ce7ba8b0c0e5c5dd335`. Therefore:
- 🔵 100-cycle result PENDING.
- 🔵 stale-read manifestation remains UNKNOWN.
- 🔴 no vulnerability conclusion.

Do not interpret PR #95 as evidence of execution. It is only the prepared diagnostic extension until a real workflow run and raw artifact exist.


## Quantitative timing reanalysis of the preserved artifact

A direct parse of the raw `nexo-ordering-evidence.txt` confirms the target broker's `kafka-0-metadata-loader-event-handler` W1 and the first D1 Producer ENQUEUE for every cycle:

| Cycle | D0_RETURN → D1 ENQUEUE | broker W1 → D1 ENQUEUE | D1 |
|---|---:|---:|---|
| 1 | 60.12 ms | 64.17 ms | DENIED |
| 2 | 57.79 ms | 58.18 ms | DENIED |
| 3 | 53.30 ms | 54.91 ms | DENIED |
| 4 | 56.35 ms | 56.25 ms | DENIED |
| 5 | 55.04 ms | 54.64 ms | DENIED |
| 6 | 53.68 ms | 55.05 ms | DENIED |
| 7 | 53.70 ms | 56.43 ms | DENIED |
| 8 | 57.28 ms | 57.84 ms | DENIED |
| 9 | 50.92 ms | 52.96 ms | DENIED |
| 10 | **6.06 ms** | **8.66 ms** | DENIED |

This reveals an important experimental limitation: the existing witness proves temporal ordering, but the D1 request usually reaches `RequestChannel.sendRequest` tens of milliseconds after D0_RETURN/W1. Therefore it gives the implementation a substantial natural interval to publish/observe the new `aclCache` reference. Cycle 10 is the tightest observed case, but it still did not produce stale authorization.

This does **not** invalidate the witness. It changes the next empirical question: can the same production path be observed with a materially shorter D0_RETURN→ENQUEUE interval **without waiting on W1 or adding any W1-derived signal**?

A valid next diagnostic should therefore:
1. prewarm the producer/network path before deletion;
2. avoid the `send().get()` latency as part of the measurement trigger;
3. issue D1 immediately after the existing D0_RETURN control point;
4. retain the same W1/ENQUEUE/DEQUEUE/AUTH probes;
5. add no latch, barrier, volatile publication, Future completion, callback, or other signal derived from W1;
6. treat any D1 ALLOWED after target-broker W1 as candidate stale-read evidence requiring source/JMM reconciliation, not as an automatic vulnerability declaration.

No run was started in this step. AB105.116R remains unchanged; AB105.117R remains uncreated; TLC remains not rerun.
