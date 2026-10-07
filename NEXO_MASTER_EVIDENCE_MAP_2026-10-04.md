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

🟢 No executable shared authorizer lock found in the inspected source.🔵 W1→D1 JMM edge remains UNKNOWN.🔵 Stale-read vulnerability remains UNPROVEN.

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

## 2026-10-04 — full evidence reconciliation: PR84 / PR95 / PR96 + execution-path integrity

### PR #84 archaeology
🟢 Historical run `36943184415` reached a real Kafka Producer and produced a denial.
🟢 The job log reported `Topic authorization failed`.
🔴 The run failed because the harness did not observe its `D1_AUTH_DECISION` latch within timeout; no complete recoverable A1→D0→D1→D2→E witness was emitted.
Therefore PR #84 is NOT target-race evidence and is NOT an independent sample. Later PR #86 remains the valid recovered propagation-window result.
Source checkpoint: `13f92dc0b6ffc25c7ae5d37b91fe4873eb8014cb`.

### PR #95 execution-path reconciliation
🟢 Branch/workflow configuration was inspected.
🔴 The claimed 100-cycle visibility branch was not included in the workflow's declared push trigger; the workflow also reconstructs the harness from the ordering-witness workflow rather than directly establishing the claimed 100-cycle executable source.
Therefore PR #95 = EXECUTION-PATH UNVERIFIED; its 100-cycle claim is not accepted as runtime evidence.
Source checkpoint: `c509333539d3980c913a1f5b8b86a4d20f76e6b1`.

### PR #96 prewarm reconciliation
🟢 The claimed producer prewarm was inspected.
🔴 The workflow reconstructs `NexoG0OrderingWitnessTest.java` from historical commit `a3aaae3a...`, whose source lacks the claimed prewarm.
Therefore PR #96 = IMPLEMENTATION UNVERIFIED; no runtime result is accepted from it.
Source checkpoint: `f3347281472a78f368c585c78de701f8b43258c8`.

### Visibility-probe integrity
🟢 The executed-head audit established that the two accepted JMM diagnostic witnesses used executed head `0388dce81a2e08dd90f96f6806fe74683ed6f543`, and the classification refactor preserved the `observation.enter > writerObservation.exit` criterion without adding race synchronization.
🟢 The probe-neutrality audit correctly rejects shared logging/PrintStream as a visibility primitive.
🔵 Even a neutral snapshot-identity observation would remain empirical evidence, not JMM proof.
Sources: `f554a0733920e6174395059fff11d9548b21c14c`, `3d1f67ede6380814a7517656657207888cbb6b78`.

### Missed-gap reconciliation
🟢 A retrospective review identified the recurring acceptance failure: PR/branch/documentation is not execution. Acceptance requires:
`workflow trigger compatible → run ID → job ID → executed steps → artifact/raw evidence → commit/pin concordant`.
🟢 The review also confirms there is no accepted control-vs-experiment runtime pair for the visibility experiment.
🔵 Cache-identity mismatch alone is insufficient to classify stale-read without reconciling the exact prior cache/update sequence.
Source checkpoint: `acfacf21e739738e85788761b6c4aeabe650e5e7`.

### Reconciliation outcome
- PR #84: HISTORICAL FAILED / NOT TARGET-RACE EVIDENCE.
- PR #95: EXECUTION-PATH UNVERIFIED / NOT ACCEPTED.
- PR #96: IMPLEMENTATION UNVERIFIED / NOT ACCEPTED.
- PR #93: EXECUTED empirical JMM diagnostic; raw run recovered and valid as OBSERVED, but not JMM proof.
- PR #94: real-broker ordering witness family; bounded temporal evidence only.
- No newly recovered item changes AB105.116R.
- No AB105.117R created.
- No TLC rerun.
- No new vulnerability conclusion.

### Evidence acceptance gate (now mandatory)
For future experiment claims, require all six links to reconcile before promotion:
1. trigger/path,
2. run,
3. job,
4. executed head/pin,
5. raw artifact/log,
6. semantic interpretation.
Missing any link => PENDING/UNKNOWN, not runtime evidence.
## 2026-10-04 — PR #87–#93 family reconciliation

### Family map

#### PR #87 — direct JMM race
🟢 The harness design is a direct in-process StandardAuthorizer race: writer calls removeAcl(); readers call authorize(); no completion latch, volatile gate, or reader barrier is added after removal.
🔴 No independently reconciled runtime chain was recovered here with the mandatory six-link acceptance gate (trigger/path → run → job → executed head/pin → raw artifact/log → interpretation).
Therefore PR #87 is retained as a diagnostic precursor/design, not promoted as runtime race evidence.

#### PR #88 — causal post-return discriminator
🟢 The harness introduced explicit removeEnter/removeReturn timing and distinguishes post-return observations from temporal overlap.
🔵 This is a methodological refinement over PR #87, not an independent production-path witness.
🔴 No separately accepted raw runtime package was recovered for PR #88 itself.
Therefore PR #88 = diagnostic design / superseded by later reconciled executions, not an independent sample.

#### PR #89 — causal discriminator v2
🟢 The classification logic was refactored to preserve the key criterion observation.enter > writerObservation.exit while keeping the race unsynchronized.
🟢 The accompanying source audit correctly identified that StandardAuthorizer.data is volatile while steady-state aclCache replacement occurs inside the existing StandardAuthorizerData object.
🔵 PR #89 is the methodological bridge to the cache-identity diagnostic; it is not itself an accepted runtime sample.
Therefore PR #89 = superseded diagnostic design/source analysis.

#### PR #90 / #91 — harness compile/API corrections🟢 These PRs address executable-harness correctness (including the topic-name/type API mismatch) rather than changing the scientific race model.
🔴 A compile correction is not runtime evidence. No raw six-link runtime chain from these PRs was recovered that independently changes the evidence map.Therefore PR #90/#91 = mechanical prerequisite/fix lineage, not evidence samples.

#### PR #92 — cache-identity diagnostic
🟢 Two raw-identified executions are recorded:
- run 37034044664, job 110927711849, commit 307fa2e...: POST_RETURN_ALLOWED_WITH_PRE_REMOVE_CACHE=0.
- run 37036029543, job 110934345861, commit 37d5fbe...: POST_RETURN_ALLOWED=0, POST_RETURN_PRE_REMOVE_CACHE=0, POST_RETURN_POST_REMOVE_CACHE=6262072, POST_RETURN_UNKNOWN_CACHE=0, OVERLAP_ALLOWED=14392.
🟢 The second census is the stronger/superseding cache-identity observation because it explicitly classified every post-return reader sample against pre/post-remove cache identity.
🟢 Artifacts are recorded with IDs 11238798341 and 11240635939 and SHA-256 digests in the PR checkpoint.
🔵 These are empirical diagnostics with timing/reflection effects; they do not prove JMM safety, impossibility, or the exact stale-read mechanism.
Therefore PR #92 = ACCEPTED OBSERVED diagnostic evidence, with the second census superseding the first for the cache-identity question.

#### PR #93 — authorize/publication-boundary audit family
🟢 The recovered source audit established the concrete steady-state mutation path: MetadataLoader → AclPublisher → StandardAuthorizer.removeAcl() → StandardAuthorizerData.removeAcl() → plain aclCache replacement.
🟢 The authorization path was traced through StandardAuthorizer.authorize() and StandardAuthorizerData.findAclRule(), including the local aclCache snapshot used for the decision.
🟢 The broker request path was traced to KafkaRequestHandler → KafkaApis → authorization, establishing that D1 executes on the request-handler side.
🟢 The audit also established the RequestChannel distinction: a queue hand-off can publish producer actions before enqueue to the consumer after dequeue, but it does not by itself create a blanket W1→D1 edge for a mutation that occurs independently of that request publication.
🟢 The post-D1 append continuation was inspected; downstream append/action synchronization cannot retroactively establish W1→D1.
🔵 Final result: HB(W1,R1/D1)=NOT_IDENTIFIED in the inspected production paths. This is a bounded absence-of-identified-edge result, not proof of stale visibility.
🔴 No security/vulnerability conclusion is established.
Therefore PR #93 = ACCEPTED SOURCE/ARCHITECTURE + empirical-context family, with its runtime observations remaining behavioral rather than JMM proof.

### Duplicate/supersession decisions
- PR #87 → superseded by the stronger causal-window methodology; no independent accepted runtime sample.
- PR #88 → superseded by PR #89/92 methodology; do not count as a separate experiment.
- PR #89 → superseded diagnostic design/source refinement; do not count as a separate runtime sample.
- PR #90/#91 → compile/API repair lineage; do not count as scientific samples.
- PR #92 first run → retained as historical raw evidence, but second cache census is the stronger result for cache-identity classification.
- PR #92 second run → accepted diagnostic witness; does not establish JMM.
- PR #93 → accepted architectural/source-boundary finding plus recovered empirical context; does not establish JMM HB.
- PR #94 → separate real-broker ordering family; its temporal W1→ENQUEUE→DEQUEUE→AUTH observations must not be merged with PR #92's in-process cache diagnostics.

### Reconciliation result
🟢 No buried PR #87–#93 result found that changes the current epistemic boundary.
🟢 No result from this family upgrades HB(W1→D1) from UNKNOWN/NOT_IDENTIFIED.
🟢 No result establishes stale-read execution.
🟢 Temporal overlap remains observed in the controlled diagnostics.
🟢 Real-broker post-D0 authorization observations remain bounded empirical evidence.
🔴 Security impact/exploitability remains NOT ESTABLISHED.

DO-NOT-REPEAT: PR #87/#88/#89 diagnostic reruns, PR #92 cache-identity reruns, PR #93 rerun, TLC rerun, or adding latch/volatile/barrier/Future synchronization to the race.

Next distinct target: reconcile the remaining PR #94 ordering family against PR #93's RequestChannel/source audit, especially whether the observed W1→ENQUEUE ordering has any legitimate publication consequence for the actual D1 reader. Temporal ordering must remain separate from JMM HB.

## 2026-10-06 — exact RequestChannel/AclPublisher publication-boundary refinement

🟢 At the exact Kafka pin `99b940733a9f6bc409457dba7108f08421d81e42`, `RequestChannel.requestQueue` is an `ArrayBlockingQueue`. `sendRequest()` performs `requestQueue.put(request)`; request-handler consumption uses `poll()` / `take()`. This supports the ordinary queue hand-off semantics from ENQUEUE to DEQUEUE.

🟢 The same exact pin shows `AclPublisher.onMetadataUpdate()` applying ACL deltas directly on the metadata-publisher callback thread through `ClusterMetadataAuthorizer.addAcl/removeAcl`. Its source comment explicitly distinguishes this mutation from authorization occurring concurrently on other threads.

🟢 Therefore the source confirms the already-audited boundary: the RequestChannel queue can provide publication for actions performed before ENQUEUE, but the queue itself cannot manufacture a W1→ENQUEUE happens-before edge for the independent metadata-thread ACL mutation.

🔵 This is a source-level refinement of the existing PR #93 / PR #94 reconciliation, not a new runtime experiment and not a new sample. It does not change AB105.116R.

Current epistemic state remains:
- HB(W1→D1): UNKNOWN / NOT IDENTIFIED.
- HB(W1→ENQUEUE): NOT IDENTIFIED.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.
- no new synchronization primitive introduced.

DO-NOT-REPEAT: do not treat ArrayBlockingQueue ENQUEUE→DEQUEUE as W1→D1 publication; do not rerun the G0 witness solely for this source finding.


## 2026-10-06 — exact ENQUEUE producer-side boundary

🟢 At Kafka pin `99b940733a9f6bc409457dba7108f08421d81e42`, the real `RequestChannel.sendRequest(req)` producer path is in `SocketServer.scala` / the network Processor. After a socket receive is completed, the Processor constructs the request and directly calls `requestChannel.sendRequest(req)`.

🟢 This confirms the authoritative G0 distinction at source level: the test request's ENQUEUE is produced by the data-plane network Processor after a completed socket receive, whereas the incremental ACL W1 is performed by `AclPublisher` on the metadata-publisher/MetadataLoader execution path. The source paths are distinct; the RequestChannel hand-off publishes actions already performed by the network producer before its enqueue, not an independent metadata-thread write.

🔵 This is a source-level closure/refinement of the existing W1→ENQUEUE frontier, not a new runtime sample. It strengthens the statement that the observed W1 < ENQUEUE timestamps cannot be promoted to W1→ENQUEUE JMM HB merely because RequestChannel is a BlockingQueue.

The Java API contract independently states that actions in a thread before placing an object into a BlockingQueue happen-before actions after that object is accessed/removed in another thread. citeturn0search0 The missing condition here is precisely that W1 must belong to the producer-thread action chain before ENQUEUE; the audited production source places W1 on the independent metadata path.

Current state unchanged:
- W1→ENQUEUE HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

DO-NOT-REPEAT: do not rerun the ordering witness solely to prove queue semantics; do not interpret W1 < ENQUEUE timestamps as JMM HB.


## 2026-10-06 — reconciliation of metadata callback/future frontier

🟢 Rechecked the previously recorded MetadataLoader/BrokerMetadataPublisher audit before opening another branch. The exact production path is already covered: MetadataLoader's KafkaEventQueue invokes publishers synchronously on the loader thread; AclPublisher performs W1 there; `firstPublishFuture` / publisher-installation futures are startup/readiness mechanisms, not per-update futures consumed by request authorization; the testing-only `waitForAllEventsToBeHandled()` is not in the production ACL/request path.

🟢 The callback-rescheduling mechanism in KafkaRequestHandler is likewise already bounded: it is a real RequestChannel hand-off, but it has no identified causal dependency on the incremental ACL W1 and therefore cannot compose into W1→D1 HB by itself.

🔵 This pass adds no new experiment and no new evidence sample. It confirms that the remaining frontier is not another generic Future/EventQueue/callback candidate. The productive next step is now evidence reconciliation/closure rather than opening duplicate synchronization hypotheses.

Current epistemic state unchanged:
- W1→ENQUEUE HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

DO-NOT-REPEAT: firstPublishFuture, installPublishers future, waitForAllEventsToBeHandled, generic KafkaEventQueue ordering, or callback rescheduling as standalone W1→D1 bridges.


## 2026-10-06 — Valid G0 v2 runtime reconciliation

🟢 A valid real-broker G0 v2 execution is recorded at run `37549856369`, job `112562494993`, head `c478ebf8ef70685a3bc3ffe77358e6622832f278`, artifact `11452027547`, SHA256 `5351aebd5242f1d42c5168a03f89baf53916c1ebc2a64472fc8613643563f29f`.

🟢 The job completed the real-broker witness path successfully. The artifact records Kafka pin `99b940733a9f6bc409457dba7108f08421d81e42`, AB105.116R unchanged, AB105.117R not created, and TLC not rerun.

🟢 Runtime counts: 10/10 D1_RESULT=DENIED; 20 ACL_W1, 20 ENQUEUE, 20 DEQUEUE, 20 AUTH_ENTER, 20 AUTH_DECISION across the 10 cycles.

🔵 This is valid empirical evidence from the same bounded G0 ordering family. It reinforces the observed real-broker behavior but does not by itself create a new JMM edge: W1→ENQUEUE HB remains UNKNOWN/NOT IDENTIFIED and W1→D1 HB remains UNKNOWN/NOT IDENTIFIED. Stale-read remains NOT OBSERVED / NOT DISPROVEN universally; vulnerability remains NOT ESTABLISHED.

🔵 The run should be retained as a distinct valid execution identity, but its temporal ordering must not be promoted to JMM happens-before merely because the full request path executed successfully.

DO-NOT-REPEAT: zero-job runs 37549706571 and 37549855165 are invalid evidence; do not rerun TLC; do not create AB105.117R; do not add synchronization; do not reopen already closed generic MetadataLoader/Future/RequestChannel/SocketServer bridges.


## 2026-10-06 — DynamicConfigPublisher callback boundary closure

🟢 Audited the exact pinned BrokerMetadataPublisher → DynamicConfigPublisher path as a possible indirect bridge from ACL W1 to the SocketServer Processor. BrokerMetadataPublisher invokes DynamicConfigPublisher before AclPublisher; therefore this callback cannot publish a later W1 action by ordering alone.

🟢 At pin 99b940733a9f6bc409457dba7108f08421d81e42, DynamicConfigPublisher.onMetadataUpdate() only enters configuration handlers when delta.configsDelta() is present. It processes TOPIC/BROKER/CLIENT_METRICS/GROUP configuration resources. An ACL-only delta does not invoke those configuration handlers merely because the publisher callback itself is called.

🟢 No inspected DynamicConfigPublisher path creates a per-ACL-update synchronization/publication handoff to SocketServer Processor or RequestChannel ENQUEUE.

🔵 Dedicated audit saved as docs/nexo/NEXO_AB105_DYNAMIC_CONFIG_CALLBACK_BOUNDARY_2026-10-06.md (commit 4fddbe10e880483a73644c8eb633a300b14de774).

Current epistemic state unchanged:
- W1→ENQUEUE HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

DO-NOT-REPEAT: DynamicConfigPublisher generically, unless a new source path shows an ACL delta itself invokes a shared reconfiguration primitive that the SocketServer Processor subsequently acquires.


## 2026-10-06 — AclPublisher ↔ Processor shared-state inventory

🟢 Audited the remaining candidate class: an object/state touched by incremental ACL W1 and subsequently acquired/read by the SocketServer Processor before RequestChannel ENQUEUE. The inspected Processor-side shared objects include RequestChannel, ApiVersionManager, CredentialProvider, socket/selector state and Processor lifecycle state; no ACL W1 write into a Processor-side synchronization object was identified.

🟢 RequestChannel producer publication, Processor lifecycle/startup, DynamicConfigPublisher, and AclCache were already independently bounded and are not reopened here.

🔵 Dedicated source audit saved as docs/nexo/NEXO_AB105_ACLPUBLISHER_PROCESSOR_SHARED_STATE_INVENTORY_2026-10-06.md (commit 8379851b511ffaf87cd7eddaf902d915094db126).

Current epistemic state unchanged:
- HB(W1→Processor): UNKNOWN / NOT IDENTIFIED.
- W1→ENQUEUE HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

DO-NOT-REPEAT: generic Processor lifecycle, RequestChannel, DynamicConfigPublisher, or AclCache searches unless a new concrete source path is identified.


## 2026-10-06 — ApiVersionManager / MetadataCache bridge closure

🟢 Audited the shared MetadataCache held by DefaultApiVersionManager and read by the network Processor's ApiVersions path. BrokerMetadataPublisher performs metadataCache.setImage(newImage) before AclPublisher/W1, while the incremental ACL mutation changes authorizer state rather than MetadataCache. Thus this shared object does not create W1→Processor publication.

🟢 The Processor's ordinary request construction path has no identified metadataCache read that is causally dependent on the later ACL W1 before RequestChannel.sendRequest.

🔵 Dedicated audit saved as docs/nexo/NEXO_AB105_APIVERSION_METADATA_CACHE_BRIDGE_AUDIT_2026-10-06.md (commit 74a57d4e4a2bec775d907c7c1a15836338f35acd).

Current epistemic state unchanged: W1→Processor HB UNKNOWN / NOT IDENTIFIED; W1→ENQUEUE HB UNKNOWN / NOT IDENTIFIED; W1→D1 HB UNKNOWN / NOT IDENTIFIED; stale-read NOT OBSERVED / NOT DISPROVEN; vulnerability NOT ESTABLISHED.

DO-NOT-REPEAT: ApiVersionManager/MetadataCache as a generic W1 publication candidate unless a new source path shows a post-W1 write/read or explicit synchronization handoff.


## 2026-10-07 — metadata admission gate recheck / frontier closure

🟢 Reconciled the remaining metadata-admission candidate against the existing SocketServer request-admission audit. The authorizer futures used by SocketServer.enableRequestProcessing() gate acceptor/Processor startup only; they are not awaited per incremental ACL update. The previously audited metadata version/offset and request-admission paths likewise contain no identified steady-state W1 → Processor gate.

🟢 This confirms that the remaining material frontier is narrower than a generic “metadata gate” search: only a concrete production cross-domain executor/Future, concurrent collection, lock/condition/semaphore, volatile publication, or equivalent admission primitive shared by incremental W1 and the Processor would change the epistemic state.

🔵 This is source-level reconciliation only; it is not runtime evidence and does not prove absence in all future code. No experiment, TLC run, synchronization aid, or AB105.117R was created.

Current epistemic state:
- HB(W1→Processor): UNKNOWN / NOT IDENTIFIED.
- W1→ENQUEUE HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

DO-NOT-REPEAT: startup authorizer futures, generic metadata offset/readiness gates, RequestChannel, Processor lifecycle, DynamicConfigPublisher, ApiVersionManager/MetadataCache, and generic shared-state inventory unless a new concrete production synchronization path is identified.

Next distinct source target: only a concrete cross-domain synchronization primitive that is actually written/released after incremental ACL W1 and acquired/read by the Processor/request path before ENQUEUE.


## 2026-10-07 — cross-domain primitive source sweep / no new W1→Processor bridge

🟢 Rechecked the exact pinned Kafka source for the remaining cross-domain synchronization class, focusing on SocketServer Processor state and the MetadataLoader publication path rather than reopening already closed candidates.

🟢 At pin 99b940733a9f6bc409457dba7108f08421d81e42, Processor has startup/lifecycle atomics (shouldRun/started), its own newConnections ArrayBlockingQueue, responseQueue and selector state; processCompletedReceives() constructs the request and then calls RequestChannel.sendRequest(req). None of these inspected Processor-side primitives is written by incremental ACL W1.

🟢 MetadataLoader's callbacks to publishers run on its event-queue thread. maybePublishMetadata() invokes publishers in order, but the inspected loader path contains no post-W1 Future/Executor/lock/volatile publication that is subsequently acquired/read by SocketServer Processor before ENQUEUE. Its AtomicReference occurrence is used for default metrics provenance, not ACL publication.

🟢 The exact source therefore did not identify a new production synchronization bridge beyond the already bounded RequestChannel producer boundary. No artificial synchronization was added and no runtime experiment was started.

🔵 Epistemic state remains unchanged:
- HB(W1→Processor): UNKNOWN / NOT IDENTIFIED.
- W1→ENQUEUE HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

DO-NOT-REPEAT: generic Processor atomics/queues, MetadataLoader publisher ordering, metrics AtomicReference, RequestChannel, startup futures, DynamicConfigPublisher, ApiVersionManager/MetadataCache, and prior closed bridges unless a new concrete W1 write/release → Processor acquire/read path is found.

Next distinct target remains singular: a concrete production synchronization primitive actually written/released after incremental ACL W1 and acquired/read by the Processor/request path before ENQUEUE.


## 2026-10-07 — authorizer startup-future source recheck

🟢 Rechecked the exact pinned BrokerServer/SocketServer/StandardAuthorizer chain for the only remaining Future-shaped candidate. BrokerServer obtains endpointReadyFutures from the Authorizer, passes them to SocketServer.enableRequestProcessing(), and waits for them during broker startup; SocketServer chains them to Acceptor.start(). StandardAuthorizer.start() returns initialLoadFuture for non-early listeners, and that future is completed by completeInitialLoad().

🟢 Incremental ACL W1 in AclPublisher calls StandardAuthorizer.addAcl/removeAcl directly; those methods mutate StandardAuthorizerData and do not complete, await, or submit work to initialLoadFuture. Therefore this Future path is startup publication only and cannot supply a per-incremental-ACL W1→Processor happens-before edge.

🔵 This source recheck adds no new bridge and does not change the epistemic state. No experiment or new audit artifact was created to avoid duplication.

Current epistemic state remains:
- HB(W1→Processor): UNKNOWN / NOT IDENTIFIED.
- W1→ENQUEUE HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

DO-NOT-REPEAT: StandardAuthorizer.start()/initialLoadFuture, BrokerServer endpointReadyFutures, SocketServer enableRequestProcessing startup chain, unless a future is found that is completed/awaited specifically by each incremental ACL W1.


## 2026-10-07 — NEXO Core semantic distillation from AB104/AB105

🔵 This section is a semantic distillation of already recovered AB104/AB105 evidence. It creates no new runtime evidence and does not reopen the bounded Kafka/JMM branch.

### Canonical epistemic separation
NEXO must never collapse these states:
OBSERVATION != CLAIM != APPRAISAL != CAUSALITY != AUTHORITY != POLICY != DECISION != EFFECT != VERIFICATION.

A temporal observation may support a claim, but timestamp/order alone is not causality. A favorable appraisal is not authority. A decision is not proof that an external effect occurred. An observed effect is not proof that the decision was authorized.

### Safety propagation rules
- UNKNOWN is a first-class state, not an error to coerce into TRUE/FALSE.
- If material assurance required by a Decision Contract is missing, the consequential decision remains UNKNOWN/RECHECK or STOP according to policy.
- STOP REQUESTED != STOP ENFORCED.
- REVOCATION ISSUED != REVOCATION ENFORCED EVERYWHERE.
- AUTH CACHE HIT != CURRENT AUTHORITY.
- FENCE ISSUED != FENCE ENFORCED.
- RECIBIDO != ADMITIDO; ADMITIDO != EFFECT EXECUTED.
- CRASH != EXECUTION RESULT; after crash, unresolved effect state requires reconciliation.

### Authority/target independence
Authority state and target/resource state are independent dimensions. A valid authority with UNKNOWN target state remains UNKNOWN/STOP for a consequential operation; a known target does not compensate for UNKNOWN authority.

### Evidence contract
Decision-relevant evidence must retain at least: exact scope/subject/target, provenance, freshness boundary, dependency/common-mode context, authority epoch/version, policy version, and verification status. Evidence is historical data; appraisal/decision must not silently rewrite it.

### Decision identity and effect identity
Every consequential decision/effect path must be bound to an operation identity and target/effect identity. Duplicate operation arrival is not a new authorization. A missing terminal outcome is UNKNOWN/reconciliation, not permission to execute a second effect.

### Reconstruction boundary
Event/history reconstruction is claim-relative. COMPLETE is permitted only when decision-relevant predecessor/successor coverage, ordering, duplicate/fork resolution, terminality, source-history boundary, and reconstruction version are satisfied. Missing successor != terminal; prefix reconstruction != complete history; timestamp order != causal order.

### Epoch/fencing boundary
Authority is generation-bound. A decision valid under epoch E1 cannot silently authorize execution under current epoch E2 when the contract requires current authority. Epoch advancement, revocation, STOP and fencing must be explicit state transitions with enforceable boundaries; restart does not restore authority by itself.

### Effect verification boundary
DECISION_RECORDED != EFFECT_PROVEN and EFFECT_OBSERVED != AUTHORIZATION_PROVEN. Where external execution cannot be fully observed, the unobservable portion remains explicit UNKNOWN and must be handled by reconciliation/fencing policy.

### Formalization status
These are 🔵 derived architectural rules grounded in 🟢 recovered AB104/AB105 evidence and existing semantic contracts. They are not claims that the NEXO implementation already exists or is formally verified. Current implementation/formal verification remain NOT PERFORMED unless separately recorded.

### Research boundary
Do not reopen the closed evidence taxonomy or AB105 W1→D1 Kafka branch merely to restate these rules. The next architecture-level work should target a concrete unresolved NEXO semantic dependency, with formal verification/implementation only after the semantic contract is frozen.


## 2026-10-07 — S9 authority-promotion / activation boundary reconciliation

🔵 This pass continued the independent S9 trace: identify whether the repository already freezes the exact issuer/action that promotes CURRENT_AUTHORITY_DECISION to authority=VALID after revocation. No Kafka/JMM branch was reopened.

🟢 Existing contracts already cover most prerequisites and the protected nature of the transition:
- T-AUTH-02 defines Authorized admission as requiring current AuthorityContext, exact operation/effect identity, policy/invariant baseline and stop/recovery fences, with a linearization requirement for authoritative acceptance of current authority.
- The transition-variable contract explicitly separates authority state from evidence, verification and external truth; hidden safety-relevant reads are prohibited and critical state changes bind to relevant epochs/versions.
- AB104.563 establishes EPOCH_FENCE != HISTORICAL_ERASURE, VALID_SIGNATURE != CURRENT_AUTHORITY, and VALID_CERTIFICATE != CURRENT_CERTIFICATE.
- AB104.565 establishes that epoch/witness activation itself is a protected semantic boundary with a durable linearization point; crash ambiguity at that boundary remains UNKNOWN/QUARANTINED.
- AB104.567/568 establish that blocked recovery requires an independent recovery authority and a protected transition; a new key, witness set, backup or local snapshot does not by itself create current authority.
- AB104.506 binds protected authorization to authority epoch, revocation generation, dependency closure, fence revision and decision context.
- AB104.359 establishes AUTHENTIC_BRANCH != CURRENT_AUTHORITY and MAX_REVISION != VALID_RESOLUTION when competing recovery authorities exist.

🟢 Historical/exploratory recovery material also shows the correct direction: recoveryAuthorityEpoch is bound to the authority generation that admitted recovery; revocation advances authorityEpoch and invalidates prior recovery authorization. This is evidence for generation binding, not a frozen implementation protocol.

🔵 The remaining S9 gap is therefore narrower than “does Nexo have an activation concept?” It does. The unresolved item is the exact authority-bearing transition record and issuer/serialization boundary that converts a valid CURRENT_AUTHORITY_DECISION into current authority after revocation, including its durable linearization/activation identity and reconstruction semantics.

Required distinction remains:
- AUTHENTIC_EVIDENCE != CURRENT_AUTHORITY
- CURRENT_AUTHORITY_DECISION != AUTHORITY_ACTIVATED
- VALID_SIGNATURE != VALID_PERMISSION
- NEW_EPOCH != CURRENT_AUTHORITY
- REVOCATION_OBSERVED != NEW_AUTHORITY_VALID

For the protected transition, the minimum unresolved questions are: who is authorized to issue/commit activation; what exact decision record is authoritative; which epoch/revocation generation/fence/policy/dependency context is atomically bound; what invalidates it; and what crash/recovery evidence distinguishes pre-activation, activation-committed and post-activation states.

Status:
- Existing semantic prerequisites/activation boundary: 🟢 RECOVERED.
- Exact issuer + authoritative activation record mapping to authority=VALID after revocation: 🔵 UNKNOWN / OPEN.- Implementation: NOT ESTABLISHED.
- Formal verification: NOT ESTABLISHED.
- No AB105.117R created; AB105.116R remains canonical.
DO-NOT-REPEAT: do not create a duplicate generic “proof-obligation” contract, do not reopen AB104.409 replay research, and do not reopen the closed Kafka/JMM branch. Next distinct target is the concrete authority-establishment artifact/record and its issuer/linearization semantics.



## 2026-10-07 — S9 refinement: abstract linearization exists; concrete authority issuer remains open

🟢 The deeper source reconciliation found that S9 does NOT lack an abstract activation/linearization point. Existing architecture already defines:
- T-AUTH-02 Admitted → Authorized, whose linearization requirement is the authoritative acceptance of current authority for the exact effect.
- LP-01 Authorization admission as a critical protected linearization point.
- The transition contract requires OWNER, AUTHORITY_BASIS, read/write sets, linearization point, durability, crash semantics, invalidation triggers, recovery path and verification method.
- A05/A06 requires one authoritative ordering point (or demonstrably equivalent protocol) for every protected transition.

🔵 Therefore the real S9 gap is now narrower and more concrete: the architecture specifies the semantic transition, but the repository still does not freeze the authority-bearing implementation record and issuer/owner that realizes LP-01 and maps CURRENT_AUTHORITY_DECISION to AUTHORITY_STATUS=GRANTED/VALID, especially across revocation races and crash recovery.

This yields a three-layer distinction:
1. CURRENT_AUTHORITY_EVIDENCE — evidence/input.
2. CURRENT_AUTHORITY_DECISION — protected appraisal/decision that the context is currently sufficient.
3. AUTHORITY_GRANT/ACTIVATION at LP-01 — authoritative state transition whose issuer/owner and durable record determine when authority actually becomes current.

🟢 AB104.401 already specifies the semantic requirement: validated appraisal does not itself grant authority; Z1 must perform claim-specific revalidation and a protected final gate. FINAL_AUTHORITY_GATE must have one protected linearization point or equivalent fencing/versioned commit. Therefore creating another generic promotion contract would duplicate existing architecture.

🔵 Remaining exact questions:
- Which protected owner is authoritative for LP-01?
- What durable record is the canonical AUTHORITY_GRANT/ACTIVATION fact?
- What fields bind that record to authority epoch, revocation generation, fence, scope/effect, policy and dependency closure?
- How does revocation order against LP-01?
- What durable states distinguish pre-gate, committed-gate, and crash-ambiguous activation?
- How is LP-01 reconstructed after rollback/recovery without synthesizing authority from evidence alone?

Status:
- Abstract authority transition/linearization: 🟢 RECOVERED.
- Claim-specific final-gate semantics: 🟢 RECOVERED as design input.
- Concrete issuer/owner + canonical authority-grant record + crash/recovery mapping: 🔵 UNKNOWN / OPEN.
- Implementation: NOT ESTABLISHED.
- Formal verification: NOT ESTABLISHED.

DO-NOT-REPEAT: do not create another generic authority-promotion contract; do not reopen AB104.409 or Kafka/JMM. Next target is the concrete LP-01 authoritative record/owner and its crash/recovery semantics.


## 2026-10-07 — CONTINUITY HANDOFF: next-chat recovery anchor

🟢 **Purpose:** explicit recovery instruction for the next chat. This records exactly where the investigation stopped and what has already been done so no work is lost or repeated.

### Canonical state to recover
- Protected AB boundary: **AB105.116R**.
- Kafka pin: **99b940733a9f6bc409457dba7108f08421d81e42**.
- Do **NOT** create AB105.117R.
- TLC remains frozen; do **NOT** rerun it.
- Closed Kafka/JMM branch: W1→D1 causal-path audit is bounded. Do **NOT** reopen generic KafkaEventQueue, RequestChannel, startup futures, DynamicConfigPublisher, Processor lifecycle, MetadataCache/ApiVersionManager, or generic shared-state searches unless a genuinely new concrete production synchronization edge appears.
- AB104.409 replay-safety branch is already covered; do **NOT** restart it merely for continuity.

### Exact point where work stopped
The active architecture frontier is **S9 authority-promotion / activation**.

The question is NOT whether NEXO has an abstract activation concept. It already does. The unresolved question is narrower:

AUTHORITY EVIDENCE → CURRENT_AUTHORITY_DECISION → AUTHORITY ACTIVATION → authority=VALID

**Identify the exact authoritative issuer, activation/transition record, and linearization/commit point that performs this promotion after revocation.**

### Already investigated and established
🟢 Existing architecture/contracts already cover:
- current AuthorityContext and authoritative admission requirements;
- epoch/generation binding;
- revocation generation;
- fence revision;
- dependency closure;
- protected activation as a semantic boundary;
- durable linearization requirement;
- independent recovery authority;
- crash ambiguity at protected transitions → UNKNOWN/QUARANTINED;
- VALID_SIGNATURE != CURRENT_AUTHORITY;
- AUTHENTIC_EVIDENCE != CURRENT_AUTHORITY;
- NEW_EPOCH != CURRENT_AUTHORITY;
- CURRENT_AUTHORITY_DECISION != AUTHORITY_ACTIVATED.

Recovered references include T-AUTH-02 and AB104.563 / .565 / .567 / .568 / .506 / .359 authority/recovery lines. These are existing evidence/contract references, not newly invented implementation.

🔵 **Still OPEN:** exact issuer + authoritative activation record + serialization/linearization boundary that makes authority current after revocation; exact invalidation and crash-reconstruction semantics for that record.

### Required next investigation
Search the repository for the **concrete authority-establishment artifact**, not another generic semantic contract. Prioritize:
1. exact state variable/event/record that represents authority=VALID or CURRENT_AUTHORITY;
2. writer/issuer of that state;
3. authorization required to perform that write;
4. epoch + revocation-generation + fence + policy + dependency context atomically bound to it;
5. durable commit/linearization point;
6. invalidation on revocation/epoch advancement/STOP/fencing;
7. crash states before/during/after activation and deterministic reconstruction;
8. whether multiple issuers can race and what arbitrates them.

### Epistemic discipline
Do not infer an issuer from terminology alone. If source only specifies the contract but not an executable issuer, mark **🔵 UNKNOWN / OPEN**. Do not claim implementation or formal verification unless source/TLA+ evidence establishes it.

### No-loss / no-repeat rules
- Do not create a duplicate proof-obligation contract; that idea was reconciled as already covered by existing ProofContext/ProofResult/ContextCompatibility and Decision Sufficiency architecture.
- Do not reopen AB105 W1→D1 merely to restate semantic rules.
- Do not rerun Run #21, PR #93, G0 witness, TLC, or correlationId-only probe.
- Do not add artificial latch/volatile/barrier/Future synchronization.
- Do not treat temporal order as causality or JMM happens-before.
- Every material new finding must be saved in the master/continuity before moving to the next distinct frontier.

### Last saved checkpoint
Master update commit: **1ac81c7aba895e044c137de018c93c71e5b75290**.
This handoff is the instruction set for the next chat.


## 2026-10-07 — S9 concrete-artifact sweep: LP-01 exists as architecture, issuer remains unresolved

🟢 The repository contains an explicit technology-independent linearization architecture defining **LP-01 Authorization admission** and requiring every protected transition to specify pre-state, read set, guard, exact linearization event, write set, post-state, crash behavior, retry behavior, concurrency exclusions, refinement mapping, and trace evidence. The same architecture states that authorization admission requires the current AuthorityContext and must be durably recorded before AUTHORIZED is exposed.

🟢 AB104.401 independently defines the final evidence-to-authority boundary: evidence/appraisal is not authority; a protected Z1 transition must independently revalidate claim scope, policy/semantic versions, verifier trust, dependency generations, resource incarnation, invalidation generation and authority epoch where applicable. It explicitly separates APPRAISAL_STATUS from AUTHORITY_STATUS and requires a protected final gate.

🟢 AB104.506 supplies the strongest historical protected-authorization binding recovered so far:
`{ClaimDigest, AuthorityEpoch, RevocationGeneration, DependencyClosureDigest, FenceRevision, DecisionDigest}`.
It requires the final protected effect gate to evaluate current revocation generation and states that the authorization/revocation ordering point must be explicit.

🔵 However, the sweep did **not** recover a concrete executable issuer/record in the current Nexo repository that maps `CURRENT_AUTHORITY_DECISION` to `authority=VALID` after revocation. The repository evidence remains architecture/design and formal-model representation rather than an implemented authority-establishment record. The existing AB105.116R `Reauthorize` transition is therefore not evidence of a real issuer; it is the finite-model behavior already known to have unresolved provenance semantics.

🔵 Exact open boundary:
`CURRENT_AUTHORITY_DECISION → [authoritative activation record + issuer] → authority=VALID`.
Still unresolved: authorization of the writer, atomic context binding, durable commit/linearization identity, revocation/epoch/STOP invalidation, crash states, deterministic reconstruction, and concurrent issuer arbitration.

Status:
- LP-01 / protected activation architecture: 🟢 RECOVERED.
- Evidence→authority promotion contract: 🟢 RECOVERED as design evidence.
- Concrete executable issuer/activation record: 🔵 UNKNOWN / OPEN.
- Mapping to real `authority=VALID` after revocation: 🔵 UNKNOWN / OPEN.
- Implementation: NOT ESTABLISHED.
- Formal verification: NOT ESTABLISHED.

DO-NOT-REPEAT: do not treat LP-01's existence as proof of implementation; do not reopen Kafka/JMM, TLC, AB104.409, or create AB105.117R. Next target remains the concrete authority-establishment artifact, if one exists, and its writer/linearization/recovery semantics.

## 2026-10-07 — S9 concrete-artifact trace: historical boundary narrowed, implementation still open

🟢 **New historical evidence recovered:** AB104.390 establishes a strict role separation: EVIDENCE_PRODUCER != EVIDENCE_VERIFIER != AUTHORITY_DECIDER. The verifier produces an appraisal/attestation result; it does not automatically grant operational authority. This is research/design evidence only, not an AB105 implementation.

🟢 **AB104.401 recovered:** the protected promotion boundary is explicitly modeled as EVIDENCE → VERIFICATION/APPRAISAL → ATTESTATION_RESULT → Z1 PRE-AUTHORIZATION CHECK → Z1 AUTHORITY DECISION → PROTECTED TRANSITION. It states that the final checks require a protected linearization point or equivalent fencing/versioned commit, and that CHECK_AUTHORITY != AUTHORITY_COMMIT. It also states that authority grant is not permanent external permission; the external-effect boundary still needs current authority/fencing.

🟢 **AB104.506 recovered:** the strongest historical protected-authorization binding found so far is:
`Authorization = {ClaimDigest, AuthorityEpoch, RevocationGeneration, DependencyClosureDigest, FenceRevision, DecisionDigest}`.
The historical contract requires the final effect gate to validate revocation generation and makes the linearization point explicit. It also requires crash recovery to revalidate prepared-but-uncommitted effects and prevents crash recovery from resurrecting authorization. This is a candidate historical contract, not a frozen AB105 implementation.

🔵 **S9 conclusion:** these artifacts do not identify an executable issuer/writer or a canonical durable AUTHORITY_GRANT record in the current implementation. They do, however, close one ambiguity: the missing piece is **not** another abstract promotion theory. The remaining gap is the concrete realization of the already-defined protected transition: owner/issuer, durable record, commit/linearization, revocation ordering, and crash reconstruction.

🔵 **Status:** abstract promotion boundary = RECOVERED; protected binding fields = RECOVERED as historical design evidence; concrete issuer/record/implementation/formal verification = UNKNOWN / OPEN.

**DO-NOT-REPEAT:** do not create another generic authority-promotion contract. Continue only by locating a concrete authority-establishment artifact/implementation or explicitly mark the repository as lacking one.

## 2026-10-07 — S9 finding: T-AUTH-02 names the transition output, but not a canonical grant record

🟢 **Recovered:** `NEXO_TRANSITION_CONTRACT_STATE_VARIABLE_DECOMPOSITION_V1` defines the Authority domain with `authority_context_id`, `authority_epoch`, `scope`, `basis`, `issuer`, issuance/expiry, revocation state, policy version and invariant version. Its T-AUTH-02 transition is **Admitted → Authorized** and reads exact operation/effect identity, current AuthorityContext, policy/invariant baseline and stop/recovery fences. It says the transition writes a **bound authorization context** and requires the linearization point to be the authoritative acceptance of current authority for that exact effect.

🔵 **Important gap:** this contract still does not name a concrete durable `AUTHORITY_GRANT` event/record, its writer/owner, or the persistence primitive that makes that T-AUTH-02 acceptance the reconstructable source of `authority=VALID`. Therefore T-AUTH-02 identifies the semantic output and required LP, but does not by itself identify the implementation artifact requested by S9.

🟢 **Cross-check:** the formal AB104.594 effect lifecycle model contains `authority=VALID/INVALID` and a `RestoreAuthority` transition, but that transition has no evidence/issuer/epoch/revocation/fence preconditions in the model. It is therefore a lifecycle model, not evidence of a concrete authority issuer or safe reauthorization implementation. We must not treat `RestoreAuthority` as the missing S9 artifact.

🔵 **Result:** S9 is narrowed further: **the repository has a named semantic transition (T-AUTH-02) and an authority state domain, but no recovered concrete durable authority-grant artifact/issuer that realizes it.**

**Next exact search:** trace the implementation-facing names around `bound authorization context`, `authority_context_id`, `issuer`, and the T-AUTH-02 write set, looking specifically for a concrete event/store/record or executable state mutation. Do not create a new contract and do not reinterpret AB104.594 `RestoreAuthority` as implementation.

## 2026-10-07 — S9 implementation trace: authority context remains architectural, not executable

🟢 **Trace result:** searches for the exact implementation-facing terms `bound authorization context`, `authority_context_id`, `issuer + authority_epoch + revocation`, and `boundAuthorization/authorizationContext` recovered architectural/research artifacts (T-AUTH-02, CORE-2, atomicity group G2, A12 canonical model, AB85 renewal evidence, AB104.252 conflict-resolution material), but no executable authority issuer/writer or concrete durable authority-grant record.

🟢 **Useful narrowing:** the strongest recovered executable-looking authority state remains in formal models/docs, not runtime code. The architecture says G2 authorization decision binds `operation_id, effect_id, authority_context_id, authority_epoch, scope, policy_version, invariant_version`; however, this is a required state/atomicity specification, not evidence that a runtime store actually persists it atomically.

🔵 **S9 conclusion:** as of this trace, the repository demonstrates a **semantic authority-context schema and transition contract**, but still does **not establish an implementation artifact that issues, durably commits, reconstructs, and invalidates CURRENT_AUTHORITY**. No issuer should be inferred merely from the presence of `issuer` fields or capability terminology.

**Next exact frontier:** search for concrete runtime/storage primitives and writers that could materialize G2/T-AUTH-02 (event log, authoritative state store, commit record, capability store, or kernel authority mutation). If only design documents are found again, record the implementation gap and move to crash/recovery reconstruction rather than generating another contract.

## 2026-10-07 — S9 runtime/storage trace: no executable authority implementation recovered

🟢 **Concrete-primitives search completed:** targeted searches for event log, commit record, capability store, authority mutation, CURRENT_AUTHORITY store, Java/runtime `AuthorityContext`, and source-tree `AuthorityContext` found only research/design artifacts. No executable writer, authoritative storage implementation, or runtime mutation of authority state was recovered.

🟢 **Recovered semantic candidates, not implementation:** prior research names `AUTH_ISSUE` as a semantic event and discusses commit records / authoritative stores, while AB104.604 lists outbox commit record and etcd revision/CAS as evidence-supplying mechanisms. These are architecture/evidence candidates, not proof that Nexo currently implements either mechanism.

🔵 **S9 implementation gap is now stronger:** the repository currently establishes the *requirements* for an authority issuer and durable linearization, but the searched runtime surface does not establish the actual issuer/store/commit path. Therefore no claim may be made that `CURRENT_AUTHORITY` can presently be issued, durably committed, reconstructed, or invalidated by an implemented Nexo authority plane.

**Next frontier:** move to the already-defined crash/recovery semantics and trace whether recovery has a concrete authoritative source/commit identifier for authority activation. If that also remains documentary, record S9 as an architecture-without-runtime-implementation boundary and stop inventing implementation artifacts.

## 2026-10-07 — S9 crash/recovery trace: activation semantics exist, implementation source remains absent

🟢 **Recovered historical recovery semantics:** AB104.487 explicitly distinguishes PREPARED, OLD_FENCED, NEW_VALIDATED and ACTIVATION_COMMITTED. It states that `NEW_VALIDATED` without `ACTIVATION_COMMITTED` remains non-authoritative; after durable `ACTIVATION_COMMITTED`, recovery may restore NEW_ACTIVE even if acknowledgement was lost; conflicting durable activation records require quarantine. AB104.571 likewise states that a successful conditional commit establishes the new authority boundary, failed commit grants no new authority, and UNKNOWN commit result requires authoritative reconciliation.

🟢 **Identity semantics recovered:** AB104.572/573 bind the final recovery commit to stable `OperationID/RecoveryCommitID`, with recovery generation, authority epoch and fence revision/epoch participating in the candidate identity/binding. This is strong design evidence for crash-safe reconciliation.

🔵 **Critical S9 distinction:** these documents define the exact *recovery semantics* that a concrete authority implementation must satisfy, but searches still found no runtime authoritative store, activation record, commit writer, or implementation that produces `ACTIVATION_COMMITTED` and reconstructs it into `CURRENT_AUTHORITY`. Therefore crash/recovery behavior is specified, not implemented/verified.

**S9 status:** architecture/design boundary is now highly constrained; executable authority activation remains UNKNOWN/OPEN. Next step is not another generic recovery design: inspect whether any existing runtime/storage component in the repository can serve as the authoritative source for these named durable activation states. If none exists, S9 can be closed as an implementation gap and the research frontier can move to the next unresolved architectural boundary.

## 2026-10-07 — S9 authoritative-store trace: storage mechanism explicitly remains open

🟢 **Final trace result:** searching for `ACTIVATION_COMMITTED`, `NEW_ACTIVE`, `CURRENT_AUTHORITY`, and `activation record` recovers only architectural/research definitions. AB104.487 even states that the activation record must bind `NewEpochID + ParentEpochDigest + PreviousAcceptedCheckpoint + NewWitnessSet + Threshold + TrustBasis + PolicyVersion + ActivationRevision`. AB104.488 says only a quorum satisfying the protected epoch-transition rule may create `ACTIVATION_COMMITTED(E_newX)`.

🔵 **Decisive implementation gap:** AB104.487 explicitly says the final activation must be linearizable/consensus-protected in an authoritative store, while the exact storage/consensus mechanism remains OPEN. No runtime store, consensus implementation, activation writer, or durable record implementation was recovered in the repository search. Thus the missing S9 artifact is not merely hard to locate; the research itself records the storage mechanism as unresolved.

🟢 **S9 closure condition reached:** semantic activation/recovery rules, identity/binding requirements, and crash outcomes are sufficiently specified as design evidence. 🔵 What remains unestablished is executable implementation/formal verification of the authoritative activation path. Do not invent a store or issuer. The next frontier should move beyond S9 rather than repeat the same authority searches.

## 2026-10-07 — AB105.078R freshness/revocation boundary: primary evidence confirms authorization is not durable by default

🟢 **Fresh primary evidence:** AWS IAM states that IAM is eventually consistent: changes to users, groups, roles, policies and related attributes can take time to become visible across endpoints, and caching can add delay. AWS recommends verifying propagation before production workflows depend on the change. citeturn0search0

🟢 **Revocation evidence:** AWS documents an explicit mechanism to revoke permissions for existing role sessions by attaching a deny policy keyed to session issue time. It also notes that propagation delay is accounted for with a future cutoff and that affected users must obtain new temporary credentials. This demonstrates that a previously issued/usable session does not itself establish continuing authorization after revocation. citeturn0search1

🟢 **Evaluation-time evidence:** AWS enforcement evaluates applicable policies against the request context at request time; explicit deny overrides allow. Therefore authorization is a function of current request context plus the applicable policy/control set, not merely a historical identity grant. citeturn0search2turn0search7

🟢 **Simulation boundary:** AWS explicitly warns that IAM policy simulator results can differ from the live environment and recommends checking against the live environment. Therefore a prior evaluated/simulated ALLOW cannot be treated as proof of a later live authorization decision. citeturn0search4

🔵 **Nexo implication:** a stored authorization decision requires a freshness/applicability boundary before it can authorize a later effect. At minimum, the model must distinguish: decision-time validity, current revocation/credential state, policy/control propagation state, execution-time context, and whether the decision remains applicable. A historical ALLOW without a valid freshness basis must not silently become CURRENT_AUTHORITY.

🔵 **Still open:** primary evidence establishes the need for freshness/revocation semantics, but does not by itself determine Nexo's exact freshness mechanism, bounded staleness rule, or whether an already-authorized operation may continue after revocation once execution has crossed a defined protected boundary. Those remain Nexo design questions requiring separate evidence.

**Exact next investigation:** trace primary evidence for the boundary between *authorization decision* and *execution commitment*—specifically whether revocation occurring after authorization but before/at/after effect commitment invalidates the effect, and what protected point (if any) makes the decision durable for that exact operation.

## 2026-10-07 — AB105.078R operation-registry trace: semantic design exists, runtime registry boundary not established

🟢 **Concrete runtime trace:** current src/nexo/runtime.js derives idempotencyKey as missionId:stepId, calls the adapter, then records the adapter result through local memory functions. runtimeCommitLocks serializes local memory commits only. No target-side operation registry, target receipt, or atomic target-effect + registry commit was found in this runtime path.

🟢 **Historical evidence recovered:** AB104.227/228/229 already specify the required target-side registry semantics: a prepared entry blocks blind re-execution; the same operation_id with a different payload fingerprint is a collision/quarantine case; a target-authoritative operation record can establish commitment after a coordinator crash; and a negative receipt is meaningful only if it binds to the exact operation and guarantees non-acceptance.

🔵 **Critical distinction:** the repository therefore has a detailed semantic contract for operation-registry atomicity, but the current executable runtime still uses a local missionId:stepId idempotency key and local memory persistence. This does not establish that target resource mutation and EFFECT_COMMITTED/receipt registration occur atomically.

🟢 **Primary external analogue:** etcd's transaction primitive demonstrates the required shape: multiple comparisons are evaluated atomically and, only if they all succeed, the transaction applies the success writes; completed KV operations are durable and linearizable by default. This is evidence of a concrete primitive shape, not a decision to use etcd in Nexo. citeturn0search1turn0search0

🔵 **Result:** AB105.078R is narrowed again. The remaining implementation question is not whether operation-registry semantics have been designed—they have. It is whether Nexo has an executable target/store that atomically couples (a) current authority/fence/version acceptance, (b) resource mutation, and (c) operation receipt/registry state.

**Exact next investigation:** inspect every executable target/effect adapter and persistence path for an actual atomic coupling between target mutation and operation receipt/registry. If none exists, close this branch as SEMANTIC_BOUNDARY_RECOVERED / RUNTIME_ATOMIC_TARGET_REGISTRY_NOT_ESTABLISHED and move on rather than inventing a store.

**DO-NOT-REPEAT:** AB104.227/228/229 design semantics, local missionId:stepId idempotency, runtime commit lock, generic fencing, S9, Kafka/JMM/G0, TLC, AB105.117R.


## 2026-10-07 — AB105.078R target-path sweep: local journal is not atomic target registry

🟢 **Executable path inspected:** `src/nexo/effect-adapter.js` records `prepared` in an in-memory `executionJournal`, optionally calls `persistPreparedIntent`, invokes the handler, then locally `persist()`s the result. A handler exception returns `EFFECT_OUTCOME_UNKNOWN` without persisting a terminal result, correctly preserving ambiguity rather than falsely declaring non-execution.

🟢 **Concurrency control classified:** the adapter's `sharedInFlight` and `sharedQueue` prevent duplicate concurrent execution only within the same in-memory journal/process. They are not a durable target registry and do not atomically couple external/resource mutation to receipt registration.

🟢 **Lúmina target path cross-check:** the repository's current Lúmina effect handlers directly mutate `simulation.agents/world` and increment `nexoEffectRevision`; the later runtime memory commit and world-state persistence are separate operations. Existing research already records that `nexoEffectRevision` is in-memory and not a durable external fence.

🔵 **Critical boundary:** no executable path was recovered that atomically performs: (1) current authority/fence/resource-version acceptance, (2) target/resource mutation, and (3) durable operation receipt/registry commit. Therefore a crash between target mutation and local recording can remain externally ambiguous and cannot be resolved by the local `missionId:stepId` key alone.

🟢 **Useful safety behavior already present:** prepared entries block blind retry and require reconciliation; an unverified reconciliation cannot become completed. This is a good local UNKNOWN/STOP control, but it is not proof that the target mutation and registry are atomic.

**Status:** semantic registry contract = 🟢 RECOVERED; local idempotency/reconciliation controls = 🟢 OBSERVED; target-side atomic effect+receipt registry = 🔵 NOT ESTABLISHED; crash-after-target-before-receipt = 🔵 UNKNOWN unless target-authoritative evidence exists.

**Exact next investigation:** inspect the concrete persistence implementation behind `persistState` / world-state storage and every `persistPreparedIntent` caller, looking only for an atomic transaction/journal boundary that includes both the target mutation and operation identity/receipt. If absent, close this runtime branch as an implementation gap.

**DO-NOT-REPEAT:** AB104.227/228/229 design semantics; local `missionId:stepId` idempotency; `runtimeCommitLocks`; generic fencing; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.079R persistence-boundary sweep: world-state replacement is not effect+receipt atomicity

🟢 Current executable persistence implementation inspected directly at the canonical master head. scripts/simulate.mjs::persistState() acquires a sibling filesystem lock, optionally reloads world-state.json and checks expectedRevision, serializes the entire simulation including simulation.nexoMemory, writes a temporary file, then renames that file over world-state.json. This is a protected file-persistence/revision boundary for cooperating writers.

🟢 The same inspection confirms the persistence boundary is after the Lúmina effect mutation. src/nexo/simulation-adapter.js handlers mutate simulation.agents/world directly and increment the in-memory nexoEffectRevision; src/nexo/runtime.js then records the execution/outcome in memory. Nothing in the inspected execution path invokes persistState() around the handler mutation as one transaction.

🟢 persistPreparedIntent remains only an injected callback seam. executeLuminaNexoStep() accepts it and forwards it to createLuminaEffectAdapter(), which forwards it to createEffectAdapter(). The current repository search found no production caller that actually supplies this callback to an effect execution. The only executable definition/use chain is runtime → simulation-adapter → effect-adapter; scripts/assistants.mjs builds/persists mission plans but does not call executeLuminaNexoStep().

🟢 effectJournal is included in the durable simulation.nexoMemory envelope when persistState() is eventually called, but the journal is still a local mutable array before that checkpoint and is capped at 200 entries. Therefore inclusion in world-state.json proves eventual serialization, not atomic coupling to the physical effect.

🔵 Critical boundary: no executable atomic transaction/journal was recovered that simultaneously commits (1) prepared operation identity, (2) authority/fence/resource acceptance, (3) target mutation, and (4) durable operation receipt. The existing temp-file+rename operation atomically replaces the single state file, but it cannot retroactively include an already-completed in-memory effect in the same linearization point.

🔵 Crash classification: a crash after the handler mutates simulation.agents/world but before persistState() durably records the resulting state and effect identity leaves recovery dependent on whatever durable evidence survived. The adapter's EFFECT_OUTCOME_UNKNOWN behavior correctly refuses to invent a terminal result, but the current topology does not supply a target-authoritative receipt that resolves the ambiguity.

🟢 Important negative result: this is not a newly discovered defect requiring another implementation patch. Earlier AB104 research already established the same architectural boundary; this sweep now ties that conclusion to the current executable persistence code and confirms no hidden caller/transaction was missed in the current tree.

Status:
- persistState() lock/revision/temp-rename persistence = 🟢 OBSERVED/BOUNDED.
- Nexo memory/effectJournal serialization = 🟢 OBSERVED.
- persistPreparedIntent production integration = 🔵 NOT ESTABLISHED; no current caller recovered.
- target mutation + operation receipt atomicity = 🔵 NOT ESTABLISHED.
- crash-after-effect-before-durable-receipt = 🔵 UNKNOWN.
- exactly-once/external-effect guarantee = 🔴 NOT CLAIMED.

Exact recovery point: AB105.079R → persistence-boundary sweep → world-state replacement ≠ atomic effect+receipt registry.

Next exact frontier: move beyond the already-closed local Lúmina persistence branch and audit the target/effect commitment contract at the architecture level: what authoritative store/resource could own the operation receipt and enforce authority/fence/resource-version acceptance at the same commitment boundary. Do not invent or implement a store yet.

DO-NOT-REPEAT: persistState() temp-file/rename semantics; local filesystem lock/revision semantics; persistPreparedIntent seam discovery; generic local idempotency; Lúmina direct-mutation path; AB104.227/228/229 semantic registry design; S9; Kafka/JMM/G0; TLC; AB105.117R.
## 2026-10-07 — AB105.080R target-commit contract sweep: no executable authoritative commitment store recovered

🟢 A focused repository-wide search was performed for an executable target commitment primitive, not another design document. Searches covered operation receipt/registry, operation_id/effect_identity, authority_epoch, resource_incarnation, SQLite/BEGIN TRANSACTION/database, capability store, and target commit paths.

🟢 The result is consistent across the current tree: concrete matches for operation registry, atomic target acceptance, receipt binding, fencing, SQLite transactions, and crash recovery are research/design artifacts. No executable SQLite/database transaction, operation-registry implementation, target-authoritative receipt writer, or protected target commit primitive was recovered.

🟢 The existing code therefore remains exactly at the previously established split: local effect-adapter/runtime state can provide in-process idempotency, prepared-intent reconciliation and UNKNOWN handling; world-state persistence can durably replace the state file; but neither is an authoritative target commitment boundary.

🟢 An important architecture constraint is also confirmed by existing research: a local transaction/store cannot make an external effect atomic merely by recording an outbox/receipt. If the effect target is outside that transaction domain, the target itself must expose a sufficiently strong acceptance/receipt boundary, or Nexo must remain in reconciliation/UNKNOWN semantics.

🔵 The missing implementation is therefore not merely 'a database'. The required boundary must bind, at minimum, operation identity/effect identity, payload semantics, target incarnation, current authority context/fence, resource version/precondition, mutation and authoritative receipt. A generic durable log or idempotency table alone would not establish this.

🔵 Multi-target atomicity remains a separate condition: if an effect footprint spans independently committing targets, one target receipt cannot prove the aggregate effect. The system must either have one transaction domain covering the full participant set or expose participant-level COMMITTED/PARTIAL/UNKNOWN evidence.

Status:
- executable authoritative operation registry = 🔵 NOT ESTABLISHED.
- executable target-side atomic mutation+receipt boundary = 🔵 NOT ESTABLISHED.
- executable authority/fence/resource-version enforcement at that boundary = 🔵 NOT ESTABLISHED.
- generic durable local persistence = 🟢 OBSERVED, but insufficient for external-effect atomicity.
- exactly-once external effect = 🔴 NOT CLAIMED.

Exact recovery point: AB105.080R → target-commit contract sweep → no executable authoritative commitment store recovered.

Next exact frontier: stop searching for an implementation that the current repository does not contain. Move to the provider/target capability contract: classify which future effect targets can actually supply an atomic target-side acceptance+mutation+receipt boundary, which can only supply idempotency/fencing/reconciliation, and which must remain UNKNOWN/STOP. This is a capability classification, not implementation.

DO-NOT-REPEAT: local persistence sweep AB105.079R; SQLite-as-reference research; operation-registry design AB104.227/228/229/311/312; local idempotency/reconciliation; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.
## 2026-10-07 — AB105.081R provider-capability matrix: reconcile against existing effect-class contracts

🟢 The repository already contains the capability taxonomy that this frontier requires; this is reconciliation, not a new invented taxonomy. AB104.531 defines a provider capability vector including explicit idempotency scope, retention/expiry, independent authoritative observation, reconciliation, and cancellation/compensation. AB104.386 explicitly distinguishes TARGET_CONDITION from AUTHORITY_FENCE. AB104.373 states that missing capability is a contract mismatch when a claimed property requires it.

🟢 The minimum target commitment contract is therefore classified by capability, not provider brand:
- **STRONG_COMMIT**: target atomically binds the required currentness/authority/fence/resource predicates to mutation and authoritative operation receipt within one target commitment domain.
- **FENCED_IDEMPOTENT**: target can enforce target-side conditions/fences and stable idempotency, but a crash/timeout can still leave effect-vs-receipt ambiguity; reconciliation remains part of the contract.
- **RECONCILIATION_ONLY**: target exposes authoritative observation/history sufficient to reconcile outcomes, but does not provide a single acceptance+mutation+receipt boundary.
- **UNSAFE/UNSUPPORTED**: required identity/currentness/reconciliation properties are absent; critical execution must not be promoted to a stronger claim.

🟢 Existing repository evidence fixes the identity needed for a protected effect: authority epoch, resource identity/incarnation, resource fence, EFFECT_ID and OPERATION_ID; AB104.383 distinguishes authority generation from resource fence and resource incarnation.

🟢 Primary AWS evidence independently matches the same abstraction: DynamoDB conditional writes evaluate conditions at the target write boundary; TransactWriteItems atomically commits grouped writes or rejects the transaction, and ClientRequestToken provides idempotency for repeated identical transaction calls. These guarantees are bounded to DynamoDB's transaction domain, not arbitrary external effects. citeturn0search4turn0search0turn0search6

🔵 Therefore **conditional write ≠ authority fence**, and **provider transaction ≠ arbitrary external-effect atomicity**. A provider qualifies as STRONG only for the exact effect footprint and predicates that its own commitment domain covers.

🔵 Multi-provider/multi-target effects remain composite: if participants do not share one commitment domain, Nexo cannot promote the aggregate to one atomic committed effect. It must retain participant-level outcomes and potentially PARTIAL/UNKNOWN semantics.

Current implementation status:
- Repository-defined capability taxonomy = 🟢 recovered/reconciled.
- Exact provider capability classification contract = 🟢 established at semantic level.
- Current Nexo/Lúmina runtime satisfying STRONG_COMMIT = 🔵 not established.
- Exactly-once across arbitrary external providers = 🔴 not claimed.

Exact recovery point: **AB105.081R → provider-capability matrix → existing effect-class contracts reconciled; atomicity belongs to the target boundary.**

Next exact frontier: define the **minimum target commitment interface** and adversarial outcome matrix using the recovered identity fields and capability classes, without implementing a provider or changing runtime behavior.

DO-NOT-REPEAT: AB105.080R store search; AB105.079R persistence; local idempotency/reconciliation; SQLite selection; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.082R minimum target commitment interface: acceptance/outcome matrix

🟢 The minimum interface is now bounded by recovered repository contracts rather than implementation assumptions. A protected effect request must bind, at minimum: authority_epoch, resource_id, resource_incarnation, resource_fence, EFFECT_ID, OPERATION_ID, retry/attempt identity, and the payload/effect fingerprint. The target must evaluate the predicates against its current state at its own commitment boundary.

### Commitment contract

**INPUT**
- effect_identity / EFFECT_ID
- OPERATION_ID
- attempt/retry generation
- authority epoch/context required by the effect
- resource_id + resource_incarnation
- presented resource fence
- expected resource/version precondition
- payload/effect fingerprint
- required capability class

**ATOMIC ACCEPTANCE**
The target may return COMMITTED only when the target's authoritative commitment boundary has accepted the predicates and durably coupled the accepted effect to the target mutation and receipt/operation record. A coordinator-side record alone cannot create this claim.

**OUTCOMES**
- **REJECTED**: target guarantees the effect was not accepted/committed for that exact operation identity.
- **COMMITTED**: target provides authoritative evidence that the mutation and operation receipt belong to the same commitment boundary.
- **DUPLICATE_COMMITTED**: exact operation identity already committed; target returns the existing authoritative receipt, subject to fingerprint compatibility.
- **COLLISION/QUARANTINE**: same protected operation identity is presented with incompatible fingerprint or binding; execution must stop.
- **STALE_FENCE**: presented fence/epoch/resource incarnation is below the target's current accepted boundary; no commitment.
- **RESOURCE_REPLACED**: resource incarnation mismatch; no commitment against the new incarnation.
- **UNKNOWN**: timeout/crash/transport loss leaves acceptance unresolved and the target cannot yet provide authoritative evidence.
- **PARTIAL**: multiple independently committing participants have mixed outcomes; aggregate effect is not COMMITTED.

### Adversarial matrix

| Case | Required Nexo state |
|---|---|
| Accept + durable receipt | COMMITTED |
| Explicit reject before acceptance | REJECTED |
| Exact duplicate with same fingerprint | DUPLICATE_COMMITTED |
| Same operation identity + different fingerprint | COLLISION/QUARANTINE |
| Stale authority/fence | STALE_FENCE |
| Wrong resource incarnation | RESOURCE_REPLACED |
| Target timeout/crash before authoritative answer | UNKNOWN |
| Lost receipt but target later proves commit | COMMITTED after reconciliation |
| Multi-target mixed participant results | PARTIAL/UNKNOWN, never aggregate COMMITTED |

🟢 Critical anti-collapse rules recovered from prior evidence:
- receipt != mere client response;
- timeout != rejection;
- historical ALLOW != current authority;
- target condition != authority fence;
- durable local intent != external effect commitment;
- one participant's receipt != aggregate multi-target atomicity.

🔵 The interface does not require every provider to implement every outcome directly. Capability admission determines which claims are legal. A target without authoritative duplicate lookup cannot safely convert an ambiguous retry into COMMITTED merely because the original request was sent.

🔴 No implementation is being claimed. This is the minimum semantic contract for future target adapters.

Exact recovery point: **AB105.082R → minimum target commitment interface → adversarial outcome matrix established.**

Next exact frontier: map the contract to concrete provider capability classes and define admission rules: which claims are permitted for STRONG_COMMIT, FENCED_IDEMPOTENT, RECONCILIATION_ONLY, and UNSAFE/UNSUPPORTED.

DO-NOT-REPEAT: AB105.081R taxonomy reconciliation; AB105.080R store search; AB105.079R persistence; local idempotency/reconciliation; SQLite selection; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.083R capability admission matrix: claims are bounded by target semantics

🟢 The capability admission rules are now explicit.

| Capability class | Safe admission | Unsafe promotion |
|---|---|---|
| **STRONG_COMMIT** | COMMITTED when the target proves the exact operation/effect identity, required authority/fence/resource predicates, mutation, and authoritative receipt share one target commitment domain. Exact duplicate may resolve to DUPLICATE_COMMITTED when fingerprint/binding matches. | Claiming atomicity outside the target domain; treating a client acknowledgement as the receipt; treating a partial participant set as aggregate COMMITTED. |
| **FENCED_IDEMPOTENT** | Permit bounded retry/deduplication and stale-fence rejection when those semantics are explicitly enforced by the target. After ambiguous crash/timeout, remain UNKNOWN until authoritative reconciliation. | Universal exactly-once; assuming idempotency token alone proves physical effect; assuming target fencing equals Nexo authority activation. |
| **RECONCILIATION_ONLY** | Permit execution only where the effect class tolerates UNKNOWN and reconciliation/compensation semantics are sufficient. A later authoritative observation can resolve UNKNOWN. | Converting send/ack/history into COMMITTED without an authoritative commitment witness; blind retry after unresolved ambiguity. |
| **UNSAFE/UNSUPPORTED** | Observe or prepare intent only; critical effect remains STOP/UNKNOWN. | Executing a critical effect under a stronger claim than the target can enforce. |

🟢 Admission is therefore a proof/claim boundary, not merely a feature flag. The same provider may qualify as different classes for different APIs/effects because capability is scoped to the exact target operation, resource, identity, and transaction domain.

🟢 Minimum admission evidence:
1. exact effect identity and operation identity;
2. target/resource identity and incarnation;
3. current authority/fence semantics required by the effect;
4. idempotency scope and retention;
5. authoritative duplicate/receipt lookup semantics;
6. crash/timeout outcome semantics;
7. transaction/commit domain;
8. for multi-target effects, participant coverage and mixed-outcome semantics.

🔵 Important refinement: **UNKNOWN is an allowed terminal epistemic state for a capability class; it is not a provider failure.** A provider can be correctly admitted as FENCED_IDEMPOTENT or RECONCILIATION_ONLY while still requiring Nexo to quarantine an ambiguous operation.

🔴 No current Nexo/Lúmina adapter has been promoted to STRONG_COMMIT by this matrix. That remains unestablished.

Exact recovery point: **AB105.083R → capability admission matrix → claims bounded by target semantics.**

Next exact frontier: audit whether the existing Nexo effect contract has a place to carry this capability class and the admission evidence without silently changing runtime behavior; repository inspection only, no implementation.

DO-NOT-REPEAT: AB105.082R commitment matrix; AB105.081R taxonomy; AB105.080R store search; AB105.079R persistence; local idempotency/reconciliation; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.084R effect-contract carrier audit: capability evidence is not carried by the executable request

🟢 Repository inspection completed across the executable effect path and the recovered capability-vector contracts.

Current executable request fields in `executeNexoStep()` are effectively:
`missionId, stepId, action, target, idempotencyKey, context, precondition, postcondition`.

The adapter carries these into the handler and journal, but there is no explicit executable field for:
- capability_class / admission class;
- capability assessment evidence;
- provider capability version/scope;
- authority epoch/context;
- resource incarnation;
- target fence;
- payload/effect fingerprint;
- transaction/commit-domain identity.

🟢 The existing design documents already distinguish these concepts. AB104.531 explicitly says the Effect Adapter should expose a claim-specific capability vector, and that admission should degrade to RESTRICT/RECONCILE/QUARANTINE when required capability is absent or UNKNOWN. The executable adapter does not currently encode that contract.

🟢 This is a **contract-carrier gap**, not yet an implementation defect requiring immediate patching: current runtime never claimed STRONG_COMMIT, and adding fields without defining their authoritative source would risk creating decorative metadata rather than enforceable safety.

🔵 Important separation:
1. `effectResult.verified` is evidence about the observed result/postcondition.
2. `capability_class` is a statement about what the target/provider contract permits Nexo to claim.
3. authority/fence fields are execution-currentness inputs.
4. operation/effect identity binds the exact attempted effect.
These must not collapse into one generic `verified` flag.

🔵 Existing `context` could technically carry arbitrary metadata, but that does **not** establish a typed contract, provenance, scope, or enforcement. Therefore it is not counted as an existing capability carrier.

🔴 No executable path was found that enforces admission based on STRONG_COMMIT/FENCED_IDEMPOTENT/RECONCILIATION_ONLY/UNSAFE-UNSUPPORTED. Current Lúmina remains local/in-memory and cannot be promoted by merely attaching a capability label.

Exact recovery point: **AB105.084R → effect-contract carrier audit → capability/admission evidence not yet an authoritative executable field.**

Next exact frontier: define the minimum *semantic carrier contract* for capability/admission (fields, provenance, scope, freshness, and authority), without implementing it or choosing a provider.

DO-NOT-REPEAT: AB105.083R admission matrix; AB105.082R commitment matrix; AB105.081R taxonomy; AB105.080R store search; AB105.079R persistence; local idempotency/reconciliation; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.085R semantic carrier contract: minimum typed provenance boundary

🟢 The minimum semantic carrier is now defined without implementation.

A protected effect request needs five separated layers:

1. **Identity**
   - `operation_id`
   - `effect_id`
   - `attempt_id`
   - `payload/effect_fingerprint`

2. **Target binding**
   - `resource_id`
   - `resource_incarnation`
   - `expected_resource_version`

3. **Authority/currentness**
   - `authority_context_id`
   - `authority_epoch`
   - `presented_fence`
   - required authority scope/policy version where the claim depends on it

4. **Capability admission**
   - `capability_class`: STRONG_COMMIT | FENCED_IDEMPOTENT | RECONCILIATION_ONLY | UNSAFE/UNSUPPORTED
   - `capability_assessment_id`
   - `capability_scope`
   - `capability_observed_at`
   - `capability_expiry_or_freshness` when provider semantics require it

5. **Commit-domain provenance**
   - `commit_domain_id`
   - `provider_operation_reference` when available
   - authoritative receipt/reference only after the target establishes commitment

🟢 Provenance rules:
- Caller-supplied identity is not authoritative commitment evidence.
- Capability assessment describes what the provider contract permits; it does not itself authorize an effect.
- Authority fields describe currentness/fencing inputs; they do not prove target acceptance.
- A receipt is authoritative only if its provenance binds it to the target commitment domain and exact operation/effect identity.
- `verified=true` remains result/postcondition evidence, not capability or commitment evidence.

🟢 Freshness rules:
- Capability admission must be scoped to the exact provider/API/effect class and validity horizon.
- A stale capability assessment cannot silently promote a request.
- Authority currentness must be evaluated at the protected target boundary where the safety property requires it.
- A capability assessment and an authority decision may be referenced by the request, but neither reference substitutes for target enforcement.

🔵 Scope rule: capability is not globally attached to a provider. The assessment must cover the exact provider/API/operation/effect class/resource semantics needed by the claim.

🔵 No implementation field has been added. This is a semantic contract only; the repository remains unchanged except for this continuity record.

🔴 This contract does not prove that any current adapter can satisfy these fields. Current Lúmina remains without an authoritative target commitment boundary.

Exact recovery point: **AB105.085R → semantic carrier contract → identity, target, authority, capability, and commit provenance separated.**

Next exact frontier: adversarially test this carrier against the AB105.082R outcome matrix and verify whether every outcome can be represented without collapsing UNKNOWN, REJECTED, COMMITTED, DUPLICATE, COLLISION, STALE_FENCE, RESOURCE_REPLACED, or PARTIAL.

DO-NOT-REPEAT: AB105.084R carrier gap; AB105.083R admission matrix; AB105.082R commitment matrix; AB105.081R taxonomy; AB105.080R store search; AB105.079R persistence; local idempotency/reconciliation; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.085R semantic carrier contract: minimum provenance-bound admission envelope

🟢 The minimum semantic carrier is now bounded without implementation.

The admission envelope must distinguish four domains:

1. **Claim/admission**
   - capability_class: STRONG_COMMIT | FENCED_IDEMPOTENT | RECONCILIATION_ONLY | UNSAFE/UNSUPPORTED
   - capability_assessment_id
   - capability_scope
   - capability_basis/provenance
   - capability_freshness/valid_until where applicable

2. **Authority/currentness**
   - authority_context_id
   - authority_epoch
   - required fence/revision
   - policy/invariant version when the claim depends on them

3. **Exact effect identity**
   - operation_id
   - effect_id
   - attempt/retry generation
   - resource_id
   - resource_incarnation
   - payload/effect fingerprint

4. **Commit/evidence boundary**
   - target/commit-domain identity
   - required commitment semantics
   - authoritative receipt/reference when one exists
   - evidence provenance and verification status

🟢 Binding rule: the capability assessment is valid only for its declared scope; it cannot silently authorize another target, resource incarnation, effect identity, provider operation, or authority epoch.

🟢 Freshness rule: capability evidence and authority evidence have different freshness semantics. A capability document remaining valid does not make an old authorization decision current.

🟢 Provenance rule: Nexo must be able to distinguish provider-declared capability, independently verified runtime behavior, and target-produced commitment evidence. These are not interchangeable.

🟢 Anti-collapse rules:
- capability_class != authorization decision
- capability assessment != authority grant
- authority context != target commitment
- effect identity != idempotency key alone
- target receipt != client acknowledgement
- evidence verified=true != COMMITTED
- capability freshness != authority freshness

🔵 The envelope is a semantic contract only. No existing runtime field is being retroactively reinterpreted as carrying these meanings, and no implementation is claimed.

🔴 Current Nexo/Lúmina still has no executable authoritative admission gate consuming this envelope.

Exact recovery point: **AB105.085R → semantic carrier contract → provenance-bound admission envelope defined.**

Next exact frontier: test the envelope against the adversarial AB105.082R outcome matrix and identify whether every outcome can be represented without collapsing UNKNOWN, PARTIAL, REJECTED, or COMMITTED.

DO-NOT-REPEAT: AB105.084R carrier audit; AB105.083R admission matrix; AB105.082R commitment matrix; AB105.081R taxonomy; AB105.080R store search; AB105.079R persistence; local idempotency/reconciliation; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.086R carrier outcome-coverage audit: all adversarial outcomes remain distinguishable

🟢 The AB105.085R semantic carrier was tested against every AB105.082R adversarial outcome.

| Outcome | Representable without collapse? | Required evidence distinction |
|---|---|---|
| REJECTED | 🟢 Yes | target rejection + exact operation/effect identity + guarantee of non-acceptance |
| COMMITTED | 🟢 Yes | authoritative target commitment evidence bound to exact identity/fingerprint and commit domain |
| DUPLICATE_COMMITTED | 🟢 Yes | authoritative existing receipt/operation record + matching identity/fingerprint |
| COLLISION/QUARANTINE | 🟢 Yes | same operation identity with incompatible fingerprint/binding; STOP |
| STALE_FENCE | 🟢 Yes | target-authoritative stale epoch/fence rejection |
| RESOURCE_REPLACED | 🟢 Yes | target-authoritative incarnation mismatch |
| UNKNOWN | 🟢 Yes | unresolved acceptance boundary; absence of receipt/response is insufficient to convert it to REJECTED |
| PARTIAL | 🟢 Yes | independently committing participants with non-uniform outcomes; aggregate COMMITTED prohibited |

🟢 The carrier therefore does not need a new outcome value to solve the representation problem. The critical requirement is that evidence provenance identifies *why* an outcome is known and which commitment domain established it.

🟢 Strong distinction recovered:
- **REJECTED** requires positive evidence that the exact effect was not accepted.
- **UNKNOWN** is the absence of a resolved acceptance boundary, not merely a missing response.
- **COMMITTED** requires authoritative commitment evidence, not `verified=true`.
- **PARTIAL** is a property of participant coverage and cannot be collapsed into a single target result.
- **DUPLICATE_COMMITTED** is only safe when the authoritative existing record matches the exact effect identity and fingerprint.
- **COLLISION** must quarantine rather than reinterpret the second request as a retry.

🔵 Remaining semantic dependency: the carrier can represent these states, but it cannot manufacture the required evidence. Provider/target capability determines whether a state can legitimately be asserted.

🔴 No current executable adapter has been promoted to enforce this matrix. This remains contract-level evidence.

Exact recovery point: **AB105.086R → carrier outcome-coverage audit → all AB105.082R adversarial outcomes remain distinguishable.**

Next exact frontier: define the **claim transition rules** from request/admission/evidence to each outcome, including which transitions are forbidden (especially UNKNOWN→REJECTED, UNKNOWN→COMMITTED, and provider ACK→COMMITTED).

DO-NOT-REPEAT: AB105.085R carrier definition; AB105.084R carrier gap; AB105.083R admission matrix; AB105.082R commitment matrix; AB105.081R taxonomy; AB105.080R store search; AB105.079R persistence; local idempotency/reconciliation; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.087R claim-transition audit: forbidden promotions and evidence-gated resolution

🟢 The outcome-transition rules are now explicit.

REQUESTED → ADMISSION_EVALUATED → ATTEMPTED → one of:
REJECTED, COMMITTED, DUPLICATE_COMMITTED, STALE_FENCE, RESOURCE_REPLACED, COLLISION/QUARANTINE, UNKNOWN, PARTIAL.

UNKNOWN may transition only through stronger authoritative evidence:
- UNKNOWN → COMMITTED when the target later proves exact commitment.
- UNKNOWN → DUPLICATE_COMMITTED when an authoritative existing record proves the exact operation/fingerprint.
- UNKNOWN → REJECTED only when the target provides a guarantee of exact non-acceptance.
- UNKNOWN → PARTIAL only when participant-level authoritative evidence establishes mixed outcomes.

🟢 Explicitly forbidden:
- client timeout → REJECTED
- missing receipt → REJECTED
- provider error without non-acceptance semantics → REJECTED
- client ACK → COMMITTED
- local journal entry → COMMITTED
- verified postcondition → COMMITTED
- retry success → proof that the first attempt did not commit
- capability admission → COMMITTED
- coordinator persistence → target commitment
- one participant COMMITTED → aggregate multi-target COMMITTED

🟢 Retry rule: an UNKNOWN operation cannot be blindly retried merely because no receipt was observed. Retry requires authoritative proof of non-acceptance or provider-native idempotent/duplicate semantics binding the retry to the same exact operation identity and fingerprint.

🔵 Coordinator state and effect state remain separate until authoritative evidence binds them.

🔵 REJECTED, STALE_FENCE, and RESOURCE_REPLACED are equivalent to no commitment only when the provider contract explicitly guarantees rejection before acceptance at that exact boundary. A generic error code is insufficient.

🔴 No current runtime path enforces these transitions. This is a semantic state-machine contract, not an implementation claim.

Exact recovery point: **AB105.087R → claim-transition audit → outcome promotion is evidence-gated; ambiguous states cannot be rewritten by absence, ACK, or local persistence.**

Next exact frontier: audit retry/reconciliation identity across provider retention expiry, resource reincarnation, and payload changes.

DO-NOT-REPEAT: AB105.086R outcome coverage; AB105.085R carrier; AB105.084R carrier gap; AB105.083R admission matrix; AB105.082R commitment matrix; AB105.081R taxonomy; AB105.080R store search; AB105.079R persistence; local idempotency/reconciliation; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.088R retry/reconciliation identity audit: identity alone is insufficient without retention and incarnation scope

🟢 Audited the identity contract against the four open ambiguity cases from AB105.087R.

The minimum correlation tuple remains:
operation_id + effect_id + attempt_id + payload/effect_fingerprint + resource_id + resource_incarnation.

But operation identity is not globally safe by itself. Reconciliation safety additionally requires:
- provider operation-record retention/lookup horizon;
- exact scope in which operation_id is unique;
- resource incarnation binding;
- fingerprint compatibility;
- authority/fence context where acceptance depends on currentness;
- provider semantics for expired/unknown historical operation records.

🟢 Resource reincarnation:
A matching operation_id against a different resource_incarnation cannot resolve to the old effect. It must be treated as RESOURCE_REPLACED or QUARANTINE according to authoritative target semantics.

🟢 Payload mutation:
Same operation identity with a different effect fingerprint is a collision, not a new retry. It must not be interpreted as DUPLICATE_COMMITTED or safely retried under the old identity.

🟢 Provider retention expiry:
If the provider can no longer authoritatively distinguish an old operation after its retention horizon, absence from the lookup is not proof of REJECTED/non-commit. The state remains UNKNOWN unless another authoritative observation closes the boundary.

🟢 Retry:
A retry is safe only when the provider's idempotency/duplicate semantics cover the exact identity, fingerprint, target incarnation and retention interval needed for the ambiguity window. Otherwise the coordinator must not silently upgrade the retry to exactly-once or non-duplicate semantics.

🟢 Attempt identity:
attempt_id distinguishes execution attempts but does not itself create a new logical operation. Multiple attempts for one operation must remain correlated to the same operation/effect identity when provider semantics require duplicate suppression.

🔵 Authority/fence fields are not universally part of the provider's lookup key; they remain binding evidence when the effect's commitment depends on them. Therefore the reconciliation key is provider/effect-specific, not one universal string.

🔴 No current Nexo/Lúmina adapter establishes durable provider-side identity, retention guarantees, resource-incarnation enforcement, or authoritative historical lookup. This is a contract finding, not an implementation claim.

Exact recovery point: **AB105.088R → retry/reconciliation identity audit → identity must be bound to retention horizon, resource incarnation, fingerprint, and provider lookup semantics; absence after expiry cannot prove non-commit.**

Next exact frontier: audit **operation-record retention/expiry and reuse risk**—when an operation identity can safely be reused, when it must remain permanently reserved, and how restore/clone/failover can create identity aliasing.

DO-NOT-REPEAT: AB105.087R claim transitions; AB105.086R outcome coverage; AB105.085R carrier; AB105.084R carrier gap; AB105.083R admission matrix; AB105.082R commitment matrix; AB105.081R taxonomy; AB105.080R store search; AB105.079R persistence; local idempotency/reconciliation already audited at adapter level; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.089R operation-record retention/reuse audit: expiry is not deletion of historical truth

🟢 The retention/reuse boundary is now explicit.

An operation identity is safely reusable only when the provider/target contract guarantees that no still-relevant historical or in-flight operation can be confused with the new operation. Expiring a lookup record is not, by itself, such a guarantee.

Required conditions before reuse:
- prior operation is outside every possible effect/reconciliation window;
- provider guarantees the old identity cannot still commit, complete asynchronously, or be returned as a duplicate;
- resource incarnation/domain binding prevents aliasing with the old target;
- restore/clone/failover does not resurrect an older operation registry without an epoch/generation boundary;
- the new identity cannot collide with retained or recoverable historical records.

🟢 Expiry semantics:
record absent after retention expiry means only “not discoverable in the retained registry.” It does not mean REJECTED and does not erase the epistemic possibility of an old commitment.

🟢 Reuse semantics:
If any old effect could still complete, be reconciled, or be replayed against the same identity, reuse is unsafe. The safe result is quarantine/STOP or a new identity domain that is cryptographically/structurally separated from the old one.

🟢 Restore/clone:
Restoring an older operation registry snapshot can recreate identities that the live system has already consumed. Therefore recovery needs a monotonic generation/epoch or equivalent namespace fence that makes restored identities ineligible to collide with newer operations.

🟢 Failover:
A standby that resumes an operation registry must not infer “never committed” from missing local state when another authority/provider may have accepted the operation. Failover therefore preserves UNKNOWN until authoritative reconciliation closes the boundary.

🔵 The precise safe reuse horizon is provider/effect-specific: synchronous effects may have a finite completion window, while asynchronous effects require a bound covering late completion and authoritative lookup. No universal TTL is valid.

🔴 No current Nexo/Lúmina implementation provides a durable target operation registry, retention contract, recovery generation, or provider-enforced identity namespace fence. This remains a semantic requirement, not an implementation claim.

Exact recovery point: **AB105.089R → operation-record retention/reuse audit → expiry does not prove non-commit; identity reuse requires a closed effect/reconciliation horizon plus a recovery-safe namespace boundary.**

Next exact frontier: audit restore/clone/failover recovery ordering as a state-machine problem: how operation registry, resource state, authority epoch, and receipts must be recovered/fenced so an old snapshot cannot authorize or duplicate a newer effect.

DO-NOT-REPEAT: AB105.088R identity tuple; AB105.087R claim transitions; AB105.086R outcome coverage; AB105.085R carrier; AB105.084R carrier gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.090R recovery-ordering audit: restored snapshots require a newer namespace/fence before effects can resume

🟢 Recovery ordering is bounded:
1. enter recovery/STOP for protected effects;
2. identify snapshot generation/epoch and provenance;
3. establish a newer recovery generation/namespace fence;
4. reconcile or quarantine operations whose outcome may lie outside the snapshot;
5. establish current authority epoch/fence independently of stale snapshot state;
6. bind recovered resource incarnation/version to the new recovery generation;
7. only then admit new effect attempts.

🟢 Snapshot completeness is not world completeness. An older snapshot can contain durable intent while the external target already committed, or omit an external commitment after the snapshot. Restore cannot infer REJECTED from snapshot absence.

🟢 Restoring an old operation registry can resurrect an already-used identity. A recovery generation/namespace fence must prevent collision with post-snapshot history.

🟢 Restoring an older resource version without changing its incarnation can alias prior state. Recovery needs a new incarnation or equivalent fence when rollback can satisfy an old precondition.

🟢 Restored authority state cannot reactivate historical authority. Current authority must be re-established through the protected authority boundary.

🟢 A standby cannot become authoritative merely by loading a snapshot. Unresolved external effects remain UNKNOWN until authoritative reconciliation.

🔵 Exact recovery protocol is provider/effect-specific. A monotonic generation is required where rollback can alias identity, but its mechanism must be authoritative for the target domain.

🔴 No current Nexo/Lúmina executable path implements this recovery fence or authoritative target recovery boundary.

Exact recovery point: **AB105.090R → recovery-ordering audit → STOP/recovery fence must precede effect admission; stale snapshots cannot manufacture current authority, non-commit, or absence of external effects.**

Next exact frontier: audit multi-source recovery reconciliation—how conflicting evidence from local journal, target operation records, resource state, and authority state is classified without choosing the most convenient source.

DO-NOT-REPEAT: AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.091R multi-source recovery reconciliation: source authority and conflict classes are explicit

🟢 Recovery evidence is not resolved by source priority alone. Each source has a defined evidentiary domain:

- Local execution journal: evidence of coordinator intent/attempt and locally observed outcomes; it cannot prove external commitment.
- Target operation record/receipt: authoritative for commitment only within its target commit domain and exact operation/fingerprint binding.
- Resource state: authoritative for current resource state only within its own version/incarnation semantics; it does not by itself prove which operation caused the state.
- Authority state: authoritative for current authorization/fence only within its protected authority domain; it does not prove effect commitment.
- Independent audit/observation: can corroborate or constrain claims, but cannot silently replace the target commitment boundary unless the contract explicitly makes it authoritative.

🟢 Conflict examples:
- Local UNKNOWN + target authoritative COMMITTED → COMMITTED, with the target evidence closing the ambiguity.
- Local COMPLETED + target has no authoritative record → not COMMITTED; remain UNKNOWN unless another authoritative commitment witness exists.
- Target COMMITTED + resource state appears unchanged → do not erase the target commitment; classify the resource discrepancy separately (stale read, projection lag, failed postcondition, compensation, or integrity conflict) and enter reconciliation/quarantine as required.
- Target REJECTED + local success flag → REJECTED only if target rejection semantics guarantee non-acceptance at the commitment boundary; otherwise the contradiction remains unresolved.
- Old authority state + current target commitment → commitment outcome and authority-currentness are separate claims; do not rewrite current authority from the historical effect.
- Conflicting target records from different epochs/incarnations → no merge by convenience; quarantine until the target/domain recovery protocol establishes the authoritative lineage.

🟢 Anti-rule: the most recent timestamp, the majority of sources, the local coordinator's status, or a matching resource version cannot by itself override a stronger domain-specific commitment witness.

🟢 Recovery result must preserve provenance: each resolved claim records source, scope/domain, identity/fingerprint, generation/epoch, observation time, and why conflicting evidence was accepted, rejected, or left UNKNOWN.

🔵 Multi-target effects require participant-by-participant reconciliation first. An aggregate COMMITTED claim is allowed only if the contract has authoritative coverage for every required participant and an aggregate commit boundary; otherwise PARTIAL/UNKNOWN remains.

🔴 No current Nexo/Lúmina executable recovery resolver implements these conflict classes or authoritative source binding. This is a semantic reconciliation contract, not an implementation claim.

Exact recovery point: **AB105.091R → multi-source recovery reconciliation → resolve by evidentiary domain and provenance, never by timestamp/majority/local convenience.**

Next exact frontier: audit **reconciliation finality**—when enough evidence exists to leave UNKNOWN permanently, when a conflict must remain QUARANTINED, and whether later evidence can reopen a previously resolved outcome.

DO-NOT-REPEAT: AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.092R reconciliation finality: resolution requires a closure witness; quarantine is monotonic until authoritative correction

🟢 Finality is now separated from mere resolution.

An outcome may leave UNKNOWN only when a closure witness satisfies the exact claim being made:
- COMMITTED requires authoritative commitment evidence bound to exact operation/effect identity, fingerprint, target incarnation and commit domain.
- REJECTED requires authoritative non-acceptance semantics for the exact attempt/effect boundary.
- DUPLICATE_COMMITTED requires authoritative existing-record evidence with compatible identity/fingerprint.
- STALE_FENCE / RESOURCE_REPLACED require authoritative target semantics establishing the relevant rejection boundary.
- PARTIAL requires authoritative participant-level outcomes showing mixed commitment, or an explicit aggregate protocol that defines the partial state.

🟢 Absence of evidence is not a closure witness. Expired lookup, missing local journal, missing receipt, timeout, failover, or stale resource observation cannot permanently resolve UNKNOWN.

🟢 Quarantine is monotonic with respect to unsafe commitment claims: once contradictory evidence prevents a safe claim, the coordinator must not silently downgrade the conflict to REJECTED or silently upgrade it to COMMITTED.

🟢 Later authoritative evidence may resolve UNKNOWN/QUARANTINED, but that is not an arbitrary “reopen.” It is a new evidence event that creates a new claim transition from the still-open epistemic state.

🟢 A previously resolved COMMITTED/REJECTED result must not be casually rewritten. If later evidence contradicts it, preserve the original provenance and create a conflict/integrity state requiring reconciliation. Historical claims remain immutable records; current world state is a separate claim.

🟢 Finality therefore has two dimensions:
1. epistemic finality — enough authoritative evidence exists to make the claim;
2. operational finality — no further retry/reconciliation action is permitted under the effect contract.
They are not automatically identical.

🔵 The exact point at which UNKNOWN becomes operationally final depends on provider retention, asynchronous completion windows, cancellation guarantees, and recovery protocol. No universal timeout can establish finality.

🔴 No current Nexo/Lúmina runtime implements a durable finality/quarantine ledger or immutable claim history. This remains a semantic contract.

Exact recovery point: **AB105.092R → reconciliation finality → UNKNOWN closes only with a claim-specific authoritative closure witness; quarantine is not silently resolved by absence, and later contradiction becomes a new conflict record.**

Next exact frontier: audit **compensation/cancellation after UNKNOWN**—whether a compensating action can itself create a second ambiguity and how the original operation and compensation must remain causally linked without falsely proving either outcome.

DO-NOT-REPEAT: AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.093R compensation/cancellation after UNKNOWN: compensation is a separate effect, never proof of original non-commit

🟢 Compensation and cancellation are now separated from the original operation.

If operation O is UNKNOWN, a compensating operation C must have its own:
- operation identity;
- effect identity/fingerprint;
- target/resource incarnation binding;
- authority/fence requirements;
- capability/admission assessment;
- outcome and reconciliation record.

🟢 CANNOT infer:
- O UNKNOWN + C COMMITTED → O REJECTED.
- O UNKNOWN + C REJECTED → O REJECTED.
- O UNKNOWN + successful inverse observation → O never happened.
- C accepted → O committed or uncommitted.

The original O remains UNKNOWN until its own commitment boundary is authoritatively resolved.

🟢 Causal linkage is required: C references O as the operation it intends to compensate/cancel, but this linkage is metadata/provenance, not proof of O's outcome.

🟢 Cancellation semantics must be explicit:
- If the provider guarantees cancellation before acceptance, C may establish a non-acceptance claim for O only when that provider contract explicitly binds the cancellation boundary to O.
- If cancellation races with O, both outcomes require independent authoritative evidence.
- If O already committed and C commits, the correct result is “O committed; compensation committed,” not “O did not happen.”

🟢 Compensation can itself be UNKNOWN. Therefore the state machine may contain linked unresolved operations O and C; the coordinator must not collapse them into a single boolean success/failure.

🟢 Non-compensable effects: when no authoritative cancellation/reversal exists, UNKNOWN must remain UNKNOWN/QUARANTINED according to effect class. A local inverse mutation is not a universal rollback.

🔵 Whether a provider's cancellation operation can close O depends on exact provider semantics: cancellation timing, operation identity binding, commit point, asynchronous completion, and authoritative lookup.

🔴 No current Nexo/Lúmina executable path implements causal compensation records or provider-authoritative cancellation semantics. This is a semantic contract, not an implementation claim.

Exact recovery point: **AB105.093R → compensation/cancellation after UNKNOWN → compensation is a separate effect; it never proves the original effect did not commit.**

Next exact frontier: audit **effect dependency/causal graph semantics**—how original operations, retries, cancellations, compensations, and dependent effects are linked so UNKNOWN cannot leak into a false downstream assumption.

DO-NOT-REPEAT: AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.094R effect dependency/causal graph: UNKNOWN must block unsafe downstream assumptions

🟢 Effect causality is now explicit. A dependent effect D may reference predecessor O, but that edge does not resolve O's outcome.

Minimum dependency edge carries:
- predecessor operation_id/effect_id;
- dependency relation (requires-commit, compensates, cancels, observes, or merely follows);
- required predecessor outcome set;
- target/resource incarnation assumptions;
- authority/fence context where inherited;
- dependency policy for UNKNOWN/PARTIAL/QUARANTINED.

🟢 For a dependency requiring predecessor commitment:
O = COMMITTED is sufficient only when the required commitment claim is authoritative.
O = UNKNOWN, PARTIAL, COLLISION/QUARANTINE, or stale/replaced state cannot silently satisfy the dependency.
The dependent operation must remain BLOCKED/SAFE_WAIT/UNKNOWN according to its contract.

🟢 Retry edges do not create new logical effects. A retry attempt remains causally attached to the same logical operation when duplicate suppression/reconciliation requires that identity. A new logical operation requires an explicit new effect identity and must not inherit the old operation's unresolved outcome as fact.

🟢 Compensation/cancellation edges are not ordinary success dependencies. They reference the original operation but preserve independent outcomes, as established in AB105.093R.

🟢 Observation edges do not establish causality. Seeing resource state after O does not prove O caused that state unless the observation contract binds the state transition to O.

🟢 UNKNOWN propagation is claim-specific, not a universal “everything stops” rule. An effect may proceed if its contract explicitly requires only a non-conflicting fact that is already authoritative; otherwise an UNKNOWN predecessor must prevent a stronger downstream claim.

🟢 Cycles in dependency/compensation graphs require quarantine or explicit cycle semantics; the coordinator must not resolve a cycle by assuming any member succeeded.

🔵 No current Nexo/Lúmina executable graph carries these typed dependency semantics or enforces UNKNOWN propagation. Existing mission dependencies are planning/execution ordering, not authoritative effect-causality proofs.

🔴 No implementation claim is made.

Exact recovery point: **AB105.094R → effect dependency/causal graph → dependency edges carry claim requirements; UNKNOWN cannot silently satisfy a requires-commit edge, and observation/order alone does not prove causality.**

Next exact frontier: audit **cross-effect authority/fence inheritance**—whether a dependent effect may reuse predecessor authority context, epoch, fence, resource incarnation, or capability evidence, and where that inheritance must be rejected as stale.

DO-NOT-REPEAT: AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.095R cross-effect authority/fence inheritance: predecessor context is evidence, not automatically reusable authority

🟢 Cross-effect inheritance is now bounded.

A dependent effect must not automatically inherit from its predecessor:
- authority epoch/context;
- revocation generation;
- fence token/revision;
- resource incarnation/version;
- capability assessment;
- provider receipt;
- freshness timestamp.

Each inherited item has a different semantic role and must be revalidated against the dependent effect's own target/claim.

🟢 Safe inheritance is limited to provenance:
A dependent operation may reference the predecessor operation, claim digest, causal relation, and evidence provenance. This does not make the predecessor's authority or capability current for the dependent operation.

🟢 Authority:
A predecessor being authorized does not authorize a later dependent effect. The dependent effect requires current authority/fence at its own acceptance boundary.

🟢 Resource binding:
A predecessor resource incarnation/version cannot be assumed current after mutation, replacement, rollback, or recovery. The dependent effect must bind to the target's current authoritative incarnation/version.

🟢 Capability:
A capability assessment is reusable only within its exact documented scope/freshness/provider contract. Capability for effect O does not automatically admit effect D merely because both use the same provider.

🟢 Fence:
A predecessor fence may be carried as provenance or a precondition, but cannot be treated as a fresh fence for D unless the target contract explicitly defines monotonic inheritance and verifies it at D's commitment boundary.

🟢 Receipt:
O's receipt proves O's commitment within its domain. It cannot prove D's acceptance, nor authorize D.

🟢 UNKNOWN predecessor:
If D depends on O's current authority or committed effect, O=UNKNOWN prevents that claim unless D's contract explicitly allows an independent safe path that does not rely on O's unresolved fact.

🔵 There may be valid transactional protocols where one provider transaction intentionally covers multiple effects. In that case the shared commit domain must be explicit and authoritative; this is not generic “inheritance.”

🔴 No current Nexo/Lúmina executable path performs these cross-effect validations. This is a semantic contract, not an implementation claim.

Exact recovery point: **AB105.095R → cross-effect authority/fence inheritance → predecessor context may provide provenance, but authority, capability, resource currentness and receipts must not be silently reused as current facts for a dependent effect.**

Next exact frontier: audit **shared commit domains / multi-effect transactions**—when several logical effects can legitimately share one authoritative commitment boundary without collapsing participant identity or hiding partial outcomes.

DO-NOT-REPEAT: AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.096R shared commit domains: multi-effect atomicity requires explicit participant coverage and one authoritative boundary

🟢 Shared commit-domain semantics are now bounded.

Several logical effects may legitimately share one atomic commitment boundary only when the target/provider contract explicitly defines a commit domain that covers every required participant/effect.

Minimum shared-domain evidence:
- commit_domain_id;
- complete participant/effect set known before commitment;
- exact operation/effect identity and fingerprint for each participant;
- shared authority/currentness/fence predicates where required;
- target/resource incarnation and version predicates for each participant;
- one authoritative atomic acceptance/commit boundary covering the complete declared set;
- authoritative receipt/status that identifies the domain and participant outcomes;
- recovery/reconciliation semantics for the domain.

🟢 Participant identity is preserved. A shared transaction does not collapse distinct operation_ids/effect_ids into one generic effect. Each participant remains independently attributable.

🟢 Aggregate COMMITTED is legal only when the authoritative commit domain proves the complete required participant set committed under the same boundary. One participant receipt cannot prove aggregate commitment.

🟢 PARTIAL/UNKNOWN remains possible when:
- participant coverage is incomplete;
- the provider exposes per-participant outcomes without an atomic aggregate boundary;
- commit-domain membership is ambiguous;
- recovery cannot establish whether all participants belonged to the same commit;
- the provider's transaction scope excludes a required participant.

🟢 Cross-domain effects cannot be made atomic by coordinator bookkeeping. A local coordinator record spanning two independent providers is not a shared commit domain.

🟢 A transaction identifier supplied by the caller is not proof of atomicity. The provider/target must authoritatively bind that identifier to its own commit boundary.

🟢 Retry/reconciliation must preserve the domain and participant fingerprints. A retry that changes membership or payload is not an ordinary duplicate; it requires a new domain/operation identity or explicit provider semantics.

🔵 Nested/shared domains remain provider-specific. A provider transaction may atomically cover several effects inside its domain, but external effects outside that domain remain separate participants and cannot inherit atomicity.

🔴 No current Nexo/Lúmina executable path exposes an authoritative shared commit domain or multi-target atomic commit boundary. No aggregate atomicity is claimed.

Exact recovery point: **AB105.096R → shared commit domains → aggregate COMMITTED requires authoritative coverage of every required participant under one explicit commit boundary; coordinator bookkeeping cannot manufacture atomicity.**

Next exact frontier: audit **domain membership and participant-set freezing**—when the participant set becomes immutable, how late-added/removed effects are handled, and how membership races affect COMMITTED/PARTIAL/UNKNOWN.

DO-NOT-REPEAT: AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.097R participant-set freezing: atomic claims require an immutable declared set at the commit boundary

🟢 Participant-set semantics are now explicit.

For a multi-effect/shared commit claim, the required participant set must be fixed before the authoritative commit boundary. The commit record must bind the declared set (or an authoritative equivalent digest) to the commit domain.

🟢 Late participant:
An effect added after the participant set is frozen is outside the existing atomic claim. It requires a separate operation/commit domain or explicit provider semantics that atomically extend membership before commitment. It cannot inherit the earlier COMMITTED claim.

🟢 Removed participant:
Removing a required participant before commitment changes the transaction contract. It cannot be silently omitted. The domain must reject/quarantine or establish a new declared set.

🟢 Membership race:
If the system cannot establish whether a participant was inside the authoritative commit set at the boundary, aggregate COMMITTED is not justified. Result remains PARTIAL/UNKNOWN until authoritative membership evidence resolves it.

🟢 Membership digest:
A stable participant-set digest is useful as binding evidence, but a caller-computed digest is not itself authoritative. The provider/target must bind the actual commit membership to its commit record.

🟢 Participant identity includes effect identity/fingerprint and target incarnation. Same logical participant name with changed fingerprint or incarnation is a different binding and cannot silently satisfy the old set.

🟢 Retry:
A retry must use the same frozen membership when claiming duplicate/continuation semantics. Changing membership converts it into a different transaction/effect contract unless the provider explicitly defines a safe extension protocol.

🟢 Recovery:
After crash/failover, the participant set must be reconstructed from authoritative commit-domain evidence, not inferred from whichever local tasks remain in memory.

🔵 Some providers may implement dynamic transaction membership internally. That is safe only if the provider defines an authoritative membership/commit boundary; dynamic client-side lists are not equivalent.

🔴 No current Nexo/Lúmina executable path freezes or authoritatively records a multi-effect participant set. No aggregate atomicity is claimed.

Exact recovery point: **AB105.097R → participant-set freezing → aggregate COMMITTED requires authoritative binding of the complete declared participant set at the commit boundary; late/removed/ambiguous members cannot be silently included or excluded.**

Next exact frontier: audit **commit-boundary linearization for shared domains**—the exact instant/order at which membership, authority/fence, resource predicates, participant mutations, and the authoritative receipt become one commitment claim.

DO-NOT-REPEAT: AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.098R shared commit-boundary linearization: COMMITTED requires one authoritative acceptance point

🟢 The shared commit boundary is now defined semantically.

For a multi-effect claim, the authoritative boundary must bind, as one commit-domain decision:
- frozen participant-set membership;
- exact operation/effect identities and fingerprints;
- required authority/fence predicates;
- target/resource incarnation and version predicates;
- acceptance of the declared participant set;
- participant mutations or their provider-defined atomic commit representation;
- authoritative commit receipt/status.

🟢 The linearization point is not the client send, enqueue, local journal write, provider ACK, or receipt arrival at the coordinator. It is the provider/target-defined point at which the complete declared set becomes durably accepted under the commit-domain contract.

🟢 If no such single boundary exists, aggregate COMMITTED is not justified. Even if every participant later appears successful, the claim is at most participant-level COMMITTED unless the contract explicitly establishes aggregate atomicity.

🟢 Crash ordering:
- crash before authoritative acceptance → outcome may be REJECTED or UNKNOWN depending on target evidence;
- crash after authoritative acceptance but before client receipt → COMMITTED may be established by later authoritative lookup;
- crash during a genuinely atomic provider commit → the provider's recovery semantics determine whether the domain can be authoritatively reconstructed; client-side state cannot decide it.

🟢 Authority/fence and resource predicates must be evaluated as part of the same acceptance boundary when the commitment claim depends on them. A pre-check followed by a later mutation is not equivalent.

🟢 Receipt provenance:
A receipt is authoritative only when it is generated by, and bound to, the commit-domain boundary. A coordinator-generated receipt merely records observation.

🔵 Some providers expose a transaction identifier without exposing enough semantics to prove that all required predicates and participants share the same linearization point. Transaction ID alone is insufficient.

🔴 No current Nexo/Lúmina executable path exposes an authoritative shared linearization point or receipt binding. No aggregate atomicity is claimed.

Exact recovery point: **AB105.098R → shared commit-boundary linearization → aggregate COMMITTED requires one authoritative acceptance boundary binding membership, predicates, mutations, and receipt provenance.**

Next exact frontier: audit **prepare-vs-commit separation**—whether a provider's prepare/stage/validated state can ever be treated as a commitment claim, and how UNKNOWN between prepare and commit must be handled.

DO-NOT-REPEAT: AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.099R prepare-vs-commit separation: PREPARED/VALIDATED never implies COMMITTED

🟢 Prepare, validate, stage, reserve, or admission-success states are now explicitly non-commit states unless the provider contract defines that exact state as the authoritative commit boundary.

Minimum distinction:
- PREPARED: intent/parameters accepted for possible later commit.
- VALIDATED: predicates checked at a point in time.
- STAGED/RESERVED: provider has allocated or reserved state, but final effect acceptance is not established.
- COMMITTED: authoritative commitment boundary has accepted the exact effect/domain.
- UNKNOWN: the boundary outcome cannot be established.

🟢 A crash after PREPARED but before COMMITTED does not justify REJECTED. The effect may still commit later or may already have crossed an unobserved boundary.

🟢 A successful PREPARE response cannot be reused as proof that authority, resource version, fence, capability, or participant membership remained valid until COMMIT unless the provider contract explicitly guarantees those predicates across the interval.

🟢 A prepare token/transaction ID is correlation material unless the provider explicitly binds it to an authoritative commit record. Client possession of a token is not a commitment receipt.

🟢 If the provider exposes abort/cancel for PREPARED state, successful abort proves only what the provider contract says about that prepared transaction. It does not retroactively prove that an earlier operation outside the transaction never committed.

🟢 For multi-effect domains, all required participants must reach the provider-defined commit boundary. “Prepared everywhere” is not aggregate COMMITTED.

🟢 Retry after UNKNOWN between PREPARE and COMMIT must follow provider transaction/idempotency semantics. Blindly starting a new transaction can create duplicate or competing effects.

🔵 Some providers intentionally combine validation and commit into one atomic API. In that case there is no meaningful externally observable prepare state; the API's authoritative acceptance boundary remains the relevant claim point.

🔴 No current Nexo/Lúmina executable path exposes a provider-authoritative prepare/commit protocol. Existing prepared intent is local coordinator evidence and does not establish target commitment.

Exact recovery point: **AB105.099R → prepare-vs-commit separation → PREPARED/VALIDATED/STAGED are not COMMITTED; UNKNOWN around the commit boundary remains unresolved until authoritative evidence closes it.**

Next exact frontier: audit **abort/cancel semantics for prepared domains**, including whether abort is authoritative, what it proves, and what happens when abort races with commit.

DO-NOT-REPEAT: AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.100R abort/cancel versus commit: cancellation is not retroactive non-commit proof

🟢 ABORT/CANCEL is a separate operation unless the provider contract explicitly defines it as an atomic transition on the original operation's commitment state.

- Abort before the authoritative commit boundary can establish REJECTED/non-commit only when the provider guarantees that the original operation could not have crossed acceptance.
- Abort after the original commit boundary does not undo the historical COMMITTED claim; cancellation/compensation is a new effect with its own identity and outcome.
- Concurrent ABORT ↔ COMMIT requires an authoritative ordering/linearization rule. Client response order is not sufficient.
- A successful cancel response without authoritative binding to the original commit boundary does not prove the original effect never committed.
- Timeout/crash during cancel creates a new UNKNOWN for the cancel operation and does not resolve the original operation.
- If the provider can authoritatively return the original operation's terminal state and guarantees cancellation semantics relative to that state, reconciliation may resolve the original claim; otherwise it remains UNKNOWN.
- Blindly mapping CANCEL_SUCCESS → ORIGINAL_REJECTED is forbidden.
- If original COMMIT and compensation both succeed, history remains ORIGINAL=COMMITTED plus COMPENSATION=COMMITTED; compensation does not rewrite the original claim.
- For a shared commit domain, abort must cover the same frozen participant set/domain if it is intended to terminate the prepared transaction. Partial cancellation does not establish aggregate non-commit.

🔵 The critical proof question is not whether an API is named cancel, abort, or rollback, but which authoritative boundary the provider binds that operation to and what it guarantees about effects that may already have crossed the commit point.

🔴 No current Nexo/Lúmina executable path has an authoritative abort/commit race protocol or target-side cancellation record that can close the original commitment claim.

Exact recovery point: AB105.100R → abort/cancel versus commit → cancellation is not retroactive proof of non-commit; only provider-authoritative boundary semantics can close the original claim.

Next exact frontier: AB105.101R → commit receipt versus world-state observation: determine whether a post-commit state observation can prove commitment, and when state equality is insufficient.

DO-NOT-REPEAT: AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.101R commit receipt versus world-state observation: state equality is not causal commitment proof

🟢 A post-effect observation of target/resource state can be strong evidence about current state, but it does not automatically prove that the exact operation/effect committed.

Required distinction:
- COMMITTED claim: authoritative evidence that exact operation/effect identity and fingerprint crossed the target commit boundary.
- STATE_OBSERVED: authoritative or trusted observation of current resource state/version.
- CAUSAL_COMMIT: stronger claim that the observed state was produced by the exact operation under audit.

🟢 State equality alone cannot establish CAUSAL_COMMIT when:
- another operation could produce the same state;
- the resource can converge to the same value independently;
- an earlier/later retry or duplicate could have produced the state;
- restore/replay/reconciliation can reproduce the same state;
- the state lacks operation provenance.

🟢 A matching resource version is not automatically an operation receipt. Version semantics must explicitly bind the version transition to the exact operation/effect.

🟢 Conversely, an authoritative COMMITTED receipt should not be discarded merely because a later state observation appears unchanged. The commitment claim and current-state claim are separate domains; discrepancy becomes a reconciliation/integrity issue.

🟢 Strong causal state evidence can legitimately close UNKNOWN only when the target contract explicitly provides operation-to-state provenance, such as an authoritative operation record binding the exact operation/fingerprint to the resulting resource version/incarnation.

🟢 For idempotent effects whose contract defines the operation record as authoritative, a later lookup may prove COMMITTED even if the current resource state has subsequently changed. Current state is not the historical commit record.

🟢 For multi-participant effects, matching state on every participant is insufficient for aggregate COMMITTED unless each state transition is authoritatively bound to the exact participant operation and the shared commit-domain contract establishes common atomicity.

🔵 Independent observation is valuable for reconciliation and detecting discrepancies, but its evidentiary strength depends on explicit provenance/causal semantics rather than visual equality of state.

🔴 No current Nexo/Lúmina executable path provides an authoritative operation-to-resource causal receipt binding. Current world-state persistence/revision is not sufficient to claim exact external operation commitment.

Exact recovery point: AB105.101R → commit receipt versus world-state observation → current state can corroborate/reconcile but state equality alone does not prove exact operation commitment or aggregate atomicity.

Next exact frontier: AB105.102R → resource-version/fingerprint binding: determine what minimum target-side version transition evidence is required to causally bind a committed operation to the resulting resource state.

DO-NOT-REPEAT: AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.102R resource-version/fingerprint binding: minimum causal witness for operation-to-state attribution

🟢 A resource version can become causal evidence for an exact operation only when the target contract binds the version transition to that operation at the authoritative commit boundary.

Minimum witness:
- exact operation_id/effect_id;
- exact payload/effect fingerprint;
- target resource_id;
- resource_incarnation/generation;
- authoritative pre-commit resource version or equivalent expected-version predicate;
- authoritative resulting resource version;
- target-side record that the exact operation caused that version transition;
- commit-domain/receipt provenance linking the record to the same acceptance boundary.

🟢 A before-version + after-version pair is insufficient by itself. Another operation may have consumed the same transition, or multiple operations may produce indistinguishable state.

🟢 An after-version alone is insufficient because it does not identify the operation that produced it.

🟢 A fingerprint alone is insufficient because it identifies intended content, not acceptance or resulting state.

🟢 Resource incarnation is mandatory whenever replacement/recreation can reset or reuse versions. Version 42 on incarnation A is not equivalent to version 42 on incarnation B.

🟢 The target must define whether version advancement occurs atomically with effect acceptance. If the version is advanced separately, it cannot automatically serve as the commit witness.

🟢 An authoritative operation record containing operation identity, fingerprint, target incarnation, and resulting version can bind historical commitment even after the current resource has advanced further.

🟢 If only resource state/version remains after operation-record retention expires, UNKNOWN may remain unresolved. Absence of the operation record does not prove that the version transition was not caused by the operation.

🔵 This is a causal-attribution contract, not merely optimistic concurrency. An expected-version check prevents stale writes but does not by itself prove which operation produced the resulting state.

🔴 No current Nexo/Lúmina executable target provides this complete authoritative operation-to-version/fingerprint binding. Existing local world-state revision is a persistence revision, not a target-authoritative causal receipt.

Exact recovery point: AB105.102R → resource-version/fingerprint binding → causal commitment requires target-authoritative binding of exact operation/fingerprint to the resulting version within the same commitment provenance.

Next exact frontier: AB105.103R → resource reincarnation/generation binding: audit whether identity and version remain safe across delete/recreate/restore/failover.

DO-NOT-REPEAT: AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.103R resource reincarnation/generation binding: identity and version are not stable across replacement

🟢 Resource identity and version are insufficient across delete/recreate, restore, clone, failover, or equivalent replacement unless the target exposes an authoritative incarnation/generation boundary.

Minimum binding for an effect claim:
- stable logical resource identity;
- authoritative resource incarnation/generation;
- version within that incarnation;
- operation/effect identity and fingerprint;
- authority/fence context where required;
- target receipt/operation record bound to the same incarnation.

🟢 Reusing the same logical resource_id after replacement does not preserve continuity. An old operation against incarnation A must not be reconciled as a commit against incarnation B.

🟢 Reusing a version number is equally unsafe. Version 7 on generation A and version 7 on generation B are distinct states.

🟢 Restore/clone can resurrect old operation registries, receipts, versions, or prepared intents. Recovery generation must prevent historical records from being silently treated as current unless the provider explicitly defines them as authoritative after recovery.

🟢 Failover with missing operation state cannot imply REJECTED. If the previous authoritative target may have committed before failover, the effect remains UNKNOWN until the new authority can reconcile it.

🟢 A new incarnation may intentionally invalidate outstanding operations from the old incarnation. That can justify RESOURCE_REPLACED only when the target contract guarantees that old operations cannot subsequently commit against the new incarnation.

🟢 Incarnation changes must be part of reconciliation keys and commit evidence, not merely diagnostic metadata.

🔵 Logical identity is useful for user-facing continuity, but commitment safety requires a target-authoritative generation boundary underneath it.

🔴 No current Nexo/Lúmina executable target provides authoritative resource incarnation/recovery generation binding for external effects.

Exact recovery point: AB105.103R → resource reincarnation/generation binding → resource_id/version cannot safely identify commitment across replacement; authoritative incarnation must bind operation and receipt.

Next exact frontier: AB105.104R → failover/leader-change commit reconciliation: audit whether authority transfer can safely preserve, reject, or leave UNKNOWN in-flight effects.

DO-NOT-REPEAT: AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.104R failover/leader-change reconciliation: authority transfer does not resolve in-flight effects by itself

🟢 A failover or leader change changes who is authoritative; it does not by itself determine whether an in-flight effect committed before the transition.

Required separation:
- old authority state;
- new authority/recovery generation;
- target/resource incarnation;
- operation/effect identity;
- authoritative commit/operation record;
- fence/epoch semantics;
- reconciliation evidence spanning the authority transition.

🟢 If the old leader has an authoritative COMMITTED record, the new leader must preserve/reconcile that claim rather than infer non-commit from missing local state.

🟢 If the new leader has no record and the old leader may have accepted the effect, the correct state remains UNKNOWN unless the provider's replication/recovery contract proves non-acceptance.

🟢 A new leader's empty journal is not evidence of REJECTED. Local absence after failover is only absence from that replica's state.

🟢 A new authority epoch/fence can prevent old operations from committing after the transition only if the target enforces the fence at its acceptance boundary. Issuing a new epoch in coordinator state is not enough.

🟢 If the provider guarantees durable replicated operation records and defines the recovery point from which they are authoritative, failover reconciliation can resolve prior UNKNOWN states. The guarantee must cover the exact operation identity/fingerprint and resource incarnation.

🟢 Split-brain or overlapping authorities require fencing/quarantine. Two leaders each claiming local success cannot produce a single COMMITTED aggregate without an authoritative resolution boundary.

🟢 Failover can create a new recovery generation without changing the historical outcome of operations that committed under the previous generation. Historical provenance and current authority must remain separate.

🔵 “Leader changed successfully” is an authority-lifecycle fact, not an effect-commit fact.

🔴 No current Nexo/Lúmina executable path provides an authoritative replicated operation registry plus enforced failover fencing sufficient to resolve in-flight external effects.

Exact recovery point: AB105.104R → failover/leader-change reconciliation → authority transfer alone does not resolve in-flight effects; authoritative replicated history or enforced fencing is required.

Next exact frontier: AB105.105R → split-brain/dual-authority effect acceptance: determine how conflicting commit claims are quarantined and which boundary can resolve them.

DO-NOT-REPEAT: AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.105R split-brain/dual-authority effect acceptance: conflicting commits require authoritative fencing or quarantine

🟢 Two actors may each hold locally valid-looking authority while the system lacks a single current authority boundary. Local validity is not sufficient to establish globally current authority.

Required safety properties:
- one authoritative authority epoch/generation;
- target-enforced fencing that rejects stale/competing epochs at the actual acceptance boundary;
- resource incarnation binding;
- operation/effect identity and fingerprint;
- authoritative commit record with authority/fence provenance;
- conflict/quarantine state when the system cannot establish a unique winner.

🟢 If old and new authorities can both cause target acceptance, Nexo cannot safely select a winner using timestamps, arrival order, local leadership status, majority of coordinator logs, or “latest response”.

🟢 If both effects actually committed under a target that permits dual acceptance, the result is not a single atomic claim. Preserve both participant/effect outcomes and classify the conflict according to the target's authoritative history.

🟢 If only one commit is authoritatively established and the other side has merely local intent/ACK, the authoritative commit can stand; the weaker side remains unresolved or rejected only according to its own contract.

🟢 If two authoritative records conflict about the same operation identity/fingerprint or resource incarnation, the contradiction itself becomes an integrity/conflict event. It must not be silently reconciled by choosing one record.

🟢 A new authority epoch is useful only when the target enforces the ordering/fence. Coordinator-side epoch comparison cannot undo an already accepted stale effect.

🟢 Quarantine must be monotonic against unsafe promotion: conflicting evidence blocks new claims that depend on choosing a winner until an authoritative reconciliation boundary resolves the conflict.

🔵 Split-brain safety is therefore a target-enforcement property, not merely a coordinator election property.

🔴 No current Nexo/Lúmina executable target provides dual-authority fencing plus an authoritative conflict-resolution record for external effects.

Exact recovery point: AB105.105R → split-brain/dual-authority effect acceptance → conflicting authority claims require target-enforced fencing or explicit quarantine; local timestamps/leader status cannot choose the winner.

Next exact frontier: AB105.106R → fence enforcement boundary: distinguish fence issuance, presentation, validation, and actual target rejection of stale effects.

DO-NOT-REPEAT: AB105.104R failover; AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.106R fence enforcement boundary: issued/presented/validated/rejected are distinct claims

🟢 A fence becomes a safety boundary only when the target enforces it at the actual effect-acceptance point.

Required distinctions:
- FENCE_ISSUED: authority generated a fence/epoch/token.
- FENCE_PRESENTED: operation carried a fence value.
- FENCE_VALIDATED: target checked the presented value at some point.
- FENCE_ACCEPTED: target accepted the effect under that fence at its commitment boundary.
- STALE_EFFECT_REJECTED: target authoritatively guarantees the effect was not accepted because its fence was stale.

🟢 Issuance does not prove delivery, presentation does not prove validation, and validation before a later mutation does not prove the fence remained current until acceptance.

🟢 A local pre-check such as “current fence == presented fence” is not sufficient when authority can advance concurrently.

🟢 Strong fencing requires the target to compare the presented fence against the target-authoritative current fence/version at the same boundary that accepts the effect, or to provide an equivalent atomic protocol.

🟢 A fence rejection is evidence of non-acceptance only when the target contract guarantees the stale request could not have crossed the commit boundary.

🟢 A fence value may be monotonically ordered yet still be unsafe if the target does not enforce it, if resource incarnation is missing, or if restore/failover can resurrect an older accepted fence.

🟢 “Fence issued” and “revocation issued” remain coordinator/authority facts until the target enforces the new boundary. This directly preserves the earlier STOP distinction: ISSUED ≠ ENFORCED.

🔵 Fence freshness and capability freshness remain separate. A currently valid fence does not prove the provider has the capability needed for the claimed commitment, and capability admission does not authorize a stale fence.

🔴 No current Nexo/Lúmina executable external target demonstrates an authoritative fence comparison atomically coupled to effect acceptance.

Exact recovery point: AB105.106R → fence enforcement boundary → only target-enforced comparison at the acceptance boundary can turn a fence into a commitment-safety property.

Next exact frontier: AB105.107R → concurrent fence advancement versus effect acceptance: audit the race where revocation/new epoch and target commit occur simultaneously.

DO-NOT-REPEAT: AB105.105R split-brain; AB105.104R failover; AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.107R concurrent fence advancement vs effect acceptance: race resolves only at an authoritative boundary

🟢 When authority/fence advancement races with effect acceptance, wall-clock order, request-send order, response order, and coordinator observation order cannot by themselves determine which authority was valid at commitment.

Three cases require distinct semantics:
- Effect accepted under old fence before the authoritative fence transition: COMMITTED under the old authority, if the target contract permits it.
- New fence becomes authoritative before target acceptance: stale effect must be rejected, if target enforces the fence at acceptance.
- No authoritative ordering witness exists: the effect remains UNKNOWN; do not infer from timestamps.

🟢 A local sequence of revocation-issued then request-sent does not prove safety. Conversely, request-sent then revocation-issued does not prove the request committed before revocation.

🟢 The required ordering is between the target acceptance boundary and the authority/fence transition boundary, not between client-side events.

🟢 Safe designs therefore need one of:
1. shared atomic commit domain containing both authority transition and effect acceptance;
2. target-enforced monotonic fence checked atomically at effect acceptance;
3. an authoritative linearizable authority/target protocol that establishes which boundary precedes the other.

🟢 If the authority transition is durable but the target has not observed/enforced it, the new authority is not yet a safety fence for that target.

🟢 If the effect is accepted and the response is lost, later authoritative operation lookup can establish COMMITTED under the fence that the target recorded. Lost response does not become REJECTED.

🟢 If revocation is observed by the coordinator but the target cannot prove whether the effect crossed acceptance, preserve UNKNOWN and quarantine/reconcile according to effect class.

🔵 This race is fundamentally about linearization, not timestamp precision. Increasing timestamp resolution or adding logs does not manufacture a happens-before/commit ordering.

🔴 No current Nexo/Lúmina executable target jointly linearizes authority/fence advancement with external effect acceptance.

Exact recovery point: AB105.107R → concurrent fence advancement vs effect acceptance → only authoritative ordering at/around the target acceptance boundary can resolve the race; client-side event order cannot.

Next exact frontier: AB105.108R → lost response/receipt after fenced acceptance: determine the minimum authoritative lookup needed to recover COMMITTED without retry duplication.

DO-NOT-REPEAT: AB105.106R fence enforcement; AB105.105R split-brain; AB105.104R failover; AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.108R lost response/receipt after fenced acceptance: reconcile before retry

🟢 A lost client response after target acceptance is not REJECTED. The effect may already be COMMITTED.

Minimum authoritative reconciliation lookup should bind:
- exact operation_id/effect_id;
- exact payload/effect fingerprint;
- target/resource_id;
- resource incarnation/generation;
- authority/fence context recorded at acceptance where relevant;
- authoritative operation status/receipt;
- commit-domain identity when the effect participates in shared atomicity.

🟢 If lookup returns an exact compatible COMMITTED record, resolve UNKNOWN → COMMITTED or DUPLICATE_COMMITTED according to the provider's defined semantics. Do not execute the effect again merely because the client did not receive the receipt.

🟢 If lookup returns an exact authoritative REJECTED record whose semantics guarantee non-acceptance, resolve UNKNOWN → REJECTED.

🟢 If lookup returns no record, that is not automatically REJECTED. The result remains UNKNOWN unless the provider contract defines absence as authoritative non-acceptance within a closed reconciliation window.

🟢 If lookup finds the same operation identity with incompatible fingerprint, treat it as COLLISION/QUARANTINE rather than retrying or accepting either result silently.

🟢 If the operation record exists but its retention window has expired, historical absence remains non-proof. Reuse of the same operation identity must be prevented unless the provider guarantees the old operation can no longer complete or be reconciled.

🟢 A successful retry is not evidence that the first attempt failed. Retry safety requires provider-side duplicate semantics covering the same identity, fingerprint, target incarnation, and applicable retention/fence rules.

🟢 Reconciliation lookup and effect execution must remain separate. The lookup may close an epistemic claim without generating a new external effect.

🔵 A client-visible receipt can be lost while the target remains authoritative. Therefore receipt delivery is transport; commitment is target-domain state.

🔴 No current Nexo/Lúmina executable target exposes the required durable authoritative operation lookup/receipt registry.

Exact recovery point: AB105.108R → lost response/receipt after fenced acceptance → authoritative lookup must precede retry; absence of a record is not rejection unless the provider explicitly guarantees it.

Next exact frontier: AB105.109R → reconciliation-window closure: determine when a provider may safely declare historical absence authoritative and what proof is required before operation identity reuse.

DO-NOT-REPEAT: AB105.107R fence race; AB105.106R fence enforcement; AB105.105R split-brain; AB105.104R failover; AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.109R reconciliation-window closure: absence becomes authoritative only under an explicit provider boundary

🟢 Expiration or absence of an operation record does not by itself prove non-commit. To close UNKNOWN from absence, the provider/target contract must define a closed reconciliation boundary covering the operation's possible completion, visibility, replay, failover, and recovery paths.

Minimum proof for authoritative absence should establish:
- exact operation identity and scope;
- target/resource incarnation;
- provider retention and lookup semantics;
- maximum completion/visibility/replay horizon for that operation class;
- failover/restore behavior cannot resurrect an older operation;
- all authoritative replicas/domains relevant to the lookup have crossed the closure boundary;
- stale or delayed callbacks cannot still create the effect;
- the provider explicitly defines post-closure absence as non-acceptance/non-commit.

🟢 Before that boundary, NOT_FOUND means “not found in this lookup context”, not necessarily REJECTED.

🟢 After a provider-defined closure boundary with all required guarantees, authoritative absence may resolve UNKNOWN → REJECTED, but only for the exact operation/effect/resource scope covered by that contract.

🟢 Operation identity reuse is a separate decision. Even if an old lookup becomes closed, reuse is unsafe unless the provider guarantees the old identity cannot later complete, reappear after restore/failover, or be confused with the new operation.

🟢 Safe reuse therefore needs a new identity namespace/generation or provider-enforced generation fence, plus proof that the prior identity is outside every relevant effect/reconciliation window.

🟢 Local TTLs, cleanup jobs, cache eviction, or database deletion do not create authoritative closure. They are coordinator housekeeping unless the target contract makes them the commitment boundary.

🟢 If closure cannot be proven, preserve UNKNOWN/quarantine rather than manufacturing REJECTED for operational convenience.

🔵 This separates three events that are often collapsed:
1. record expired/deleted locally;
2. record no longer discoverable through a lookup;
3. provider-authoritative proof that the operation can never commit/reappear.
Only the third can close UNKNOWN by absence.

🔴 No current Nexo/Lúmina executable provider establishes such a target-authoritative reconciliation closure boundary or safe identity-reuse fence.

Exact recovery point: AB105.109R → reconciliation-window closure → absence is authoritative only after provider-defined closure of every relevant completion/recovery/replay path.

Next exact frontier: AB105.110R → late completion/callback after reconciliation closure: determine how delayed external evidence is handled without rewriting historical claims.

DO-NOT-REPEAT: AB105.108R lost receipt; AB105.107R fence race; AB105.106R fence enforcement; AB105.105R split-brain; AB105.104R failover; AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.110R late completion/callback after reconciliation closure: preserve history, surface contradiction

🟢 A late external callback or authoritative operation record can arrive after a local reconciliation window was considered closed. The system must not silently delete or rewrite the earlier claim.

Required distinction:
- a local closure/timeout/cleanup is not authoritative closure;
- a provider-authoritative closure may justify REJECTED only within its explicit contract;
- later evidence that contradicts that claim is an integrity/conflict event requiring provenance review.

🟢 If the late evidence is authoritative and proves the exact operation/effect committed, the historical record must preserve both:
1. the earlier claim and why it was made;
2. the later authoritative evidence;
then transition the current epistemic state to COMMITTED/CONFLICT according to the contradiction protocol.

🟢 If the earlier REJECTED claim was provider-authoritative and explicitly guaranteed impossible later commitment, a purported late success is not silently accepted. It indicates provider-contract violation, stale/wrong-domain evidence, resource-incarnation mismatch, or compromised provenance; quarantine is required until reconciled.

🟢 If the earlier closure was only local/non-authoritative, late authoritative COMMITTED evidence may legitimately resolve the prior UNKNOWN without contradiction to the provider contract; the local claim was simply insufficiently strong.

🟢 A late callback must be bound to exact operation identity, fingerprint, target/resource incarnation, and provider authority. A callback merely carrying a familiar operation_id is insufficient.

🟢 Late evidence must never be used to retroactively label a prior retry as safe or prove that an earlier attempt did not commit. Historical attempts and claims remain immutable provenance.

🟢 If a replacement operation was already executed after an unsafe local closure and the original later commits, both effects are historical facts. The system must surface duplicate/conflict exposure and cannot pretend the second operation was a retry of a proven non-commit.

🔵 This establishes an important distinction between epistemic finality and contractual finality: local confidence can be overturned by stronger evidence; an explicit provider guarantee being contradicted is an integrity incident, not normal reconciliation.

🔴 No current Nexo/Lúmina executable immutable claim ledger, late-callback reconciliation protocol, or provider-contract violation quarantine exists.

Exact recovery point: AB105.110R → late completion/callback after reconciliation closure → preserve prior claim, attach late evidence, and escalate contradictions instead of rewriting history.

Next exact frontier: AB105.111R → immutable claim/evidence lineage: define the minimum event history required to reconstruct why each commitment state was asserted and later changed.

DO-NOT-REPEAT: AB105.109R closure; AB105.108R lost receipt; AB105.107R fence race; AB105.106R fence enforcement; AB105.105R split-brain; AB105.104R failover; AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.111R immutable claim/evidence lineage: reconstructable commitment history

🟢 A commitment state is only safely auditable if Nexo can reconstruct which claim was made, from which evidence, under which authority/context, and what later evidence changed or contradicted it.

Minimum immutable lineage for each claim transition:
- claim_id and parent/superseded claim_id;
- operation_id/effect_id/attempt_id;
- effect fingerprint;
- target/resource identity and incarnation;
- authority context, epoch/generation and fence presented/observed;
- capability/admission assessment relevant to the claim;
- claim state and exact transition reason;
- evidence references with provenance/domain and observation time;
- commit-domain/participant-set identity when applicable;
- reconciliation lookup scope and provider semantics;
- actor/component that asserted the claim;
- policy/contract version used to interpret the evidence;
- integrity linkage/digest so historical records cannot be silently rewritten.

🟢 A claim record is not itself authoritative commitment evidence. It is the immutable explanation/provenance layer for why Nexo held a claim.

🟢 Evidence and interpretation must remain separate. The same evidence may be re-evaluated under a corrected contract, while the original interpretation remains preserved as historical provenance.

🟢 A later stronger claim should supersede the current epistemic state without deleting prior claims. Contradictions become explicit conflict/integrity events.

🟢 Reconciliation must be deterministic from retained evidence: if two operators/recovery processes read the same authoritative evidence and contract version, they should reach the same claim transition.

🟢 Missing lineage is itself an audit limitation. If the system cannot reconstruct the evidence and contract behind a past COMMITTED/REJECTED assertion, it must not manufacture stronger historical certainty.

🟢 Event timestamps are useful provenance but cannot establish authority/commit ordering unless the contract explicitly makes them authoritative. Causal/commit boundaries remain domain-specific.

🔵 This lineage layer is distinct from the target's operation registry. The target registry proves target-domain facts; Nexo lineage records how those facts were observed, interpreted, and promoted into Nexo claims.

🔴 No current Nexo/Lúmina executable immutable claim ledger with complete evidence/contract lineage exists. Existing local journals are bounded operational records, not a protected historical claim ledger.

Exact recovery point: AB105.111R → immutable claim/evidence lineage → historical claims must remain reconstructable without confusing provenance records with authoritative target commitment.

Next exact frontier: AB105.112R → claim-ledger integrity and tamper/rewrite detection: determine what protects lineage against silent deletion, fork, rollback, or conflicting recovery histories.

DO-NOT-REPEAT: AB105.110R late evidence; AB105.109R closure; AB105.108R lost receipt; AB105.107R fence race; AB105.106R fence enforcement; AB105.105R split-brain; AB105.104R failover; AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.112R claim-ledger integrity: tamper, fork, rollback and recovery-conflict detection

🟢 Immutable claim lineage requires more than append-only intent. Recovery must detect silent deletion, rewriting, rollback to an older ledger state, divergent forks, and conflicting histories restored from different authorities.

Minimum integrity properties:
- each claim/event has a stable identifier and parent/causal references;
- records are append-only within the protected claim domain;
- cryptographic integrity linkage detects mutation/deletion/reordering;
- checkpoints/snapshots identify the covered sequence and recovery generation;
- authority for the ledger itself is explicit and separate from ordinary coordinator authority;
- recovery rejects or quarantines histories whose lineage cannot be authenticated or whose generation is older/conflicting;
- competing valid histories are preserved as distinct branches until an authoritative reconciliation decision exists.

🟢 A hash chain detects modification only if an attacker/recovery process cannot simply replace the trusted checkpoint. Integrity therefore also needs an independently protected trust anchor/checkpoint or equivalent authenticated storage boundary.

🟢 A signed record proves provenance/authorship of the record, not truth of the claim. Signature validity cannot turn a stale or unauthorized claim into current authority.

🟢 Monotonic sequence numbers alone do not prevent rollback when an older valid snapshot can be restored. Recovery generation/epoch and an external or independently protected monotonic anchor are required for rollback detection.

🟢 Two histories with valid internal hashes/signatures are not automatically mergeable. If they diverge from a common predecessor, preserve both branches and quarantine any claim that depends on choosing between incompatible histories.

🟢 A ledger fork is different from a target-effect conflict: the former is disagreement about Nexo's evidence/claim history; the latter is disagreement about what an external target committed. They may correlate but must not be collapsed.

🟢 Recovery must never “repair” a conflict by deleting one branch. It should create an explicit reconciliation/conflict event linked to both histories and establish a new trusted generation after resolution.

🔵 This produces a three-layer integrity distinction:
1. record integrity — was the stored lineage altered?
2. history integrity — is this the authoritative/latest lineage generation?
3. claim truth — does target-domain evidence actually support the claim?
Passing layer 1 or 2 does not prove layer 3.

🔴 No current Nexo/Lúmina executable protected claim ledger, independent checkpoint anchor, rollback detector, or fork-reconciliation protocol exists.

Exact recovery point: AB105.112R → claim-ledger integrity → tamper/rollback/fork detection requires protected lineage plus an independent recovery-generation/trust anchor; cryptographic integrity alone does not establish claim truth.

Next exact frontier: AB105.113R → checkpoint/snapshot authority: define how a recovery checkpoint becomes trusted without circularly trusting the ledger being recovered.

DO-NOT-REPEAT: AB105.111R lineage; AB105.110R late evidence; AB105.109R closure; AB105.108R lost receipt; AB105.107R fence race; AB105.106R fence enforcement; AB105.105R split-brain; AB105.104R failover; AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.113R checkpoint/snapshot authority: recovered state cannot authenticate itself

🟢 A recovery checkpoint cannot be trusted merely because the checkpoint is internally consistent, hash-valid, or signed by an identity whose authority is contained only inside the recovered state.

Minimum trust model:
- checkpoint identity and covered ledger sequence/generation;
- independently authenticated checkpoint anchor or authority;
- recovery generation/epoch;
- integrity proof for the checkpoint contents;
- explicit scope: what facts the checkpoint is authoritative for;
- freshness/monotonicity evidence preventing rollback;
- provenance showing who/what produced and finalized the checkpoint;
- reconciliation status for effects outside the checkpoint boundary.

🟢 A valid snapshot proves integrity relative to its trust anchor; it does not prove that it is the newest authoritative snapshot.

🟢 A signed snapshot proves the signer produced/endorsed it, but signer authority must itself be current and independently established. Historical authority cannot bootstrap current authority.

🟢 Two valid checkpoints from different generations cannot be merged by timestamp, file size, local sequence, or majority of local nodes. If no authoritative ordering exists, preserve both and quarantine dependent claims.

🟢 A checkpoint may be authoritative for local coordinator state while remaining non-authoritative for external effect commitment. Snapshot scope must therefore be claim-specific.

🟢 Recovery must establish a new recovery generation before admitting new effects when the restored checkpoint cannot prove it includes all effects that may have committed outside the snapshot.

🟢 The checkpoint anchor and the recovered ledger should not share a single failure domain if the goal is to detect rollback or self-consistent malicious restoration. Otherwise an attacker can restore both to the same older state.

🔵 This confirms a general rule: **recovery provenance is not recovery authority**. A perfectly preserved historical state can still be stale.

🔴 No current Nexo/Lúmina executable independent checkpoint anchor, protected recovery-generation authority, or snapshot-scope enforcement exists.

Exact recovery point: AB105.113R → checkpoint/snapshot authority → recovered state cannot be its own root of trust; checkpoint freshness and authority require an independent boundary.

Next exact frontier: AB105.114R → independent recovery authority and generation monotonicity: determine how a new recovery generation is established when the old authority/ledger may be compromised or unavailable.

DO-NOT-REPEAT: AB105.112R ledger integrity; AB105.111R lineage; AB105.110R late evidence; AB105.109R closure; AB105.108R lost receipt; AB105.107R fence race; AB105.106R fence enforcement; AB105.105R split-brain; AB105.104R failover; AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.114R independent recovery authority and generation monotonicity

🟢 A recovered coordinator cannot safely declare itself the newest authority using only its restored snapshot. A new recovery generation requires an authority boundary independent enough to detect or reject rollback to an older generation.

Minimum recovery-generation evidence:
- new recovery_generation/epoch identifier;
- authoritative issuer or quorum whose current authority is established outside the stale snapshot;
- monotonicity/anti-rollback anchor;
- predecessor generation reference;
- reason and evidence for transition;
- fence binding that prevents the old generation from continuing to commit effects;
- explicit recovery scope and unresolved-operation set.

🟢 A locally generated random/new epoch is not by itself authoritative. It provides uniqueness, not proof that the issuer is the current recovery authority.

🟢 A quorum of mutually restored stale nodes is not automatically independent authority. If all derive from the same compromised/old snapshot, majority only reproduces the same history.

🟢 Recovery can proceed without proving the old generation's final effect state, but then the unresolved set must be quarantined/UNKNOWN and the new generation must fence old effects before admitting new critical effects.

🟢 If no independent authority or target-enforced fence exists, the safe result is STOP/QUARANTINE rather than self-promotion.

🟢 A new recovery generation does not rewrite historical outcomes. It establishes a new currentness boundary and links unresolved historical operations to the new reconciliation process.

🟢 Generation monotonicity must survive crash/restart/restore. A counter stored only inside the recoverable snapshot can roll back with the snapshot and therefore cannot be the sole anti-rollback anchor.

🔵 This closes a common circularity: “the recovered state says it is current, therefore it is current.” Currentness must be established from outside the state being recovered.

🔴 No current Nexo/Lúmina executable independent recovery authority, external monotonic generation anchor, or target-enforced old-generation fence exists.

Exact recovery point: AB105.114R → independent recovery authority/generation monotonicity → new recovery authority cannot be self-certified by the stale state it recovered.

Next exact frontier: AB105.115R → old-generation fencing during recovery: determine the exact conditions under which a new recovery generation can safely prevent stale in-flight effects.

DO-NOT-REPEAT: AB105.113R checkpoint authority; AB105.112R ledger integrity; AB105.111R lineage; AB105.110R late evidence; AB105.109R closure; AB105.108R lost receipt; AB105.107R fence race; AB105.106R fence enforcement; AB105.105R split-brain; AB105.104R failover; AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.115R old-generation fencing during recovery: new generation is safe only when stale effects are target-rejected

🟢 Establishing a new recovery generation does not by itself stop effects issued by the old generation. Safe recovery requires an enforced boundary that makes old-generation effects unable to cross the target acceptance boundary.

Minimum conditions:
- new recovery generation/epoch is independently authoritative;
- target/resource stores the current accepted generation or equivalent fence;
- every critical effect presents its generation/fence;
- target checks that fence at the actual acceptance/commit boundary;
- stale generations are authoritatively rejected before acceptance;
- rejection semantics guarantee the stale effect did not commit;
- recovery reconciles in-flight old-generation operations whose outcome crossed or may have crossed the transition.

🟢 Merely marking the old coordinator STOPPED, revoking its credential, or recording a new epoch in the coordinator is insufficient if the target can still accept an old-generation request.

🟢 Credential revocation and generation fencing are related but distinct: revocation may prevent future authentication, while an already-issued capability/request may still reach the target unless the target enforces current generation at acceptance.

🟢 A stale effect that reaches the target after the new generation is established must resolve to STALE_FENCE/REJECTED only when target semantics prove non-acceptance. Otherwise the old operation remains UNKNOWN and requires reconciliation.

🟢 Recovery should fence before admitting new critical effects. If old-generation effects remain unfenced, new effects can race with stale effects and recovery cannot establish a clean authority boundary.

🟢 If the target cannot enforce a fence, recovery may establish a new coordinator generation for bookkeeping, but it cannot claim that external effects from the old generation are safely stopped. Critical external admission remains STOP/QUARANTINE.

🟢 Fence enforcement must survive target failover/restore; otherwise a stale replica or restored target can resurrect acceptance under an old generation.

🔵 This closes the distinction between authority lifecycle and effect safety: OLD_AUTHORITY_DISABLED is a coordinator fact; OLD_EFFECTS_CANNOT_COMMIT is a target-enforced fact.

🔴 No current Nexo/Lúmina executable external target provides a recovery-generation fence enforced atomically at effect acceptance.

Exact recovery point: AB105.115R → old-generation fencing during recovery → new recovery authority is not an external safety boundary until stale generations are target-rejected at acceptance.

Next exact frontier: AB105.116R → recovery admission ordering: prove the complete sequence from independent recovery authority through stale-operation quarantine/fencing to first safe new effect. AB105.116R is the final protected recovery audit anchor; do not create AB105.117R.

DO-NOT-REPEAT: AB105.114R independent recovery authority; AB105.113R checkpoint authority; AB105.112R ledger integrity; AB105.111R lineage; AB105.110R late evidence; AB105.109R closure; AB105.108R lost receipt; AB105.107R fence race; AB105.106R fence enforcement; AB105.105R split-brain; AB105.104R failover; AB105.103R reincarnation; AB105.102R version/fingerprint; AB105.101R receipt vs state; AB105.100R abort/cancel; AB105.099R prepare/commit; AB105.098R linearization; AB105.097R participant set; AB105.096R shared domain; AB105.095R inheritance; AB105.094R causal graph; AB105.093R compensation; AB105.092R finality; AB105.091R source conflict; AB105.090R recovery ordering; AB105.089R retention/reuse; AB105.088R identity; AB105.087R transitions; AB105.086R coverage; AB105.085R carrier; AB105.084R gap; AB105.083R admission; AB105.082R commitment; AB105.081R taxonomy; AB105.080R target-store search; AB105.079R persistence; local adapter idempotency; SQLite; Lúmina persistence; S9; Kafka/JMM/G0; TLC; AB105.117R.

## 2026-10-07 — AB105.116R FINAL PROTECTED RECOVERY ANCHOR

🟢 Complete recovery ordering:
1. independent recovery authority;
2. new monotonic recovery generation/epoch;
3. target-enforced fence bound to that generation;
4. stop critical external admission during transition;
5. identify prior-generation operations outside the recovered snapshot;
6. quarantine unresolved operations as UNKNOWN;
7. establish current target/resource incarnation and fence;
8. prove stale-generation effects are rejected at the target acceptance boundary;
9. only then admit the first new critical effect;
10. persist generation, unresolved set, fence, and admission decision in protected recovery lineage.

🟢 Recovery completion, authority establishment, old-effect fencing, and first-new-effect commitment are separate claims. Local process restart or an empty journal cannot prove the external safety boundary.

🟢 The first post-recovery critical effect requires its own current authority, fence, capability, identity, target/incarnation, and commitment evidence. It does not inherit these from the recovery transition.

🟢 If any authoritative boundary is missing, critical external admission remains STOP/QUARANTINE.

🔵 FINAL AUDIT RESULT: the semantic recovery protocol is closed through this protected anchor. Current Nexo/Lúmina code does not implement the independent recovery authority, target-enforced recovery fence, authoritative external operation registry, or immutable recovery claim ledger required for an implementation-level safety proof. This is therefore an evidence/specification closure, not an implementation-complete safety proof.

🔴 AB105.117R is prohibited. Future work must begin as a separately named investigation without renumbering or silently reopening AB105.116R.

Exact protected recovery point: AB105.116R → independent authority → new generation → target fence → old-operation quarantine/reconciliation → stale-effect rejection → first safe new-effect admission.
## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P0 — bounded journal can evict unresolved prepared effects

🟢 New executable gap found without reopening AB105.116R.

In `src/nexo/effect-adapter.js`, the local `executionJournal` is truncated to the last 200 entries in both `recordIntent()` and `persist()`.

🟢 A `prepared` entry represents an unresolved effect and is deliberately not safe to retry blindly. However, the same bounded array can later evict that unresolved `prepared` entry.

🟢 Once evicted, `journalEntry(idempotencyKey)` can no longer find it. A later call with the same idempotency key can therefore pass the `prepared` reconciliation gate and enter `recordIntent()`/handler execution as if no prior unresolved attempt existed.

🟢 This is an implementation-level manifestation of the already-established retention rule: loss of an operation record is not proof of non-commit and must not reopen fresh execution. The finding is new only at the executable-carrier level; it does not reopen AB105.089R.

🔵 Scope: this is a bounded local/in-process journal limitation, not evidence of an external duplicate effect by itself. It becomes safety-relevant whenever an unresolved prepared operation survives beyond the 200-entry retention window and its idempotency key is retried.

🔴 No patch is made here. Research-first rule remains active: do not silently replace the journal policy or invent retention semantics.

Exact recovery point: POST-AB105.116R implementation audit → P0 bounded-journal eviction of unresolved prepared operations.

Next investigation: determine whether any other executable path can discard, overwrite, or reconstruct an unresolved operation record before authoritative reconciliation, including memory reconstruction/persistence boundaries. Do not rerun AB105.079R–AB105.116R.

DO-NOT-REPEAT: AB105.079R–AB105.116R remain closed; this is an implementation-carrier audit of an already-established contract gap.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P1 — reconstruction also truncates unresolved effectJournal

🟢 Follow-up audit traced the persistence boundary.

`src/assistants/memory.js` reconstructs Nexo memory through `createLearningMemory()`, which applies `source.nexo.effectJournal.slice(-200)`. Therefore the 200-entry bound is not only an adapter-local mutation: every reconstruction through this normalizer can discard older effect-journal entries.

🟢 `scripts/simulate.mjs` persists `simulation.nexoMemory` and `applyState()` restores it, so ordinary restart persistence preserves a still-retained PREPARED record. The existing restart test confirms this for a single retained entry.

🟢 The new gap is the combination:
PREPARED unresolved effect → repeated memory normalization / accumulation → bounded last-200 retention → unresolved record may disappear → later same idempotency key is no longer recognized as PREPARED.

🟢 This is stronger than a mere in-process cache observation because the truncation occurs at the memory reconstruction/persistence model itself.

🔵 The current tests verify preservation of a retained PREPARED record and atomic state-file replacement/concurrency, but do not verify that an unresolved PREPARED record remains non-evictable after more than 200 subsequent Nexo journal entries.

🔵 This does not prove an external duplicate effect occurred. It proves the executable persistence layer lacks the retention invariant required to safely treat unresolved effects as non-retryable until authoritative reconciliation.

🔴 No implementation patch or test modification made.

Exact recovery point: POST-AB105.116R implementation audit → P1 memory-normalization eviction of unresolved PREPARED records.

Next investigation: audit whether any code path can convert a missing/evicted PREPARED record into a fresh executable attempt without requiring authoritative reconciliation, including mission reconstruction and idempotency-key reuse.

DO-NOT-REPEAT: AB105.079R–AB105.116R remain closed; P0/P1 are executable implementation audits of the already-established retention/reconciliation contract.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P2 — fresh execution becomes possible after prepared-record loss

🟢 Trace completed from reconstruction to execution.

`executeNexoStep()` derives the stable key `missionId:stepId` and calls `adapter.execute()`. The adapter correctly blocks when it can still find a `prepared` journal entry. However, if that entry has been evicted, `journalEntry(idempotencyKey)` returns null and `executeFresh()` calls `recordIntent()` followed by the handler.

🟢 Therefore the safety property depends directly on retention of the unresolved journal entry. There is no independent authoritative reconciliation registry consulted when the local entry is absent.

🟢 The normal runtime path does not automatically make the missing entry safe: `recordNexoExecution()` records the adapter result separately, while `recordNexoOutcome()` records the mission outcome separately. Neither is an authoritative target-operation registry, and neither can prove that an evicted PREPARED effect did not commit.

🔵 Important boundary: the ordinary mission flow may stop a completed/blocked reconstructed step from being started again. This does not eliminate the lower-level adapter gap because `executeNexoStep()` accepts a mission object directly and the effect adapter itself has no durable external registry fallback.

🔵 Thus the precise finding is conditional: **if a logically unresolved effect loses its local PREPARED record and the same logical execution is subsequently admitted to the adapter, the adapter has no remaining mechanism that forces reconciliation before invoking the handler.**

🔴 No patch made. No duplicate external effect claimed.

Exact recovery point: POST-AB105.116R implementation audit → P2 → loss of PREPARED record removes the adapter's mandatory reconciliation gate.

Next investigation: identify every persistence/restart/reconstruction path that can produce an executable mission/step after such record loss, and determine whether any of them enforce a separate authoritative reconciliation gate.

DO-NOT-REPEAT: AB105.079R–AB105.116R remain closed; P0–P2 are executable manifestations of the already-established retention/reconciliation requirement.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P4 — replan intentionally creates a new idempotency domain without effect-level reconciliation

🟢 The replan path is now traced in executable code and tests.

`buildNexoMission()` always creates a new `missionId`. The runtime derives idempotency as `missionId:stepId`. Therefore a replan creates a new idempotency key even when the new mission repeats the same action/target.

🟢 Existing tests explicitly validate this behavior for a prior `failed` step: a replan gets a different missionId and is allowed to execute again. That is correct for a contractually resolved failure, but it does not establish safety for an earlier UNKNOWN/PREPARED effect whose local record was lost.

🟢 More importantly, the replan mechanism does not consult the effect journal or an authoritative target operation registry before creating the new execution identity. The lineage fields `parentMissionId` and `replanReason` preserve provenance, but they are not duplicate-suppression or commitment evidence.

🔵 Therefore the precise gap is: a new mission identity can intentionally bypass the old mission's idempotency domain. If the parent effect was truly unresolved rather than authoritatively rejected, the new mission may be admitted as a fresh effect unless a separate reconciliation gate exists upstream.

🔵 This is not a claim that current tests demonstrate a duplicate external effect. The tests use resolved failures/local simulation. The finding is that the executable contract has no general rule preventing replan from becoming an unsafe fresh attempt after UNKNOWN.

🔴 No patch made.

Exact recovery point: POST-AB105.116R implementation audit → P4 → replan/new mission identity can bypass prior effect idempotency unless reconciliation closes the parent effect first.

Next investigation: inspect all replan callers and failure/UNKNOWN mappings to determine whether an UNKNOWN handler exception can reach the same replan path and become a fresh mission.

DO-NOT-REPEAT: AB105.079R–AB105.116R remain closed; P0–P4 are implementation enforcement audits.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P5 — UNKNOWN exception is locally blocked, not auto-replanned

🟢 Traced the exact handler-exception path.

In `effect-adapter.js`, a handler exception returns `EFFECT_OUTCOME_UNKNOWN` with `status:"blocked"` and leaves the PREPARED journal entry unresolved. It does not persist a terminal result.

🟢 In `runtime.js`, adapter status `blocked` maps to mission outcome `blocked`, so the normal runtime path does NOT automatically convert `EFFECT_OUTCOME_UNKNOWN` into `failed → needs_replan`.

🟢 Therefore the feared direct path “handler UNKNOWN → automatic replan → new mission” is NOT present in the current runtime.

🔵 P4 remains valid as a conditional architectural gap: an externally supplied/manual replan can create a new missionId/idempotency domain, but the normal UNKNOWN exception path first blocks and preserves the unresolved local PREPARED record.

🔴 The remaining exposure is still P0/P1/P2: if that PREPARED record is later evicted/truncated, the local adapter loses the reconciliation gate; a separately created replan can then be a fresh execution unless an authoritative reconciliation boundary exists.

No patch made.

Exact recovery point: POST-AB105.116R implementation audit → P5 → UNKNOWN exception is conservatively blocked; no automatic replan.

Next investigation: determine whether any other caller can invoke `buildNexoMission()`/replan after a blocked UNKNOWN, or whether only explicit external orchestration can create that new mission.

DO-NOT-REPEAT: P4's direct automatic-UNKNOWN-to-replan hypothesis is closed as NOT PRESENT; retain P4 only as the manual/external replan architectural gap.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P6 — fresh planning run creates a new mission without reconciling prior PREPARED effect

🟢 Full caller audit found an important path that is broader than explicit `replanReason`.

`scripts/assistants.mjs` loads persisted `simulation.nexoMemory`, then on every assistant run unconditionally calls:
`buildNexoMission({ simulation, reports: [...], memory: nexoMemory })`
with no `parentMissionId` and no effect-level reconciliation gate.

🟢 Therefore a prior handler exception can leave:
- old mission M1;
- effectJournal entry M1:step-1 = `prepared`;
- effect outcome unresolved (`EFFECT_OUTCOME_UNKNOWN`).

A later assistant run can observe the same finding and construct fresh mission M2. Because runtime derives idempotency as `M2:step-1`, M2 is a different idempotency domain. The adapter lookup for M2 does not find M1's PREPARED entry and can call `recordIntent()` and the handler again.

This is NOT an explicit “replan after failure” path and does NOT require `needs_replan`. It is a fresh-planning/re-entry path.

🔴 No external duplicate effect is claimed: current handlers/tests are local Lúmina simulation. The proven gap is local control-plane behavior: a durable unresolved PREPARED from M1 does not automatically block/reconcile a semantically repeated effect when a fresh mission M2 is generated.

🔵 This materially strengthens P4/P0-P2: mission identity is currently part of the idempotency key, while effect-level reconciliation needs an identity that survives mission recreation for the same intended effect/target operation.

No patch made.

Exact recovery point: POST-AB105.116R implementation audit → P6 → fresh planning can bypass prior PREPARED through a new missionId.

Next exact investigation: determine whether `buildNexoMission()` has any existing semantic deduplication beyond missionId (action/target/fingerprint/history/doNotRepeat) that could block this M1→M2 transition. If absent, document the exact missing cross-mission effect identity/reconciliation gate.

DO-NOT-REPEAT:
- P5 automatic UNKNOWN→needs_replan path is closed as NOT PRESENT.
- Do not rerun historical AB105.079R–AB105.116R.


## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P7 — no cross-mission semantic deduplication gate

🟢 Code audit completed after P6.

`src/assistants/memory.js` retains missions/attempts/executions/effectJournal, but the relevant execution records are keyed by exact mission identity/idempotency key. `recordNexoExecution()` does not perform cross-mission semantic matching. `recordNexoOutcome()` records one outcome for the same missionId + stepId and only adds `doNotRepeat` when explicitly requested.

🟢 `src/nexo/orchestrator.js` uses a local `seen` set only while constructing the current mission, based on the action/target/action-name combination. `repeatBlocked()` consults `memory.nexo.doNotRepeat`, not prior missions, attempts, executions, or unresolved effectJournal entries.

🟢 `reconstructNexoMission()` reconstructs from mission attempts; it does not turn an older unresolved effectJournal entry into an execution-admission block.

Therefore a semantically repeated action/target can be planned in fresh mission M2 even when M1 has an unresolved PREPARED effect, unless an explicit doNotRepeat marker happens to exist.

🔵 Missing boundary identified precisely:
`intended effect identity (action + target + relevant parameters/fingerprint) → authoritative prior-operation lookup/reconciliation → only then admission of new mission execution`.

🔵 This does not prove an external duplicate effect. It proves the current mission/planning layer has no cross-mission semantic reconciliation gate that survives missionId changes.

🔴 No implementation patch made.

Exact recovery point: POST-AB105.116R implementation audit → P7 → absence of cross-mission semantic deduplication/reconciliation.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P8 — concrete Lúmina adapter has no independent mission-independent deduplication

🟢 Lower execution layer inspected directly: `src/nexo/simulation-adapter.js`, `src/actions.js`, and `src/nexo/effect-adapter.js`.

🟢 `createLuminaEffectAdapter()` exposes `execute_lumina_action` and delegates directly to `executeAction(simulation, agent, action)`. The handler receives the mission/idempotency context only through the adapter call; it does not maintain an independent operation registry keyed by semantic action/target/parameters.

🟢 `src/actions.js` is a consequence engine: `executeAction()` dispatches to the concrete mutation functions. The action functions mutate simulation state directly and do not inspect Nexo `idempotencyKey`, missionId, or a prior-operation registry.

🟢 `nexoEffectRevision` is incremented after successful local mutation, but it is only a local simulation-state revision. It is not an operation identity, not a durable deduplication registry, and not an externally enforced fence.

🟢 `effect-adapter.js` is therefore the only current executable duplicate/retry barrier at this layer: exact `idempotencyKey` lookup plus PREPARED reconciliation. Once the PREPARED record is absent, the lower Lúmina handler provides no independent semantic deduplication fallback.

🔵 This closes the P6→P8 path at the concrete handler boundary: a new missionId produces a new idempotency domain, and the concrete action engine does not independently recognize that it may represent the same unresolved intended effect.

🔵 Scope remains local prototype behavior. No external duplicate effect is claimed, and no claim of production-grade target semantics is made.

🔴 No implementation patch made.

Exact recovery point: POST-AB105.116R implementation audit → P8 → concrete Lúmina execution layer has no mission-independent semantic deduplication/operation registry.

Next exact investigation: inspect whether the persistence/state-load layer can retain a durable semantic operation identity outside `missionId:stepId` (for example action/target/parameters/fingerprint), or whether that identity is absent end-to-end. Do not modify the architecture yet.

DO-NOT-REPEAT:
- P0–P2 remain closed as retention/reconciliation findings.
- P5 automatic UNKNOWN→replan is closed as NOT PRESENT.
- P6/P7/P8 are the fresh-planning → semantic-dedup → concrete-handler chain.
- AB105.079R–AB105.116R remain closed.
- AB105.117R remains prohibited.


## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P11 — final executable identity-constructor census

🟢 Audited the remaining direct constructors in `src/nexo/effect-adapter.js` and `src/nexo/orchestrator.js`, against the already inspected memory/persistence layer.

`buildNexoMission()` creates a new mission identity as `lumina-${Date.now()}-${missionSequence}`. Step identity is local to that mission (`step-1`, `step-2`, ...). No mission-independent operation/effect identity is generated from action+target+parameters.

`createEffectAdapter()` receives/uses the supplied `idempotencyKey` as the execution identity. Its prepared journal entry stores that key plus missionId/stepId/action/target. It does not derive an independent semantic operation digest or OperationID.

The adapter's in-flight map and queue are keyed by the exact supplied idempotency key and the journal object. These are process-local concurrency controls, not durable semantic operation registries.

`recordNexoExecution()` and `recordNexoOutcome()` were previously inspected: their durable identities remain exact mission/step and idempotency-key identities. `buildNexoMission()` only deduplicates findings inside the newly constructed mission using action|target|action-name and `doNotRepeat`; it does not search prior effect history for semantic equivalence.

🟢 Therefore the final constructor census finds no missed executable constructor that creates a stable mission-independent operation/effect identity surviving a new mission.

🔵 Scope: this closes the current executable local-carrier search, not every possible future provider implementation. It also does not claim an external duplicate effect occurred. The finding is that the present carrier lacks an authoritative mission-independent operation identity/reconciliation registry.

🟢 P11 closes the implementation search for hidden local deduplication. The P0→P11 chain is now complete as an executable-carrier audit.

🔴 No implementation patch made.

Exact recovery point: POST-AB105.116R implementation audit → P11 FINAL → no hidden mission-independent operation identity constructor.

Next independent gap: stop searching for hidden deduplication in this carrier and audit the admission boundary that converts a planned step into an effect request: verify exactly where action/target/context become an idempotencyKey and whether that boundary can require the AB105.082R minimum identity tuple (effect identity, operation identity, attempt/retry generation, authority context, resource incarnation/fence, expected version, fingerprint, capability class) before any handler is callable.

DO-NOT-REPEAT:
- P0–P11 local retention/semantic-deduplication carrier search is closed.
- AB105.079R–AB105.116R remain closed.
- AB105.117R remains prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P12 — planned-step admission boundary lacks AB105.082R minimum identity tuple

🟢 Admission boundary traced directly in the current executable carrier.

`src/nexo/runtime.js` is the exact bridge from a planned mission step to the effect adapter. After `beginNexoStep()` changes the step to `executing`, runtime constructs exactly:

```text
idempotencyKey = `${started.missionId}:${stepId}`
```

It then calls `adapter.execute()` with:

```text
missionId, stepId, action, target, idempotencyKey, context, precondition, postcondition
```

🟢 No admission validator at this boundary requires an independent effect identity, operation identity, attempt/retry generation, authority context/epoch, resource incarnation/fence, expected version, payload fingerprint, or capability class before the adapter is invoked.

🟢 `beginNexoStep()` itself checks only mission/step existence, terminal status, and dependency completion. `planNexoExecution()` likewise exposes planned step fields but does not construct or validate the AB105.082R tuple.

🟢 `createEffectAdapter()` then accepts the supplied idempotency key as the execution identity. Its first durable execution gate is exact-key lookup / PREPARED reconciliation. There is no separate admission layer between `adapter.execute()` and the handler that rejects a request missing the remaining identity dimensions.

🔵 Therefore the current carrier has a concrete identity-collapse boundary:

```text
planned step
  → missionId + stepId
  → idempotencyKey = missionId:stepId
  → adapter.execute()
  → handler
```

The richer dimensions required by the AB105.082R minimum tuple are not enforced at this transition.

🔵 Important precision: `precondition` and `postcondition` are executable callbacks, not substitutes for authority/fence, target incarnation, operation identity, fingerprint, or capability-class binding. The local `getStateVersion()` check in the adapter also does not supply the missing authority/fence dimensions.

🔵 This is an implementation-boundary finding, not proof that an external effect was duplicated. It establishes that a caller can reach the effect adapter/handler without first presenting the complete minimum identity/admission tuple.

🔴 No patch made. Research-first rule remains active.

Exact recovery point: POST-AB105.116R implementation audit → P12 → planned-step admission boundary audited; missionId:stepId is the only constructed execution identity and no AB105.082R minimum-tuple gate exists before handler reachability.

Next independent investigation: audit whether any caller of `executeNexoStep()` or `executeLuminaNexoStep()` supplies hidden authority/fence/incarnation/fingerprint/capability metadata through `context`, `precondition`, or `postcondition`, and whether any such metadata is actually enforced rather than merely carried. Do not repeat the P0–P12 constructor/deduplication search.

DO-NOT-REPEAT:
- P0–P12 current executable retention, reconstruction, semantic-deduplication, identity-constructor, and admission-boundary audits are closed.
- AB105.079R–AB105.116R remain closed.
- AB105.117R remains prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P13 — no hidden authority/fence/incarnation/fingerprint/capability enforcement at execution callers

🟢 Caller audit completed for the current executable carrier.

`executeNexoStep()` accepts only mission, stepId, adapter, memory, context, precondition and postcondition. It derives `idempotencyKey = missionId:stepId` and forwards `step.context ?? context` to `adapter.execute()`.

`executeLuminaNexoStep()` creates the concrete Lúmina adapter and forwards the same execution boundary. Its `context` is used for the Lúmina action payload (`context.action`) and its generated postconditions verify local simulation state. Neither function constructs or validates an authority epoch, STOP binding, fence/generation, resource incarnation, operation identity, request fingerprint, or capability class.

🟢 Direct executable callers found in the current tests invoke these functions with ordinary `precondition` callbacks based on local `stateVersion` and `postcondition` callbacks based on local result/simulation state. No caller supplies a hidden AB105.082R identity tuple.

🟢 The concrete Lúmina handler consumes `context.action`, target and local simulation state. It does not inspect authority/fence/incarnation/fingerprint/capability metadata.

🔵 `precondition` is therefore only a local executable predicate. It can check stateVersion, but its presence does not bind the request to an authority generation, target incarnation, operation identity or fingerprint. `postcondition` is verification after the handler, not an admission credential.

🔵 Result: the P12 identity-collapse boundary is not bypassed by a hidden caller-side binding in the current carrier. The richer identity dimensions are absent both from the runtime admission constructor and from the inspected concrete callers/handler.

🔴 No patch made. No external duplicate effect claimed.

Exact recovery point: POST-AB105.116R implementation audit → P13 → caller/context audit confirms no hidden AB105.082R authority/fence/incarnation/fingerprint/capability enforcement before handler reachability.

Next independent investigation: audit the `persistPreparedIntent` owner boundary and determine whether the prepared checkpoint itself binds any operation identity, authority generation, target incarnation, fingerprint or capability, or merely persists the same `missionId:stepId` record. This is distinct from the already-closed P0–P13 admission/deduplication search.

DO-NOT-REPEAT:
- P0–P13 current executable retention, reconstruction, semantic-deduplication, identity-constructor, admission-boundary, and caller-binding audits are closed.
- AB105.079R–AB105.116R remain closed.
- AB105.117R remains prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P14 — persistPreparedIntent is a hook, not an authoritative prepared-operation record

🟢 The persistence seam was traced end-to-end.

`executeNexoStep()` does not expose `persistPreparedIntent`; only `executeLuminaNexoStep()` accepts the optional callback and passes it into `createLuminaEffectAdapter()`. The generic adapter invokes the hook after creating the in-memory `prepared` journal entry and before the handler.

🟢 The callback payload is deliberately narrow:

```text
{
  idempotencyKey,
  journalEntry,
  request: { missionId, stepId, action, target, idempotencyKey, context }
}
```

`precondition`, `postcondition`, reconciliation callback, authority context/epoch, resource incarnation/fence, expected version, fingerprint and capability class are not included in the persisted `request` payload. The `journalEntry` itself contains only idempotencyKey, missionId, stepId, action, target, status=prepared and timestamp.

🟢 The current repository persistence owner is `scripts/simulate.mjs::persistState()`. It persists `simulation.nexoMemory`, including the effect journal, as part of the world-state payload under a stateRevision/file-lock/temp-rename mechanism. This protects the state-file write, but it does not atomically couple the prepared record to the later handler mutation.

🟢 `nexoEffectRevision` is not serialized by `persistState()`. Therefore the prepared record does not acquire a durable target incarnation/fence through the existing persistence path.

🟢 The handler mutates the in-memory simulation after the prepared hook returns; only later can `persistState()` serialize the resulting world plus Nexo memory. Consequently there is no single current transaction containing prepared intent + operation identity + target mutation + receipt/commit evidence.

🔵 Important distinction: `persistPreparedIntent` can improve crash recovery when its owner actually persists the prepared record, but a persisted `prepared` record is still ambiguity evidence, not proof that the effect did or did not occur. The current seam does not create an authoritative operation registry or target-side receipt.

🔵 No current production execution path was found that supplies an authoritative `persistPreparedIntent` owner to `executeLuminaNexoStep()`. Existing tests exercise the seam, but test wiring is not production ownership.

🔵 Therefore P14 closes the question of whether the hook secretly provides the missing identity/fence boundary: it does not. It persists the same mission-scoped execution identity and remains outside the handler/world-state atomic boundary.

🔴 No patch made. No external duplicate effect claimed. No exactly-once claim.

Exact recovery point: POST-AB105.116R implementation audit → P14 → prepared persistence seam audited; hook payload remains missionId:stepId scoped and no authoritative atomic prepared+mutation+receipt boundary exists.

Next independent investigation: audit the concrete `persistState()`/`world-state.json` serialization contract for whether any persisted field can serve as a durable target/resource incarnation or operation receipt, without reopening the already-closed `persistPreparedIntent` hook search.

DO-NOT-REPEAT:
- P0–P14 current executable retention, reconstruction, semantic-deduplication, identity-constructor, admission-boundary, caller-binding and prepared-persistence audits are closed.
- AB105.079R–AB105.116R remain closed.
- AB105.117R remains prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P15 — world-state persistence has revision integrity, not operation receipt/incarnation

🟢 Audited the concrete persistState() → world-state.json → loadState() → applyState() path and the restart persistence test.

persistState() serializes version, stateRevision, savedAt, day/hour, world, agents, events and nexoMemory. simulation.nexoMemory therefore carries the retained effectJournal, missions, attempts, executions and doNotRepeat records when the state is checkpointed.

🟢 The file boundary has real protections: sibling lock, optional expectedRevision check, temporary-file write, atomic rename, and restart reconstruction. Tests cover successful prepared-journal retention, restart preservation, stale revision conflict, concurrent writer conflict, write failure, rename failure, and stale lock recovery.

🟢 These protections establish a durable state-file revision/write boundary for cooperating state writers. stateRevision answers whether the loaded state is the expected state version for the file writer.

🔵 They do not establish a durable effect-operation identity or target/resource incarnation. No persisted field in the current world-state envelope is an executable OperationID, semantic effect identity, target incarnation, authority epoch, fence token, capability class, request fingerprint, or target-side receipt.

🔵 nexoEffectRevision is absent from the serialized payload. simulation-adapter.js maintains it only in memory and persistState() does not include it. After restart, the adapter's local revision is recreated rather than recovered as a durable monotonic target/resource incarnation.

🔵 The persisted effectJournal remains mission-scoped (missionId:stepId / idempotencyKey) and bounded by the existing 200-entry normalization/adapter retention. Persistence therefore preserves the carrier that exists; it does not add an independent semantic operation registry.

🔵 The restart test proves that a prepared journal entry survives a normal checkpoint/restart and remains prepared. It does not prove that the world mutation and prepared record share one linearization point, nor that the target can answer whether the physical effect committed.

🔴 Exact boundary: handler mutation → later persistState() checkpoint is separate from durable operation identity → target acceptance/commit receipt.

A successful temp-file rename means the state file was replaced consistently; it does not prove an already-running effect was atomically coupled to that replacement.

No implementation patch. No external duplicate effect claimed. No exactly-once claim.

Exact recovery point: POST-AB105.116R implementation audit → P15 → world-state persistence closes as revision/file-integrity boundary, not durable operation receipt/incarnation boundary.

Next independent investigation: inspect whether any concrete target/action consequence in src/actions.js or the Lúmina world model itself carries a durable, action-specific receipt/state marker that could independently reconcile an old effect after mission identity is lost. This is target-state evidence, not another persistence-hook audit.

DO-NOT-REPEAT:
- P0–P15 current executable retention, reconstruction, semantic-deduplication, identity-constructor, admission-boundary, caller-binding, prepared-persistence and world-state persistence audits are closed.
- AB105.079R–AB105.116R remain closed.
- AB105.117R remains prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P16 — Lúmina target state has consequences/history, but no independent operation receipt

🟢 Audited the concrete action consequence layer in `src/actions.js` and the action-specific modules it dispatches to: `src/development.js`, `src/production.js`, `src/economy.js` and `src/institutions.js`. The world does retain durable consequences of successful actions, but none of the inspected consequence records binds the mutation to an independent Nexo operation identity.

🟢 `src/actions.js` is only a dispatcher/consequence engine. `executeAction()` routes the action name to concrete mutations. The concrete functions receive `simulation`, `agent` and action parameters; they do not inspect `missionId`, `stepId`, `idempotencyKey`, OperationID, request fingerprint, authority epoch, fence or target incarnation.

🟢 There are several real durable state consequences:
- resource actions decrement world resources and add inventory (`drink`, `eat_plant`, `catch_fish`, `gather_wood`, `gather_stone`);
- `build_shelter` creates a persistent structure with a generated `shelter-N` id and assigns `agent.home`;
- `farm` creates a persistent `farm-N` structure and assigns `agent.farm`;
- `trade` mutates both inventories and money and appends a trade record to `world.economy.trades`;
- commons contribution/withdrawal mutates `world.commons` and appends contribution/withdrawal history;
- tools, crops and other production effects persist through inventory/structure/resource fields.

🔵 These are **state consequences, not operation receipts**. For example, a shelter id identifies the resulting structure, but it does not identify which logical operation created it, nor bind that creation to a request fingerprint, attempt generation, authority context, target incarnation or provider receipt. Likewise, a farm id identifies the resulting farm but is not an operation identity.

🔵 The action histories are also insufficient as independent reconciliation records. `world.economy.trades` records day, sellerId, buyerId, type, amount, unitPrice and total, but no operation/idempotency identity or request fingerprint; it is bounded to the last 5000 trades. `world.commons.contributions` and `withdrawals` similarly record day, agentId, type and amount, but no operation identity and are bounded to 5000 entries.

🔵 Agent-local markers do not close the gap. `lastActionName`, `lastActionResult` and `lastAttemptedAction` describe recent execution state, but they are not independent operation receipts and can be overwritten by later actions. Generic `experiences` retain descriptions/consequences but use experience ids supplied by the caller and do not establish target-side operation identity.

🔵 Final resource/inventory/structure values cannot generally distinguish a prior committed operation from an equivalent later operation. The same semantic action can legitimately produce the same final state shape without leaving a stable operation identity. Therefore observing the expected consequence is not equivalent to proving which operation committed it.

🔵 Some concrete consequences are more informative than a final scalar: trade and commons histories preserve a bounded event trail, and structure creation preserves a structure identifier. However, without binding those records to an independent operation identity plus request/target context, they cannot serve as authoritative reconciliation for a lost `missionId:stepId`.

🔵 No hidden target-side receipt/operation registry was found in the inspected action-consequence path. The result is consistent with P8/P9/P11/P15: the current Lúmina carrier has durable world consequences and bounded histories, but no independent mission-independent operation receipt capable of answering `did this exact logical effect commit?` after the Nexo execution identity is lost.

🔴 Scope boundary: this closes the inspected current Lúmina action/world-model carrier, not every future provider or a universal claim about all possible state semantics. No duplicate external effect is claimed, and no exactly-once guarantee is inferred.

🔴 No implementation patch made. Research-first rule remains active.

Exact recovery point: POST-AB105.116R implementation audit → P16 → concrete Lúmina target/action consequence audit closed; durable consequences exist, but no independent operation receipt/semantic identity/target-incarnation binding was recovered.

Next independent investigation: audit the **target acceptance boundary itself** in the current Lúmina adapter path: determine whether any single mutation point can atomically couple operation identity + precondition/expected state + target mutation + durable receipt, or whether the current handler necessarily remains `check local state → mutate → return result` with no atomic target-side commit record. Do not reopen P14/P15 persistence searches or P0–P16 identity-carrier searches.

DO-NOT-REPEAT:
- P0–P16 current executable retention, reconstruction, semantic-deduplication, identity-constructor, admission-boundary, caller-binding, prepared-persistence, world-state persistence and concrete action-consequence audits are closed.
- AB105.079R–AB105.116R remain closed.
- AB105.117R remains prohibited.
## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P17 — target acceptance is check → mutate → post-verify, not atomic operation receipt

🟢 Audited the concrete acceptance path `createEffectAdapter()` → `execute_lumina_action` → `executeAction()` and the action-specific mutation path.

🟢 The current sequence is structurally:
`prepared journal` → optional `persistPreparedIntent` → precondition → `getStateVersion()` snapshot → handler → concrete mutation → `bump(simulation)` → postcondition → persist execution result.

🟢 In `simulation-adapter.js`, `execute_lumina_action` captures the local `beforeVersion`, calls `executeAction(simulation, agent, action)`, and only after successful return calls `bump(simulation)`. The handler then returns a completed result containing the local state version observed before the mutation.

🔵 This does **not** create a target-side commit record at the same linearization point as the mutation. The mutation functions in `src/actions.js` directly change agent/world state and return ordinary result objects. There is no operation receipt written by the target at mutation time containing the Nexo execution identity.

🔵 The local `nexoEffectRevision` is therefore a coarse state-change counter, not an operation receipt. It is incremented after `executeAction()` returns and is not bound to the exact action identity, request fingerprint, target incarnation, authority generation or fence.

🔵 Postcondition verification occurs after the mutation. A successful postcondition proves that the expected observable state/result was present when checked; it does not establish that the mutation and the Nexo operation record were committed atomically.

🔵 The ambiguity path is explicit: if the handler throws after a concrete mutation has already occurred, `effect-adapter.js` returns `EFFECT_OUTCOME_UNKNOWN`, does not persist a terminal result, and preserves the operation as unresolved. Because there is no target-side operation receipt, recovery still needs an independent reconciliation source.

🔵 The same applies to semantic duplicate suppression: `executeAction()` has no access to the Nexo `idempotencyKey`, so the target cannot independently reject a second invocation of the same logical effect based on that identity.

🟢 Some mutations are compound (for example `trade` changes two inventories, two money balances, relationship state and a trade-history record). Those changes happen inside the synchronous function, but there is no transaction/receipt object coupling all of them to the Nexo operation identity. The resulting state/history is consequence evidence, not an authoritative operation commit record.

🔵 Therefore the current target boundary is accurately modeled as:
`check local state → mutate world/agent state → increment local revision → return result → post-verify → persist Nexo execution record`.

🔴 This closes the target-acceptance/atomic-receipt question for the current Lúmina carrier. It is an implementation finding, not a claim that every future provider must behave this way. No duplicate external effect is claimed and no exactly-once guarantee is inferred.

🔴 No implementation patch made.

Exact recovery point: POST-AB105.116R implementation audit → P17 → current Lúmina target boundary audited; no atomic operation-identity + mutation + durable-receipt commit point exists in the executable carrier.

Next independent investigation: audit the **reconciliation capability** itself — enumerate every current `reconcile` caller/test and determine whether any concrete reconciler can distinguish `committed`, `rejected/not-committed`, and `unknown` using target evidence, or whether reconciliation currently has only generic local-state predicates. Do not reopen P14/P15/P17 or the closed identity-carrier searches.

DO-NOT-REPEAT:
- P0–P17 current executable retention, reconstruction, semantic-deduplication, identity-constructor, admission-boundary, caller-binding, prepared-persistence, world-state persistence, action-consequence and target-acceptance audits are closed.
- AB105.079R–AB105.116R remain closed.
- AB105.117R remains prohibited.
## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P18 — reconciliation is a generic hook; no production authoritative reconciler found

🟢 Audited every executable `reconcile` occurrence in the current repository carrier. The only concrete caller supplied to `createEffectAdapter().execute()` is the Nexo effect-adapter test suite; no `reconcile` callback was found in `src/` or `scripts/`.

🟢 The adapter itself is deliberately conservative: when a `prepared` entry exists and no reconciler is supplied, it returns `EFFECT_RECONCILIATION_REQUIRED` and does not invoke the handler. A reconciler may return a terminal status, but `completed` is accepted only when `verified:true`. Invalid/unverified results remain blocked and the prepared entry is retained.

🟢 The tests exercise three important states: (1) no reconciler → blocked/handler not called; (2) a synthetic `completed + verified:true` provider-query/effect-reconciled result → accepted; (3) blocked or unverified reconciliation → ambiguity remains prepared and a later stronger reconciliation can resolve it.

🔵 The acceptance contract is therefore structurally sound as a local gate, but the current production carrier has no implementation of the evidence source behind that gate. The `reconcile` callback is injected capability, not an authoritative target registry.

🔵 In the test, the `verified:true` evidence is synthetic. The adapter checks the shape/trust assertion (`verified===true`), but does not independently authenticate that the evidence came from a target-side receipt, OperationID lookup, provider query, immutable receipt log, or equivalent authoritative source.

🔵 The reconciler receives only the prepared journal context currently exposed by the adapter (`journalEntry`, missionId, stepId, action, target, context). It is not automatically given the missing AB105.082R dimensions such as independent operation identity, attempt/retry generation, authority epoch, resource incarnation/fence, expected version, request fingerprint or capability class.

🔵 Therefore the current carrier can enforce **“do not retry without a reconciler”**, but it cannot by itself enforce **“retry only after authoritative proof of NOT_APPLIED”**. A caller could technically inject a reconciler that returns `completed/verified:true` without an independently authoritative target-side proof; the adapter would accept its claim.

🔵 No production reconciler was found for the current Lúmina path. Thus there is currently no executable implementation proving `COMMITTED`, `NOT_COMMITTED`, or `UNKNOWN` from authoritative target evidence after an ambiguous effect. The research/design documents define that contract, but those documents are not executable enforcement.

🔴 Scope boundary: this is a current executable-carrier finding. It does not invalidate the conservative adapter gate itself, and it does not claim that an external effect was duplicated. No patch made.

Exact recovery point: POST-AB105.116R implementation audit → P18 → reconciliation caller/evidence audit closed; current production carrier has no authoritative reconciler, only a generic injected reconciliation hook plus tests.

Next independent investigation: audit the **Lúmina-specific reconciliation surface** that would have to exist for `execute_lumina_action`: determine whether current world state/history can be queried through a single deterministic predicate that identifies the exact intended effect, or whether the missing operation identity makes such reconciliation fundamentally non-unique. Do not reopen P16/P17 or generic adapter reconciliation mechanics.

DO-NOT-REPEAT:
- P0–P18 current executable retention, reconstruction, semantic-deduplication, identity-constructor, admission-boundary, caller-binding, prepared-persistence, world-state persistence, action-consequence, target-acceptance and reconciliation-hook audits are closed.
- AB105.079R–AB105.116R remain closed.
- AB105.117R remains prohibited.
## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P19 — Lúmina observable state cannot uniquely reconcile an exact prior effect

🟢 Audited the concrete Lúmina reconciliation surface: `runtime.js`, `simulation-adapter.js`, `actions.js`, and `economy.js`. There is no Lúmina-specific `reconcile` implementation for `execute_lumina_action`.

🟢 Current Lúmina postconditions are ordinary local-state predicates. They validate that an expected observable consequence exists after execution (for example energy/thirst/activity, inventory/resource presence, shelter success, or generic `success:true`). They are useful post-execution checks, but they do not identify one exact historical operation.

🔴 The observable predicates are non-unique across repeated executions. Examples: `rest` only checks an energy-recovered result and current activity; `drink` checks thirst/activity; gathering checks inventory/resource presence; `build_shelter` accepts the effect/result success; trade and several production/institution actions accept generic success. None binds the observation to an independent operation identity, request fingerprint, attempt generation, or target-side receipt.

🔴 Lúmina world history does not repair this identity gap. Trade history records day, seller, buyer, type, amount, unit price and total; cooperation/history and agent markers similarly describe consequences but do not contain the Nexo idempotency key or an independent operation identity. A later equivalent action can therefore produce an indistinguishable or overlapping observable state/history.

🔵 Some actions are even intrinsically non-deterministic or state-dependent (`catch_fish` uses a random success path; resource/inventory quantities change with intervening activity). A current-state predicate cannot prove whether the ambiguous earlier invocation committed, whether a later invocation caused the observed state, or whether both did.

🔵 The adapter's `stateVersion`/`nexoEffectRevision` also cannot solve this: it is a coarse local counter, is not persisted as an operation receipt, and does not map a revision to a specific Nexo operation. The runtime's postcondition is evaluated after the handler and is not a historical target-side receipt.

🔴 Therefore, for the current Lúmina carrier, reconciliation of an ambiguous `PREPARED` effect cannot be implemented soundly from existing observable state alone. Without an independent operation identity/receipt (or an equivalently authoritative deterministic effect record), the correct outcome remains `UNKNOWN`, not `NOT_APPLIED` merely because the current state lacks an obvious marker.

🟢 This also sharpens the prior boundary: the generic adapter correctly demands reconciliation before retry, but the current Lúmina world lacks the evidence required to produce a trustworthy `NOT_APPLIED` or `COMMITTED` answer for the exact prior operation.

Scope: current Lúmina executable carrier only. No external duplicate effect is claimed and no implementation patch was made.

Exact recovery point: POST-AB105.116R implementation audit → P19 → Lúmina reconciliation surface audited; existing postconditions/history are consequence evidence, not exact operation receipts.

Next independent investigation: audit whether the **action request itself** has enough stable parameters to construct a deterministic operation fingerprint (action + target + all effect-relevant parameters), or whether some actions depend on hidden mutable/random inputs that make even a future fingerprint insufficient without target-side operation registration.

DO-NOT-REPEAT: P0–P19 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.
## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P20 — action fingerprints are possible only as request identity, not proof of effect

🟢 Audited every current Lúmina action and all effect-relevant parameters in `actions.js`, `development.js`, `production.js`, `institutions.js`, and `economy.js`.

🟢 Deterministic request inputs exist for many actions: target agent plus action name and explicit parameters such as duration/amount, and for trade partnerId/offerType/amount/unitPrice; institution actions add resourceType/amount. These inputs are sufficient to construct a canonical request fingerprint if normalized explicitly.

🟡 However, the request fingerprint is not sufficient to identify the actual committed effect. Several actions derive their outcome from mutable state at execution time: available resources/inventory, skills, tool efficiency/durability, technology, farm state, institution membership/commons balances, prices and current agent state. Thus the same fingerprint can legitimately produce different results at different times.

🔴 `catch_fish` has an additional non-deterministic input: `getRandom(simulation)`. The same action/target/amount/fingerprint can succeed or fail on different invocations. The random draw is not part of the current request identity and no target-side receipt records it.

🔴 Several actions create fresh structure identifiers from current collection length (`shelter-N`, `farm-N`). Those IDs are consequence identifiers generated during execution, not pre-existing operation identity. They cannot be used to determine whether a prior ambiguous invocation created the structure unless the receipt is already bound to the original request.

🔴 Tool use/crafting and resource gathering also mutate secondary state (durability, inventory, energy) whose final values can be changed by later actions. A post-hoc state comparison therefore cannot uniquely attribute the observed state to one ambiguous invocation.

🟢 The strongest safe conclusion is: a canonical request fingerprint can identify **what Nexo intended to request**, but current Lúmina has no durable mechanism binding that fingerprint to **which execution committed**. Fingerprint ≠ OperationID ≠ commit receipt.

🔵 Consequently, adding only a deterministic fingerprint would improve correlation and reconciliation queries, but would not by itself make `UNKNOWN` resolvable. To establish `COMMITTED`/`NOT_COMMITTED`, the target or an authoritative operation registry must record the fingerprint together with an independent operation identity and commit outcome at the mutation boundary.

🔴 No patch made and no duplicate external effect claimed.

Exact recovery point: POST-AB105.116R implementation audit → P20 → action/request identity census closed; deterministic request fingerprints are feasible for current actions, but insufficient as standalone commitment evidence.

Next independent investigation: inspect the exact construction path of `context.action` in the Nexo planner/orchestrator and determine whether all effect-relevant parameters survive into the planned step, or whether planning currently drops parameters needed to make a canonical fingerprint complete.

DO-NOT-REPEAT: P0–P20 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.
## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P21 — planner preserves action payload but dedup key drops effect parameters

🟢 Audited `src/nexo/orchestrator.js` plus the existing orchestrator/runtime tests. For `LUMINA_ACTION`, `buildNexoMission()` copies the complete finding action with `{...finding.action}` into `step.context.action`; `planNexoExecution()` then forwards `step.context` unchanged. Thus explicit action parameters are not generally stripped at the planner→step→execution handoff.

🔴 However, the planner's intra-mission deduplication key is only `action + target + finding.action.name`: `const key=action+"|"+(target??"global")+"|"+(finding.action?.name??"")`. It does not include amount, duration, partnerId, offerType, unitPrice, resourceType, or other effect-relevant action parameters.

🔴 Therefore two findings for the same target and same Lúmina action name but different parameters can collapse into one step before execution. Example: `{name:"drink",amount:2}` and `{name:"drink",amount:5}` for the same agent share the same planner dedup key. Likewise two trades differing in amount/price/partner can be collapsed if target and action name match.

🟢 This is distinct from the earlier cross-mission identity problem: the payload survives once the step exists, but the planner can discard a distinct requested effect before a step is ever created. So the current carrier cannot assume that the planned-step set is a complete representation of all effect intents present in the input reports.

🔵 The existing test confirms parameter preservation for one `drink` action (`context.action` remains `{name:"drink",amount:2}`), but does not test two same-target/same-name actions with different parameters. No test currently proves parameter-sensitive deduplication.

🔵 This does not itself prove an external duplicate effect or a safety violation; it is an intent-loss / request-canonicalization gap. If distinct reports are supposed to represent distinct effect requests, the current dedup rule is too coarse. If the product intentionally wants one action per target/name regardless of parameters, that policy is implicit and undocumented in the planner.

🔴 No patch made.

Exact recovery point: POST-AB105.116R implementation audit → P21 → planner payload-preservation and parameter-sensitive dedup audit closed.

Next independent investigation: audit whether `finding.action` can contain all effect-relevant inputs for every Lúmina action, especially hidden execution inputs such as random draws and state-derived values; then define the minimum canonical request fields needed before an operation fingerprint can be considered complete.

DO-NOT-REPEAT: P0–P21 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P22 — action request inputs are incomplete relative to execution-time effect inputs

🟢 Audited the concrete Lúmina action dispatcher and action modules: `src/actions.js`, `src/economy.js`, `src/development.js`, `src/production.js`, `src/institutions.js`. The planner can carry explicit request parameters for actions that expose them, but several actions derive additional effect inputs from mutable target/world state at execution time.

🔴 Classification: explicit request parameters are not a complete effect description. Examples: `drink` depends on current water availability; `eat_plant` depends on current plant amount, foodProperties and quality; `eat_fish` depends on current inventory; `gather_wood`/`gather_stone` depend on current skill, tool selection/efficiency/durability and resource amount; `build_shelter` depends on current materials and construction technology and creates a structure ID from current collection length; `craft_tool` depends on current materials, toolmaking skill and technology; `farm` depends on current wood/fertile land; `harvest` depends on current farm readiness; institution actions depend on membership and current commons balances; `trade` depends on current partner existence, inventory, money and supplied price.

🔴 `catch_fish` has an additional non-request input: the execution-time random draw from `getRandom(simulation)`. Its success probability depends on current skill and the random draw is not part of the request payload or target receipt.

🟢 Some actions do have a clean explicit request portion: `rest(duration)`, amount-based consumption/gathering, institution `resourceType+amount`, and trade `partnerId+offerType+amount+unitPrice`. These can form part of a canonical request fingerprint, but they remain only request identity, not commitment evidence.

🔵 Important distinction: an operation fingerprint should not hash only the eventual mutable state/result. That would conflate request identity with observed consequence. The minimum useful model is at least: canonical explicit request + target identity + relevant authority/capability context + target/resource incarnation/fence + execution attempt/generation. Execution-time state and random decisions belong to the commitment/evidence record, not necessarily to the pre-execution request fingerprint.

🔴 Current carrier has no target-side receipt that records these derived inputs/decisions alongside an independent operation identity. Therefore P20's conclusion is strengthened: even a complete canonical request fingerprint would improve correlation but would not make an ambiguous PREPARED effect retrospectively provable as COMMITTED or NOT_COMMITTED.

🔵 No patch. No external duplicate effect claimed. No exactly-once claim.

Exact recovery point: POST-AB105.116R implementation audit → P22 → explicit-vs-derived action-input census closed.

Next independent investigation: identify the exact boundary where the planner creates each `finding.action` and determine whether request parameters themselves are complete, stable and canonical before execution; do not treat mutable derived state/randomness as planner inputs unless the contract explicitly requires pre-binding them.

DO-NOT-REPEAT: P0–P22 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P23 — no production producer of LUMINA_ACTION found; planner consumes externally supplied action payload

🟢 Searched the current executable repository for `LUMINA_ACTION` producers and traced the known path into `buildNexoMission()`. The production source tree contains the consumer in `src/nexo/orchestrator.js` and the execution consumer in `src/nexo/runtime.js`, but no production assistant/probe/script currently constructs a `LUMINA_ACTION` finding. Concrete `LUMINA_ACTION` objects found in executable tests are fixtures, e.g. `{name:"drink",amount:2}`.

🟢 Therefore the current production boundary is: external/other report producer → `buildNexoMission(reports)` → `finding.action` → shallow-copied `step.context.action` → runtime. The repository does not currently demonstrate an in-tree canonical action-intent constructor that validates or normalizes all effect-relevant request fields before planning.

🔴 This means P22 cannot be weakened into “the planner has complete action inputs.” The planner preserves whatever action object arrives, but the current carrier has no production schema/validator at the report-to-planner boundary proving that required fields are present, canonicalized, type-normalized, or stable.

🔵 Existing tests prove preservation of a supplied `drink(amount=2)` payload and replan preservation, but they are fixtures rather than evidence of a production producer contract. No test was found that rejects incomplete trade/institution/action payloads or verifies canonical equivalence of semantically identical payloads with different property ordering/types.

🔴 Important boundary: absence of a production producer in this repository is not proof that no upstream/external producer exists. It is only proof that this repo's executable carrier does not currently define one. Therefore the safe conclusion is “request schema/canonicalization contract is missing at this boundary,” not “requests are always malformed.”

No patch. No external duplicate effect claimed. No exactly-once claim.

Exact recovery point: POST-AB105.116R implementation audit → P23 → report-to-planner action-intent producer/schema census closed.

Next independent investigation: inspect the report-generation boundary actually feeding `scripts/assistants.mjs` (assistant squad/report builders) and determine whether its findings are generated in this repository or arrive as already-formed report objects. If no producer exists, document the missing contract as an explicit trust boundary rather than inventing one.

DO-NOT-REPEAT: P0–P23 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P24 — current AssistantSquad does not produce LUMINA_ACTION

🟢 Audited `src/assistants/squad.js` and the `scripts/assistants.mjs` integration. The six specialist producers currently are VisualAgent, ExplorerAgent, BehaviorAgent, RoutineAgent, EcosystemAgent and SocietyAgent; AuditAgent only aggregates specialist findings. Their current finding codes are visual/scene/exploration/behavior/routine/resource/social diagnostics. None constructs a `LUMINA_ACTION` finding or an `action` payload.

🟢 `scripts/assistants.mjs` passes `[...squadReport.reports, debuggerReport, testerReport, analystReport]` into `buildNexoMission()`. Therefore the current in-repo AssistantSquad path does not supply the action intent consumed by the Lúmina execution path. The known `LUMINA_ACTION` objects remain test fixtures in the current carrier.

🔵 This resolves the immediate P24 question without inventing a producer: there is no current executable report-generation contract for Lúmina action intents in the audited squad. Consequently, action-intent completeness/canonicalization is an unimplemented boundary in the current carrier, not a demonstrated bug in an existing producer.

🔴 Important consequence: the earlier P21 coarse deduplication finding remains a valid property of `buildNexoMission()`, but its practical production impact cannot be established from the current AssistantSquad alone because no current specialist emits `LUMINA_ACTION`. It remains a conditional planner behavior when such findings are supplied.

🔵 The debugger/tester/analyst reports were not yet treated as producers of `LUMINA_ACTION`; they are the next boundary to inspect because they are explicitly merged into the same report array. Do not assume they create action intents without code evidence.

No patch. No external duplicate effect claimed. No exactly-once claim.

Exact recovery point: POST-AB105.116R implementation audit → P24 → current AssistantSquad producer census closed.

Next independent investigation: inspect `runDebugger`, `runTester`, `analyzeLumina` and their report builders for any action-intent construction before `buildNexoMission()`.

DO-NOT-REPEAT: P0–P24 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P25 — no action-intent producer in debugger/tester/analyst; structural report also excluded from Nexo mission input

🟢 Audited `src/assistants/debugger.js`, `src/assistants/tester.js`, `src/assistants/analyst.js`, and `scripts/assistants.mjs`. `runDebugger()` produces static/runtime diagnostic findings only; `runTester()` produces test results only; `analyzeLumina()` produces observations/conclusions only. None constructs a `LUMINA_ACTION` finding or action payload.

🟢 `scripts/assistants.mjs` merges `squadReport.reports`, `debuggerReport`, `testerReport`, and `analystReport` into the `buildNexoMission()` input. Code evidence therefore closes the suspected hidden producer path: these audited report generators do not currently create Lúmina action intents.

🟢 Additional boundary found: `structuralReport` is built in `scripts/assistants.mjs` with state-consistency findings, but the call to `buildNexoMission()` passes only `[...squadReport.reports, debuggerReport, testerReport, analystReport]`. `structuralReport` is included in `buildAssistantReport()` but is NOT included in Nexo mission planning input. This is a report-routing gap, separate from the LUMINA_ACTION producer question.

🔵 The current repository therefore has no demonstrated production path from these assistant reports to a `LUMINA_ACTION` request. The action-intent boundary remains external/unimplemented in this carrier. P21's parameter-dropping behavior remains conditional on receiving action findings.

🔵 This does not prove no external caller can supply action findings; it proves the audited in-repo assistant/report producers do not do so. No duplicate external effect claimed. No exactly-once claim.

No patch.

Exact recovery point: POST-AB105.116R implementation audit → P25 → debugger/tester/analyst producer census closed; structuralReport routing gap recorded.

Next independent investigation: inspect the contract/consumers around `buildAssistantReport()` and whether excluding `structuralReport` from `buildNexoMission()` can cause a safety-relevant finding to be omitted from planning, without reopening the closed action-producer search.

DO-NOT-REPEAT: P0–P25 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.
## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P26 — structural findings are dropped twice before/at Nexo planning

🟢 Audited the exact routing path and src/nexo/orchestrator.js. scripts/assistants.mjs constructs structuralReport, then calls buildAssistantReport({ debuggerReport, testerReport, analystReport, structuralReport }). However src/assistants/index.js::buildAssistantReport() destructures only debuggerReport, testerReport, analystReport; structuralReport is therefore silently ignored and never appears in report.assistants or the aggregate status/counts.

🟢 Independently, the subsequent buildNexoMission() call passes only squadReport.reports, debuggerReport, testerReport, and analystReport; structuralReport is omitted a second time. Thus structural consistency findings have two separate routing losses: they are absent from the aggregate assistant report and absent from Nexo mission input.

🟢 The structural codes currently produced are DEAD_WITH_HEALTH and DEAD_STATE_MISMATCH. They are not present in actionFor() explicit map in src/nexo/orchestrator.js, so if they were routed into planning they would currently fall back to inspect_and_collect_evidence, not a direct repair. This means the observed gap is evidence-loss/routing, not proof of unsafe automatic mutation.

🔵 Safety significance is limited but real: a structural finding can be generated with severity error and still fail to influence both aggregate report status and mission planning. Therefore downstream consumers can observe a cleaner status/mission than the actual structural diagnostic set warrants. No evidence currently shows this omission causes an external effect or duplicate action.

🔵 This is not an implementation patch recommendation yet. The correct contract question is whether every error/warning finding intended to influence Nexo must be present in one authoritative report set, and whether structural findings should map to an explicit conservative action or remain evidence-only.

No patch. No external duplicate effect claimed. No exactly-once claim.

Exact recovery point: POST-AB105.116R implementation audit → P26 → structural-report routing audit closed.

Next independent investigation: audit tests/consumers for report-status assumptions and determine whether any test proves structuralReport must be visible to aggregate status or Nexo planning. Do not reopen the closed producer searches P24–P25.

DO-NOT-REPEAT: P0–P26 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P27 — no test contract covers structural-report routing

🟢 Searched the executable test suite for buildAssistantReport, scripts/assistants.mjs, DEAD_WITH_HEALTH and DEAD_STATE_MISMATCH. No test currently asserts that structuralReport appears in the aggregate assistant report, affects aggregate status, or is passed into buildNexoMission().

🟢 The only current runtime consumer found for aggregate report status is scripts/assistants.mjs itself: it serializes the report and sets process.exitCode when report.status === error. Because buildAssistantReport() excludes structuralReport, a structural DEAD_STATE_MISMATCH can exist without causing this exit path through report.status.

🟢 No test contract was found establishing structuralReport as intentionally evidence-only. Therefore the observed exclusion cannot be classified as deliberate design from test evidence; it is an undocumented routing boundary.

🔵 This is a contract gap, not proof of unsafe execution. The structural findings currently observed are diagnostic consistency findings, and actionFor() would conservatively map unknown codes to inspect_and_collect_evidence if they were routed. No external effect or duplicate effect is demonstrated.

No patch.

Exact recovery point: POST-AB105.116R implementation audit → P27 → report-consumer/test-contract audit closed.

Next independent investigation: trace the generated CLI/output contract and any documentation describing assistant reports, to determine whether report.status is intended to represent all diagnostics or only debugger/tester/analyst. Do not reopen P24–P26.

DO-NOT-REPEAT: P0–P27 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P28 — report.status contract is limited by implementation, not documented

🟢 Audited the current CLI/output path and documentation. scripts/assistants.mjs emits the aggregate report as JSON and uses only report.status === "error" to set process.exitCode=1. No separate structural status/exit handling exists.

🟢 src/assistants/index.js defines buildAssistantReport({ debuggerReport, testerReport, analystReport }) and computes status exclusively from those three reports. The structuralReport argument passed by scripts/assistants.mjs is ignored by the function boundary.

🟢 The emitted JSON therefore excludes structuralReport from the aggregate assistants array, while report.assistantSquad and report.nexoMission are added separately afterward. No CLI/documentation contract found in README or repository search defines report.status as covering StateAuditor/structural findings.

🟢 No repository documentation was found establishing structuralReport as intentionally evidence-only, nor defining a separate status contract for it. Strongest conclusion: current report.status semantics are implementation-defined around debugger/tester/analyst, while the caller constructs an additional structural diagnostic stream that is not covered by that status contract.

🔵 This is not evidence that the CLI is unsafe or that structural findings should automatically drive Nexo. It is a contract ambiguity/routing gap. Existing structural codes are not explicit action mappings, so routing them would currently fall back to inspect_and_collect_evidence rather than direct mutation.

No patch.

Exact recovery point: POST-AB105.116R implementation audit → P28 → CLI/output/documentation contract audit closed.

Next independent investigation: audit whether learnFromReports() intentionally excludes structural findings and whether this creates a second loss of safety-relevant diagnostic history; do not reopen P24–P28 routing/status searches.

DO-NOT-REPEAT: P0–P28 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P29 — structural findings are also excluded from assistant learning memory

🟢 Audited `learnFromReports()` and its caller. `scripts/assistants.mjs` passes only `[debuggerReport, testerReport, analystReport]`; `structuralReport` is not included.

🟢 `learnFromReports()` derives findings, conclusions, test failures, pattern signatures, lessons, and run status exclusively from the supplied reports. Therefore `DEAD_WITH_HEALTH` and `DEAD_STATE_MISMATCH` cannot create a learned pattern, lesson, or finding count in the assistant-learning memory through the current workflow.

🟢 This is independent of the P28 aggregate-status loss: P28 concerned `buildAssistantReport()`/CLI status; P29 concerns durable learning history in `.lumina-assistant-memory.json`.

🟢 The exclusion is not repaired by Nexo memory. `simulation.nexoMemory` stores mission/attempt/execution/effect-journal structures, while `learnFromReports()` owns assistant-learning `runs/lessons/patterns`. Structural findings are absent from both the assistant-learning input and the Nexo mission input in the current workflow.

🔵 No evidence establishes that structural findings are intentionally excluded from learning. Also, this does not prove the omission causes unsafe behavior; it proves loss of historical learning signal. A future run can regenerate the same structural condition, but the learning layer will not increment a corresponding pattern or create a lesson from it.

No patch.

Exact recovery point: POST-AB105.116R implementation audit → P29 → structural-report learning-memory audit closed.

Next independent investigation: inspect whether `structuralReport` is persisted or exposed through any other durable channel outside `buildAssistantReport`, `learnFromReports`, and `buildNexoMission`; if none exists, classify the finding as an unpersisted diagnostic stream.

DO-NOT-REPEAT: P0–P29 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P30/P31 — structural diagnostic is not persisted and continuity is not guaranteed

🟢 P30 closure: repository-wide search found `structuralReport`, `structuralFindings`, `StateAuditor`, `DEAD_WITH_HEALTH`, and `DEAD_STATE_MISMATCH` only in `scripts/assistants.mjs`. No alternate durable consumer or persistence channel was found. The workflow persists `world-state.json` and `.lumina-assistant-memory.json`, but the structural report is not inserted into either store.

🟢 P31 continuity check: the structural findings are recomputed from current simulation state on each assistant run. There is no persisted structural finding history, finding signature, last-seen timestamp, or continuity marker for these codes. No tests establish cross-run structural continuity.

🟢 Important nuance: `normalizeCoreAgents()` runs before structural findings are generated and forces `currentActivity = "dead"` whenever `alive === false`. Therefore a `DEAD_STATE_MISMATCH` present in loaded state can be normalized away before the StateAuditor evaluates it. This means that specific diagnostic may disappear on the next run without a durable record proving it previously existed. `DEAD_WITH_HEALTH` is not similarly cleared by normalization when health remains >0, so its recurrence depends on current state.

🔵 This is diagnostic-continuity loss, not proof that the underlying state repair is wrong or unsafe. The normalization itself may be an intended invariant repair; the gap is that the pre-normalization anomaly is not persisted as evidence before normalization.

No patch.

Exact recovery point: POST-AB105.116R implementation audit → P31 → structural diagnostic continuity/pre-normalization evidence audit closed.

Next independent investigation: audit whether other normalization/repair steps in `scripts/assistants.mjs` mutate loaded state before diagnostics and therefore erase evidence of pre-existing anomalies. Focus only on pre-diagnostic normalization; do not reopen P26–P31 structural routing questions.

DO-NOT-REPEAT: P0–P31 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P32 — multiple pre-diagnostic normalizers mutate loaded state

🟢 Audited the full assistant startup path: `loadState()` → `applyState()` → `recoverCoreAgents()` → `createSimulation()` normalizers → second `normalizeCoreAgents()` → diagnostics. This is broader than the previously identified `currentActivity` repair.

🟢 `applyState()` calls `recoverCoreAgents()` before diagnostics. `createSimulation()` then runs additional world/agent normalizers before `scripts/assistants.mjs` runs its own `normalizeCoreAgents()`.

🟢 Several normalizers are potentially lossy with respect to pre-existing anomalous state: `normalizeCollectiveWorld()` filters invalid collective projects; `normalizeInstitutionWorld()` filters invalid institutions and clamps commons quantities to non-negative numbers; `normalizeTechnologyWorld()` clamps technology levels into [0,2]; `normalizeEcosystemWorld()` clamps biodiversity/soil/water/human-pressure into [0,1]; `normalizeSpatialWorld()` supplies/defaults structural spatial fields; `normalizeAgentLife()` fills/defaults life fields; `recoverCoreAgents()` and `normalizeCoreAgents()` clamp/default needs and force dead agents' activity to `dead`.

🟢 Therefore the system does not have a single immutable pre-diagnostic snapshot. Loaded state is normalized/mutated before debugger/tester/analyst/StateAuditor observe it. Some malformed or out-of-range values may be repaired or discarded before any report can establish that they existed in persisted state.

🔵 This does not mean every normalization is wrong; many are deliberate invariant restoration. The evidence gap is that there is no persisted pre-normalization diagnostic record or provenance indicating which loaded fields were changed, filtered, defaulted, or clamped before analysis.

No patch.

Exact recovery point: POST-AB105.116R implementation audit → P32 → pre-diagnostic normalization/evidence-loss audit closed.

Next independent investigation: enumerate the exact mutation surface of `loadState()` itself (before `applyState()`), because it also rewrites persisted state in memory—resource regeneration metadata/version migrations/stateRevision—and determine which of those transformations can erase evidence before any diagnostic component runs.

DO-NOT-REPEAT: P0–P32 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P33 — loadState mutates loaded state before diagnostics

🟢 `scripts/simulate.mjs::loadState()` is itself a pre-diagnostic transformation boundary. After JSON parsing, it mutates the in-memory loaded document before `applyState()` or any assistant diagnostic runs.

🟢 Exact mutations: `state.world.day` is rewritten from top-level `state.day`; `state.world.timeOfDay` is rewritten from top-level `state.hour`; for `wild_plants` and `fish`, persisted `regenerationPerDay` is overwritten from `defaultWorld`; for states with version <4 and non-positive persisted resource amount, the resource amount is replaced by the current default amount; `state.version` is promoted to at least 4; `state.stateRevision` is normalized to a non-negative integer or 0.

🟢 The strongest evidence-loss case is the version migration: a persisted v3-or-earlier state with `wild_plants.amount <= 0` or `fish.amount <= 0` is changed in memory to the current default amount before downstream diagnostics can observe the persisted value. This can erase evidence of a depleted resource in the loaded snapshot. The regeneration-rate overwrite likewise replaces persisted metadata with current defaults before analysis.

🟢 `loadState()` also has a broad catch: malformed/unreadable/unsupported state falls through to a newly constructed default state. The fallback itself is intentional recovery behavior, but no diagnostic record is produced explaining that persisted state could not be loaded and that analysis is running against defaults.

🔵 `stateRevision` normalization is primarily integrity metadata, not a world-state semantic repair; it still changes the in-memory representation before later checks. No claim that this alone creates a safety defect.

🔵 No evidence found of a separate persisted pre-load snapshot or audit trail for these transformations. Current tests/searches did not establish a contract requiring migration/recovery transformations to emit provenance before diagnostics.

No patch.

Exact recovery point: POST-AB105.116R implementation audit → P33 → loadState pre-diagnostic mutation/recovery boundary closed.

Next independent investigation: audit the malformed/unsupported-state fallback path specifically: determine whether a load failure can be distinguished downstream from a legitimate freshly initialized state, and whether that distinction is persisted or surfaced to the assistant report.

DO-NOT-REPEAT: P0–P33 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P34 — load failure collapses into indistinguishable default state

🟢 Audited `loadState()` → `applyState()` → assistant diagnostics → persistence. On read/JSON/schema failure, `loadState()` catches the error and returns a normal-looking version-5 default state with `stateRevision:0`, current timestamp, default world, initial agents, empty events and `nexoMemory:null`.

🟢 Downstream `applyState()` receives no `loadFailed`, `recoveredFromFallback`, source path, parse error, original-state hash, or recovery provenance. The assistant workflow then runs normally and eventually persists the resulting simulation as a valid `version:5` state with an incremented revision.

🟢 Therefore a failed/corrupt/unsupported persisted state can become observationally equivalent downstream to a legitimate freshly initialized state. The original failure is swallowed before diagnostics and is not represented in `report`, learning memory, Nexo memory, or the persisted state payload.

🟢 The next persistence can overwrite the prior unusable state with a syntactically valid default-derived state. This is a continuity/evidence-loss boundary: after overwrite, the system may retain no local artifact proving that recovery-from-load-failure occurred.

🔵 This does not prove data loss in every failure scenario because external filesystem/version-control backups may exist. It proves the executable application path itself does not preserve recovery provenance or distinguish fallback initialization from normal initialization.

No patch.

Exact recovery point: POST-AB105.116R implementation audit → P34 → load-failure/default-state provenance audit closed.

Next independent investigation: audit whether the first persistence after fallback can be prevented from silently replacing the failed source state, or whether an explicit recovery marker/lineage is required before normal persistence. Focus on the persistence admission decision after load failure; do not reopen P33's mutation census.

DO-NOT-REPEAT: P0–P34 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P35 — persistence admits fallback state and can replace failed source

🟢 Audited the persistence admission after `loadState()` fallback. Both executable entry paths (`scripts/simulate.mjs` main and `scripts/assistants.mjs`) treat the returned object as ordinary state and calculate the next revision from `state.stateRevision`.

🟢 When `loadState()` failed, it returned `stateRevision:0`. The caller then invokes `persistState(..., { expectedRevision: 0, stateRevision: 1 })` (or equivalent next revision). Inside `persistState()`, the expected-revision check calls `loadCurrentState(statePath)`, whose default is the same `loadState()`. If the source file is still unreadable/corrupt, that second load also returns the indistinguishable fallback with revision 0, so the expected-revision check passes.

🟢 The persistence path then writes a normal `version:5` payload and atomically renames it over the original path. Therefore the application has no built-in admission barrier preventing a fallback-derived state from replacing the failed persisted state.

🟢 A missing file follows the same shape: fallback revision 0 is accepted and a new normal state is created. That is legitimate initialization; the critical gap is that corrupt/unreadable/unsupported state is indistinguishable from it.

🟢 Existing persistence tests cover write failure, rename failure, stale revision conflicts, concurrent writers, lock recovery, and normal restart retention. They do not establish a contract that `loadState()` fallback must block persistence or preserve recovery provenance. No test was found asserting “failed load must not overwrite source state.”

🔵 This does not claim the atomic rename itself is unsafe. The overwrite is an explicit application behavior reached after fallback; filesystem atomicity protects the replacement operation, not the semantic distinction between recovered-default and legitimately loaded state.

Classification: **recovery-provenance / persistence-admission evidence loss**. No external effect duplication claimed. No patch.

Exact recovery point: POST-AB105.116R implementation audit → P35 → fallback persistence admission closed.

Next independent investigation: audit whether any workflow/CLI wrapper, outside these two entry points, preserves the original file or captures load errors before persistence. If none exists, close this branch as application-level provenance loss and move to the next pre-diagnostic/recovery boundary.

DO-NOT-REPEAT: P0–P35 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.

## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P36 — no wrapper preserves load-failure provenance before persistence

🟢 Audited the workflow/CLI wrappers around the P35 fallback→persist path. `.github/workflows/lumina-simulation.yml` invokes `npm run assistants` and then `npm run simulate`; `package.json` maps those commands directly to `node scripts/assistants.mjs` and `node scripts/simulate.mjs`. Neither wrapper captures a load-failure signal because `loadState()` exposes no such signal.

🟢 `scripts/assistants.mjs` calls `loadState(STATE_PATH)`, continues through diagnostics/planning, and calls `persistState()` with the loaded revision as expectedRevision. `scripts/simulate.mjs` does the same from its main entry point. There is no CLI-level quarantine, backup/copy, recovery marker, or operator acknowledgement between fallback and persistence.

🟢 The workflow's final Git commit/rebase/push logic preserves whatever `world-state.json` was produced; it does not inspect whether the state originated from fallback. Its concurrency/rebase handling is orthogonal to provenance: it can serialize/reconcile writers, but it does not distinguish a corrupt-source recovery from legitimate initialization.

🟢 The browser readers in `src/main.js` / `src/main-stable.js` can reject an invalid remote state and fall back to local behavior, but they are read/display paths and do not provide evidence that the server-side failed-load source is preserved before `scripts/assistants.mjs` or `scripts/simulate.mjs` overwrites it.

🟢 No executable test was found covering the exact invariant “corrupt/unreadable world-state → load failure → fallback → first persistence must preserve/quarantine the original source.” Existing persistence tests cover normal restart, revision conflicts, concurrent writers, write/rename failures and stale-lock recovery, not fallback provenance.

🔵 Therefore the P35 finding is not merely a missing guard inside `persistState()`: the current surrounding workflow/CLI topology provides no independent recovery-preservation layer before the overwrite.

Classification: **application-level recovery-provenance loss confirmed across current entry wrappers**. No universal data-loss claim; no claim that external Git history/backups are absent. No patch.

Exact recovery point: POST-AB105.116R implementation audit → P36 → wrapper/CLI recovery-preservation audit closed.

Next independent investigation: identify whether any existing Git-history/versioning or deployment-level recovery contract is intentionally relied upon as the authoritative recovery mechanism; if not, document the missing recovery/quarantine contract without implementing it.

DO-NOT-REPEAT: P0–P36 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P37 — Git history provides recoverability, not an explicit recovery contract

🟢 The workflow commits `world-state.json` and `.lumina-assistant-memory.json` with `Actualizar estado de Lúmina` and pushes to `main`. Recent history contains repeated state-update commits, and comparisons show `world-state.json` changing across those commits. Git therefore provides historical serialized snapshots.

🟢 No in-repository recovery procedure, workflow, documented invariant, recovery marker, or automated test was found that binds a `loadState()` failure to preservation of the failed source or restoration of a known-good historical state before persistence.

🟢 The workflow rebase/retry path handles concurrent writer races. It is not a semantic recovery path for corrupt or unreadable state; its retry simply resets to `origin/main` and runs simulation again.

🟢 Therefore Git history is **recoverability evidence**, not an established **application recovery contract**. Historical recovery is external/manual relative to the application path, and no executable rule identifies which historical commit is semantically last-known-good after a load failure.

🔵 This does not mean Git cannot recover an overwritten file. It means the application does not bind fallback persistence to historical recovery, and no claim is made about GitHub retention, backups, branch protection, or repository availability beyond observed repository behavior.

Classification: **external historical recoverability exists; explicit recovery contract absent**. No patch.

Exact recovery point: POST-AB105.116R implementation audit → P37 → Git-history/deployment recovery-contract audit closed.

Next independent investigation: determine whether there is any machine-readable notion of **last known good** such as a CI-passing state commit, validation gate, state health marker, or persisted hash/lineage. Do not implement yet.

DO-NOT-REPEAT: P0–P37 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P38 — no machine-readable last-known-good state marker found

🟢 Audited repository state/version metadata, persistence tests, and workflow validation for a machine-readable notion of `last known good` for `world-state.json`.

🟢 `stateRevision` is durable version/conflict metadata, but it is not a health marker or validation certificate. Existing continuity evidence explicitly limits it to persistence-level optimistic conflict checking; it does not identify a semantically healthy historical snapshot.

🟢 The GitHub Actions workflow runs `npm test`, `npm run assistants`, and `npm run simulate` before committing the resulting state, but it does not persist an artifact/marker linking the resulting `world-state.json` to a successful validation result. The commit message only records `Actualizar estado de Lúmina`.

🟢 No repository search found a persisted `lastKnownGood`, health marker, validation marker, state hash/lineage field, signed state marker, or workflow artifact that is consumed by the recovery path to select a known-good state.

🟢 Existing restart/persistence tests verify persistence behavior and failure handling, but no test establishes a durable mapping of `state snapshot → validation success → recoverable last-known-good identity`.

🔵 Therefore the repository has validation execution and Git historical snapshots, but lacks a machine-readable bridge that makes one historical snapshot authoritative as the last known good state after a load failure.

🔴 Do not claim that no Git commit was healthy, nor that recovery is impossible. The finding is specifically that **the application has no machine-readable last-known-good contract**.

Classification: **validation exists; last-known-good identity/lineage contract absent**. No patch.

Exact recovery point: POST-AB105.116R implementation audit → P38 → last-known-good marker/lineage audit closed.

Next independent investigation: inspect whether commit/CI ordering itself can accidentally create a false last-known-good candidate—for example, state is committed after tests but `npm run assistants`/`simulate` can mutate the same state after validation. Determine whether validation covers the exact bytes that are committed. Research only.

DO-NOT-REPEAT: P0–P38 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P39 — CI validation is not validation of the exact committed state bytes

🟢 Inspected `.github/workflows/lumina-simulation.yml`: it resets to `origin/main`, runs `npm test`, then runs `npm run assistants` and `npm run simulate`, and only afterward stages/commits `world-state.json` and `.lumina-assistant-memory.json`.

🟢 Therefore the Lúmina workflow's `npm test` gate executes before the two commands that can mutate the persisted state ultimately committed by that workflow. The workflow does not re-run `npm test` after those mutations and does not hash/compare the final staged state against the state tested by the gate.

🟢 A separate `.github/workflows/nexo-deterministic-tests.yml` does run `npm test` on every push to `main`, including `Actualizar estado de Lúmina` commits. This closes the stronger claim that state commits receive no CI at all.

🟢 However, `npm test` is a declared suite of code/audit/restart tests. Repository search did not establish that it loads the repository's current `world-state.json` as the object under validation and certifies its exact bytes/content. The persistence tests construct isolated temporary state fixtures and test persistence semantics.

🔵 Consequently there are two distinct validation moments: (1) pre-mutation tests in the self-mutating simulation workflow, and (2) post-commit deterministic tests on the pushed commit. The latter validates the repository checkout after commit, but no durable artifact/marker binds its success to a specific `world-state.json` hash or makes that snapshot the recovery authority.

🔴 Do not claim that the committed state is untested. The separate deterministic workflow materially tests the codebase after the state commit. The precise gap is **no exact-byte validation certificate/lineage from the committed `world-state.json` to a successful CI result**.

Classification: **post-commit CI exists; exact state-snapshot validation/identity contract absent**. No patch.

Exact recovery point: P39 closed.

Next independent investigation: audit the race/retry branch of `lumina-simulation.yml`: after a failed rebase it resets to `origin/main` and runs `npm run simulate` without rerunning `npm test` or `npm run assistants`. Determine whether the retry can generate and commit a state that bypasses the workflow's pre-mutation validation path.

DO-NOT-REPEAT: P0–P39 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P40 — rebase retry bypasses the validation path

🟢 The failure branch in `.github/workflows/lumina-simulation.yml` is explicit: after `git rebase origin/main` fails, it aborts/reset to `origin/main`, then executes only `npm run simulate`, stages the state, commits `Actualizar estado de Lúmina`, and pushes. It does not rerun `npm test` or `npm run assistants` on the retry path.

🟢 `scripts/simulate.mjs` loads `world-state.json`, advances the simulation according to elapsed time, and persists a new revision. Thus the retry itself can generate the exact `world-state.json` that is subsequently committed.

🟢 Therefore a rebase-conflict retry can produce and push a new state snapshot without executing the workflow's `npm test` gate in that attempt. This is a real validation-path bypass, distinct from the P39 exact-byte lineage gap.

🔵 This does not prove the resulting state is corrupt or unsafe. The retry uses the current `origin/main` checkout and the same `simulate` implementation; the finding is that **the retry path has weaker validation provenance than the primary path**.

🔴 Do not claim that the pushed retry state is necessarily invalid, nor that CI never validates it: the separate deterministic-test workflow can run after the push. The precise finding is that the state is committed/pushed before that independent post-push CI result exists, and the retry itself has no local test gate.

Classification: **rebase recovery path bypasses primary validation; post-push CI is asynchronous and not a pre-commit admission gate**. No patch.

Exact recovery point: P40 closed.

Next independent investigation: determine whether the deterministic post-push workflow can itself race with subsequent `Actualizar estado de Lúmina` commits, and whether its result is required for any subsequent state admission/recovery decision. Research only.

DO-NOT-REPEAT: P0–P40 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P41 — post-push CI is not an admission gate

🟢 `.github/workflows/nexo-deterministic-tests.yml` triggers on every push to `main` and runs `npm test`; it has its own concurrency group, separate from `lumina-simulation`.

🟢 `.github/workflows/lumina-simulation.yml` has a separate concurrency group and pushes state commits directly to `main`. Nothing in the repository workflows inspected makes the deterministic test result a prerequisite for the next `Actualizar estado de Lúmina` run or for accepting another state commit.

🟢 The simulation workflow does not consume a prior deterministic-test result, workflow conclusion, artifact, commit status, state hash, or validation certificate before generating/committing the next state.

🔵 Therefore deterministic CI can provide post-push evidence for a commit, but there is no repository-level admission/lineage mechanism making that result authoritative for that exact state snapshot or requiring it before subsequent state mutation/commit.

🔴 Do not claim a proven temporal race between two specific live workflow runs from this inspection; the available connector did not expose a complete push-triggered run history here. The proven finding is architectural: the workflows are independently triggered/concurrent and no dependency or validation-result handoff exists.

Classification: **post-push validation is advisory evidence, not a blocking state-admission/recovery gate**. No patch.

Exact recovery point: P41 closed.

Next independent investigation: audit whether GitHub branch protection/status requirements or repository settings enforce successful deterministic CI before `main` accepts `Actualizar estado de Lúmina`. Only claim this if directly observable; otherwise keep it UNKNOWN.

DO-NOT-REPEAT: P0–P41 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — POST-AB105.116R IMPLEMENTATION AUDIT P42 — branch protection / required CI remains UNKNOWN

🟢 Repository metadata confirms `main` is the default branch and the connected GitHub principal has repository administration permission.

🔵 The available GitHub connector exposes repository metadata but does not expose branch-protection/ruleset settings or required-status-check configuration for this repository. No repository file inspected declares those server-side GitHub rules.

🔴 Therefore we cannot truthfully assert that successful deterministic CI is required before `main` accepts an `Actualizar estado de Lúmina` push. Nor can we assert the opposite from the absence of an exposed setting.

Classification: **server-side branch protection / required CI = UNKNOWN**. The workflow-level finding from P41 remains: no in-repository workflow dependency makes deterministic CI a blocking admission gate.

Exact recovery point: P42 closed as UNKNOWN.

Next independent investigation: audit the actual GitHub Actions run/result relationship for a concrete `Actualizar estado de Lúmina` commit, if observable, and determine whether the deterministic test run's checked-out SHA exactly equals that state commit and whether later state commits can supersede it before its result is consumed. Do not infer branch protection.

DO-NOT-REPEAT: P0–P42 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — P43 — concrete Lúmina state commits: CI/status linkage not observable; rapid consecutive state pushes confirmed

🟢 Git commit search returned multiple real `Actualizar estado de Lúmina` commits on 2026-10-07, including `e5c326b6a7eae2671554b3ff366005d272a92428` (18:37:23Z), `4b42fd044c29a30a3fe8c34ea599896631c53997` (18:37:39Z), and `99cb5cd110be4e8502de6ae2d67086662790935c` (18:37:56Z). The commits directly modify `world-state.json` and `.lumina-assistant-memory.json`; the state revision advances 1303→1305→1307 across the observed sequence.

🟢 This is concrete evidence that multiple state mutations can be committed to `main` within ~33 seconds.

🔵 `get_commit_combined_status` returned an empty status list for all three sampled state commits. This does **not** prove that Actions did not run: the repository's deterministic workflow is an Actions workflow rather than a legacy commit-status context, and the connector's commit-run endpoint only exposes PR-triggered runs.

🔴 Therefore the exact proposition “the deterministic workflow checked this exact state commit SHA and its successful result was consumed before the next state commit” remains **UNPROVEN**. We have no connector-visible push-run history sufficient to establish that temporal relationship.

Classification: **CI-to-exact-state admission/consumption linkage = UNKNOWN**. The observed rapid commit sequence strengthens the concurrency concern, but is not by itself proof of a race with CI.

Next mission P44: inspect any connector-visible workflow run/job metadata or workflow logs/artifacts that can establish the `GITHUB_SHA`/checkout SHA for a deterministic test run, and compare it against an exact `Actualizar estado de Lúmina` commit. If unavailable, preserve UNKNOWN.

DO-NOT-REPEAT: P0–P43 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — P45 — no repository-side SHA traceability for deterministic CI

🟢 The deterministic workflow is confirmed as push-triggered on `main`, with `actions/checkout@v4`, Node 22, `npm install`, and `npm test`.

🟢 Repository code search for `GITHUB_SHA` and `github.sha` returned no matches. There is no in-repository logging/artifact step that explicitly records the workflow's commit SHA.

🔵 The workflow itself inherently checks out the triggering revision through `actions/checkout`, but the repository does not persist an auditable SHA/result certificate or artifact tying the test result to a specific `Actualizar estado de Lúmina` commit.

🔴 Therefore P45 cannot establish exact CI-to-state identity or result consumption. This remains UNKNOWN, not a failure claim.

Classification: **deterministic CI exact-SHA traceability = UNKNOWN / absent repository-side certificate**.

Next mission P46: inspect workflow architecture for any other indirect certificate/consumption mechanism (job outputs, artifacts, comments, badges, status files, or downstream workflow dependency). If none exists, close the CI-linkage branch and move to the next independent recovery invariant.

DO-NOT-REPEAT: P0–P45 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — P46 — indirect CI certificate/consumption sweep

🟢 Searched the repository for indirect mechanisms that could bind `nexo-deterministic-tests.yml` results to state admission: `GITHUB_RUN_ID`, `github.event.workflow_run`, `repository_dispatch`, job-output patterns, status/badge references, and references to the deterministic workflow from other workflow files.

🟢 `nexo-deterministic-tests.yml` is not referenced by another workflow as a dependency/consumer; no `workflow_run` consumer or downstream gate was found. No `GITHUB_RUN_ID`/workflow-run output persistence was found. No repository badge or status file was found that turns its result into an authoritative state certificate.

🟢 `actions/upload-artifact` exists in other NEXO diagnostic workflows, but not in `nexo-deterministic-tests.yml`; therefore those artifacts do not establish certification of the Lúmina state commits under audit.

🔵 GitHub's external commit/status/branch-protection layer may still contain information not represented in repository files or exposed by the connector. That remains outside this repository-side sweep.

🔴 Result: no indirect in-repository CI certificate/consumption mechanism found. Exact CI-to-state admission remains UNKNOWN, not disproven and not a CI failure claim.

Classification: **CI linkage branch CLOSED at repository level; external GitHub status/protection linkage remains UNKNOWN**.

Next mission P47: move to the next independent recovery invariant from P35/P38 — determine whether any persisted state field, Git history rule, or workflow step identifies an authoritative last-known-good snapshot *at the moment of recovery*, rather than merely recording ordinary state revisions. Research only; no patch.

DO-NOT-REPEAT: P0–P46 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — P47 — authoritative last-known-good identity

🟢 Inspected the actual persistence/recovery path again: `loadState()` returns a normal-looking v5 default on read/parse/schema failure with `stateRevision: 0` and a fresh `savedAt`; `persistState()` writes only version/stateRevision/savedAt/day/hour/world/agents/events/nexoMemory. There is no persisted recovery provenance or health certificate.

🟢 Repository search found no `lastKnownGoodSnapshot`, `lastKnownGoodCommit`, `validatedAt`, `validatedRevision`, or equivalent machine-readable authoritative marker. `stateRevision` is the only explicit persisted revision/coordination field; it is not a health or validation certificate.

🟢 `.lumina-assistant-memory.json` records assistant run timestamps/status/findings, but it does not bind a successful validation to the exact `world-state.json` bytes, commit SHA, or a recovery-authoritative snapshot. The workflow commits both files but does not create a validation marker.

🔵 Git history can show historical state commits, but no machine-readable rule identifies which one is authoritative last-known-good at recovery time.

🔴 P47 result: **NO_AUTHORITATIVE_LAST_KNOWN_GOOD_MARKER**. This confirms the previously identified recovery-provenance gap; it does not by itself prove data loss on every recovery.

Classification: **recovery identity/provenance = MISSING**.

Next mission P48: inspect the exact fallback→persist sequence for a stronger consequence: determine whether a failed/unreadable `world-state.json` can be converted into a new revision-1 state without any durable record that the prior source was unreadable. Focus on concrete code/test coverage; research only, no patch.

DO-NOT-REPEAT: P0–P47 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — P48 — fallback can be persisted as a new revision without durable failure provenance

🟢 Concrete code path confirmed: `loadState()` catches read/parse/validation failure and returns a synthetic version-5 state with `stateRevision: 0`, fresh `savedAt`, default world/agents, empty events, and `nexoMemory: null`. No failure bit/source/hash is carried forward.

🟢 `main()` treats that fallback exactly like ordinary loaded state: it computes elapsed time, applies/advances it, then calls `persistState(... expectedRevision: state.stateRevision, stateRevision: state.stateRevision + 1)`. Therefore a fallback can be admitted as revision 1.

🟢 `persistState()` re-reads the current file for `expectedRevision`. If the source is malformed/unreadable, that second `loadState()` also returns synthetic revision 0, so `expectedRevision: 0` passes. The subsequent atomic rename replaces the unreadable source with the newly serialized normal-looking state.

🟢 Existing persistence tests cover injected write/rename failures, stale revisions, concurrent writers, lock recovery, and normal restart/reconstruction. They do **not** test malformed/unreadable source → fallback → persist → source preservation/quarantine/provenance.

🔴 This establishes a concrete **recovery provenance loss / source replacement** path. It does not establish universal data loss: the old bytes may still exist externally (Git/history/backups), but the application itself does not preserve their unreadable identity before overwrite.

Classification: **FAILED_LOAD_CAN_BE_NORMALIZED_AND_COMMITTED_WITHOUT_PROVENANCE = CONFIRMED (code-level)**.

Next mission P49: inspect whether any caller other than `main()` can invoke `loadState()` and then `persistState()` in the same fallback-blind manner, including assistants/browser/API paths. Determine whether the confirmed gap is simulation-only or broader within Lúmina.

DO-NOT-REPEAT: P0–P48 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.


## 2026-10-07 — P49 — scope of fallback-blind recovery

🟢 `scripts/assistants.mjs` imports the same `loadState`/`persistState` pair. It loads `persisted = await loadState(STATE_PATH)`, performs analysis/mutation, then unconditionally writes `.lumina-assistant-memory.json` and calls `persistState(... expectedRevision: persisted.stateRevision, stateRevision: nextRevision)`. Thus the same malformed/unreadable `world-state.json` → synthetic revision 0 → persistence path exists outside `scripts/simulate.mjs` main.

🟢 Browser `src/main.js` has a separate localStorage persistence path. `parseSavedState()` returns null on malformed JSON; `restoreSimulation()` then returns false, after which initialization continues and the normal save loop can write a fresh `lumina-world-v5` snapshot. There is no durable marker that the prior localStorage value was unreadable. This is the same provenance class, but a separate storage implementation.

🟢 Browser remote `world-state.json` loading rejects invalid HTTP/JSON/schema and does not itself overwrite the remote file; it falls back to local/default behavior. Therefore the confirmed remote-file overwrite path remains server/script-side, not proven from the browser fetch path.

🟢 Search found no additional production caller of the Node `loadState()`/`persistState()` pair beyond `scripts/simulate.mjs` and `scripts/assistants.mjs`; other matches are tests/docs/continuity records.

🔴 P49 result: the gap is **NOT simulation-only**. It is confirmed in the assistant workflow and independently present in browser localStorage recovery. The exact remote-file replacement mechanism remains the Node persistence path.

Classification: **fallback-blind recovery is cross-path within Lúmina (Node simulation + assistants; browser local persistence separately)**.

Next mission P50: inspect whether `scripts/assistants.mjs` can make the provenance loss stronger by persisting assistant memory successfully before `world-state.json`, creating a durable record that looks healthy while the authoritative world state was recovered from failure. Research ordering and failure boundaries only; no patch.

DO-NOT-REPEAT: P0–P49 closed; AB105.079R–AB105.116R closed; AB105.117R prohibited.
