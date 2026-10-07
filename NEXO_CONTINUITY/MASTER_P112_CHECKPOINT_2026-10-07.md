# MASTER P112 CHECKPOINT — 2026-10-07

## Continuity state
Protected analytical anchor: AB105.116R.
Current historical primary Nexo continuity frontier: AB104.151.
Formal P112 closure is NOT declared.
AB105.117R remains prohibited.
TLC remains frozen; do not rerun.

## Current research block
AB104.185 question: minimum safe VersionSet granularity for Lúmina protected transitions.

## New evidence saved
Checkpoint: NEXO_CONTINUITY/P112_VERSIONSET_RESEARCH_CHECKPOINT_2026-10-07.md
Commit: 18b203e96e46e344616775023c0f3343d0e77748

Later retrospective research, used only as cross-check, recovered:
- AB104.600: WriteSet alone insufficient; static DependencySet only safe with proven conservative closure; dynamic authoritative-read capture needed when closure is incomplete; predicate/range/aggregate dependencies and access-path coverage matter.
- AB104.601: derived/cache/helper dependency leakage; provenance must survive derivation; cache hits are reads; unproven dependency coverage => HOLD/REVALIDATE.
These later documents are not backfilled into missing primary AB104.185+ artifacts.

## Current conclusion
The smallest defensible safety unit is a protected transition footprint, not a fixed object/subsystem version:
ReadSet + WriteSet + DependencySet + predicate/range/aggregate dependencies + incarnations + authoritative versions + relevant policy/logic/config versions, followed by conditional validation/commit.

Exact minimal practical granularity remains OPEN because dependency completeness and bypass coverage are not yet proven.

## Next exact action
Continue auditing actual Lúmina code for:
1. derived/cache/helper reads;
2. predicate/aggregate reads;
3. direct mutation bypasses;
4. conservative dependency envelopes per transition;
5. completeness of dynamic authoritative-read capture.

## DO-NOT-REPEAT
No implementation. No TLC rerun. No semantic freeze. No backfill of missing primary AB104 artifacts. No exactly-once/JMM-HB claims.

## P112 additive continuation — 2026-10-07

### Helper/derived/predicate audit
Confirmed concrete cross-domain dependencies:
- economy inventory aggregation and price state;
- production/development eligibility predicates plus technology/land reads;
- research specialization/knowledge/skills/ecosystem/economy reads;
- institution/governance thresholds from cooperation, trades, population, shelters, commons, membership, relationships and hunger.

A helper-return value is not a dependency boundary. Its authoritative inputs remain dependencies.

### Action/decision audit
The decision/admission footprint is larger than the final executeAction() mutation footprint.
Confirmed reads include:
- perception and visible agents;
- inventories and money of participants;
- economy price state;
- hunger/needs;
- relationships/trust/cooperation/tension;
- knowledge/memory/confidence;
- institutions/commons;
- territory/spatial state;
- technology/skills/tools;
- plans/priorities;
- resources and exploration state.

Therefore WriteSet-only validation is rejected.

### Current protected-transition candidate
Decision/admission reads
+ handler reads
+ helper/derived reads
+ dependency-producing context
+ complete WriteSet
+ predicate/range/aggregate dependencies
+ relevant version/incarnation/policy context
→ conditional validation
→ commit.

### Current status
🟢 Writer overlap confirmed.
🟢 Hidden/derived/predicate dependencies confirmed.
🟢 Decision-layer dependencies beyond executeAction confirmed.
🟢 WriteSet-only validation rejected.
🔵 Complete dependency capture OPEN.
🔵 Exact minimal practical granularity OPEN.
🔵 Conservative action-class envelope OPEN.

### Exact next
Audit perceiveWorld(), evaluateOptions()/createDecisionContext(), getTerritorialContext(), collective/cooperation helpers, and branch-dependent/random/external observations. Map authoritative reads, derived reads, predicates/aggregates, writes and provenance; compare against direct Nexo handlers and recovery/reconciliation paths.

### DO-NOT-REPEAT
No VersionSet implementation yet. No new executor/caller. No TLC rerun. No historical AB104.185 backfill. Do not treat stateRevision as a mutation fence or filesystem lock as exactly-once external-effect protection.


## P112 latest saved checkpoint
- `P112_PERCEPTION_TERRITORIAL_COLLECTIVE_AUDIT_2026-10-07.md`
- Commit: `2af97f32a11b579b505adba4a145bb5e873c8ccb`
- Concrete perception/decision/territorial/collective dependencies mapped.
- Nearby-agent/resource membership predicates and derived territorial/score values are claim-relevant dependencies.
- `normalizeSpatialWorld()` is a hidden mutation-capable path inside territorial context extraction.
- Random choice must be bound or treated as nondeterministic evidence for protected claims.
- Complete instrumentation/coverage remains UNKNOWN; minimal granularity and action-class envelopes remain OPEN.
- Exact next: audit specialization, territorial bonus, exploration, relationship, memory, discovery helpers and random/external observation paths.


## P112 latest helper audit
- `P112_HELPER_DEPENDENCY_AUDIT_2026-10-07.md`
- Commit `2c16869bc5f92b2e1bbbe7bdfb63378af1ef2008`.
- Specialization, exploration, relationship, memory and discovery paths mapped.
- Derived helper output is not an authority boundary; normalization may write; collection selection creates predicate/order dependencies; knowledge and memory are mutable admission inputs.
- Complete dependency capture UNKNOWN; minimal granularity OPEN.
- Exact next: trace representative action-class envelopes: resource action, trade, cooperate, exploration, build/farm, including admission reads, handler reads/writes, derived/predicate dependencies and recovery/reconciliation inputs.


## P112 action-class envelopes v1
- `P112_ACTION_CLASS_ENVELOPES_V1_2026-10-07.md`
- Commit `7d56009d3abd8bc1cd8ef2c6e1f05303c89e286f`.
- Representative envelopes mapped: gather_wood, catch_fish, trade, cooperate, exploration, build/farm.
- Posterior AB104.152+ research was checked only as retrospective cross-check; no missing AB104.185 primary artifact was backfilled.
- Main result: fixed object-only version is insufficient; protected transition footprint must include admission reads, handler reads/writes, predicate/range/aggregate dependencies, derived provenance and relevant versions/incarnations with conditional validation.
- Exact next: complete the full admission chain perception -> options -> scoring -> selection -> execution, separating authoritative final-gate dependencies from observational inputs.


## P112 posterior AB evidence reconciliation
- `P112_POSTERIOR_AB_EVIDENCE_RECONCILIATION_2026-10-07.md`
- Commit `1475fc1e8025217ab92d87edbd0ec81f561d896a`.
- Later AB104.180-.184 directly corroborate the current protected-transition/version-set direction.
- AB104.600-.602 add strong provenance-loss classes: derived/helper leakage, cache races/invalidation, speculative reads, external observations, crash/retry provenance loss, and final-gate staleness.
- No historical AB104.185 backfill; later artifacts remain retrospective cross-checks.
- Exact next: continue admission-chain trace and adversarially test each Lúmina envelope against AB104.602 provenance-loss classes.


## P112 admission-chain + provenance audit — 2026-10-07
- `P112_ADMISSION_CHAIN_PROVENANCE_AUDIT_2026-10-07.md`
- Commit: `3436ad264f5a7671aaf6f0ce11d7d4490098ea05`
- Full chain traced: perception -> options -> decision context -> scoring -> randomized selection -> execution boundary.
- Admission footprint confirmed wider than executeAction WriteSet; multi-stage derived dependencies, predicate/aggregate inputs, hidden mutation-capable normalization/context paths, and random selection are claim-relevant where they influence the protected outcome.
- AB104.602 cross-check: A1 and A8 concretely relevant; A2/A3/A5/A6/A7 remain open where no corresponding current Lúmina mechanism was evidenced.
- Final-gate DependencySet is claim-specific: include every observation that influenced eligibility/target/score/branch/protected precondition plus transitive authoritative inputs, not every merely observed value.
- Complete provenance propagation and final-gate conditional validation remain OPEN.
- Exact next: trace selected action into performDecision()/executeAction() and locate the future protected final-gate revalidation boundary, including hidden writes and recovery/reconciliation state.


## P112 final-gate / execution-boundary audit — 2026-10-07
- `P112_FINAL_GATE_EXECUTION_BOUNDARY_AUDIT_2026-10-07.md`
- Commit: `c18d8c330cefd6b0ad1d85ace30eacef2805adde`
- No demonstrated FINAL_GATE exists between selected intent and mutation.
- `executeAction()` is insufficient: socialize, share_knowledge, cooperate, exploration and discovery branches mutate directly outside it.
- Ordinary actions also re-read mutable state at execution (e.g. trade partner; skill/random/resource state), so selected intent is not final validated state.
- Post-effect learning/memory/discovery/event writes are additional mutation surfaces.
- Exact next: map ReadSet/WriteSet for every mutation entry point and intersect with `tick()`, `advanceWorldDay()`, `advanceSocietyDay()` and other writers to determine smallest protected transition footprint.


## P112 protected-footprint intersection audit — 2026-10-07
- `P112_PROTECTED_FOOTPRINT_INTERSECTION_AUDIT_2026-10-07.md`
- Commit `013d4aef479ab29cdc689fe965d60019f2e8d924`.
- Direct mutation entry points and shared-writer intersections mapped.
- Concrete overlap: water/wood/fish/land actions intersect daily world/ecosystem writers; trade intersects daily economy aggregation; collective actions span multiple agents/structures/relationships.
- Conclusion: smallest protected unit must include Admission ReadSet + transitive dependency closure + handler ReadSet + predicate/range/aggregate dependencies + protected WriteSet + concurrent shared writers.
- Repository search for AB104.186+ / AB104_18 returned no indexed results; no posterior claim or historical backfill made.
- Exact next: overlap matrix for representative action classes and determine which conflicts need object/subsystem version, predicate/range token, or broader transaction footprint.


## P112 existing version-token audit — 2026-10-07
- `P112_EXISTING_VERSION_TOKEN_AUDIT_2026-10-07.md`
- Commit `0f78649b7c91a1fb03b3cfd887afce0f5761feef`.
- Existing spatial version-like fields found, but no demonstrated uniform increment/conditional-commit discipline.
- No demonstrated generic agent revision, relationship revision, resource revision, economy aggregate revision, collective-project revision, spatial predicate/range token, or random-selection evidence binding.
- Conclusion: do not invent a global revision merely to make the matrix pass; token validity depends on complete mutation coverage or explicit dependency revalidation.
- Exact next: audit mutation ownership/bypasses for resource, agent inventory/needs, relationship, economy aggregate, and spatial/range domains.


## P112 representative action trace — 2026-10-07
- `P112_RESOURCE_TRADE_COOPERATE_TRACE_2026-10-07.md`
- Commit: `b8b8f052ff67c9bbf9cbb49aca88b0c23c9fa367`.
- Resource, trade and cooperate were traced end-to-end from admission inputs through handler mutation and shared invalidators.
- Resource: single resource token is insufficient because agent/tool/skill/spatial/ecosystem/random dependencies can invalidate the claim.
- Trade: participant-only revisions are insufficient because daily economy pricing reads the inventories of all alive agents; relationship and inventory writers also bypass the trade handler.
- Cooperate: project token alone is insufficient because eligibility/completion spans participants, inventories, relationships, structures/home and spatial predicates.
- Cross-class conclusion: direct WriteSet validation misses authoritative admission dependencies; token ownership must sit at the authoritative mutation boundary and cover every invalidating writer.
- 🔵 Exact token ownership/update discipline and composite-token vs broader protected-footprint optimization remain OPEN.
- Exact next: adversarial stale-admission/write-skew cases for resource/trade/cooperate, then compare composite tokens vs protected-footprint serialization vs conditional snapshot/commit with stale rejection.
- Search for AB104.18 / AB104_18 still returned no indexed later primary artifacts; no historical backfill made.


## P112 adversarial stale-admission/write-skew audit — 2026-10-07
- `P112_ADVERSARIAL_STALE_ADMISSION_WRITE_SKEW_V1_2026-10-07.md`
- Commit: `994af1116478039db7862b0fc1619160fae45730`.
- Modeled three distinct conflict surfaces from actual code paths: shared resource quantity, economy aggregate/price, and collective-project predicate/progress.
- Result: participant/agent-local tokens cannot reject these conflicts; complete writer coverage is the decisive requirement for any composite token.
- Compared three candidate strategies: composite dependency tokens, serialization over the intersecting protected footprint, and conditional snapshot/commit with stale rejection.
- 🔵 Exact minimal boundary and token ownership remain OPEN.
- Exact next: construct writer→token coverage for the three classes and identify uncovered mutators; uncovered mutators define the minimum broader protected footprint.

## P112 writer→token coverage matrix cross-check — 2026-10-07
- Existing artifact: `P112_WRITER_TOKEN_COVERAGE_MATRIX_V1_2026-10-07.md`
- Existing commit: `57abed4c62150ba3e71f247197e84f2c23d3e043`; read-back artifact SHA: `6077361dd06f8e5724ef17571a76a538d0210d12`.
- No duplicate artifact was created.
- Matrix confirms Resource, Agent inventory/needs, Relationship, Economy aggregate/price, Collective project, Structures/land, Knowledge/discovery, Memory, Technology/culture/specialization and Institutions/commons are C (no demonstrated complete token); Spatial/range is B (partial token only).
- Therefore no current token set can honestly be promoted to a complete semantic fence for the three representative classes.
- Exact next remains: trace narrowest authoritative mutation boundary for each C domain and determine whether one token can cover all invalidators; otherwise use dependency token class or broader protected footprint.


## P112 authoritative mutation-boundary trace — 2026-10-07
- Extended existing writer→token matrix; no duplicate artifact created.
- Resource: action handlers + daily world/ecosystem writers invalidate resource state; agent inventory/needs/tool state are separate dependencies. No common semantic token funnel demonstrated.
- Trade: trade() is the physical transfer boundary, but admission dependencies are invalidated by external inventory, economy aggregate/price, and relationship writers. Trade-local token is insufficient.
- Cooperate: project creation/contribution are local boundaries, but admission and completion depend on participant inventory/home/alive/relationship plus project/structure/memory/event domains with external writers. Project token alone is insufficient.
- New conclusion: narrowest function boundary is not necessarily narrowest semantic protected boundary. Token ownership must dominate every invalidating writer; otherwise broader multi-domain footprint is required.
- Matrix update commit: 0581f8221094065a485af612f3101585cdaf12b8; content SHA: afeeabee0757a2085374ece2ebcb25378b68351a.
- External conceptual cross-check: serializable systems track read/predicate dependencies, not final writes alone. citeturn0search2turn0search0
- Exact next: trace remaining invalidators into a writer→dependency graph and locate the first common boundary dominating all writers per class; if absent, define the minimum multi-domain protected footprint.


## P112 writer→dependency graph V1 — 2026-10-07
- Saved `P112_WRITER_DEPENDENCY_GRAPH_V1_2026-10-07.md` at commit `d5adbea085eb541e46683b0d0ab9a0a612d828d3`.
- Resource, trade and cooperate graphs show no single local effect function dominates all admission invalidators.
- Resource shared invalidators: action handlers + production + world/day + ecosystem.
- Trade shared invalidators: inventory writers + trade + aggregate economy recomputation + relationships + lifecycle/position.
- Cooperate shared invalidators: inventory + relationships + collective project + structures/home + spatial/lifecycle.
- Therefore the first common semantic boundary is broader than the local effect function for all three classes.
- 🔵 Exact minimum common boundary/token ownership remains open; no runtime concurrency claim.
- Exact next: trace shared writers (tick/day transitions/normalization/social-economic helpers) into the protected footprints, then test whether composite tokens can reduce that footprint without losing coverage.


## P112 shared-writer footprint audit — 2026-10-07
- Saved `P112_SHARED_WRITER_FOOTPRINT_AUDIT_V1_2026-10-07.md`, commit `d2cfeb66e7df4f533f9f806a6f2963ca6dac075e`.
- `tick()` is a shared writer and surrounds the selected transition with time/day, needs, perception, decision, action, spatial-region and learning mutations.
- `advanceWorldDay()` and `advanceSocietyDay()` can invalidate admission assumptions outside the selected action handler.
- `performDecision()` has protected-relevant mutation branches outside `executeAction()` (social, knowledge, cooperation, exploration/discovery, memory/events/skills).
- Spatial/range state is also written after `performDecision()` in the same tick.
- Result: final protection cannot be reduced to executeAction() alone; exact smallest shared-writer exclusion set remains OPEN. This is not a proof that the entire simulation must serialize.
- Exact next: build the intersection graph of representative classes × shared writers × invalidated dependencies, then compare the minimum exclusion set against a broader protected transition.


## P112 shared-writer intersection graph V1 — 2026-10-07
- Saved `P112_SHARED_WRITER_INTERSECTION_GRAPH_V1_2026-10-07.md`, commit `87a7eeb39d79aad09492da4a7e4f096ddb956a9f`.
- Resource: token must cover shared resource writers plus agent/spatial/ecosystem/random dependencies; agent-only revision is insufficient.
- Trade: participant-only token is insufficient because `advanceEconomyDay()` recomputes dynamic price from inventories of all alive agents.
- Cooperate: requires participant + relationship + project + resource + spatial/alive dependencies; project contribution can change project status/structures and other writers can invalidate admission predicates.
- `tick()` and `performDecision()` are coordinators across multiple mutation domains, not demonstrated minimal token owners.
- Result: global `stateRevision` remains an unjustified shortcut; composite tokens are viable only with complete authoritative writer coverage. Otherwise broader protected footprint or conditional snapshot/commit with complete dependency closure is required.
- Status GREEN concrete intersections; BLUE exact token ownership/order remains OPEN.
- Exact next: trace subordinate writers of the shared writers and identify whether each candidate token has a single authoritative mutation boundary.


## P112 shared-writer subordinate coverage audit V1 — 2026-10-07
- Saved `P112_SHARED_WRITER_SUBORDINATE_COVERAGE_AUDIT_V1_2026-10-07.md`, commit `6847f288d023a3e9ab98cc370f3519cae629b569`.
- Resource invalidators are distributed across actions, production, world/ecosystem, agent state, spatial/exploration and daily simulation paths; no single token owner demonstrated.
- Trade has two especially broad dependencies: inventory writers across domains and aggregate price recomputation over all alive-agent inventories.
- Cooperate spans project state, participant inventory, relationships, homes/structures/safety, spatial/alive state; project revision alone is insufficient.
- Concrete bypasses: `getOrCreateRelationship()` can mutate while observing; spatial/biome helpers can materialize state; `discoverArea()` mutates spatial/discovery state; `advanceSocietyDay()` is a broad cross-domain writer; `tick()` writes spatial state after decision/effect processing.
- Result: composite tokens remain candidate representations, not proven minimal protection. Defensible choices are explicit authoritative mutation boundaries, claim-specific protected footprint, or complete dependency-capture + conditional commit/stale rejection.
- Exact next: audit the admission→commit temporal window and classify each writer as block, invalidate-by-version, or reconcile; separately isolate post-commit learning/event writes.


## P112 admission→commit temporal window audit V1 — 2026-10-07
- Saved `P112_ADMISSION_COMMIT_TEMPORAL_WINDOW_AUDIT_V1_2026-10-07.md`, commit `3d62373380a1d9732cf826ef6017713e0bd18a9f`.
- Current temporal window has broad invalidators: world/society day transitions, tick-level needs/perception/knownResources/selection updates, relationship materialization, spatial/exploration materialization, randomness, and daily technology/research/specialization/institution/governance writers.
- Day/shared writers must be blocked/excluded or cause final revalidation; they cannot be treated as invisible concurrent state.
- Hidden mutations during observation must occur before capture or be modeled as mutation/dependency events.
- Post-effect learning/memory/discovery/events are separated from the physical atomic footprint unless they become authoritative inputs to later claims.
- Defensible protocol shape: capture claim-specific provenance → protected admission → prevent/detect invalidation → complete final revalidation → commit or stale/UNKNOWN/reconcile.
- Exact next: identify the first common final-commit boundary covering admission context + dependency validation + local protected mutation + durable history/state, while excluding non-authoritative post-effect writes from unnecessary serialization.


## P112 final-commit common-boundary audit V1 — 2026-10-07
- Saved `P112_FINAL_COMMIT_COMMON_BOUNDARY_AUDIT_V1_2026-10-07.md`, commit `f8704496184eb498d87847afebbd47d1004c61ec`.
- `performDecision()` is too broad to be treated as a durable atomic boundary by itself; `executeAction()` is too narrow because direct mutation branches exist outside it; persistence boundary alone does not prove in-memory mutation atomicity or retroactive fencing.
- First viable design candidates are an explicit protected-transition executor or complete conditional snapshot/commit, but neither is implemented or proven.
- Post-effect memory/learning/discovery/events should remain outside the physical critical footprint unless they are authoritative inputs to the same claim.
- Exact next: audit durable commit/crash cuts and classify each point as COMMITTED, NOT_COMMITTED, or UNKNOWN without inferring outcome from exceptions.


## P112 durable commit / crash-cut audit V1 — 2026-10-07
- Saved `P112_DURABLE_COMMIT_CRASH_CUT_AUDIT_V1_2026-10-07.md`, commit `11f74ff7ca786db6ef1be4ba9f97fce9edba5234`.
- Reconciled current final-boundary research with primary AB104.142–151 evidence.
- Crash cuts classified: before prepared checkpoint = NOT_COMMITTED/blocked; durable prepared before handler = PREPARED if ordering is evidenced; mutation before durable outcome = UNKNOWN; handler return without durable outcome = UNKNOWN; durable outcome = COMMITTED; uncertain persistence crash = UNKNOWN until storage evidence/reconciliation.
- Exception/catch cannot prove effect absence. Retry requires known absence or a valid idempotency/reconciliation contract.
- Local durable transition still does not imply exactly-once external effect; provider capability/fencing/idempotency remains separate.
- Exact next: trace the smallest local transaction candidate and identify which crash cuts it actually closes.


## P112 smallest local transaction candidate V1 — 2026-10-07
- Saved `P112_SMALLEST_LOCAL_TRANSACTION_CANDIDATE_V1_2026-10-07.md`, commit `aee531352304a5b94f0d7e118892fa67b4983761`.
- Candidate boundary: Operation/Admission identity + authority/dependency provenance + prepared intent + deterministic local transition inputs + local state/history delta + durable commit marker/outcome.
- Crash cuts: before durable PREPARED = NOT_COMMITTED; durable PREPARED before mutation = PREPARED/NOT_ATTEMPTED; mutation + durable commit = COMMITTED; mutation before durable commit = UNKNOWN unless true atomic storage/recovery proves otherwise; durable commit before response = COMMITTED after recovery.
- Current JS in-memory mutation followed by filesystem persistence has no demonstrated atomic point joining mutation and durable commit; lock/temp/rename do not imply rollback or transaction semantics.
- External effects remain a separate capability boundary.
- Exact next: trace the actual lock/temp/rename/stateRevision primitive and determine which crash cuts it closes by contract.


## P112 persistence primitive crash-cut audit V1 — 2026-10-07
- Exact `scripts/simulate.mjs` persistence sequence inspected at `f8704496184eb498d87847afebbd47d1004c61ec`: lock → expectedRevision check → payload serialization → temp write → rename → unlock.
- This closes a cooperating-writer stale-revision race at the persistence boundary, but the lock is acquired only during persistence; simulation mutation happens earlier, so the lock is not an execution/effect fence.
- Failed write/rename behavior is bounded by AB104.142: prior canonical state is preserved and temp is cleaned. Rename gives a namespace replacement boundary, but current code does not demonstrate fsync/durable flush before rename or directory sync after rename.
- Therefore rename success is not promoted to universal crash/power-loss durable COMMITTED; strict durability outcome can remain UNKNOWN around storage failure/power loss.
- Exact next: separate recoverable local journal/commit-marker semantics from the storage durability model (process crash vs OS crash vs power loss), then compare against current `persistState()` without assuming a new database.


## P112 local journal vs storage durability V1 — 2026-10-07
- Repository search found no `fsync`, `fdatasync`, or `FileHandle.sync()` associated with `persistState()`.
- Separated two independent guarantees: logical recovery evidence (PREPARED/COMMITTED/UNKNOWN) versus physical storage durability under a chosen crash model.
- Existing lock/temp/rename can be reused conceptually, but rename alone is not promoted to power-loss durable commit. A future local transaction needs an explicit durability contract and matching barriers.
- Exact next: audit existing `nexoMemory` journal fields for PREPARED/COMMITTED/UNKNOWN semantics and identify execution metadata still only in memory.


## P112 Nexo journal semantics audit V1 — 2026-10-07
- Current `nexoMemory.nexo` persistence is real: missions/attempts/doNotRepeat/executions/effectJournal are serialized by `persistState()` and reconstructed by `loadState()`/`applyState()`.
- Restart test explicitly preserves a `prepared` effectJournal entry, proving serialization/reconstruction of PREPARED evidence, not external-effect completion.
- Mission terminal outcomes are a separate history: `recordNexoOutcome()` accepts completed/failed/blocked and requires verified evidence for completed. Do not collapse mission outcome and effect journal into one authority.
- `effectJournal` is bounded to the last 200 entries; unresolved evidence can therefore be evicted. Absence from the bounded journal must not mean ABSENT.
- `nexoEffectRevision` is in-memory and not serialized, so it is not a durable commit marker or fence.
- Exact next: trace complete effectJournal lifecycle from prepare/record through handler, terminal update, persistence, exception and crash cuts.


## P112 effect journal lifecycle/crash-cut audit V1 — 2026-10-07
- `effect-adapter.js` lifecycle confirmed: prepared entry → optional `persistPreparedIntent` → handler → postcondition → terminal `persist()`; runtime separately records mission execution/outcome.
- Crash before hook completion leaves PREPARED only in RAM unless caller made the hook durable.
- Handler mutation precedes terminal journal update; crash between them can leave PREPARED while mutation may already have occurred. PREPARED is therefore not NOT_ATTEMPTED.
- Handler exceptions intentionally return `EFFECT_OUTCOME_UNKNOWN` without terminal `persist()`; recovery must reconcile when durable PREPARED exists.
- Terminal journal updates are in-memory until `persistState()` is invoked; no demonstrated atomic join exists between handler mutation, journal terminal state, and persisted simulation state.
- Current repository still has no demonstrated integrated production caller that supplies a durable `persistPreparedIntent` checkpoint.
- Exact next: trace actual `persistPreparedIntent` callers and terminal `persist()`→`persistState()` integration to locate the missing durable atomic/recovery boundary.


## P112 prepared checkpoint owner audit V1 — 2026-10-07
- Repository search independently confirms no production caller supplies `persistPreparedIntent`; only generic seam + tests were found.
- `scripts/simulate.mjs` is canonical world-state persistence owner; `scripts/assistants.mjs` persists planning/report state but does not execute `executeLuminaNexoStep()`.
- Test callback proves local contract only, not production integration.
- Adapter `persist()` updates in-memory journal/executed state; it does not call `persistState()`.
- Therefore no demonstrated production boundary currently joins prepared checkpoint, handler mutation, terminal journal, and canonical stateRevision persistence.
- Exact next: audit whether `scripts/simulate.mjs` can legitimately own effect execution or whether a separate execution-owner boundary is required; trace load→applyState→tick/mission→effect→persist before implementation.
