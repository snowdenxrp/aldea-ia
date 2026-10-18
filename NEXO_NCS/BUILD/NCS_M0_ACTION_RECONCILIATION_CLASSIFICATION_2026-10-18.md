# NCS M0 — Action reconciliation classification

Date: 2026-10-18  
Repository: `snowdenxrp/aldea-ia`  
Branch: `ncs-clean-architecture`

## Rule

A postcondition describes a desired state; it does not automatically prove that a specific PREPARED operation caused that state. A state revision is not an operation receipt. For crash recovery, require either (a) an operation-specific durable record that can be independently read and tied to the existing Nexo mission/step identity, or (b) a documented proof that retrying the operation is semantically idempotent and cannot duplicate or reverse a consequential effect. Otherwise retain UNKNOWN.

This classification is based on the current `src/actions.js`, `src/production.js`, `src/development.js`, `src/economy.js`, `src/institutions.js`, `src/nexo/simulation-adapter.js`, and persistence code.

## Action matrix

| Action / handler | Durable observations present in Lúmina state | Replay / attribution risk | Current recovery decision |
|---|---|---|---|
| `repair_agent_state` | Agent position and alive flag in snapshot | Normalization is mostly convergent, but the current postcondition does not prove this operation ran; dead-agent behavior also needs review | Candidate for a separately specified convergent repair contract; not yet terminally settled |
| `repair_agent_needs` | Agent needs in snapshot | Clamping is convergent; no operation receipt, and a repeated run increments the in-memory effect revision | Candidate for convergent repair contract; not yet terminally settled |
| `repair_resource_state` | Resource object/amount in snapshot | Normalization is convergent for existing amount fields; no operation receipt | Candidate for convergent repair contract; not yet terminally settled |
| `rest` | Agent energy/activity | Repeating increases energy again; no unique event | UNKNOWN; do not replay |
| `drink` | Water amount, thirst, activity | Repeating consumes more water and changes thirst | UNKNOWN; do not replay |
| `eat_plant` | Plant stock, hunger/health, activity | Repeating consumes more stock and changes needs | UNKNOWN; do not replay |
| `catch_fish` | Fish stock, inventory, energy/activity | Even a failed catch can mutate energy/activity; success changes stock and inventory | UNKNOWN unless independently reconciled; no replay |
| `eat_fish` | Inventory, hunger/activity | Repeating consumes additional fish | UNKNOWN; no replay |
| `gather_wood` / `gather_stone` | Resource stock, inventory, energy, tool durability | Repeating gathers additional material and may consume tool durability | UNKNOWN; no replay |
| `build_shelter` | Structure list, agent home/safety, inventory | Appends a shelter whose ID is based on current list length; replay can create a second shelter | UNKNOWN; no replay |
| `craft_tool` | Inventory and toolmaking skill | Consumes materials, increases skill, appends a tool; replay duplicates effects | UNKNOWN; no replay |
| `farm` | Farm list, land, agent farm/safety, inventory | Appends a farm with list-length-derived ID; replay can create another farm | UNKNOWN; no replay |
| `harvest` | Farm food and inventory | Transfers food from farm to inventory; no operation-specific receipt | UNKNOWN; no replay |
| `eat_farm_food` | Inventory and hunger/activity | Repeating consumes more food | UNKNOWN; no replay |
| `contribute_commons` | Inventory, commons totals, contribution history | Transfer can be repeated; history records lack the Nexo operation identity | UNKNOWN; no replay |
| `withdraw_commons` | Commons totals, inventory, withdrawal history | Withdrawal can be repeated; history records lack the Nexo operation identity | UNKNOWN; no replay |
| `trade` | Both inventories/money, relationships, `world.economy.trades` | History exists but lacks the Nexo idempotency key; identical trades can be ambiguous; replay transfers value again | UNKNOWN; no replay |

## Consequences

- Existing state may support a read-only diagnostic, but most actions do not have enough durable provenance to safely say “this exact operation completed” or “this exact operation did not happen.”
- The repair actions are the only current candidates for a convergent/idempotent recovery contract, and even those need explicit constraints and tests. Do not infer completion from the existing `verified` boolean or a generic state revision.
- Do not retrofit fabricated IDs into history or use a generated structure ID as proof of Nexo operation identity. If a future contract needs operation correlation, specify the smallest change at the authoritative environment mutation/persistence boundary and test its restart semantics.
- Since `executeLuminaNexoStep()` currently mutates in-memory state and does not itself commit `world-state.json`, no terminal owner integration should be added before the effect and durable environment commit boundaries are connected.

## Next implementation gate

1. Define whether the existing simulation snapshot can be the authoritative environment read source for each candidate repair action.
2. For each candidate, prove behavior across: PREPARED before dispatch; mutation before persistence; persistence before Nexo settlement; restart with desired state already present; restart with desired state absent; stale/conflicting environment revision.
3. Keep all non-idempotent actions blocked while unresolved unless a source-backed operation-specific durable observation is available.
4. Only then specify the owner settlement API. Do not implement a generic success/failure switch before the operation evidence is defined.

## Status

This is an architecture/source classification, not a claim of execution or real-device verification. The fail-closed handler code and regression suite passed all three workflows at code/test head `431978730f3b2be300fa51d3a35938ef6702e607`: [mission/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986623), [semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986616), [outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986625).

M0 incomplete; runtime outcome path still uses legacy memory; PREPARED UNKNOWN; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.
