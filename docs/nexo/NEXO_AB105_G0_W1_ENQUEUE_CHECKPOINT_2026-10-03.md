# NEXO AB105 G0 — W1→ENQUEUE Investigation Checkpoint — 2026-10-03

## Canonical state
- Active anchor: AB105.116R — UNCHANGED
- AB105.117R: NOT_CREATED
- TLC: NOT_RERUN
- PR #94: draft / not merged
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## New investigation pass
Question: whether target-broker ACL_W1 (plain StandardAuthorizerData.aclCache write) has a real pre-existing JMM synchronization/publication path to D1 request publication (Processor -> RequestChannel ENQUEUE).

Confirmed:
1. MetadataLoader.handleCommit queues metadata work onto its KafkaEventQueue; publisher callbacks execute from that loader event context.
2. AclPublisher.onMetadataUpdate applies ACL changes and calls ClusterMetadataAuthorizer.removeAcl; target W1 is therefore on the metadata-loader path.
3. SocketServer Processor constructs the request and calls requestChannel.sendRequest(req); D1 ENQUEUE is on the network Processor path.
4. RequestChannel uses ArrayBlockingQueue for request publication/consumption, giving the known ENQUEUE→DEQUEUE synchronization boundary.
5. No concrete pre-existing W1→ENQUEUE synchronization edge was established in this pass.
6. Startup readiness/futures only establish that authorizer metadata is ready before request processing begins; they do not provide a per-update W1→later-request publication edge after startup.
7. Current source/context confirms the Authorizer contract treats ACL updates as asynchronous; this does not itself prove or disprove the JMM edge.

## Critical distinction
- W1 is a plain write to StandardAuthorizerData.aclCache.
- StandardAuthorizer.data is volatile, but removeAcl() does not replace the data object through that volatile field.
- D1 authorization later performs an ordinary read of aclCache.
- Therefore the exact visibility edge remains unresolved.

## Evidence status
🟢 Real broker W1 observed.
🟢 W1 < D1 DEQUEUE temporal ordering: 10/10.
🟢 D1 DENIED: 10/10.
🟢 W1 field/write site identified.
🟢 W1 thread/path identified.
🟢 D1 Processor publication path identified.
🟢 ENQUEUE→DEQUEUE synchronization boundary identified.
🔵 W1→ENQUEUE JMM happens-before: UNKNOWN.
🔵 D1 visibility of new aclCache: UNKNOWN.
🔵 stale-read manifestation: UNKNOWN.
🔵 incorrect authorization consequence: UNKNOWN.
🔴 vulnerability/security conclusion: NOT_DECLARED.

## Experimental prohibition
Do NOT add latch, volatile handoff, CountDownLatch, barrier, Future completion gate, or equivalent W1-observation signal that gates D1 issuance. That could manufacture the edge under investigation.
Do NOT treat System.nanoTime() ordering as happens-before.
Do NOT treat D0_RETURN as target W1.
Do NOT repeat v2 or modify AB105.116R unless a new experimental question is justified.

## Next exact target
Inspect only naturally shared synchronization/publication between MetadataLoader and Processor/request publication. Stop at the first real edge if found. If none exists, design a race-neutral witness that does not gate D1 on W1 observation.

## Sources/context consulted
- Exact pinned Kafka source findings already persisted in NEXO_AB105_G0_W1_ENQUEUE_CAUSAL_EDGE_INVESTIGATION_2026-10-03.md
- MetadataLoader source: eventQueue.append in handleCommit
- AclPublisher source: onMetadataUpdate applies ACL deltas
- SocketServer source: Processor -> requestChannel.sendRequest(req)
- Authorizer contract: ACL updates are asynchronous
- Current web source inspection is contextual only; exact pinned evidence remains the canonical basis.
