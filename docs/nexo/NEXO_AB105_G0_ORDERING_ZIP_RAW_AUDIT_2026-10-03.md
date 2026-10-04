# NEXO AB105 G0 — ordering witness raw ZIP audit — 2026-10-03

## Artifacts inspected
- artifact 11264884775: `nexo-ordering.log` + `nexo-ordering-evidence.txt`
- artifacts 11207927096, 11209302613, 11240635939, 11242611554: small diagnostic evidence files

## 11264884775 raw findings
Evidence file states:
- KAFKA_REV=99b940733a9f6bc409457dba7108f08421d81e42
- DIAGNOSTIC=REAL_BROKER_ORDERING_WITNESS
- TIMING_INSTRUMENTATION=WORKFLOW_LOCAL
- AB105_116R=UNCHANGED
- AB105_117R=NOT_CREATED
- TLC=NOT_RERUN

The raw log contains 140 NEXO_ORDER event lines:
- A1_SUCCESS: 10
- D0_TARGET: 10
- ACL_W1: 20
- D0_RETURN: 10
- ENQUEUE: 20
- DEQUEUE: 20
- AUTH_ENTER: 20
- AUTH_DECISION: 20
- D1_RESULT: 10

The first ENQUEUE/DEQUEUE/AUTH sequence in each cycle is the successful A1 setup. The test request is the second sequence (correlation IDs 11,13,15,17,19,21,23,25,27,29), and each has ENQUEUE→DEQUEUE→AUTH_ENTER→AUTH_DECISION with DENIED, followed by D1_RESULT=DENIED.

## Critical correction discovered
Cycle 8 is NOT identical to the other nine cycles:
- D0_RETURN cycle=8: ns=329616353885
- another ACL_W1 on broker 0 occurs at ns=329617301423
- test ENQUEUE: ns=329622380039
- AUTH_ENTER: ns=329622781622

Therefore the previously summarized statement "D0_RETURN → D1 with no intervening ACL_W1" is false for 1/10 cycles. The test still has ACL_W1 before ENQUEUE/AUTH, but the ordering is different: broker-3000 W1 → D0_RETURN → broker-0 W1 → ENQUEUE.

## Timing extracted from raw events
For all 10 cycles, the first ACL_W1 after D0_TARGET occurs before D0_RETURN. The gap from D0_RETURN to the test ENQUEUE is approximately:
1 6.412 ms
2 5.965 ms
3 5.951 ms
4 6.033 ms
5 5.929 ms
6 6.133 ms
7 6.733 ms
8 6.026 ms
9 6.779 ms
10 6.062 ms

Thus the raw ZIP does NOT support the earlier claim that W1→ENQUEUE was generally 50–60 ms. That larger interval corresponds to other parts of the cycle (e.g. A1→D0_RETURN), not the relevant D0_RETURN→test ENQUEUE edge.

## What the ZIP actually establishes
- Real broker execution occurred.
- Both broker-local ACL_W1 events are visible in most cycles; cycle 8 demonstrates that propagation can be staggered.
- The test request is enqueued only after at least one ACL_W1 and D0_RETURN in every cycle.
- In cycle 8, the second broker's ACL_W1 happens after D0_RETURN but still before test ENQUEUE.
- All 10 test decisions were DENIED.
- The raw event order is observational timing evidence only; it does not establish Java Memory Model happens-before.

## What remains UNKNOWN
- Whether AUTH on the broker handling the test request observed the intended post-update `aclCache` state in each cycle.
- JMM HB relation from ACL_W1 to ENQUEUE/AUTH.
- Whether any stale-read manifestation occurred.
- Whether the 10-cycle sample is sensitive enough to expose the race.

## Audit conclusion
The raw ZIP contains a meaningful correction to the active continuity summary. Cycle 8 proves that the two broker-local W1 events are not always complete before D0_RETURN. Therefore the experiment's causal boundary must be described as **per-broker propagation plus test ENQUEUE**, not as a single globally completed W1 event.

This is an audit correction, not a new canonical research revision.

AB105.116R = FROZEN
AB105.117R = NOT_CREATED
TLC = NOT_RERUN
VULNERABILITY = NOT_DECLARED
