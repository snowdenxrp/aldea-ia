# NEXO AB105 G0 — latency audit v1 checkpoint

- Branch: nexo-ab105-g0-latency-audit-v1
- PR: #96 (draft, diagnostic-only)
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
- AB105.116R: unchanged
- AB105.117R: not created
- TLC: not rerun
- No W1-derived synchronization, latch, barrier, volatile handoff, Future gate, callback, or manufactured publication signal.

## Real-broker v2 witness — run 37098764557

- Manual `workflow_dispatch` successfully created a real job: 111133973894.
- Head SHA: 4026db554b617243c13de7f881b98473852aee7b.
- Artifact: `nexo-ab105-g0-ordering-witness-v2`, artifact id 11265332252.
- Artifact SHA-256: d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c.
- Raw evidence contains 10 complete cycles and 10/10 D1 `DENIED` results.
- The real broker executed the ordering witness; this is not a zero-job/provisioning failure.
- For every cycle, two `ACL_W1` events were emitted (one per broker metadata-loader handler) before the D1 result.
- D1 `DENIED` occurred in all 10 cycles; no post-W1 `ALLOWED` was observed.

## Timing correction / interpretation

- Earlier prose using only the last `ACL_W1` understated the full propagation-to-D1 interval because there are two broker-side `ACL_W1` events per cycle.
- First-ACL_W1 → D1 intervals (ms): 14.704, 12.472, 9.730, 12.844, 9.959, 9.490, 10.372, 9.233, 9.631, 10.090; mean 10.853 ms.
- Last-ACL_W1 → D1 intervals (ms): 10.698, 9.325, 7.263, 8.297, 7.834, 8.106, 7.891, 7.329, 7.371, 8.576; mean 8.269 ms.
- The two W1 events may straddle `D0_RETURN` in some cycles because the two broker metadata-loader threads progress independently. This is expected evidence about propagation ordering and must not be collapsed into a single W1 timestamp.

## Epistemic result

- 🔵 CONTROL REPRODUCED: clean v2 real-broker witness completed 10/10 cycles.
- 🔵 STALE-READ/ALLOWED AFTER W1: NOT OBSERVED in this 10-cycle sample.
- 🔵 This run does NOT prove stale-read impossibility, global linearizability, or universal safety. It only establishes the observed outcome under this exact topology, Kafka revision, timing, and harness.
- 🔵 The next investigation should compare this successful witness against prior real-broker evidence and isolate which environmental/control-path difference explains any earlier behavior. Do not modify the Java/Kafka experiment before that comparison.

## DO-NOT-REPEAT

- Do not treat zero-job workflow failures as Kafka evidence.
- Do not modify AB105.116R.
- Do not create AB105.117R yet.
- Do not rerun TLC yet.
- Do not add W1-derived synchronization.
- Do not remove D1 `send(...).get(10s)` for this diagnostic.
- Do not summarize two broker W1 events as one global W1 timestamp.
- Preserve prior real-broker evidence as separate evidence; do not overwrite it with this control.

## Next action

Perform a structured comparison of run 37098764557 against the prior completed real-broker witness(es): Kafka revision, workflow commit, harness source, ACL mutation path, broker count/roles, event ordering, and timing. Identify the minimal discriminating variable before creating any new experimental revision.
