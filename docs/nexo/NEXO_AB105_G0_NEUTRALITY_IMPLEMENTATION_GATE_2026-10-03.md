# NEXO AB105 G0 — Neutrality implementation gate — 2026-10-03

## Gate
Before modifying the frozen witness workflow, the probe implementation must satisfy all of the following:

- Production field semantics remain unchanged: no volatile/atomic replacement of aclCache.
- W1 observation is local to the W1 execution path and is not read by the authorization path.
- AUTH observation is local to the authorization execution path and captures the snapshot already selected by the production code.
- No shared PrintStream/System.err is used as the causal transport for W1↔AUTH evidence.
- No latch, barrier, Future, queue, synchronized block, or explicit cross-thread diagnostic publication is introduced between W1 and AUTH.
- Reconciliation occurs only after the broker/test causal window closes.
- Raw timestamps, thread identity, cycle/request correlation, and decision result remain independently recorded.
- A missing or ambiguous observation remains UNKNOWN rather than being converted to a negative result.

## Current decision
IMPLEMENTATION NOT YET AUTHORIZED. The next action is source-level inspection of the exact cache-read site and the safest thread-confined capture mechanism before any workflow edit or run.

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
Security conclusion: NOT_ESTABLISHED.
