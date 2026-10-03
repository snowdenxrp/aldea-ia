# NEXO AB105 G0 — W1→ENQUEUE Source Audit Advancement — 2026-10-03

## State
AB105.116R unchanged. AB105.117R not created. TLC not rerun. PR #94 draft/not merged. Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## New pinned-source findings
1. MetadataLoader at the pinned commit explicitly owns a KafkaEventQueue and states that it maintains its own thread for all publisher callbacks. The current metadata image is accessed only from that event-queue thread.
2. The target ACL update therefore remains on the MetadataLoader publisher execution context.
3. SocketServer at the pinned commit creates a separate data-plane RequestChannel and Processor-based network path. Startup authorizer futures only control when request processing may start.
4. The Authorizer contract/startup future is a startup readiness boundary. It does NOT establish a per-ACL-update W1→later-D1 publication edge after the broker is already serving requests.
5. Exact pinned StandardAuthorizer.java still has volatile data, but removeAcl() delegates to data.removeAcl(id) without replacing the volatile data reference.
6. Exact pinned StandardAuthorizerData.java states the class is not thread-safe; aclCache is a plain non-volatile reference. removeAcl() replaces that reference with the new immutable AclCache. Authorization later reads the same plain reference.
7. No concrete pre-existing lock/volatile/queue/future edge from the MetadataLoader W1 write to D1 request publication has been established in this pass.

## Important nuance
The pinned StandardAuthorizer comment says it uses a read-write lock, but the inspected StandardAuthorizerData path does not itself expose such a lock, and the relevant W1 write remains a plain aclCache assignment. We do NOT infer a lock that is not present in the inspected code.

## Scientific status
- W1 thread/path: identified.
- D1 Processor publication path: identified.
- Startup publication: identified but irrelevant to post-start per-update visibility.
- W1→ENQUEUE JMM happens-before: UNKNOWN.
- D1 visibility of W1: UNKNOWN.
- stale read: UNKNOWN.
- incorrect authorization consequence: UNKNOWN.
- vulnerability: NOT_DECLARED.

## Next exact target
Trace the concrete RequestChannel enqueue implementation and any synchronization used by the Processor path, then inspect whether that primitive has any causal predecessor connected to MetadataLoader. Stop at the first actual synchronization edge. If none is found, preserve UNKNOWN; do not convert absence of an observed edge into a proof of no happens-before.

## Constraints
No W1-gated request. No artificial latch/volatile/future/barrier. No timestamp-as-JMM inference. No D0_RETURN=W1. No AB105.117R. No TLC rerun. No repeat of v2 without a new hypothesis.
