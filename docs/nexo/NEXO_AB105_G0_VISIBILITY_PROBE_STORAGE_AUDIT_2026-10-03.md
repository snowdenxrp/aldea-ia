# NEXO AB105 G0 — Visibility probe storage audit — 2026-10-03

Pinned source confirms the production read is a local snapshot:

`AclCache aclCacheSnapshot = aclCache;`

The same snapshot is passed to both `checkSection` calls. The class itself is documented as not thread-safe.

## Storage decision

Do NOT use a shared collection, volatile field, AtomicReference, synchronized block, latch, barrier, Future, queue, or shared PrintStream/System.err during the causal window.

The probe must capture only locally available state after the production read. A thread-confined record is acceptable only if its publication/reconciliation happens after the measured authorization window.

## Important boundary

The broker process is separate from the test process. Therefore a naive ThreadLocal-only design is insufficient for final artifact extraction: the test must eventually receive broker-local records. Any transport used while the race is active could itself create the synchronization being measured.

Therefore the next design step is NOT implementation. First identify a broker-local capture mechanism whose publication can be delayed until after all relevant D1 authorization calls have completed, or establish that the current harness cannot extract such records without adding a causal edge.

## Status

🟢 Exact read site verified.
🟢 Snapshot semantics verified.
🟢 Shared diagnostic transport rejected.
🔵 Safe cross-process post-window extraction UNKNOWN.
🔴 No visibility conclusion.

Frozen: AB105.116R unchanged; no AB105.117R; no TLC; no workflow run.
