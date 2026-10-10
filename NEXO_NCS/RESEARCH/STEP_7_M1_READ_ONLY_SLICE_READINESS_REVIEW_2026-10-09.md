# STEP 7 / M1 — Read-only Slice Readiness Review — 2026-10-09

Status: DESIGN REVIEW COMPLETE — M1 SEMANTICALLY BOUNDED, NOT IMPLEMENTATION-READY; NO CODE OR TESTS CHANGED.

## Scope

Review the existing M1 read-only interaction candidate against the existing claim-relative deployment/failure-domain inventory, current source tree, package manifest, and prior local-inference feasibility check. This is not a new client taxonomy, root-selection exercise, or commissioning decision.

## Evidence checked

- `NEXO_NCS/BUILD/STEP_7_M1_READ_ONLY_INTERACTION_BOUNDARY_CANDIDATE_2026-10-08.md`
- `NEXO_NCS/BUILD/STEP_7_CLAIM_RELATIVE_DEPLOYMENT_FAILURE_DOMAIN_INVENTORY_2026-10-09.md`
- `NCS/STEP_7_LOCAL_ONLY_INFERENCE_REPOSITORY_FEASIBILITY_CHECK_2026-10-08.md`
- `package.json`
- `src/nexo/runtime.js`
- Current NCS branch tree for `src/nexo/` and `tests/nexo/`

## Findings

### 🟢 The semantic M1 boundary is appropriately narrow

M1 can be defined as user-requested read-only text interaction: request content plus only explicitly permitted ephemeral context, returning generated content and honest unavailability/uncertainty. Generated text remains untrusted content; it cannot create authority, permission, verified truth, persistent memory, or an external effect.

The exclusions are important and should remain: no Lúmina simulation state, no credentials/Vault, no durable memory, no tools/effects, no implicit retrieval/network context, and no remote fallback.

### 🔴 The existing runtime is not an M1 client/runtime

The current `src/nexo/runtime.js` imports the Nexo orchestrator, assistant-memory functions, and `simulation-adapter.js`; its execution path includes simulation actions and memory persistence. Reusing that runtime for M1 would cross the explicit boundary into the Lúmina/simulation path and persistent memory. Do not retrofit M1 into that runtime merely to make something appear implemented.

### 🔴 No repository-grounded local inference deployment exists

The prior bounded feasibility check found no concrete Nexo mobile client, local model/inference path, or enforceable no-egress mechanism. The current `package.json` exposes simulation/assistant/test scripts and no declared dependencies. The existing Core contracts and tests cover semantics for protected transitions; they do not supply a user-facing local conversation client or model runtime.

Therefore the following remain design intentions, not demonstrated properties:
- local inference actually runs;
- every outbound path is blocked;
- remote fallback cannot occur;
- conversation content is not persisted by runtime, logs, caches, diagnostics, or the platform;
- the OS/process boundary prevents bypass.

A UI setting or code-level promise is not sufficient evidence for any of these claims.

### 🟠 What can safely be done next

The only useful next step is a separately scoped **analysis-only M1 client design**: compare a small number of concrete implementation routes against the user's actual constraints, list dependencies and failure modes, and define a minimal prototype boundary plus test plan. It must not change code, add dependencies, select/install a model, access private-device state, add network or persistence paths, or claim privacy/no-egress enforcement. A concrete implementation choice and implementation authorization must be obtained before building.

If no route can meet the required boundary with evidenceable enforcement, the correct result is to report that limitation rather than weakening M1 or silently using the existing simulation runtime.

## Relation to Step 7 trust gate

M1 read-only interaction does not need to establish Genesis authority if it remains a non-effectful, non-persistent proposal path. Conversely, a successful M1 prototype would not prove or bypass P1/P2, offline currentness/revocation, protected establishment, recovery, or final enforcement. Protected commissioning remains UNKNOWN/STOP.

## Decision

- Reuse the existing inventory and M1 contract; create no duplicate generic abstraction.
- Do not implement M1 in the current simulation-oriented runtime.
- Recommend a bounded analysis-only client-design phase as the next independent work item, subject to its scope remaining analysis-only.
- No code, dependencies, tests, runtime paths, trust roots, credentials, keys, ceremonies, or protected effects were changed or authorized by this review.
