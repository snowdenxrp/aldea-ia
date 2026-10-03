# NEXO AB105 G0 — Minimal AUTH snapshot probe specification — 2026-10-03

## Exact source result
At the pinned Kafka revision, `findAclRule()` performs one field read:

`AclCache aclCacheSnapshot = aclCache;`

Both subsequent `checkSection(...)` calls receive that same local reference. The authorization path therefore has a clean single observation point.

## Probe requirement
The probe must capture the identity of `aclCacheSnapshot` immediately after the existing production read, without changing the read itself or publishing W1 information to AUTH.

Allowed:
- local variable/reference observation;
- immutable per-execution diagnostic record owned by the AUTH execution path;
- post-window reconciliation.

Forbidden:
- volatile/atomic replacement of `aclCache`;
- locks or synchronized blocks around the read;
- W1 latch/barrier/Future/queue;
- AUTH reading any W1 diagnostic state;
- shared PrintStream/System.err as causal transport;
- changing control flow based on the diagnostic value.

## W1 side
Independently record the identity of the cache object immediately after the production W1 assignment. Do not expose that record to AUTH during the race.

## Reconciliation
After the broker/test causal window closes, correlate W1 and AUTH records by cycle/request identity and compare object identity within the same target JVM. The reconciliation code must never execute before the authorization decision is complete.

## Interpretation
Older AUTH object after W1: direct stale-cache observation if event correlation is valid.
New AUTH object: direct observation of visibility for that execution, but not a universal JMM proof.
Missing/ambiguous identity: UNKNOWN.

## Frozen
AB105.116R unchanged; AB105.117R not created; TLC not rerun; PR #94 unmerged.
