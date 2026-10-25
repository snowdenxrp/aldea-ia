# NCS — Nexo/Lúmina separation contract (D1 design proposal)

Date: 2026-10-24 (local project checkpoint; source facts include the 2026-10-25 read-only review)
Repository: `snowdenxrp/aldea-ia`
Branch: `ncs-clean-architecture`
Status: DESIGN PROPOSAL — NOT IMPLEMENTATION AUTHORIZATION

## 1. Purpose and status

Define a reviewable boundary contract for separating Nexo from Lúmina without disabling Lúmina's legitimate behavior or silently migrating legacy data. This document narrows D1 design; it does not close D1, prove runtime isolation, authorize protected effects, or establish a valid Nexo root.

Status vocabulary:
- **OBSERVED**: directly supported by source/history reviewed at the recorded checkpoint.
- **TARGET**: intended contract, not yet demonstrated in runtime.
- **OPEN/UNKNOWN**: evidence or a decision is missing; do not infer PASS.
- **OUT OF SCOPE**: explicitly excluded from M0 or requires a separate authorization.

## 2. Non-negotiable boundary

**TARGET:** Nexo must operate without importing, invoking, or requiring Lúmina. Lúmina must continue its own supported operation without opening Nexo Continuity, creating/registering Nexo missions, or implicitly migrating Nexo data during an ordinary Lúmina command.

This is a two-sided independence objective, but the first extraction boundary is the ordinary Lúmina entrypoint because its current cross-domain responsibilities are evidenced and the Nexo architecture is more completely specified.

### Nexo-owned responsibilities

- Nexo identity, Continuity, Chronicle, mission lifecycle, instance configuration, and Nexo persistence belong to Nexo application/CLI and Nexo-owned stores.
- A normal Nexo operation must enter through an explicit instance-root/admission contract; a raw store path or direct owner factory is not, by itself, proof of admission.
- Lúmina must not be a required runtime dependency for Nexo Core or Nexo persistence.

### Lúmina-owned responsibilities

- Lúmina assistants, learning memory, simulation, and canonical world-state remain Lúmina responsibilities.
- Do not “fix” the boundary by disabling `createLearningMemory()`, `learnFromReports()`, `persistState()`, or other legitimate Lúmina persistence.
- Do not add Nexo owner/mission operations to the ordinary Lúmina assistants or simulation route.

### Optional integration

- No integration adapter is required to establish independence.
- If later explicitly approved, an adapter must specify direction, versioned data contract, source-of-truth ownership, allowed fields, permissions, failure behavior, persistence ownership, and audit/evidence requirements.
- An adapter must not create a reverse dependency from Nexo Core to Lúmina, and its existence must not make either system's startup depend on the other.

## 3. Legacy state and migration

- Preserve legacy data until an explicit migration/recovery plan is authorized and verified.
- No silent deletion, heuristic merge, normal-operation import, or dual-write of legacy `persisted.nexoMemory`.
- A one-time migration from legacy state into the Nexo-owned store is a separate operation with its own input inventory, source/destination validation, backup/rollback policy, idempotence contract, evidence, and explicit operator approval.
- Preserve the existing invariant that Lúmina's canonical world-state writer does not serialize `nexoMemory`.
- The presence of an old migration bridge is not permission to keep invoking it during ordinary Lúmina runs.

## 4. Observed cross-boundary facts at reviewed source checkpoint

The read-only review at source checkpoint `ef56184729ae710d7cd3f196d4e34028595a42eb` found:

1. Git history added Nexo mission orchestration to `scripts/assistants.mjs`, then put Nexo plan recording in Lúmina learning memory, then routed legacy Nexo mission memory through simulation/world-state.
2. Current `scripts/assistants.mjs` opens Nexo Continuity while also using Lúmina learning memory and simulation persistence.
3. Current `scripts/simulate.mjs` has a Nexo Continuity edge as well as Lúmina simulation persistence.
4. Nexo Chronicle has a parent CLI and an independently executable child CLI. Both currently accept store-path options; the reviewed contract does not implement the proposed single explicit `--root` boundary.
5. Path-based store factories, owner APIs, repair APIs, and direct query/preview paths exist. The bounded identifier sweep is not a complete AST/call graph and cannot prove the absence of dynamic, computed, or external callers.
6. The runtime wrapper for the Option A repair exclusion returns blocked, but that wrapper does not prove all lower-level repair exports are unreachable or safe for every caller.

These are source-level observations, not runtime or CI verification. The exact source checkpoint and limitations are recorded in the D1 handoff and manifest.

## 5. Entry-point contract to be resolved in D1

### Lúmina entrypoints

- Ordinary Lúmina assistants/simulation operations must remain Lúmina-only.
- They must not open a Nexo Continuity owner, create/register a Nexo mission, or perform an implicit Nexo migration.
- They must retain their legitimate Lúmina learning-memory and world-state behavior.
- Any compatibility or migration route must be separately named and explicitly invoked; no hidden side effect during ordinary operation.

### Nexo entrypoints

- Normal Nexo operation receives one explicit `--root <directory>`; no environment fallback and no legacy store-path fallback.
- Reject mixed `--root` plus separate legacy store paths.
- Canonicalize and validate an existing root before deriving store paths. Normal operations do not initialize missing roots; bootstrap is separate and explicit.
- Parent Chronicle CLI parses/routes only. It must not hold a non-reentrant root lock while waiting for the child.
- Independently invoked child Chronicle CLI validates the same root contract and owns admission for its process.
- In-process query/preview paths must enter the admission boundary before their first canonical persistent snapshot read. D2 must specify whether every preview is inside that scope.
- Raw path-based store factories and owner APIs are internal/test primitives unless each caller is proven to enter through the admitted instance boundary.
- Missing/invalid root, contradictory configuration, ambiguous store state, or uncertain admission must fail before initialization, mutation, or protected effects.

These are TARGET requirements. They do not imply that the current code already enforces them.

## 6. Closure criteria before D1 design can be marked closed

D1 design stays OPEN until all of the following have evidence:

1. **Entrypoint inventory:** every known executable CLI, exported application API, repair API, query/preview route, compatibility wrapper, and parent/child process edge has a caller classification. Dynamic/external callers remain explicitly UNKNOWN unless independently resolved.
2. **Boundary decision:** ordinary Lúmina routes are Lúmina-only, with Lúmina persistence preserved and migration separated.
3. **Root contract:** explicit root, canonicalization, missing-root behavior, contradictory-option behavior, and separate bootstrap are consistent across parent, child, and in-process application entrypoints.
4. **Admission scope:** the first persistent read and any snapshot/preview operations are defined; no path bypass is assumed safe merely because a CLI is guarded.
5. **Process/lock ownership:** parent-child lock ownership avoids self-deadlock; root-lock acquisition/release uncertainty and re-admission behavior are delegated to D2, not guessed here.
6. **API visibility:** each path-based factory/owner/repair export is either classified as internal/test-only by enforceable structure or has an explicit admitted caller contract. A comment alone is not a guard.
7. **Failure matrix:** invalid/missing root, conflicting options, malformed state, child invocation, lock acquisition failure, uncertain release, and legacy data all have explicit fail-closed expected outcomes.
8. **Evidence labels:** source observations, proposed design, tests, CI, and runtime evidence are kept separate.

D1 implementation remains unauthorized until the user separately authorizes implementation. A closed design document alone is not that authorization.

## 7. D2/D3 dependencies and excluded claims

D1 does not decide:
- the root-lock primitive or stale-lock recovery;
- exact root-lock critical section for reads/previews;
- uncertain lock-release semantics or safe re-admission;
- atomic bootstrap guarantees on the actual filesystem;
- migration/cutover of legacy state;
- authority to commission protected effects.

Maintain existing per-store lock contracts until D2 decides otherwise. Do not mechanically unify them. Do not add retries, queues, tombstones, transaction wrappers, or new lifecycle states merely to conceal uncertainty.

Isolation does not prove authority. Protected effects remain STOP unless legitimate authority and the real execution boundary are separately evidenced.

## 8. Checkpoint / evidence state

- Source checkpoint reviewed: `ef56184729ae710d7cd3f196d4e34028595a42eb`.
- Named-API source sweep: 188 JS-family blobs at that checkpoint; useful bounded evidence, not a complete semantic call graph.
- Latest documentation checkpoint before this proposal: `a2a65b088b9a93459fa245564bd580a3b206f918`.
- This document is design-only. No runtime, tests, workflows, or data files are changed by this document.
- No tests or CI are claimed by this document.
- Canonical project state: M0 INCOMPLETO; D1-DESIGN OPEN; D1-IMPLEMENTATION unauthorized; D2/D3 OPEN; authorization NOT_EVALUATED; legitimate root PENDING/UNKNOWN; protected effects STOP.
