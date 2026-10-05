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
- 2,939,007 observations.
- POST_RETURN_ALLOWED=0.
- POST_RETURN_PRE_REMOVE_CACHE=0.
- POST_RETURN_PRE_REMOVE_SNAPSHOT=0.
- POST_RETURN_POST_REMOVE_SNAPSHOT=2,845,069.
- UNEXPECTED=0.
Interpretation: no post-return stale snapshot or post-return ALLOWED was observed in this diagnostic. This is executed evidence, not a formal JMM proof and not a real-broker exploit witness.
Known historical count discrepancy (older note reported 4,071,307 observations) remains a reconciliation item; latest saved checkpoint is canonical until raw artifact is recovered.

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
2. PR #93 observation count discrepancy: 4,071,307 vs 2,939,007. Latest checkpoint is canonical pending raw-artifact reconciliation.
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
