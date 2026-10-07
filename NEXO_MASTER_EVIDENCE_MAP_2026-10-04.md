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
