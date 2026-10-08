# P112 — RECOVERY STATUS CONSUMER / EVICTION SEMANTICS AUDIT V1 — 2026-10-07

## Scope
Trace runtime, effect-adapter, memory reconstruction, and tests for existing distinctions between durable evidence, evicted evidence, and never-seen operations.

## Findings
1. No ARCHIVED, EVICTED, TOMBSTONE, or equivalent status/marker was found in the inspected effectJournal/recovery path.
2. `createLearningMemory()` retains only the last 200 `effectJournal` entries and last 200 executions, with no retained high-water mark, archive pointer, eviction marker, or tombstone.
3. `effect-adapter.executeFresh()` treats three relevant cases differently:
   - existing terminal `result`: return cached result;
   - existing `prepared`: require reconciliation;
   - no matching entry: record a new PREPARED intent and proceed toward execution.
   Therefore, after an unresolved entry is evicted, the adapter has no local state-level distinction between "old operation whose evidence was evicted" and "operation never seen".
4. `reconstructNexoMission()` uses mission plan + attempts, not effectJournal, to reconstruct mission step status. A durable execution-only record does not become completion. This is conservative for mission reconstruction but does not restore missing effect evidence.
5. `recordNexoOutcome()` allows only completed/failed/blocked and rejects an unverified completed outcome. It is a mission-outcome domain, not an external-effect journal.
6. Runtime's `commitRuntimeOutcome()` records execution and mission outcome after adapter execution, but it does not persist the canonical simulation snapshot itself. Thus the memory object can be updated in-process without proving durable cross-artifact commit.
7. The current idempotency key remains `missionId:stepId`. The code path does not add target incarnation, authority epoch/root, or payload fingerprint.
8. Tests explicitly establish the intended conservative distinction: execution-only does not equal mission completion; PREPARED requires reconciliation; failed/blocked reconciliation leaves PREPARED; verified reconciliation can terminally persist the journal entry.
9. No inspected existing field supplies a durable archive/tombstone semantics that could safely replace an evicted unresolved entry. Introducing one would be architecture work, not a finding.
10. Therefore the requested distinction is currently absent: **EVICTED/ARCHIVED ≠ NEVER_SEEN is not representable by the current effectJournal alone.**

## Epistemic classification
- 🟢 Existing recovery behavior and conservative PREPARED handling verified from source/tests.
- 🟢 Execution-only vs mission outcome separation verified.
- 🔵 Canonical cross-artifact linkage remains incomplete.
- 🔴 No current archive/tombstone distinction after journal eviction.
- 🔴 No inference that missing journal entry means NOT_ATTEMPTED.

## Exact next
Audit whether any existing Nexo memory fields, operation/effect records, or persistence envelopes outside `effectJournal` can preserve a non-evictable identity/outcome marker, without inventing a new identity system.

## DO-NOT-REPEAT
No retention patch, no new identity implementation, no global revision, no TLC rerun, no AB104.185 backfill, no AB105.117R, no JMM-HB/exactly-once/power-loss claim.
