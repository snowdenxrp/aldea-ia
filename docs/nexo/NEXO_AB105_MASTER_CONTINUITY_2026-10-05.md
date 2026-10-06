# NEXO AB105 — MASTER CONTINUITY — 2026-10-05

## CHAT START — RECOVERY GATE (PERMANENT)

### ÚLTIMA SESIÓN — 2026-10-06 — frontera W1→solicitud real
- 🟢 Run #21: 10/10 W1 cacheIdentity = D1 cacheIdentity; 10/10 D1 observa ACL ausente; ciclos 1–8 W1→D0_RETURN→D1; ciclos 9–10 D0_RETURN→W1→D1. Esto confirma empíricamente que D0_RETURN NO es proxy de W1. Evidencia guardada previamente; commit de referencia aportado por la sesión: `44a41780cb2dcddd2c12008cb06d54cc582a38c1`.
- 🟢 Se reconciliaron además las rutas investigadas durante hoy: MetadataLoader/KafkaEventQueue, AclPublisher, startup/readiness futures, D0/controller completion, KafkaProducer `send().get()`, red/socket, SocketServer Processor y RequestChannel. No reabrirlas genéricamente.
- 🟢 La cadena real queda separada en dos dominios: metadata `...→MetadataLoader→AclPublisher→W1`; request `Producer/I/O→SocketServer Processor→ENQUEUE→DEQUEUE→D1`.
- 🟢 KafkaEventQueue da publicación dentro del dominio metadata; ArrayBlockingQueue da publicación Processor→RequestHandler. No se identificó una operación compartida entre ambos dominios que conecte W1 con ENQUEUE.
- 🔴 No se debe interpretar `D0_RETURN→Producer→ENQUEUE` como W1→ENQUEUE HB. Los ciclos 9–10 lo contradicen como proxy de finalización de W1.
- 🔵 Frontera exacta actual: buscar únicamente un **puente de producción concreto** que salga después de W1/AclPublisher y alcance causalmente el contexto que crea la solicitud de red/ENQUEUE. Si no aparece, conservar UNKNOWN; no convertir ausencia de búsqueda en prueba universal.
- 🚫 DO-NOT-REPEAT: Run #21 cacheIdentity, D0 marker experiment, RequestChannel/SocketServer basic source audit, KafkaProducer producer-side bridge, startup futures, AclCache direct publication, PCollections y MetadataLoader/AclPublisher basic serialization ya fueron auditados.
- 🚫 No artificial synchronization; no AB105.117R; no TLC rerun.


**Esta sección debe leerse ANTES de continuar cualquier investigación en un chat nuevo.**

### Estado que NO debe perderse
- No iniciar desde cero ni repetir auditorías ya cerradas en esta maestra.
- La maestra es el estado científico canónico; el chat nuevo debe recuperar también la **frontera exacta de la investigación**, no solo el resumen final.
- Antes de abrir una hipótesis nueva: reconciliar contra las secciones más recientes de esta maestra y respetar todos los **DO-NOT-REPEAT**.
- Si una ruta ya fue investigada hoy y cerrada, no volver a recorrerla salvo que exista una **nueva discrepancia de código/evidencia**.
- Si algo permanece UNKNOWN, conservar exactamente qué fue descartado y qué puente concreto sigue faltando.

### Frontera canónica al iniciar chat
- W1→ENQUEUE JMM HB: **UNKNOWN / NO CONCRETE EDGE IDENTIFIED**.
- W1→D1 JMM HB: **UNKNOWN / NO CONCRETE EDGE IDENTIFIED**.
- Stale ACL read: **NOT OBSERVED in Run #21 / NOT DISPROVEN universally**.
- Vulnerability: **NOT ESTABLISHED**.
- AB105.116R: **PROTECTED / UNCHANGED**.
- AB105.117R: **NOT_CREATED**.
- TLC: **NOT_RERUN**.
- PR #97: draft diagnostic already contains the needed D1 `correlationId` instrumentation; do **not** create another correlationId-only probe.
- Run #21 already supplied the strongest current cache-observation evidence: 10/10 W1, 10/10 D1, no stale ACL observed, W1/D1 cacheIdentity correspondence as reported; it lacks ENQUEUE/DEQUEUE/AUTH events.
- The already-audited routes (MetadataLoader/AclPublisher serialization, KafkaEventQueue, startup/readiness futures, BrokerServer/ControllerServer admission, RequestChannel/ArrayBlockingQueue, handler lifecycle primitives, PCollections, AclCache/StandardAuthorizerData direct cache publication) are **not open generic search targets**. Reopen only on a concrete new source discrepancy.
- The remaining high-value target is the **concrete external production bridge**, if any, between incremental W1 and the real request admission/authorization path; otherwise preserve UNKNOWN.
- Do not infer JMM happens-before from `System.nanoTime()`, temporal ordering, cacheIdentity equality, or queue ordering alone.

### Regla de continuidad
**No repetir lo ya cerrado. No inventar un puente. No convertir evidencia observacional en HB. Guardar toda delta real en esta maestra.**



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


## 2026-10-05 — PR #97 harness audit: real producer/request path verified

The recovered `NexoG0OrderingWitnessTest` was inspected directly.

### 🟢 Runtime-path finding
The witness creates a real `KafkaClusterTestKit` with `StandardAuthorizer`, creates the target ACL through `Admin.createAcls`, and performs D1 through a real `KafkaProducer.send(...).get(...)` using SASL/PLAIN and client id `nexo-g0-ordering`.

The source contains no `TargetAuthorizer`, no `TARGET.authorize`, no `NexoG0RuntimeTest`, and no local `clientAddress() { return null; }` harness implementation.

Therefore the bootstrap #142 `clientAddress=null` failure is not an identified defect of PR #97's recovered runtime path.

### 🟢 Ordering witness semantics
For each cycle the harness:
1. creates the ACL;
2. waits until real produce is observed ALLOWED;
3. uses Admin `describeAcls` as D0 to verify exactly one target ACL;
4. deletes the ACL;
5. performs a real producer operation and requires DENIED.

This is a real-broker behavioral witness. It does not by itself establish W1→D1 JMM happens-before.

### 🟡 Remaining runtime risk
The harness has not yet been executed with PR #97's cache instrumentation in this audit state. Successful authorization before deletion and denial after deletion establish behavioral correctness at the tested points, but do not prove absence/presence of an intermediate stale cache read.

### State
- PR #97 runtime path = source-verified as real producer/request path
- PR #97 cache-probe evidence = NOT EXECUTED / NOT ACCEPTED
- W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- W1→R1 = UNKNOWN
- TLC = NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### Do-not-repeat
Do not attribute bootstrap #142's `clientAddress=null` failure to PR #97 unless a fresh PR #97 artifact independently reproduces it.


## 2026-10-05 — PR #97 D1 request-correlation gap closed before execution

### 🟢 New finding
The final pre-execution review found one diagnostic observability gap: D1 logged the selected `AclCache` identity, count, target presence, and target UUID, but did not directly record the Kafka request correlation ID.

This did not invalidate the UUID correlation, but it made exact pairing between a D1 cache observation and the corresponding authorization request less direct.

### 🟢 Harness-only correction
PR #97 workflow was updated at commit `844a37a6b850f07575e2ab18269c010f3a695f6b` so the D1 diagnostic line now also records:

`correlationId=requestContext.correlationId()`

The change is workflow-local diagnostic logging only. It does not modify Kafka synchronization, cache publication, request admission, or authorization behavior.

### 🟢 Why this is useful
The resulting evidence can now correlate:
- W1 removal UUID X;
- D1 selected cache snapshot containing target UUID X;
- exact Kafka authorization correlation ID for that D1 observation;
- existing AUTH_ENTER/AUTH_DECISION and ENQUEUE/DEQUEUE records for the same request where applicable.

This strengthens event identity and request-path reconstruction, but **still does not establish JMM happens-before**.

### 🟡 Remaining diagnostic limitations
W1/D1 file sinks and UUID lookup remain timing perturbations. Correlation IDs improve attribution; they do not create or prove a publication edge.

### State
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
Do not treat the new correlationId field as a synchronization mechanism. Do not rerun TLC or modify production synchronization.


## 2026-10-05 — Revalidation: PR #97 safety gate is meaningful at the pinned baseline

### 🟢 Verification
The workflow's complete-file forbidden-token scan was checked against the exact pinned Kafka sources before injection:
- `StandardAuthorizerData.java`: none of `volatile|Atomic|CountDownLatch|Future|synchronized|Reentrant|Semaphore|Lock`
- `AclCache.java`: none of those tokens

Therefore the widened safety gate is not trivially invalidated by pre-existing synchronization tokens in the two injected files. If the gate fails after generation, that failure can be attributed to the generated source rather than a known baseline token.

### 🟢 D1 correlation remains diagnostic-only
The added `requestContext.correlationId()` is read-only request metadata and does not create a synchronization edge.

### State unchanged
- W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- PR #97 cache-probe evidence = NOT EXECUTED / NOT ACCEPTED
- TLC = NOT_RERUN
- AB105.116R protected
- AB105.117R not created


## 2026-10-05 — Execution status after PR #97 correlation commit

The commit containing the D1 `correlationId` diagnostic was checked against GitHub Actions.

### 🟢 Confirmed
PR #97's cache-probe workflow remains **workflow_dispatch-only**, so the new commit did not automatically execute the cache probe.

### 🟡 Concurrent run is unrelated
Commit `844a37a6b850f07575e2ab18269c010f3a695f6b` has an in-progress **Bootstrap #143** run, job `112075954286`. It has reached the real G0 runtime harness step.

This is the separate bootstrap workflow, not PR #97's cache-probe workflow. It must not be promoted to cache-probe evidence.

### 🔴 Current execution gap
There is still no PR #97 cache-probe runtime/artifact result after adding `correlationId`.

### State unchanged
- W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- PR #97 cache-probe evidence = NOT EXECUTED / NOT ACCEPTED
- TLC = NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### Do-not-repeat
Do not interpret Bootstrap #143 as PR #97 evidence. Do not rerun it merely to obtain cache-probe evidence.


## 2026-10-05 — Bootstrap #143 terminal result

Bootstrap #143 (run `37403560486`, job `112075954286`) completed **FAILURE** at the real G0 runtime harness step. The exact failure is the previously known frozen-harness defect:
`AuthorizableRequestContext.clientAddress()` returned null, causing NPE at `StandardAuthorizerData.authorize:245`, through `StandardAuthorizer.authorize:146` and the frozen `TargetAuthorizer`.

The producer then emitted repeated `TOPIC_AUTHORIZATION_FAILED` messages, but these are secondary to the harness failure and are **not ACL-cache evidence**.

No bootstrap artifact was produced.

Classification:
- 🟢 Confirms the bootstrap reached real runtime.
- 🔴 Does not provide W1/D1 cache-probe evidence.
- 🔴 Does not establish stale ACL behavior or the vulnerability.
- 🔵 No projection to PR #97: PR #97 uses the distinct real ordering-witness harness.

State remains unchanged:
W1→D1 HB UNKNOWN; W1→ENQUEUE NOT IDENTIFIED; stale ACL NOT OBSERVED/NOT DISPROVEN; vulnerability NOT ESTABLISHED; PR #97 cache-probe NOT EXECUTED/NOT ACCEPTED; TLC NOT_RERUN; AB105.116R protected; AB105.117R not created.


## 2026-10-05 — PR #97 final workflow semantics audit

Reviewed the exact `nexo-ab105-g0-cache-probe.yml` and the source workflow from `nexo-ab105-g0-ordering-witness`.

### 🟢 Valid diagnostic semantics
- PR #97 pins Kafka exactly to `99b940733a9f6bc409457dba7108f08421d81e42`.
- It recovers the real `NexoG0OrderingWitnessTest`, not the frozen bootstrap harness.
- W1 is injected immediately after `aclCache = aclCacheSnapshot` in `removeAcl`.
- D1 samples exactly the local `AclCache aclCacheSnapshot = aclCache` before `checkSection`.
- D1 records the real request `correlationId`.
- UUID lookup occurs only inside the already-selected immutable D1 snapshot; it does not publish state from W1 to D1.
- Fresh snapshot should report `targetId=NONE`; a stale snapshot retaining the removed ACL can correlate to W1's removed UUID.

### 🟡 Known diagnostic limitations
- W1/D1 file writes perturb scheduling.
- UUID correlation is an O(n) scan over the immutable ID map.
- The textual synchronization-token gate is a guardrail, not a proof that every library/runtime operation is synchronization-free.
- The probe is observational; it does not create or prove a JMM happens-before edge.

### 🔴 No execution evidence yet
The workflow is `workflow_dispatch` only. No PR #97 cache-probe run/artifact has been identified.

### State
W1→D1 HB UNKNOWN; stale ACL NOT OBSERVED/NOT DISPROVEN; vulnerability NOT ESTABLISHED; TLC NOT_RERUN; AB105.116R protected; AB105.117R not created.


## 2026-10-05 — PR #97 diagnostic sink audit: I/O is observational but not semantically neutral

A fresh read of the exact PR #97 workflow exposed an important qualification that was not explicit enough in the previous safety review.

### 🟡 W1/D1 file sinks are not synchronization bridges, but they are real behavioral instrumentation
Both W1 and D1 call `java.nio.file.Files.writeString(..., APPEND)`. The sinks are separate files, and no shared Java synchronization primitive is introduced between W1 and D1. Therefore the probe does not intentionally create a W1→D1 Java happens-before edge.

However, file I/O is not semantically free:
- it can block or contend in the operating system/runtime;
- it can change scheduling and therefore the probability of observing a stale snapshot;
- the W1 sink throws `RuntimeException` if the diagnostic write fails;
- the D1 sink likewise throws on write failure.

Therefore the probe remains **diagnostic/observational**, but it is not a zero-perturbation experiment. Any runtime result must be labeled with this instrumentation effect.

### 🟢 Important non-conflation
The I/O perturbation does not invalidate the cache-identity/UUID observation itself. If D1 records target UUID X and W1 independently records removal of UUID X earlier in the same uniquely identified cycle/request reconstruction, that is evidence about the snapshot actually selected by D1. It is not proof that an execution without instrumentation would make the same observation, and it is not proof of JMM happens-before.

### 🔴 Additional execution rule
Do not classify a run with missing/failed sink writes as clean negative evidence. If W1/D1 sink errors occur, the corresponding cycle is **AMBIGUOUS / INVALID DIAGNOSTIC OBSERVATION**, even if the broker test subsequently produces an authorization result.

### State unchanged
- W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge = NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- PR #97 cache-probe evidence = NOT EXECUTED / NOT ACCEPTED
- TLC = NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### Do-not-repeat
Do not add a shared sink, latch, volatile flag, Future, barrier, lock, or other synchronization to make W1/D1 logging more reliable. Reliability must come from post-run reconciliation, not from an artificial publication edge.


## 2026-10-05 — Final source recheck: D1 probe is on the exact authorization snapshot path

A fresh read of the pinned `StandardAuthorizerData.java` confirms the diagnostic insertion point remains exact:

- `authorize()` routes the non-superuser, loaded path into `findAclRule(...)`.
- `findAclRule()` performs exactly one local `AclCache aclCacheSnapshot = aclCache` read.
- The same local snapshot is then passed to the first `checkSection()` and the wildcard `checkSection()`.
- PR #97 places D1 observation immediately after that snapshot read and before either scan.

Therefore, for the target G0 request, a recorded D1 `cacheIdentity`, count, membership, and target UUID describe the immutable cache object selected by that authorization operation, not a later cache read.

### Important scope qualification
The probe is not a universal probe of every authorization path:
- superusers bypass `findAclRule()`;
- requests before `loadingComplete` throw `AuthorizerNotReadyException` instead of entering the normal ACL scan;
- the probe only records the specific TOPIC/WRITE action for `nexo-g0-ordering`.

The G0 witness uses `plain-user1` and the real producer/request path, so these bypass cases are not the intended D1 target. Nevertheless, they are now explicitly recorded as scope boundaries rather than silently generalized away.

### Result
🟢 The exact D1 observation point is source-verified.
🟡 This strengthens the diagnostic interpretation only.
🔴 It still does not establish W1→D1 JMM happens-before or a vulnerability.

State unchanged: W1→D1 HB UNKNOWN / NOT IDENTIFIED; stale ACL NOT OBSERVED/NOT DISPROVEN; vulnerability NOT ESTABLISHED; PR #97 cache-probe NOT EXECUTED/NOT ACCEPTED; TLC NOT_RERUN; AB105.116R protected; AB105.117R not created.

### Do-not-repeat
Do not broaden the probe's result to superuser, pre-initial-load, or unrelated authorization paths. Do not rerun TLC or introduce synchronization merely to strengthen this diagnostic.


## 2026-10-05 — Fresh execution-status recheck after final D1 scope audit

A fresh GitHub Actions lookup was performed against PR #97 HEAD `844a37a6b850f07575e2ab18269c010f3a695f6b`.

### 🟢 Confirmed
- The commit has associated workflow runs, but none is the PR #97 `nexo-ab105-g0-cache-probe` workflow.
- The associated AB105 JMM causal-window workflow is `skipped`.
- Bootstrap #143 is `failure` and remains the separate frozen-harness run already classified.
- No PR #97 cache-probe runtime/artifact result was identified.

### 🔴 Execution state
The cache-probe workflow remains `workflow_dispatch`-only. The currently available GitHub tool surface cannot dispatch that manual workflow. Therefore no execution is claimed or inferred.

### Epistemic state unchanged
W1→D1 JMM HB = UNKNOWN / NOT IDENTIFIED; stale ACL read = NOT OBSERVED / NOT DISPROVEN; vulnerability = NOT ESTABLISHED; PR #97 cache-probe = NOT EXECUTED / NOT ACCEPTED; TLC = NOT_RERUN; AB105.116R protected; AB105.117R not created.

### Do-not-repeat
Do not use unrelated runs attached to the same commit as cache-probe evidence. Do not rerun bootstrap #143 merely to obtain the missing PR #97 result.


## 2026-10-05 — JMM boundary resolved to the concrete publication question

The remaining static question was narrowed to the exact JMM edge rather than the mere presence of `volatile`.

### 🟢 Resolved static point
For incremental ACL changes, W1 updates the plain reference `StandardAuthorizerData.aclCache` inside the existing `StandardAuthorizerData` instance. `StandardAuthorizer.data` is volatile, but the incremental `addAcl/removeAcl` path does not perform a new volatile write to `data` after the `aclCache` mutation.

Therefore the volatile nature of `data` cannot, by itself, be treated as a publication edge for a later `aclCache` mutation. A volatile read of `data` establishes HB from the corresponding volatile write to `data` and earlier actions, not automatically from a later plain write to a field of the already-published object.

### 🔵 Consequence for the audit
This resolves the static reasoning frontier:
- We have identified why `data volatile` does **not** close W1→D1 for incremental ACL mutation.
- We have **not** proved that D1 must observe a stale cache.
- We have **not** identified a different concrete W1→D1 synchronization/publication edge.
- Therefore the remaining question is empirical: whether the real concurrent execution can produce a D1 snapshot retaining the ACL removed by W1.

The existing PR #97 diagnostic is correctly positioned to observe that exact snapshot without manufacturing a synchronization edge.

### Execution gate
No further production-code/static modification is justified before execution. The next valid step is the real PR #97 cache-probe run and artifact reconciliation.

### Epistemic state
W1→D1 JMM HB = UNKNOWN / NO CONCRETE EDGE IDENTIFIED; stale ACL = NOT OBSERVED / NOT DISPROVEN; vulnerability = NOT ESTABLISHED; PR #97 cache-probe = NOT EXECUTED / NOT ACCEPTED; TLC = NOT_RERUN; AB105.116R protected; AB105.117R not created.

### Do-not-repeat
Do not claim that `data volatile` publishes later `aclCache` writes. Do not claim stale visibility without runtime evidence. Do not introduce synchronization to force publication. Do not rerun TLC.


## 2026-10-06 — indirect synchronization frontier rechecked after Run #21

### 🟢 New reconciliation result
Run #21 does not require a new cacheIdentity experiment. The master source audit and the 37098764557 witness remain compatible:
- Run #21 observes the exact immutable AclCache snapshot selected by D1, with target identity/correlation in 10/10 cycles.
- The canonical real-broker witness observes W1 → ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION as temporal order.
- These evidence families can be combined for event identity, but not promoted to JMM happens-before.

### 🟢 Remaining indirect-publication candidates rechecked
The pinned-source audit was narrowed to broker-local state that could be touched after W1 and then read by the data-plane path.

1. KafkaEventQueue / MetadataLoader lock: the queue lock publishes the metadata event to the MetadataLoader event-handler execution, but the handler releases the queue lock before event.run(); the request thread does not acquire that lock during authorization. No transitive W1 → request-reader edge identified.
2. BrokerMetadataPublisher / KRaftMetadataCache.currentImage: metadataCache.setImage(newImage) is volatile and occurs BEFORE aclPublisher.onMetadataUpdate(...), hence before W1. A later request-side read of metadata state cannot retroactively publish the later aclCache write.
3. AclPublisher futures: only initial-load completion was identified. Incremental addAcl/removeAcl does not complete a per-update future consumed by request processing.
4. Plugin.get()/ClusterMetadataAuthorizer wrapper: the plugin returns the same authorizer instance; no synchronized/lock/await/proxy serialization was identified on this path.
5. SocketServer/request admission: startup futures control endpoint enablement only. No per-incremental-ACL rendezvous with Processor/request admission was identified.
6. RequestChannel: ArrayBlockingQueue gives the real ENQUEUE → DEQUEUE publication edge, but that edge starts with Processor-side actions before enqueue; it does not publish unrelated W1 actions from the MetadataLoader thread.

### 🔴 Consequence
The previously open W1 → ? → ENQUEUE bridge is now substantially narrowed by the indirect-synchronization audit. No concrete Kafka-level cross-thread publication edge from incremental W1 to request admission has been identified in the inspected pinned path.

This is still an absence-of-identified-edge result, NOT proof that a stale read must occur and NOT a vulnerability finding.

### 🟡 Epistemic state
- W1 → D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- W1 → ENQUEUE publication edge: NOT IDENTIFIED
- stale ACL read: NOT OBSERVED / NOT DISPROVEN
- vulnerability: NOT ESTABLISHED
- W1 → R1: UNKNOWN
- Run #21: diagnostic evidence accepted for exact D1 snapshot identity, not JMM proof
- TLC: NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### 🎯 Next exact action
No production synchronization changes and no new cacheIdentity probe. The remaining empirical discriminator is the already-prepared PR #97 real-path cache probe: reconcile its artifact against the canonical 37098764557 request witness using ACL ID + cycle + correlationId + broker/sequence. If the probe cannot be executed from the available GitHub workflow surface, preserve UNKNOWN rather than manufacturing or inferring a result.

### DO-NOT-REPEAT
Do not repeat the MetadataLoader queue, startup-future, metadataCache volatile-order, Plugin.get, SocketServer admission, or RequestChannel HB searches unless a new pinned-source discrepancy appears.


## 2026-10-06 — exact Producer.send() boundary audited

### 🟢 New source finding
The canonical G0 harness was opened at the executable-source level. After `D0_RETURN`, the test calls the real `KafkaProducer.send(...).get(...)`. The producer is a real network client using the broker bootstrap address; the broker receives the request on the independent SocketServer Processor path and eventually publishes it through RequestChannel.

The exact local sequence is therefore:
`D0_RETURN → KafkaProducer.send().get() → client/network transport → broker SocketServer Processor → RequestChannel.sendRequest(ENQUEUE) → RequestChannel.receiveRequest(DEQUEUE) → KafkaRequestHandler → D1`.

### 🔴 Important JMM boundary
The client-side `send().get()` completion is not a Java in-process synchronizes-with edge from the MetadataLoader thread that performed W1 to the broker Processor/request-handler threads. The request crosses the Kafka network protocol and is processed by independent broker execution contexts. Therefore `D0_RETURN → send().get() → ENQUEUE` cannot be promoted into W1 → ENQUEUE HB.

The Producer future may synchronize client-side producer state, but it has no W1 participant and does not publish the MetadataLoader's plain `aclCache` replacement to the broker request path.

### 🟢 Consequence
This closes another tempting bridge:
`W1 → D0_RETURN → ProducerFuture → ENQUEUE` = NOT A VALID JMM CHAIN.

The remaining legitimate HB question is unchanged:
`W1 → ? → ENQUEUE`.

No production code changed. No new experiment opened.

### Epistemic state
- MetadataLoader → W1: 🟢 IDENTIFIED
- D0_RETURN → local target-broker W1: 🔴 NOT IDENTIFIED / may be temporally reversed
- D0_RETURN → client request: 🟢 protocol/control flow
- client request → broker ENQUEUE: 🟢 real network/request path
- W1 → ENQUEUE HB: 🔴 NOT IDENTIFIED
- ENQUEUE → DEQUEUE: 🟢 publication boundary
- DEQUEUE → D1: 🟢 same-handler execution path
- W1 → D1 HB: 🔵 UNKNOWN
- stale read: 🔵 NOT OBSERVED / NOT DISPROVEN
- vulnerability: 🔴 NOT ESTABLISHED

### DO-NOT-REPEAT
Do not revisit ProducerFuture/D0_RETURN as a candidate W1 publication bridge unless a new source fact shows that the target broker's MetadataLoader participates in that same completion object.


## 2026-10-06 — Run #21 artifact reconciliation: preserve evidence-family separation

### 🟢 Exact distinction recovered
Direct reconciliation of the Run #21 workflow/artifacts against the canonical 370778 witness establishes that they must remain two separate evidence families.

**Run #21**:
- pins Kafka to `99b940733a9f6bc409457dba7108f08421d81e42`;
- executes the real `NexoG0OrderingWitnessTest` through `:server:test`;
- observes the real broker D1 authorization path;
- records W1/D1 cacheIdentity and target state;
- reports the baseline order as `A1_SUCCESS → D0_TARGET → D0_RETURN → D1_RESULT`;
- does **not** contain the full `ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION` marker sequence in its artifact.

**Run 370778**:
- contains the explicit temporal witness `W1 → ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION → D1`;
- is the source for that complete request-path ordering observation;
- does not provide a correlation identity proving that a particular Run #21 D1 event is the same request event as a particular 370778 event.

### 🟢 Run #21 result accepted within its proper scope
Across 10/10 cycles, the D1-observed `cacheIdentity` matches the corresponding W1 broker-0 cache identity, and D1 occurs after W1 temporally in the paired diagnostic records. This is strong empirical evidence that the authorization operation observed the exact immutable cache object identified by W1 in those executions.

It is **not** evidence that Run #21 reproduces the full 370778 request-order witness, and it is **not** JMM happens-before proof.

### 🔴 Explicit non-conflation rule
Do not write or imply:
`Run #21 D1 = Run 370778 D1`

unless a future artifact supplies a shared correlation identity that actually establishes that event equivalence.

The correct combined statement is:
- Run #21 establishes real-broker D1 snapshot identity in 10/10 diagnostic cycles.
- Run 370778 establishes the real request-path temporal sequence in 10/10 cycles.
- Together they constrain the architecture strongly, but remain independently scoped evidence.

### 🟢 Producer/network bridge remains closed
The executable G0 harness confirms:
`D0_RETURN → KafkaProducer.send().get() → network → SocketServer Processor → ENQUEUE → DEQUEUE → D1`.

The producer Future is client-side and does not share a JMM synchronization participant with the MetadataLoader thread that performs W1. Therefore it cannot be promoted to a W1→ENQUEUE publication bridge.

### 🟡 Current epistemic state
- W1 → D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- W1 → ENQUEUE publication edge: NOT IDENTIFIED
- Run #21 stale-cache observation: NOT OBSERVED
- Run #21 exact cache identity match: OBSERVED 10/10
- 370778 full request-path temporal witness: OBSERVED
- Run #21 ↔ 370778 event identity: NOT DEMONSTRATED
- stale read: NOT DISPROVEN
- vulnerability: NOT ESTABLISHED
- TLC: NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### DO-NOT-REPEAT
Do not launch another cacheIdentity experiment merely to reconstruct the 370778 markers. Do not merge evidence families by temporal similarity. Do not treat Producer.send().get(), RequestChannel ordering, startup futures, MetadataLoader queue serialization, or metadataCache publication as an incremental W1→D1 bridge without a new concrete source fact.

### Next frontier
Continue only with the remaining production-source question: whether any concrete post-startup mechanism touched by every incremental ACL mutation is subsequently read/awaited by the Processor or authorization path. If no such mechanism is identified, preserve the bounded UNKNOWN rather than converting absence of a discovered edge into a vulnerability claim.


## 2026-10-06 — Post-startup publication frontier: authorization-side recheck

### 🟢 New audit result
A final targeted source pass searched for a **post-startup mechanism that is touched by each incremental ACL mutation and then read/awaited by the request authorization path**.

The recheck covered:
- `ClusterMetadataAuthorizer` thread-safety contract versus concrete `StandardAuthorizer`;
- `AclPublisher.onMetadataUpdate()` and `BrokerMetadataPublisher` boundaries;
- `KafkaApis → AuthHelper → Authorizer.authorize()`;
- request-handler execution/callback mechanisms;
- metadata-version/offset gates and broker lifecycle state;
- synchronized/lock/condition/future/atomic/concurrent-collection candidates.

### 🟢 Result
No new cross-domain publication mechanism was identified.

The important distinction is explicit:
- The `ClusterMetadataAuthorizer` contract requires thread-safe behavior, but that contract is not itself a JMM synchronizes-with edge.
- Incremental `StandardAuthorizer.addAcl/removeAcl()` still mutate the same `StandardAuthorizerData` instance.
- W1 still writes only the plain `aclCache` reference.
- The request path still authorizes directly; no per-ACL-update await, metadata-offset gate, shared lock, or callback rendezvous was found before D1.
- Existing `CompletableFuture`, `ConcurrentHashMap`, `AtomicInteger`, synchronized pool-management methods, and lifecycle latches elsewhere are unrelated unless a causal path from W1 is established. None was found.
- `BrokerMetadataPublisher`'s volatile metadata-image publication remains ordered **before** the ACL publisher callback, so it cannot retroactively publish the later W1 plain write.

### 🔵 Epistemic consequence
The static search frontier is now substantially exhausted for the inspected pinned G0 path.

This does **not** prove a stale read. It establishes only:
`NO CONCRETE POST-STARTUP W1→REQUEST PUBLICATION EDGE IDENTIFIED`.

Therefore:
- W1 → ENQUEUE HB = UNKNOWN / NOT IDENTIFIED
- W1 → D1 HB = UNKNOWN / NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED

### 🔴 Do-not-overclaim
Do not convert absence of a discovered synchronization mechanism into proof of a JMM violation. Do not use the thread-safety contract as proof of visibility. Do not treat unrelated concurrency primitives as bridges without a source-level causal chain.

### 🎯 Next frontier
The remaining discriminator is empirical reconciliation of the already-prepared real-path cache probe (PR #97), if/when its manual workflow can actually execute. No new experiment is opened here. If execution remains unavailable, preserve the bounded UNKNOWN.

### DO-NOT-REPEAT
Do not repeat the authorization-side lock/future/offset/concurrent-collection search. Do not rerun TLC. Do not create AB105.117R. Do not introduce synchronization into the witness.


## 2026-10-06 — exact pinned source recheck: no hidden Plugin publication bridge

A targeted recheck was performed at the exact Kafka pin `99b940733a9f6bc409457dba7108f08421d81e42`, limited to the remaining question of whether the authorizer wrapper/object publication could reconnect W1 to the request path.

### 🟢 Confirmed
- `AclPublisher` holds an `Optional<Plugin<Authorizer>>` and invokes the same `ClusterMetadataAuthorizer` instance for incremental `addAcl/removeAcl`.
- `Plugin.instance` is a `private final` field and `Plugin.get()` simply returns that field; there is no volatile field, synchronized accessor, lock, await, or per-update callback in this wrapper.
- The final-field publication of the already-constructed Plugin/authorizer object is an initialization/publication concern, not a publication mechanism for later mutations of `StandardAuthorizerData.aclCache`.
- Exact pinned `StandardAuthorizer` still has `volatile StandardAuthorizerData data`, but incremental `addAcl/removeAcl` call directly into the existing data object and do not assign `data` afterward.
- Exact pinned `StandardAuthorizerData` explicitly states that the class is not thread-safe, while its `aclCache` field is plain and incremental updates replace that field with a new immutable snapshot.
- The pinned `StandardAuthorizer` source comment still describes a read-write lock, but no such lock exists in the inspected implementation. This remains a documented source/comment discrepancy, not proof by itself of a vulnerability.

### 🔴 Boundary closed
No hidden publication bridge was found in the Plugin/authorizer wrapper layer that turns the later W1 plain write into a request-thread-visible write.

This further narrows the source frontier but does not establish stale visibility or a JMM violation.

### Epistemic state unchanged
- W1 → ENQUEUE HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- W1 → D1 HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- stale ACL read: NOT OBSERVED / NOT DISPROVEN
- vulnerability: NOT ESTABLISHED
- PR #97 cache-probe: NOT EXECUTED / NOT ACCEPTED
- TLC: NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### DO-NOT-REPEAT
Do not repeat the Plugin wrapper/final-field publication search unless a new exact-pinned source discrepancy appears. Do not reinterpret final-field initialization as publication of later `aclCache` mutations. Do not introduce synchronization or rerun TLC.

### Next frontier
The production-source audit is now effectively closed for the inspected G0 path. The only remaining discriminator is the already-prepared PR #97 diagnostic execution/reconciliation. If that workflow cannot execute, preserve the bounded UNKNOWN.


## 2026-10-06 — Correction: PR #97 cache-probe Run #21 is executed evidence

A newer repository evidence freeze was found at commit `c9251e968a3d0287d79f2600f3ae576047856539`, with dedicated evidence document `NEXO_AB105_G0_CACHE_PROBE_RUN21_EVIDENCE_2026-10-06.md`. This supersedes the earlier execution-status statements that PR #97 had not executed.

### 🟢 Run #21 evidence accepted within scope
- 10/10 cycles executed.
- W1 executed 10/10 and D1 executed 10/10.
- D1_RESULT was DENIED 10/10.
- In the expected post-removal state, D1 observed `targetPresent=false`, `targetId=NONE`, `cacheCount=0`.
- When causally paired by ACL identity, cycle identity and sequence, D1's `cacheIdentity` exactly matched the corresponding W1-produced cache identity in 10/10 cycles.
- W1 ran on MetadataLoader event-handler threads; D1 ran on data-plane request-handler threads.
- No probe-added volatile/synchronized/latch/barrier/lock/equivalent publication mechanism was introduced.

### 🟢 Empirical consequence
Run #21 is now accepted as real-broker diagnostic evidence that **stale ACL cache visibility was not observed in 10/10 executions** and that D1 selected the same immutable cache snapshot identity recorded at W1 in those paired cycles.

This is stronger than the previous state "PR #97 not executed" and that earlier execution-status statement is explicitly superseded here.

### 🔴 Critical limitation preserved
Run #21 does NOT prove formal JMM happens-before from W1 to D1. Its artifact's baseline ordering is:
`A1_SUCCESS → D0_TARGET → W1 → D0_RETURN → D1_RESULT`

It does not contain the complete request-path markers:
`W1 → ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION/D1`.

Therefore Run #21 does not by itself prove that its D1 event is the same request event as the complete request-path witness from run 370778. Evidence families remain separate unless a shared correlation identity establishes equivalence.

### 🟡 Updated epistemic state
- W1 → ENQUEUE HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- W1 → D1 formal JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- stale ACL read: NOT OBSERVED (Run #21: 10/10)
- D1 cache snapshot identity match with W1: OBSERVED 10/10 in Run #21
- Run #21 → 370778 event identity: NOT DEMONSTRATED
- vulnerability: NOT ESTABLISHED
- W1 → R1: UNKNOWN
- TLC: NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### 🔴 Superseded execution-status statements
Earlier master entries stating `PR #97 cache-probe = NOT EXECUTED / NOT ACCEPTED` are historical observations from before Run #21 and must not be used as the current state. They are superseded by this evidence freeze; they are not silently deleted.

### 🎯 New exact frontier
Do not create another cacheIdentity probe. The remaining question is now narrowly the **real data-plane causal linkage**:
`W1 → ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION/D1`

Use the already-existing request-path witness/correlation machinery where possible. Do not add synchronization merely to manufacture HB. If the causal identity between Run #21 D1 and the full request-path witness cannot be demonstrated, preserve the formal JMM UNKNOWN while retaining the strong 10/10 empirical non-observation of stale cache.

### DO-NOT-REPEAT
Do not repeat PR #97 cacheIdentity instrumentation merely to obtain the same 10/10 result. Do not merge Run #21 and 370778 solely by wall-clock order. Do not rerun TLC. Do not create AB105.117R. Do not introduce synchronization into the witness.


## 2026-10-06 — exact next discriminator: causal identity inside one real-path diagnostic

A direct workflow audit of the current PR #97 cache-probe found the precise remaining instrumentation gap.

### 🟢 Confirmed
- The current cache-probe already runs the real `NexoG0OrderingWitnessTest` against pinned Kafka.
- W1 records ACL `id` and `cacheIdentity`.
- D1 records `cacheIdentity`, target presence and `targetId`.
- The current cache-probe does **not** emit the request `correlationId` at D1.
- Its evidence emission also does not include the full `ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION` markers.

### 🎯 Exact discriminator
The next useful extension is **not another cacheIdentity experiment**. It is to add observational correlation to the existing diagnostic path:
1. D1 records the request `correlationId` alongside the already-recorded cacheIdentity/targetId.
2. The same workflow-local request path records ENQUEUE and DEQUEUE for that correlationId.
3. AUTH_ENTER/AUTH_DECISION retain the same correlationId.
4. W1 remains keyed by ACL id/cycle; no shared mutable state is introduced.

This would permit one-run causal matching:
`W1(ACL id) → ENQUEUE(correlationId) → DEQUEUE(correlationId) → AUTH_ENTER(correlationId) → D1(correlationId, cacheIdentity)`.

### 🔴 Formal limitation
Even with this complete causal/event identity, the result would still not by itself prove W1→D1 JMM happens-before. It would close the **event-identity gap**, not manufacture a memory-model edge.

### Safety constraints
- No volatile, synchronized, latch, barrier, Future, lock, semaphore, or equivalent publication mechanism.
- No modification to AB105.116R.
- No AB105.117R.
- No TLC rerun.
- Keep diagnostic sinks observational only.
- Preserve Run #21 as the already-accepted 10/10 cache-identity evidence; do not relabel it as a full request-path witness.

### Current state after this audit
- W1→ENQUEUE HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- stale ACL read: NOT OBSERVED (Run #21: 10/10)
- D1 cacheIdentity=W1 cacheIdentity: OBSERVED 10/10 in Run #21
- Run #21 ↔ 370778 request-event identity: NOT DEMONSTRATED
- vulnerability: NOT ESTABLISHED

### DO-NOT-REPEAT
Do not rerun the existing cacheIdentity-only probe merely for the same result. Only an observational causal-correlation extension is justified by the remaining evidence gap.


## 2026-10-06 — causal-correlation audit refinement: W1 cannot carry request correlationId directly

A further audit of the exact current diagnostic workflows found an important constraint in the proposed causal-correlation extension.

### 🟢 Confirmed current request identity path
The existing G0 witness already exposes the broker request correlation identity at:
- ENQUEUE: `request.header.correlationId()`
- DEQUEUE: `request.header.correlationId()`
- AUTH_ENTER: `requestContext.correlationId()`
- AUTH_DECISION: `requestContext.correlationId()`

The current cache-probe D1 diagnostic does not yet emit that correlationId.

### 🔴 Critical correction to the earlier shorthand
W1 occurs on the MetadataLoader/AclPublisher path while processing the ACL removal. W1 does **not** naturally possess the later producer request's broker `correlationId`.

The real sequence is:
`W1 (ACL update) → D0_RETURN → client creates/sends request → broker assigns/uses request correlationId → ENQUEUE → DEQUEUE → AUTH_ENTER → D1`.

Therefore a diagnostic must NOT invent a direct field-level identity such as `W1(correlationId)` unless the source actually provides that identity. Adding shared mutable state solely to transfer the correlationId from W1 to the later request would itself alter the concurrency experiment and is forbidden.

### 🟢 Minimal valid extension
The safe observational extension is therefore two-layer correlation:
1. W1 records the ACL identity, cacheIdentity, cycle context and timestamp.
2. ENQUEUE/DEQUEUE/AUTH_ENTER/AUTH_DECISION/D1 record the same broker request correlationId.
3. D1 additionally records cacheIdentity/targetId as already done.
4. Correlation between the ACL-update event and the request event is established by immutable request/ACL identity plus the single-cycle harness structure and temporal ordering, not by a shared W1→request variable.

If stronger event identity is required, a future diagnostic may use a **cycle-unique request resource/ACL identity carried naturally in the Kafka request itself** (for example a cycle-specific topic name), so W1's ACL identity and the later request's resource identity can be matched without cross-thread mutable state. That would be an experimental-scope change and must be audited before use; it is not yet executed evidence.

### 🔴 What this does NOT establish
Even a complete correlationId chain from ENQUEUE through D1 would only prove which broker request produced the observed authorization event. It would not create or prove W1→ENQUEUE or W1→D1 JMM happens-before.

Current formal state therefore remains:
- W1→ENQUEUE HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- stale ACL read: NOT OBSERVED (Run #21: 10/10)
- D1 cacheIdentity=W1 cacheIdentity: OBSERVED 10/10 in Run #21
- Run #21 ↔ 370778 request-event identity: NOT DEMONSTRATED
- vulnerability: NOT ESTABLISHED
- TLC: NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### DO-NOT-REPEAT
Do not add a W1→request shared variable, volatile, latch, barrier, Future, lock, semaphore, or equivalent just to transfer correlationId. Do not call temporal coincidence a direct event identity. Do not rerun the cacheIdentity-only probe merely to repeat Run #21.

### Next exact frontier
First validate the observational-only correlation instrumentation against the current workflow source. If direct W1↔request identity remains impossible, evaluate the cycle-unique resource identity design before any runtime execution. No new runtime claim is made here.


## 2026-10-06 — correction: current PR #97 D1 already carries request correlationId

A direct PR #97 patch audit corrected one point from the immediately preceding causal-correlation note.

### 🟢 Confirmed
The current PR #97 diagnostic source already records:
- D1 `requestContext.correlationId()`
- D1 `cacheIdentity`
- D1 target membership / `targetId`

The baseline G0 witness also already records the request-path correlationId at ENQUEUE/DEQUEUE/AUTH_ENTER/AUTH_DECISION.

Therefore the statement that the **current PR #97 source does not emit correlationId at D1 is stale/incorrect** and is superseded here.

### 🔴 What is still missing
The Run #21 frozen evidence document remains explicit that its accepted artifact did not close the complete:
`W1 → ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION/D1`
chain.

The important distinction is now:
- **Source capability:** correlationId at D1 already exists in PR #97.
- **Accepted Run #21 evidence:** does not demonstrate the complete request-path linkage.
- **W1:** still has ACL identity/cacheIdentity, not the later request correlationId.
- Therefore no shared W1→request mutable state should be added.

### 🟢 Existing evidence gives a safer route
The prior real-broker ordering witness already demonstrated correlationId-bearing ENQUEUE/DEQUEUE/AUTH events and reconciled the test request IDs by cycle. The remaining question is whether the **same diagnostic execution** can expose/reconcile those existing request-path markers together with PR #97's D1 cache observation.

No new synchronization is required for that. No direct W1→correlationId transfer is required.

### Current state
- W1→ENQUEUE HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- stale ACL read: NOT OBSERVED (Run #21: 10/10)
- D1 cacheIdentity=W1 cacheIdentity: OBSERVED 10/10 in Run #21
- D1 correlationId instrumentation: PRESENT IN CURRENT PR #97 SOURCE
- complete W1→request→D1 linkage in accepted Run #21 evidence: NOT DEMONSTRATED
- vulnerability: NOT ESTABLISHED
- TLC: NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### DO-NOT-REPEAT
Do not add correlationId transfer state to W1. Do not repeat the cacheIdentity-only experiment. Do not treat source capability as executed evidence. Do not treat the prior 370778 correlation chain as automatically identical to Run #21.

### Next exact frontier
Reconcile the **existing PR #97 D1 correlationId** with the **existing baseline NEXO_ORDER request markers** in one execution/evidence artifact, if the workflow output actually contains both. If the artifact cannot demonstrate both in the same run, preserve UNKNOWN rather than inferring the linkage.


## 2026-10-06 — authoritative workflow audit: PR #97 current D1 sink does NOT emit correlationId

A direct read of the current `.github/workflows/nexo-ab105-g0-cache-probe.yml` supersedes the immediately previous note that claimed current PR #97 D1 already records `requestContext.correlationId()`.

### 🟢 Exact current source
The current cache-probe workflow injects D1 immediately after:
`AclCache aclCacheSnapshot = aclCache;`
and its D1 sink records:
- nanoTime
- thread name
- cacheIdentity
- cacheCount
- targetPresent
- targetId

It does **not** record `requestContext.correlationId()`.

The workflow's evidence step separately greps baseline `NEXO_ORDER` events, but that is not the same as putting the D1 correlationId into the D1 diagnostic record.

### 🔴 Superseded statement
The previous continuity note saying “D1 correlationId instrumentation: PRESENT IN CURRENT PR #97 SOURCE” was based on an incorrect source inference and is superseded by this exact workflow audit. It must not be used as evidence.

### 🟢 Correct current frontier
The original causal-correlation gap therefore remains:
- baseline G0 witness can expose request-path correlationId;
- PR #97 D1 cache sink currently does not expose that correlationId;
- W1 cannot naturally know the later request correlationId;
- no shared W1→request state may be introduced.

A valid observational extension must add only the request correlationId to the existing D1 diagnostic observation (and, if needed, ensure the existing NEXO_ORDER markers are emitted in the same artifact). This must be audited for source placement and must not add any synchronization primitive or shared mutable publication mechanism.

### Formal state
- W1→ENQUEUE HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED
- stale ACL read: NOT OBSERVED (Run #21: 10/10)
- D1 cacheIdentity=W1 cacheIdentity: OBSERVED 10/10 in Run #21
- D1 correlationId in current PR #97 cache sink: NOT PRESENT
- complete W1→request→D1 linkage in accepted Run #21 evidence: NOT DEMONSTRATED
- vulnerability: NOT ESTABLISHED
- TLC: NOT_RERUN
- AB105.116R protected
- AB105.117R not created

### DO-NOT-REPEAT
Do not rely on the previous incorrect “D1 already has correlationId” statement. Do not add W1→request shared state. Do not repeat the cacheIdentity-only probe without the narrowly defined request-path linkage improvement.

### Next exact frontier
Design the smallest source-only diagnostic change: capture the existing request correlationId at D1 and make the existing NEXO_ORDER request-path markers available in the same evidence artifact, without changing the baseline request/authorization behavior or introducing synchronization.


## 2026-10-06 — supersession: PR #97 head vs main workflow correlationId + authoritative Run #21 reconciliation

This entry supersedes the immediately preceding source note that treated the current default-branch workflow as if it were PR #97 head. The two refs are different and must not be conflated.

### 🟢 Exact ref distinction
- PR #97 head: `23c71ece22e37a788a48b0e767b121482570f6d9`. Its diagnostic source includes D1 `requestContext.correlationId()` in the D1 sink.
- Current `main` workflow: `.github/workflows/nexo-ab105-g0-cache-probe.yml`. Its D1 sink does NOT include `requestContext.correlationId()`; it records nanoTime, thread, cacheIdentity, cacheCount, targetPresent and targetId.
- Therefore the earlier entry saying “current PR #97 D1 sink does NOT emit correlationId” was wrong as a statement about PR #97 head: it inspected the current main workflow. That statement is now superseded. The main-vs-PR distinction is authoritative.

### 🟢 Run #21 authoritative reconciliation
Dedicated reconciliation document: `docs/nexo/NEXO_AB105_RUN21_AUTHORITATIVE_RECONCILIATION_2026-10-06.md`.
- Run #21 = workflow run `37520308442`, artifact `11441125547`.
- Canonical request-path witness = workflow run `37098764557`, artifact `11265332252`.
- Both use Kafka pin `99b940733a9f6bc409457dba7108f08421d81e42`.
- Run #21: 10 ACL cycles; W1/D1 observations present; D1 targetPresent=false/cacheCount=0 after removal; D1 cacheIdentity matches corresponding broker-0 W1 cacheIdentity in all 10 cycles when paired by ACL id/cycle/causal sequence.
- Canonical witness: 10 cycles with real ENQUEUE, DEQUEUE, AUTH_ENTER, AUTH_DECISION and D1_RESULT markers. It establishes the observed real-broker temporal chain W1 -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION -> D1.
- The reconciliation reports no contradiction between the two evidence families. Together they provide strong observational coverage of the real request path plus D1 cache identity, but they still do NOT establish W1 -> ENQUEUE or W1 -> D1 formal JMM happens-before.

### 🔴 Evidence-family boundary that remains mandatory
Do not claim that Run #21 D1 and the canonical witness D1 are the same request event merely because both are 10/10 or temporally similar. The reconciliation combines their scoped evidence; it does not manufacture event identity or JMM HB.

### 🟡 Current epistemic state
- Real broker request path: VERIFIED.
- W1 -> ENQUEUE temporal ordering: OBSERVED.
- ENQUEUE -> DEQUEUE queue publication boundary: VERIFIED by concurrent queue semantics.
- DEQUEUE -> AUTH_ENTER -> AUTH_DECISION -> D1: OBSERVED/VERIFIED in canonical witness.
- W1 -> ENQUEUE formal HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- W1 -> D1 formal JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- stale ACL read: NOT OBSERVED (Run #21 10/10).
- D1 cacheIdentity=W1 cacheIdentity: OBSERVED 10/10 in Run #21.
- vulnerability: NOT ESTABLISHED.
- TLC: NOT_RERUN.
- AB105.116R: PROTECTED / unchanged.
- AB105.117R: NOT_CREATED.

### 🎯 Next exact frontier
No new cacheIdentity probe is justified. No synchronization may be added to manufacture HB. The remaining source question is narrowly whether an existing production synchronization/publication edge connects the ACL publisher/MetadataLoader W1 to the client/request submission that later reaches RequestChannel ENQUEUE. Search that concrete boundary only. If no such production edge is found, preserve UNKNOWN.

### DO-NOT-REPEAT
- Do not rerun the cacheIdentity-only probe merely to repeat Run #21.
- Do not rerun TLC.
- Do not create AB105.117R.
- Do not add volatile/synchronized/latch/barrier/Future/lock/semaphore/shared mutable correlation state.
- Do not conflate PR #97 head with main workflow source.
- Do not delete the superseded historical notes; retain them as provenance, but use this entry as the current reconciliation.


## 2026-10-06 — post-W1 publisher and request-side shared-state audit

The remaining broker-local candidate was narrowed to operations occurring **after** W1 in the same BrokerMetadataPublisher callback, then checked against the request-side authorization boundary.

### 🟢 Exact pinned order
At Kafka pin `99b940733a9f6bc409457dba7108f08421d81e42`, the verified sequence after the ACL publisher is:
`W1 ACL publisher → groupCoordinator.onMetadataUpdate → shareCoordinator.onMetadataUpdate → feature/share-version handling → firstPublishFuture.complete`.

No inspected post-W1 operation is itself a request-admission or authorization callback. `firstPublishFuture.complete` is startup readiness and is not awaited by steady-state authorization.

### 🟢 Request-side boundary remains direct
The request handler enters `KafkaApis`, where authorization reaches `AuthHelper.authorize(...)` and then the concrete `Authorizer.authorize(...)` directly. Arbitrary `CompletableFuture`, `ConcurrentHashMap`, `AtomicInteger`, coordinator state, or metadata reads elsewhere in KafkaApis are not evidence unless a causal W1 path reaches them and the request path synchronizes on the same state before D1. No such path was identified.

### 🔴 Candidate closed
No new W1→ENQUEUE/W1→D1 synchronization edge was identified in the post-W1 publisher continuation or request-side shared-state boundary. The already-closed candidates remain closed: MetadataLoader queue lock, metadataCache volatile publication, startup futures/readiness, BrokerServer lifecycle lock, request-handler shutdown/callback machinery, RequestChannel ENQUEUE→DEQUEUE, Plugin wrapper, and AuthHelper/Authorizer direct call.

### 🟡 Important epistemic boundary
This is a bounded source-audit conclusion, not a mathematical proof that no synchronization exists anywhere in Kafka. It means no concrete W1-connected production edge was identified in the inspected G0 path. Therefore formal JMM state remains UNKNOWN / NOT IDENTIFIED.

### Current state
- W1→ENQUEUE temporal ordering: OBSERVED in canonical real-broker witness.
- W1→ENQUEUE formal HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- W1→D1 formal JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- stale ACL read: NOT OBSERVED (Run #21 10/10).
- D1 cacheIdentity=W1 cacheIdentity: OBSERVED 10/10 in Run #21.
- vulnerability: NOT ESTABLISHED.

### DO-NOT-REPEAT
Do not reopen these closed source candidates without a new pinned-source discrepancy. Do not add synchronization. Do not rerun the cacheIdentity probe merely for another 10/10. Do not rerun TLC. Do not create AB105.117R.

### Next frontier
The production-source audit for the concrete G0 path is effectively exhausted. The remaining uncertainty is empirical: whether the real execution can ever produce a stale authorization/cache observation under the existing semantics. Any future diagnostic must remain observational and must not manufacture W1→D1 publication.


## 2026-10-06 — Run #21 artifact independently re-verified

The actual GitHub Actions artifact was downloaded and inspected directly, closing the remaining uncertainty about what Run #21 really contained.

### 🟢 Exact provenance
- Workflow run: `37520308442`
- Artifact: `11441125547`
- Artifact SHA-256 reported by GitHub: `42b595cf6daffe3b24ea651c3b807781fd6f374d6ada8881330a016fe446f1ca`
- Run head SHA: `3d55d745c4a2a44336a122f327cb3e9e760362c4`
- Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`
- Artifact contains separate W1/D1 logs plus the baseline ordering evidence.

### 🟢 Direct observations in the artifact
The artifact contains 20 W1 records: two broker metadata-loader threads participate in the 10 ACL-removal cycles. For each cycle, the D1 record after removal uses the cache identity produced by the corresponding broker's W1 event.

Observed post-removal D1 pattern in all 10 cycles:
- `cacheCount=0`
- `targetPresent=false`
- `targetId=NONE`
- D1 `cacheIdentity` matches the corresponding W1-produced cache identity for the broker serving that request.

The artifact also contains the baseline request-order events showing, per cycle, `A1_SUCCESS → D0_TARGET → D0_RETURN → D1_RESULT=DENIED`.

### 🟢 Important new precision
This independently confirms that the Run #21 result was not merely a prose summary: the raw artifact itself contains the paired W1/D1 cache identities and the baseline cycle events.

It therefore strengthens the empirical statement:
**Run #21 observed no stale pre-removal AclCache snapshot in 10/10 post-removal D1 observations.**

### 🔴 Formal boundary unchanged
The artifact still does NOT establish Java Memory Model W1→D1 happens-before. The separate-file sinks are observational instrumentation; the matching object identity is evidence of what D1 actually read in those executions, not proof of the language-level publication guarantee for all executions.

It also does not turn Run #21 into the canonical full request-path witness. The canonical witness remains the separate run `37098764557` / artifact `11265332252` for the complete ENQUEUE→DEQUEUE→AUTH path.

### Current epistemic state
- 🟢 Run #21 raw artifact independently verified.
- 🟢 D1 cacheIdentity = corresponding W1 cacheIdentity: 10/10.
- 🟢 D1 target absent after removal: 10/10.
- 🟢 stale cache observation: NOT OBSERVED in this run.
- 🟡 W1→ENQUEUE formal HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- 🟡 W1→D1 formal JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- 🔴 vulnerability: NOT ESTABLISHED.

### DO-NOT-REPEAT
Do not repeat the same cacheIdentity-only experiment merely to obtain another 10/10. Do not rerun TLC. Do not create AB105.117R. Do not add synchronization or shared mutable correlation state.

### Next frontier
Only a genuinely new empirical discriminator is justified now: reconcile the existing D1 cache observation with the full request-path event identity in one execution, **without** adding a W1→request publication mechanism. If that cannot be done observationally, preserve UNKNOWN rather than manufacturing the linkage.


## 2026-10-06 — Run #21 raw timing reconciliation: D0_RETURN is not a W1 proxy

The raw Run #21 artifact was parsed cycle-by-cycle rather than relying on the summary.

### 🟢 Exact result
For all 10 cycles, the broker-0 W1 cacheIdentity matches the subsequent post-removal D1 cacheIdentity, and D1 observes the target ACL absent.

However, the timing relation between W1 and D0_RETURN is **not invariant**:
- cycles 1–8: W1 < D0_RETURN < D1
- cycles 9–10: D0_RETURN < W1 < D1

Therefore D0_RETURN cannot be used as a proxy for “W1 already happened.” This is direct empirical support for the existing architectural distinction that the Admin delete completion/result path is not itself evidence of the MetadataLoader W1 completion point.

### 🟢 Stronger empirical observation
Even in cycles 9–10, where D0_RETURN precedes the broker-0 W1 timestamp, D1 subsequently reads exactly the cache object produced by that W1 and observes the ACL absent.

This strengthens the empirical non-observation of a stale D1 snapshot while simultaneously showing that the test's D0_RETURN marker does not define the publication boundary.

### 🔴 Formal boundary
The timestamp order remains observational only. It does not establish W1→D1 JMM happens-before. The matching immutable object identity demonstrates what object D1 actually read in those executions; it does not establish a universal publication guarantee.

### Current state
- 🟢 Run #21: D1 cacheIdentity matches broker-0 W1: 10/10.
- 🟢 Run #21: target absent at D1 after removal: 10/10.
- 🟢 D0_RETURN is proven empirically unsuitable as a W1 proxy: 2/10 cycles had D0_RETURN before W1.
- 🟡 W1→ENQUEUE formal HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- 🟡 W1→D1 formal JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- 🔴 vulnerability: NOT ESTABLISHED.

### DO-NOT-REPEAT
Do not use D0_RETURN as a publication marker. Do not repeat cacheIdentity-only execution. Do not rerun TLC or create AB105.117R. Do not add synchronization to force W1/request correlation.


## 2026-10-06 — exact request-admission source boundary: SocketServer Processor → RequestChannel

### 🟢 Pinned source result
At Kafka revision 99b940733a9f6bc409457dba7108f08421d81e42, the concrete production call that performs ENQUEUE is in core/src/main/scala/kafka/network/SocketServer.scala:
- a SocketServer Processor thread reads/decodes an incoming socket request;
- constructs the Request;
- calls requestChannel.sendRequest(req);
- only then mutes the connection.

RequestChannel.sendRequest(req) performs the queue insertion. KafkaRequestHandler later receives from that queue and dispatches the request.

### 🔴 Critical boundary
The real path is:

MetadataLoader/AclPublisher W1
→ [UNKNOWN production bridge]
→ client/network Processor thread reads a socket request
→ SocketServer.requestChannel.sendRequest(req) = ENQUEUE
→ request-handler dequeue
→ KafkaApis/AuthHelper/Authorizer.authorize() = D1

The source does not show W1 being executed on the SocketServer Processor thread, nor does the request enqueue operation consume a W1-produced state transition. MetadataLoader thread serialization therefore cannot be extended to ENQUEUE merely because both events occur in the same broker.

### 🟡 JMM interpretation
The queue put/take boundary is a legitimate publication edge for actions that precede put on the producer/Processor thread. W1 occurs on a different MetadataLoader publisher thread. Unless an independent production synchronization edge connects W1 to the Processor thread/request creation, queue HB cannot retroactively publish W1.

### 🟢 Consequence for experiment design
Existing NEXO_ORDER correlationId instrumentation is sufficient to identify the request-path sequence once ENQUEUE occurs. No W1→request shared variable is needed or allowed.

The next source-audit target is now narrower: determine whether the client/request generation side has any legitimate synchronization with MetadataLoader after the ACL update, or whether W1-before-ENQUEUE is only observed execution ordering without demonstrated JMM publication.

### Current state
- SocketServer Processor → ENQUEUE: VERIFIED.
- ENQUEUE → DEQUEUE publication: VERIFIED.
- DEQUEUE → AUTH_ENTER → AUTH_DECISION/D1: VERIFIED/OBSERVED.
- W1 → ENQUEUE temporal order: OBSERVED in canonical witness.
- W1 → ENQUEUE JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- W1 → D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- stale read: NOT OBSERVED (Run #21, 10/10).
- vulnerability: NOT ESTABLISHED.

### DO-NOT-REPEAT
Do not add synchronization between MetadataLoader and SocketServer merely for the probe. Do not treat broker-global execution order as a happens-before relation. Do not repeat cacheIdentity-only runs.


## 2026-10-06 — narrowed causal boundary: W1 does not own the later client request

### 🟢 Reconciliation
The repository's prior causal-edge records show the later D1 request is a client/network request whose broker-side admission begins only when the SocketServer Processor receives it and calls ENQUEUE. The ACL publisher W1 does not naturally carry that request's correlationId or invoke ENQUEUE. Existing evidence explicitly warns that transferring identity from W1 to the later request through shared mutable state would alter the concurrency experiment.

### 🔴 Consequence
The phrase “W1 → ENQUEUE” must be treated as an observed temporal relation, not as an assumed production causal chain. The missing edge is not simply “some broker queue”: the request first has to exist on the client/network side and arrive at the broker Processor. The RequestChannel queue only publishes the request after the Processor calls put/sendRequest.

Therefore the strongest current statement is:
- W1(target ACL update) < ENQUEUE(D1 request) was observed in the real-broker witness.
- No production call path from W1 to creation/submission of that later client request has been identified.
- No JMM synchronization edge from W1 to the SocketServer Processor has been identified.
- ENQUEUE→DEQUEUE remains a separate, real queue publication edge.

### 🟡 Important experimental implication
A new probe that merely captures more timestamps or copies W1 identity into the request would not resolve the JMM question. It would either reproduce already-known temporal ordering or introduce an artificial communication edge. The remaining uncertainty is architectural/causal: whether any legitimate shared synchronization exists between ACL metadata publication and the independent client request generation/arrival.

### Current epistemic state
W1→ENQUEUE HB = UNKNOWN / NO CONCRETE PRODUCTION EDGE IDENTIFIED.
W1→D1 HB = UNKNOWN / NO CONCRETE PRODUCTION EDGE IDENTIFIED.
Stale ACL read = NOT OBSERVED in Run #21 (10/10).
Vulnerability = NOT ESTABLISHED.
AB105.116R remains protected; AB105.117R is not to be created; TLC remains frozen.


## 2026-10-06 — producer-side bridge audited: no W1 publication carried into network request

### 🟢 Exact executable harness path
The canonical G0 harness performs the D1 action from the test/client side after D0_RETURN using the real KafkaProducer (`producer.send(...).get()`). The producer send is asynchronous/buffered and its network I/O is handled by the producer's background path before the broker SocketServer Processor receives the request.

### 🟢 / 🔴 JMM boundary
There can be normal synchronization inside the KafkaProducer implementation between the application thread and its own producer I/O machinery, and there is then the network handoff into the broker Processor. Those edges publish the request/producer state; they do not automatically publish the independent MetadataLoader W1 write.

The crucial ordering counterexample remains cycles 4/5 where target-broker W1 occurred after D0_RETURN. Thus the test-thread completion/control-flow before producer.send cannot be used as evidence that W1 had already been published. The later producer/network synchronization cannot create a happens-before edge from a W1 that occurred on a separate broker metadata thread unless an explicit causal synchronization chain from that W1 exists.

### 🔴 Closed candidate
`D0_RETURN → producer.send().get() → producer I/O → network → SocketServer Processor → ENQUEUE` is NOT the missing W1→ENQUEUE HB chain. It is a request-delivery chain beginning from the test/client thread. The W1 predecessor remains outside that chain.

### Current frontier
The source audit has now eliminated the obvious broker-side queue and harness-side completion paths as carriers of the W1 write. Remaining question is only whether some independent production metadata publication mechanism (outside the already audited AclPublisher/StandardAuthorizer/RequestChannel paths) connects the W1 thread to the later authorization request. If no such mechanism exists, the bounded conclusion remains UNKNOWN rather than a proof of universal absence.


## 2026-10-06 — pinned-source lock-comment discrepancy rechecked against current Kafka

### 🟢 Exact pinned fact
At Kafka pin `99b940733a9f6bc409457dba7108f08421d81e42`, `StandardAuthorizer.java` contains a comment saying that a read-write lock is used to synchronize ACL reads/writes, but the actual class contains **no ReentrantReadWriteLock field and no lock acquisition** around `addAcl`, `removeAcl`, or `authorize`.

The actual pinned implementation is:
- `private volatile StandardAuthorizerData data`;
- `addAcl/removeAcl -> data.addAcl/removeAcl` directly;
- `authorize -> StandardAuthorizerData curData = data` followed by authorization on that object;
- incremental `aclCache` mutation remains inside the selected `StandardAuthorizerData`.

### 🟢 Cross-check against current upstream source
Current Apache Kafka source still contains the same stale lock-description comment while the shown implementation likewise has no lock field/acquisition in `StandardAuthorizer`. Therefore the comment must not be treated as executable evidence of synchronization. The executable source is authoritative for this audit. citeturn0search0turn1search0

### 🔴 No new HB bridge
This recheck does not discover a hidden lock. It strengthens the existing conclusion that the outer volatile `data` publication mechanism is not automatically refreshed by incremental `aclCache` replacement. The source-level lock hypothesis is therefore closed unless a different pinned revision is intentionally introduced (which is outside the current experiment).

### Important historical distinction
Older Kafka implementations did explicitly use `ReentrantReadWriteLock` around these operations. That is historical evidence only and must not be projected onto the pinned implementation. citeturn1search2

### Current state
- W1→ENQUEUE JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- stale ACL read: NOT OBSERVED in Run #21 (10/10).
- vulnerability: NOT ESTABLISHED.
- AB105.116R: PROTECTED.
- AB105.117R: NOT_CREATED.
- TLC: NOT_RERUN.

### DO-NOT-REPEAT
Do not interpret the stale read-write-lock comment as a synchronization mechanism. Do not reopen the lock hypothesis without a new executable source revision. Do not add an artificial lock/barrier/volatile/Future to the G0 experiment.

### Next frontier
The source audit remains bounded at the same final frontier: any remaining uncertainty is whether some **other** production synchronization edge outside the audited authorizer/update/request paths connects W1 to the later request. If none is found, preserve UNKNOWN rather than converting source absence into a universal proof.


## 2026-10-06 — Authorizer contract vs concrete publication guarantee

### 🟢 New source reconciliation
Apache Kafka's Authorizer contract explicitly requires all authorizer operations, including authorization and ACL updates, to be thread-safe. Its `start()` contract separately describes endpoint readiness: listeners start only after authorization metadata is available. citeturn0search1turn0search11

KIP-801 further states that StandardAuthorizer is multi-threaded and continues authorizing requests while ACL record changes are being applied, while requiring ACL records to be applied in metadata-log order. citeturn0search6

### 🔴 Critical interpretation
Neither the thread-safety contract nor the ordering requirement identifies a specific Java Memory Model synchronizes-with edge for each incremental ACL replacement.

Therefore:
- “thread-safe” is a correctness contract, not proof of a particular volatile/lock/queue/future edge;
- metadata-log ordering is an ordering requirement for applying ACL records, not proof that every later request thread has a happens-before edge from the applying MetadataLoader thread;
- startup `start()` readiness remains distinct from steady-state incremental publication.

This reinforces, rather than changes, the current epistemic boundary: no concrete W1→D1 JMM edge has been identified in the audited pinned execution path.

### 🟡 Important consequence
We must not turn Kafka's documented concurrency guarantee into either of these unsupported claims:
1. “stale reads are impossible,” or
2. “a vulnerability is proven.”

The correct bounded state remains: implementation is required to be thread-safe; our audit has not yet identified the concrete publication mechanism that explains the observed post-W1 D1 visibility.

### Current state
- W1→ENQUEUE JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- stale ACL read: NOT OBSERVED in Run #21 (10/10).
- vulnerability: NOT ESTABLISHED.
- AB105.116R: PROTECTED.
- AB105.117R: NOT_CREATED.
- TLC: NOT_RERUN.

### DO-NOT-REPEAT
Do not treat Authorizer thread-safety documentation or KIP-801 ordering language as a hidden synchronization primitive. Do not reopen already-closed RequestChannel/startup/AclPublisher candidates without a new executable-source discrepancy.

### Next frontier
The only remaining legitimate question is whether the pinned StandardAuthorizer implementation has an implicit publication mechanism not yet identified in the exact `StandardAuthorizerData`/cache path, or whether the documented thread-safety guarantee is satisfied by semantics that do not expose a simple W1→D1 HB edge. Continue at the concrete implementation level only.


## 2026-10-06 — StandardAuthorizerData concrete read/write audit completed

### 🟢 Exact pinned implementation
The exact pinned `StandardAuthorizerData` confirms:
- the class explicitly states it is **not thread-safe**;
- `aclCache` is a plain, non-volatile reference;
- `addAcl` performs `aclCache = aclCache.addAcl(...)`;
- `removeAcl` computes a new cache snapshot and then performs `aclCache = aclCacheSnapshot`;
- `authorize` eventually reads the current `aclCache` through the same `StandardAuthorizerData` object.

The source also shows that `copyWithNewAcls` creates a new `StandardAuthorizerData` and that `StandardAuthorizer.loadSnapshot()` publishes that new object through the outer volatile `data` field. That is a genuine publication path for **snapshot loading**, not for ordinary incremental ACL updates. citeturn0search1turn0search0

### 🔴 No hidden primitive found in this layer
No synchronized block, lock, volatile `aclCache`, atomic reference, future completion, concurrent collection, or queue operation appears in the concrete incremental `addAcl/removeAcl` path itself.

Therefore the concrete StandardAuthorizerData layer does not reveal the missing W1→D1 publication mechanism.

### 🟡 Important nuance
The documented thread-safety requirement for the Authorizer remains real, but the exact mechanism that makes the implementation safe is not exposed as a simple W1→D1 synchronizes-with edge in this layer. The source audit must not invent one.

### New bounded conclusion
The **direct cache implementation layer is now closed** as a source-audit frontier:
- immutable `AclCache`: audited;
- plain `StandardAuthorizerData.aclCache`: audited;
- outer volatile `StandardAuthorizer.data`: audited;
- incremental vs snapshot replacement distinction: audited.

This does not prove universal absence of a publication mechanism elsewhere. It proves only that no such mechanism is present in the concrete cache read/write layer examined.

### Current state
- W1→ENQUEUE JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- stale ACL read: NOT OBSERVED in Run #21 (10/10).
- vulnerability: NOT ESTABLISHED.
- AB105.116R: PROTECTED.
- AB105.117R: NOT_CREATED.
- TLC: NOT_RERUN.

### DO-NOT-REPEAT
Do not repeat the `StandardAuthorizerData`/AclCache primitive audit unless a new pinned-source discrepancy appears. Do not mistake `loadSnapshot()`'s outer-volatile publication for incremental ACL-update publication. Do not add artificial synchronization.

### Next frontier
Only an external production mechanism can still explain publication: a synchronization edge outside `StandardAuthorizerData`/AclCache, or semantics elsewhere in the execution path not yet concretely connected to W1. If no such edge is identified, preserve UNKNOWN.


## 2026-10-06 — Indirect-publication frontier rechecked; no new W1→D1 bridge

### 🟢 Reconciliation
A repository-wide search was rechecked for the remaining indirect candidates: `AclPublisher`, `MetadataLoader`, `KafkaEventQueue`, `CompletableFuture`, `firstPublishFuture`, scheduler/executor handoffs, and `StandardAuthorizerData.aclCache`.

The existing evidence remains internally consistent:
- MetadataLoader invokes publisher callbacks synchronously on its own event-handler thread.
- KafkaEventQueue synchronization covers metadata-event queue participants, not the independent later client/network request.
- BrokerMetadataPublisher's `firstPublishFuture` and authorizer endpoint futures are startup/readiness mechanisms.
- Incremental `addAcl/removeAcl` do not complete those startup futures.
- No causal W1-derived scheduler/executor submission into request admission or authorization was identified.
- RequestChannel publication begins only when the independent network Processor calls `sendRequest`.

### 🔴 Boundary now sharpened
The source audit has now crossed the remaining obvious indirect-candidate set without identifying a concrete W1→request-admission or W1→D1 JMM bridge.

This still is **not** a universal proof that no synchronization exists anywhere in Kafka. It is a bounded result for the exact pinned execution path and candidate mechanisms inspected.

### 🟡 Next action
Stop expanding the same source-search surface. The highest-value discriminator is now event identity: one diagnostic artifact that correlates the existing real request `correlationId` from ENQUEUE/DEQUEUE/AUTH to D1's observed cache identity, without adding any synchronization or W1→request shared state. This would connect the already-proven request-path witness to the cache observation in one execution.

No implementation change is made in this checkpoint.

### Current state
- W1→ENQUEUE JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- stale ACL read: NOT OBSERVED in Run #21 (10/10).
- vulnerability: NOT ESTABLISHED.
- AB105.116R: PROTECTED.
- AB105.117R: NOT_CREATED.
- TLC: NOT_RERUN.

### DO-NOT-REPEAT
Do not reopen the already audited MetadataLoader/KafkaEventQueue/startup-future/scheduler candidates without a new source discrepancy. Do not add a synchronization bridge merely to make event identity easier.


## 2026-10-06 — Directed historical reconciliation: PR #92/#93/#94 vs Run #21

### 🟢 Reconciled historical evidence
The older accepted families remain internally consistent and do not upgrade the current JMM conclusion:
- PR #92 cache-identity runs were in-process diagnostic executions; useful for cache behavior, not the real broker request-path witness.
- PR #93 established the production-source boundary and bounded HB(W1,D1)=NOT_IDENTIFIED.
- PR #94 established real-broker temporal ordering, but remains separate from PR #92's in-process cache diagnostics.
- Run #21 adds a stronger cache-identity observation (10/10 W1 identity == D1 identity), but does not identify the exact real request event consumed at D1.

### 🔴 No historical bridge recovered
No previously accepted artifact establishes, in one execution: W1 cache mutation → exact real client request → ENQUEUE correlationId → DEQUEUE same correlationId → AUTH_ENTER same correlationId → D1 cache observation. Therefore the historical record contains no buried event-identity witness that closes W1→D1 HB.

### 🟡 Non-merge rule
Keep these evidence classes separate: (1) PR #92 / Run #21 cache identity, (2) PR #94 / run 37098764557 real request-path ordering, (3) PR #93 production source/JMM boundary. A result from one class cannot be silently paired with another to manufacture event identity.

### Current frontier
Historical reconciliation is sufficiently complete to stop looking backward for an existing witness. Next distinct target: one diagnostic execution carrying the existing request correlationId from ENQUEUE through D1, with no added synchronization. This is an observational discriminator only; it cannot itself prove JMM HB.

### Frozen status
- AB105.116R = FROZEN / UNCHANGED.
- AB105.117R = NOT_CREATED.
- TLC = NOT_RERUN.
- W1→ENQUEUE JMM HB = UNKNOWN.
- W1→D1 JMM HB = UNKNOWN.
- stale read = NOT_OBSERVED in Run #21.
- vulnerability = NOT_ESTABLISHED.

### DO-NOT-REPEAT
Do not rerun PR #92/Run #21 cacheIdentity-only diagnostics, PR #94 ordering-only diagnostics, or PR #93 source audit without a new hypothesis. Do not add synchronization to create event identity.


## 2026-10-06 — Important correction: PR #97 already contains the event-identity discriminator

### 🟢 Source-verified finding
The directed audit of PR #97 head 23c71ece22e37a788a48b0e767b121482570f6d9 found that the previously proposed next diagnostic is already implemented in the existing draft workflow.

PR #97 D1 instrumentation records requestContext.correlationId() at the exact point after AclCache aclCacheSnapshot = aclCache and before checkSection(...). The recovered baseline ordering witness independently emits ENQUEUE with request.header.correlationId(), DEQUEUE with the same request header correlationId, AUTH_ENTER with requestContext.correlationId(), and AUTH_DECISION with requestContext.correlationId().

Therefore one PR #97 execution can already provide the required request identity chain: ENQUEUE(correlationId) → DEQUEUE(correlationId) → AUTH_ENTER(correlationId) → D1(correlationId + cacheIdentity/targetPresent/targetId).

### 🟢 Why this is materially stronger
We do not need a new source modification merely to add correlationId to D1. The current draft already contains it. The remaining missing evidence is runtime execution of this exact workflow and artifact reconciliation.

### 🟡 Remaining limitation
PR #97 W1 sink records ACL UUID, timestamp and thread but does not emit request correlationId, which is expected because W1 occurs on the metadata-loader path and the request is independently generated. This does not prevent identifying the real D1 request event; it only means W1↔request causality remains an observational correlation question rather than a shared-state bridge.

The workflow also emits baseline NEXO_ORDER events into the same evidence artifact, while W1 and D1 use separate files. No added volatile/latch/barrier/Future/lock synchronization is introduced by the diagnostic.

### 🔴 Epistemic consequence
Even if PR #97 executes and the correlationId chain is complete, it will establish event identity, not by itself establish JMM W1→D1 happens-before. It can eliminate the current cross-run event-identity ambiguity and make the behavioral observation substantially stronger.

### Next action
Do not modify PR #97 for correlationId. Audit/execute the existing draft as-is; then reconcile the raw artifact using the six-link acceptance gate: trigger/path → run → job → executed head/pin → raw artifact → semantic interpretation.

### DO-NOT-REPEAT
Do not create another correlationId-only probe. Do not rerun Run #21 merely for cache identity. Do not add a W1→request shared variable or synchronization bridge.


## 2026-10-06 — Execution-state audit of PR #97

### 🟢 Verified
PR #97 remains open/draft at head `23c71ece22e37a788a48b0e767b121482570f6d9`.

The Actions history on branch `nexo-ab105-g0-cache-probe` contains older failed runs of the cache-probe workflow, but they executed older heads (for example `92acdba736f7bf8c4b72bd6e89b73ff8ce95d33e`, run #12). They are not valid evidence for the current PR #97 head. There is also an ordering-witness run at the current PR #97 head (`23c71ece...`), but that is a different workflow and therefore does not execute the PR #97 cache-probe diagnostic.

### 🟡 Consequence
There is still **no accepted runtime execution of the PR #97 cache-probe workflow at head `23c71ece...`**. Therefore no new D1 correlationId/cacheIdentity artifact exists for this exact diagnostic yet.

### 🔴 Do not misclassify
Do not reuse the older failed cache-probe runs as evidence for PR #97. Do not treat the ordering-witness failure at the same head as execution of the cache-probe workflow. The source audit remains valid; runtime evidence remains pending.

### Next action
Manual dispatch of the existing PR #97 cache-probe workflow at its current head, followed by job/artifact/raw-log reconciliation. No source change required.


## 2026-10-06 — Reproducibility audit: baseline G0 harness is branch-floating

### 🟢 New concrete finding
The current PR #97 workflow pins Kafka itself to `99b940733a9f6bc409457dba7108f08421d81e42`, but it does **not** pin the recovered G0 harness to a commit SHA.

The workflow executes:
`git fetch origin nexo-ab105-g0-ordering-witness:refs/remotes/origin/nexo-ab105-g0-ordering-witness`
and then reads the workflow source from:
`origin/nexo-ab105-g0-ordering-witness:.github/workflows/nexo-ab105-g0-ordering-witness.yml`.

At the current audit time, that branch resolves to commit `a3aaae3a7839b2ab079b90991231fd42f622e2f1`.

### 🟡 Why this matters
This is a **reproducibility/provenance gap**, not a discovered synchronization bug.

A future manual dispatch could recover a different version of the G0 harness if that branch advances, while the Kafka revision remains identical. Therefore an artifact would currently prove:
- exact Kafka pin;
- exact PR #97 workflow head;
- but only the branch-resolved version of the recovered baseline harness, not a permanently fixed harness commit.

This does not invalidate the existing historical witnesses, and it does not justify modifying the diagnostic source during the current execution. It means the execution record must capture the resolved harness commit before interpreting results.

### 🔴 Experimental rule
Do **not** silently fix this by changing the workflow immediately before the intended run; that would create a new experimental revision and reset the execution state.

For the pending PR #97 execution, record the resolved branch SHA `a3aaae3a7839b2ab079b90991231fd42f622e2f1` as part of provenance. If a future repeat is required, pinning the harness commit should be a separate controlled revision, not an in-place mutation of this pending run.

### Current state unchanged
- W1→ENQUEUE JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- stale ACL read: NOT OBSERVED in Run #21 / NOT DISPROVEN universally.
- vulnerability: NOT ESTABLISHED.
- PR #97: DRAFT, head `23c71ece22e37a788a48b0e767b121482570f6d9`.
- AB105.116R: PROTECTED.
- AB105.117R: NOT_CREATED.
- TLC: NOT_RERUN.

### DO-NOT-REPEAT
Do not treat the branch-floating harness as equivalent to a pinned harness commit. Do not create a new probe solely to fix provenance before the pending execution. Do not reinterpret this provenance gap as a JMM finding.


## 2026-10-06 — PR #97 safety-audit concern resolved

### 🟢 Verification
The suspected false-positive risk in the PR #97 `Probe safety audit` was checked against the exact pinned Kafka file `StandardAuthorizerData.java` at `99b940733a9f6bc409457dba7108f08421d81e42`.

The audit scans the complete `StandardAuthorizerData.java` and `AclCache.java` files for synchronization-related tokens. The exact pinned `StandardAuthorizerData.java` contains no occurrences of the checked tokens `volatile`, `Atomic`, `CountDownLatch`, `Future`, `synchronized`, `Reentrant`, `Semaphore`, or `Lock`.

Therefore the earlier concern that the safety grep would necessarily fail because of unrelated Kafka baseline code is **not realized at this pin**. The current safety audit is not proven defective on that basis.

### 🟢 Additional provenance confirmation
The currently resolved G0 baseline branch commit remains `a3aaae3a7839b2ab079b90991231fd42f622e2f1`. This is the branch-resolved harness provenance that must be captured by the pending PR #97 execution.

### Current state unchanged
- PR #97 head: `23c71ece22e37a788a48b0e767b121482570f6d9`.
- Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`.
- G0 harness resolved SHA: `a3aaae3a7839b2ab079b90991231fd42f622e2f1`.
- W1→ENQUEUE JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- stale ACL read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.
- AB105.116R: PROTECTED.
- AB105.117R: NOT_CREATED.
- TLC: NOT_RERUN.

### DO-NOT-REPEAT
Do not modify the safety grep merely for the previously suspected false-positive reason. Do not create a new diagnostic revision from this resolved concern. Continue to the pending runtime execution/reconciliation.


## 2026-10-06 — AclCache and incremental volatile-publication boundary rechecked

### 🟢 Exact pinned source reconciliation
The exact pinned Kafka `AclCache.java`, `StandardAuthorizer.java`, and `StandardAuthorizerData.java` were rechecked at `99b940733a9f6bc409457dba7108f08421d81e42`.

Confirmed:
- `AclCache` is immutable: its `aclsByResource` and `aclsById` fields are final, and `addAcl/removeAcl` return newly constructed caches rather than mutating an existing cache.
- `StandardAuthorizerData.aclCache` is a plain reference.
- Incremental `addAcl/removeAcl` replace only that inner plain `aclCache` reference; they do not replace the outer `StandardAuthorizer.data` reference.
- `StandardAuthorizer.data` is volatile, but the volatile publication edge applies when `data` itself is reassigned, not automatically to later writes performed through the already-published `StandardAuthorizerData` object.
- `loadSnapshot()` constructs a new `StandardAuthorizerData` and assigns it to volatile `data`; that is a real publication path, but it is distinct from steady-state incremental ACL updates.

### 🔴 Interpretation
Do not use volatile `StandardAuthorizer.data` as proof of W1→D1 publication for incremental ACL deltas. The concrete path remains:
`W1 → StandardAuthorizerData.removeAcl/addAcl → plain aclCache replacement → D1 plain aclCache read`.
No JMM synchronizes-with edge has been identified in this direct cache layer.

The immutable `AclCache` guarantees structural snapshot coherence and safe initialization of its final fields, but it does not by itself publish the new `StandardAuthorizerData.aclCache` reference to another thread.

### 🟡 State preserved
- W1→ENQUEUE JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- stale ACL read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.
- AB105.116R: PROTECTED / UNCHANGED.
- AB105.117R: NOT_CREATED.
- TLC: NOT_RERUN.

### DO-NOT-REPEAT
Do not repeat the direct `AclCache`/`StandardAuthorizerData` primitive audit unless a new pinned-source discrepancy appears. Do not reinterpret snapshot-load volatile publication as incremental-update publication. Do not add artificial synchronization to the diagnostic.

### Next frontier
Continue only with a concrete external production bridge between the MetadataLoader/AclPublisher incremental update and request-serving authorization. If no such bridge is found, preserve UNKNOWN rather than claiming universal absence.


## 2026-10-06 — Run #21 cache-probe evidence reconciled: stale snapshot not observed, ordering still open

### 🟢 Evidence received/reviewed
The complete Run #21 cache-probe artifact was reviewed and reconciled as an observational result. The evidence reports 10/10 cycles with W1 and D1 present, and D1_RESULT=DENIED in all 10 cycles.

For the corresponding ACL-removal cases, D1 observed targetPresent=false, targetId=NONE, cacheCount=0, and the same AclCache object identity associated with the corresponding W1-produced cache on the broker under test.

The reported per-cycle reconciliation pairs W1 and D1 by ACL id / cycle sequence rather than by textual line position. The reported examples include cycle 1 with W1 and D1 both observing cacheIdentity=682579460, W1 timestamp 236977495882 and D1 timestamp 236988737420. The supplied 10-cycle table reports matching W1/D1 cache identities for every reconciled case, with the noted duplicate identity in cycle 9 handled by id/sequence rather than textual position.

### 🟢 Runtime topology strengthened
W1 was observed on metadata-loader event-handler threads (kafka-0-metadata-loader-event-handler / kafka-3000-metadata-loader-event-handler) while D1 ran on data-plane request-handler threads. The diagnostic introduced no volatile/synchronized/latch/barrier synchronization between W1 and D1.

### 🟡 What Run #21 now establishes
- Real broker execution: observed.
- W1: 10/10 cycles observed.
- D1: 10/10 cycles observed.
- D1 stale ACL snapshot: NOT OBSERVED in 10/10 reconciled cases.
- W1/D1 cacheIdentity correspondence: observed in the supplied artifact reconciliation.
- D1 snapshot observability: confirmed.

This is materially stronger empirical evidence than a mere line-order comparison because the reported pairs are associated by ACL identity/cycle and cache identity.

### 🔴 What it does NOT establish
The artifact does not contain ENQUEUE, DEQUEUE, AUTH_ENTER, or AUTH_DECISION events. Its NEXO_ORDER sequence is limited to the A1/D0/D1 family. Therefore Run #21 does not establish the complete same-request chain: W1 → ENQUEUE(correlationId) → DEQUEUE(correlationId) → AUTH_ENTER(correlationId) → D1.

The observed System.nanoTime() ordering is execution-time evidence only; it is not by itself a Java Memory Model happens-before relation.

Therefore W1→ENQUEUE JMM HB = UNKNOWN; W1→D1 JMM HB = UNKNOWN; stale ACL visibility = NOT OBSERVED / NOT DISPROVEN universally; vulnerability = NOT ESTABLISHED.

### 🟡 Experimental consequence
This result closes another redundant direction: do not add more identical W1/D1 cache snapshots merely to increase the 10/10 count. The remaining high-value question is causal/request-path identity, not another cache observation.

The next discriminator remains the existing PR #97 instrumentation, which already records D1 requestContext.correlationId() and the recovered G0 witness emits ENQUEUE/DEQUEUE/AUTH_ENTER/AUTH_DECISION correlation IDs. No new AclCache modification is warranted.

### DO-NOT-REPEAT
- Do not rerun another cacheIdentity-only snapshot probe for the same hypothesis.
- Do not treat nanoTime ordering as JMM HB.
- Do not manufacture a W1→request shared variable or synchronization edge.
- Do not modify PR #97 merely to add correlationId; it already contains the required D1/request identity instrumentation.
- Do not reopen AB105.116R / create AB105.117R / rerun TLC.

### Provenance note
This checkpoint records the supplied Run #21 artifact reconciliation as experimental evidence. The numerical pairings above are not independently re-fetched in this checkpoint; they are preserved as reported evidence and should not be promoted beyond that epistemic status until the raw artifact is independently re-opened if needed.

### Current canonical state
- PR #97 head: 23c71ece22e37a788a48b0e767b121482570f6d9.
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.
- W1→ENQUEUE JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NO CONCRETE EDGE IDENTIFIED.
- stale ACL read: NOT OBSERVED in Run #21 / NOT DISPROVEN universally.
- vulnerability: NOT ESTABLISHED.
- AB105.116R: PROTECTED / UNCHANGED.
- AB105.117R: NOT_CREATED.
- TLC: NOT_RERUN.
