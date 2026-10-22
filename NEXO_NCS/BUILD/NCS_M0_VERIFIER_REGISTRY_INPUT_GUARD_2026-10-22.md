# NCS M0 — verifier registry input descriptors

Date: 2026-10-22
Status: IMPLEMENTED; 5/5 triggered CI workflows SUCCESS on exact code/test SHA

## Finding

The constructor `createNexoContinuityOwner()` built its verifier registry using `Object.entries(effectVerifiers)`. Enumerating entries reads property values and therefore can execute a caller-supplied getter during owner construction, before the registry contract rejects the input.

This is a configuration-input validation defect. It does not demonstrate authority bypass or protected-effect execution.

## Correction

The constructor now:
- accepts only ordinary-object or null prototypes for the registry;
- enumerates own keys and rejects symbols;
- reads each own property descriptor rather than evaluating its value through property access;
- rejects accessors, non-enumerable entries, empty action names, and non-function data values;
- converts inspection failures into `NEXO_EFFECT_VERIFIER_REGISTRY_INVALID`.

The registry is copied into a null-prototype object and frozen as before. This does not neutralize arbitrary Proxy traps; hostile code already executing in the same process remains outside this guard's guarantee.

## Follow-up: outer constructor options

A second read-before-validation existed one level earlier: destructuring `{ store, effectVerifiers }` from the constructor options itself could invoke an accessor before registry validation. The constructor now accepts an options object, inspects its prototype and own descriptors, rejects accessor-backed `store` / `effectVerifiers` options, then reads only descriptor values. This was added after reviewing the full call boundary.

## Regression

`tests/nexo/continuity-contract.test.mjs` covers both:
- an accessor-backed verifier registry, which must throw `NEXO_EFFECT_VERIFIER_REGISTRY_INVALID` without invoking its getter;
- accessor-backed outer `effectVerifiers` constructor options, which must likewise be rejected without invoking the getter.

## Commits and CI

- Registry descriptor guard: [d65245bdbcc20cdee7ebf315d6a65f162bcb894d](https://github.com/snowdenxrp/aldea-ia/commit/d65245bdbcc20cdee7ebf315d6a65f162bcb894d)
- Registry regression: [796219c48fda52dd51e9eec4fa696cb48ec88096](https://github.com/snowdenxrp/aldea-ia/commit/796219c48fda52dd51e9eec4fa696cb48ec88096)
- Outer options descriptor guard: [eb0249e332d450e7b533ebd7309f721f19f43230](https://github.com/snowdenxrp/aldea-ia/commit/eb0249e332d450e7b533ebd7309f721f19f43230)
- Outer options regression: [c192a9b21cef925ac303644a8f3e6a6d8489dcd7](https://github.com/snowdenxrp/aldea-ia/commit/c192a9b21cef925ac303644a8f3e6a6d8489dcd7)

Five workflows triggered for the exact latest code/test SHA `c192a9b21cef925ac303644a8f3e6a6d8489dcd7` completed SUCCESS:
- [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291162)
- [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291263)
- [bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291086)
- [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291219)
- [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291274)

The earlier runtime and test SHA evidence remains below.

Five workflows triggered for the exact code/test SHA `796219c48fda52dd51e9eec4fa696cb48ec88096` completed SUCCESS:
- [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074402)
- [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074339)
- [bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074353)
- [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074344)
- [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074399)

This is the set of workflows actually triggered for that SHA, not a claim that every repository workflow ran.

## Scope and canonical state

This hardens the verifier-registry data contract at owner construction. It does not authenticate verifier source/evidence, establish legitimate ownership, authorize protected effects, or change commissioning state.

M0 remains `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
