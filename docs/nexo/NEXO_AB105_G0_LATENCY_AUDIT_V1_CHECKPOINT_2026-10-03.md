# NEXO AB105 G0 — latency audit v1 checkpoint

- Branch: nexo-ab105-g0-latency-audit-v1
- PR: #96 (draft, diagnostic-only)
- HEAD before checkpoint: 59d4f2c660a8bbf51552563e03d05310bb2a27d1
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
- Experimental change: producer.partitionsFor(TOPIC_NAME) before cycle 1.
- D1 send(...).get(10s) remains unchanged.
- No W1-derived synchronization, latch, barrier, volatile handoff, Future gate, callback, or TLC rerun.
- AB105.116R unchanged; AB105.117R not created.
- Execution status: no workflow run/status observed for HEAD through GitHub connector.
- Important: absence of a run is execution infrastructure state, not experimental evidence.
- DO-NOT-REPEAT: do not treat prior run 370790/370814 artifacts as evidence for this branch; do not infer stale-read absence/presence; do not modify AB105.116R; do not create AB105.117R; do not rerun TLC.
- Next: obtain a real Actions execution for PR #96 without changing the Java experiment or manufacturing synchronization.
- 2026-10-03 correction: workflow harness restored from 59d4f2c…; only latency-branch push trigger added; no valid execution from the temporary corrupt placeholder state.
