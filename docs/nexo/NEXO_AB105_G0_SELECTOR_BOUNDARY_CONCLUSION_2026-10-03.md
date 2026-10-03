# NEXO AB105 G0 — Selector boundary conclusion — 2026-10-03

Pinned Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42.

## Source audit result
SocketServer confirms each data-plane Acceptor owns Processor threads, each with its own Selector. Request reception is performed by the Processor path and then published through RequestChannel.sendRequest().

The inspected SocketServer lifecycle synchronization protects SocketServer lifecycle/configuration state. The authorizer futures in enableRequestProcessing are startup gates only. No per-request or per-ACL-update synchronization originates from MetadataLoader W1.

The Selector/network path therefore does not reveal a synchronization primitive that can be promoted into a W1 -> ENQUEUE happens-before edge.

## Important conclusion
This is not proof that no implementation-level synchronization exists anywhere below the socket stack; it is a bounded source audit of the concrete SocketServer/Processor boundary. The evidence is sufficient to stop speculative source inference here rather than invent an edge.

Known:
- MetadataLoader W1 is on a different execution path/thread.
- Processor receives the network request and calls RequestChannel.sendRequest().
- RequestChannel publication gives ENQUEUE -> DEQUEUE synchronization.
- v2 harness does not wait for W1.
- W1 < ENQUEUE was temporally observed 10/10.

Still UNKNOWN:
- W1 -> ENQUEUE JMM happens-before.
- W1 -> authorization ordinary-read visibility.
- stale read.
- incorrect authorization.
- exploitability/generalization/production impact.

NOT ESTABLISHED: vulnerability or JMM violation.

Frozen: AB105.116R unchanged; AB105.117R not created; TLC not rerun; PR #94 unmerged.

Next boundary: stop source-only inference and design the next experiment around directly distinguishing temporal ordering from visibility, without adding a W1 synchronization gate. This must be a new experiment, not a replay of v2.
