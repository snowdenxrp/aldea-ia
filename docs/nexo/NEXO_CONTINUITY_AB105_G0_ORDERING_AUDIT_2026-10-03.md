# NEXO CONTINUITY — AB105 G0 Ordering Audit — 2026-10-03

## Scope
Audit of PR #94 real-broker ordering witness at pinned Kafka `99b940733a9f6bc409457dba7108f08421d81e42`.

## New finding — D0_RETURN is downstream of metadata-log commit, not proven downstream of W1
The exact pinned implementation gives a more precise answer than the previous UNKNOWN:

`AclApis.handleDeleteAcls()` receives the `CompletionStage`s returned by `authorizer.deleteAcls()` and waits for them before completing the response future. `StandardAuthorizer` inherits `ClusterMetadataAuthorizer.deleteAcls()`.

`ClusterMetadataAuthorizer.deleteAcls()` delegates to `AclMutator.deleteAcls()` and documents that its future is completed once the controller has processed the delete and the ACL deletion has been persisted to the cluster metadata log.

On the pinned `QuorumController`, `deleteAcls()` calls `appendWriteEvent("deleteAcls", ... aclControlManager.deleteAcls(...))`. The controller write event appends/prepares the metadata records, then places the operation in `DeferredEventQueue`. The future is completed when committed/stable offset processing reaches the deferred event (`future.complete(resultAndOffset.response())`). The controller's commit listener calls `deferredEventQueue.completeUpTo(lastStableOffset)`.

Separately, the broker's `MetadataLoader` invokes metadata publishers on its own metadata-loader thread, and `AclPublisher` invokes `StandardAuthorizer.removeAcl()`, which replaces the non-volatile `aclCache` inside the existing `StandardAuthorizerData`.

Therefore D0_RETURN establishes that the ACL deletion has reached the controller's durable metadata-log completion point. It does NOT establish that the broker under test's MetadataLoader/AclPublisher callback has already executed W1. Those are distinct asynchronous consumers/paths of the metadata log.

This is the strongest current causal result:

`deleteAcls request → controller event → metadata record persisted/committed → D0_RETURN`

while the local visibility path remains:

`metadata record → MetadataLoader thread → AclPublisher → removeAcl() → aclCache=C2 → W1`

No source evidence found yet that forces the second chain to complete before D0_RETURN.

## Consequence for G0 witness
The harness sequence remains:

`D0_RETURN → producer.send() → network → Processor → ENQUEUE`

while W1 is on the separate metadata-loader callback thread.

Thus `W1 timestamp < ENQUEUE timestamp` remains temporal evidence, not JMM happens-before. In fact, the source path now gives a concrete reason why D0_RETURN cannot be used as a proxy for W1: D0 waits for metadata-log commit, while W1 is a later local application callback that may still be pending.

## Important distinction
This does NOT prove a stale read or vulnerability. It proves the experiment still has a legitimate uncontrolled scheduling window between metadata-log commit/administrative completion and local `aclCache` publication.

That window is precisely what must remain uncontrolled if we want to observe a naturally occurring visibility failure.

## Existing source facts retained
- `StandardAuthorizer.data` is volatile; delta `addAcl/removeAcl` mutate the existing data object rather than reassigning `data`.
- `StandardAuthorizerData.aclCache` is non-volatile and replaced by a new immutable snapshot.
- `MetadataLoader` invokes publishers on its own metadata-loader thread.
- `RequestChannel` uses `ArrayBlockingQueue`; ENQUEUE→DEQUEUE is normal queue publication.
- No artificial latch/volatile/barrier is to be added between W1 and D1.

## Epistemic state
- 🟢 Exact PR #94 harness inspected.
- 🟢 `AclApis.handleDeleteAcls()` waits on authorizer completion stages before responding.
- 🟢 `ClusterMetadataAuthorizer.deleteAcls()` future is tied to controller ACL operation + metadata-log persistence.
- 🟢 `QuorumController.deleteAcls()` routes through `appendWriteEvent` and deferred completion at committed/stable metadata offset.
- 🟢 W1 is a separate MetadataLoader/AclPublisher callback after metadata-log delivery to the broker.
- 🔴 No demonstrated D0_RETURN → W1 edge.
- 🔴 No demonstrated W1 → producer/request admission edge.
- UNKNOWN: whether a stale-read execution is legal/observable on the pinned implementation.
- UNKNOWN: W1 → R1 vulnerability status.
- AB105.116R unchanged.
- AB105.117R not created.
- TLC not rerun.

## DO-NOT-REPEAT
Do not treat D0_RETURN as W1. Do not treat metadata-log persistence as local authorizer publication. Do not treat W1 timestamp < ENQUEUE as happens-before. Do not add a latch/volatile/barrier solely to manufacture W1 → D1 ordering.

## Next audit target
Trace the exact metadata-log delivery path from commit to `MetadataLoader` and compare its scheduling/publication mechanisms with the producer-to-Processor path. The question is now whether any existing Kafka queue/future/volatile operation accidentally creates W1→ENQUEUE or D0→W1 ordering. If none exists, the uncontrolled window is confirmed by architecture.
