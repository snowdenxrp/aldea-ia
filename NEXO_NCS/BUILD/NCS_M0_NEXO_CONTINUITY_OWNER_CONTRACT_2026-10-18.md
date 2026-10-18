# NCS M0 — Nexo-owned operational continuity boundary contract

Date: 2026-10-18
Status: STORE + SEMANTIC OWNER MODULES IMPLEMENTED; RUNTIME INTEGRATION PENDING; LOCAL FILE DURABILITY LIMITS EXPLICIT

## Implementation update — 2026-10-18

`src/nexo/core/continuity-store.mjs` now implements the first independent store module. It provides strict `loadCurrent()`, explicit `initialize(snapshot)`, and conditional `commitIfCurrent(expectedRevision, candidate)` over a separate file path. The store envelope is validated against `NEXO_OPERATIONAL_CONTINUITY` and excludes Lúmina state, learning analytics, and authority fields.

This is not yet wired as the runtime's canonical owner: current mission execution still receives the legacy `createLearningMemory().nexo` shape and current simulation persistence still serializes `nexoMemory` inside `world-state.json`. No migration, dual-write, or runtime switch has been performed. The owner layer adds mission admission and a durable PREPARED checkpoint bound to the stored mission/step/action/target. It intentionally cannot settle PREPARED; reconciliation returns blocked until a real independent verifier/source exists. Exact-head CI passed at `5f7f9b5a88ea120abb7df8af065d96cf129715d5` (mission/restart `39099113776`, STEP 4 `39099113793`, STEP 5 `39099113804`).

The store uses a local filesystem lock and temp-file rename for cooperating local writers. It does not claim fsync/power-loss durability, rollback resistance, network-filesystem safety, distributed linearizability, or external-effect verification. The local store revision is not an authority epoch or global fence.

## Implementation update — 2026-10-18

The standalone store is now accompanied by `src/nexo/core/continuity-owner.mjs` and `src/nexo/core/continuity-operations.mjs`. The owner records missions and a durable PREPARED obligation bound to the stored mission/step/action/target. Existing PREPARED returns UNKNOWN and cannot be redispatched. Durable PREPARED is not authorization; the result explicitly says `authorization: NOT_EVALUATED`.

Snapshot operations are independent of `createLearningMemory()` and do not include learning analytics. Completion claims require a non-empty evidence-source label, but that label is not authenticated and does not prove independent verification. The owner still cannot reconcile/terminalize PREPARED because an independent operation-specific verifier is not wired.

Exact-head CI passed at `3e5dbcd37a8e070ae6580357a1798a876070f7e4`: mission/restart `39099497697`, STEP 4 `39099497703`, STEP 5 `39099497743`.

Runtime integration remains pending: `executeNexoStep` and the existing effect adapter still use the legacy `createLearningMemory().nexo` shape, and `scripts/simulate.mjs` still serializes `nexoMemory` with Lúmina state. No migration or dual-write has occurred.

## Purpose

Define the minimum boundary needed to give M0 a Nexo-owned operational continuity store without confusing that store with Lúmina's world state, learning memory, or constitutional authority.

This is derived from existing persisted architecture, not a new authority root:
- [Canonical object ownership / authority / persistence matrix](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/docs/nexo/NEXO_CANONICAL_OBJECT_OWNERSHIP_AUTHORITY_MUTABILITY_PERSISTENCE_MATRIX_V1_2026-09-24.md)
- [State atomicity groups and consistency boundaries](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/docs/nexo/NEXO_STATE_ATOMICITY_GROUPS_CONSISTENCY_BOUNDARIES_V1_2026-09-24.md)
- [A05/A06 authoritative state linearization baseline](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/docs/nexo/NEXO_CLEAN_ARCHITECTURE_A05_A06_AUTHORITATIVE_STATE_LINEARIZATION_V1_2026-09-24.md)
- [P112 execution-owner protocol reconciliation](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_CONTINUITY/P112_EXECUTION_OWNER_PROTOCOL_RECONCILIATION_V1_2026-10-07.md)
- [AB104.150](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_CONTINUITY/AB104.150.md) and [AB104.151](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_CONTINUITY/AB104.151.md)

## Current contradiction to resolve

The current prototype nests Nexo mission data under `createLearningMemory().nexo` and serializes `simulation.nexoMemory` inside the Lúmina `world-state.json` snapshot. That is useful prototype persistence evidence, but it couples Nexo operational continuity to Lúmina simulation persistence and to a mixed learning-memory structure.

The architectural invariant remains:

- `Nexo ≠ Lúmina`
- `Nexo operational continuity ≠ learning analytics`
- `persisted record ≠ authority`
- `valid JSON/schema ≠ current canonical history`
- `local commit ≠ external-effect truth`

Do not rename the existing field and declare the separation solved. The Nexo store must have an explicit owner and a persistence boundary independent of the environment state it may operate on.

## Scope: operational continuity only

The continuity store owns durable operational history required to reconstruct M0 after restart. It does **not** issue identity, authority, delegation, permission, STOP release, or constitutional succession.

Minimum operational records:

1. Mission plan and step context needed to reconstruct the exact action, target, dependencies and verification requirements.
2. Attempt/outcome records needed to reconstruct each step without regressing completed dependencies to planned.
3. Execution records that bind the existing mission/step operation identity to the reported adapter result.
4. Effect-journal records, especially unresolved `prepared` obligations.
5. The causal references needed to connect each prepared operation to its mission and step.

Learning runs, lessons, patterns, planner caches and analytics are non-authoritative and must not be able to erase or promote the operational records above.

## Required invariants

### C1 — No fabricated state

A safety-sensitive load may return a validated snapshot or an explicit failure/UNKNOWN result. It may not turn missing, malformed, or unrecognized continuity into an empty store or revision zero.

The new `assertNexoContinuityMemoryShape()` enforces the in-memory shape and prepared-entry context. `src/nexo/core/continuity-snapshot.mjs` now defines a versioned standalone operational snapshot and a detached projection from the prototype memory shape. Neither establishes store provenance/currentness or persists the snapshot.

### C2 — Prepared obligation closure

Every `prepared` journal entry must retain a matching persisted mission and step with the same action and target. Missing/mismatched context blocks execution and replan. Retention must preserve the mission and the attempt/execution history needed to interpret it.

A prepared entry is still UNKNOWN; it is not proof that the effect did or did not occur.

### C3 — Exact effect identity

The current `missionId:stepId` idempotency key remains the existing prototype identity. The store must bind it to the persisted action/target and operation contract. It must not be treated as a universal provider idempotency key without a provider-specific contract.

### C4 — Conditional persistence, not authority

A store may provide a conditional commit/compare-and-set to reject stale writers. Any store-local revision is a storage concurrency primitive only; it is not an authority epoch, global fence, proof of currentness after restore, or external-effect verifier.

### C5 — External and environment boundary

The operation flow must keep these facts distinct:

`NEXO INTENT` → `ENVIRONMENT/PROVIDER ATTEMPT` → `OBSERVATION` → `RECONCILIATION` → `VERIFIED CLAIM`

A commit to the Nexo store cannot atomically prove a mutation in Lúmina's world state or an external provider. The boundary requires operation-specific reconciliation when those stores/effects can diverge.

### C6 — Authority remains independent

The operational continuity store may preserve evidence and prior decisions, but it cannot infer current authority from:
- the fact that a mission exists;
- a prepared or terminal journal status alone;
- a successful snapshot restore;
- a process/lease owner;
- model output or a caller callback.

Protected external effects remain STOP until the independent authority/final-effect boundary exists.

## Snapshot contract implemented; owner interface still required

The current core candidate is `NEXO_OPERATIONAL_CONTINUITY` schema version 1, with exactly these top-level fields: `schema`, `schemaVersion`, `missions`, `attempts`, `doNotRepeat`, `executions`, `effectJournal`. It excludes learning runs/lessons/patterns, environment state, and authority fields. Unknown extra fields are rejected rather than silently accepted. `projectNexoContinuitySnapshot()` returns a detached copy from the prototype memory structure; it does not persist or migrate it.

This schema is a contract candidate, not proof of an approved migration or deployed store. Existing `createLearningMemory().nexo` remains the legacy/prototype shape until a separately audited migration path exists.

## Required owner interface before choosing an adapter

The owner must expose the minimum semantic operations, independent of storage technology:

- `loadCurrent()`: return a structurally valid snapshot plus its store-local conditional-commit context, or explicit UNKNOWN/error. No fallback.
- `commitIfCurrent(expectedContext, candidate)`: commit a detached candidate only if the store's authoritative preconditions still match; distinguish committed, conflict, failed and unknown outcomes.
- `validateContinuity(snapshot)`: run the Nexo core shape/context contract before execution/replan.
- `recordPrepared(operation)`: persist the prepared obligation before any handler can dispatch.
- `recordTerminalResult(operation, evidence)`: persist terminal local outcome and evidence with the operation history; external outcomes remain UNKNOWN until operation-specific reconciliation is accepted.
- `reconstruct(missionId)`: reconstruct from the validated current snapshot without silently normalizing missing history.

These names describe required semantics, not a mandate to add six independent services. A single narrow owner may implement them. No owner implementation exists yet.

## Atomicity / linearization gates

Before implementation, map the local transition to A05/A06 and atomicity groups:

- identify the exact canonical write set for Nexo operational continuity;
- define the linearization point for the Nexo store commit;
- define the separate linearization point for the environment mutation, if any;
- prove how a crash between those points is reconciled;
- prove stale candidates cannot overwrite a newer canonical snapshot;
- prove that no caller can dispatch before durable prepared intent;
- prove a terminal result and its evidence are committed together in Nexo continuity;
- define the evidence source needed to reconcile an effect after restart.

Do not create one global transaction for planner/model/learning/authority/environment state. Do not add a queue, retry layer, tombstone scheme, new identity system, global revision, or storage technology until the above map shows a concrete requirement.

## Implementation order

1. Keep the continuity shape contract and runtime fail-closed guards.
2. Snapshot shape is now implemented as a contract candidate; define the Nexo-owned conditional-commit semantics, separated from Lúmina.
3. Audit whether the selected persistence primitive meets P0/P1 durability and restore/currentness requirements.
4. Implement the smallest owner for **bounded local operations only**, with an explicit operation allowlist and fault injection. No protected external provider.
5. Test crash cuts: before prepared commit; after prepared commit before dispatch; after local handler mutates its isolated candidate; before terminal commit; terminal commit succeeds but response is lost; stale concurrent writer; restart with prepared/terminal/malformed context.
6. Add external provider paths only after provider-specific authority, exact effect binding and reconciliation exist.

## Status

- Contract candidate: documented.
- Standalone snapshot shape/projection: IMPLEMENTED in core; not persisted.
- Nexo-owned canonical operational store/conditional commit: NOT IMPLEMENTED.
- Runtime/store integration: NOT IMPLEMENTED.
- Protected external execution: STOP.
- Prepared external outcome: UNKNOWN.
- M0: INCOMPLETE.
- STEP 7: OPEN / STOP / UNKNOWN.
