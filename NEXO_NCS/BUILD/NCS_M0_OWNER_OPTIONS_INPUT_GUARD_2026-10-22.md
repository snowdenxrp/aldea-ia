# NCS M0 — owner constructor options validated before access

Date: 2026-10-22
Status: IMPLEMENTED; 5/5 triggered CI workflows SUCCESS on the exact code/test SHA

## Finding

After guarding the nested `effectVerifiers` registry against accessor properties, review found the outer `createNexoContinuityOwner({ store, effectVerifiers } = {})` parameter destructuring itself could invoke a getter on the caller-provided options object before entering the function body.

## Correction

The constructor now accepts an options object and inspects its prototype and own property descriptors before reading `store` or `effectVerifiers`. It rejects accessors and invalid options with the existing fail-closed error codes. The nested verifier registry is independently validated by own descriptors and copied into a frozen null-prototype registry.

This does not neutralize arbitrary Proxy traps or hostile code already executing in the same process.

## Regression

`tests/nexo/continuity-contract.test.mjs` now checks both:
- accessor on the nested verifier registry is rejected without running the getter;
- accessor on the outer `effectVerifiers` option is rejected without running the getter.

## Commits

- Runtime: [eb0249e332d450e7b533ebd7309f721f19f43230](https://github.com/snowdenxrp/aldea-ia/commit/eb0249e332d450e7b533ebd7309f721f19f43230)
- Regression: [c192a9b21cef925ac303644a8f3e6a6d8489dcd7](https://github.com/snowdenxrp/aldea-ia/commit/c192a9b21cef925ac303644a8f3e6a6d8489dcd7)

## CI at last check

Exact SHA: `c192a9b21cef925ac303644a8f3e6a6d8489dcd7`

All five workflows triggered for this exact SHA completed SUCCESS:
- [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291162)
- [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291263)
- [bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291086)
- [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291219)
- [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291274)

This is 5/5 workflows actually triggered for this SHA, not a claim that every repository workflow ran.

## Scope and canonical state

This closes ordinary accessor execution in the owner options and nested verifier registry. It does not authenticate verifier provenance/evidence, establish legitimate ownership, or authorize protected effects.

M0 remains `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
