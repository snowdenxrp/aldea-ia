# P112 SHARED WRITER FOOTPRINT AUDIT V1 — 2026-10-07

Research-only; traced actual simulation.js.

## Shared writers that cut across all classes
1. tick() is a major shared writer: advances time/day, calls advanceWorldDay() and advanceSocietyDay(), updates needs, perception, knownResources, intents, decisions, actions, region visits, spatial knownRegions and activeRegions.
2. advanceWorldDay() is outside any selected action and can invalidate resource/economy/spatial/production assumptions.
3. advanceSocietyDay() is outside selected action and can invalidate social, economy, technology, institutions, population and related predicates.
4. normalize helpers run at simulation creation and some context paths can mutate state; they are not a demonstrated transactional boundary.
5. performDecision() performs multiple mutation classes after selection: direct action execution, relationship/social changes, knowledge learning, exploration/discovery, memory/events, skills and plan results.

## Consequence
A protected action transition cannot safely validate only at executeAction(): shared writers can invalidate admission around that point, and performDecision() contains direct mutation branches outside executeAction().

The smallest defensible boundary has two dimensions: admission dependency closure; and every concurrent writer capable of invalidating that closure before protected commit.

This does NOT prove that the whole simulation must serialize. It proves only that any narrower boundary must explicitly exclude writers that cannot invalidate the claim.

## New observation
 tick() also performs region/spatial writes after performDecision(). Therefore spatial/range dependencies can be invalidated by the simulation loop itself even when the selected action handler does not touch spatial state.

## Status
GREEN: shared writer paths identified.
BLUE: exact dominance/common-boundary relation and commit ordering remain open.
No runtime concurrency claim.

## Exact next
Construct the intersection graph: for each representative class, list shared writers and mark which dependency they invalidate. Find the smallest set of shared-writer boundaries whose exclusion/serialization would make each composite token complete. Then compare that set against a broader protected transition.
