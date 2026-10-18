# NCS M0 — Convergent repair revisions

Date: 2026-10-18  
Branch: `ncs-clean-architecture`

## Change made

In `src/nexo/simulation-adapter.js`, the three normalizing handlers now increment the in-memory `nexoEffectRevision` only when their relevant state actually changes:

- `repair_agent_state`: compares position/alive before and after; explicitly preserves a dead agent as dead.
- `repair_agent_needs`: compares the needs object before and after normalization.
- `repair_resource_state`: normalizes a missing/invalid amount to zero and increments the revision only when the amount changes.

This removes artificial revision increments on already-normalized state and makes the repair actions converge on the fields they normalize. It does not make `nexoEffectRevision` durable and does not establish an operation-specific receipt.

## Regression tests added

In `tests/nexo/simulation-adapter.test.mjs`:
- Running `repair_agent_needs` twice under distinct operation keys completes both times, but the second call leaves revision unchanged and reports `stateChanged:false`.
- A resource object with no `amount` field normalizes to zero and satisfies its postcondition.
- Existing stale-precondition and physical-action cases remain in the test file.

Repair revision code: [`892680032b5512de11532b6ea609e5e9cbc9f75f`](https://github.com/snowdenxrp/aldea-ia/commit/892680032b5512de11532b6ea609e5e9cbc9f75f)  
Convergence tests: [`575d01789250bb26800d66146da18321ffad32ab`](https://github.com/snowdenxrp/aldea-ia/commit/575d01789250bb26800d66146da18321ffad32ab)  
Dead-agent-safe postcondition: [`a17a540d8795d29e2320f0e1fc16345f83b9a0f0`](https://github.com/snowdenxrp/aldea-ia/commit/a17a540d8795d29e2320f0e1fc16345f83b9a0f0)  
Test that repair never resurrects: [`0846597665e72de65917101c9206c3d26c11bf1b`](https://github.com/snowdenxrp/aldea-ia/commit/0846597665e72de65917101c9206c3d26c11bf1b)

## CI evidence on exact test head

Final test head: `0846597665e72de65917101c9206c3d26c11bf1b`.

- Semantic validation: [run 39106552699](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106552699) — **success**.
- Outcome classification: [run 39106552701](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106552701) — **success**.
- The prior head `575d01789250bb26800d66146da18321ffad32ab` passed semantic validation [39106460906](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460906) and outcome classification [39106460938](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460938).
- A separate mission/restart continuity run for the final test head has not been observed; do not carry forward the earlier head's result as if it covered this one.

## Limits

- The revision remains in-memory and is not `world-state.json`'s durable `stateRevision`.
- A normalized postcondition is not an operation-specific receipt.
- A dead agent is deliberately not resurrected. The repair postcondition now permits `alive === false` when coordinates are normalized, and a regression test covers this. This still does not make the action independently attributable after restart.
- No owner settlement API or runtime cutover was added. PREPARED remains UNKNOWN; protected effects STOP; M0 incomplete.
