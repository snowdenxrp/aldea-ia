# NCS M0 — Durable repair crash-cut checkpoint

Date: 2026-10-18  
Repository: `snowdenxrp/aldea-ia`  
Branch: `ncs-clean-architecture`  
Code/test commit: [`db3399aa28e6671bf5329ea5ca60544c8ac581ee`](https://github.com/snowdenxrp/aldea-ia/commit/db3399aa28e6671bf5329ea5ca60544c8ac581ee)

## What the new regression proves

`tests/nexo/simulation-restart-persistence.test.mjs` now exercises the previously missing cut using existing persistence boundaries:

1. Persist a Lúmina snapshot at `stateRevision: 0` with an agent whose coordinate needs normalization.
2. Independently initialize Nexo continuity and durably admit a mission.
3. Commit that mission step as `prepared` before executing the repair.
4. Execute the existing `repair_agent_state` adapter and persist the resulting Lúmina snapshot at revision 1.
5. Strictly reload the authoritative snapshot and verify the normalized coordinate and explicit alive state survived restart.
6. Reopen the separate Nexo continuity owner and verify its journal remains `prepared`; `reconcilePrepared()` remains blocked with `NEXO_EFFECT_RECONCILIATION_REQUIRED` and `verified: false`.

## Interpretation

This closes a **test-coverage gap**, not the settlement gap. It proves the environment invariant can be durable while the separate Nexo operation remains unresolved. The existing owner correctly does not infer settlement from that invariant.

No terminal settlement API was added. No caller-supplied verifier, generic transaction wrapper, synthetic receipt, queue, or tombstone was introduced. Runtime dispatch/outcome migration remains blocked until the operation-specific repair contract defines when a durable desired-state observation is sufficient and when life-state/target data must remain UNKNOWN.

## Exact-head CI

All three workflows passed on the exact code/test commit:

- Mission/admission/continuity: [39107632187](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632187)
- Outcome classification: [39107632188](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632188)
- Semantic validation: [39107632199](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632199)

The mission/continuity workflow log explicitly ran `node tests/nexo/simulation-restart-persistence.test.mjs` and emitted: “repair crash-cut remains explicitly unsettled.”

## Remaining gate

Specify the **repair-only recovery contract** for `repair_agent_state`, `repair_agent_needs`, and `repair_resource_state` from the persisted snapshot schema and actual normalization semantics. Keep it read-only until its decisions are explicit. Test: desired invariant already present after restart; invariant absent after restart; malformed/missing target; unknown `alive`; stale environment revision; Nexo continuity revision conflict. Only then consider an owner settlement method. Non-idempotent actions remain UNKNOWN and must not be replayed.

M0 remains incomplete. Legacy runtime outcome functions remain. Protected effects STOP. STEP 7 remains OPEN / STOP / UNKNOWN. No real-device migration was performed.
