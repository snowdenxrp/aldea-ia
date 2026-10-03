# NEXO AB105 G0 — latency audit v1 checkpoint

- Branch: nexo-ab105-g0-latency-audit-v1
- PR: #96 (draft, diagnostic-only)
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
- AB105.116R: unchanged
- AB105.117R: not created
- TLC: not rerun
- Experimental Java change remains only: producer.partitionsFor(TOPIC_NAME) before cycle 1; D1 send(...).get(10s) unchanged.
- No W1-derived synchronization, latch, barrier, volatile handoff, Future gate, callback, or manufactured publication signal.

## Actions provisioning finding — 2026-10-03

- Runs 91–96 on this latency branch were created by push and immediately completed failure.
- Run 37092570675 (HEAD 0e4502c…) reports failure with 0 jobs.
- Commit 0e4502c… reports 0 check-runs and 0 commit statuses.
- The workflow file at 0e4502c… contains jobs.ordering-witness and the complete preserved harness; no placeholder remains.
- Historical control: run 37081442555 on the ordering branch created job 111082635995 and completed successfully.
- Runs 37084348946, 37081441577, and 37081417811 also have 0 jobs, so the zero-job failure is not unique to the latency Java experiment.
- GitHub’s official incident history records an Actions Job Delays incident on 2026-10-01 involving degraded hosted-runner performance/upstream throttling; it was resolved, so this is contextual evidence only, not proof of the current cause.
- Current epistemic status: 🔵 Actions provisioning/execution infrastructure failure remains the active blocker; no experimental evidence was produced by runs 91–96.
- 🔴 Do not classify these failed zero-job runs as Kafka/test failures.

## DO-NOT-REPEAT

- Do not modify Kafka harness to solve the Actions provisioning problem.
- Do not modify AB105.116R.
- Do not create AB105.117R.
- Do not rerun TLC.
- Do not treat branch commits, zero-job workflow runs, or failed provisioning as experimental evidence.
- Do not infer stale-read presence/absence from runs 91–96.
- Do not add W1-derived synchronization.
- Preserve prior real-broker evidence from runs 370790/370814 as the separate completed witness; it is not evidence for this latency branch.

## Next action

Isolate GitHub Actions infrastructure/provisioning versus repository-specific configuration using non-experimental evidence only. Obtain a real job execution before interpreting the latency experiment.
