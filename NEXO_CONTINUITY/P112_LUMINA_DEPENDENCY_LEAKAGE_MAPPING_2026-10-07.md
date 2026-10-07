# P112 — Lúmina leakage mapping checkpoint — 2026-10-07

## Result
The actual repository overlap graph confirms the retrospective dependency-completeness findings.

### Confirmed writer routes
1. tick() is a broad synchronous mutation route: day/world transition, society transition, agent processing and action execution.
2. Direct executeAction() is an independent mutation entry point.
3. Nexo effect adapter can mutate the same simulation object outside the tick path.
4. advanceWorldDay / advanceSocietyDay are composite writers with transitive resource, ecosystem, economy, institution, governance, technology, research, specialization and agent mutations.

### Dependency leakage classes mapped
- Hidden helper reads: present as a research risk; helpers called by action/day-transition paths must be inside the trusted capture boundary.
- Aggregate/derived reads: ecosystem/economy/institution/research computations consume multiple state values and can turn them into decision-influencing derived values.
- Predicate/threshold reads: governance/institution/technology/research and action preconditions can depend on threshold/context rather than one field.
- Direct bypasses: executeAction and effect handlers can mutate without passing through tick.
- Branch-dependent reads: action-specific dispatch means actual dependency footprint depends on the chosen action.
- Retry/restart: persisted effect/recovery state can cross a newer state/dependency generation and therefore needs revalidation.
- Historical dependencies: reconstruction/reconciliation cannot replace the original admission context when the claim depends on what was true at admission.

### Critical conclusion
The earlier overlap matrix is not enough by itself. A fixed resource/object/subsystem version can miss semantic dependencies unless every authoritative read/derived predicate is captured.

Therefore the current smallest defensible model remains:
Transition-private state/snapshot
→ authoritative ReadSet + WriteSet + DependencySet capture
→ include predicate/range/aggregate/derived provenance
→ validate authoritative versions/incarnations/fence at commit
→ conditional commit
→ stale conflict => discard/reload/reconcile.

If capture completeness cannot be proven, do not narrow the scope; use broader serialization or UNKNOWN/HOLD/REVALIDATE.

## Status
🟢 Writer overlap confirmed.
🟢 Resource-only/object-only boundary unsafe as generic rule.
🟢 Subsystem boundary unsafe without dependency closure.
🔵 Exact practical capture boundary remains OPEN.
🔵 Need focused audit of actual helper/derived/predicate functions to determine whether a conservative per-transition envelope can be proven.

## DO-NOT-REPEAT
No implementation. No new executor. No TLC rerun. No backfill of AB104.185 primary artifact. No claim of whole-world serialization or exactly-once.