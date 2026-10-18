# NCS M0 — Lúmina failed-action mutation checkpoint

Date: 2026-10-18
Branch: `ncs-clean-architecture`
Status: code and regression test landed; exact-head CI PASS.

## Defect

Inspection of `src/actions.js` found that `catchFish()` can return `success: false` while still reducing the agent's energy and changing its activity to `fishing` (the `fish_escaped` branch). The previous `createLuminaEffectAdapter()` returned a failed result before bumping `simulation.nexoEffectRevision`. The generic effect adapter could therefore see no version change, cache a terminal failure, and allow ordinary replanning despite a real state mutation.

## Fix

Commit `ed64bec0ad8b8741b7da6f8bcccf65f5af5d2742` in `src/nexo/simulation-adapter.js`:
- Capture the simulation's agents/world state before the Lúmina action.
- Compare it with the post-action state even when the action returns failure.
- Bump `nexoEffectRevision` when the observed state changed.
- Let the generic adapter classify a failed action plus observed mutation as `blocked / PARTIAL_EFFECT_DETECTED`, keeping the journal PREPARED instead of caching a terminal failure.

Regression test commit: `08681d908a3231e0b45700fd09bd35207d7069ae` in `tests/nexo/runtime.test.mjs`. It forces a deterministic fish escape and verifies:
- the activity and energy mutation occurred;
- the simulation revision advanced;
- Nexo reports BLOCKED with `PARTIAL_EFFECT_DETECTED`;
- the effect journal remains PREPARED;
- replanning is blocked with `EFFECT_RECONCILIATION_REQUIRED`.

## Exact-head CI PASS

All three workflows passed at `08681d908a3231e0b45700fd09bd35207d7069ae`:
- Mission/restart continuity: [39105229917](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105229917)
- Semantic validation: [39105229991](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105229991)
- Outcome classification: [39105229910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105229910)

## Scope and next boundary

- This fixes a concrete Lúmina simulation adapter gap; it is not an independent crash-recovery verifier and does not establish cross-file atomicity.
- The generic effect adapter still treats a handler-reported failure with no observed state-version change as terminal. Before using it for any non-simulation/external operation, the operation-specific handler must establish a trustworthy definitive-no-effect contract; a plain `status: "failed"` is not universal proof.
- Runtime still writes execution/outcome through legacy memory functions; standalone owner terminal settlement and independent verifier remain unimplemented.
- No real device/data migration is claimed. M0 incomplete; unresolved PREPARED UNKNOWN; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.
