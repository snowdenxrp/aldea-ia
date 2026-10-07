# P112 — Action dispatch and decision dependency audit — 2026-10-07

## Confirmed

The decision layer reads materially more state than the final executeAction handler.

generateOptions() consults perception and visible agents; agent knowledge/memory/confidence; relationships/trust/cooperation/tension; inventories of the agent and potential partner; world resources and amounts/positions; economy priceMemory via getDynamicPrice(); institutions/commons through getInstitutionOptions(); territory/spatial state; technology/production/development predicates such as canCraftTool/canBuildShelter/canFarm; plans/priorities and exploration-region visits.

generateTradeOptions() reads partner inventory, agent inventory, partner money, agent money, economy price state, hunger and proximity.

buildCriticalHungerIntent() reads needs, inventory, known resources, world resource amounts, action knowledge, failure counters, energy and bounds.

tick() captures perception, derives options, chooses an intent, and later calls performDecision(), which reaches executeAction().

## Important distinction

The admission/decision footprint is often larger than the physical mutation footprint.

Example: a trade decision may depend on partner inventory, both money balances, priceMemory, hunger and proximity, while the handler additionally mutates both inventories, both money balances, relationships, economy trade history and priceMemory.

A resource action also depends on agent skill/tool state; tool selection reads all eligible tools and derives the best one before mutation.

Therefore a VersionSet based only on final WriteSet is unsound.

## New boundary result

For each protected transition, the minimum candidate evidence is:

Decision/admission reads
+ physical-handler reads
+ derived/helper reads
+ dependency-producing context
+ complete write-set
+ predicate/range/aggregate dependencies
+ relevant incarnation/version/policy context.

If any decision input is omitted, a later successful commit can still be based on stale admission.

This matches established serializable-concurrency reasoning: read/write dependencies, including aggregate/predicate effects, can invalidate an otherwise apparently independent commit.

## Status
🟢 Decision layer adds real dependencies beyond executeAction().
🟢 WriteSet-only validation is rejected.
🟢 Action-specific dependency footprints are required.
🔵 Exact complete footprint for every action remains OPEN because perception/territory/relationship/helper graphs still need exhaustive mapping.

## Next
Audit perceiveWorld, evaluateOptions, territorial context and collective/cooperation helpers to identify further hidden reads and whether a conservative action-class envelope can be proven.

No implementation, no TLC rerun, no AB104.185 backfill.