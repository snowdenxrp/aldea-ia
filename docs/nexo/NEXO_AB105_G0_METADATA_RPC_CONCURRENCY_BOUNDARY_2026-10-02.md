# NEXO AB105 G0 — Source Boundary: MetadataLoader event queue → concurrent RPC authorization

Date: 2026-10-02
Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42

## Verified source chain

1. MetadataLoader owns a KafkaEventQueue and explicitly states that the loader maintains its own thread used to make all callbacks into publishers.
2. handleCommit() appends metadata processing to that event queue; the resulting metadata publication calls publisher.onMetadataUpdate() on that loader thread.
3. AclPublisher therefore receives ACL metadata updates through the MetadataLoader event-queue thread. Its source explicitly says authorization continues in other threads while ACL changes are applied.
4. KafkaApis.handle() processes client requests in the request-handler path. AuthHelper.authorize() directly calls Authorizer.authorize() for the current request.

## Consequence

We now have a concrete concurrency boundary:
METADATA LOG → MetadataLoader KafkaEventQueue thread → AclPublisher → StandardAuthorizer mutation
versus
NETWORK/RPC REQUEST THREAD → KafkaApis → AuthHelper → StandardAuthorizer.authorize()

The source does not yet establish a direct Java happens-before relation between these two paths. However, it does establish that they are intentionally concurrent and that Kafka's correctness model relies on the authorizer remaining coherent while metadata is published.

Therefore the earlier hypothesis is narrowed further: the relevant question is no longer merely whether aclCache is non-volatile, but whether the event-queue publication and request-processing infrastructure provides sufficient memory visibility for StandardAuthorizerData.aclCache.

## No new runtime claim

No new runtime witness was produced in this step.
The existing G0 witness remains the only runtime evidence:
IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0

## Next source target

Inspect KafkaEventQueue execution/append semantics and the request-handler threading model for a concrete synchronization mechanism. Only after that should a targeted visibility harness be considered.

Do not repeat PR #86's propagation experiment unchanged.
Do not rerun TLC.
Do not create AB105.117R.
AB105.116R remains frozen.