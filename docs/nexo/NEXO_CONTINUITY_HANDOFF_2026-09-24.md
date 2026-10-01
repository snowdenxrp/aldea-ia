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


## AB105.050R — G0 contract recovered from historical canonical audit

The exact G0 contract was not missing from the historical audit; it was hidden behind the current handoff's compact placeholder. Historical commits AB104.807R, AB104.820R, AB104.827R and AB104.828R recover the frozen pre-race and witness protocol without inventing any new semantics.

Recovered contract:
1. Isolated non-combined KafkaClusterTestKit; target broker receives the test-only Authorizer wrapper; controller Authorizers remain unwrapped.
2. Topic is created and the target WRITE ACL is installed; normal ACL propagation/visibility is witnessed.
3. Baseline target authorization is ALLOWED and target partition/leader readiness is established; baseline target log-end offset is captured.
4. A1 = the real target Produce authorization call returns ALLOW and is then held at the wrapper barrier, after the delegated decision. The wrapper must not block initialization or metadata publication.
5. D0 = Admin DeleteAcls operation completes at the controller/metadata-log control-plane boundary. D0 is not D1.
6. D1 = an independent fresh authorization call against the target broker returns DENIED after the deletion has been published/observed. D1 must not be inferred from Admin completion or describeAcls absence.
7. Only after D1 is observed is A1 released.
8. D2 = the original Produce continues through Kafka's real authorization-to-ReplicaManager/append path; no production append-path interception is required.
9. E = capture both the Produce result and an independent target-broker UnifiedLog/logEndOffset witness, with the topic/partition isolated from unrelated writers.

Interpretation is frozen: only the complete A1→D0→D1→D2→E tuple is a race witness. Missing/contradictory/partial steps remain UNKNOWN/non-witness. The source audit does not establish an executed race.

Status: G0_CONTRACT=RECOVERED; G0_CHECKLIST=FROZEN; EXACT_RACE=UNKNOWN; EXPLOITABILITY=UNKNOWN; AB105.116R=INTACT.

## AB105.051R — Historical contract recovery closes the previous blocker

The prior blocker “G0 contract not located” is now resolved as a retrieval problem, not a semantic gap. No new Kafka behavior was inferred. The recovered contract is directly traceable to the historical audit chain and is consistent with the later frozen checklist in AB104.957R-960R.

The next evidence-producing step is therefore no longer contract recovery: it is the smallest real Kafka harness implementation/build attempt in the observed GitHub Actions execution path, preserving the frozen contract and without changing AB105.116R.

Status: CONTRACT_RECOVERY=RESOLVED; HARNESS_IMPLEMENTATION=NEXT; RUNTIME=NOT_EXECUTED; EXACT_RACE=UNKNOWN.
