# NEXO AB105 G0 — visibility workflow startup diagnosis

Date: 2026-10-03

## Evidence
- Runtime validation workflow run 37152504624, commit 36ce16196d683bc00b47b8b72a20d872028f1ff9: SUCCESS with job 111275870604.
- Visibility witness run 37152553984, commit a84075f44b81472b39a804c077d93177cf213eb7: FAILURE, jobs endpoint returned 0 jobs.
- Visibility witness run 37152503323, commit 36ce16196d683bc00b47b8b72a20d872028f1ff9: FAILURE, jobs endpoint returned 0 jobs.
- Ordering witness shows the same zero-job failure pattern.
- The visibility witness workflow contains a normal jobs/steps structure; the malformed JAAS Java string is inside a run step and therefore cannot explain a run that never materializes a job.
- Minimal witness workflow added on branch did not produce a corresponding run from its push commit, so it is not accepted as runtime evidence.

## Interpretation
GitHub creates workflow runs but no runner job is materialized for the witness/ordering workflows. Therefore the failure is pre-runner and is not evidence about Kafka, Java, JAAS, ACL visibility, or the probe.

GitHub documentation states that workflow runs contain check suites/check runs for jobs; zero jobs means there is no step-level execution evidence. Invalid workflow files can also produce failed runs before job execution.

## State
AB105.116R = FROZEN
AB105.117R = NOT_CREATED
TLC = NOT_RERUN
REAL_VISIBILITY_WITNESS = NOT_EXECUTED
EXPERIMENT_VS_CONTROL = NOT_EXECUTED

## Next action
Do not alter the Java harness. Isolate the GitHub Actions control-plane/workflow registration issue using an already registered workflow path or a repository-level Actions configuration check. If the exact startup cause cannot be retrieved from the available GitHub API, preserve UNKNOWN rather than assigning a YAML/Java cause.
