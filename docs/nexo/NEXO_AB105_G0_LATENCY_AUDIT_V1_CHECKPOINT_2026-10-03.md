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

- Runs on workflow 373324571 repeatedly fail before job creation.
- Latest run 37092763654 (HEAD 607ed60…) = failure, 0 jobs.
- Prior run 37092570675 (HEAD 0e4502c…) = failure, 0 jobs.
- The workflow content at 607ed60… and 0e4502c… is byte-for-byte identical (18,414 chars). Therefore the repeated zero-job failure persisted without any workflow-file change between those two runs.
- Run 37092531074 at 170b6843… also failed with 0 jobs.
- The same workflow ID also recorded failures on the visibility-sample and latency branches with 0 jobs.
- Historical control: run 37081442555 on the separate ordering-witness-v2 workflow created job 111082635995 and completed successfully.
- The successful control used workflow ID 373334522, while the failing workflow is ID 373324571. Both expose an ordering-witness job on ubuntu-latest; the current failing workflow also contains the prewarm and two-branch push trigger.
- Current evidence therefore isolates the blocker to the failing workflow/event processing path more strongly than to the Kafka experiment itself, but does not identify the exact GitHub-side cause.
- GitHub documentation states that a workflow run normally has a check suite/check run for each job; GitHub also documents workflow-file validity and trigger configuration as first-line troubleshooting areas. See GitHub Actions troubleshooting documentation.
- GitHub’s availability history documents prior Actions incidents where workflows failed to start because of Actions infrastructure capacity; this is contextual only and does not prove the present cause.
- Current epistemic status: 🔵 pre-job Actions provisioning/workflow-specific execution blocker; exact root cause UNKNOWN.
- 🔴 Do not classify these failed zero-job runs as Kafka/test failures.

## DO-NOT-REPEAT

- Do not modify Kafka harness to solve the Actions provisioning problem.
- Do not modify AB105.116R.
- Do not create AB105.117R.
- Do not rerun TLC.
- Do not treat branch commits, zero-job workflow runs, or failed provisioning as experimental evidence.
- Do not infer stale-read presence/absence from these runs.
- Do not add W1-derived synchronization.
- Do not remove D1 send(...).get(10s) for this diagnostic.
- Preserve prior real-broker evidence from runs 370790/370814 as the separate completed witness; it is not evidence for this latency branch.

## Next action

Continue non-experimental isolation of the failing workflow path against the successful v2 control. Prefer metadata/configuration comparison; obtain a real job before interpreting latency results.

## Strong control — same commit, different workflow identity

- Workflow 373324571 also failed on ordering branch commit a3aaae3a7839b2ab079b90991231fd42f622e2f1 (run 37084348946) with 0 jobs.
- The same exact commit a3aa… successfully executed earlier under workflow 373334522 (run 37081442555), creating job 111082635995 and completing the real-broker witness.
- Therefore the zero-job failure cannot be attributed to the Java experiment, producer prewarm, latency branch, or that commit’s source tree. The discriminating variable is the workflow/event path, with exact GitHub-side root cause still UNKNOWN.
- This materially strengthens 🔵 workflow/control-plane isolation and further forbids interpreting the failing runs as Kafka evidence.

## Workflow registration / default-branch control

- main contains the known-good `.github/workflows/nexo-ab105-g0-ordering-witness-v2.yml` (workflow ID 373334522) and does NOT contain `.github/workflows/nexo-ab105-g0-ordering-witness.yml`.
- The latency branch contains both workflow files. The failing workflow is therefore branch-only; the known-good v2 workflow is default-branch registered.
- GitHub's documented trigger model says it searches workflow files in the commit/ref for the event, while some event types additionally require the workflow file on the default branch. The observed event here is push, so this is a hypothesis to test, not a confirmed root cause.
- Crucially, current workflow 373324571 has never produced a job in the observed sample; v2 has produced a real job. This makes workflow registration/identity a stronger candidate than YAML step content.
- No change made to the Kafka experiment or AB105.116R. Status remains 🔵 exact GitHub-side root cause UNKNOWN.
