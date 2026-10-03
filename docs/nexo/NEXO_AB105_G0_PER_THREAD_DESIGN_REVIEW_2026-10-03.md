# NEXO AB105 G0 — Per-thread design review — 2026-10-03

## Review result
The proposed identity comparison is useful, but a ThreadLocal token cannot be compared across W1 and AUTH threads during the causal window without transferring data. Any transfer mechanism introduced before AUTH could itself become a possible publication edge.

Therefore each execution path must record independently, and reconciliation must happen only after the causal window. The production authorization path must never consult the W1 record.

## Observation target
Capture the actual AclCache object identity already present in the authorization thread's local snapshot when findAclRule begins. Separately capture the identity of the new cache immediately after W1. Reconcile after the request completes.

## Interpretation
Both observations occur in the same broker JVM, so object identity comparison is valid there.

- AUTH sees W1's exact cache object after W1 temporally: direct visibility observation.
- AUTH sees an older cache object after W1 temporally: direct stale-read observation, subject to exact event/correlation validation.
- AUTH sees the new object: does not prove a universal JMM happens-before edge.

## No artificial synchronization
No W1 signal may be waited on by D1. No volatile publication of the diagnostic token. No synchronized block around the probe. No latch, barrier, Future, or queue used to communicate W1 to AUTH.

## Frozen state
AB105.116R unchanged; AB105.117R not created; TLC not rerun; PR #94 unmerged.

## Status
Design review PASSED after correcting the cross-thread-record issue.