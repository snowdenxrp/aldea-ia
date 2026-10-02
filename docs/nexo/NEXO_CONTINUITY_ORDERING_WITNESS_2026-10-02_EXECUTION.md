# Ordering witness execution continuity — 2026-10-02

## Current anchor
- AB105.116R: UNCHANGED.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- PR #94: DRAFT / NOT MERGED.
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## Execution findings
A push trigger was successfully created and GitHub Actions created run 37042461065 for .github/workflows/nexo-ab105-g0-ordering-witness.yml on head da0afd8e76a03e5e42c369b9c4557d59f90a1908.

Run status: COMPLETED / FAILURE.
The GitHub jobs endpoint returned ZERO jobs for the failed run, so no step log and no NEXO_ORDER artifact were produced.

Therefore:
- No W1/ENQUEUE/DEQUEUE/R1 ordering result exists.
- No scientific interpretation is permitted.
- Failure cause remains UNKNOWN at the Actions execution layer.

## Source-level audit found while preparing the rerun
The witness Java heredoc in PR #94 refers to AclBindingFilter and AccessControlEntryFilter without imports. This is a real source-level defect in the draft harness, but it has NOT been proven to be the cause of run 37042461065 because the run exposed no jobs/logs.

A separate v2 workflow was added on the feature branch, but GitHub did not execute that newly-added workflow from the branch; a later push retriggered the existing ordering workflow instead. Do not treat v2 as executed.

## Important methodological boundary
The desired witness remains:
D0 -> W1 -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION.

D0 is not W1.
A timestamp ordering is diagnostic only and does not itself establish cache visibility.
Do not repeat cache-identity or authorize-snapshot diagnostics.

## Branch-only trigger/diagnostic commits
- 6674f4b02464388098f7836232f7eb3847932c83 — trigger commit.
- 1d52b2c482e5ead0428454d47af27b7d7245743d — v2 workflow draft.
- da0afd8e76a03e5e42c369b9c4557d59f90a1908 — follow-up trigger.
- 7eea87b8942109d36bbdf2af22d071e459e298f3 — workflow-local adapter attempt; not consumed by the existing workflow.
- 85752b2a425a95da6b92afdb3557b888c5ebb393 — workflow-local adapter attempt; not consumed by the existing workflow.

These are diagnostic branch history only and do not change AB105.116R.

## Next action
Obtain an execution path that can actually run a corrected witness workflow. The correction must be made to the executable workflow/harness, then obtain raw NEXO_ORDER evidence. Do not infer the ordering from failed/no-job runs.
