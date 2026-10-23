# NCS — Caller matrix for the Core input trust boundary

Date: 2026-10-23  
Branch: `ncs-clean-architecture`  
Status: **PARTIAL INVENTORY — NO TRUST MODEL SELECTED**

## Scope and method

This inventory continues `NCS_CORE_INPUT_TRUST_BOUNDARY_DECISION_REVIEW_2026-10-23.md`. It reads current-branch source files directly for the Core boundary implementations, runtime entrypoints, package test manifest, assistant script, and M0 product gate. GitHub code-search results in this session resolved to an older indexed commit (`b0d610c...`), so search excerpts are not treated as proof of current-branch callsites. Any callsite not directly confirmed from current-branch source remains **UNVERIFIED**, not absent.

Current source fingerprints:
- `src/nexo/core/protected-transition.mjs`: blob `39a602b80cda8f3939b2ffed7e726d06c21b077f`
- `src/nexo/core/mission-admission-contract.mjs`: blob `d4ddd88c6c59827e944f8811d00e52cea336f0c1`
- `src/nexo/core/reconciliation.mjs`: blob `71301297ea0c85315feea7d572f50a51cc9f99d2`
- `src/nexo/core/ownership.mjs`: blob `3b66d07e67df09b058b37716716573f6c17a2099`
- `src/nexo/runtime.js`: blob `9d3d5109753e8ba96fc287c269da275112645523`
- `scripts/nexo-runtime-session.mjs`: blob `f67b6fbe1b6f0098ebf23b35055cc668f96df991`

## Caller / ingress matrix (verified facts vs gaps)

| Boundary | Current entrypoint and input form | Confirmed callers / consumers | Data provenance and controls | Failure contract / effect reach | Status |
|---|---|---|---|---|---|
| Protected transition | `executeProtectedTransition(input)`; accepts a live JS object with `ports`, `proposal`, `state`, `expectedRevision`. Calls shared reflective contract validator on the input and state. | Current package manifest includes `tests/nexo/protected-transition.test.mjs` and `tests/nexo/conditional-commit-persist-state.test.mjs`; the latter test file is known to import/call it from prior evidence. A direct production caller is now confirmed: `src/nexo/application/chronicle-append.mjs` constructs the continuity owner and effect adapter, then calls `executeNexoStepWithContinuityOwner` for the Chronicle append use case. | No serialized ingress is enforced by this function. Caller supplies ports and state as live references. `assertContractInput` rejects ordinary accessors/exotic shapes but reflection can invoke Proxy traps. | Can reach injected `conditionalCommit.commit(candidate)` after authority gate and semantic validation report PASS. The port interface does not authenticate authority. | **HIGH PRIORITY / caller inventory incomplete** |
| Core ports construction | `createCorePorts(input)`; accepts a live options record and injected functions/objects. | Confirmed test usage in `tests/nexo/core-contracts.test.mjs`, `tests/nexo/protected-transition.test.mjs`, and `tests/nexo/conditional-commit-persist-state.test.mjs` from existing test/source references. A production caller exists in `src/nexo/application/chronicle-append.mjs` for the Chronicle append flow; other callers remain unverified. | Constructor reflects on options, then reads injected port objects and methods. Freezing the returned wrappers does not prove the injected implementation is trusted. | Carries `authorityGate`, `conditionalCommit`, and `effectBoundary` capabilities. Missing methods fail with `NEXO_CORE_CONTRACT_NOT_IMPLEMENTED`; this is not identity verification. | **TRUSTED-CALLER CLAIM NOT ENFORCED** |
| Mission admission | `assertNexoMissionAdmission(input, options)`; accepts live JS graphs, nominally JSON-shaped, with bounded node/depth/string/step/dependency limits. | Wrapper/preview/admission tests are listed in `package.json`; the exact current production caller graph has not been exhaustively traced. | Prototype/keys/descriptors are inspected directly. JSON-shaped validation does not establish that the graph came from JSON parsing; Proxy traps remain possible. | Throws admission error codes such as `NEXO_MISSION_CONTEXT_INVALID` and resource-limit codes. Whether every public ingress calls it before other reads is **UNVERIFIED** in this matrix. | **NEEDS CALLSITE TRACE** |
| Reconciliation | `createReconciler().reconcile(input)`; accepts a live envelope with nested case/evidence. | `tests/nexo/reconciliation.test.mjs` is confirmed in package history/source search; no production caller confirmed from the current direct source set. | Reflective descriptor checks; preserves envelope `INVALID` versus evidence `UNRESOLVED`. Proxy traps may run during reflection. | Current reconciler returns `UNRESOLVED` even for structurally valid evidence because no trusted verifier/fence/provenance port is wired. It does not grant authority or commit protected state. | **NO TRUSTED VERIFIER / CALLERS UNVERIFIED** |
| Runtime mission/step APIs | `replanPersistedNexoMission(options)`, `executeNexoStep(options)`, `executeLuminaNexoStep(options)`; options and nested records are live JS values. | `scripts/assistants.mjs` is the assistant CLI consumer and invokes the product repair session only under explicit `--nexo-repair-once`; that session is hard-blocked. A direct current production call to `executeLuminaNexoStep` was not confirmed. | Top-level own-descriptor guard plus nested contract validation exists; neither neutralizes Proxy traps nor authenticates adapters. | Product repair integration gate returns `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted:false`, `dispatchAttempted:false`. Do not infer that every exported runtime function is globally unreachable; only the product gate behavior is directly verified here. | **PRODUCT REPAIR STOP CONFIRMED; FULL CALLER GRAPH OPEN** |
| Core ownership / owner-backed runtime | `executeNexoStepWithContinuityOwner` exported from runtime; owner-backed module is a separate capability-bearing boundary. | Export confirmed in current `src/nexo/runtime.js`; its complete internal callers and owner topology were not traced in this pass. | Requires dedicated source review of `src/nexo/core/owner-backed-runtime.mjs` and its callers; do not infer trust from name or export alone. | May affect continuity-owned state; actual path and gate are not established by this inventory. | **OPEN — NEXT TRACE TARGET** |

## What is established

1. The core input problem is not limited to one wrapper: multiple public functions inspect live object graphs with reflection.
2. A “plain object” or “JSON-shaped” check does not distinguish a parsed, internally owned graph from a caller-supplied Proxy.
3. Capability injection describes what a port can do; it does not prove who supplied the port or whether its code is trustworthy.
4. Reconciliation currently does not promote evidence to authoritative status; its `UNRESOLVED` behavior must be preserved until a verifier/provenance contract is actually designed.
5. Product repair execution remains blocked at the explicit M0 Option A gate. This matrix does not authorize effects.

## Decision not made

Do **not** choose serialized ingress or trusted in-process callers solely from this partial matrix. The exact production call graph remains incomplete, and current indexed code search is stale. A safe next step is a bounded, exact source trace of:
1. `src/nexo/core/owner-backed-runtime.mjs` and its direct imports/callers;
2. all current-branch exports/imports of `executeProtectedTransition`, `createReconciler`, `assertNexoMissionAdmission`, and `executeLuminaNexoStep`;
3. every ingress where CLI, file, provider, plugin, or user data becomes a live object before reaching those boundaries;
4. the owner and mutation boundary for each capability that can commit or dispatch.

If that trace cannot establish enforceable provenance, leave the boundary unresolved and do not refactor into a guessed model.

## Constitutional state

- M0: `INCOMPLETO`
- Authorization: `NOT_EVALUATED`
- Legitimate root: `PENDING/UNKNOWN`
- Protected effects: `STOP`

No runtime code changed in this inventory. This is not a security certification, not proof of a deployed exploit, and not evidence of owner authority or durable protected execution.


## Follow-up source trace — owner-backed runtime and application CLI

Current-branch follow-up inspection:
- `src/nexo/core/owner-backed-runtime.mjs` blob `a7a014489209273ce78d0103afa785728d4c467c` exports `executeNexoStepWithContinuityOwner(args)`. It receives `owner` and `adapter` capability objects supplied through caller arguments. It reads the outer options through own descriptors, then constructs capability views by walking the supplied object's prototype chain and reading method descriptors.
- This improves protection against ordinary accessor properties but is **not a Proxy-trap boundary**: `Object.getOwnPropertyDescriptor` and `Object.getPrototypeOf` remain reflective operations that can invoke Proxy traps. Capability view construction does not authenticate the supplied owner or adapter.
- The owner-backed path does enforce a meaningful operational sequence in source: load canonical continuity state; validate mission/step and dependencies; check handler and reconciliation support; require a committed PREPARED result with expected revision advancement before calling `adapter.executePrepared`; then record execution lineage and reconcile. This is a source-level protocol description, not proof that every caller is authorized or that external effect handlers are trustworthy.
- `src/nexo/runtime.js` re-exports `executeNexoStepWithContinuityOwner`; this establishes a public export path, not a production callsite. Correction from the follow-up trace: `src/nexo/application/chronicle-append.mjs` is a direct production caller. The caller passes `opened.owner` and an adapter built from Chronicle effect contracts. Other callers of the export remain unverified.
- `scripts/nexo-continuity.mjs` is only a compatibility re-export of `openNexoContinuityOwner` from `src/nexo/core/continuity-service.mjs`.
- `scripts/nexo.mjs` routes the independent CLI through `src/nexo/application/index.mjs`. The application index exposes `runNexoChronicleAppend`, read-only continuity queries, and mission draft/request previews. Its header states Chronicle append is the only mutating application use case. This is a distinct narrow application surface from the generic owner-backed runtime export.
- `src/nexo/core/continuity-service.mjs` accepts injected `effectVerifiers` when opening the continuity owner. That is an explicit dependency seam; caller provenance and verifier correctness still require their own trace and contracts.

### Refined next action

Trace the direct implementation of `src/nexo/application/chronicle-append.mjs`, the owner and adapter factories it calls, and the tests that exercise the public CLI path. Separately search/fetch every module that imports `executeNexoStepWithContinuityOwner` on the current branch. Do not conflate the narrow Chronicle CLI with the generic owner-backed runtime. Keep the Proxy-trap finding unresolved and do not add another local guard.


## Correction / stronger current-branch evidence — Chronicle append caller

The follow-up trace resolved one previously open callsite:
- `src/nexo/application/chronicle-append.mjs` blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc` directly imports `executeNexoStepWithContinuityOwner`.
- It creates a shared monotonic lock deadline, opens the Chronicle and continuity stores, constructs Chronicle effect contracts, opens the continuity owner with those verifier contracts, admits a single-step Chronicle append mission, builds an effect adapter from the Chronicle handlers/verifiers, then invokes the owner-backed runtime.
- `tests/nexo/entrypoint.test.mjs` explicitly verifies the public CLI's narrow import graph and that the application service—not the CLI wrapper—imports the owner-backed runtime. `tests/nexo/chronicle-runtime.test.mjs` imports the same runtime and the application use case.
- The public result explicitly preserves `authorization: "NOT_EVALUATED"`; therefore successful Chronicle settlement is not a proof that user/owner authority was evaluated. The use case is narrowly scoped to Chronicle append and does not establish general protected-transition authority.
- This confirms a concrete owner/adapter assembly path for Chronicle append, but **does not** prove that the owner/adapter source is authenticated against hostile in-process callers or that the generic exported runtime is safe for arbitrary live objects. Proxy traps remain unresolved.

The earlier wording that no production caller was confirmed is superseded by this exact current-branch source trace. The broader call graph is still not exhaustive.
