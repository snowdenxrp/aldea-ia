# NEXO AB105 G0 — Per-thread observation design — 2026-10-03

## Objective
Observe which ACL-cache snapshot the Processor authorization path actually reads, without creating a W1→AUTH publication edge.

## Design
Use thread-confined diagnostic state only during the causal window. W1 records an immutable diagnostic token into state owned by the W1 thread. The authorization path records the identity/reference it already reads from its local aclCache snapshot into state owned by the authorization thread. No shared mutable diagnostic variable is consulted by the authorization path.

After the broker/test finishes, a separate reconciliation step reads the per-thread records and correlates them using request correlation ID / cycle ID and raw timestamps.

## Critical restriction
A thread-local record can identify the observed cache object only if the production read already exposes an identity that can be logged without publishing it to another thread. Do not replace the production plain aclCache with a volatile/atomic holder. Do not add locks, latches, barriers, futures, queues, callbacks, or shared atomics between W1 and authorization.

## Measurement semantics
- W1 token = identity of the new immutable AclCache created by removeAcl, captured on W1 thread.
- AUTH token = identity of the AclCache snapshot already copied by findAclRule, captured on authorization thread.
- Matching tokens are evidence that the authorization read observed that exact cache object.
- A different older token, if observed after W1 temporally, would be direct stale-cache evidence.
- No match/different token alone must not be interpreted without confirming object identity semantics and correlation.

## Neutrality audit requirement
Before execution, verify bytecode/source instrumentation does not alter the field's memory modifiers or add a cross-thread publication edge. Logging/reconciliation must happen after the decision or through thread-confined buffers.

## Frozen state
AB105.116R unchanged.
AB105.117R not created.
TLC not rerun.
PR #94 remains draft/unmerged.

## Epistemic state
Temporal W1 < ENQUEUE < DEQUEUE < AUTH: OBSERVED 10/10.
D1 DENIED: OBSERVED 10/10.
JMM W1→ENQUEUE: UNKNOWN.
Actual cache visibility: UNKNOWN.
Stale read: UNKNOWN.
Incorrect authorization: UNKNOWN.
Security conclusion: NOT_ESTABLISHED.
