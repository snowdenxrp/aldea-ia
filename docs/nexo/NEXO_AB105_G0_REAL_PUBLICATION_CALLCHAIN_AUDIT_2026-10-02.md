# AB105 G0 real publication call-chain audit — 2026-10-02

Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## Mutation path

At the pinned source, AclPublisher.onMetadataUpdate() applies incremental ACL changes from a MetadataDelta. For each changed ACL it directly invokes ClusterMetadataAuthorizer.addAcl/removeAcl.

MetadataLoader.maybePublishMetadata() invokes publisher.onMetadataUpdate(...) synchronously in its metadata event-processing path. MetadataLoader.handleCommit() appends its processing callback to eventQueue, and that callback loads batches and eventually calls maybePublishMetadata.

Therefore the observed production mutation path is:

metadata event queue -> MetadataLoader -> maybePublishMetadata -> AclPublisher.onMetadataUpdate -> ClusterMetadataAuthorizer.removeAcl -> StandardAuthorizer.removeAcl -> StandardAuthorizerData.removeAcl -> plain aclCache assignment.

AclPublisher itself explicitly documents that authorization continues in other threads while changes are being applied. That comment is descriptive intent, not a JMM synchronization guarantee.

## Authorization path

StandardAuthorizer.authorize() performs a volatile read of data once into curData, then invokes curData.authorize(...) for each Action.

StandardAuthorizerData.authorize() invokes findAclRule() once for the non-superuser path. findAclRule() performs one plain read of aclCache into aclCacheSnapshot and uses that snapshot for the complete decision.

No synchronization edge was identified in these inspected methods connecting completion of the metadata-event mutation to the unrelated RPC authorization thread.

## Important distinction

The metadata event queue provides ordering/serialization inside the metadata publication domain. The inspected source does not establish that completion of that callback creates a JMM happens-before edge to an independently executing RPC authorization thread.

Likewise, Request/RPC execution can occur on other threads; the current source audit does not treat RequestChannel publication as publication of the ACL plain field unless an explicit synchronization edge is demonstrated.

## Status

🟢 SOURCE-VERIFIED: real incremental ACL mutation call chain reaches removeAcl().
🟢 SOURCE-VERIFIED: authorize reads volatile data, then plain aclCache through StandardAuthorizerData.
🟢 SOURCE-VERIFIED: one findAclRule snapshot per authorization decision.
🟡 JMM happens-before from metadata mutation completion to RPC authorization: NOT_IDENTIFIED / UNKNOWN.
🟡 stale-read mechanism: NOT_OBSERVED in executed diagnostics.
🟡 security impact/exploitability/generalization: UNKNOWN.

This is a narrower result than claiming “there is no happens-before anywhere.” The audit has only established that no such edge was identified in the inspected mutation/publication/authorization methods. A complete claim would require auditing the exact runtime thread/executor publication boundary used by the broker.

## DO-NOT-REPEAT

Do not repeat cache-identity/snapshot instrumentation.
Do not modify Kafka production synchronization.
Do not rerun TLC.
Do not create AB105.117R.
Do not modify AB105.116R.

## Next action

Audit the concrete broker event/executor and request-dispatch boundary to determine whether an existing specified publication edge connects MetadataLoader completion to the RPC handler thread. If none is established, retain UNKNOWN rather than asserting stale visibility.
