# P112 EXECUTEACTION BRANCH READ/WRITE GRAPH V1 — 2026-10-07

## Scope
Bounded branch-level audit following the already completed executeAction boundary audit. No repeat of persistence/runtime search.

## Branch classes

### 1. Resource consumption: drink / eat_plant / catch_fish / gather_wood / gather_stone
Common protected reads:
- current resource amount;
- agent inventory/needs;
- action amount;
- action-specific skill/tool state;
- for catch_fish, current RNG outcome;
- for plant consumption, current foodProperties/quality.

Protected writes:
- world resource amount;
- agent inventory where applicable;
- agent needs;
- tool durability where gathering;
- currentActivity.

Important: `catchFish` has an outcome-defining random draw inside the mutation itself. A pre-captured decision is therefore insufficient to reproduce the protected outcome unless RNG evidence/seed/operation identity is explicitly bound.

### 2. Inventory-only consumption: eat_fish / eat_farm_food
Reads:
- matching inventory stack and amount.
Writes:
- inventory;
- hunger;
- currentActivity.

These are the smallest representative protected transitions, but even here the exact stack/amount must be revalidated against the canonical snapshot before commit.

### 3. Production: craft_tool / farm / harvest
`craftTool` reads inventory + toolmaking skill + target world technology; writes inventory, skill, tool inventory.
`farm` reads inventory + fertile_land; writes inventory, fertile_land, structures, farm pointer, safety.
`harvest` reads owner farm + current food; writes farm food + inventory.

These cross agent and world/structure domains, so object-local versioning cannot be assumed without explicit dependency tokens.

### 4. Trade / partner mutation
Trade is the clearest multi-participant transition:
- resolves partner from current simulation;
- reads partner identity/aliveness;
- reads seller inventory and buyer money;
- writes both inventories and both money balances;
- writes both relationship records;
- writes world economy trade history and priceMemory.

Therefore the protected WriteSet spans at least seller, buyer, relationships, and economy state. The selected `partnerId` is not sufficient provenance: current partner incarnation/aliveness and relevant balances/inventory must be revalidated.

### 5. Institution actions
Contribute/withdraw reads membership, institution state and commons balance; writes agent inventory, commons balances, and contribution/withdrawal history. Withdrawal also changes hunger. Membership is an authority-like predicate for the transition and must be part of final dependency validation.

## Key conclusion

The action classes do NOT share one small fixed DependencySet.

Minimum safe abstraction is a claim-specific transition record:
- Action/Operation identity
- ReadSet/DependencySet with authoritative versions/incarnations where available
- WriteSet
- randomness evidence when outcome-defining
- participant/resource identity
- policy/invariant version where applicable
- precondition/result provenance

The same `executeAction()` dispatcher is therefore a mutation boundary, but not by itself a sufficient final-gate contract.

## Post-effect separation
The branch result is subsequently followed by learning, event recording, belief/skill updates and other simulation writes in `performDecision()`. Those writes must remain distinguishable from the protected effect transition.

## Status
🟢 Resource/inventory/trade branch graphs are concretely mapped.
🟢 Trade demonstrates multi-participant WriteSet and partner dependency.
🔵 Exact authoritative version/incarnation mechanism for these objects is not yet present.
🔵 Random outcome provenance for protected execution is not yet bound.
🔴 No claim of atomicity/exactly-once.

## Exact next
Audit the smallest existing version tokens available for these branch graphs and determine whether they can support stale rejection without introducing a second global revision primitive. Focus on actual object/version fields already present in the repository.

## DO-NOT-REPEAT
No re-search of persistence primitive; no repeat of executeAction boundary; no implementation; no TLC; no AB104.185 primary; no AB105.117R.
