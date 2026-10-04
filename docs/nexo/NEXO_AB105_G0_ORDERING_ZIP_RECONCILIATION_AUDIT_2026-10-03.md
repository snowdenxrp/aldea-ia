# NEXO AB105 G0 — Ordering ZIP Reconciliation Audit
Date: 2026-10-03

## Scope
Direct byte-level inspection of GitHub Actions artifact ZIP 11264884775 plus four companion diagnostic ZIPs.

## Artifact hashes
- 11264884775: 378c7b6d0b3904d12eee2459752b937c858b52a34b213d4ce6793f7df56cbe1d
- 11242611554: 1facbe8c445faff9574a21b512c09e2a84931273f103e98a06fa0c135dafce48
- 11240635939: a5b002fc723256e45b36d79d1af1797ed50d305cf7f8ff20bad4388f32a30250
- 11209302613: 5b8c1b5356e5cf9b21c751f2a3cbff9b16949e5822a6a8eb295dd121941405b9
- 11207927096: e6d8f9820d4d84e90963d93f24cc518571e2c82789e0fb065e69364f437649ea

## Ordering artifact
11264884775 contains:
- nexo-ordering.log (151026 bytes)
- nexo-ordering-evidence.txt (20149 bytes)

KAFKA_REV=99b940733a9f6bc409457dba7108f08421d81e42.
AB105.116R unchanged; AB105.117R not created; TLC not rerun.

## Raw event reconciliation
Exactly 140 NEXO_ORDER events:
- A1_SUCCESS 10
- D0_TARGET 10
- ACL_W1 20
- D0_RETURN 10
- ENQUEUE 20
- DEQUEUE 20
- AUTH_ENTER 20
- AUTH_DECISION 20
- D1_RESULT 10

For cycles 1-9 there are two post-A1 requests: the first is the D1 request and is DENIED; the second is a later ALLOWED request. Cycle 10 contains only the D1 request. Therefore earlier 48-61 ms figures were NOT W1->D1 latency; they were largely the later ALLOWED request spacing.

## D1 correlation
D1 request correlation IDs:
cycle 1..10 = 11,13,15,17,19,21,23,25,27,29.
All 10 have:
ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION=DENIED -> D1_RESULT=DENIED.

Approximate intervals, milliseconds:
cycle 1: last W1->D1 ENQUEUE 10.739; D0_RETURN->D1 ENQUEUE 6.412
2: 8.074; 5.965
3: 6.863; 5.951
4: 6.623; 6.033
5: 6.772; 5.929
6: 6.914; 6.133
7: 7.296; 6.733
8: 5.079; 6.026
9: 7.778; 6.779
10: 6.554; 6.062

The smallest last-W1->D1-ENQUEUE window is cycle 8: 5.079 ms.

## Critical cycle 8
cycle 8:
ACL_W1 broker 3000 = 329613340642
D0_RETURN = 329616353885
ACL_W1 broker 0 = 329617301423
D1 ENQUEUE correlation 25 = 329622380039
D1 DEQUEUE = 329622532365
AUTH_ENTER = 329622781622
AUTH_DECISION DENIED = 329622909743
D1_RESULT DENIED = 329624023672

Thus D0_RETURN preceded the second broker's W1 by 0.947538 ms. D0_RETURN is NOT a global broker-propagation barrier.

## Other important ordering fact
Cycles 1-7,9-10 have both broker W1 events before D0_RETURN. Cycle 8 is the sole observed exception in this 10-cycle artifact.

## Interpretation boundaries
OBSERVED:
- real broker witness executed at pinned Kafka revision
- 20 W1 events across two brokers
- D1 DENIED 10/10
- temporal W1/D0/ENQUEUE/DEQUEUE/AUTH ordering
- cycle 8 demonstrates D0_RETURN can precede second broker W1

UNKNOWN:
- JMM happens-before from W1 to processor ENQUEUE
- JMM visibility from W1 to AUTH read
- stale aclCache manifestation in the real-broker path
- exploitability/generalization/production impact

NOT ESTABLISHED:
- security vulnerability
- global propagation guarantee at D0_RETURN
- causal/JMM guarantee inferred solely from nanoTime ordering

## Companion ZIPs
11207927096 = DIRECT_RACE=EXECUTED, timing-only diagnostic.
11209302613, 11240635939, 11242611554 = CAUSAL_WINDOW=EXECUTED, timing-only diagnostics.
All preserve AB105.116R and do not create AB105.117R.

## Audit consequence
The accepted ordering witness should use the D1 correlation IDs (11,13,...,29), not the later ALLOWED requests. The previous 50-60ms characterization must be removed from the ordering-window description. The next research question remains whether W1->processor/request publication has a genuine JMM synchronization edge; this artifact does not establish it.

AB105.116R remains frozen. No TLC rerun. No AB105.117R.
