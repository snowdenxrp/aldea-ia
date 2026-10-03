# NEXO AB105 G0 — Selector Final Source Boundary — 2026-10-03

Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`.

## Result
The pinned Kafka Selector is explicitly **not thread safe**. Its receive/completion collections are owned by the Processor's selector loop. SocketServer runs `poll()` and then `processCompletedReceives()` on the same Processor execution path. `completedReceives` therefore does not introduce an independent cross-thread publication edge from MetadataLoader.

The Selector audit therefore does not reveal a natural MetadataLoader W1 → Processor ENQUEUE synchronization edge.

## Epistemic boundary
- 🟢 Selector ownership/path identified.
- 🟢 Processor `poll()` → `processCompletedReceives()` path identified.
- 🟢 ENQUEUE remains `ArrayBlockingQueue.put`.
- 🔵 W1 → ENQUEUE JMM happens-before: UNKNOWN.
- 🔵 D1 visibility of W1: UNKNOWN.
- 🔵 stale read manifestation: UNKNOWN.
- 🔵 incorrect authorization consequence: UNKNOWN.
- 🔴 vulnerability: NOT_DECLARED.

## Important conclusion
Absence of an inspected synchronization edge is **not** proof that no happens-before edge exists anywhere else. The source audit has reached its useful boundary. We should stop expanding source inference unless a concrete candidate edge appears.

## Next experimental question
Design a race-neutral witness for the remaining W1→D1 visibility question, without gating D1 issuance on W1 observation and without adding synchronization that does not exist in production.

Frozen: AB105.116R unchanged; AB105.117R not created; TLC not rerun; PR #94 not merged; no artificial latch/volatile/future/barrier.
