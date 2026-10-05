# NEXO MASTER EVIDENCE MAP — 2026-10-04

## Purpose
Recovery index to prevent continuity loss. This file is an inventory map, not a new AB checkpoint and does not replace AB105.116R.

## Recovery rules
- Never promote temporal order to JMM happens-before.
- Never treat a documented run as raw evidence unless its artifact/log is recoverable.
- Never rerun TLC while the ordering audit is open.
- Never create a new AB105.117R.
- Do not repeat an experiment already closed unless the raw evidence is missing and a distinct recovery question exists.
- Classify findings: VERIFIED / OBSERVED / TEMPORAL / UNKNOWN / CONFLICT / SUPERSEDED / DUPLICATE.

## Canonical protected boundary
- AB105.116R remains the protected research anchor.
- Kafka experiment pin: 99b940733a9f6bc409457dba7108f08421d81e42.
- Current G0 ordering boundary: f2b8298e1fb1aec9044df6ad048b3fe6d7b877ce.
- Current JMM snapshot audit checkpoint: d6c2ac31843861bf02a6bb793a5ceb6336e0dd7e.
- No new AB105.117R created by this recovery map.

## Major recovered evidence families

### AB104 foundation / safety model
Recovered continuity shows a large AB104 chain and repeated audit checkpoints. Important fixed findings:
- AB104.197: valid CommitRecord -> reconstruction, not handler replay.
- AB104.212: crash != execution result.
- AB104.368: authority A and target T are independent; A VALID + T UNKNOWN => UNKNOWN/STOP; A UNKNOWN + T VALID => UNKNOWN/STOP.
- AB104.728: reducer error coverage UNKNOWN.
- GLOBAL-AUDIT-109: STOP REQUESTED != ENFORCED; REVOCATION ISSUED != ENFORCED EVERYWHERE; AUTH CACHE HIT != CURRENT AUTHORITY; FENCE ISSUED != ENFORCED.
- AB104.741+ continuity commits and later AB104.768R show multiple recovery/fork corrections. These must be treated as historical evidence to reconcile, not blindly as the current anchor.

### AB105 minimum model / TLC
- AB105.111R: RECIBIDO != ADMITIDO; finite minimum model; authority/STOP/fence/effects/replay/reconstruction/atomicity/UNKNOWN.
- AB105.112R: finite-space audit; UNKNOWN reachable; SAFE_WAIT != illegal deadlock.
- Historical TLC: run 36781846063 / job 110113752493; commit ec15…; TypeOK cartesian upper bound 4.46e18; several declared states were unreachable.
- TLC is FROZEN for the current ordering audit.

### G0 runtime progression
PR chain recovered:
- #79 compile observability gate.
- #80 runtime execution gate.
- #81 corrected pinned-Kafka API compile gate; D1 must use real authorization path.
- #82 controlled 2-broker discriminator.
- #83 NEW D1 before target-local ACL revocation.
- #84 new-request timing experiment; did not complete full witness.
- #85 metadata warmup correction; not independent evidence.
- #86 isolates WRITE revocation from DESCRIBE metadata authorization.
- #87/#88/#89 JMM diagnostic family.
- #90/#91 harness validation/type fixes.
- #92 cache-identity diagnostic.
- #93 exact authorize snapshot diagnostic.
- #94 real-broker ordering witness.
- #95 100-cycle visibility sample; historical run reference not currently recoverable.
- #96 producer-prewarm latency diagnostic; no associated head-SHA workflow run found.

### Real-broker raw evidence
- Run 370778: 240 NEXO_ORDER events / 10 cycles; ordering markers observed.
- Artifact: 11265332252; SHA-256 d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c.
- 140/140 markers reconciled.
- 10/10 cycles: W1 < D1 ENQUEUE < DEQUEUE < AUTH_ENTER < AUTH_DECISION=DENIED.
- The 20 ENQUEUE/DEQUEUE/AUTH markers were reconciled: 10 D1 and 10 later ALLOWED requests.
- Cycles 7 and 9 showed a second ACL_W1 after D0_RETURN; therefore D0_RETURN != W1.
- W1 < ENQUEUE is temporal only; no W1 -> producer/request happens-before was established.

### Exact aclCache / authorization path
Pinned source audit recovered:
- authorize() -> findAclRule().
- Exact read: AclCache aclCacheSnapshot = aclCache.
- Same snapshot reference is used through the authorization operation.
- W1 creates a new immutable cache and assigns aclCache = new snapshot.
- aclCache is plain/non-volatile.
- Therefore the precise unresolved question is whether a later authorization can legally observe the older cache object across the publication boundary.
Status:
- exact read site: VERIFIED
- single snapshot per authorization: VERIFIED
- stale snapshot observed: NOT OBSERVED
- stale snapshot impossible: UNKNOWN
- W1 -> authorization JMM HB: UNKNOWN
- security impact: UNKNOWN / NOT ESTABLISHED

### PR #93 executed JMM snapshot diagnostic
Run 37040417803 / job 110948877687; pinned Kafka.
Latest canonical checkpoint records:
- 100 iterations, 4 readers.
- 4,071,307 observations.
- POST_RETURN_ALLOWED=0.
- POST_RETURN_PRE_REMOVE_CACHE=0.
- POST_RETURN_PRE_REMOVE_SNAPSHOT=0.
- POST_RETURN_POST_REMOVE_CACHE=3,941,104.
- POST_RETURN_POST_REMOVE_SNAPSHOT=3,941,104.
- OVERLAP_ALLOWED=78,521.
- UNEXPECTED=0.
Interpretation: no post-return stale snapshot or post-return ALLOWED was observed in this diagnostic. This is executed evidence, not a formal JMM proof and not a real-broker exploit witness.
The earlier 2,939,007 figure is superseded for this same run by the recovered raw job log; the count discrepancy is resolved.

### Producer -> broker causal gap
Recovered source/audit conclusion:
- test thread calls producer.send() after D0_RETURN.
- KafkaProducer.send() is asynchronous/buffered.
- request later reaches broker networking / RequestChannel.
- W1 occurs on MetadataLoader/AclPublisher callback path.
- RequestChannel queue publication establishes producer-thread -> request-handler publication for actions before ENQUEUE, but does not create a universal metadata-thread -> RPC-authorizer HB edge.
- No identified production synchronization closes W1 -> authorization globally for incremental aclCache publication.
Status: temporal witness VERIFIED; causal/JMM edge UNKNOWN.

### Append / E path
Recovered source trace:
handleProduceRequest -> authorization -> authorizedRequestInfo -> ReplicaManager.handleProduceAppend -> appendRecords -> appendToLocalLog / UnifiedLog.appendAsLeader.
No second generic TOPIC ACL authorization was identified between the request authorization result and append.
The E accessor compiles against pinned Kafka using BrokerServer.logManager().getLog(...).map(UnifiedLog::logEndOffset), but the referenced compile-only gate did not invoke the exact accessor.
Therefore the missing full chain remains:
W1 -> stale snapshot -> D1 ALLOWED -> same request -> append/E increment.
Status: UNKNOWN.

## Historical artifacts that must NOT be counted as fresh evidence
- Run 370790 is documented in later continuity text, but direct run/jobs/artifact lookup currently returned 404 and search did not recover the raw artifact.
- Therefore 370790 is historical/documented only until independently recovered.
- PR #95/#96 head SHAs currently have no associated workflow runs through fetch_commit_workflow_runs; this does not prove that no other historical SHA/workflow execution exists.

## Known contradictions / recovery targets
1. AB104 continuity contains many sequential checkpoint commits plus later fork/collision corrections. Need a chronological graph, not a single linear list.
2. PR #93 observation count discrepancy: RESOLVED. Raw job log for run 37040417803 reports 4,071,307; the earlier 2,939,007 figure is superseded for that run.
3. Historical 117R references exist in archaeology, but this map must not create a new 117R.
4. Documented run != recoverable raw artifact.
5. D0_RETURN != W1.
6. W1 < ENQUEUE != W1 HB D1.
7. No stale observation != stale observation impossible.

## Recovery work still pending
- Build chronological graph of AB104/AB105 continuity commits.
- Map every PR to its parent/child experiment family and deduplicate.
- Map every documented workflow run to recoverable raw artifact, or explicitly mark unrecoverable.
- Reconcile all count discrepancies.
- Identify all claims that were later superseded or contradicted.
- Produce a final evidence matrix: CLAIM -> SOURCE -> RUN -> ARTIFACT -> RECONCILIATION -> STATUS -> NEXT TEST.

## DO-NOT-REPEAT
- Do not rerun TLC.
- Do not repeat PR #93 exact 100-iteration snapshot diagnostic.
- Do not repeat PR #92 cache census.
- Do not add latch/volatile/barrier/Future gate.
- Do not equate D0_RETURN with W1.
- Do not promote W1 < ENQUEUE to JMM HB.
- Do not claim vulnerability or safety without the missing causal chain.


## 2026-10-04 — synchronization-edge audit continuation

### New source-level constraint recovered
The Kafka Authorizer contract explicitly states that authorization and ACL updates are concurrent/thread-safe operations, and that `authorize()` is a synchronous API intended to use locally cached ACLs. This establishes the concurrency model, but **does not by itself establish a W1→D1 JMM happens-before edge**. citeturn0search2

The current StandardAuthorizer structure also confirms that the outer `data` reference is volatile and that `authorize()` snapshots that reference before delegating to the contained data object. The remaining race question is therefore narrower: whether mutation/publication of the nested plain `aclCache` becomes visible to a later authorization when `data` itself is not republished. citeturn0search0turn0search4

**Status:** 🔵 narrowed UNKNOWN.  
- Thread-safety contract: VERIFIED.  
- `data` volatile publication: VERIFIED at source level.  
- Nested `aclCache` visibility through that boundary: UNKNOWN.  
- W1→D1 HB: UNKNOWN.  
- Vulnerability: NOT ESTABLISHED.

### Audit decision
Do **not** add synchronization to the experiment. The next source trace remains:
`Producer.send → client/network path → broker socket → RequestChannel → request handler → authorize`
and independently:
`MetadataLoader → AclPublisher → StandardAuthorizerData.addAcl/removeAcl → aclCache publication`.

The objective is to identify an **existing production synchronization/publication edge**, not manufacture one.


## 2026-10-04 — critical publication finding

Source-level inspection sharpened the race model:

- StandardAuthorizerData is explicitly documented as not thread-safe.
- Its aclCache field is a plain field.
- addAcl/removeAcl replace that field inside the existing StandardAuthorizerData object.
- StandardAuthorizer.data is volatile, but those ACL mutations do not assign a new StandardAuthorizer.data object.
- authorize() first reads the volatile data reference, then the nested aclCache reference is read later inside StandardAuthorizerData.authorize().

Therefore the volatile data field is not, by itself, a publication event for every later aclCache replacement. It does not close W1->D1 merely because data is volatile.

This is stronger than the previous UNKNOWN wording, but it is still NOT a vulnerability proof: the actual execution/publication edge from the metadata publisher thread to the authorization thread must still be identified, including any lock/queue/volatile/monitor edge.

Status: HIGH-VALUE SOURCE FINDING / causal edge still UNKNOWN.

Next exact target: inspect the production metadata-publisher execution mechanism and the broker request-handler execution mechanism for an existing synchronization edge. No experimental synchronization is to be added.


## 2026-10-04 — publisher/request execution-edge finding

Fresh source evidence confirms ACL mutation is executed through the broker metadata publication event machinery: BrokerMetadataPublisher/BrokerMetadataListener invoke StandardAuthorizer ACL updates from a KafkaEventQueue EventHandler thread. This establishes the writer execution context, but not yet a cross-thread happens-before edge to data-plane authorization.

The key distinction is now explicit: the metadata EventHandler serializes work within its own queue, while authorization runs on broker request-handler threads. We still need the exact handoff between these execution domains before deciding visibility.

Status: 🟢 writer execution path identified; 🔵 W1→D1 publication/HB remains UNKNOWN.

Do not infer safety from queue serialization alone, and do not infer vulnerability from the plain field alone.

Next: inspect the exact KafkaEventQueue handoff and request-handler scheduling path for an existing publication edge.


## 2026-10-04 — cross-thread boundary narrowed

The audit now separates two publication mechanisms:
1. Metadata-side enqueue → KafkaEventQueue event-handler: the queue uses a ReentrantLock/Condition and a dedicated event-handler thread, so queue insertion/consumption is a real synchronization boundary for the metadata event itself.
2. Data-plane network → RequestChannel → KafkaRequestHandler: requests are handed to dedicated request-handler threads through the request channel; the handler then invokes API authorization on that thread.

Critical result: the first boundary publishes into the metadata event-handler domain, but the evidence found so far does NOT show that completion of the ACL mutation establishes a happens-before edge to a later RequestChannel/request-handler execution. Therefore W1→D1 remains UNKNOWN. Temporal ordering W1 < ENQUEUE is still not equivalent to JMM HB.

🟢 Event-handler/request-handler execution domains identified.
🔵 Cross-domain W1→D1 publication edge still unresolved.

Next exact target: inspect RequestChannel's concrete queue implementation and the metadata-to-request path for any shared synchronization/volatile/future/monitor edge that could publish aclCache.


## 2026-10-04 — RequestChannel does NOT close W1→D1

RequestChannel inspection confirms the network/request handoff is a producer-consumer boundary: the network side enqueues a Request and KafkaRequestHandler dequeues it. That queue handoff provides the normal synchronization/publication semantics needed to safely transfer the Request object to the handler thread.

Critical audit consequence: this does NOT publish the earlier metadata-thread aclCache write. The metadata EventHandler writes aclCache before the client request is later enqueued, but the metadata thread does not perform that enqueue. Therefore RequestChannel synchronization can establish publication of request-object state from network processor → request handler, but cannot be used as proof of metadata EventHandler W1 → request-handler D1 happens-before.

🟢 RequestChannel producer/consumer boundary identified.
🟢 It is a real inter-thread handoff.
🔵 It does not bridge the independent metadata writer to D1.
🔵 W1→D1 JMM edge remains UNKNOWN.

Next exact target: inspect whether the metadata publication completion itself crosses into a shared broker state/volatile/lock that the network/request path later reads before authorization. If none exists, the causal edge remains formally unresolved rather than being declared vulnerable.


## 2026-10-04 — no hidden broker-state bridge found yet

The next source pass confirms the production topology: BrokerServer installs AclPublisher as a metadata publisher, while KafkaApis/DataPlaneRequestHandlerPool separately handles data-plane requests. StandardAuthorizer.authorize() reads the volatile outer data reference and then delegates to StandardAuthorizerData.

Important: the volatile outer data field is not written by addAcl/removeAcl in the normal incremental path; those methods mutate the existing StandardAuthorizerData. Therefore the visible @volatile boundary in StandardAuthorizer is not a demonstrated publication mechanism for each ACL update. Kafka's own KIP-801 explicitly states that authorization is multi-threaded while metadata ACL records are applied in order.

No concrete broker-state read/write bridge has yet been identified that turns metadata ACL application completion into a happens-before edge before an arbitrary later data-plane authorization. Status remains:
🟢 production topology confirmed;
🟢 incremental mutation remains inside StandardAuthorizerData;
🔵 W1→D1 HB unresolved;
🔵 vulnerability/safety impact unresolved.

Next: inspect the exact MetadataLoader/AclPublisher completion semantics and whether any request-admission/authorizer readiness gate is reused after initial startup. Do not confuse the initial-load future with per-ACL-update publication.


## 2026-10-04 — readiness gate is startup-only, not per-update publication

A high-value distinction is now verified: StandardAuthorizer has an initialLoadFuture used by start() so listeners wait for initial authorization metadata before normal request processing. completeInitialLoad() publishes the new data reference and completes that future. This gate protects startup readiness, not each subsequent ACL mutation.

The incremental addAcl/removeAcl path still calls data.addAcl/data.removeAcl without completing or replacing the initial-load future. Therefore the startup readiness mechanism cannot be used as a per-ACL-update W1→D1 happens-before edge.

KIP-801 explicitly says StandardAuthorizer is multi-threaded and continues authorizing while ACL records are applied in order; initialization is a separate concern. This sharply removes one possible hidden bridge.

🟢 Startup readiness gate identified.
🟢 It is not a per-update publication mechanism.
🔵 W1→D1 HB remains UNKNOWN.

Next: inspect AclPublisher/MetadataLoader per-update callback completion and whether any shared future/lock is awaited by the request path after ACL changes. If not, the causal bridge remains absent from identified production mechanisms.


## 2026-10-04 — publication bridge still not demonstrated

Latest source pass confirms a negative result: BrokerMetadataPublisher.publish() invokes StandardAuthorizer.addAcl/removeAcl from the KafkaEventQueue EventHandler context, but completion of publish is not itself a Java Memory Model publication primitive to arbitrary request-handler threads. KIP-801 explicitly requires ACL records to be applied in order while StandardAuthorizer remains multi-threaded and continues authorizing operations during record changes.

The current StandardAuthorizer source retains a volatile outer data reference, but incremental addAcl/removeAcl still delegate into the existing StandardAuthorizerData rather than assigning data. Thus no per-update volatile write has been demonstrated. The current source comment mentioning a read-write lock is not sufficient evidence of an actual lock edge; executable code must be treated as authoritative.

Status: writer context VERIFIED; ordered ACL application VERIFIED; no per-update completion future to request handlers identified; W1→D1 JMM publication edge UNKNOWN; exploit/safety conclusion UNKNOWN.

Next: inspect the exact KafkaEventQueue enqueue/dequeue implementation and then the pinned Kafka revision for any concrete monitor/volatile/lock operation connecting metadata event-handler completion to later request-handler authorization. If none exists, document that absence carefully rather than promoting it to a formal race proof.


## 2026-10-04 — KafkaEventQueue boundary classification

The pinned-source URL could not be directly opened through the web source interface, so no new pinned-source claim is promoted from that failed lookup. Existing evidence remains sufficient to classify the queue boundary conservatively: KafkaEventQueue synchronization establishes ordering/publication for events crossing that queue, but only between the queue producer and its EventHandler. The ACL mutation occurs inside that EventHandler; the later request authorization is not a consumer of that same event queue.

Therefore the queue's internal synchronization cannot by itself establish W1→D1 happens-before. This is a structural argument about the participants of the synchronization edge, not a claim that stale visibility has been proven.

Status: 🟢 queue-local synchronization boundary; 🔵 W1→D1 remains UNKNOWN; 🔴 no vulnerability claim.

Next: use repository/source evidence at the pinned revision to identify the exact queue fields/locks and independently verify that no shared queue state is subsequently read by the request-handler path.


## 2026-10-04 — broker request state is independent from metadata queue state

The source pass confirms BrokerServer owns the data-plane request processor/request-handler pool separately from the metadata publication machinery. The visible broker lifecycle fields include a dataPlaneRequestProcessor and dataPlaneRequestHandlerPool, while metadata publication uses its own event-queue path. No shared KafkaEventQueue state was identified as being consumed by the request-handler path.

This does not prove absence of every possible JMM edge, but it removes the specific hypothesis that the request handler implicitly consumes or drains metadata queue state. Therefore queue-local synchronization cannot be promoted into W1→D1 publication.

🟢 Separate execution structures verified.
🔵 W1→D1 remains UNKNOWN.

Next: reconcile this structural source result against the pinned experimental witness and then inspect whether any authorizer-specific lock is taken by both ACL mutation and authorize().


## 2026-10-04 — no shared authorizer lock identified

Fresh source inspection finds no lock in StandardAuthorizerData protecting both mutation and authorization. StandardAuthorizerData is explicitly documented as not thread-safe; aclCache is a plain field. addAcl/removeAcl replace aclCache inside the existing data object, while StandardAuthorizer.authorize() snapshots the outer data reference and then calls curData.authorize(). The Authorizer API itself describes authorize() as synchronous and intended for locally cached ACLs on request threads.

Important correction to avoid overclaiming: the current StandardAuthorizer source comment says a read-write lock synchronizes data, but the executable methods shown do not perform such a lock around incremental addAcl/removeAcl/authorize. Therefore the comment cannot be treated as proof of a shared lock edge.

🟢 No executable shared authorizer lock found in the inspected source.
🔵 W1→D1 JMM edge remains UNKNOWN.
🔵 Stale-read vulnerability remains UNPROVEN.

Next: reconcile this source finding with the pinned experiment and existing PR93 diagnostic. The key question is now whether the observed zero stale snapshots can be explained by a concrete publication edge, or only by empirical scheduling/implementation behavior.


## 2026-10-04 — PR93 raw-run reconciliation recovered

The previously unresolved PR93 count discrepancy is now resolved at the source level. Workflow run 37040417803, job 110948877687, on pinned Kafka 99b940733a9f6bc409457dba7108f08421d81e42, has recoverable job logs and artifact 11242636371.

Raw job log reports:
CAUSAL_JMM_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=4071307
POST_RETURN_ALLOWED=0
POST_RETURN_DENIED=3941104
OVERLAP_ALLOWED=78521
OVERLAP_DENIED=87
POST_RETURN_PRE_REMOVE_CACHE=0
POST_RETURN_POST_REMOVE_CACHE=3941104
POST_RETURN_UNKNOWN_CACHE=0
POST_RETURN_PRE_REMOVE_SNAPSHOT=0
POST_RETURN_POST_REMOVE_SNAPSHOT=3941104
POST_RETURN_UNKNOWN_SNAPSHOT=0
POST_RETURN_ALLOWED_WITH_PRE_REMOVE_CACHE=0
UNEXPECTED=0

The uploaded artifact is intentionally only a provenance marker (327 bytes) and does not contain the counters; the authoritative raw counters are therefore the recoverable workflow job log. This explains the historical 4,071,307 count. A prior 2,939,007 figure must be treated as superseded for this run unless a distinct artifact/run is identified.

Interpretation remains conservative: this is an empirical diagnostic, not a JMM proof. Zero POST_RETURN stale/pre-remove observations is OBSERVED, not proof that stale visibility is impossible. OVERLAP_ALLOWED=78,521 occurred during the overlapping window and is not evidence of post-return stale authorization.

🟢 Raw run/log recovered and reconciled.
🟢 Pinned revision verified in run.
🟢 No post-return pre-remove cache/snapshot observed.
🔵 JMM publication edge remains UNKNOWN.
🔵 Security impact remains UNKNOWN.


## 2026-10-04 — PR93 vs JMM reconciliation

The recovered PR93 run now gives a clean empirical boundary: 4,071,307 observations, with zero POST_RETURN_ALLOWED, zero POST_RETURN_PRE_REMOVE_CACHE, and zero POST_RETURN_PRE_REMOVE_SNAPSHOT. This is consistent with the observed implementation behavior, but it does not establish a JMM happens-before edge.

The JLS requires an actual synchronization edge (for example, unlock→lock on the same monitor or volatile-write→volatile-read) to create happens-before visibility; absence of observed stale reads cannot manufacture such an edge. Therefore PR93 is evidence about behavior under the tested schedule/runtime, not proof that the stale snapshot execution is impossible.

The most important reconciliation is now: OVERLAP_ALLOWED=78,521 proves the probe can observe ALLOWED outcomes while the causal window overlaps, but the probe saw none after the tested return boundary. This separates overlap behavior from post-return visibility and prevents the two from being conflated.

🟢 PR93 empirical result recovered/reconciled.
🟢 Pinned Kafka revision verified.
🔵 JMM publication edge still UNKNOWN.
🔵 A stale-read execution remains unproven, not disproven.

Next: inspect the exact probe instrumentation boundary to ensure POST_RETURN is anchored to the ACL mutation return rather than to a stronger synchronization point that could silently bias the result. This is an evidence-integrity audit, not a rerun.


## 2026-10-04 — PR93 instrumentation-integrity audit

The exact PR #93 workflow and test source were inspected at draft head 001367b6dc392ad15440cc98aebf282f6f14f3f5.

### Correctly anchored
- writerObservation.enter is captured immediately before removeAcl(id).
- writerObservation.exit is captured immediately after removeAcl returns.
- Post-return classification uses observation.enter > writerObservation.exit.
- Reader observations are reconciled only after writer/readers have joined, so classification fields do not participate in the race.
- The diagnostic does not use a latch, barrier, Future, shared volatile gate, or cross-thread callback to release readers after W1.

Therefore the POST_RETURN boundary is correctly tied to removeAcl() return, not D0_RETURN or a later join.

### Instrumentation caveats
The workflow temporarily adds a ThreadLocal<AclCache> and records the already-read aclCacheSnapshot. This is same-thread diagnostic state, not a cross-thread publication edge, but it can affect timing/JIT behavior.

The reader also performs reflective reads of StandardAuthorizer.data and aclCache before authorization. Reading data is a volatile read. It does not create W1→D1 HB because removeAcl does not perform a corresponding per-update volatile write, but it is still instrumentation-induced synchronization and means the diagnostic is not perfectly neutral with respect to timing/optimization.

The run therefore remains valid as OBSERVED behavioral evidence, but must not be promoted to proof that the uninstrumented production path cannot stale-read.

### Exact pinned-source reconciliation
At Kafka pin 99b940733a9f6bc409457dba7108f08421d81e42:
- StandardAuthorizerData is explicitly documented as not thread-safe.
- aclCache is a plain field.
- removeAcl computes a new cache and assigns aclCache = aclCacheSnapshot.
- findAclRule performs one plain aclCache read and uses that local snapshot through the authorization scan.
- StandardAuthorizer.data is volatile.
- StandardAuthorizer.authorize reads data into curData and then calls curData.authorize().
- Incremental addAcl/removeAcl do not assign a new data object.
- No executable shared authorizer lock was found around both mutation and authorization.

### Request/metadata bridge result
Pinned KafkaEventQueue uses ReentrantLock/Condition for queue insertion and its EventHandler, but that synchronization covers the metadata queue participants.

Pinned RequestChannel uses ArrayBlockingQueue for network-to-request-handler handoff. That gives producer→consumer publication for the Request object, but the metadata EventHandler does not enqueue the request. Therefore RequestChannel synchronization cannot by itself publish the earlier metadata-thread aclCache write.

KafkaRequestHandler receives the Request and invokes the API handler on its request thread. No shared metadata-queue state was identified in that path.

### Epistemic state
🟢 POST_RETURN boundary integrity: VERIFIED for timestamp semantics.
🟢 Queue/request execution domains: VERIFIED.
🟢 Exact aclCache mutation/read path: VERIFIED.
🟢 No executable shared authorizer lock identified: VERIFIED in inspected source.
🟡 PR93 neutrality: LIMITED / timing-affecting.
🔵 W1→D1 JMM HB: UNKNOWN.
🔵 Stale-read execution: NOT OBSERVED, NOT DISPROVEN.
🔴 Vulnerability: NOT ESTABLISHED.

### Next exact target
Do not rerun PR93. Do not add synchronization.

Next source-only target: inspect the complete BrokerMetadataPublisher/AclPublisher callback chain at the pinned revision for any per-update completion, callback, future, monitor, or shared state that is subsequently acquired/read by the data-plane request path. The initial-load future is already excluded as startup-only.


## 2026-10-04 — metadata-cache volatile bridge ordering audit

A potentially hidden bridge was checked at the pinned Kafka revision.

BrokerMetadataPublisher.onMetadataUpdate first executes metadataCache.setImage(newImage), then later invokes aclPublisher.onMetadataUpdate(...). The ACL publisher then calls StandardAuthorizer.addAcl/removeAcl, which mutates the plain aclCache field.

KRaftMetadataCache.currentImage is volatile, and setImage performs a volatile write. Therefore this volatile publication occurs BEFORE the incremental aclCache mutation in the same metadata EventHandler execution. A later request-side read of currentImage can establish visibility of writes that precede setImage, but it cannot by itself publish the later aclCache write that occurs after setImage.

The separate KRaftMetadataCachePublisher also only assigns currentImage; no post-ACL cache publication was identified in the inspected production path.

Status:
🟢 metadataCache volatile field: VERIFIED.
🟢 setImage ordering before AclPublisher in BrokerMetadataPublisher: VERIFIED.
🟢 AclPublisher incremental mutation occurs after that setImage: VERIFIED.
🔵 metadataCache volatile read does NOT currently close W1→D1 for the later aclCache write.
🔵 W1→D1 JMM HB remains UNKNOWN.
🔴 no vulnerability claim.

This removes a concrete hidden-bridge hypothesis without claiming proof of absence of every possible bridge.

Next exact target: finish the publisher-installation/order trace and verify whether any later publisher or broker lifecycle callback writes a shared volatile/atomic state after AclPublisher and before data-plane authorization. If none exists, the causal publication boundary becomes substantially narrowed.


## 2026-10-04 — publisher-chain completion audit

The pinned Kafka source was traced one step beyond AclPublisher.

BrokerMetadataPublisher.onMetadataUpdate executes synchronously on the MetadataLoader EventHandler thread. Its order is: metadataCache.setImage(newImage), coordinator/topic/config/quota/SCRAM/token publishers, AclPublisher.onMetadataUpdate, then groupCoordinator.onMetadataUpdate, shareCoordinator.onMetadataUpdate, startup-only replica-manager completion, feature/share-version handling, and finally the outer firstPublishFuture completion in the finally block.

AclPublisher.onMetadataUpdate applies incremental ACL changes synchronously by iterating the ordered delta and calling addAcl/removeAcl. Its completedInitialLoad guard causes completeInitialLoad() only on the first metadata update containing ACL changes; subsequent incremental ACL updates do not call it. Thus completeInitialLoad()/initialLoadFuture remains a startup gate and does not provide per-update publication for W1→D1.

BrokerServer separately constructs dataPlaneRequestProcessor and dataPlaneRequestHandlerPool, then installs metadata publishers through sharedServer.loader.installPublishers. The broker metadata publisher is followed in the publisher list by BrokerRegistrationTracker, but each publisher callback remains part of the same metadata-loader event-handler sequence; no callback/future was identified that is awaited by data-plane authorization on each ACL update.

The outer firstPublishFuture is completed in BrokerMetadataPublisher finally, but it represents first publication/startup and is not a per-ACL-update handoff.

Status:
🟢 AclPublisher incremental mutation is synchronous inside the metadata EventHandler.
🟢 completeInitialLoad is first-load/startup-only, not per-update.
🟢 BrokerMetadataPublisher post-AclPublisher callback order is verified.
🟢 data-plane request processor/handler pool is independently constructed.
🔵 No post-AclPublisher production synchronization edge consumed by D1 has been identified.
🔵 W1→D1 JMM HB remains UNKNOWN.
🔴 Vulnerability/safety conclusion remains unestablished.

This materially narrows the remaining ???: the obvious publisher-chain completion/future candidates inspected so far do not provide a demonstrated per-update bridge to request authorization.

DO-NOT-REPEAT: do not rerun PR93, do not add synchronization, do not rerun TLC.

Next exact source target: inspect the concrete request admission/authorizer invocation path for any read/acquire of broker state that is written after AclPublisher in the same metadata callback. If none exists, document the remaining UNKNOWN as a bounded absence-of-identified-edge result, not as a proof of impossible stale visibility.


## 2026-10-04 — concrete request-admission / authorization path audit

The data-plane path was traced from the broker request handler into KafkaApis and authorization.

### Request side
- KafkaRequestHandler receives a Request from RequestChannel, records dequeue timing, and directly invokes apis.handle(request, requestLocal) on the request-handler thread.
- KafkaApis.handle dispatches PRODUCE to handleProduceRequest.
- handleProduceRequest performs authorization through AuthHelper before the request proceeds to the append path; the authorization result is used to build authorizedRequestInfo and only authorized topic data reaches the produce append machinery.
- The Authorizer contract independently states that authorize() is invoked synchronously on the request thread for each request.

This confirms the D1 reader is the request-handler execution domain, not the metadata EventHandler domain.

### Synchronization consequence
The RequestChannel handoff publishes the Request object from its producer into the request-handler consumer, but nothing in this path shows the metadata EventHandler's prior aclCache mutation being written into the RequestChannel publication. KafkaRequestHandler's local request processing therefore does not create a new metadata-to-request happens-before edge.

The inspected request path also reads ordinary request/metadata state and invokes the authorizer; no shared post-AclPublisher volatile/atomic/monitor state was identified that is acquired specifically before D1 and that would publish the later aclCache write.

### Important boundary
The StandardAuthorizer.data volatile read occurs inside StandardAuthorizer.authorize(), but the incremental ACL mutation path does not write data; it mutates the nested plain aclCache in the existing data object. Thus the D1 volatile read of data cannot be promoted into a W1→D1 publication edge for the later nested cache replacement.

### Epistemic status
🟢 Request-handler → KafkaApis → authorization path identified.
🟢 D1 executes on the request-handler side after RequestChannel dequeue.
🟢 RequestChannel publication is local to request producer → request handler.
🟢 No concrete post-AclPublisher state acquisition bridging metadata EventHandler → D1 identified in the inspected path.
🔵 W1→D1 JMM HB remains UNKNOWN: this is bounded absence-of-identified-edge, not proof that stale visibility is impossible.
🔴 Vulnerability remains NOT ESTABLISHED.

DO-NOT-REPEAT remains: no PR93 rerun, no synchronization added, no TLC rerun.

Next exact target: audit the append-side continuation after D1 and the request-path state reads immediately surrounding authorization, looking only for any shared state that could retrospectively provide publication of aclCache. If none is found, freeze this branch as a bounded causal-gap result and move to full evidence reconciliation (PR84/89/95/96 and documented-vs-recoverable runs).


## 2026-10-04 — D1 → append/E continuation audit

The post-authorization continuation was inspected to determine whether the append machinery introduces any synchronization that could retroactively establish publication from the metadata EventHandler to D1.

### Concrete continuation
- After `AuthHelper` filters the Produce request, `authorizedRequestInfo` is built only from authorized topic data.
- `KafkaApis.handleProduceRequest` then calls `ReplicaManager.handleProduceAppend(...)` for the authorized entries.
- The append operation continues from the same request-handler execution context; it does not return to the metadata EventHandler before the append decision/path.
- The ReplicaManager append/action-queue machinery can synchronize its own partition/delayed-operation state, but those operations occur after D1 and have no metadata-writer participant. They therefore cannot create a W1→D1 happens-before edge retrospectively.
- The append path does not perform a second generic TOPIC WRITE authorization before the records are handed to the local append machinery.

### Causal consequence
The required exploit chain remains exactly:
`W1 → stale aclCache read at D1 → D1 ALLOWED → same request → append/E`

The append-side execution does not supply the missing first arrow. If D1 had already observed the stale authorization state, later append synchronization cannot turn that observation into evidence that W1 was visible to D1.

The source trace therefore closes the post-D1 search for a plausible reverse/retroactive publication bridge, while preserving the distinction between temporal execution order and JMM happens-before.

### Epistemic status
🟢 D1 → authorizedRequestInfo → ReplicaManager append continuation identified.
🟢 No second generic topic authorization identified after D1 in the inspected Produce path.
🟢 Append/action synchronization is downstream of D1 and cannot establish W1→D1 retroactively.
🔵 W1→D1 JMM HB remains UNKNOWN.
🔵 Stale-read execution remains NOT OBSERVED / NOT DISPROVEN.
🔴 Vulnerability remains NOT ESTABLISHED.

### Branch decision
The direct production causal-path audit is now bounded: no identified production synchronization edge closes W1→D1 in the inspected metadata publisher, request admission, authorization, or append continuation.

This is **not** a proof of impossible stale visibility. It is a bounded absence-of-identified-edge result. The next work should therefore switch from inventing further synchronization candidates to full evidence reconciliation: PR84/PR89/PR95/PR96, documented-vs-recoverable workflow runs, historical contradictions, and duplicate/superseded claims.

DO-NOT-REPEAT: PR93 rerun, TLC rerun, experimental latch/volatile/barrier/Future additions, or treating W1 < ENQUEUE as JMM HB.
