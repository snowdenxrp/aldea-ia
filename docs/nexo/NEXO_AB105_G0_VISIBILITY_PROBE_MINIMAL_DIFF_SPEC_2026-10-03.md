# NEXO AB105 G0 — Visibility probe minimal diff specification — 2026-10-03

## Purpose
Define the smallest instrumentation change before touching the Kafka source/workflow.

## Probe point
Immediately after the production statement:

`AclCache aclCacheSnapshot = aclCache;`

Capture only the already-read reference identity in authorization-thread-owned diagnostic storage. The production `aclCache` field remains a plain field and the production read remains unchanged.

## W1 side
Immediately after the production assignment that installs the new immutable cache, capture the new cache reference identity in W1-thread-owned diagnostic storage. No other thread may read this value during the causal window.

## Correlation
The two records are reconciled only after the broker/test window closes. Correlation must use an existing cycle/request identifier or independently recorded immutable metadata; it must not require a shared diagnostic object consulted by AUTH.

## Forbidden implementation shortcuts
- no volatile/AtomicReference replacement of `aclCache`;
- no synchronized block around either production statement;
- no CountDownLatch/barrier/Future/queue from W1 to AUTH;
- no shared logger/PrintStream as causal transport;
- no sleep used as synchronization;
- no test-side direct authorization call;
- no change to the real network D1 path.

## Acceptance criteria
1. Production read/write statements remain semantically identical except for a side-effect-free diagnostic capture after the operation.
2. Diagnostic capture cannot affect authorization control flow.
3. No diagnostic state is read by another thread before the decision completes.
4. Reconciliation occurs after the causal window.
5. Ambiguous/missing identity remains UNKNOWN.

## Execution status
SPECIFICATION ONLY. No Kafka source has been modified by this commit. No workflow run is authorized yet.

Frozen: AB105.116R unchanged; AB105.117R not created; TLC not rerun; PR #94 unmerged.
