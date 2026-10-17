# NCS M0.42 — Order-independent semantic JSON comparison

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

STEP 4 compared target, target incarnation, and policy-context values by directly comparing `JSON.stringify(a)` and `JSON.stringify(b)`. JSON object member order is not semantically significant, but serialization preserves insertion order. Structurally equivalent object values could therefore be classified as `FAIL` solely because equivalent keys were inserted in a different order.

## Change

The bounded `sameValue()` helper now sorts object keys during JSON serialization before comparison. Arrays retain their order. Serialization failures—including cyclic inputs—still return the existing non-comparable sentinel, which maps to `UNKNOWN`; this change does not turn cyclic values into proof of equality.

A regression test compares equivalent nested target objects whose keys are inserted in different orders and expects `PASS`. Existing target mismatch and cyclic-target tests remain in the same focused test file.

## Evidence

- Source: `src/nexo/core/final-semantic-validator.mjs`
- Source commit: `afccee600a8732cd1bbc1559892e740905fa283f`
- Regression test: `tests/nexo/final-semantic-validator.test.mjs`
- Test commit / CI head: `76cf6baf6e0bb1dcd11a3f3b0c0f1272dd74a7b8`
- STEP 4 CI at source commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994420693 — success
- STEP 5 CI at source commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994420695 — success
- STEP 4 CI at test commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994423653 — success
- STEP 5 CI at test commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994423616 — success

## Limits

This is a bounded semantic-comparison correction, not proof that context fields or source labels are authentic. It does not resolve the separate authority/provenance boundary, production runtime reachability, or bypass closure. No full-repository test run or device test is claimed. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
