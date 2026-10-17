# NCS M0.56 — Reject lossy hidden properties in Core contract data

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

The shared immutable-contract helper used `structuredClone()` before validating the caller-owned value. Cloning may omit symbol-keyed and non-enumerable properties, changing the supplied record without rejecting it. Cloning can also invoke enumerable getters, executing caller code during contract construction. The existing exotic-value checks did not cover these lossy/accessor shapes.

## Correction

`src/nexo/core/contracts.mjs` now validates the original object graph before cloning. It accepts arrays and plain objects (including null-prototype objects), and requires their own properties to be enumerable data properties. It rejects symbol keys, non-enumerable properties, and accessors before `structuredClone()` can omit or execute them. The detached clone is validated again and then frozen as before.

Regression tests in `tests/nexo/core-contracts.test.mjs` cover symbol-keyed properties, non-enumerable properties, and getters; the getter test proves the getter is not invoked. The existing protected-transition test was updated to expect fail-closed rejection of accessor-based evidence.

## Evidence

- Source commit: `ce8f3a8b83f728b20657d03966448b2fb7788d76`
- Core contract regression tests: `0aad968ec751e39fd21388bac68ea32de8bc080f`
- Protected-transition expectation update: `274ea45e0f2745ca08d131dd690ac68cb2894be3`
- M0 non-authority Core contracts CI: [run 39043286261](https://github.com/snowdenxrp/aldea-ia/actions/runs/39043286261) — success on final test commit
- STEP 4 semantic validation CI: [run 39043286260](https://github.com/snowdenxrp/aldea-ia/actions/runs/39043286260) — success on final test commit
- STEP 5 outcome classification CI: [run 39043286270](https://github.com/snowdenxrp/aldea-ia/actions/runs/39043286270) — success on final test commit
- STEP 3A/3B/3C verification CI: [run 39043286210](https://github.com/snowdenxrp/aldea-ia/actions/runs/39043286210) — success on final test commit

## Scope and limits

This closes a data-shape integrity gap at the shared Core immutable-contract boundary. It does not establish evidence authenticity, constitutional authority, production runtime reachability, durable external-effect reconciliation, or absence of protected-path bypasses. No full-repository or device test is claimed. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
