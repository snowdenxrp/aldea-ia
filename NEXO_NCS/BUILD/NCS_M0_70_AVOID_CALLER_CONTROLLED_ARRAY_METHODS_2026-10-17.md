# NCS M0.70 — Avoid caller-controlled array method dispatch in reconciliation

Date: 2026-10-17  
Branch: `ncs-clean-architecture`  
Source change: `30c5f2dbe2d8a6631cf7b9c7632a1b5a785c9ee7`  
Regression correction / focused-CI head: `d55e87f0d429fecd471b6f04257cca147c587243`

## Defect

The reconciler selected evidence with `evidence.find(...)`. Because the array is caller-controlled, an own `find` property can shadow the built-in method and execute caller-supplied code inside reconciliation. This is a boundary integrity issue even if the custom function returns a plausible candidate.

## Correction

Selection now walks numeric indexes and reads each own property descriptor. Missing indexes or accessor descriptors fail closed as `UNRESOLVED`; a valid own data candidate is evaluated without dispatching through `.find()`.

## Regression and CI evidence

A hostile array defines an own `find` function that increments a counter and returns a plausible candidate. The test verifies:
- status is `RESOLVED` because the own indexed data candidate is valid;
- custom `find` call count remains zero.

The first test expectation incorrectly required `UNRESOLVED`; CI exposed the mismatch. The test was corrected to the intended contract, then all focused workflows passed on the corrected test head:

- STEP 4 semantic validation: [run 39078527864](https://github.com/snowdenxrp/aldea-ia/actions/runs/39078527864) — success
- STEP 5 outcome classification: [run 39078527811](https://github.com/snowdenxrp/aldea-ia/actions/runs/39078527811) — success
- STEP 6 reconciliation: [run 39078527808](https://github.com/snowdenxrp/aldea-ia/actions/runs/39078527808) — success
- M0 Core contracts: [run 39078527855](https://github.com/snowdenxrp/aldea-ia/actions/runs/39078527855) — success

## Scope and limitations

This closes the specific custom-array-method dispatch defect. It does not authenticate `authoritative: true`, establish provenance or freshness, prove production runtime reachability or final-sink closure, or establish legitimate constitutional authority. STEP 7 remains **OPEN / STOP / UNKNOWN**; protected effects remain STOP. No commissioning or device wiring is authorized.
