# P112 — EFFECT JOURNAL TRANSITION / RESTART SEMANTICS AUDIT V1 — 2026-10-07

## Scope
Trace actual effectJournal status transitions, serialization/restart behavior, and crash/exception cuts. This is additive to the prior identity audit.

## Findings
1. PREPARED creation is durable only if the containing simulation snapshot is subsequently persisted, or if a caller implements the optional persistPreparedIntent seam durably.
2. A persisted PREPARED entry survives load/restart. Existing restart test reconstructs the mission outcome separately while the effectJournal remains PREPARED.
3. On normal terminal paths, persist() mutates the in-memory journal entry with result/status/completedAt. These fields become durable only when the containing simulation/nexoMemory is later persisted.
4. On handler exception, effect-adapter constructs EFFECT_OUTCOME_UNKNOWN but does not call persist(). Therefore the existing PREPARED entry remains the only journal evidence in that process path; UNKNOWN is returned to the caller but is not itself journal-persisted by the adapter.
5. This is important because prior documentation/tests describe UNKNOWN preservation conceptually, but direct source readback shows that preservation is not equivalent to durable journal update. We should treat source behavior as authoritative for this audit.
6. On a prepared entry encountered during a later execution, reconcile() is required. A blocked reconciliation leaves the entry PREPARED rather than converting uncertainty into a cached terminal block.
7. The journal is bounded to 200 entries. Existing historical audit AB104.214 already identified that eviction of unresolved PREPARED/UNKNOWN evidence can permit a later same-key request to reach fresh execution. This remains an architectural gap, not a patch target in P112.
8. Restart persistence test proves that a PREPARED journal entry can survive ordinary save/load reconstruction, and that canonical stateRevision conflict detection is separate. It does not prove crash atomicity between physical effect and journal persistence.
9. Existing persistence failure tests show world-state file remains at the prior revision after injected write/rename failures. This protects the canonical snapshot persistence boundary, but does not couple an external effect to that boundary.
10. Therefore the current evidence chain is: local PREPARED -> optional/delayed durability -> possible terminal in-memory journal update -> later canonical snapshot persistence. There is no demonstrated single durable commit point joining effect occurrence, journal terminal status, and canonical stateRevision.

## State matrix
- prepared: identifiable, recoverable if retained; not proof of non-occurrence.
- completed: terminal journal result can be persisted with snapshot; not proof of external acceptance unless evidence verifies the target.
- failed: terminal local result can be persisted; does not prove no partial external effect unless handler/evidence semantics establish that.
- blocked: reconciliation may remain PREPARED rather than terminally block; blocked result can also arise from precondition/persistence paths and must not be conflated with external non-occurrence.
- unsupported: terminal adapter result; represents local lack of handler, not external-effect absence.
- EFFECT_OUTCOME_UNKNOWN: explicit returned uncertainty on handler exception, but current catch path does not persist that status into the journal.

## Decision
🟢 Restart can preserve PREPARED journal evidence when the snapshot is successfully persisted.
🟢 Existing conditional snapshot persistence independently rejects stale canonical revisions.
🔵 Durable terminal effect evidence depends on later snapshot persistence.
🔵 Cross-artifact linkage to canonical revision is absent.
🔴 No claim of atomic effect+journal+snapshot commit.
🔴 No exactly-once/external fencing claim.

## Exact next
Trace the remaining recovery/status producers and consumers (runtime, mission reconstruction, effect adapter tests) to determine whether any existing record already distinguishes ARCHIVED/evicted evidence from NEVER_SEEN, and whether any existing outcome field can provide commit linkage without inventing a new identity.

## DO-NOT-REPEAT
No retention patch, no new identity implementation, no global revision, no TLC rerun, no AB104.185 backfill, no AB105.117R, no JMM-HB/exactly-once/power-loss claim.
