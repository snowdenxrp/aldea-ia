# P112 — ADMISSION CHAIN + PROVENANCE ADVERSARIAL AUDIT — 2026-10-07

## Scope
Research only. No implementation, no TLC rerun, no AB104.185 backfill.
Trace: perception -> options -> decision context -> scoring -> random selection -> execution.
Cross-check against AB104.600 and AB104.602 only as retrospective evidence.

## Concrete chain findings

### 1. Perception
`perceiveWorld()` reads live positions/alive state of other agents and world resource positions/radii. The returned values are derived observations, not durable provenance.
Final-gate relevance is conditional: an observation becomes authoritative when it influences option eligibility, distance, target, or score.

### 2. Option generation
`generateOptions()` expands the footprint substantially:
- known action confidence/knowledge;
- visible agents and nearest-agent ordering;
- partner alive state, inventory, money;
- relationships/trust/cooperation/tension;
- collective project membership/status;
- world resource amounts;
- technology/development/production eligibility;
- institution options;
- economy price state;
- exploration/spatial state;
- plans/priorities;
- action memory and knowledge;
- random exploration target.

Therefore the admission footprint is materially wider than executeAction WriteSet.

### 3. Decision context + scoring
`createDecisionContext()` copies needs, perception, knowledge, relationships, memories, recent action/result, specialization and skills.
`evaluateOptions()` adds specialization and territorial bonuses plus need pressure, knowledge/memory, exploration, trade and relationship-derived values.
These are multi-stage derivations: final scores must retain the authoritative source closure, not only the score.

### 4. Selection
`chooseOption()` performs randomized weighted selection among top candidates.
Randomness is decision input when protected outcome depends on it. Seed/state/consumption must be bound or the selection must be treated as nondeterministic evidence; merely logging the chosen option is insufficient provenance.

### 5. Hidden mutation / observation boundaries
`getTerritorialContext()` calls `normalizeSpatialWorld()`, which can initialize/mutate spatial state while extracting decision context.
`getOrCreateRelationship()` can create relationship state when a read-like path records an interaction.
`discoverArea()` mutates world spatial/exploration state and agent knownResources.
These are bypass/hidden-write classes: read/context boundaries are not automatically side-effect free.

## Action-class adversarial cross-check

- Resource actions: perception/resource amount + skill/tool + territorial/derived values can become stale before mutation.
- Trade: partner inventory, buyer money, seller inventory, price state and relationship/economy history form a coupled predicate; disjoint local writes do not imply independent admission.
- Cooperate: alive state, distance, relationship thresholds, combined inventory and collective project state create multi-object predicates; completion writes multiple agents/world structures.
- Exploration: spatial knownRegions/visits, resource observations, target selection and random target generation form dynamic dependencies; discovery itself expands authoritative state.
- Build/farm: eligibility reads inventory/technology/land and later mutation overlaps daily world/society/production writers.

## AB104.602 provenance-loss mapping

A1 Multi-stage derivation: CONFIRMED risk. Score/bonus/eligibility values erase source identity unless provenance is retained.
A2 Cache refresh race: no explicit authority cache found in this chain, but any future cached decision input must carry source revision/incarnation/freshness.
A3 Invalidation loss: not currently evidenced as a cache mechanism; remains required adversarial case.
A4 Speculative reads: decision/planning inputs must be classified OBSERVED_READ vs DECISION_INPUT vs AUTHORITATIVE_DEPENDENCY.
A5 External observations: not a current Lúmina source in this chain; future provider inputs require identity/incarnation/revision/freshness.
A6 Crash/retry: current chain does not prove captured decision provenance survives restart; retry cannot inherit authority without durable provenance.
A7 Derived/cache composition: CONFIRMED for helper-derived values; cached composition remains open.
A8 Final-gate race: CONFIRMED as an architectural gap; there is no demonstrated final validation of the complete admission closure immediately before protected mutation.

## Important new distinction
The authoritative final-gate DependencySet cannot simply equal every value observed by perception. It must include every observation that actually influenced eligibility, target, score, selected branch, or protected precondition, plus all transitive authoritative inputs of those values. Purely observational reads that did not influence the protected decision need not enlarge the claim-specific dependency set.

## Status
🟢 Admission chain mapped through execution.
🟢 Multi-stage derived dependencies confirmed.
🟢 Hidden mutation/bypass paths confirmed.
🟢 Random selection is a claim-relevant input when outcome depends on it.
🔵 Complete provenance propagation is OPEN.
🔵 Final-gate complete closure/conditional validation is OPEN.
🔵 Cache invalidation/provider/crash provenance cases remain OPEN where not present in current Lúmina path.
🔵 Smallest practical VersionSet granularity remains OPEN.

## Exact next
Trace the selected action from final decision into `performDecision()/executeAction()` and identify the exact point where a future protected final gate would have to revalidate:
1. selected option + provenance;
2. all transitive authoritative dependencies;
3. current owner/recovery/authority context where applicable;
4. complete WriteSet and predicate/range/aggregate dependencies;
5. random-selection evidence;
6. hidden writes from normalization/context helpers;
7. retry/recovery/reconciliation state.

## DO-NOT-REPEAT
No VersionSet implementation. No new executor/caller. No TLC rerun. No AB104.185 primary artifact. Do not treat `stateRevision`, filesystem locks, or temporal ordering as the missing final-gate proof.
