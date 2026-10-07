# P112 FINAL-COMMIT CANDIDATE / COMMON-BOUNDARY AUDIT V1 — 2026-10-07

Research-only. No implementation and no runtime concurrency claim.

## Current code boundary result
The current repository exposes no demonstrated single common boundary that already owns all of:
1. claim-specific admission dependencies;
2. final dependency validation;
3. every protected local mutation entry point;
4. durable history/state commit.

`performDecision()` is the coordinator, but it directly performs social, knowledge, cooperation and exploration/discovery mutations in addition to calling `executeAction()`. `executeAction()` is therefore too narrow to be the universal protected boundary. `tick()` also performs state changes before and after `performDecision()`.

## Candidate boundaries
### A. performDecision-level boundary
Pros: sees selected intent and all direct branches.
Failure: it does not itself own the low-level writes in action modules, daily writers, helpers, or persistence. Without a lower-level authoritative commit protocol, wrapping it does not establish atomicity.

### B. executeAction-level boundary
Pros: natural physical-effect dispatcher.
Failure: misses direct `performDecision()` branches and shared writers. Cannot prove coverage for social/knowledge/cooperation/exploration mutations.

### C. state/persistence boundary
Pros: durable state/history can be coordinated here.
Failure: persistence lock/revision protects serialized state writes, not necessarily in-memory mutation that happened before persistence; it also cannot retroactively fence an external or already-applied effect.

### D. explicit protected-transition executor
This is the first candidate that can conceptually dominate all protected mutation entry points, provided every equivalent branch is routed through it and the executor owns final validation plus commit/reject semantics. This is a design candidate only, not implemented.

### E. conditional snapshot/commit
Can preserve concurrency if every authority-relevant ReadSet/DependencySet and all protected writes are captured and final validation rejects stale state. This is also only a research candidate.

## Important architectural separation
The physical/local protected transition should not automatically include:
- event narration;
- memory/learning records;
- discovery observations;
- skill updates;
- post-effect plan bookkeeping;
unless those outputs are themselves authoritative inputs to the same claim. If they influence a later claim, they become dependencies of that later claim, not necessarily part of the original physical transaction.

## Current minimum claim
The smallest defensible common boundary is therefore not yet a function name. It is a semantic boundary that must dominate every mutation path capable of invalidating or applying the protected claim, while allowing non-authoritative post-effect writes outside the critical footprint.

## Status
GREEN: A/B/C insufficiency is demonstrated from current code structure.
BLUE: D/E are candidate protocols; exact minimal ownership/order/atomicity OPEN.

## Exact next
Audit the durable commit path and crash cuts against this candidate boundary: determine whether local protected mutation can be made durable together with its authority/dependency context, and identify which crash points yield COMMITTED, NOT_COMMITTED, or UNKNOWN rather than guessing from the exception alone.

## DO-NOT-REPEAT
No implementation; no global stateRevision promotion; no TLC rerun; no AB104.185 primary; no AB105.117R; no runtime concurrency claim.
