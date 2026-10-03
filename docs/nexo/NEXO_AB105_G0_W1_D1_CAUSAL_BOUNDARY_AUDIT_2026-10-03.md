# NEXO AB105 G0 — W1→D1 Causal Boundary Audit — 2026-10-03

Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## New source finding

The AdminClient delete path does NOT directly establish "deleteAcls() completion → target broker ACL_W1" as a same-thread publication edge.

The inspected path is:

AdminClient.deleteAcls()
→ DeleteAcls request
→ controller-side QuorumController.deleteAcls()
→ appendWriteEvent("deleteAcls", ...)
→ AclControlManager.deleteAcls()
→ future completion after the controller operation has been appended/durable according to the ClusterMetadataAuthorizer contract
→ separately, metadata log records are replayed by the broker metadata-loader
→ BrokerMetadataPublisher / AclPublisher
→ StandardAuthorizer.removeAcl()
→ plain aclCache write (instrumented ACL_W1).

The ClusterMetadataAuthorizer contract explicitly describes the delete futures as completing once the relevant delete operation has been called on the controller and ACL deletions have been persisted to the cluster metadata log. It does not state that the target broker's metadata-loader has already replayed the record and executed StandardAuthorizerData.removeAcl().

QuorumController.deleteAcls() delegates through appendWriteEvent and returns its CompletableFuture. The target broker's ACL_W1 is downstream of metadata-log replay, on a separate metadata-loader execution context.

## Why this matters

The real-broker run had cycles 4 and 5 where:

cycle 4:
D0_RETURN = 261920489698
target ACL_W1 = 261920590759

cycle 5:
D0_RETURN = 262028693234
target ACL_W1 = 262029090806

So the observed evidence itself demonstrates that D0_RETURN is not equivalent to target W1.

This is not an anomaly to suppress. It is useful evidence identifying two distinct completion points:

D0_RETURN = controller/Admin future completion boundary
W1 = target broker local metadata application boundary

The experiment therefore correctly exposed propagation lag between them.

## Current causal map

Controller durability:
Admin delete future completion
→ [does NOT by itself prove target W1 has happened]

Target broker:
metadata-log replay
→ MetadataLoader
→ AclPublisher
→ StandardAuthorizerData.removeAcl
→ W1/plain aclCache write

Request:
D1 ENQUEUE
→ ArrayBlockingQueue
→ D1 DEQUEUE
→ StandardAuthorizer.authorize
→ StandardAuthorizerData.authorize
→ plain aclCache read

## What is now demonstrated

🟢 D0_RETURN and target W1 are distinct events.
🟢 Target W1 can occur after D0_RETURN.
🟢 In all 10 observed cycles, target W1 still occurred before D1 DEQUEUE.
🟢 All 10 D1 authorizations were DENIED.
🟢 The real-broker witness reached the intended Kafka code paths.

## What remains UNKNOWN

🔵 Whether there is a JMM happens-before edge from target W1's plain aclCache write to a later D1 request's plain aclCache read.
🔵 Whether stale aclCache can actually be observed after W1.
🔵 Whether any stale observation could produce an incorrect authorization decision.
🔵 Whether any observed behavior generalizes beyond this topology/execution.

## Important experimental consequence

The next witness must NOT define the update completion point as D0_RETURN.

The scientifically relevant marker is target broker ACL_W1.

A stronger race-neutral experiment should:

1. Identify a request that is issued only after direct evidence that target W1 occurred, without inserting a synchronization primitive that itself publishes W1.
2. Keep W1 instrumentation as the observation marker.
3. Avoid using the test thread's receipt of W1 as a latch/volatile signal to gate the request, because that would manufacture a W1→request happens-before edge and defeat the question.
4. Prefer a design where the request is already independently scheduled/in flight, while W1 and the request's authorization race naturally, then classify outcomes by raw event ordering.
5. Preserve all raw timestamps and thread names.

## Do-not-repeat

Do not re-audit the already-established source path unless new evidence changes it.
Do not call D0_RETURN "W1".
Do not call timestamp order a JMM happens-before proof.
Do not add a synchronization gate from the W1 probe to the D1 send.
Do not modify AB105.116R.
Do not create AB105.117R yet.
Do not rerun TLC.
