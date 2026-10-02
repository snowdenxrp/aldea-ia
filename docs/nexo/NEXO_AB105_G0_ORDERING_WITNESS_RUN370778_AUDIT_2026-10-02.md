# NEXO AB105 G0 — Ordering Witness Run 370778 Audit — 2026-10-02

## Recovery / boundary update

This audit supersedes the Run 370755 tooling-only checkpoint for the *current execution state* without deleting or rewriting that historical record.

Run 370778 is the first recovered execution in this chain that:
- passed harness formatting/checkstyle,
- compiled,
- actually started the real Kafka broker test,
- exercised the real KafkaProducer path,
- produced real NEXO_ORDER runtime events,
- completed all 10 witness cycles successfully,
- and uploaded the raw artifact.

Historical Run 370755 remains preserved as a separate failed tooling boundary.

## Canonical invariants

- AB105.116R: INTACT / DO NOT MODIFY.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- PR #94: draft / unmerged.
- Kafka pin required by experiment: 99b940733a9f6bc409457dba7108f08421d81e42.
- Run 370778 raw evidence reports exactly that Kafka revision.
- Active branch: nexo-ab105-g0-ordering-witness.

## Real Actions execution

Workflow:
- NEXO AB105 G0 ordering witness runner v2
- workflow: .github/workflows/nexo-ab105-g0-ordering-witness-v2.yml
- run: 37077811039
- run number: 76
- head SHA: 557d3cfa00751a9d6c5fab7319f1195df32f4178
- job: 111071502747
- conclusion: success

Artifact:
- id: 11257950614
- name: nexo-ab105-g0-ordering-witness-v2
- digest: sha256:3923654af675e1d44552258785005d7e9ab5e24ae72a91dc41e5e59bf0617476
- created: 2026-10-02T23:33:11Z
- expired: false

Step results:
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

The workflow evidence header reports:
- KAFKA_REV=99b940733a9f6bc409457dba7108f08421d81e42
- DIAGNOSTIC=REAL_BROKER_ORDERING_WITNESS
- TIMING_INSTRUMENTATION=WORKFLOW_LOCAL
- AB105_116R=UNCHANGED
- AB105_117R=NOT_CREATED
- TLC=NOT_RERUN

The runtime log contains actual NEXO_ORDER events. The prior empty-event boundary is therefore closed as a tooling/runtime distinction, not as a scientific conclusion.

## What was fixed to reach runtime

1. The generated Java witness was rewritten into Kafka-compliant formatted source while preserving the experimental logic.
2. Kafka ASF license header was matched exactly enough for Checkstyle.
3. Unused imports were removed.
4. The producer was explicitly given the real cluster bootstrap address through:
   client(cluster.bootstrapServers())
5. The v2 runner no longer commits the generated harness into the local Kafka clone, so git rev-parse HEAD remains the pinned Kafka revision.
6. AB105.116R, AB105.117R, and TLC boundaries remain untouched.

The missing bootstrap.servers failure from the prior runtime attempt is now closed by the producer bootstrap wiring.

## Runtime evidence recovered

The real broker test completed 10 cycles.

Per cycle, the intended behavioral sequence was observed at runtime as:
- A1_SUCCESS: pre-delete Produce succeeds.
- D0_TARGET: the exact target ACL is identified.
- ACL_W1: local ACL cache replacement completion is instrumented.
- D0_RETURN: Admin DeleteAcls call returns.
- DEQUEUE: real Produce request is received by a Kafka request-handler thread.
- AUTH_ENTER: real StandardAuthorizer authorization path is entered.
- AUTH_DECISION: real authorization result is emitted.
- D1_RESULT: post-delete Produce is denied.

The raw runtime also shows two ACL_W1 observations per deletion: one on the controller metadata-loader handler and one on the target broker's metadata-loader handler (thread name contains kafka-0-metadata-loader-event-handler). For the ordering witness, the broker-0 W1 observation is the target local W1.

Observed target-broker examples:
- Cycle 1: broker-0 ACL_W1 precedes D0_RETURN; D0_RETURN precedes DEQUEUE; AUTH_ENTER and AUTH_DECISION follow DEQUEUE.
- Cycle 2: D0_RETURN occurs before broker-0 ACL_W1, and broker-0 ACL_W1 still precedes DEQUEUE.
- The same pattern of target-broker W1 preceding the observed post-delete DEQUEUE is present through the recovered cycles.

Important: timestamps are runtime ordering observations only. They do not, by themselves, establish a Java Memory Model happens-before relation.

## Critical missing evidence

ENQUEUE is currently NOT instrumented in the v2 runner.

The recovered runtime therefore proves the following observed partial chain:
W1 -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION

and separately observes D0_RETURN relative to W1.

It does NOT yet prove:
W1 -> ENQUEUE -> DEQUEUE

because ENQUEUE has no raw event.

R1 is also not emitted as a dedicated correlated event. D1_RESULT is the test-level Producer result after the request, but it currently lacks the request correlationId.

Therefore the full causal target remains OPEN:
D0 -> W1 -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION -> R1

## Current scientific state

- REAL_BROKER_RUNTIME: VERIFIED
- REAL_KAFKA_PRODUCER_PATH: VERIFIED
- CHECKSTYLE_BLOCKER: CLOSED
- COMPILE: VERIFIED
- 10 witness cycles completed: VERIFIED
- ACL_W1 target-broker events: OBSERVED
- DEQUEUE events: OBSERVED
- AUTH_ENTER events: OBSERVED
- AUTH_DECISION events: OBSERVED
- D1_RESULT=DENIED across the 10 test cycles: VERIFIED by successful test completion and raw runtime events
- ENQUEUE: MISSING / UNKNOWN
- R1 dedicated correlation event: MISSING / UNKNOWN
- Full W1 -> ENQUEUE -> DEQUEUE chain: UNKNOWN
- JMM happens-before: UNKNOWN
- Exact race: UNKNOWN
- Exploitability: UNKNOWN

No conclusion about JMM ordering or exploitability is authorized from this run alone.

## Next action

1. Add a workflow-local ENQUEUE probe at the real RequestChannel enqueue point, preserving the existing real broker path and avoiding synchronization/locks.
2. Preserve all current W1, DEQUEUE, AUTH_ENTER, AUTH_DECISION instrumentation.
3. Add correlationId to the test-level R1/D1 result only if it can be obtained without altering the real request path or manufacturing ordering.
4. Re-run the same real-broker witness.
5. Inspect the raw artifact first.
6. Correlate events by correlationId where available.
7. Classify only the evidence actually observed.
8. Do not infer JMM happens-before from timestamp order.
9. Do not use D0_RETURN as a substitute for W1.
10. Persist the next run/job/artifact/digest before interpretation.

## DO-NOT-REPEAT

- Do not repeat the closed Checkstyle investigation.
- Do not treat the missing ENQUEUE event as evidence that no enqueue occurred.
- Do not treat D0_RETURN as W1.
- Do not treat timestamps as JMM happens-before.
- Do not fabricate ENQUEUE or R1 events.
- Do not reintroduce direct-authorize branches.
- Do not modify AB105.116R.
- Do not create AB105.117R.
- Do not rerun TLC.
- Do not merge PR #94.
