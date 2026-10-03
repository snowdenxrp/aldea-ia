# NEXO AB105 G0 — REAL BROKER ORDERING WITNESS
## Run 37079062681 — raw ordering audit

Date: 2026-10-02
Workflow: `NEXO AB105 G0 ordering witness runner v2`
Run: `37079062681`
Head commit: `c35d3f4cf84d24a4bb21bba9d6aeeb26f712702a`
Kafka revision: `99b940733a9f6bc409457dba7108f08421d81e42`
Artifact: `11257159423`
Artifact SHA-256: `194b3d23a58c1a26c6cfa7472d274275198c6e8b88d714546f829df219f1557f`

## Scope

This document records post-hoc analysis of the raw real-broker witness artifact. It does NOT establish JMM happens-before, memory-model causality, race absence, or security exploitability.

AB105.116R is unchanged.
AB105.117R is not created.
TLC is not rerun.

## Execution status

The v2 workflow completed the real-broker execution successfully and uploaded raw evidence. The workflow-local probes cover ENQUEUE, DEQUEUE, AUTH_ENTER, AUTH_DECISION and ACL_W1. The harness itself emits A1_SUCCESS, D0_TARGET, D0_RETURN and D1_RESULT.

## Raw event count

The latest artifact contains **140 `NEXO_ORDER` lines**, not 240.

Breakdown:
- ENQUEUE: 20
- DEQUEUE: 20
- AUTH_ENTER: 20
- AUTH_DECISION: 20
- ACL_W1: 20
- A1_SUCCESS: 10
- D0_TARGET: 10
- D0_RETURN: 10
- D1_RESULT: 10

The earlier conversational description of “240 events” is therefore corrected to **140 raw `NEXO_ORDER` events for run 37079062681**. This correction is bookkeeping only; it does not invalidate the witness.

## Per-cycle reconstruction

Each cycle has one successful pre-deletion request, one ACL deletion, and one post-deletion denied request. Request correlation IDs are consecutive pairs:

| Cycle | Pre-D0 CID | Post-D0 CID | D0_TARGET ns | W1 broker-3000 ns | W1 broker-0 ns | D0_RETURN ns | Post ENQUEUE ns | D1_RESULT ns |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 47 | 48 | 194069649742 | 194109397166 | 194111027852 | 194114937863 | 194119960965 | 194121997476 |
| 2 | 49 | 50 | 194179888807 | 194216047013 | 194217754203 | 194220447455 | 194226397061 | 194231090711 |
| 3 | 51 | 52 | 194290255369 | 194326074285 | 194327551198 | 194328599819 | 194334701395 | 194335972525 |
| 4 | 53 | 54 | 194393861812 | 194428664185 | 194431243699 | 194431605704 | 194437439519 | 194438689923 |
| 5 | 55 | 56 | 194492391984 | 194530749353 | 194532316941 | 194533031737 | 194537748943 | 194538693098 |
| 6 | 57 | 58 | 194596426370 | 194629913382 | 194631179144 | 194632839979 | 194638605054 | 194639607305 |
| 7 | 59 | 60 | 194691440879 | 194724284450 | 194726844320 | 194727318701 | 194733125171 | 194734044005 |
| 8 | 61 | 62 | 194789306263 | 194823158335 | 194825239492 | 194825682097 | 194831359581 | 194832479918 |
| 9 | 63 | 64 | 194880891502 | 194912429618 | 194914743739 | 194914236349 | 194919919857 | 194921186725 |
| 10 | 65 | 66 | 194970073642 | 195000477120 | 195001781940 | 195002425541 | 195008161252 | 195009044127 |

## Strong observed properties

1. All 10 cycles reached A1_SUCCESS.
2. All 10 deletion operations had exactly one D0 target ACL.
3. All 10 post-deletion producer attempts produced `D1_RESULT=DENIED`.
4. All 20 observed request paths have the local event sequence:
   `ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION`.
5. The same ACL identifier is observed at broker 3000 and broker 0 in every cycle.
6. The observed broker-3000 ACL_W1 occurs before D0_RETURN in all 10 cycles.
7. Broker-0 ACL_W1 occurs before D0_RETURN in cycles 1-8 and 10, but **after D0_RETURN in cycle 9**.
8. Despite the cycle-9 interleaving, broker-0 ACL_W1 occurs before the next post-D0 ENQUEUE (CID 64), and the subsequent authorization decision is DENIED.
9. Therefore cycle 9 is a genuine observed interleaving and MUST NOT be normalized away or treated as a logging defect without independent evidence.

## Cycle 9 — critical interleaving

Cycle 9 raw order is:

`A1_SUCCESS`
`D0_TARGET`
`ACL_W1 broker-3000`
`D0_RETURN`
`ACL_W1 broker-0`
`ENQUEUE CID=64`
`DEQUEUE CID=64`
`AUTH_ENTER CID=64`
`AUTH_DECISION CID=64 DENIED`
`D1_RESULT DENIED`

Exact timestamps:
- broker-3000 W1: `194912429618`
- D0_RETURN: `194914236349`
- broker-0 W1: `194914743739`
- post-D0 ENQUEUE: `194919919857`
- D1_RESULT: `194921186725`

Thus the second broker's W1 was approximately 507,390 ns after D0_RETURN and approximately 5,176,118 ns before the post-D0 ENQUEUE.

This demonstrates why a simple claim of `W1 -> D0_RETURN` is too strong for the entire replicated observation. The more precise observation is broker-specific and cycle-specific.

## Timing / causality boundary

The `ns` values come from `System.nanoTime()` calls made by separate threads and workflow-local probes. They provide a useful observed temporal trace, but they do not by themselves establish a Java Memory Model happens-before edge across threads.

In particular:
- `W1 timestamp < ENQUEUE timestamp` is temporal evidence only.
- `ENQUEUE < DEQUEUE < AUTH_ENTER < AUTH_DECISION` is observed instrumentation order, not a proof that all underlying state transitions are causally ordered by the JMM.
- The shared ACL identifier across brokers strengthens the identity correlation of the propagated ACL observation, but does not itself prove a JMM edge.
- `D1=DENIED` after W1 is an observed outcome, not proof of why that authorization decision was denied unless the exact authorization state used by the decision is independently bound to the W1 event.

## Current epistemic state

GREEN / OBSERVED:
- real broker execution
- 10/10 A1 successes
- 10/10 D0 targets
- 20 ENQUEUE events
- 20 DEQUEUE events
- 20 AUTH_ENTER events
- 20 AUTH_DECISION events
- 20 ACL_W1 events
- 10/10 D1 denied outcomes
- per-request correlation IDs
- per-ACL propagated IDs
- broker-specific W1 observations

BLUE / EXTENSION:
- cycle-level reconstruction from the raw event stream
- broker-specific W1 ordering relative to D0_RETURN
- cycle-9 interleaving classification

UNKNOWN / NOT ESTABLISHED:
- JMM happens-before from W1 to the authorization decision
- exact internal state read by each AUTH_DECISION
- race absence
- security exploitability
- whether the observed authorization outcome is sufficient to classify the original vulnerability without the remaining TLC/formal evidence

## Do not repeat

Do not rerun the same raw witness merely to obtain another copy of the already observed 10-cycle trace unless a specific unresolved hypothesis requires it.
Do not alter AB105.116R.
Do not create AB105.117R yet.
Do not rerun TLC yet.
Do not convert cycle-9 ordering into a failure or success classification without causal evidence.
Do not claim JMM happens-before from timestamps.

## Next investigation

The next step is not another blind rerun. Build a deterministic post-hoc analyzer over the raw artifact that:

1. parses all 140 NEXO_ORDER events;
2. binds each pre/post request by correlationId;
3. binds each ACL_W1 pair by ACL id and broker thread;
4. reconstructs each cycle without relying on line adjacency;
5. explicitly classifies W1-before/after-D0_RETURN per broker;
6. checks that both W1 observations precede the corresponding post-D0 ENQUEUE;
7. records the exact authorization thread for each D1 request;
8. produces a machine-checkable table while keeping causal/JMM conclusions UNKNOWN.

After that analyzer is independently verified, investigate whether additional instrumentation can establish the missing causal relation without changing the Kafka semantics under test.
