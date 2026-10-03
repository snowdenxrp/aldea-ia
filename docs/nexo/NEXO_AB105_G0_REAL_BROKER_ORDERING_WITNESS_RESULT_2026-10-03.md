# NEXO AB105 G0 — Real Broker Ordering Witness Result — 2026-10-03

## Epistemic state

Canonical repo: snowdenxrp/aldea-ia
Branch under test: nexo-ab105-g0-ordering-witness
PR: #94 (draft / not merged)
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
Workflow: NEXO AB105 G0 ordering witness runner v2
Run: 37081442555
Job: 111082635995
Head: a3aaae3a7839b2ab079b90991231fd42f622e2f1
Artifact: 11259107051
Artifact digest: sha256:28a379f313bc30c169125a67138bdc8dd7f58be0bfd857c22a1f446f58bcc4ef

AB105.116R: UNCHANGED
AB105.117R: NOT_CREATED
TLC: NOT_RERUN

## Execution result

The corrected v2 workflow executed successfully through:
INSTALL → FORMAT → COMPILE → REAL BROKER WITNESS → RAW EVIDENCE → ARTIFACT.

The real-broker test completed 10 create/delete/produce cycles.

For every cycle, the target broker's ACL_W1 event (thread kafka-0-metadata-loader-event-handler) was observed before D0_RETURN, and the subsequent D1 request events were observed after D0_RETURN.

Observed target-broker temporal pattern in all 10 cycles:

ACL_W1(target) < D0_RETURN < ENQUEUE(D1) < DEQUEUE(D1) < AUTH_ENTER(D1) < AUTH_DECISION(D1) < D1_RESULT

D1 authorization result:
- cycle 1: DENIED
- cycle 2: DENIED
- cycle 3: DENIED
- cycle 4: DENIED
- cycle 5: DENIED
- cycle 6: DENIED
- cycle 7: DENIED
- cycle 8: DENIED
- cycle 9: DENIED
- cycle 10: DENIED

No D1 ALLOWED was observed.

The run also showed a second ACL_W1 on the controller-side metadata-loader thread for each cycle. This is expected in the one-broker + one-controller test topology and must not be confused with the target broker's W1.

## Exact raw timing evidence

Cycle 1:
target ACL_W1 = 261566072638
D0_RETURN = 261570124592
D1 ENQUEUE = 261576574345
D1 DEQUEUE = 261576701359
D1 AUTH_ENTER = 261576985307
D1 AUTH_DECISION = 261577303769 result=DENIED
D1_RESULT = 261579147430

Cycle 2:
target ACL_W1 = 261690408932
D0_RETURN = 261690800868
D1 ENQUEUE = 261697331315
D1 DEQUEUE = 261697512942
D1 AUTH_ENTER = 261697812840
D1 AUTH_DECISION = 261697947841 result=DENIED
D1_RESULT = 261698907185

Cycle 3:
target ACL_W1 = 261808119684
D0_RETURN = 261809733448
D1 ENQUEUE = 261814791564
D1 DEQUEUE = 261814955218
D1 AUTH_ENTER = 261815273700
D1 AUTH_DECISION = 261815424411 result=DENIED
D1_RESULT = 261816395927

Cycle 4:
target ACL_W1 = 261920590759
D0_RETURN = 261920489698
IMPORTANT: here the target ACL_W1 timestamp is 101,061 ns AFTER D0_RETURN.
Therefore cycle 4 does NOT satisfy the simplified universal pattern ACL_W1 < D0_RETURN.
However target ACL_W1 still occurred before the D1 request's DEQUEUE/AUTH path:
ACL_W1 = 261920590759
D1 DEQUEUE = 261926715729
D1 AUTH_ENTER = 261927112897
D1 AUTH_DECISION = 261927220297 DENIED.

Cycle 5:
target ACL_W1 = 262029090806
D0_RETURN = 262028693234
IMPORTANT: target ACL_W1 occurred 397,572 ns AFTER D0_RETURN.
D1 DEQUEUE = 262033691398
D1 AUTH_ENTER = 262033941203
D1 AUTH_DECISION = 262034176871 DENIED.

Cycle 6:
target ACL_W1 = 262134122090
D0_RETURN = 262135490478
D1 DEQUEUE = 262141409274
D1 AUTH_ENTER = 262141673626
D1 AUTH_DECISION = 262141793959 DENIED.

Cycle 7:
target ACL_W1 = 262238722870
D0_RETURN = 262241453805
D1 DEQUEUE = 262247513466
D1 AUTH_ENTER = 262247794759
D1 AUTH_DECISION = 262247925572 DENIED.

Cycle 8:
target ACL_W1 = 262342837833
D0_RETURN = 262343398966
D1 DEQUEUE = 262349220662
D1 AUTH_ENTER = 262349463934
D1 AUTH_DECISION = 262349577395 DENIED.

Cycle 9:
target ACL_W1 = 262449869166
D0_RETURN = 262451909032
D1 DEQUEUE = 262457822595
D1 AUTH_ENTER = 262458324138
D1 AUTH_DECISION = 262458449221 DENIED.

Cycle 10:
target ACL_W1 = 262553468854
D0_RETURN = 262556069266
D1 DEQUEUE = 262562271680
D1 AUTH_ENTER = 262562528698
D1 AUTH_DECISION = 262562647228 DENIED.

## Correct classification

The initial simplified claim "W1 < D0_RETURN in all 10 cycles" is FALSE.

The stronger observation that matters for the ordering witness is:

- In all 10 cycles, the target broker's ACL_W1 occurred before the corresponding D1 DEQUEUE/AUTH path.
- In cycles 4 and 5, target W1 occurred after D0_RETURN but still before D1 DEQUEUE.
- Thus all 10 cycles provide temporal evidence of:
  target W1 < D1 DEQUEUE < D1 AUTH_ENTER < D1 AUTH_DECISION.

This is materially stronger than using D0 as a substitute for W1.

## JMM interpretation

The RequestChannel ArrayBlockingQueue gives a real publication/synchronization boundary for the request from ENQUEUE to DEQUEUE. Therefore, once a request is actually enqueued after the target W1 write, the queue boundary can publish actions that occurred before the enqueue to the request-handler thread.

However, the raw timestamps alone do NOT prove that target W1 happens-before ENQUEUE.

In particular:
- System.nanoTime() establishes monotonic temporal comparison only.
- W1 < ENQUEUE is observed, but timestamp order is not itself a JMM happens-before relation.
- D0_RETURN must not be treated as a substitute for target W1.
- The D1 DENIED result is real runtime evidence, but does not by itself prove a general JMM visibility guarantee.

Therefore:
- REAL_BROKER_ORDERING_WITNESS: OBSERVED
- TARGET_W1_BEFORE_D1_DEQUEUE (temporal): OBSERVED in 10/10 cycles
- TARGET_W1_BEFORE_D1_AUTH_ENTER (temporal): OBSERVED in 10/10 cycles
- D1_DENIED: 10/10
- stale post-W1 ALLOWED: NOT_OBSERVED
- JMM happens-before from W1 to request publication: UNKNOWN
- stale-read possibility under JMM: UNKNOWN
- exploitability: UNKNOWN
- generalization: UNKNOWN
- production impact: UNKNOWN
- security conclusion: NOT_ESTABLISHED

## Important correction to preserve

Do NOT summarize this run as "D0_RETURN proves W1 completed."

The correct evidence is direct target-broker ACL_W1 instrumentation plus independent RequestChannel ENQUEUE/DEQUEUE/AUTH instrumentation.

Do NOT summarize this run as a JMM theorem.

## Next action

The next useful step is to audit whether the observed W1→ENQUEUE relationship has an actual synchronization/causal edge in the implementation or is only a temporal ordering in this test.

Do not:
- modify AB105.116R;
- create AB105.117R;
- rerun TLC;
- merge PR #94;
- repeat the already successful v2 run unless a new question requires it.

Preserve this run and artifact as raw evidence.
