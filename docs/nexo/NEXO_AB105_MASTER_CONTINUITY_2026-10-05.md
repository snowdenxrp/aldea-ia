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
