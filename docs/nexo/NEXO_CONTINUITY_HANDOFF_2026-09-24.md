# NEXO — CONTINUITY HANDOFF / PERSISTENT CONTEXT

Date: 2026-09-24
Status: RESEARCH + CLEAN ARCHITECTURE DESIGN ONLY
Implementation: BLOCKED. No V21. No runtime construction until research, distillation, gap audit and evidence/observability closure gates are complete.

[Existing canonical handoff content preserved through AB105.043R]

## AB105.043R-CORRECTION — CI runner wording tightened
Review of commit cc6e238962da7fc4c4376bb3dfcf9dc8d9c9ff66 found no corruption in the AB105.043R commit itself. The underlying workflow files do prove that the repository DEFINES GitHub Actions jobs using `runs-on: ubuntu-latest` and Java 21 setup. They do NOT by themselves prove that a runner is currently executing, that Actions is enabled for this repository, or that the required Kafka harness can execute there. Therefore the phrase “CI_RUNNER=AVAILABLE_IN_REPO” is too strong if read as an execution observation.

Corrected epistemic interpretation:
- WORKFLOW_RUNNER_DECLARATION=CONFIRMED
- JAVA_SETUP_DECLARATION=CONFIRMED
- ACTIVE_RUNNER_EXECUTION=NOT_OBSERVED
- KAFKA_HARNESS_WORKFLOW=NOT_PRESENT
- KAFKA_RUNTIME=NOT_EXECUTED
- EXACT_RACE=UNKNOWN
- EXPLOITABILITY=UNKNOWN
- MODEL_ANCHOR=AB105.116R_UNCHANGED

## AB105.044R — CI execution now directly observed, but not Kafka G0
A fresh GitHub Actions API check found run `36869796501` for `nexo-deterministic-tests.yml`, triggered by the AB105.043R correction commit. Its job `tests` reached `Set up job`, `Checkout`, `Node.js`, and `Install` successfully before `Run tests` failed. This directly proves that a GitHub Actions runner executed this repository workflow. It does NOT prove that the TLC workflow ran, that a Kafka checkout exists in CI, or that the G0 harness can execute.
Status: ACTIVE_CI_EXECUTION=OBSERVED; REPO_RUNNER=CONFIRMED; KAFKA_G0_RUNNER=NOT_ESTABLISHED; KAFKA_RUNTIME=NOT_EXECUTED; EXACT_RACE=UNKNOWN.

## AB105.045R — G0 CI path remains unimplemented
The existing observed CI runner is currently used by repository workflows, but no existing workflow checked out Apache Kafka or implemented the frozen G0 wrapper protocol. Therefore the next implementation step, if chosen, is a dedicated temporary/external Kafka harness path; this must not be conflated with the already observed deterministic-test runner.
Status: CI_RUNNER=EMPIRICALLY_CONFIRMED; KAFKA_HARNESS=NOT_PRESENT; G0=NOT_EXECUTED; EXACT_RACE=UNKNOWN; EXPLOITABILITY=UNKNOWN; MODEL_ANCHOR=AB105.116R_UNCHANGED.

## AB105.046R — Runner availability is now proven, scope is not
The observed run proves the repository can execute GitHub Actions jobs on a hosted runner. The evidence is limited to the deterministic persistence workflow: checkout, Node setup, install, and test execution all occurred. It cannot be generalized to the unimplemented Kafka G0 job.
Status: HOSTED_RUNNER=PROVEN; KAFKA_JOB=NOT_PROVEN; GENERALIZED_EXECUTION=PROHIBITED; EXACT_RACE=UNKNOWN.

## AB105.047R — Failure is unrelated to Kafka race
The observed CI run failed specifically at the existing `npm test` step after setup and dependency installation. No Kafka code, Kafka checkout, authorizer wrapper, ACL operation, or G0 synchronization point was involved. Therefore this failure is neither positive nor negative evidence about the Kafka race.
Status: CI_FAILURE=DETERMINISTIC_TEST_WORKFLOW_ONLY; KAFKA_EVIDENCE=NONE; EXACT_RACE=UNKNOWN.

## AB105.048R — No silent promotion of CI capability
The corrected record must distinguish three states: repository workflow declaration, actual execution of an existing workflow, and execution capability for the new Kafka G0 harness. Only the first two are currently evidenced.
Status: WORKFLOW_DECLARATION=CONFIRMED; EXISTING_WORKFLOW_EXECUTION=CONFIRMED; KAFKA_G0_EXECUTION_CAPABILITY=NOT_ESTABLISHED.

## AB105.049R — Next implementation question narrowed
The next useful investigation is no longer whether GitHub Actions can execute at all. It is whether a dedicated temporary CI job can safely obtain/build the required Kafka revision and run the frozen G0 harness without modifying the canonical Nexo model or fabricating evidence.
Status: NEXT=KAFKA_G0_CI_FEASIBILITY; MODEL_ANCHOR=AB105.116R_UNCHANGED; EXACT_RACE=UNKNOWN.
