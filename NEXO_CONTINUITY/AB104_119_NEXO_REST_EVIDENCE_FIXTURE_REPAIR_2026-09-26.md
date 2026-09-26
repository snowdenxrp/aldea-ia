# AB104.119 — Nexo rest evidence fixture repair — 2026-09-26

Previous: AB104.118.

## Recovered CI failure

Run 2211 (36204454980), head:
57e19d7894523941cf6170d599a63d63da933206

The exact validator failure was recovered from the GitHub Actions job log:
- `tests/nexo/runtime.test.mjs:108`
- `chainedFirst.status` was `failed`, expected `completed`.
- The failing operation is the first chained `rest` action.
- The canonical `rest` effect result is `{success:true,effect:"energy_recovered"}`.
- The verification predicate additionally requires the physical post-state `agent.needs.energy >= 0`.
- The test fixture omitted `energy`, so `rest()` computed `undefined + 7` → `NaN`; verification correctly rejected that invalid physical state.
- Therefore this was a test-fixture/state-validity defect exposed by stricter canonical evidence verification, not a reason to weaken the `energy_recovered` evidence predicate.

Historical Run 2211 remains preserved as failure evidence.

## Repair

Updated only the chained rest regression fixture to provide a valid numeric energy state:
- `needs:{thirst:50,energy:50}`

The unrelated drink-failure fixture remains unchanged.

Repair commit:
518602c85a53f0570c05227224cc42884c5d429d

## Epistemic status

AB104.117 = OPEN / VALIDATION FRONTIER
Run 2211 = FAILED / preserved
Fixture repair = PERSISTED
Fresh CI for 518602c is not yet visible; therefore no pass is claimed.

## Exact next action

1. Observe fresh CI for 518602c.
2. If it fails, recover the exact assertion/log evidence and preserve it before any repair.
3. If it passes, verify the complete workflow result and then close the AB104.117 validation frontier.
4. Only after clean validation resume the recovery/restart boundary audit.

## DO-NOT-REPEAT

- Do not weaken `rest` evidence from canonical `energy_recovered` to `currentActivity`.
- Do not accept NaN energy as valid physical evidence.
- Do not delete or overwrite Run 2211 failure evidence.
- Do not claim 518602c CI passed until a fresh run proves it.
- Do not advance past AB104.117 while validation remains open.

## CONTINUITY

A future chat receiving CONTINUITY must resume from commit 518602c85a53f0570c05227224cc42884c5d429d, inspect its fresh CI, and continue the evidence-preserving repair loop.
