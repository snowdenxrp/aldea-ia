# NEXO AB105 G0 latency audit v1 — producer prewarm

Date: 2026-10-03

## Base

- Parent: `3bc9d5b74e52e127131c6ce7ba8b0c0e5c5dd335`
- Branch: `nexo-ab105-g0-latency-audit-v1`
- Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`
- AB105.116R: unchanged
- AB105.117R: not created
- TLC: not rerun

## Change

Added exactly one pre-experiment producer metadata warmup:

`producer.partitionsFor(TOPIC_NAME);`

It occurs after producer construction and before cycle 1.

No W1 observation, latch, barrier, volatile publication, Future gate, callback, sleep, or W1-derived signal was added.

The existing D1 operation remains unchanged:

`producer.send(...).get(10, TimeUnit.SECONDS)`

Therefore this revision does not change D1 result semantics. It only attempts to remove first-use producer metadata/network cold-start effects before the measured cycles.

## Intended interpretation

The existing witness showed W1→D1 ENQUEUE in 10/10 cycles, but usually with a 50–64 ms interval and 8.66 ms at the tightest observed cycle. This variant tests whether producer metadata warmup materially reduces that interval while preserving the same broker-side probes.

Primary measurement remains:

**target-broker W1 → D1 ENQUEUE**

Secondary sequence:

**D0_RETURN → ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION → D1_RESULT**

## Epistemic status

- 🟢 Experimental isolation: one-file, two-line change from PR #95 head.
- 🟢 No W1-derived synchronization.
- 🟢 D1 confirmation semantics preserved.
- 🔵 Execution/evidence: PENDING.
- 🔵 Whether producer metadata warmup materially shortens W1→ENQUEUE: UNKNOWN.
- 🔵 Stale-read manifestation: UNKNOWN.
- 🔴 No vulnerability conclusion.

## Do-not-repeat

Do not remove `.get()` in this variant.
Do not add a W1 gate or any synchronization derived from W1.
Do not modify AB105.116R.
Do not create AB105.117R.
Do not rerun TLC.
Do not treat branch existence or commit creation as execution evidence.
