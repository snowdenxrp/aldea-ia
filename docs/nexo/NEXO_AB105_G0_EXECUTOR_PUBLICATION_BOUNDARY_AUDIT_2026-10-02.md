# AB105 G0 executor/publication boundary audit — 2026-10-02

Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## Metadata event queue

KafkaEventQueue uses a ReentrantLock to protect queue state and a dedicated event-handler thread. enqueue() acquires the queue lock, inserts the event, signals the condition, and releases the lock. The event-handler thread later acquires the same lock, removes the event, releases the lock, and runs event.run().

MetadataLoader.handleCommit() appends its metadata-processing callback to this KafkaEventQueue. The callback performs metadata loading and eventually invokes maybePublishMetadata(), which synchronously calls each MetadataPublisher.onMetadataUpdate(). AclPublisher.onMetadataUpdate() directly calls StandardAuthorizer.removeAcl() for incremental ACL deletions.

This establishes ordering/coordination for events inside the MetadataLoader queue. It does NOT by itself establish a happens-before edge from the completed removeAcl() plain-field write to an independently executing RPC authorization thread, because the RPC reader does not acquire this same queue lock as part of authorization.

## Authorization-side boundary

The current exact-pin audit has established StandardAuthorizer.authorize() reads volatile data, then StandardAuthorizerData.findAclRule() reads plain aclCache. No KafkaEventQueue lock is acquired by this path.

The remaining RPC dispatcher/request-handler path could contain another synchronization edge, but the available source search did not yet identify a concrete RequestChannel/handler publication edge at the pinned revision. Therefore it would be incorrect to declare the global JMM boundary closed.

## Status

🟢 KafkaEventQueue mechanics/source verified.
🟢 MetadataLoader -> AclPublisher -> removeAcl call path verified.
🟢 Authorize path verified.
🟡 Metadata-to-RPC happens-before: UNKNOWN / NOT_IDENTIFIED.
🟡 stale read: NOT OBSERVED.
🟡 mechanism/security impact/generalization: UNKNOWN.

## Methodological boundary

No production synchronization was modified.
No race-side synchronization was added.
No TLC rerun.
AB105.116R unchanged.
AB105.117R not created.
The cache/snapshot diagnostic must not be repeated.

## Next action

Use exact source-file discovery around the actual broker RPC handler/RequestChannel implementation at this Kafka pin, rather than broad search terms, and identify whether the handler thread shares any lock/volatile/queue publication with the metadata event thread. If the request path has no relevant edge, preserve UNKNOWN rather than claiming a formal JMM result.
