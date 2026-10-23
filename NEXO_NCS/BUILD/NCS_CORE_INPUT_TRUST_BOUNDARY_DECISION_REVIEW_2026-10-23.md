# NCS — Core input trust-boundary decision review

Date: 2026-10-23  
Branch: `ncs-clean-architecture`  
Status: **DESIGN REVIEW ONLY — NO TRUST MODEL SELECTED; NO RUNTIME CHANGE**

## Purpose

Continue from the existing Proxy-traps STOP finding without repeating closed audits or adding another narrow guard. The question is not whether ordinary accessors can be rejected; several boundaries already do that. The unresolved question is: **which caller is allowed to supply live JavaScript objects to the protected Core, and how is that caller/data provenance established?**

## Source facts inspected

1. `src/nexo/core/contracts.mjs` exports `assertContractInput`. Its graph validation uses reflective operations including `Object.getPrototypeOf`, `Reflect.ownKeys`, and `Object.getOwnPropertyDescriptor`. On a Proxy these can invoke caller-defined traps. This is not repaired by accessor checks.
2. `src/nexo/core/protected-transition.mjs` calls `assertContractInput(input, ...)` at the public `executeProtectedTransition(input)` boundary, and validates state and multiple port results the same way. Therefore the question affects a central Core boundary, not only one runtime wrapper.
3. `src/nexo/core/mission-admission-contract.mjs` independently validates JSON-shaped mission inputs and resource limits. It too uses reflection on live objects; its name and JSON-shaped constraints do not mean the value arrived as parsed JSON.
4. `src/nexo/core/reconciliation.mjs` has its own reflective shape/data validation. Malformed envelope input becomes `INVALID`; malformed evidence becomes `UNRESOLVED`. It must not be casually converted to a different error model.
5. `src/nexo/runtime.js` has public runtime options guards and uses the shared contract guard for nested mission/adapter structures. These reduce ordinary-object risks but do not establish a no-caller-code-execution guarantee for Proxies.
6. `src/nexo/core/ownership.mjs` exposes injected capability ports. The existence of a port interface does not itself authenticate the object or the code that supplied it.
7. `tests/nexo/core-contracts.test.mjs`, `tests/nexo/reconciliation.test.mjs`, `tests/nexo/mission-admission-options-input-guard.test.mjs`, `tests/nexo/mission-admission-wrapper-input-guard.test.mjs`, `tests/nexo/mission-draft-preview-input-guard.test.mjs`, and runtime input-guard tests establish existing ordinary-object and admission semantics. They do not prove Proxy isolation.

This is a source-level mapping, not a claim that all external call sites have been exhaustively inventoried. The next implementation decision depends on tracing the actual callers of protected constructors, reconciliation, mission admission, and the public runtime entrypoints.

## Candidate trust models (not yet selected)

### A. Serialized-data ingress for untrusted callers

Untrusted callers supply bounded bytes/text through a dedicated ingress. A trusted parser creates the object graph inside the boundary; the Core validates that internally created graph before use.

Before implementation, specify:
- exact encoding and parser;
- maximum wire size, nesting, node count, and aggregate strings;
- duplicate-key policy;
- number and Unicode semantics;
- handling of malformed input and resource exhaustion;
- which entrypoints accept wire data and which accept already-admitted internal data;
- how data is bound to provenance/claim and cannot be confused with caller-created live objects.

This is the strongest candidate when the requirement is to avoid inspecting arbitrary caller-controlled object graphs. JSON parsing alone is not a complete authority or provenance system, and internal post-parse validation still needs bounded semantics.

### B. Explicit trusted in-process caller boundary

Live JavaScript object graphs are accepted only from a constrained same-process caller set. Documentation and APIs explicitly disclaim hostile-object/Proxy isolation at those interfaces.

Before implementation, specify:
- which modules/capabilities are trusted to call each entrypoint;
- how those calls are constrained in the actual runtime/build topology;
- which data can cross from untrusted sources into those trusted modules;
- how public APIs prevent accidental bypass;
- that reflective validation may invoke Proxy traps if an untrusted object crosses the boundary.

A comment saying “trusted” is insufficient if the runtime does not enforce or structurally constrain the caller set.

### C. Another enforceable root design

Permitted only if it establishes a verifiable boundary equivalent to the intended threat model. Do not add a helper that attempts to identify all Proxies using the same reflection traps; JavaScript provides no general reliable Proxy detector.

## Comparative assessment

| Criterion | A: serialized ingress | B: trusted in-process callers | C: alternate design |
|---|---|---|---|
| Reject caller-controlled Proxy traps before inspecting the graph | Potentially, at a strictly enforced wire ingress | No, unless untrusted values are excluded structurally | Must be demonstrated |
| Migration scope | Potentially broad: API/call-site changes | Broad trust/topology documentation and enforcement | Unknown |
| Preserves current error contracts automatically | No; mapping must be designed | More likely, but still needs explicit mapping | Unknown |
| Proves owner authority | No | No | No, unless independently designed |
| Can be selected from source inspection alone | No | No | No |

## Recommendation for owner review

Do not change runtime contracts yet. First produce a caller matrix for each public Core boundary:
- entrypoint and exact file/line;
- caller(s) and whether they accept user/provider/plugin data;
- data form at ingress (bytes/string vs live object);
- existing size/depth/resource controls;
- failure outcome contract;
- whether the call can reach protected state/effects;
- current CI/test evidence.

Then select a single trust model per boundary class and define an explicit conversion/admission path. A serialized ingress at a genuine external boundary and admitted internal records downstream may coexist, but must be represented as two explicit APIs; never silently accept both as equivalent trust levels.

If the caller matrix cannot prove an enforceable trust boundary, record it as unresolved and stop before refactoring.

## Non-goals and state

- This review does not establish a deployed exploit or adversarial production path.
- It does not prove that serialization alone establishes identity, authority, integrity, or durable state.
- It does not authorize device wiring, commissioning, production dispatch, or effects.
- It does not reopen closed AB/P audits unless new code evidence changes their premises.

Constitutional status remains: M0 `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
