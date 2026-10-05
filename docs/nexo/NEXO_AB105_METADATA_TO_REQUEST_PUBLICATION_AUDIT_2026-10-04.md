# NEXO AB105 — MetadataLoader/AclPublisher → Request Processing Publication Audit
Date: 2026-10-04

## Question
Can an independent synchronization/publication path establish HB from the per-mutation ACL application W1 on the MetadataLoader thread to D1 authorization on a request-handler thread?

## Pin
Kafka source inspected at:
99b940733a9f6bc409457dba7108f08421d81e42

## 🟢 Verified source facts

### 1. MetadataLoader execution domain
MetadataLoader documents that it maintains its own thread and makes all callbacks into publishers from that thread.
handleCommit() appends work to its KafkaEventQueue; maybePublishMetadata() invokes publishers synchronously on that loader thread.

### 2. Broker ACL application path
BrokerServer constructs BrokerMetadataPublisher with an AclPublisher and installs BrokerMetadataPublisher into MetadataLoader publishers.
BrokerMetadataPublisher.onMetadataUpdate() calls:
metadataCache.setImage(newImage);
...
aclPublisher.onMetadataUpdate(delta, newImage, manifest);
The AclPublisher is therefore executed synchronously as part of the MetadataLoader publisher callback.

### 3. Incremental ACL mutation
AclPublisher.onMetadataUpdate() applies each incremental ACL delta by calling:
ClusterMetadataAuthorizer.addAcl/removeAcl.
StandardAuthorizerData.addAcl/removeAcl replace the plain aclCache field.
StandardAuthorizer.authorize() first reads volatile StandardAuthorizer.data into curData and then StandardAuthorizerData.authorize()/findAclRule() reads the plain aclCache from that data object.

### 4. Startup-only authorizer synchronization
StandardAuthorizer.start() returns initialLoadFuture for non-early listeners.
AclPublisher.completeInitialLoad() completes that future only on the first metadata update.
BrokerServer waits for authorizer futures before enabling request processing.
BrokerServer also waits for brokerMetadataPublisher.firstPublishFuture during startup.
These are startup/readiness barriers, not per-incremental-ACL-update publication mechanisms.

### 5. BrokerMetadataPublisher firstPublishFuture
BrokerMetadataPublisher.firstPublishFuture is completed in onMetadataUpdate() finally, after the ACL publisher call and the other publication work.
BrokerServer waits for this future only during startup before enabling inbound request processing.
No later request path waits on this future for each ACL mutation.

### 6. Request processing domain
BrokerServer constructs KafkaApis and the data-plane request handler pool before installing metadata publishers.
KafkaApis receives the same authorizer plugin and RequestChannel used by the data-plane request path.
The startup sequence enables request processing after initial authorizer futures complete.

## 🔵 HB analysis

Potential edges found:

A. MetadataLoader EventQueue ordering → W1
YES, this orders metadata processing inside the MetadataLoader domain.

B. W1 → BrokerMetadataPublisher subsequent operations
YES, program order inside the same MetadataLoader callback.

C. W1 → firstPublishFuture completion
YES, program order in BrokerMetadataPublisher.onMetadataUpdate() finally.

D. firstPublishFuture → request processing
YES, but only for startup: BrokerServer waits on firstPublishFuture before enabling inbound processing.

E. W1 → authorizer start future
YES, but only for initial load: AclPublisher calls completeInitialLoad() only while !completedInitialLoad.

F. W1 → per-request D1 for later incremental mutations
NOT IDENTIFIED.
There is no per-mutation wait/hand-off from AclPublisher completion to RequestChannel enqueue/dequeue or request-handler execution.

## Important ordering detail
BrokerMetadataPublisher writes metadataCache.setImage(newImage) BEFORE calling aclPublisher.onMetadataUpdate().
Therefore a volatile/publication mechanism associated with that metadata-cache write cannot be used to publish the later aclCache mutation performed by W1. It publishes state preceding W1, not W1 itself.

## Result
🟢 Startup publication/readiness paths are real and verified.
🟢 They explain why the authorizer can safely become available initially.
🔴 They do not establish W1 → D1 for subsequent incremental ACL mutations.
🔴 No independent per-mutation synchronization edge from MetadataLoader/AclPublisher to request-handler authorization was identified in this audit.
🔴 Stale-read execution remains NOT OBSERVED / NOT DISPROVEN.
🔴 Security vulnerability/exploitability remains NOT ESTABLISHED.

## Current HB graph
Metadata log commit
  → MetadataLoader EventQueue
  → BrokerMetadataPublisher
  → AclPublisher
  → W1 (plain aclCache replacement)
  ──X──> per-mutation request-handler publication
RequestChannel ENQUEUE → DEQUEUE → D1 remains a separate request-domain chain.

## Protected state
AB105.116R remains canonical.
Do not create AB105.117R.
Do not rerun TLC while ordering audit is open.

## DO-NOT-REPEAT
Do not rerun PR92 cache-identity census.
Do not rerun PR93 source audit.
Do not rerun PR94/G0 witness.
Do not add latch, volatile, barrier, Future, or other artificial synchronization between W1 and D1.

## Next frontier
Only continue if a source path exists that is actually awaited/read on every incremental ACL mutation and reaches the request-handler authorization thread. Otherwise classify the absence as bounded NOT-IDENTIFIED HB, not proof of impossibility.
