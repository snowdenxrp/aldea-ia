# NEXO AB105 G0 — latency diagnostic next gate — 2026-10-03

## Current frozen state
- AB105.116R = FROZEN / unchanged
- AB105.117R = NOT_CREATED
- TLC = NOT_RERUN
- PR #94 = draft / unmerged
- Visibility witness workflow diagnosis = zero-job / control-plane boundary; no runtime evidence from that workflow

## New bounded diagnostic branches discovered
### PR #95 — visibility sample v3
Diagnostic-only 100-cycle extension. No W1-derived synchronization. Execution status remains unaccepted unless a real workflow run and raw artifact exist.

### PR #96 — latency audit v1
Branch: `nexo-ab105-g0-latency-audit-v1`
Parent: `3bc9d5b74e52e127131c6ce7ba8b0c0e5c5dd335`
Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`
Change: one producer metadata prewarm call, `producer.partitionsFor(TOPIC_NAME);`, before cycle 1.
D1 remains `producer.send(...).get(10, TimeUnit.SECONDS)`.
No W1 gate/latch/barrier/volatile/Future/callback/sleep or W1-derived signal.

## Why this is the correct bounded next question
The preserved 10-cycle witness showed W1→ENQUEUE in all cycles, but generally with tens of milliseconds of interval. Producer prewarm tests whether first-use producer/network cold-start effects are inflating that interval, without changing the causal boundary under investigation.

Primary measurement remains:
`target-broker W1 → D1 ENQUEUE`

A successful run could narrow the timing envelope. It cannot by itself prove JMM happens-before or a stale read.

## Execution status
PR #96 documentation explicitly marks execution/evidence as PENDING. No branch/commit existence is treated as runtime evidence.

## Stop conditions
Do not:
- add synchronization derived from W1;
- remove D1 `.get()` in this variant;
- modify AB105.116R;
- create AB105.117R;
- rerun TLC;
- declare a vulnerability from timing alone.

Next action: if a real workflow run exists for PR #96, inspect its jobs/artifact; otherwise leave the diagnostic PENDING rather than fabricate execution.
