# NCS M0 — Mission execution-owner boundary gate

Date: 2026-10-18
Status: ARCHITECTURAL BLOCKER CONFIRMED FROM EXISTING AB/P112 EVIDENCE; NO EXECUTOR IMPLEMENTED

## Why this artifact exists

M0's target is one integrated loop: observation/evidence → interpretation/decision → mission planning with permission controls → permitted execution → result verification → persistence/restart/recovery/replan.

The repository has planning and execution primitives, but the canonical production path still does not connect them. This is not a forgotten callback and must not be "fixed" by wiring the optional callback into a random caller.

## Existing evidence recovered and re-used (no closed probe rerun)

- [AB104.150](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_CONTINUITY/AB104.150.md): no production caller invokes `executeLuminaNexoStep()` or supplies `persistPreparedIntent`; assistants owns planning/checkpoint, simulation owns world-state persistence.
- [AB104.151](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_CONTINUITY/AB104.151.md): the missing link is the execution-owner boundary itself, not a forgotten callback. It explicitly says not to inject `persistState` directly into generic runtime/adapter and to define ownership before adding an executor.
- [P112 effect-journal lifecycle audit](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_CONTINUITY/P112_EFFECT_JOURNAL_TRANSITION_RESTART_SEMANTICS_AUDIT_V1_2026-10-07.md): PREPARED is durable only if the containing snapshot is persisted or the caller-owned hook persists it; the current code does not establish an atomic commit point spanning arbitrary effect occurrence, journal terminal state and canonical snapshot.
- [P112 eviction semantics](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_CONTINUITY/P112_RECOVERY_STATUS_CONSUMER_EVICTION_SEMANTICS_AUDIT_V1_2026-10-07.md): after unresolved journal evidence is evicted, current state cannot distinguish EVICTED from NEVER_SEEN. No new retention/identity patch is authorized by that finding.
- [GLOBAL-AUDIT-109](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/docs/nexo/NEXO_GLOBAL_AUDIT_109_STOP_REVOCATION_AUTHORITY_RETENTION_2026-09-28.md): local STOP/checkpoint/cancellation cannot establish current authority or absence of an external effect; the enforcement point must be downstream and independent of model compliance.
- [AB104.999R / AB105.000R](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/docs/nexo/AB104_999R_evidence_coverage_reason_scope_audit_2026-09-29.md): missing evidence and aggregate completion must preserve reason, scope and coverage; terminal aggregate state cannot silently widen proof.

## Current source shape and Nexo/Lúmina boundary

- `scripts/assistants.mjs` loads the canonical **simulation** state, creates a mission, persists its plan and returns a report. It does not execute a mission step.
- `scripts/simulate.mjs` owns the Lúmina/world-state lock, expected-revision check, temporary snapshot write/rename, and currently serialized `nexoMemory`.
- The fact that the Lúmina simulation snapshot currently carries `nexoMemory` is prototype integration evidence, **not proof that Lúmina owns Nexo's canonical continuity state**. The Maestra invariant remains `Lúmina ≠ Nexo`.
- `src/nexo/runtime.js` exposes `executeNexoStep()` and `executeLuminaNexoStep()`, but its `persistPreparedIntent` argument has no canonical production owner.
- `src/nexo/effect-adapter.js` can mutate the working simulation and journal in memory. The callback seam alone is not durable evidence.
- `src/nexo/core/protected-transition.mjs` has its own ports and conditional commit, but it is not composed with the mission runtime/effect lifecycle. The default effect-boundary port is NOT_IMPLEMENTED.
- No evidence establishes a Nexo-owned canonical persistence/continuity owner or a current constitutional authority gate for protected external effects. Those effects remain STOP.
- Therefore `persistState()` can only be used to validate a bounded Lúmina simulation adapter/test harness. It must not be promoted into Nexo's canonical state owner or authority source. Nexo's own state/persistence boundary must be specified separately before production execution.

## Required execution-owner contract before implementation

The owner must be the one explicit component that coordinates a mission step with Nexo's canonical state/persistence owner. This is a responsibility boundary, not a new queue, identity system, global revision, or trust root. The existing Lúmina `persistState()` is not that owner; it may only back a clearly labeled simulation test harness.

1. **Admission before effect:** verify that the requested mission/step is the one being admitted and that its operation contract permits this exact action/target. If authority/permission evidence is absent or UNKNOWN, return STOP/UNKNOWN before dispatch.
2. **One canonical state lineage:** work from Nexo's own loaded canonical snapshot and its revision/fencing semantics, once specified. Do not assume Lúmina's `world-state.json` or `stateRevision` is Nexo's canonical authority. In the simulation test harness only, the simulation's `nexoMemory` and memory passed to runtime must be the same owned state graph, not parallel copies.
3. **PREPARED durability before dispatch:** the owner supplies `persistPreparedIntent`; it must commit the snapshot containing the prepared entry using existing `persistState(expectedRevision, stateRevision)` semantics before the handler is allowed to run. A missing callback or revision conflict must prevent dispatch.
4. **Terminal snapshot after local effect:** for an allowed local simulation effect, persist the resulting world/agents, mission outcome, and terminal journal result together in one canonical snapshot/revision transition. Do not claim this is atomic with an external provider effect.
5. **Crash/revision conflict:** after PREPARED is durable, any exception or failed final snapshot leaves the durable operation unresolved. Discard stale working state and reload canonical state; never redispatch because a process restarted or because a caller requested a new mission.
6. **Reconciliation:** a prepared operation can be terminalized only by an operation-specific verifier grounded in the operation contract, with source provenance, scope, freshness, causality and declared assurance. If no such source exists, retain UNKNOWN and block successor planning where the causal dependency is unresolved.
7. **No scope creep:** do not add epochs/tokens/queues/tombstones/retention schemes/transaction wrappers without an identified contract requirement and an audit demonstrating why the existing primitive cannot satisfy it.
8. **Separate protected external effects:** no production execution path may treat the local simulation adapter, a model, a checkpoint, a caller callback, or a journal status as constitutional authority or as proof of external-effect truth. Protected effects remain STOP until the independent authority/effect boundary exists.

## Non-goals and proof limits

- This document does not authorize an executor implementation or automatic mission execution from `scripts/assistants.mjs`.
- Existing `persistState` revision/lock/snapshot semantics are a persistence primitive, not a universal semantic fence and not a transaction with an external provider.
- No exactly-once, power-loss durability, global STOP, external-effect absence, or constitutional authority claim is made.
- This gate does not close P112 or Step 7. It defines the missing ownership contract needed before connecting the existing primitives.

## Next exact work

1. First define Nexo's own canonical state/persistence ownership boundary and its relation to the existing mission runtime; do not inherit Lúmina's persistence as Nexo's source of truth.
2. Design the owner as a narrow integration of the existing mission runtime and that Nexo-owned boundary; do not add a parallel execution engine.
3. Specify the permitted-action/authority input that the owner must receive. If no legitimate source exists, keep the owner non-executing rather than manufacture authorization.
4. Add fault-injection tests for: prepare persistence failure (handler count 0), revision conflict before dispatch (handler count 0), crash after durable PREPARED, local mutation before terminal snapshot, terminal snapshot conflict, restart reconstruction, and unresolved effect blocking redispatch/replan.
5. Run CI at the exact source+test head and preserve run IDs.
