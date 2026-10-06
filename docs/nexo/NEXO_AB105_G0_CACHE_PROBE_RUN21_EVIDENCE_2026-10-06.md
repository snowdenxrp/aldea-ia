# NEXO AB105 G0 — Cache Probe Run #21 Evidence

Date: 2026-10-06
Status: FROZEN EVIDENCE / NO CONCLUSION OF VULNERABILITY

## Purpose
Freeze the complete Run #21 diagnostic cache-snapshot result before any further probe modification.

## Observed result
- 10/10 cycles executed.
- W1 executed in 10/10 cycles.
- D1 executed in 10/10 cycles.
- D1_RESULT was DENIED in 10/10 cycles.
- In the cycles where the ACL was expected to be removed, D1 observed targetPresent=false, targetId=NONE, cacheCount=0.
- When W1 and D1 observations are paired by ACL identity, cycle identity, and causal sequence—not by textual log position—the cacheIdentity observed by D1 exactly matched the corresponding W1-produced cacheIdentity in all 10/10 cases.
- W1 ran on metadata-loader event-handler threads; D1 ran on data-plane request-handler threads.
- No probe-added volatile, synchronized, latch, barrier, lock, or equivalent publication mechanism was introduced between W1 and D1.

## Important interpretation boundary
The matching cacheIdentity values are strong empirical evidence that no stale cache snapshot was observed in this run.

They do NOT prove Java Memory Model happens-before from W1 to D1.

System.nanoTime timestamps establish observed temporal ordering within the execution trace, but are not by themselves a formal JMM happens-before edge.

Therefore:
- ACL cache stale visibility: NOT OBSERVED (10/10).
- Real-broker execution: VERIFIED for this probe.
- D1 snapshot observability: VERIFIED.
- W1/D1 cacheIdentity correspondence: VERIFIED 10/10 when causally paired.
- W1 -> D1 formal JMM ordering: UNKNOWN.
- W1 -> actual data-plane request causal chain: UNKNOWN.
- Vulnerability W1 -> D1: UNKNOWN.

## Ordering gap exposed by Run #21
The artifact contains repeated:
A1_SUCCESS -> D0_TARGET -> W1 -> D0_RETURN -> D1_RESULT

The artifact does not contain the complete request-path witness:
W1 -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION/D1

Therefore Run #21 does not close the missing causal edge between the metadata-side W1 observation and the actual data-plane authorization execution.

The next research question is narrowly scoped:
What real causal relationship connects metadata/W1 to actual D1 execution in the data plane?

Do not add synchronization solely to manufacture a happens-before edge. Do not repeat the cache-identity probe without first addressing the missing request-path linkage.

## Continuity invariants
- AB105.116R remains the protected canonical anchor.
- AB105.117R must not be created.
- TLC must not be rerun while the ordering audit remains open.
- The repository/workflow must not be modified merely to save this evidence.
- This document is an evidence freeze, not a vulnerability finding.

## Next action
Investigate only the missing real-broker request-path causal chain:
W1 -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION/D1

Prefer existing Kafka/request correlation already present in the witness. The next experiment must demonstrate the actual data-plane path rather than create a new synchronization edge.
