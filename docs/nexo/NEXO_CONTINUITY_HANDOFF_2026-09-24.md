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


## AB105.052R — G0 completeness review and semantic tightening

A full cross-check was performed against the historical execution-readiness freeze AB104.951R-960R and the later concrete harness-source chain AB104.803R-829R. No missing G0 prerequisite was found. The recovered contract covers the previously frozen requirements:

- isolated non-combined target broker and per-server wrapper precedence;
- controller Authorizers left unwrapped;
- broker/Authorizer initialization and readiness before traffic;
- baseline ACL creation, propagation, target authorization ALLOW, leader/partition readiness and baseline log offset;
- exact A1 barrier after the delegated authorization decision;
- D0 as the Admin/DeleteAcls control-plane completion boundary;
- D1 as an independent fresh target-broker DENY after deletion publication/observation;
- release only after D1;
- D2 as continuation through the unmodified real Produce→ReplicaManager/append path;
- E as separate client result plus target-broker log-end/effect evidence;
- isolation from unrelated writers;
- raw evidence capture and bounded cleanup;
- any missing/contradictory step => UNKNOWN/non-witness.

Semantic tightening: the earlier compact wording D0=committed/published ACL deletion is potentially ambiguous because “published to the target broker” belongs to the D1 freshness condition, not to the controller completion witness alone. The frozen contract is therefore interpreted as:
D0 = controller/metadata-log DeleteAcls completion;
D1 = target-broker local authorization observes the deletion and returns DENIED.
No D0 claim may be upgraded into broker-global freshness.

Additional audit conclusion: AB104.951R-960R and AB104.803R-829R together close the known design/readiness dependencies without proving runtime behavior. No source fact is being promoted to an execution result. No harness code has yet been executed. AB105.116R remains untouched.

Status: G0_COMPLETENESS_REVIEW=PASSED_WITH_D0_CLARIFICATION; MISSING_G0_PREREQUISITE=NOT_FOUND_IN_AUDITED_CHAIN; G0_CONTRACT=FROZEN; RUNTIME=NOT_EXECUTED; EXACT_RACE=UNKNOWN; EXPLOITABILITY=UNKNOWN; AB105.116R=INTACT.

### EXACT NEXT ACTION

AB105.053R — implement the smallest temporary Kafka G0 harness exactly against the frozen checklist, then compile/run the sanity gate only. Capture raw evidence for every prerequisite before permitting A1/D0/D1. Do not infer race results from compilation, startup, baseline ALLOW, or D0 alone.


## AB105.053R — First executable Kafka bootstrap path created

The first implementation step is now concrete and isolated from the canonical Nexo model. A dedicated branch `nexo-ab105-g0-bootstrap` was created from main, and workflow `.github/workflows/nexo-ab105-g0-bootstrap.yml` was added there.

The workflow:
- uses `ubuntu-latest`;
- installs Java 21 with Temurin;
- clones Apache Kafka at pinned revision `99b940733a9f6bc409457dba7108f08421d81e42`;
- records the exact Kafka revision and JVM/Gradle versions;
- compiles Kafka test infrastructure and metadata test sources;
- uploads raw bootstrap evidence;
- explicitly records `G0_RUNTIME=NOT_EXECUTED` and `EXACT_RACE=UNKNOWN`.

This is intentionally a bootstrap gate, not the G0 race harness. No A1/D0/D1 operation is executed and no race conclusion can be produced by this workflow.

Important execution status: the GitHub API currently returns no workflow run associated with the bootstrap commit yet. Therefore the workflow's existence is proven, but its execution is NOT proven. No success/failure is inferred from the absence of a run.

Status: BOOTSTRAP_WORKFLOW=CREATED_ON_ISOLATED_BRANCH; KAFKA_REV_PINNED=YES; JAVA21_BOOTSTRAP=DECLARED; BOOTSTRAP_RUNTIME=NOT_OBSERVED; G0_HARNESS=NOT_IMPLEMENTED; G0_RUNTIME=NOT_EXECUTED; EXACT_RACE=UNKNOWN; AB105.116R=INTACT.

### DO-NOT-PROMOTE
Do not treat the workflow file, Kafka checkout, Java setup, compilation command, or missing workflow-run record as evidence that Kafka G0 executed. The next observation must come from an actual workflow run and its raw logs/artifact.


## CONTINUITY SAFEGUARD — AB105.053R onward

For the next chat, recover from this handoff before doing any Nexo/Kafka work. Do not rely on conversational memory.

Canonical anchor remains `AB105.116R` and MUST NOT be modified or silently superseded.

Current Kafka G0 state:
- G0 completeness review: PASSED_WITH_D0_CLARIFICATION.
- Frozen G0 tuple: `A1 → D0 → D1 → D2 → E`.
- `D0` means controller/metadata-log DeleteAcls completion; it is NOT broker-global freshness.
- `D1` is an independent fresh authorization call on the target broker that returns DENIED after deletion is observed locally.
- Only the complete tuple is a race witness.
- Partial/contradictory/missing evidence remains UNKNOWN/non-witness.
- `EXACT_RACE=UNKNOWN`.
- `EXPLOITABILITY=UNKNOWN`.
- `G0_RUNTIME=NOT_EXECUTED`.

AB105.053R bootstrap:
- Dedicated branch: `nexo-ab105-g0-bootstrap`.
- Workflow: `.github/workflows/nexo-ab105-g0-bootstrap.yml`.
- Bootstrap commit: `9ee816706e9a12a9540ee7441e9db7dcc8d0e6ef`.
- Kafka source pinned to `99b940733a9f6bc409457dba7108f08421d81e42`.
- Workflow declares ubuntu-latest + Temurin Java 21, records JVM/Gradle, compiles Kafka test infrastructure, and uploads raw bootstrap evidence.
- This workflow is intentionally NOT the G0 race harness.
- GitHub API currently showed `workflow_runs=[]` for that bootstrap commit. Therefore execution is NOT OBSERVED; do not infer success/failure.
- Continuity persistence commit on main: `bd6b812b602b8dcb5969da998f76654b29b4fb5b`.

Evidence boundary:
- Workflow existence, source checkout, Java setup declaration, compilation commands, or absence of a workflow run are NOT runtime evidence.
- Do not claim bootstrap success until an actual Actions run and raw logs/artifact are observed.
- Do not implement/interpret A1/D0/D1 until bootstrap prerequisites are observed.
- If bootstrap fails, preserve the exact failure as evidence and diagnose before changing anything.
- If bootstrap succeeds, capture the raw artifact/logs and only then proceed to the smallest temporary G0 harness.

Kafka source anchors reviewed:
- KafkaClusterTestKit provides real in-process BrokerServer/ControllerServer instances.
- Kafka settings include test-common:test-common-runtime and metadata modules.
- StandardAuthorizer behavior/source was reviewed, but source inspection does not establish the runtime race.
- No source fact has been promoted to runtime execution evidence.

Next exact action:
1. Query the actual GitHub Actions run for the bootstrap workflow/branch.
2. If a run exists, inspect job status and raw logs/artifact.
3. Record exact result in continuity.
4. Only after a successful bootstrap gate, implement the minimal isolated G0 harness against the frozen checklist.
5. Preserve UNKNOWN/PENDING and do not modify AB105.116R.

DO-NOT-REPEAT:
- Do not redo the AB104.951R–AB104.960R completeness audit unless new contradictory evidence appears.
- Do not treat D0 as equivalent to D1.
- Do not infer race/exploitability from compilation, startup, baseline ALLOW, ACL deletion completion, or source inspection.


## CONTINUITY CORRECTION — AB105.053R numbering collision discovered

A repository audit during continuation found that main also contains a separate commit `108fa0360f0f856561e2cff1b6424e7e5a79beb0` titled `docs(nexo): save AB105.053R partial execution rollback audit`, concerning CloudFormation. This means the label `AB105.053R` is not globally unique across concurrent research tracks.

DO NOT overwrite, rename, or silently collapse either track.

For Kafka, use the explicit working discriminator:
`AB105.053R-KAFKA-G0-BOOTSTRAP`
until a canonical sequence decision is made.

The Kafka bootstrap branch remains:
`nexo-ab105-g0-bootstrap`

Kafka bootstrap workflow:
`.github/workflows/nexo-ab105-g0-bootstrap.yml`

Kafka bootstrap commit:
`9ee816706e9a12a9540ee7441e9db7dcc8d0e6ef`

Observed state on latest check:
- branch exists;
- workflow file exists;
- GitHub API returned no workflow run for the bootstrap commit;
- therefore execution remains NOT OBSERVED;
- no compile success/failure is asserted;
- no Kafka G0 runtime execution occurred;
- EXACT_RACE remains UNKNOWN;
- EXPLOITABILITY remains UNKNOWN.

The CloudFormation AB105.053R track is preserved as an independent research track and must not be used as evidence for Kafka G0.

NEXT KAFKA ACTION:
1. Re-check whether a GitHub Actions run now exists for the Kafka bootstrap branch/commit.
2. If absent, do not fabricate execution; diagnose only the CI trigger/status path.
3. If present, inspect raw job steps/logs/artifacts before changing the workflow.
4. Only after an observed successful bootstrap gate proceed to the minimal G0 harness.


### AB105.053R-KAFKA-G0-BOOTSTRAP — trigger audit

Rechecked commit `9ee816706e9a12a9540ee7441e9db7dcc8d0e6ef` on branch `nexo-ab105-g0-bootstrap`.
- `fetch_commit_workflow_runs` => `workflow_runs=[]`
- `get_commit_combined_status` => `statuses=[]`
- Branch and workflow file are present.
- Workflow declares `push` for `nexo-ab105-g0-bootstrap` plus `workflow_dispatch`.
- Therefore no runtime execution is observed and no bootstrap result may be promoted.
- GitHub documentation confirms push workflows can run from non-default branches, so the empty run list is not itself evidence of successful or failed execution. citeturn0search3turn0search5
- Current diagnosis: CI trigger/execution path is unresolved; investigate before altering the Kafka harness.
- Do NOT interpret empty status as pass, skip, compile failure, or runner failure.
- G0_RUNTIME=NOT_EXECUTED; EXACT_RACE=UNKNOWN; EXPLOITABILITY=UNKNOWN.

Next exact action: inspect repository Actions/trigger state with available GitHub evidence and determine why this specific push produced no recorded run; only then choose the smallest trigger-safe correction.


### AB105.053R-KAFKA-G0-BOOTSTRAP — trigger diagnosis update

Additional audit:
- Repository metadata: default branch is `main`; Actions are not shown as repository-archived/disabled at repository level.
- The Kafka workflow contains both `push` on `nexo-ab105-g0-bootstrap` and `workflow_dispatch`.
- GitHub documentation states a push workflow can run from a non-default branch when the workflow file exists in the event ref, so branch isolation alone does not explain the empty run list. citeturn0search6turn0search9
- GitHub documentation also states events caused by the repository `GITHUB_TOKEN` do not create new workflow runs, except `workflow_dispatch` and `repository_dispatch`. citeturn0search0turn0search1
- We do NOT have sufficient evidence to identify the credential/mechanism used to create commit `9ee8167...`; therefore the `GITHUB_TOKEN` explanation is recorded only as a LEADING HYPOTHESIS, not a confirmed cause.
- No manual dispatch tool is exposed in the current GitHub tool surface. Therefore we do not claim a dispatch was attempted.
- No workflow/job/artifact evidence exists for this commit.
- Status remains: `BOOTSTRAP_RUNTIME=NOT_OBSERVED`, `G0_RUNTIME=NOT_EXECUTED`, `EXACT_RACE=UNKNOWN`, `EXPLOITABILITY=UNKNOWN`.

Decision boundary:
Do not alter Kafka source/harness based on the missing run. The next safe action is to establish an observable Actions trigger path (prefer an explicit workflow dispatch if/when the available GitHub interface supports it) or otherwise create a trigger-safe CI change, then inspect the resulting raw run before promoting any bootstrap result.


### AB105.053R-KAFKA-G0-BOOTSTRAP — decisive trigger finding

The CI trigger audit is now narrowed:
- GitHub workflow syntax explicitly states `workflow_dispatch` only receives events when the workflow file is on the **default branch**. The bootstrap workflow exists only on isolated branch `nexo-ab105-g0-bootstrap`, while repository default is `main`. citeturn0search5turn0search10
- Therefore the presence of `workflow_dispatch` in the isolated-branch workflow did NOT provide a usable manual-dispatch path.
- The `push` trigger remains theoretically valid for a push event whose workflow file is present in that ref. GitHub describes this event-to-workflow resolution explicitly. citeturn0search11
- However, the observed commit still has `workflow_runs=[]` and `statuses=[]`. We do not know whether commit creation used `GITHUB_TOKEN`, so the documented token suppression remains a possible explanation, not a proven cause. citeturn0search0turn0search3
- No Kafka code or G0 semantics were changed.

DECISION:
The isolated bootstrap branch is not sufficient to establish an observable manual trigger. The smallest safe next step is to put a trigger-capable copy of the bootstrap workflow on `main` (without executing Kafka G0), then use an observable Actions trigger path and inspect the resulting raw run. Do not promote compilation/runtime evidence until that run exists.

Status:
BOOTSTRAP_TRIGGER_DIAGNOSIS=PARTIALLY_RESOLVED
BOOTSTRAP_RUNTIME=NOT_OBSERVED
G0_RUNTIME=NOT_EXECUTED
EXACT_RACE=UNKNOWN
EXPLOITABILITY=UNKNOWN
