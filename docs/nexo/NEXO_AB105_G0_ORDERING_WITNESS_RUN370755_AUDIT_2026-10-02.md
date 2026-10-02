# NEXO AB105 G0 — Ordering Witness Run 370755 Audit — 2026-10-02

## Recovery note
This record supersedes the earlier checkpoint that stopped at "execution pending". A real Actions execution now exists and reached the real-broker execution step, but the test task failed before broker runtime because Kafka test Checkstyle rejected the generated witness test.

## Canonical invariants
- AB105.116R: INTACT / DO NOT MODIFY.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- PR #94: draft / unmerged.
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.
- Active ordering branch at audit time: nexo-ab105-g0-ordering-witness.
- Branch HEAD: ac0b56ed10eff4820f15076942e854c564a214d2.
- Commit message: fix(nexo): normalize ordering harness for Kafka checkstyle.

## Real Actions execution
Workflow:
- NEXO AB105 G0 ordering witness runner v2
- workflow file: .github/workflows/nexo-ab105-g0-ordering-witness-v2.yml
- run: 37075546029
- run number: 68
- event: push
- head SHA: ac0b56ed10eff4820f15076942e854c564a214d2
- job: 111064511478
- conclusion: failure

Step boundary:
1. checkout: success
2. setup-java: success
3. pinned Kafka clone: success
4. Install ordering probes and harness: success
5. Format ordering harness: success
6. Compile: SUCCESS
7. Execute real broker witness: FAILURE
8. Emit raw evidence: success
9. Upload evidence: success

Therefore:
- installation is VERIFIED for this run.
- compilation is VERIFIED for this run.
- real-broker witness execution is NOT VERIFIED.
- no broker witness result was produced.

## Exact execution blocker
The uploaded log shows:
Task :server:checkstyleTest FAILED.

The failure is in:
server/src/test/java/org/apache/kafka/server/NexoG0OrderingWitnessTest.java

The log reports 105 Checkstyle errors. They are formatting/style violations such as:
- WhitespaceAround
- WhitespaceAfter
- OneStatementPerLine
- RightCurly
- LeftCurly

Representative failures occur on compact one-line methods/statements around lines 45-69.

Important distinction:
- This is NOT a Kafka ordering result.
- This is NOT evidence of the race.
- This is NOT evidence that W1 or R1 occurred.
- The generated test did compile successfully; the later :server:test task invokes test Checkstyle and fails before the test executes.

## Raw artifact
Artifact:
- id: 11255704659
- name: nexo-ab105-g0-ordering-witness-v2
- digest: sha256:a98881b62424e29159553f43654edca8d52b62fb022e508010e572482e218e95

The raw evidence file contains:
KAFKA_REV=99b940733a9f6bc409457dba7108f08421d81e42
DIAGNOSTIC=REAL_BROKER_ORDERING_WITNESS
TIMING_INSTRUMENTATION=WORKFLOW_LOCAL
AB105_116R=UNCHANGED
AB105_117R=NOT_CREATED
TLC=NOT_RERUN

The NEXO_ORDER event section is EMPTY.

Interpretation:
NEXO_ORDER raw events are NOT OBSERVED because the test never reached runtime.

## What changed before run 370755
Commit ac0b56e introduced:
- import textwrap
- textwrap.dedent() for the extracted Java harness
- Collection<AclBinding> correction
- formatting step: ./gradlew --no-daemon :server:spotlessApply

The workflow still extracts the witness Java from:
.github/workflows/nexo-ab105-g0-ordering-witness.yml

The extracted source contains many compact one-line Java constructs. Despite the Spotless step reporting success, the generated test remained Checkstyle-invalid when :server:test ran. This must be treated as a harness-formatting/path issue, not as scientific evidence.

## Scientific state
The intended causal witness remains:
D0 -> W1 -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION.

Definitions remain:
- D0 = external Admin DeleteAcls completion.
- W1 = target broker local completion of StandardAuthorizerData.removeAcl() after immutable AclCache replacement.
- ENQUEUE = real request enters RequestChannel.
- DEQUEUE = KafkaRequestHandler receives request.
- AUTH_ENTER = real StandardAuthorizer.authorize() entry.
- AUTH_DECISION = real authorization decision.

Current:
ORDERING_WITNESS_INSTALL=VERIFIED_FOR_RUN_370755
ORDERING_WITNESS_COMPILE=VERIFIED_FOR_RUN_370755
ORDERING_WITNESS_RUNTIME=NOT_OBSERVED
NEXO_ORDER_RAW_EVENTS=NOT_OBSERVED
W1_TO_R1=UNKNOWN
JMM_HAPPENS_BEFORE=UNKNOWN
EXACT_RACE=UNKNOWN
EXPLOITABILITY=UNKNOWN

## Historical evidence preserved
Do not replace the following with this failed execution:
- real-RPC behavioral base run 36969192502/job 110719406205, commit 96aee422286b5602c3f188736e1910c1017112ab, artifact 11210977168, digest sha256:b0e6ae6499b76f1de0363805a58ae45635b9d661b169cb6338893338d2e31c54. It used real KafkaProducer D1 but direct authorization instrumentation was not RequestChannel ordering evidence.
- PR #84 run 36943032652/job 110638707860: real KafkaProducer path, authorization callback observed, R1 callback absent, repeated TOPIC_AUTHORIZATION_FAILED; W1->R1 remained UNKNOWN.
- Cache identity and authorize snapshot diagnostics remain overlap observations only; no post-return ALLOWED was established.
- Direct TARGET.authorize() branches remain rejected for ordering evidence.

## Exact next action
1. Correct the generated witness test formatting so :server:test can pass Checkstyle.
2. Preserve the real broker path and all NEXO_ORDER instrumentation unchanged in meaning.
3. Re-run the corrected ordering workflow.
4. If the test reaches runtime, inspect raw NEXO_ORDER artifact first.
5. Correlate ENQUEUE/DEQUEUE/AUTH_ENTER/AUTH_DECISION by correlationId.
6. Classify ordering only after raw events are recovered.
7. Never infer JMM happens-before from timestamps.
8. Never use D0 as a substitute for W1.
9. Persist run/job/artifact IDs and digest before interpretation.
10. Do not modify AB105.116R, create AB105.117R, rerun TLC, or merge PR #94.

## DO-NOT-REPEAT
- Do not repeat closed cache/snapshot/timing diagnostics.
- Do not treat this Checkstyle failure as a broker result.
- Do not treat compile success as runtime success.
- Do not fabricate NEXO_ORDER events.
- Do not revive direct-authorize branches as ordering evidence.
