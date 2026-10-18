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

Code commit: [`892680032b5512de11532b6ea609e5e9cbc9f75f`](https://github.com/snowdenxrp/aldea-ia/commit/892680032b5512de11532b6ea609e5e9cbc9f75f)  
Test commit: [`575d01789250bb26800d66146da18321ffad32ab`](https://github.com/snowdenxrp/aldea-ia/commit/575d01789250bb26800d66146da18321ffad32ab)

## CI evidence on exact test head

- Semantic validation: [run 39106460906](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460906) — **success**.
- Outcome classification: [run 39106460938](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460938) — **success**.
- A separate mission/restart continuity run for this exact head has not been observed; do not claim it passed on this head. The earlier mission/restart run `39105986623` was for the previous code/test head, not this one.

## Limits

- The revision remains in-memory and is not `world-state.json`'s durable `stateRevision`.
- A normalized postcondition is not an operation-specific receipt.
- A dead agent is deliberately not resurrected. The current generic repair postcondition still requires `alive !== false`; if a repair is attempted on a dead agent, it may fail its postcondition and remain unresolved. That case must be clarified before treating `repair_agent_state` as universally settleable.
- No owner settlement API or runtime cutover was added. PREPARED remains UNKNOWN; protected effects STOP; M0 incomplete.
