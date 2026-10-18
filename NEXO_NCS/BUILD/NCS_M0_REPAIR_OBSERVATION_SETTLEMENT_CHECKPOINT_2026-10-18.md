## Read-only mission-goal verifier added

Latest exact tested head: [`59ec97393ad14fb7d1ef4bf6ab286f964f899410`](https://github.com/snowdenxrp/aldea-ia/commit/59ec97393ad14fb7d1ef4bf6ab286f964f899410).

- Added `scripts/nexo-repair-mission-verification.mjs` with `verifyRepairMissionGoalFromPersistedState()`.
- The verifier reads the Nexo mission and journal, accepts only missions whose steps are supported convergent repair actions, requires every step to have exactly one `settled_observed` entry, then re-loads one strict environment snapshot and re-checks each required invariant against that same snapshot.
- It returns `goal_observed`, with `missionCompleted: false` and `causalAttribution: "not_claimed"`. This is deliberately not a terminal mission-completion claim and does not mutate continuity.
- Regression verifies the observed goal result is distinct from mission completion.
- Exact-head CI PASS: mission/restart [39133464114](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133464114), semantic [39133463875](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133463875), outcome [39133463870](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133463870).

Remaining: dependency graph validation needs a cycle guard; goal observation still needs a carefully scoped persistence contract and must not auto-unblock/replan without verifying all required mission semantics. No runtime cutover.

---

## Runtime/replan compatibility guard

Latest exact tested head: [`9610580f838ea2f55a482f64a28f18d84cac202e`](https://github.com/snowdenxrp/aldea-ia/commit/9610580f838ea2f55a482f64a28f18d84cac202e).

- `replanPersistedNexoMission()` now blocks a successor when the prior mission contains a `settled_observed` repair, returning `NEXO_REPAIR_GOAL_VERIFICATION_REQUIRED`. It still separately blocks unresolved `prepared` entries.
- Runtime regression confirms the successor is not appended and the observation journal entry remains unchanged.
- Exact-head CI PASS: mission/restart [39133373970](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373970), outcome [39133373980](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373980), semantic [39133373987](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373987).
- This is still not a mission-level verifier. Runtime cutover remains blocked until goal verification has an explicit operation-specific contract and persisted evidence.

---

## Follow-up hardening — negative recovery and reconstruction gate

Latest tested head: [`4cadf1831ecbd3664964c410ac8bc1397fd22a2e`](https://github.com/snowdenxrp/aldea-ia/commit/4cadf1831ecbd3664964c410ac8bc1397fd22a2e).

- Added negative crash-cut coverage: malformed persisted coordinates keep PREPARED unresolved; a durable revision that advances beyond the allowed preparation window also keeps PREPARED unresolved; a continuity-store result of UNKNOWN is never reported as verified settlement.
- Fixed reconstruction semantics for `settled_observed`: a repair settled by observing its desired invariant is reconstructed as blocked with objective `verify_observed_repair_goal`, not as a completed mission and not as an executable planned step. The reason explicitly retains `causalAttribution: "not_claimed"`.
- Exact-head CI PASS:
  - Mission/restart continuity: [39133277523](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277523)
  - STEP 5 outcome classification: [39133277522](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277522)
  - STEP 4 semantic validation: [39133277520](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277520)

---

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
