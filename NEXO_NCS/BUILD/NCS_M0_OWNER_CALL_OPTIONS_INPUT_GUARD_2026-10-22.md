# NCS M0 — owner public-call options validated before destructuring

Date: 2026-10-22
Status: IMPLEMENTED; 5/5 triggered CI workflows SUCCESS on exact code/test SHA

## Finding

Five public methods on the continuity owner accepted options through parameter destructuring: `recordMission`, `recordOutcome`, `recordPrepared`, `recordExecutionLineage`, and `reconcilePrepared`. JavaScript destructuring reads caller-provided properties before the method body can validate the input. An accessor on `expectedRevision`, `mission`, `outcome`, `operation`, or `result` could therefore execute during the call.

This is an input-contract defect. It is not evidence of an authority bypass or protected-effect execution.

## Correction

The methods now accept an input record and use a shared `readOwnerInputFields()` helper before extracting values. The helper requires a plain object or null prototype and reads own property descriptors for the fields the method actually consumes. Missing fields remain `undefined`; accessors, non-enumerable fields, unsupported prototypes, and reflection failures fail closed into the existing method result shape. Existing validation of the nested mission/operation/outcome/result records remains in place.

The guard does not claim to neutralize arbitrary Proxy traps or hostile code already executing in-process.

## Regression

The continuity contract test passes accessor-backed option objects to all five public methods. It requires that each `expectedRevision` getter remain uninvoked and each method return a failed result without entering the store path.

## Commits and CI

- Runtime: [1c553ac541d3c98f8c36c17047e9a5e750c0ef31](https://github.com/snowdenxrp/aldea-ia/commit/1c553ac541d3c98f8c36c17047e9a5e750c0ef31)
- Regression: [57a7dc4093b371ef69ff7f0dfb2c8e9929ffc09e](https://github.com/snowdenxrp/aldea-ia/commit/57a7dc4093b371ef69ff7f0dfb2c8e9929ffc09e)

Five workflows triggered for exact SHA `57a7dc4093b371ef69ff7f0dfb2c8e9929ffc09e` completed SUCCESS:
- [bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949525)
- [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949462)
- [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949470)
- [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949564)
- [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949623)

This is the set of workflows actually triggered for this SHA, not a claim that every repository workflow ran.

## Scope and canonical state

This validates public owner method options before property reads. It does not authenticate verifier source/evidence, establish legitimate owner authority, authorize dispatch, or change commissioning state.

M0 remains `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
