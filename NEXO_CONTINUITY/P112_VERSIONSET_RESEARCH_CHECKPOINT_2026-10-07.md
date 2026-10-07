# P112 — VersionSet granularity / dependency closure research checkpoint — 2026-10-07

Status: ACTIVE RESEARCH. Not a historical AB104.185 primary artifact. No V21, implementation, semantic freeze, or formal verification.

## Scope
Continue the exact AB104.185 research question using later retrospective research only as cross-check, then reconcile against current Lúmina code evidence.

## Retrospective evidence recovered
Later repository research files establish a stronger answer than the earlier AB104.153 candidate:

- AB104.600 (retrospective research): direct WriteSet is insufficient; static DependencySet is safe only if it is a proven conservative closure; otherwise authoritative reads must be captured dynamically; predicate/range/aggregate dependencies matter; executed access paths are part of the proof surface.
- AB104.601 (retrospective research): derived values must preserve provenance; cache hits remain reads; helpers cannot hide authoritative reads; aggregates/predicates need explicit dependency tokens or conservative broader versions; DependencySetRecorded != DependencySetComplete; if authoritative coverage cannot be proven, HOLD/REVALIDATE.
- AB104.187 was not recovered as a primary artifact. A later correction explicitly says not to resume from AB104.187 and not to overwrite historical checkpoints. Therefore it is not used as primary evidence.

## Reconciliation with current code
Current source audit independently confirms:
1. stateRevision is persistence-level conflict detection, not a mutation-boundary guard.
2. tick() is a broad shared-state transition: world-day + society-day + agent decisions/actions.
3. Direct actions can mutate resource state independently of tick().
4. Resource-only versions are unsafe because resources are both writes and semantic inputs to other writers.
5. A subsystem version is only safe if its dependency closure is complete.
6. The smallest defensible unit is therefore not a fixed object/subsystem by name, but a protected transition footprint:
   - authoritative ReadSet
   - WriteSet
   - DependencySet
   - predicate/range/aggregate dependencies where applicable
   - object/resource incarnation
   - authoritative version tokens
   - relevant policy/logic/config version
   - final conditional validation/commit.
7. When the closure cannot be proven complete, the safe result is STALE_ADMISSION / HOLD / REVALIDATE rather than best-effort execution.

## Current analytical status
🟢 Confirmed: global stateRevision alone is too coarse as a semantic model and too late as a mutation guard.
🟢 Confirmed: direct WriteSet alone is insufficient.
🟢 Confirmed: static subsystem/object versions require a complete conservative dependency closure.
🔵 Open: exact executable dependency language and instrumentation coverage.
🔵 Open: dynamic capture completeness across helpers, derived values, caches, predicates and bypass paths.
🔵 Open: smallest practical partition that preserves semantic safety without falsely claiming whole-world serialization.

## DO-NOT-REPEAT
- Do not treat AB104.600/601 as primary AB104.185 artifacts.
- Do not backfill missing AB104.185-.191 primary files.
- Do not implement VersionSet yet.
- Do not rerun TLC.
- Do not claim exactly-once, JMM HB, or external-effect closure.
- Do not equate stateRevision with authority fence or mutation linearization.

## Exact next research
Audit the actual Lúmina writer/dependency graph against the later AB104.600/601 findings. Focus on:
A) derived/cache/helper read paths;
B) predicate/aggregate reads;
C) direct mutation bypasses around tick/actions;
D) whether a conservative dependency envelope can be defined per transition;
E) whether dynamic authoritative-read capture can be made complete, or must fall back to broader serialization/HOLD.

Primary anchors remain AB104.151 and current P112 working frontier.