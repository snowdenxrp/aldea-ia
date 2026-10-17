# NCS M0.52 — Fail closed on malformed observation-equivalence data

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

`evaluateNegativeResourceEquivalence()` accepted arbitrary objects and compared some evidence dimensions with `JSON.stringify()`. Distinct non-JSON values such as `Map` instances stringify as `{}`, so two different internal states could be misread as equivalent. This function is a public boundary and must not turn malformed evidence into equivalence.

## Change

- Added recursive plain-JSON-data validation for both observations before equivalence evaluation.
- Rejects exotic prototypes, cycles, sparse/extended arrays, undefined/function/symbol/bigint values and non-finite numbers as malformed.
- Malformed observation data yields `UNKNOWN` with reason `malformed_observation_data`.
- Canonical comparison sorts record keys, so key order alone does not create false non-equivalence.
- Added regressions for different Maps, Date, cyclic data, and key-order invariance.

## Commits

- Source: `798f14f238a59be5b1e38e7f6a87917e29c4b53c`
- Regression tests: `65583e7d0ea1683cd35e362173b2557bddf59ebe`

## Focused CI

- Source M0 core: https://github.com/snowdenxrp/aldea-ia/actions/runs/39040894029 — success
- Source STEP 4: https://github.com/snowdenxrp/aldea-ia/actions/runs/39040893918 — success
- Source STEP 5: https://github.com/snowdenxrp/aldea-ia/actions/runs/39040893891 — success
- Regression M0 core: https://github.com/snowdenxrp/aldea-ia/actions/runs/39040904776 — success
- Regression STEP 4: https://github.com/snowdenxrp/aldea-ia/actions/runs/39040904730 — success
- Regression STEP 5: https://github.com/snowdenxrp/aldea-ia/actions/runs/39040904738 — success

## Limits

This only validates data representation and equivalence comparisons. It does not establish producer authenticity, provenance truth, freshness authority, or permission to execute. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
