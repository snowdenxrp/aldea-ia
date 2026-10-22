# NCS M0 — store constructor options validated before property access

Date: 2026-10-22
Status: IMPLEMENTED; 6/6 triggered CI workflows SUCCESS on exact code/test SHA

## Finding

Both public store factories, `createNexoContinuityStore()` and `createNexoChronicleStore()`, accepted configuration through parameter destructuring. A getter on `filePath`, `fsModule`, `lockDeadline`, or `lockWaitMs` could run before the factory validated configuration.

This is a constructor input-contract defect. It does not demonstrate file-path escape, authority bypass, or protected-effect execution.

## Correction

Both factories now accept an options record and inspect the prototype and own descriptors for the four consumed configuration fields before reading values. Accessors and non-enumerable configuration properties are rejected; defaults are applied only after safe extraction. Reflection errors fail closed. Existing path and lock-wait validation remains in place.

The change does not establish a filesystem sandbox and does not neutralize arbitrary Proxy traps or hostile processes mutating trusted local paths.

## Regression

- `tests/nexo/continuity-store.test.mjs`: a getter-backed `filePath` must throw `NEXO_CONTINUITY_STORE_PATH_REQUIRED` without invoking the getter.
- `tests/nexo/chronicle-store.test.mjs`: a getter-backed `filePath` must throw `NEXO_CHRONICLE_PATH_REQUIRED` without invoking the getter.

## Commits and CI

- Continuity store runtime: [27be3d92cee91d7b9135a80ebe1fba6e4b61b765](https://github.com/snowdenxrp/aldea-ia/commit/27be3d92cee91d7b9135a80ebe1fba6e4b61b765)
- Chronicle store runtime: [b9c247a84178d7b288761c526c0d12d70d266902](https://github.com/snowdenxrp/aldea-ia/commit/b9c247a84178d7b288761c526c0d12d70d266902)
- Continuity store regression: [823f1f91c1117cc9a2e15cc6a69a9570c3e0f089](https://github.com/snowdenxrp/aldea-ia/commit/823f1f91c1117cc9a2e15cc6a69a9570c3e0f089)
- Chronicle store regression and exact combined SHA: [b5a67903510b4319624d33ebfa723c938a3c59d3](https://github.com/snowdenxrp/aldea-ia/commit/b5a67903510b4319624d33ebfa723c938a3c59d3)

Six workflows triggered for exact SHA `b5a67903510b4319624d33ebfa723c938a3c59d3` completed SUCCESS:
- [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188829)
- [bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188828)
- [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188968)
- [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862189087)
- [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188812)
- [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862189002)

This is the set of workflows actually triggered for this SHA, not a claim that every repository workflow ran.

## Scope and canonical state

This hardens configuration extraction for the two local stores. It does not establish path isolation, power-loss durability, legitimate ownership, verifier authenticity, or permission to dispatch protected effects.

M0 remains `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
