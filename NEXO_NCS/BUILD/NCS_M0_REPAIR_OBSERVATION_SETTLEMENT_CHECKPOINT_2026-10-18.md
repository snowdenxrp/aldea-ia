# NCS M0 — Repair settlement from persisted invariant observation

Date: 2026-10-18  
Code/test head: [`72bb686a4d6b84d6cd058751005dbe34cda1d273`](https://github.com/snowdenxrp/aldea-ia/commit/72bb686a4d6b84d6cd058751005dbe34cda1d273)

## Implemented

Added `scripts/nexo-repair-settlement.mjs` with `settlePreparedRepairFromPersistedState()`.

The helper:
1. Loads the Nexo continuity store and requires the caller's expected store revision to match.
2. Requires exactly one journal entry matching the idempotency key and still in `prepared`.
3. Supports only the three convergent repair actions and requires a valid revision bound into PREPARED.
4. Loads the environment with `loadStateStrict()`.
5. Requires the durable environment revision to equal the prepared revision or its immediate successor. Other revision distances remain unresolved.
6. Runs the read-only, action-specific persisted invariant observer and requires `desired_state_present`.
7. Records `settled_observed` plus the observed environment revision, prepared revision, source label, and explicit `causalAttribution: "not_claimed"`.
8. Commits through `store.commitIfCurrent(expectedContinuityRevision, candidate)`. A continuity-store conflict is not reported as settlement.

## Semantics and limits

This settlement means: *the operation-specific desired state was observed in a strict persisted snapshot at a revision consistent with this repair's preparation window, and that observation was recorded with continuity compare-and-commit.*

It does **not** prove the repair caused the state. A concurrent actor could independently establish the same invariant. The journal therefore records observation, not causal attribution. It does not provide atomicity between Lúmina's world-state file and Nexo's continuity file. A crash after environment persistence but before settlement still leaves PREPARED unresolved until this helper can re-observe and conditionally commit.

If the invariant is absent/unknown, the target is ambiguous, the environment revision moved beyond the allowed window, or the continuity revision changed, settlement remains blocked/conflicted. No redispatch is authorized by a failed settlement.

## Regression coverage

The restart test proves:
- environment repair persisted at revision 1 while the separate Nexo journal remains PREPARED;
- after reopening the continuity owner, settlement re-loads the strict persisted snapshot and records `settled_observed`;
- settlement makes no causal-attribution claim;
- replaying settlement with the old continuity revision returns `NEXO_CONTINUITY_STORE_REVISION_CONFLICT`.

## Exact-head CI PASS

- Mission/restart continuity: [39133009763](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009763)
- STEP 4 semantic validation: [39133009760](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009760)
- STEP 5 outcome classification: [39133009772](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009772)

## Next gate

Add explicit negative crash-cut tests for absent/unknown invariant and unrelated environment revision, then test continuity write failure/ambiguous commit. Review whether mission reconstruction needs a distinct terminal journal status treatment before runtime wiring. Do not generalize settlement to non-idempotent effects or claim system-level authorization.

M0 incomplete. Protected effects STOP. STEP 7 OPEN / STOP / UNKNOWN.
