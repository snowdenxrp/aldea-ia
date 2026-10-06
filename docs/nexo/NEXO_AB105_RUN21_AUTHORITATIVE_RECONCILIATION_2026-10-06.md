# NEXO AB105 G0 — RUN21 ↔ AUTHORITATIVE WITNESS RECONCILIATION
Date: 2026-10-06

## Scope
Reconciled Run #21 cache-probe artifact (workflow run 37520308442, artifact 11441125547) against the canonical master witness (workflow run 37098764557, artifact 11265332252).

Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
AB105.116R unchanged.
AB105.117R not created.
TLC not rerun.

## Evidence
Run #21:
- 10 ACL cycles.
- W1 and D1 cache observations present.
- For each cycle, D1 after ACL removal observed targetPresent=false/cacheCount=0.
- The D1 cacheIdentity matches the corresponding broker-0 W1 cacheIdentity for all 10 cycles when paired by ACL id/cycle/causal sequence, not textual line position.

Canonical witness 37098764557:
- Artifact 11265332252, SHA-256 d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c.
- 10 cycles.
- Real request path instrumentation contains ENQUEUE, DEQUEUE, AUTH_ENTER, AUTH_DECISION and D1_RESULT.
- Example cycle 1 temporal sequence:
  A1_SUCCESS 433475132965
  D0_TARGET 433505308176
  ACL_W1 broker-3000 433551788787
  ACL_W1 broker-0 433555795110
  D0_RETURN 433557341970
  ENQUEUE correlationId=30 433563726193
  DEQUEUE correlationId=30 433563841248
  AUTH_ENTER correlationId=30 433564147299
  AUTH_DECISION DENIED correlationId=30 433564331180-ish (artifact records 433564331413)
  D1_RESULT DENIED 433566493057
- The same W1 -> D0_RETURN -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION -> D1_RESULT pattern is present across cycles.
- ACL_W1 occurs on metadata-loader threads; ENQUEUE occurs on data-plane network thread; D1 occurs on data-plane request-handler threads.

## Reconciliation result
No contradiction between Run #21 and the canonical witness.

Run #21 adds cache-snapshot identity evidence at D1.
The canonical witness supplies the missing real request-path event chain.
Together they establish a strong observational chain:
W1 -> (observed temporal ordering) -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION -> D1.

## Epistemic boundary
This still does NOT establish a formal Java Memory Model happens-before edge from the incremental ACL W1 write to ENQUEUE.

System.nanoTime ordering is temporal observation, not JMM HB.
The RequestChannel enqueue/dequeue boundary can establish publication for state/actions that occur before enqueue on the producer thread, but it cannot retroactively publish an earlier W1 action on the independent MetadataLoader thread unless there is a separate synchronization/publication edge connecting those threads.

Therefore:
- Real broker path: VERIFIED.
- W1 -> ENQUEUE temporal order: OBSERVED.
- ENQUEUE -> DEQUEUE publication boundary: VERIFIED by concurrent queue semantics.
- DEQUEUE -> AUTH_ENTER -> AUTH_DECISION -> D1 path: OBSERVED/VERIFIED in witness.
- W1 -> ENQUEUE formal HB: UNKNOWN.
- W1 -> D1 formal JMM HB: UNKNOWN.
- Stale ACL observed: NOT OBSERVED.
- Vulnerability: NOT ESTABLISHED.

## Next audit target
Do not add synchronization to the probe.
Trace the exact production path from the ACL publisher/MetadataLoader event that performs W1 to the code/thread that submits the subsequent real request to RequestChannel. Search specifically for an existing production synchronization/publication edge, callback handoff, executor/queue handoff, or shared state transition that could legitimately connect W1 to ENQUEUE.

Do not rerun TLC.
Do not create AB105.117R.
