# P112 — MEMORY / RUNTIME DURABLE DIVERGENCE AUDIT V1 — 2026-10-07

## Scope
Trace separate assistant memory, simulation-owned Nexo memory, runtime/effect journal, and canonical world-state persistence. Research only.

## Findings
1. The assistant script uses a separate file: `.lumina-assistant-memory.json` (`MEMORY_PATH`), while `simulation.nexoMemory` is a different simulation-owned structure.
2. `assistants.mjs` reads the separate learning memory, performs its report work, then calls `fs.writeFile(MEMORY_PATH, ...)` **before** calling canonical `persistState(STATE_PATH, ..., expectedRevision, stateRevision)`.
3. Therefore a failure or revision conflict in the subsequent world-state commit can leave the separate assistant-memory file updated even though the corresponding world-state revision was not committed. This is a concrete cross-artifact divergence window in the current topology.
4. This separate file is not covered by the world-state `stateRevision` check because the file write occurs outside `persistState`'s lock/check/rename boundary.
5. By contrast, repository evidence says `simulation.nexoMemory` is loaded into the simulation and serialized inside the world-state envelope. That memory therefore participates in the canonical snapshot when the cooperating persistence path is used.
6. Runtime/effect execution also follows `simulation.nexoMemory` when operating on a supplied simulation, but the runtime call path currently ends with in-memory outcome recording; canonical `persistState()` remains outside the call path.
7. The effect adapter's PREPARED persistence hook is not a production caller-owned durable checkpoint. Therefore a runtime/effect outcome can exist in memory without a demonstrated canonical commit identity linking it to a particular world-state revision.
8. We must distinguish two cases:
   - 🟢 simulation-owned Nexo memory: same snapshot domain as world-state when canonical persistence is used.
   - 🔵 assistant learning memory file: independent durable domain with no demonstrated shared revision/commit identity.
9. Minimum provenance needed to reconcile the split is not merely another timestamp. At minimum, a durable linkage would need an operation/run identity plus the world-state revision (or candidate revision) and artifact generation/commit status, so recovery can tell whether the separate artifact belongs to the committed world-state transition, a rejected candidate, or an indeterminate attempt.
10. No implementation is proposed here. This audit only establishes the existing divergence surface.

## Decision
🟢 Canonical world-state envelope already contains simulation-owned Nexo memory.
🔵 Separate assistant-memory file is outside canonical `stateRevision` and can advance before a rejected/uncommitted world-state revision.
🔵 Runtime/effect outcome currently lacks a demonstrated durable commit linkage to canonical world-state revision.
🔴 No claim of power-loss behavior, exactly-once, or external-effect certainty.

## Exact next
Audit the runtime/effect journal fields and determine whether an existing operation/effect identity can already serve as the missing cross-artifact linkage, versus requiring a new commit/provenance record.

## DO-NOT-REPEAT
No implementation, no second persistence wrapper, no global stateRevision promotion, no TLC rerun, no AB104.185, no AB105.117R.
