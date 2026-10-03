# NEXO CONTINUITY — AB105 G0 Real Broker Ordering Witness Checkpoint — 2026-10-03

Canonical repo: snowdenxrp/aldea-ia
Active anchor: AB105.116R — DO NOT MODIFY
AB105.117R: NOT_CREATED
TLC: NOT_RERUN
PR #94: draft / not merged
Kafka: 99b940733a9f6bc409457dba7108f08421d81e42

## Latest successful execution

Workflow run: 37081442555
Job: 111082635995
Head: a3aaae3a7839b2ab079b90991231fd42f622e2f1
Artifact: 11259107051
Artifact digest: sha256:28a379f313bc30c169125a67138bdc8dd7f58be0bfd857c22a1f446f58bcc4ef

Result: SUCCESS.
The real-broker ordering witness executed 10 cycles and emitted raw NEXO_ORDER events.

## Core evidence

For every cycle, the target broker (kafka-0) emitted ACL_W1 before the D1 request reached DEQUEUE/AUTH_ENTER/AUTH_DECISION.

Therefore:
TARGET_W1 < D1_DEQUEUE < D1_AUTH_ENTER < D1_AUTH_DECISION
was observed temporally in 10/10 cycles.

D1 result was DENIED in 10/10 cycles.

Important nuance:
- cycles 1,2,3,6,7,8,9,10: target W1 timestamp was before D0_RETURN;
- cycle 4: target W1 was 101,061 ns after D0_RETURN;
- cycle 5: target W1 was 397,572 ns after D0_RETURN.

This proves why D0_RETURN cannot substitute for target W1. The direct W1 probe is the correct anchor.

## Epistemic boundary

Observed:
- real Kafka broker;
- real StandardAuthorizer;
- real metadata-loader target W1;
- real RequestChannel ENQUEUE/DEQUEUE;
- real authorization entry/decision;
- 10/10 D1 DENIED.

Not demonstrated:
- a general JMM happens-before theorem from W1 to ENQUEUE;
- stale visibility impossibility;
- stale-read absence under all executions;
- exploitability;
- generalization;
- production security impact.

System.nanoTime() gives temporal comparison, not JMM happens-before.

RequestChannel's ArrayBlockingQueue provides synchronization/publication from ENQUEUE to DEQUEUE, but the remaining scientific question is whether W1 itself is causally ordered before ENQUEUE by an actual synchronization edge or only appears earlier in this execution.

## Next action

Audit the W1→ENQUEUE boundary directly:
1. trace the deleteAcls/request completion path only far enough to identify whether the test thread/network send has a happens-before edge from target broker W1;
2. do not use D0_RETURN as a substitute for W1;
3. do not add a latch/volatile gate/barrier to manufacture the edge;
4. preserve raw artifact and exact timestamps;
5. keep AB105.116R untouched, AB105.117R uncreated, TLC unreren.

Result document:
docs/nexo/NEXO_AB105_G0_REAL_BROKER_ORDERING_WITNESS_RESULT_2026-10-03.md
Commit: 0120ee041852017a80ecc16788bb00f76c778fe4

DO-NOT-REPEAT:
- Do not call temporal W1<ENQUEUE a JMM theorem.
- Do not call D0_RETURN W1.
- Do not discard cycles 4/5; they are valuable evidence that D0 and target W1 are distinct events.
