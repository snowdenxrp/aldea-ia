# NCS M0.31 — Cyclic semantic comparison returns UNKNOWN

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Finding

`createClaimEnvelope()` uses `structuredClone` for claim targets, target incarnations, and policy context, which can preserve cyclic object graphs. The STEP 4 semantic validator compared these values with `JSON.stringify(a) === JSON.stringify(b)`. When either side was cyclic, `JSON.stringify` threw and the validator escaped its typed PASS/FAIL/UNKNOWN result contract.

This did not demonstrate an unsafe commit path by itself: the exception propagates before a PASS result can reach the conditional commit call. It did demonstrate that malformed/non-JSON-comparable validation context could bypass the intended typed UNKNOWN handling and interrupt the transition with an uncaught comparison exception.

## Change

- `sameValue()` now catches comparison serialization errors and returns a distinct `null` (“not safely comparable”) result.
- Target, target-incarnation, and policy-context comparisons map that result to `VALIDATION.UNKNOWN`.
- Ordinary comparable mismatches remain `VALIDATION.FAIL`; ordinary equality behavior is unchanged.
- Regression constructs a cyclic claim target and cyclic validation target and asserts a typed UNKNOWN result.

## Evidence

- Source commit: `ade3552a7c8f1345deb5e91ebf446415b1d2f8b0`
- Regression test commit / CI head: `2efa8631e41cf32691a2b74fdfb51240cc6d36c9`
- STEP 4 CI PASS: https://github.com/snowdenxrp/aldea-ia/actions/runs/38988852975
- STEP 5 CI PASS: https://github.com/snowdenxrp/aldea-ia/actions/runs/38988852849

## Limits

This is bounded contract hardening only. It does not authenticate source labels, establish a legitimate authority root, prove production runtime reachability, establish protected-sink enforcement, or close bypass paths. No full-repository test run is claimed. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
