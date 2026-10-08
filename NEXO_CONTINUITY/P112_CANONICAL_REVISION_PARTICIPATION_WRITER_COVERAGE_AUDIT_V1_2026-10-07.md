# P112 — CANONICAL REVISION PARTICIPATION / WRITER COVERAGE AUDIT V1 — 2026-10-07

## Scope
Audit whether writers that can change protected state actually participate in canonical `stateRevision` conditional commit. Research only.

## Findings
1. `stateRevision` is assigned at the persistence caller boundary, not incremented by individual domain writers. The concrete production pattern is load revision R → isolated `applyState()` → mutate → `persistState(expectedRevision:R, stateRevision:R+1)`.
2. `scripts/simulate.mjs` is the canonical world-state persistence owner identified by repository search.
3. `scripts/assistants.mjs` also uses `persistState(expectedRevision)`, but separately writes `MEMORY_PATH` before the world-state commit. Therefore the revision protects the world-state persistence transaction, not automatically the separately written memory file.
4. Repository search confirms `runtime.js` executes Nexo steps and records mission outcome in Nexo memory but does not call canonical `persistState()`. Its mutations therefore do not automatically advance canonical `stateRevision` at execution time.
5. `effect-adapter.js` has an in-memory terminal `persist()` and optional prepared-intent hook; it is not itself the canonical revision owner.
6. Existing persistence tests prove the cooperating-writer path: two workers from the same revision yield one commit and one `STATE_REVISION_CONFLICT`. This demonstrates conflict detection for callers honoring the contract, not universal writer participation.
7. The repository's own prior audit explicitly classifies `stateRevision` as persistence-level conflict control, not a mutation-boundary guard. A stale isolated worker can mutate its local snapshot and discover the conflict only at persistence.
8. Consequently, the statement “whole snapshot + expectedRevision covers every state writer” is only defensible for writers that actually converge through the canonical persistence owner. It cannot be generalized to runtime/effect paths that mutate elsewhere.
9. This does NOT imply those non-participating paths are concurrently corrupting canonical disk state; it means their mutation/revision relationship is not established by `stateRevision`.
10. Separate-file writes create an additional consistency domain: `MEMORY_PATH` can be written independently of the world-state revision. This is outside the whole-snapshot claim unless a durable linkage/reconciliation contract is demonstrated.

## Decision
🟢 `stateRevision` is a useful conditional snapshot conflict token for cooperating canonical persistence callers.
🔵 Writer coverage is not universal: runtime/effect paths and separately persisted memory are outside the demonstrated revision boundary.
🔵 Therefore the previous P112 conclusion is narrowed: whole-snapshot + expectedRevision is the conservative protected domain for the canonical world-state file, NOT a universal semantic revision for all Nexo/Lúmina mutation paths.
🔴 No claim about JMM happens-before, runtime races, exactly-once, or power-loss durability.

## Exact next
Audit the separate `MEMORY_PATH` lifecycle and the runtime/effect mutation path together: determine which durable artifacts can diverge across a revision conflict/crash and what minimum provenance/linkage would be required for one claim to know which durable state is authoritative.

## DO-NOT-REPEAT
No global stateRevision promotion, no second persistence wrapper, no TLC rerun, no AB104.185 backfill, no AB105.117R, no implementation.
