# P112 — Helper/derived/predicate audit — 2026-10-07

## Confirmed code evidence

### Economy
inventoryAmount(agent,type) scans an agent inventory. advanceEconomyDay() aggregates inventory across all alive agents to compute stock/per-capita scarcity and then mutates priceMemory/priceHistory. getDynamicPrice() normalizes and reads economy price state.
Therefore an economy transition has a broad agent-inventory ReadSet plus economy state, not just priceMemory.

### Production/development
canCraftTool() and canBuildShelter() derive eligibility from inventory thresholds. craftTool() additionally reads targetWorld technology levels to derive efficiency/durability. farm() reads fertile_land and mutates it plus structures/agent state. advanceProductionDay() reads technology/agriculture and land quality, then mutates every farm and fertile-land quality.
These predicates/derived values are claim-relevant dependencies when the corresponding action is admitted.

### Research
getResearchTopics() branches on specialization role, knowledge and skills. runResearchExperiment() reads ecosystem humanPressure, economy priceMemory, ecosystem soilQuality, and agent skills depending on topic. researchSummary() derives counts/status/confidence from research collections.
Thus research contains branch-dependent and aggregate/derived dependencies; a topic result cannot be represented safely by only the final evidence object.

### Institutions/governance
advanceInstitutionDay() derives thresholds from cooperation history, recent trades, shelter count, alive population, commons contribution/withdrawal history. getInstitutionOptions() derives action eligibility from membership, inventory, hunger, and commons balances. advanceGovernanceDay() derives proposals/votes from institution history, membership, relationship trust and hunger.
These are predicate/aggregate reads crossing multiple state domains.

## Architectural result
A helper that returns a boolean/value is not a dependency boundary. The authoritative inputs used to compute it remain dependencies.

A future capture mechanism must either:
1. instrument authoritative reads underneath these helpers, preserving provenance; or
2. treat the helper's enclosing state/domain as a conservative dependency envelope.

DependencySetRecorded alone is insufficient if helpers/aggregates can read outside the recorder.

## Status
🟢 Concrete hidden/derived/predicate dependencies confirmed.
🟢 Economy and institution predicates cross domain boundaries.
🟢 Narrow resource-only versioning is further rejected.
🔵 Completeness of all authoritative helper reads is still OPEN.

## Exact next
Audit action dispatch and decision/precondition helpers to map which helper-derived dependencies are executed for each action class, then compare that against direct Nexo effect handlers and retry/reconciliation paths.

No implementation. No TLC rerun. No AB104.185 backfill.