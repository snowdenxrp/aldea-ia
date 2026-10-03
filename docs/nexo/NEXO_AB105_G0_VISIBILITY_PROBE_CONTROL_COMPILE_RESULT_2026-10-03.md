# NEXO AB105 G0 — control/experiment compile result — 2026-10-03

## Evidence

Workflow run: 37147244231
Job: 111273615873
Head: 3a81ffbafcc3e2e67754a736dd950e763ad7b928
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

Result: SUCCESS.

- Experiment variant compile: SUCCESS.
- Control variant transform: SUCCESS.
- Control variant compile: SUCCESS.
- Compile evidence artifact uploaded.

## Interpretation

Compile feasibility is closed for both variants.

This does NOT establish:
- JMM happens-before from W1 to AUTH.
- stale-read occurrence.
- stale-read correctness impact.
- exploitability.
- generalization.
- security conclusion.

## Next gate

Audit the runtime harness and environment-mode selection for neutrality, then execute control/experiment real-broker witnesses only after that audit.

AB105.116R remains frozen.
No TLC rerun.
No AB105.117R.
PR #94 remains unmerged.
