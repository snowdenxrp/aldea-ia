# P112 — EXISTING VERSION TOKENS × EXECUTEACTION BRANCH CROSS-CHECK — 2026-10-07

## Scope
Additive cross-check only. The earlier P112 existing-version-token audit is NOT repeated. This pass maps the already-inspected executeAction branches against the repository's actual token inventory.

## Evidence
Inspected current source:
- src/actions.js
- src/economy.js
- src/production.js
- src/development.js
- src/institutions.js
- src/agents.js
- src/world.js
- scripts/simulate.mjs
- src/nexo/simulation-adapter.js

## Branch results

### Resource actions
drink / eat_plant / catch_fish / gather_wood / gather_stone:
- No per-resource revision/incarnation is present on the mutated resource objects.
- stateRevision is only the canonical persistence conflict token; it is not advanced by each in-memory resource mutation.
- nexoEffectRevision is an in-memory adapter-local counter, not serialized and not resource-specific.
- Agent needs/inventory/skills/tool durability also lack a demonstrated semantic revision token covering the invalidating writers.
- catch_fish has outcome-defining random selection inside the mutation path; no bound random evidence token exists.

### Inventory-only actions
eat_fish / eat_farm_food:
- Inventory stacks have no revision/version field.
- Agent needs and inventory can be mutated by other paths.
- Therefore no existing object token provides stale-admission rejection for the complete transition.

### Production / structures
craft_tool / farm / harvest:
- Tool/skill/inventory state has no demonstrated object revision.
- fertile_land has no revision/incarnation token.
- farms/shelters have no demonstrated structure revision/incarnation token.
- technology reads used by craft/build paths have no demonstrated semantic version token in the inspected path.

### Trade
- seller/buyer inventory and money have no revision token.
- relationship state has no revision token.
- economy.priceMemory/trades have no aggregate revision token.
- advanceEconomyDay() recomputes price from all alive-agent inventories, so a participant-only token cannot represent the full dependency.
- partner lookup is a live predicate (id + alive); no partner-incarnation token is present.

### Institutions
- membership, commons balances, contribution/withdrawal history and institution state have no demonstrated revision/incarnation token.
- hunger is an agent-state dependency without a semantic revision token.
- The institution predicates therefore require dependency revalidation or a broader protected footprint.

## Cross-check conclusion
The branch graph does not reveal a missed existing semantic token that can safely replace the claim-specific DependencySet / protected-footprint approach.

Existing tokens remain:
- stateRevision: canonical persistence conflict token only.
- nexoEffectRevision: in-memory local execution counter only.
- world.spatial.version / regionVersion: version-like spatial fields, but no complete writer coverage/conditional-commit discipline demonstrated.

Therefore:
- Do NOT invent a global revision.
- Do NOT promote nexoEffectRevision to a fence.
- Do NOT promote spatial version-like fields to authoritative predicates without complete writer coverage.
- Existing branch semantics still require claim-specific dependencies and final revalidation.

## Status
🟢 No overlooked branch-local semantic token found in the audited source.
🔵 Complete dependency coverage remains OPEN.
🔵 Exact minimal token partition / protected footprint remains OPEN.
🔴 No atomicity/exactly-once claim.

## Exact next
Trace the first common authoritative mutation boundaries for the remaining shared writers, specifically:
1. resource/day/ecosystem invalidators;
2. inventory/needs writers outside executeAction;
3. relationship writers and observation-side mutation;
4. economy aggregate writers;
5. spatial normalization/range writers.

Then determine whether any existing version-like field can acquire complete writer coverage without introducing a new global revision.