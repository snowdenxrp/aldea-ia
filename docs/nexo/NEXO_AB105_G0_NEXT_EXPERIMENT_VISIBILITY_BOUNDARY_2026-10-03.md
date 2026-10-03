# NEXO AB105 G0 — Next experiment boundary — 2026-10-03

Source-only audit is now closed at the Selector/Processor boundary.

## New experiment question
Can a real broker ever authorize a D1 request using an ACL state older than the target broker's observed ACL_W1, without the witness introducing a synchronization edge from W1?

## Required distinction
The existing v2 result proves temporal ordering (W1 < ENQUEUE < DEQUEUE < AUTH) in 10/10 cycles, but not JMM visibility. The next experiment must therefore target the observation itself: capture the ACL state/version used by the authorization read on the Processor thread and compare it against the target-broker W1 event, while preserving the independent network path.

## Design constraints
- No latch, CountDownLatch, Future, volatile flag, barrier, or callback waiting on W1.
- No test-side direct call to target.authorize().
- Keep D1 as a real network request.
- Do not treat D0_RETURN as W1 completion.
- Capture raw event order and the authorization snapshot identity/version.
- If no stale observation occurs, classify it as NOT_OBSERVED, not impossible.
- If instrumentation itself changes publication/visibility semantics, discard the run as non-neutral.

## Frozen state
AB105.116R unchanged.
AB105.117R not created.
TLC not rerun.
PR #94 not merged.

## Immediate implementation audit
Before running anything, inspect whether instrumentation of the authorization read can be made observational only. A write/read probe that adds volatile synchronization or shared mutable state is prohibited. Prefer logging immutable values already read by the production code, or per-thread append-only output that does not participate in control flow.

## Epistemic state
W1 temporal ordering: OBSERVED 10/10.
D1 DENIED: OBSERVED 10/10.
JMM W1 -> ENQUEUE: UNKNOWN.
Stale read: UNKNOWN.
Incorrect authorization: UNKNOWN.
Security conclusion: NOT_ESTABLISHED.
