# NCS M0 — Environment reconciliation and crash-cut findings

Date: 2026-10-18  
Repository: `snowdenxrp/aldea-ia`  
Branch: `ncs-clean-architecture`

## Scope

This is a code-path inspection of the current repository, not a claim of runtime or device verification. It continues from the ambiguous-handler fail-closed fix. It does not reopen the earlier Step 7 or AB/P audits.

## Facts established from source

1. `createNexoContinuityOwner()` persists mission admission and PREPARED in `.nexo-continuity.json`. It has no terminal settlement API; `reconcilePrepared()` always returns blocked / `NEXO_EFFECT_RECONCILIATION_REQUIRED`.
2. `src/nexo/runtime.js` still imports `recordNexoOutcome`, `recordNexoExecution`, `recordNexoPlan`, and `reconstructNexoMission` from `src/assistants/memory.js`. The standalone owner is not yet the canonical runtime execution/outcome path.
3. `createLuminaEffectAdapter()` calls `executeAction(simulation, agent, action)` against a mutable in-memory simulation object. It increments an in-memory `nexoEffectRevision` after observed changes to `agents` or `world`; that revision is not the persisted `world-state.json` `stateRevision`.
4. `scripts/simulate.mjs` persists Lúmina state to `world-state.json` using its own `stateRevision` and file lock. `scripts/assistants.mjs` separately commits Nexo mission admission to `.nexo-continuity.json`, writes learning data to `.lumina-assistant-memory.json`, and then persists Lúmina state. These are separate files and separate commits.
5. The current assistant script admits a mission but does not call `executeLuminaNexoStep()`. The effect adapter's in-memory mutation path and the CLI persistence path are therefore not yet one connected durable effect protocol.
6. Action implementations are heterogeneous. Examples:
   - `drink`, `eat_plant`, `catch_fish`, gathering, eating, harvesting, trading, and commons contributions/withdrawals can consume, transfer, or add resources and/or mutate agent state.
   - `trade()` writes a trade history entry, but the record has no Nexo operation key and identical trades can be indistinguishable by business fields.
   - `buildShelter()` and `farm()` derive structure IDs from current collection length; replay after a persisted effect can create a second structure.
   - repair handlers normalize fields and are closer to idempotent, but a postcondition showing normalized state does not independently attribute that state to a particular prepared operation.

## Crash cuts that are currently unresolved

| Cut | State after restart | Safe conclusion |
|---|---|---|
| Nexo PREPARED commit fails/returns UNKNOWN before dispatch | Environment may be unchanged; commit outcome may be uncertain | Do not dispatch based on an uncertain intent commit |
| PREPARED committed; process stops before action call | Operation probably did not dispatch, but there is no durable dispatch marker to prove that boundary | Keep UNKNOWN; no redispatch from PREPARED alone |
| Action mutates in memory; process stops before Lúmina snapshot persistence | Mutation may be lost on restart | PREPARED does not identify whether the in-memory mutation reached disk |
| Lúmina snapshot persists; Nexo terminal outcome is absent | World state may contain the effect, while Nexo still has PREPARED | Current state alone cannot universally attribute the change to this operation |
| Nexo outcome is recorded in legacy memory but standalone owner has not settled | The two continuity representations can diverge | Runtime migration cannot treat legacy outcome as owner settlement without explicit migration/recovery rules |

## Decision

**There is no repository-grounded universal verifier or safe terminal settlement contract available yet.** Do not add a generic callback, caller-supplied `verified` boolean, global revision, synthetic operation queue, tombstone, or transaction wrapper to paper over the gap.

The required next design task is narrower: define the authoritative environment commit boundary and enumerate which action types can be reconciled from existing durable evidence versus which must remain UNKNOWN. Any action that lacks a reliable, operation-specific durable observation must remain blocked. Only after this contract and its crash-cut tests exist may runtime execution/outcome recording be moved to the standalone owner.

## Verification boundary

This finding is based on source inspection. The fail-closed handler changes and regression tests passed all three GitHub Actions workflows on code/test head `431978730f3b2be300fa51d3a35938ef6702e607`:
- [mission/restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986623)
- [semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986616)
- [outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986625)

No real-device migration or execution was performed. M0 remains incomplete; PREPARED outcomes UNKNOWN; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.
