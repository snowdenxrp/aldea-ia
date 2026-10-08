# P112 — NON-EVICTABLE MARKER SEARCH / JOURNAL-TO-SNAPSHOT LINKAGE AUDIT V1 — 2026-10-07

## Scope
Search existing Nexo memory/effect/persistence structures for an already-existing non-evictable identity/outcome marker that could distinguish an evicted unresolved effect from NEVER_SEEN.

## Findings
1. No existing non-evictable effect marker was found in the inspected structures.
2. `nexoMemory.nexo` consists of bounded missions(50), attempts(100), doNotRepeat(100), executions(200), effectJournal(200). All are reconstructed through bounded slices.
3. `effectJournal` carries idempotencyKey/missionId/stepId/action/target and, after terminal `persist()`, result/status/completedAt. There is no separate durable effect-identity registry.
4. `executions` also uses the same `missionId:stepId` idempotency key and is bounded to 200. It is a mission execution history, not a non-evictable effect tombstone.
5. `attempts` are bounded to 100 and are explicitly mission-step outcomes. They cannot safely substitute for effect evidence because execution-only records intentionally do not reconstruct completion.
6. `doNotRepeat` is bounded to 100 and only records explicit mission-step non-repeat lessons when requested. It is not a comprehensive effect ledger.
7. `nexoEffectRevision` is local simulation state and not part of the serialized nexoMemory payload. It therefore cannot serve as a durable cross-restart effect marker.
8. `stateRevision` is the canonical snapshot persistence conflict control, not an effect-specific identity/outcome registry. It can tell a cooperating snapshot writer that the canonical snapshot changed, but cannot by itself say which effect occurred.
9. Existing runtime/adapter snapshot crossing is structurally compatible with working-copy execution: runtime uses supplied `simulation` and `memory ?? simulation.nexoMemory`. This means a future protected owner could carry world + nexoMemory together through a working snapshot before conditional canonical commit.
10. No existing field currently bridges `effectJournal terminal result` to a durable canonical `stateRevision` commit identity.

## Conclusion
The repository currently has **no already-existing field that safely distinguishes EVICTED/ARCHIVED effect evidence from NEVER_SEEN**. Adding such semantics would require architecture work; this audit does not implement or invent it.

## Epistemic state
🟢 Existing bounded structures and snapshot crossing confirmed.
🔵 Potential reuse of existing stateRevision as commit conflict primitive, but not effect identity.
🔴 No current non-evictable effect marker or effect→canonical-commit linkage.
🔴 Missing journal entry cannot be interpreted as NOT_ATTEMPTED.

## Exact next
Audit the physical persistence boundary around `persistState(expectedRevision)` and compare it against the working snapshot's `nexoMemory` mutation sequence: determine exactly what becomes durable together, what remains RAM-only, and whether an existing commit result can be used as evidence without inventing a new identity.

## DO-NOT-REPEAT
No retention patch, no identity implementation, no global revision, no TLC rerun, no AB104.185 backfill, no AB105.117R, no JMM-HB/exactly-once/power-loss claim.
