# NEXO AB105 G0 — Visibility probe neutrality audit — 2026-10-03

## Finding
The first proposed visibility experiment needs one correction before implementation: logging the W1 event and authorization-read event through the same System.err/PrintStream must NOT be used to infer visibility. The shared stream can introduce synchronization and alter scheduling, especially if the authorization read is followed by a synchronized logging operation.

## Safe measurement boundary
A visibility witness must avoid a shared synchronization primitive between the W1 thread and the authorization thread before the authorization decision is complete.

Preferred design:
- capture the authorization thread's already-computed local ACL snapshot identity using thread-local/append-only diagnostic state;
- capture W1 on its own thread-local/append-only diagnostic state;
- do not use a shared volatile/atomic/lock/queue/Future to publish W1 to the authorization thread;
- reconcile the two streams only after the broker/test has completed, from outside the causal window;
- preserve raw timestamps/thread IDs/correlation IDs separately.

## Hard limit
Even a neutral observation of snapshot identity would show what the authorization path actually read, but absence of stale reads would still be NOT_OBSERVED, not proof of impossibility. A stale read that produces ALLOWED would be much stronger evidence, but the experiment must first establish that the instrumentation itself does not create the missing publication edge.

## Current state
W1 < ENQUEUE < DEQUEUE < AUTH temporally: OBSERVED 10/10.
D1 DENIED: OBSERVED 10/10.
JMM W1 -> ENQUEUE: UNKNOWN.
Stale read: UNKNOWN.
Security conclusion: NOT_ESTABLISHED.

Frozen: AB105.116R unchanged; AB105.117R not created; TLC not rerun; PR #94 unmerged.

Next: design the neutral per-thread observation mechanism and audit it before any execution.
