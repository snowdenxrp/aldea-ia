# NCS M0.10 — Authority result shape vs. provenance boundary

**Date:** 2026-10-16  
**Status:** `BLOCKED / UNKNOWN` for legitimate owner-authority verification.  
**Purpose:** Bounded source-level corroboration of an already recorded Step 7 blocker, not a new Genesis research track or implementation authorization.

## Prior evidence reused (not repeated)

- [Core authority-source composition gate](../BUILD/STEP_7_CORE_AUTHORITY_SOURCE_COMPOSITION_GATE_2026-10-12.md): caller/provider-supplied `AUTHORIZED` and provenance are insufficient without an independently established producer/currentness basis.
- [Runtime authority-to-effect path source trace](../BUILD/STEP_7_RUNTIME_AUTHORITY_TO_EFFECT_PATH_SOURCE_TRACE_2026-10-15.md): runtime bypasses `executeProtectedTransition()`; the protected-transition composition itself does not invoke `effectBoundary.prepare`.
- [Initial authority bootstrap decision gate](../BUILD/STEP_7_INITIAL_AUTHORITY_BOOTSTRAP_DECISION_GATE_2026-10-15.md): L2 remains the goal; owner-intent/content-binding and verifier provenance are not established.
- [Genesis premise/L2 feasibility adjudication](../BUILD/STEP_7_GENESIS_PREMISE_L2_FEASIBILITY_ADJUDICATION_2026-10-15.md): the selected threat objective cannot be met merely by adding a key, hash, second device, or self-asserting verifier.
- [External trusted-review candidate screen](../BUILD/STEP_7_EXTERNAL_TRUSTED_REVIEW_CANDIDATE_SCREEN_2026-10-16.md): screened candidate families remain research references, not a selected/proven L2 path.

No closed AB/P/P112 audit was rerun.

## Bounded source confirmation

Inspected on branch `ncs-clean-architecture`:

- `src/nexo/core/contracts.mjs`, blob `294eb400e9685788f7dd084a28a838b69d0323c7`.
- `src/nexo/core/protected-transition.mjs`, blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`.
- `src/nexo/core/ownership.mjs`, blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`.
- `tests/nexo/protected-transition.test.mjs`, blob `b40caf831523c231a45959885d4890f245a43d76`.

`createAuthorityResult(status, { reasons, evidence })` restricts `status` to `AUTHORIZED`, `STOP`, or `UNKNOWN`, then freezes the supplied reasons/evidence. It does not authenticate the producer, validate evidence provenance, bind the result to a legitimately established owner reference, or establish validity/scope/revocation/currentness.

`executeProtectedTransition()` verifies that the result has a recognized status. If the status is `AUTHORIZED`, it proceeds to snapshot isolation, candidate execution, semantic validation, and conditional commit. The trustworthiness of that decision is delegated to the authority-gate port; the result shape itself does not prove the trust basis.

The positive test setup injects an `authorityGate.check` function returning `createAuthorityResult(AUTHORITY.AUTHORIZED)`. This demonstrates transition behavior under a supplied decision, not legitimate owner authority.

## Preserved fail-closed behavior

When the authority result is `UNKNOWN`, the transition returns `UNKNOWN` before snapshot isolation, candidate execution, semantic validation, or commit. The test verifies zero calls to those later ports for this injected unknown result.

When no authority gate is configured, `createCorePorts()` defaults it to a `NOT_IMPLEMENTED` failure; the test verifies that later ports are not called. This covers the missing-port case, not every possible dishonest or misconfigured implementation.

## Decision

- Treat this as source-level confirmation of the existing Step 7 blocker, not a newly discovered production vulnerability.
- Do not treat a syntactically valid `AUTHORIZED` result as proof of constitutional owner authority.
- Do not invent an authority ID, signature format, key registry, trust anchor, or ad hoc evidence schema as a patch.
- Do not integrate this result into runtime, adapter, persistence, or protected-effect paths based on current tests.
- Keep Step 7 at `OPEN / STOP / UNKNOWN`; no commissioning or protected effects.

## Evidence boundary

This was a bounded code-and-test review, not an exhaustive repository-wide search, cryptographic verification, production composition trace, or bypass-closure proof. It does not establish that an exploit exists; it identifies a trust assumption at the contract boundary that existing Step 7 records already describe.

## Next action

Do not repeat authority bootstrap, device, or trusted-review candidate research. Continue only within the existing non-authority Core workstream until a real, independently justified authority path and actual protected sink are available for review. Any later implementation must be rooted in the already documented Step 7 gates, not this note alone.
