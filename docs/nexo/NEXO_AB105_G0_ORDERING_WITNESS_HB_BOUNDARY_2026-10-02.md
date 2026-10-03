# NEXO AB105 G0 — JMM HB Boundary Audit — 2026-10-02

## Scope

Audit the remaining publication boundary after the prior G0 JMM analysis:

metadata input -> MetadataLoader/AclPublisher -> StandardAuthorizerData.aclCache write -> concurrent request-thread authorize/read.

Kafka pin:
99b940733a9f6bc409457dba7108f08421d81e42

AB105.116R remains the canonical anchor. AB105.117R is not created. TLC is not rerun.

## Findings

### 1. MetadataLoader has a dedicated event-handler thread

MetadataLoader owns a KafkaEventQueue and documents that the loader maintains its own thread used to make all callbacks into publishers.

handleCommit() appends work to that queue. The queued event eventually runs on the event-handler thread and calls maybePublishMetadata(), which invokes publisher.onMetadataUpdate().

Therefore AclPublisher.onMetadataUpdate() runs on the MetadataLoader event-handler thread, not on the request handler thread.

### 2. AclPublisher directly mutates the authorizer while requests continue

AclPublisher explicitly documents that authorization continues in other threads while ACL changes are being applied.

For incremental deltas it calls, in order:

AclPublisher.onMetadataUpdate()
 -> ClusterMetadataAuthorizer.addAcl/removeAcl()
 -> StandardAuthorizer.addAcl/removeAcl()
 -> StandardAuthorizerData.addAcl/removeAcl()
 -> aclCache = new AclCache

The pinned source therefore confirms the intended concurrent writer/reader topology.

### 3. KafkaEventQueue synchronization does not publish the ACL write to request threads

KafkaEventQueue uses a ReentrantLock around enqueue/dequeue operations. This gives synchronization for the queue's producer -> event-handler handoff.

That edge is useful for publishing the queued EventContext/event to the MetadataLoader event-handler thread.

However, the ACL write occurs later, inside the event-handler thread, after the queue handoff. The request authorization path does not acquire this MetadataLoader queue lock.

Therefore the queue's lock does NOT establish:

aclCache write on metadata-loader thread
    -> request-thread aclCache read

The lock edge terminates at the event-handler execution; it is not a shared synchronization edge with request handlers.

### 4. Request authorization path has no observed metadata-loader barrier

KafkaApis calls AuthHelper.authorize(), which calls Authorizer.authorize() directly.

StandardAuthorizer.authorize() performs:

StandardAuthorizerData curData = data;   // volatile read
curData.authorize(...)

StandardAuthorizerData.findAclRule() then performs:

AclCache aclCacheSnapshot = aclCache;   // plain read

No lock or queue synchronization is taken in this path that is shared with the MetadataLoader event queue.

### 5. The volatile outer reference remains insufficient for incremental ACL deltas

StandardAuthorizer.data is volatile.

But StandardAuthorizer.addAcl/removeAcl call data.addAcl/removeAcl() without assigning a new StandardAuthorizerData back to data.

StandardAuthorizerData.aclCache is plain and is replaced by a plain assignment.

Thus:

metadata thread:
    data.aclCache = newCache

request thread:
    curData = data;        // volatile read of same data object
    aclCacheSnapshot = aclCache; // plain inner read

The volatile read of data does not by itself create a happens-before edge for the later mutation of aclCache inside the already-published object.

## HB conclusion

A concrete Java Memory Model happens-before path from the incremental aclCache write to the concurrent authorization read has NOT been found.

The previously identified candidate gap is therefore strengthened by the full MetadataLoader/EventQueue/request-path audit:

W1 / metadata-loader thread
 -> plain aclCache write
 -> [NO SHARED HB EDGE IDENTIFIED]
 -> request thread
 -> plain aclCache read

This is still a publication-gap finding, not yet an exploitability proof.

## What is now ruled out

The following explanations are not sufficient as formal HB evidence:

- "The MetadataLoader queue is synchronized." It synchronizes queue handoff, not the later ACL write to request readers.
- "data is volatile." It publishes the outer data reference, not later writes to fields inside the same object.
- "AclCache is immutable." Immutability protects each cache instance from internal mutation races; it does not publish replacement of the aclCache reference.
- Timestamp/order observations alone. Temporal order is not a Java Memory Model happens-before relation.

## Remaining UNKNOWN

- Whether a separate synchronization edge exists outside the inspected MetadataLoader/AclPublisher/StandardAuthorizer path.
- Whether the real JVM/runtime can produce a stale aclCache read after the experiment's chosen completion boundary.
- Whether such a stale read can produce an authorization result that violates the intended ACL state at a reachable externally meaningful point.

## Next experiment

Do not modify Kafka production code and do not rerun TLC.

Build a minimal focused concurrency witness against the exact pinned commit that:

1. establishes an ACL state that permits a request;
2. performs an incremental ACL removal through the real StandardAuthorizerData path;
3. records a precise writer-side completion marker after aclCache replacement;
4. concurrently invokes authorize() from a separate request thread;
5. distinguishes:
   - writer completed + reader saw new cache;
   - writer completed + reader saw stale cache;
   - request reached reader before writer completed;
6. repeats enough times to detect an observed stale-read outcome if the environment permits it.

The witness must not treat timestamp ordering as proof of HB. It must explicitly model the completion boundary and the observed cache generation/state.

## Epistemic state

- Real-broker ordering witness: CONFIRMED
- W1/ENQUEUE/DEQUEUE/AUTH_ENTER/AUTH_DECISION observations: CONFIRMED
- MetadataLoader dedicated event-handler thread: CONFIRMED from pinned source
- AclPublisher concurrent writer/reader intent: CONFIRMED from pinned source
- aclCache plain write/read: CONFIRMED
- data volatile: CONFIRMED
- MetadataLoader queue lock -> request-thread HB: NOT PRESENT / NOT IDENTIFIED
- Full aclCache-write -> request-read HB: UNKNOWN / NOT ESTABLISHED
- Exploitability: UNKNOWN
- AB105.116R: INTACT
- AB105.117R: NOT CREATED
- TLC: NOT RERUN
