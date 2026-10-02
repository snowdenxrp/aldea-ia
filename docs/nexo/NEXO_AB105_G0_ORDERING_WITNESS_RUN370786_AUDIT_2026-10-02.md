# NEXO AB105 G0 — Ordering Witness Run 370786 Audit — 2026-10-02

## Status

This is the strongest recovered ordering-witness result in the current AB105 G0 chain.

Run 370786 reached the real broker, completed the witness, emitted ENQUEUE + DEQUEUE + AUTH events with correlation IDs, and completed all 10 cycles successfully.

The earlier Run 370778 result is preserved and remains valid. Run 370786 extends it by adding the missing real RequestChannel ENQUEUE probe.

## Canonical invariants

- AB105.116R: INTACT / DO NOT MODIFY.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- PR #94: draft / unmerged.
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.
- Raw evidence confirms the pinned Kafka revision.
- Active branch: nexo-ab105-g0-ordering-witness.

## Real Actions execution

Workflow:
- NEXO AB105 G0 ordering witness runner v2
- workflow: .github/workflows/nexo-ab105-g0-ordering-witness-v2.yml
- run: 37078600866
- run number: 79
- head SHA: 29f588a781cd80baf07e2698ccecf221d59ec2d4
- job: 111073954977
- conclusion: SUCCESS

Artifact:
- id: 11257109119
- name: nexo-ab105-g0-ordering-witness-v2
- size: 21615 bytes
- digest: sha256:c606f05b51db3bf7a8f17988bd37e725c7adb1aa9b7fe41c3e0215ed9b5322cc
- expired: false

Steps:
1. checkout: SUCCESS
2. setup-java: SUCCESS
3. pinned Kafka clone: SUCCESS
4. install ordering probes/harness: SUCCESS
5. format ordering harness: SUCCESS
6. compile: SUCCESS
7. execute real broker witness: SUCCESS
8. emit raw evidence: SUCCESS
9. upload evidence: SUCCESS

## Raw evidence identity

The workflow evidence reports:
- KAFKA_REV=99b940733a9f6bc409457dba7108f08421d81e42
- DIAGNOSTIC=REAL_BROKER_ORDERING_WITNESS
- TIMING_INSTRUMENTATION=WORKFLOW_LOCAL
- AB105_116R=UNCHANGED
- AB105_117R=NOT_CREATED
- TLC=NOT_RERUN

## Experimental correction

Run 370778 established real W1 -> DEQUEUE -> AUTH behavior but lacked ENQUEUE.

Run 370786 adds a workflow-local probe at the real RequestChannel.sendRequest() enqueue point:
- ENQUEUE is emitted immediately before requestQueue.put(request)
- only for the real Produce request carrying clientId nexo-g0-ordering
- correlationId and thread are emitted
- no lock, latch, volatile, sleep, or synchronization was added to manufacture ordering

The rest of the witness semantics were preserved.

## Runtime evidence

The recovered raw runtime contains:
- ENQUEUE: observed
- DEQUEUE: observed
- AUTH_ENTER: observed
- AUTH_DECISION: observed
- ACL_W1: observed
- D0_RETURN: observed
- D1_RESULT: observed

There are 10 successful witness cycles.

For each post-delete Produce request, the same correlationId is present across:
- ENQUEUE
- DEQUEUE
- AUTH_ENTER
- AUTH_DECISION

The recovered post-delete request correlation IDs are:
41, 43, 45, 47, 49, 51, 53, 55, 57, 59.

The runtime parser confirms that, for all 10 cycles:
W1(target broker) < ENQUEUE < DEQUEUE < AUTH_ENTER < AUTH_DECISION < D1_RESULT

where:
- W1(target broker) is the ACL_W1 event from kafka-0-metadata-loader-event-handler.
- D1_RESULT is emitted immediately after the real KafkaProducer send(...).get() returns false/denied for the post-delete request.
- D1_RESULT is therefore a client-test result boundary, but it is not itself correlated to the request correlationId.

The exact numeric timestamps are preserved in the raw artifact. They are observational ordering evidence only.

## D0 versus W1

D0_RETURN is deliberately kept separate from W1.

The 10 cycles include both observed relations:
- In most cycles, target-broker W1 occurs before D0_RETURN.
- At least one cycle (cycle 7) shows D0_RETURN before target-broker W1.

This is important evidence against treating D0_RETURN as a substitute for W1.

Despite that variation, the target-broker W1 event occurs before the post-delete ENQUEUE in all 10 observed cycles.

Cycle 7 is the clearest witness:
D0_RETURN < W1 < ENQUEUE < DEQUEUE < AUTH_ENTER < AUTH_DECISION < D1_RESULT

Therefore the experiment now has direct runtime evidence that Admin DeleteAcls completion can precede target-broker local ACL-cache completion, while the subsequent real Produce request in this run was enqueued only after the target-broker W1 event.

## Current scientific classification

Observed in all 10 cycles:
- W1 < ENQUEUE: OBSERVED
- ENQUEUE < DEQUEUE: OBSERVED
- DEQUEUE < AUTH_ENTER: OBSERVED
- AUTH_ENTER < AUTH_DECISION: OBSERVED
- AUTH_DECISION < D1_RESULT: OBSERVED
- ENQUEUE/DEQUEUE/AUTH correlationId continuity: OBSERVED
- D0_RETURN <=> W1: NOT FIXED; BOTH ORDERS OBSERVED

Therefore the strongest supported classification is:

🟢 OBSERVED:
W1 -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION -> D1_RESULT

with the qualification that this is runtime timestamp/event ordering, not a Java Memory Model happens-before proof.

D0 -> W1 remains variable/implementation-timing dependent in the 10 observed cycles and must not be collapsed into D0 -> W1.

## What is NOT established

- Java Memory Model happens-before: UNKNOWN.
- A formal proof that W1 publication is synchronized-with the subsequent request path: UNKNOWN.
- Generalization from 10 cycles to all executions/configurations: UNKNOWN.
- Exploitability/security impact: UNKNOWN.
- A dedicated client-side R1 event carrying the request correlationId: NOT INSTRUMENTED.

The observed D1_RESULT is a real client-test boundary after KafkaProducer.send(...).get(), but it lacks direct correlationId.

## Historical preservation

Run 370755 remains the tooling-only failure boundary:
- run 37075546029
- job 111064511478
- artifact 11255704659
- digest sha256:a98881b62424e29159553f43654edca8d52b62fb022e508010e572482e218e95
- no runtime NEXO_ORDER events

Run 370778 remains the first successful real-broker runtime boundary:
- run 37077811039
- job 111071502747
- artifact 11257950614
- digest sha256:3923654af675e1d44552258785005d7e9ab5e24ae72a91dc41e5e59bf0617476

Do not overwrite either historical record.

## Next action

The G0 ordering witness has now produced the requested real runtime ordering evidence.

Next research step is NOT to declare JMM causality or exploitability. Instead:

1. Preserve this result as the current G0 empirical witness.
2. Analyze whether the observed Kafka implementation establishes a real memory/publication edge between target-broker W1 and RequestChannel ENQUEUE/DEQUEUE.
3. Inspect the exact producer/request/metadata publication mechanisms involved.
4. Separate implementation evidence from runtime observations.
5. If needed, perform a bounded repeat with the same instrumentation only to test stability; do not silently change the experiment.
6. Keep JMM HAPPENS-BEFORE and exploitability UNKNOWN until separately evidenced.

## DO-NOT-REPEAT

- Do not repeat the closed Checkstyle investigation.
- Do not remove ENQUEUE instrumentation.
- Do not treat D0_RETURN as W1.
- Do not infer JMM happens-before from timestamps.
- Do not claim exploitability from this witness alone.
- Do not fabricate a correlated R1 event.
- Do not reintroduce direct-authorize branches.
- Do not modify AB105.116R.
- Do not create AB105.117R.
- Do not rerun TLC.
- Do not merge PR #94.
