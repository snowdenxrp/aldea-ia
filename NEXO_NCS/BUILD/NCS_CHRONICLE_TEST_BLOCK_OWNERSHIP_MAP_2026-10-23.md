# NCS — Chronicle test migration: exact source-block ownership

Date: 2026-10-23  
Branch reviewed: `ncs-clean-architecture`  
Status: **SOURCE INVENTORY ONLY — NO RUNTIME OR TEST FILE CHANGED**

## Purpose

Refine `NCS_CHRONICLE_MUTATION_SURFACE_AND_TEST_OWNERSHIP_2026-10-23.md` into a source-line ownership map before changing the pre-commissioning public-write policy. This inventory does not decide the policy and does not claim that the gate exists.

## Exact source pins observed

- `tests/nexo/chronicle-runtime.test.mjs`: blob `d56f7525841d96a951cd4c20429be07e3f5a7052`, 100,167 characters.
- `tests/nexo/entrypoint.test.mjs`: blob `47d6d6fe0736938ef562eb23fc8397c78fa10c4c`, 30,739 characters.
- `src/nexo/application/chronicle-append.mjs`: blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`.

Line numbers below are for those exact observed blobs; they must be refreshed after any edit.

## `chronicle-runtime.test.mjs` classification

This file is a top-level Node test harness rather than a collection of named `test(...)` blocks. Its calls must be classified by the surrounding scenario, not by test names.

| Lines | Scenario / evidence | Migration ownership |
|---|---|---|
| 130–151 | Invalid public input and invalid initialization type; asserts blocked result and `NOT_EVALUATED` | Keep at public application boundary; add a separate gate-first test that proves valid-shaped input is denied before effects. |
| 164–215 (and adjacent setup) | Application-level lock-acquisition timeout for Chronicle/Continuity initialization; validates phase, no dispatch, lock-release evidence | Split by invariant: lock/store mechanics remain lower-level; public route still tests safe sanitized timeout behavior, but a pre-commissioning deny must happen before these mechanisms run. |
| 1267–1282 | Concurrent same-operation calls, single dispatch, explicit retry, unchanged bytes after settled replay | Preserve idempotency/concurrency protocol coverage at an internal protocol harness or store/owner boundary. Do not expect this to dispatch through the public pre-commissioning route. |
| 1294–1318 | Concurrent first-time bootstrap, retry and final replay converge to one append | Preserve as bootstrap/recovery mechanics with explicit test ownership. The public denied route should separately prove it never begins bootstrap. |
| 1569–1580 | Oversized direct application input; no store files created | Keep at public boundary; it is an input/resource rejection invariant. Under a deny-first policy the test must distinguish whether size validation is intentionally allowed before the policy gate, without allowing any mutation. |
| 1600–1613 | Mission/step delimiter, padding and identity collision validation | Keep as pure input validation. Ensure expected ordering remains intentional and no files are created. |
| 1615–1632 | Successful application append, public result sanitization, replay and payload mismatch | The success/replay expectations conflict with a deny-first pre-commissioning policy. Move successful protocol assertions to a non-public internal harness, while keeping public tests for denial, sanitized output and no dispatch. Do not add an env flag or fake authority object. |
| 1632–1688 | Missing stores, corrupt stores and two-store preflight; no overwrite/partial side effect when preflight detects corruption | Split store integrity/preflight behavior into store-level tests; public integration tests should verify denial occurs before store load/initialization and preserves existing bytes. |
| 1698–1730 | Partial bootstrap after second-store parent failure, then explicit recovery and successful append | Keep recovery semantics in an internal mechanics harness; add public-route test proving pre-commissioning denial happens before partial bootstrap can occur. |

These are migration categories, not instructions to mechanically move line ranges. Existing tests may interleave several invariants; extract the minimum test cases necessary and retain the original assertions with a clear owner.

## `entrypoint.test.mjs` classification

| Lines | Scenario / evidence | Migration ownership |
|---|---|---|
| 105–116 | Read-only status for a missing store; no file created | Keep; add a regression that read-only routes remain available after the gate. |
| 118–149 | Valid `chronicle-append` CLI writes continuity and Chronicle and returns completed/dispatch attempted | Must change if fail-closed policy is explicitly adopted: expect nonzero blocked result, no dispatch, and no new files. This is the clearest public-route regression target. |
| 151–181 | Oversized stdin rejection; sanitized response; no stores created | Keep. It proves input-boundary behavior, not authorization. |
| 183–214 | Second-process replay observes previous append without dispatch and without byte changes | Public replay-success expectation conflicts with deny-first policy. Preserve replay mechanics elsewhere; public CLI should remain denied before reading or mutating stores. |
| 216 onward | Status/mission query/plan/preview checks against stored state | Keep read-only behavior and assert store bytes unchanged. The gate must not indiscriminately disable query APIs. |

## Required separation of claims

1. **Public supported mutation route:** a deny-first application gate can prevent the supported CLI `chronicle-append` use case from initializing stores, admitting a mission, or dispatching the effect, provided the gate is the first operation in that use case and the CLI routes only through it.
2. **Internal protocol mechanics:** lower-level stores, owner-backed runtime, replay/reconciliation and recovery may still be directly callable by tests/internal imports. Passing those tests is not evidence of owner authorization or a universal filesystem write barrier.
3. **All in-process mutators:** no claim is permitted until all relevant write-capable APIs and import/call paths have been inventoried and constrained.

## Safe next implementation sequence after policy is explicitly settled

1. Create a deny-first test at the public application boundary with spies proving no store load/initialize, lock creation, owner opening, mission admission, adapter construction/execution, or append call.
2. Assert absent-path stays absent and existing store bytes remain identical for CLI and application entrypoints.
3. Change public CLI successful-write/replay expectations to deny; keep invalid input, oversized stdin, sanitized response, and read-only tests.
4. Preserve concurrency, replay, bootstrap and recovery invariants through an internal test seam that is not exported as a production bypass, or rewrite them against the precise lower-level contract.
5. Run focused tests, deterministic `npm test`, and relevant CI against the exact source-and-test commit; inspect raw logs and fetch tested source blobs.
6. Update STATUS with evidence and preserve constitutional state unless independently justified.

## Current status

- This file: inventory only.
- Runtime changed: **NO**.
- Test suite migrated: **NO**.
- Pre-commissioning policy ratified: **NO**.
- CI for this document: **not yet checked**.
- M0: `INCOMPLETO`; authorization: `NOT_EVALUATED`; legitimate root: `PENDING/UNKNOWN`; protected effects: `STOP`.
