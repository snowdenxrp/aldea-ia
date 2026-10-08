# P112 EXECUTION OWNER PROTOCOL RECONCILIATION V1 — 2026-10-07

Research-only; no implementation.

## Established later-AB protocol constraints

AB104.227: operation identity, effect mutation and committed result must be ordered as one authoritative target boundary when claiming atomic completion; registry presence alone is not effect completion; reservation is intent, not completion; same operation identity must bind effect identity/payload/target incarnation/authority context.

AB104.543: for ordinary external providers, use local atomic intent/outbox + provider admission + external attempt + reconciliation; do not pretend arbitrary external APIs are 2PC participants.

AB104.585: queue/admission is not permanent authority; final authoritative predicate check is immediately before irreversible mutation; stale admission must reject/re-admit; provider ambiguity remains UNKNOWN.

AB104.214: current prototype has prepared/reconcile/idempotency mechanisms, but no complete durable external-effect source of truth; persistPreparedIntent is only a durability seam; nexoEffectRevision is local simulation state, not external commit evidence.

## Current topology reconciliation

Current executeLuminaNexoStep():
1. obtains simulation.nexoMemory;
2. creates an adapter over the live simulation;
3. calls executeNexoStep();
4. adapter may record PREPARED and optionally invoke owner callback;
5. simulation-adapter handler mutates live simulation;
6. adapter records terminal result only in in-memory executionJournal;
7. runtime records mission execution/outcome in memory;
8. canonical persistState() is outside this call path.

Therefore the current topology has three distinct boundaries: effect adapter in-memory journal; runtime mission-memory commit; canonical world-state.json persistence. None currently constitutes a common atomic boundary.

## Minimal-owner conclusion

The missing owner is not simply a script and not merely an adapter callback.

For the bounded Lúmina prototype, the smallest defensible owner must dominate:
canonical state snapshot/revision → prepared intent durable checkpoint → final protected admission → local protected mutation → terminal effect result → mission execution/outcome → canonical durable state commit.

This does NOT mean all external Nexo effects need one global coordinator. For heterogeneous external providers, AB104.543 requires provider-specific admission/attempt/reconciliation.

For current Lúmina local effects, however, the repository has enough control to potentially define a local protected-transition owner around the simulation state. Whether that can be made atomic depends on the exact persistence/transaction primitive and all mutation entry points already audited in P112.

## Important distinction

runtime.js is currently an orchestration/mission-memory owner.
effect-adapter.js is currently an effect lifecycle coordinator.
simulation-adapter.js is currently a concrete mutation adapter.
scripts/simulate.mjs is currently a canonical persistence/simulation-loop owner.

None is currently the complete protected-transition owner.

The likely architectural seam is therefore between orchestration and concrete mutation, with canonical state authority participating, not a new global scheduler.

## What remains open

1. Whether the existing simulation persistence primitive can provide the required local atomic protected transition, given mutation occurs before persistState().
2. Whether all Lúmina protected mutation paths can be enclosed by that boundary without bypasses.
3. Exact ordering of PREPARED durability vs handler entry vs terminal journal vs state commit.
4. Recovery behavior for each crash cut.
5. Whether the local effect operation identity needs to expand beyond missionId:stepId.

## Exact next

Do not implement.

Next: use the already-audited mutation graph to determine whether a local protected-transition transaction can dominate the Lúmina WriteSet and canonical state persistence, or whether the existing simulation architecture makes a separate execution-state store/transaction primitive necessary.

## DO-NOT-REPEAT

No global coordinator; no simulate.mjs ownership assumption; no callback wiring; no fsync implementation; no TLC; no AB104.185 primary; no AB105.117R.
