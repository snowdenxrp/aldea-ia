# NEXO AB105 — MASTER CONTINUITY — 2026-10-05

## Canonical project state
- Repository: snowdenxrp/aldea-ia
- Master branch: main
- Exact Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
- AB105 authoritative witness: run 37098764557 / job 111133973894 / artifact 11265332252
- Artifact SHA-256: d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c
- W1→D1 JMM happens-before: UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge: NOT IDENTIFIED
- stale ACL read: NOT OBSERVED / NOT DISPROVEN
- vulnerability: NOT ESTABLISHED
- W1→R1: UNKNOWN
- TLC: NOT_RERUN

## New finding — immutable AclCache boundary
Exact pinned AclCache.java was inspected at 99b9407.

Confirmed:
- AclCache is immutable.
- aclsByResource and aclsById are final.
- addAcl/removeAcl construct and return a new AclCache.
- Existing AclCache instances are not mutated in place.
- This gives strong snapshot structural consistency.

Critical distinction:
- StandardAuthorizerData.aclCache itself is a plain reference.
- Incremental addAcl/removeAcl assign the new immutable AclCache to that plain reference.
- The immutable object's final fields do not themselves establish publication of the new aclCache reference to another thread.
- Therefore immutable/persistent structure solves snapshot coherence, but does not by itself establish W1→D1 JMM happens-before.

## PCollections 4.0.2 publication audit
Kafka pins PCollections 4.0.2.

A version-labelled upstream-source mirror was inspected for the PCollections implementation. It identifies the dependency as 4.0.2 and exposes the relevant implementation classes.

Confirmed in the inspected implementation:
- HashPMap stores its backing PMap and size in final fields.
- HashPMap.plus/minus construct new HashPMap instances; they do not mutate the existing map.
- HashTreePMap uses a static final EMPTY instance and delegates to HashPMap; no lock/volatile/atomic/future publication primitive was identified in the class.
- TreePSet stores its tree, comparator and direction in final fields.
- TreePSet.plus/minus produce a new TreePSet through withTree(); no lock/volatile/atomic/future publication primitive was identified in the class.
- KVTree uses final fields for height, size, left, key, value and right; node construction creates new immutable tree nodes.
- IntTree likewise uses final node fields and creates new nodes for updates.
- No explicit synchronization/publication mechanism was identified in these relevant PCollections classes.

Epistemic interpretation:
- 🟢 Persistent/immutable structure confirmed.
- 🟢 Structural snapshot coherence strengthened.
- 🔴 No PCollections-level W1→D1 publication/HB mechanism identified.
- This does NOT prove that no HB exists elsewhere in the Kafka execution path.
- It only closes the hypothesis that the PCollections primitives themselves provide the missing publication bridge.
- Final-field safe initialization of newly constructed immutable objects is not equivalent to publication of Kafka's plain StandardAuthorizerData.aclCache reference.

Evidence qualification:
- The inspected source mirror explicitly identifies the dependency as org.pcollections:pcollections:4.0.2.
- This is source evidence for the 4.0.2 implementation, not a Maven artifact checksum. Do not silently upgrade this to artifact-byte identity.
- Maven metadata independently confirms 4.0.2 exists and was released in March 2024.

## Current model
AclPublisher thread:
  W1 -> StandardAuthorizerData.removeAcl()
     -> aclCache = new immutable AclCache

Request thread:
  StandardAuthorizer.authorize()
     -> volatile read of outer data
     -> same StandardAuthorizerData
     -> plain read of aclCache

Important:
- Incremental removeAcl/addAcl do NOT replace outer volatile StandardAuthorizer.data.
- loadSnapshot/copyWithNewAcls DOES replace outer data and therefore has a volatile publication edge.
- Do not generalize the snapshot-replacement publication edge to incremental ACL updates.

## Historical/design reconciliation
KAFKA-14214 (6c6b8e2) explicitly used ReentrantReadWriteLock around ACL updates and authorization.
KAFKA-14828 (df137752542c005c6998c37c03222ffbeca0f349) removed the R/W lock in favor of persistent immutable structures and per-read snapshots.
No inspected PR discussion, exact pinned implementation, or post-merge change identified an explicit per-update JMM publication guarantee for incremental aclCache replacement.

## Closed / do-not-repeat
- Do not rerun 117R.
- Do not rerun G0/PR92/PR93/PR94.
- Do not rerun TLC merely because the source audit continues.
- Do not add artificial volatile/latch/barrier/Future synchronization.
- Do not repeat the already-covered D1 snapshot structural probe.
- Do not use D0_RETURN as a proxy for W1.
- Do not treat temporal ordering as JMM happens-before.
- Do not repeat the PCollections wrapper audit unless a genuinely new dependency/version/source discrepancy appears.

## Next frontier
The PCollections primitive hypothesis is now closed at the implementation level: no publication primitive was identified in the relevant persistent structures.

The remaining source-audit frontier is outside the collection itself:
- determine whether any Kafka-level publication/admission mechanism connects the metadata-loader W1 update to the request-serving authorization read;
- otherwise preserve W1→D1 HB as UNKNOWN / NOT IDENTIFIED.

## Continuity rule
No finding, contradiction, failed attempt, epistemic state, or do-not-repeat decision is silently discarded or replaced.


## 2026-10-05 — diagnostic cache-observation frontier

The source audit is now exhausted for the concrete G0 authorizer path. The remaining empirical question is whether D1 actually reads a pre- or post-removal immutable AclCache snapshot.

Exact pinned source confirms that `findAclRule()` performs `AclCache aclCacheSnapshot = aclCache` and then uses that same local snapshot for both ACL scans. A diagnostic immediately after that local read can therefore observe the exact cache object used by D1 without changing authorizer state.

Safe diagnostic requirements:
- observe only the already-selected local `aclCacheSnapshot`;
- identify the target ACL structurally, with no W1-shared variable;
- record cache identity/count/membership only after the snapshot read;
- keep W1 and D1 observation sinks separate; do not reuse shared `System.err`;
- do not introduce volatile/latch/barrier/Future synchronization;
- preserve AB105.117R unchanged as baseline;
- treat the run as diagnostic evidence, not JMM proof.

Classification:
- POST_W1_CACHE: D1 snapshot lacks the target ACL.
- PRE_W1_CACHE: D1 snapshot still contains the target ACL, with independent evidence W1 preceded D1.
- AMBIGUOUS: cycle/target cannot be uniquely correlated.

Current state remains:
- W1→D1 HB = UNKNOWN / NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- AB105.116R unchanged
- AB105.117R not recreated
- TLC not rerun

Next action: build and validate one isolated workflow-local diagnostic probe, then execute only after its instrumentation path has been audited for absence of an artificial W1→D1 synchronization edge.


## 2026-10-05 — isolated cache-probe prepared (PR #97)

A new draft-only workflow was prepared on branch `nexo-ab105-g0-cache-probe` / PR #97.

Design:
- recovers the existing G0 harness from the prior witness branch without modifying the baseline harness;
- pins Kafka exactly to `99b940733a9f6bc409457dba7108f08421d81e42`;
- observes D1 immediately after `AclCache aclCacheSnapshot = aclCache`;
- tests exact target ACL membership in that same immutable snapshot;
- records cache identity/count/membership in a D1-only file sink;
- records W1 completion in a separate W1-only file sink;
- adds no volatile/latch/barrier/Future/lock synchronization;
- leaves AB105.116R untouched, does not recreate AB105.117R, and does not rerun TLC.

Audit status:
- PR #97 is DRAFT and not merged.
- No diagnostic runtime execution has been accepted as evidence yet.
- Static safety review caught and corrected an initial workflow-source checkout mistake; current workflow fetches the baseline harness from the Nexo repository branch, not the Apache Kafka clone.
- Current epistemic state remains unchanged: HB UNKNOWN, stale read NOT OBSERVED/NOT DISPROVEN, vulnerability NOT ESTABLISHED.

Next action: run the workflow only after reviewing the final generated probe/source diff; any resulting artifact must be independently reconciled before changing epistemic state.


Probe preparation correction: PR #97 workflow source-recovery now uses the Actions workspace path from `GITHUB_WORKSPACE` when reading the existing Nexo witness branch. This removes the prior mistake of attempting to resolve the Nexo branch from the Apache Kafka clone's `origin`. Latest probe branch head: `1c8b2e3483212541d052c1589d18cc8bcd7722c9`. Still not executed; epistemic state unchanged.


## 2026-10-05 — Kafka publication/admission audit: MetadataLoader → AclPublisher → request authorization

Exact pinned Kafka source at 99b940733a9f6bc409457dba7108f08421d81e42 was inspected beyond PCollections.

### 🟢 Confirmed Kafka-side serialization boundary
MetadataLoader owns a dedicated KafkaEventQueue and its documented contract states that it uses its own thread for all callbacks into metadata publishers. maybePublishMetadata() iterates the installed publishers on that loader event-queue thread.

AclPublisher.onMetadataUpdate() therefore executes W1 on the MetadataLoader publisher thread. For incremental ACL deltas it calls clusterMetadataAuthorizer.addAcl()/removeAcl() in LinkedHashMap order.

This establishes serialization/order within the MetadataLoader publisher path.

### 🟢 Important admission distinction
The same exact source shows that the authorizer startup gate is separate:
- StandardAuthorizer.start() returns initialLoadFuture for non-early-start listeners.
- AclPublisher.completeInitialLoad() completes that future only after the loader has caught up to local high watermark and processed an update.
- ControllerServer waits for the authorizer futures before enabling request processing.

Therefore Kafka has a real publication/admission mechanism for initial authorization readiness.

### 🔴 Critical steady-state result
That startup future is not a per-ACL-update publication mechanism.

After initial load:
- AclPublisher continues to call incremental addAcl/removeAcl.
- StandardAuthorizerData.aclCache remains a plain reference.
- StandardAuthorizer.authorize() reads the volatile outer data reference, then invokes authorization on that same StandardAuthorizerData.
- The incremental ACL update does not replace the outer volatile data reference.
- There is no inspected Kafka-level admission gate between an incremental AclPublisher callback and a later request-thread authorization read.

### 🟢 Strong source evidence from AclPublisher itself
The exact pinned AclPublisher comment explicitly describes the intended situation as ACL changes being applied while the Authorizer continues returning authorization results in other threads. The implementation performs incremental updates directly; it does not acquire a lock around the authorizer/read path.

This is important because it rules out an easy interpretation that MetadataLoader serialization itself means request authorization is serialized behind W1.

### Current interpretation
The Kafka-level audit closes another candidate:
- 🟢 MetadataLoader serializes publisher callbacks.
- 🟢 Initial-load readiness has a real future/admission edge.
- 🔴 No per-incremental-ACL Kafka publication/admission edge from W1 to D1 has been identified.
- 🔴 MetadataLoader thread serialization cannot by itself be promoted to W1→D1 JMM happens-before.
- 🟡 W1→D1 HB remains UNKNOWN / NOT IDENTIFIED because an independent JVM/Kafka synchronization edge elsewhere has not been proven absent.
- 🟡 stale read remains NOT OBSERVED / NOT DISPROVEN.
- 🔴 vulnerability remains NOT ESTABLISHED.

### Do-not-repeat refinement
Do not repeat a generic search for “MetadataLoader has an event queue.” The relevant boundary is now documented precisely: publisher callbacks are serialized on the loader thread, while steady-state authorization executes concurrently outside that publisher serialization domain.

### Next frontier
Search only for a concrete cross-thread bridge after W1:
1. a Kafka request-processing admission/readiness mechanism that is invoked on every ACL delta, or
2. a shared synchronization/publication primitive between MetadataLoader/AclPublisher and the request-serving path.

If neither exists, the diagnostic cache-snapshot probe in PR #97 remains the next empirical discriminator, without treating its timing result as JMM proof.


## 2026-10-05 — startup admission gate fully separated from steady-state ACL updates

Exact pinned BrokerServer/ControllerServer source was checked after the MetadataLoader audit.

- 🟢 BrokerServer waits for initial broker metadata publication, then builds authorizer readiness futures and calls SocketServer.enableRequestProcessing(authorizerFutures). Each endpoint starts only after its matching authorizer future completes.
- 🟢 ControllerServer has the analogous endpoint readiness gate. Its source explicitly states that non-superuser requests cannot be processed until AclPublisher has published metadata after controller catch-up.
- 🔴 These are startup/endpoint-enablement mechanisms. They do not run on every subsequent ACL delta and therefore cannot supply W1→D1 HB for steady-state addAcl/removeAcl.
- 🟢 After endpoints are enabled, AclPublisher remains on the MetadataLoader event thread while request handling uses the independent request handler path. No per-delta rendezvous was identified in these server startup paths.

Result: the candidate Kafka-level admission mechanism is now narrowed to initial startup only and is excluded as the steady-state W1→D1 publication bridge.

State unchanged: W1→D1 HB UNKNOWN / NOT IDENTIFIED; stale read NOT OBSERVED / NOT DISPROVEN; vulnerability NOT ESTABLISHED; AB105.116R protected; AB105.117R not created; TLC not rerun.

Next frontier: inspect the concrete SocketServer/request-handler handoff only for a synchronization edge that could somehow reconnect to the MetadataLoader publisher state after startup. Do not infer HB from mere queue ordering or endpoint readiness.


## 2026-10-05 — SocketServer / RequestChannel / KafkaRequestHandler handoff audit

Exact pinned Kafka source at 99b940733a9f6bc409457dba7108f08421d81e42 was inspected for the concrete request handoff, specifically looking for a synchronization edge that could reconnect steady-state W1 to D1.

### 🟢 Confirmed network-to-handler publication edge
- SocketServer Processor constructs/receives a request and calls RequestChannel.sendRequest(req).
- RequestChannel stores requests in a java.util.concurrent.ArrayBlockingQueue.
- KafkaRequestHandler receives through RequestChannel.receiveRequest(300), which polls the same request queue.
- Therefore the queue handoff can publish Processor-side actions before enqueue to the handler that dequeues the request, subject to the queue's established concurrent-queue synchronization semantics.

### 🔴 Critical boundary
This publication edge begins at the Processor/request-enqueue side. It does NOT begin at MetadataLoader/AclPublisher W1.

The inspected path is:
  network Processor -> ArrayBlockingQueue.put/enqueue -> KafkaRequestHandler receive/poll -> KafkaApis -> authorization

There is no ACL-update operation on this queue handoff, and no inspected code connects an incremental AclPublisher addAcl/removeAcl to requestQueue.put(). Therefore queue HB cannot be extended backward from D1 to W1 merely because W1 happened earlier in wall-clock time.

### 🟢 Handler synchronization found, but unrelated to W1
KafkaRequestHandlerPool uses AtomicInteger counters for metrics/thread counts and KafkaRequestHandler has a volatile stopped flag plus shutdown CountDownLatch. These primitives govern handler lifecycle/metrics/shutdown. They are not causally linked to each incremental ACL update and therefore do not establish W1→D1 publication.

### 🟢 Startup gate remains startup-only
SocketServer.enableRequestProcessing(authorizerFutures) uses CompletableFuture readiness to start acceptors/processors after initial authorizer readiness. This is endpoint startup admission, not a per-ACL-delta rendezvous. Once processing is enabled, requests continue through the independent Processor → RequestChannel → Handler path.

### Current conclusion
- 🟢 Processor → RequestChannel → Handler is a real cross-thread publication boundary for request state.
- 🔴 It does not provide MetadataLoader/AclPublisher W1 → RequestChannel publication.
- 🔴 No steady-state W1 → Processor/admission bridge was identified in this frontier.
- 🟡 W1→D1 JMM happens-before remains UNKNOWN / NOT IDENTIFIED.
- 🟡 stale ACL read remains NOT OBSERVED / NOT DISPROVEN.
- 🔴 vulnerability remains NOT ESTABLISHED.

### Do-not-repeat refinement
Do not treat RequestChannel/ArrayBlockingQueue ordering as a W1→D1 bridge. The exact queue HB starts with actions sequenced before enqueue by the Processor thread; it does not retroactively publish unrelated MetadataLoader/AclPublisher writes.

### Next frontier
The remaining source audit is narrowed further: inspect only any concrete code that could make an incremental ACL update directly trigger, gate, or synchronize with the Processor/request admission path. If none exists, preserve UNKNOWN and use the isolated PR #97 cache-snapshot diagnostic as the empirical discriminator, without calling timing evidence a JMM proof.


## 2026-10-05 — AclPublisher concurrent-read contract and exact cache publication gap

Exact pinned Kafka source at 99b940733a9f6bc409457dba7108f08421d81e42 was re-read at the concrete implementation level.

### 🟢 AclPublisher explicitly acknowledges concurrent authorization
AclPublisher.onMetadataUpdate() contains an explicit invariant: ACL changes are applied while the Authorizer continues returning authorization results in other threads. Incremental deltas are applied by iterating the LinkedHashMap changes in performed order and calling addAcl/removeAcl sequentially.

This confirms the intended ordering constraint is within the publisher/update sequence. It does not itself provide a cross-thread publication edge to request authorization.

### 🔴 Exact steady-state cache write/read remains a plain-reference boundary
StandardAuthorizerData is explicitly documented as not thread-safe. Its aclCache field is a plain reference. Incremental addAcl and removeAcl replace that field with the result of persistent-cache operations.

D1 authorization does:
- volatile read of outer StandardAuthorizer.data;
- then reads that selected StandardAuthorizerData's plain aclCache inside findAclRule().

Incremental addAcl/removeAcl do not replace the outer volatile data reference. Therefore the already-identified outer volatile read is not a per-delta publication bridge for the inner aclCache write.

### ⚠️ Source-comment discrepancy recorded, not interpreted as a fix
StandardAuthorizer's data field comment describes a read-write lock protecting ACL data, but the inspected pinned implementation contains no such lock around incremental addAcl/removeAcl. StandardAuthorizerData itself says it is not thread-safe. This discrepancy is recorded as source evidence; it is not treated as proof of a bug beyond the already-known JMM gap.

### Epistemic state
- W1 → D1 JMM HB: UNKNOWN / NOT IDENTIFIED
- W1 → ENQUEUE publication edge: NOT IDENTIFIED
- stale ACL read: NOT OBSERVED / NOT DISPROVEN
- vulnerability: NOT ESTABLISHED
- W1 → R1: UNKNOWN
- TLC: NOT_RERUN

### Next frontier
Do not broaden the search generically. Inspect only concrete paths where an incremental ACL update could directly trigger, gate, or synchronize Processor/request admission. If no such path exists, the source audit has reached its remaining boundary and PR #97 can be independently audited as an empirical discriminator only; its timing/cache observations must not be promoted to JMM proof.


## 2026-10-05 — MetadataLoader callback boundary: W1 remains inside loader event domain

Exact pinned MetadataLoader source was inspected at 99b940733a9f6bc409457dba7108f08421d81e42.

- 🟢 handleCommit() appends the metadata-processing callback to MetadataLoader's dedicated eventQueue.
- 🟢 maybePublishMetadata() invokes each MetadataPublisher, including AclPublisher, from that event-queue callback. Therefore W1 executes inside the MetadataLoader event-queue thread/domain.
- 🟢 After publisher callbacks return, the inspected code continues with metadata metrics/version bookkeeping and related loader work; no request-processing admission, Processor enqueue, RequestChannel operation, latch, future, lock, or other cross-thread request signal was identified at that boundary.
- 🔴 Consequently, MetadataLoader event-queue serialization establishes ordering among loader/publisher callbacks, but does not by itself establish W1→D1 JMM happens-before.

This closes the specific hypothesis that the code immediately surrounding maybePublishMetadata() implicitly hands W1 into request processing.

State unchanged:
- W1→D1 HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- W1→R1 = UNKNOWN
- TLC = NOT_RERUN

Next frontier: inspect only a concrete indirect bridge from the end of the MetadataLoader publisher callback to request admission. If none exists, stop expanding the source search and independently audit PR #97's final generated probe before any execution.


## 2026-10-05 — PR #97 cycle-correlation audit: UUID identity is available inside AclCache, but not yet exposed by the probe

Exact pinned Kafka `AclCache.java` was inspected at `99b940733a9f6bc409457dba7108f08421d81e42` to determine whether the cache diagnostic can correlate W1 and D1 to the same ACL cycle without introducing W1→D1 synchronization.

### 🟢 Structural identity finding
- `AclCache` keeps a final immutable `aclsById` map keyed by `Uuid`, in addition to `aclsByResource`.
- `addAcl(Uuid id, StandardAcl acl)` inserts the ACL under that UUID and `removeAcl(Uuid id)` removes exactly that UUID.
- `getAcl(Uuid id)` reads the UUID-indexed immutable map from the selected cache snapshot.
- `StandardAcl` itself does not contain the UUID; the UUID is metadata identity stored by `AclCache`.

### 🔴 Limitation in the current PR #97 probe
The current D1 diagnostic checks structural target membership/count/cache identity, while W1 logs the removal UUID. Because D1 does not currently expose the UUID associated with the target ACL, the two logs cannot be guaranteed to identify the same ACL cycle solely from their own records. Repeated create/delete cycles therefore leave a genuine correlation ambiguity.

This reinforces the previous decision: a timestamp-near W1/D1 pairing is not sufficient to promote a `PRE_W1_CACHE` observation to a uniquely correlated cycle or to JMM proof.

### 🟢 Possible diagnostic improvement — no synchronization edge required in principle
A workflow-local diagnostic could expose, from the already-selected immutable D1 `AclCache` snapshot, the UUID associated with the exact structural target ACL. The probe could then compare that UUID with the W1 removal UUID after the run.

If implemented only as a read-only inspection of the already-selected snapshot:
- it does not require a shared W1/D1 variable;
- it does not require volatile/latch/barrier/Future/lock synchronization;
- it does not publish W1 state to D1;
- it would improve cycle identity independently of timing.

However, adding such a helper is still instrumentation and can perturb execution. It must therefore remain diagnostic evidence, not a JMM proof, and its generated diff must be audited before execution.

### Epistemic state unchanged
- W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- W1→R1 = UNKNOWN
- TLC = NOT_RERUN

### Do-not-repeat refinement
Do not treat cache identity, count, timestamp proximity, or structural membership alone as a unique cycle identifier. Do not execute PR #97 until the final probe correlation limitation is either explicitly accepted or replaced by an independently audited identity mechanism.

### Next action
Audit the smallest possible UUID-correlation instrumentation against the exact generated PR #97 source. Prefer a read-only operation on the same D1 snapshot and reject any design that introduces a cross-thread publication edge.


## 2026-10-05 — UUID-correlation implementation audit: current probe cannot read AclCache identity index

The final PR #97 workflow was inspected directly before any execution.

### 🟢 What is available
The exact pinned `AclCache` contains the UUID-indexed `aclsById` map and a package-private `getAcl(Uuid id)` accessor. W1 already has the removal UUID.

### 🔴 Concrete implementation limitation
The current PR #97 D1 instrumentation runs inside `StandardAuthorizerData`, but it only receives the selected `AclCache` and does not know the W1 UUID. The UUID index is private inside `AclCache`; there is no existing read-only API that enumerates the UUID together with the matching `StandardAcl`.

Therefore the previously suggested UUID correlation is not a one-line probe change. It would require additional instrumentation (for example, a package-local diagnostic-only lookup in `AclCache`) or another independently audited mechanism.

### 🟡 Instrumentation consequence
Adding such a lookup would not inherently create W1→D1 synchronization if it only scans the already-selected immutable snapshot and returns the UUID corresponding to the exact target ACL. Nevertheless, it changes the pinned source during the diagnostic and must be audited as instrumentation. It cannot be treated as part of the production memory model.

The current PR #97 remains **not ready to execute as uniquely correlated evidence**. Its existing timestamp/cache observations remain useful only as diagnostic observations with an explicit correlation limitation.

### Additional probe limitation retained
The current safety grep only examines source lines containing `NEXO_CACHE`. It therefore does not constitute a proof that library calls such as `Files.writeString` have no internal synchronization. The file sinks are instrumentation and can perturb scheduling even if they do not establish a direct W1→D1 happens-before edge in this test design.

### State unchanged
- W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- W1→R1 = UNKNOWN
- TLC = NOT_RERUN

### Next action
Do not execute PR #97 yet. First evaluate the smallest diagnostic-only UUID lookup against the generated source diff; reject it if it requires any cross-thread communication or if the resulting correlation still depends on timing.


## 2026-10-05 — UUID correlation probe: audited and corrected before execution

The smallest UUID-correlation mechanism was implemented workflow-locally for audit, then reviewed before any runtime execution.

### 🟢 Final mechanism
The workflow injects a package-local diagnostic method into the pinned `AclCache` that scans the already-selected immutable `aclsById` snapshot and returns the UUID whose `StandardAcl` equals the exact D1 target. D1 logs this `targetId` alongside target presence. W1 already logs the UUID passed to `removeAcl`.

This creates a possible post-run identity relation:
- W1 removed UUID = X
- D1 selected snapshot contains exact target with UUID = X

The lookup itself is local to the D1 snapshot. It does not read W1 state, does not write shared state, and does not add a volatile/latch/barrier/Future/lock edge.

### ⚠️ Important failed intermediate attempt — corrected before execution
While constructing the diagnostic, an intermediate workflow revision briefly used `AtomicReference<Uuid>` inside the snapshot lookup to mutate a value from a lambda. This was immediately identified as incompatible with the no-artificial-synchronization rule and replaced before any workflow execution with a local `Uuid[]` holder used only during the same snapshot-local iteration.

The AtomicReference revision was never executed and must not be treated as evidence.

### 🟢 Final source audit result
The final generated mechanism contains no explicit synchronization primitive for UUID correlation. The array holder is ordinary local state confined to the D1 call; it is not shared with W1 or another thread.

### 🟡 Remaining instrumentation caveat
The UUID lookup adds diagnostic work inside D1 and the existing `Files.writeString` sinks remain timing perturbations. Therefore even a perfectly correlated PRE_W1/POST_W1 observation remains empirical diagnostic evidence, not a JMM happens-before proof.

### 🔴 Execution decision
Do **not** execute yet. Before execution, strengthen the workflow safety audit so it rejects forbidden synchronization tokens across the complete injected diagnostic source, not only lines containing `NEXO_CACHE`. Then perform a final generated-source inspection.

### State unchanged
- W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- W1→R1 = UNKNOWN
- TLC = NOT_RERUN
- AB105.116R protected
- AB105.117R not created


## 2026-10-05 — Diagnostic safety audit widened to full injected source

The PR #97 workflow safety gate was strengthened before execution.

### 🟢 Change
The previous grep inspected only lines containing `NEXO_CACHE`. The gate now scans the complete injected target source files (`AclCache.java` and `StandardAuthorizerData.java`) for forbidden synchronization/publication tokens, and explicitly requires the UUID helper and D1 `targetId` observation before compilation.

### 🟢 Current design
The UUID lookup remains a local scan of the immutable D1-selected `AclCache`. No W1→D1 communication mechanism was introduced.

### ⚠️ Limitation
This textual gate is a guardrail, not a proof that library calls have no internal synchronization or that file I/O cannot perturb scheduling. The generated source still requires final inspection before execution.

### Execution state
PR #97 remains NOT EXECUTED. No new evidence has been generated. Epistemic state unchanged.
- W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- TLC = NOT_RERUN
- AB105.116R protected
- AB105.117R not created


## 2026-10-05 — Final pre-execution source audit: UUID correlation is valid and cycle-distinguishing

Pinned-source inspection completed for the UUID identity path.

### 🟢 Immutable-map API verified at exact Kafka pin
`AclCache.aclsById` is an `ImmutableMap<Uuid, StandardAcl>`. The exact pinned PCollections-backed implementation exposes `forEach(BiConsumer)` by delegating to the persistent map. Therefore the diagnostic `nexoFindId(target)` scan is source-compatible with the pinned dependency and does not require exposing or mutating the underlying map.

The map is held by a final field inside immutable `AclCache`; ACL updates create new immutable cache instances rather than mutating the selected snapshot.

### 🟢 UUID is the correct lifecycle identity
At the exact pin, `StandardAclWithId` explicitly pairs `(Uuid id, StandardAcl acl)` and reconstructs that identity from the metadata record. `AclControlManager.newAclId()` generates a random UUID and loops until the UUID is not already present in `idToAcl`. Therefore a newly created ACL lifecycle receives a distinct UUID while an existing UUID identifies the corresponding metadata ACL record.

This removes the previous ambiguity where repeated create/delete cycles could only be paired structurally or by timing. A D1 snapshot reporting `targetId=X` can be matched directly against W1's removal `id=X`.

### 🟡 What this proves / does not prove
UUID correlation proves event identity for the diagnostic observation. It does **not** establish a Java Memory Model happens-before relation between W1 and D1. A PRE_W1 observation would be evidence that D1 selected a snapshot still containing the exact ACL record later removed by W1, but the publication mechanism remains the separate question.

### 🟢 Pre-execution source audit result
The generated helper uses only local state plus `ImmutableMap.forEach`. No W1 state is read. No cross-thread variable, volatile field, atomic primitive, latch, future, monitor, semaphore, or lock was added for correlation.

### 🔴 Execution remains gated
PR #97 is still NOT EXECUTED. The next action is a final generated-source/safety check and only then the real-broker diagnostic, without changing AB105.116R or rerunning TLC.

State unchanged:
- W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- W1→R1 = UNKNOWN
- TLC = NOT_RERUN
- AB105.116R protected
- AB105.117R not created


## 2026-10-05 — Generated-code final safety review

### 🟢 Exact generated logic reviewed
The workflow-generated changes were inspected as text, not inferred from the intended patch. The helper is inserted into `AclCache` immediately before `removeAcl`; D1 reads `AclCache aclCacheSnapshot = aclCache` first, then performs the diagnostic target test and UUID lookup against that already-selected snapshot. The helper does not read W1 state and does not mutate `AclCache`.

### 🟢 No hidden synchronization primitive in the injected correlation path
The generated helper uses a local `Uuid[]`, `ImmutableMap.forEach`, equality against `StandardAcl`, and `Optional`. The pinned `ImmutableMap` interface is a persistent-map wrapper, and its PCollections implementation delegates `forEach` directly to the underlying map. No explicit monitor/volatile/atomic/latch/future/lock is introduced by the helper.

The workflow safety gate scans the complete generated `AclCache.java` and `StandardAuthorizerData.java`, not merely marker lines.

### 🟡 Diagnostic perturbation remains explicit
W1 and D1 each perform `Files.writeString(... APPEND ...)` to separate files. This is diagnostic I/O and can perturb scheduling/timing. It is therefore valid for observation/correlation but cannot be treated as a proof of natural timing or JMM ordering. The safety gate is a guardrail against intentionally added synchronization; it is not a proof that every library-level operation is synchronization-free.

### 🔴 No execution yet
No runtime result was obtained in this step. PR #97 remains NOT EXECUTED. The source audit is now clean enough to permit execution as a diagnostic, but execution itself must remain a separate evidence step.

Canonical state unchanged: W1→D1 HB UNKNOWN; W1→ENQUEUE edge NOT IDENTIFIED; stale read NOT OBSERVED/NOT DISPROVEN; vulnerability NOT ESTABLISHED; W1→R1 UNKNOWN; TLC NOT_RERUN; AB105.116R protected; AB105.117R not created.


## 2026-10-05 — Execution gate status checked

Checked GitHub Actions runs associated with PR #97 head `3a70ac734f621e38f9d3d15f87380358ed27d4f2`.

### 🟢 What exists
A `NEXO AB105 G0 Kafka Bootstrap` run `37392816999` is currently in progress. Its current job is still compiling Kafka test infrastructure; the actual G0 runtime harness step has not started yet.

### 🔴 What does NOT exist yet
This run is the bootstrap workflow, not evidence from the PR #97 `nexo-ab105-g0-cache-probe` diagnostic. Therefore there is still **no PR #97 cache-probe runtime result** to interpret. The previous statement that PR #97 was NOT EXECUTED remains correct.

### Important non-conflation rule
The bootstrap run must not be treated as W1/D1 cache evidence. Its successful/failed status, if later available, only establishes bootstrap/harness state unless its artifacts explicitly contain the cache-probe instrumentation and corresponding W1/D1 evidence.

State unchanged: W1→D1 HB UNKNOWN / NOT IDENTIFIED; W1→ENQUEUE edge NOT IDENTIFIED; stale ACL read NOT OBSERVED / NOT DISPROVEN; vulnerability NOT ESTABLISHED; W1→R1 UNKNOWN; TLC NOT_RERUN; AB105.116R protected; AB105.117R not created.


## 2026-10-05 — Bootstrap #142 reached real runtime but failed on frozen-harness defects

GitHub Actions run `37396197766` (run #142), job `112052624129`, based on correction commit `1c950f53d7fd8342b7b8477833319976756828f9`, completed with failure.

### 🟢 What was actually achieved
- Kafka test infrastructure compiled successfully.
- Temporary `NexoG0RuntimeTest` was generated successfully.
- The frozen G0 runtime harness compiled successfully.
- The real broker/test execution step actually started and ran.

This run is stronger than the previous two bootstrap attempts: the failure is no longer a compile/checkstyle-only failure.

### 🔴 Runtime failure — still not W1/D1 cache-probe evidence
The frozen harness failed inside `StandardAuthorizerData.authorize()` because its `AuthorizableRequestContext.clientAddress()` returned `null`: `NullPointerException: Cannot invoke "java.net.InetAddress.getHostAddress()" because the return value of "org.apache.kafka.server.authorizer.AuthorizableRequestContext.clientAddress()" is null`.

The stack is: `StandardAuthorizerData.authorize → StandardAuthorizer.authorize → NexoG0RuntimeTest$TargetAuthorizer.authorize → frozenA1D0D1D2E`.

This confirms the previously identified harness defect in actual runtime, not a Kafka/JMM finding.

### 🔴 Secondary runtime symptom
The producer repeatedly received `TOPIC_AUTHORIZATION_FAILED` for `nexo-g0-runtime`. Because the frozen harness failed through the null `clientAddress()` path, this symptom cannot be promoted into evidence about the ACL-cache ordering question.

### Epistemic interpretation
This bootstrap run does **not** produce W1→D1 JMM HB evidence, stale-cache evidence, W1/D1 UUID-correlated evidence, or vulnerability evidence.

The frozen G0 harness remains a separate bootstrap artifact and must not be conflated with PR #97.

State remains:
- W1→D1 HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- W1→R1 = UNKNOWN
- TLC = NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### Next action
Do not alter the PR #97 cache-probe design to inherit the frozen harness's `clientAddress=null` defect. First inspect the PR #97 generated runtime path and determine whether it uses the real authorization context/request path or reproduces the frozen direct-authorize harness. Any correction must remain harness-only and must not add synchronization to W1/D1.


## 2026-10-05 — PR #97 inherits the frozen G0 runtime harness defect

The PR #97 workflow was inspected directly against its exact branch content and compared with the ordering-witness workflow it recovers.

### 🟢 Concrete finding
PR #97 does not contain an independent runtime harness. Its `Recover baseline G0 harness without changing it` step extracts `NexoG0OrderingWitnessTest.java` verbatim from `origin/nexo-ab105-g0-ordering-witness`, then injects only the cache diagnostics into Kafka source files.

The recovered harness is therefore the same frozen G0 harness used by bootstrap #142.

### 🔴 Consequence
Bootstrap #142 already demonstrated at runtime that this frozen harness reaches `StandardAuthorizerData.authorize()` with an `AuthorizableRequestContext` whose `clientAddress()` is null and fails with the corresponding NPE.

Therefore PR #97, if executed unchanged, is expected to encounter the same harness defect before it can be accepted as W1/D1 cache-probe evidence. The current cache instrumentation itself has not been implicated in this failure.

### 🟢 Important separation
The defect is in the harness/request-context construction, not in the newly injected UUID correlation or cache observation logic. No change to W1/D1 synchronization should be made to work around it.

The correct next step is a harness-only correction that supplies a valid authorization request context/client address through the same real request path, followed by a fresh source audit. The correction must preserve:
- exact Kafka pin;
- W1/D1 diagnostic-only design;
- no volatile/latch/barrier/Future/lock added for ordering;
- AB105.116R unchanged;
- AB105.117R not created;
- TLC not rerun.

### Epistemic state unchanged
- W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- W1→R1 = UNKNOWN
- PR #97 cache-probe evidence = NOT EXECUTED / NOT ACCEPTED

### Do-not-repeat
Do not execute PR #97 unchanged merely to reproduce the already-confirmed `clientAddress=null` harness failure. Do not treat bootstrap #142's runtime failure as ACL-cache evidence.


## 2026-10-05 — Correction: bootstrap #142 harness is distinct from PR #97 ordering-witness harness

A direct source comparison corrected the previous overbroad continuity statement.

### 🟢 Verified distinction
- Bootstrap #142 generated and executed a temporary `NexoG0RuntimeTest`; its runtime stack explicitly contained `NexoG0RuntimeTest$TargetAuthorizer` and failed on `clientAddress() == null`.
- PR #97 does **not** generate or recover `NexoG0RuntimeTest`. Its workflow extracts `NexoG0OrderingWitnessTest.java` from `nexo-ab105-g0-ordering-witness` and then injects only the cache diagnostics.
- The ordering-witness workflow source inspected here uses `KafkaClusterTestKit`, `KafkaProducer`, SASL/PLAIN configuration, and the real broker/request path. Searches of the repository found no `TargetAuthorizer`, `TARGET.authorize`, or literal `clientAddress() { return null; }` associated with that ordering-witness harness.

### 🔴 Superseded conclusion
The earlier entry claiming that PR #97 “inherits the same frozen G0 runtime harness” as bootstrap #142 was too broad and is **superseded by this entry**. Bootstrap #142's `clientAddress=null` failure must not be projected onto PR #97 without a separate runtime/source finding.

### 🟡 What remains unknown
This correction does **not** establish that PR #97 is ready to execute or that its runtime will succeed. It only removes an unsupported blocker. PR #97 still requires its own final generated-source audit and, if executed, its own runtime evidence.

### Epistemic state unchanged
- W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- W1→R1 = UNKNOWN
- PR #97 cache-probe evidence = NOT EXECUTED / NOT ACCEPTED
- TLC = NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### Do-not-repeat
Do not use bootstrap #142's `clientAddress=null` failure as a reason to reject or modify PR #97. Re-evaluate PR #97 only from its own generated harness, source audit, and runtime artifacts.
