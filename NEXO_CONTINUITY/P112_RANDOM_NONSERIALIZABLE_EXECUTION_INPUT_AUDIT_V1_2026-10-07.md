# P112 RANDOM / NON-SERIALIZABLE EXECUTION INPUT AUDIT V1 — 2026-10-07

## Scope
Audit non-state inputs crossing `applyState()` and protected Lumina execution, focusing on randomness and time-derived behavior that can affect a candidate result but are not represented in canonical `world-state.json`.

## Findings
1. 🟢 `createSimulation(world, agents, options)` accepts an injected `options.random` function and stores it as `simulation.random`.
2. 🔴 `applyState(state)` reconstructs the simulation without restoring a persisted random source/state. Therefore a restarted simulation defaults to `Math.random` unless a caller separately injects a random function.
3. 🟢 `getRandom(simulation)` uses `simulation.random` when present and otherwise `Math.random`.
4. 🟢 Concrete protected action `catch_fish` consumes `getRandom(simulation)()`; the draw changes whether the action succeeds and therefore changes candidate state/effect result.
5. 🔵 Decision selection also consumes injected randomness through `chooseOption()`, so admission/selection can be random even before the protected handler.
6. 🔵 Exploration target generation and other simulation paths also consume randomness; therefore random input is broader than one handler.
7. 🔴 A candidate that is rejected at `persistState(expectedRevision)` cannot be safely reconstructed as the same semantic attempt from canonical state alone if the defining random draw was not recorded/bound.
8. 🟢 This does not mean a retry is forbidden when the first candidate was purely local and discarded; it means the retry is a **new stochastic attempt**, not proof that it reproduces the prior admission/effect.
9. 🔵 For protected claims whose outcome depends on randomness, the minimum evidence must bind the draw/result or an equivalent deterministic random-state/provenance reference to the operation/attempt. The current repository does not demonstrate that binding.
10. 🔵 `movement.js` contains an additional non-state input: autonomous idle wandering derives a seed from `Date.now()`. This is not an external side effect, but it is another time-derived behavior not represented as canonical causal input.
11. 🟢 The persistence snapshot contains day/hour/world/agents/events/Nexo memory, but not the random generator state/function or a deterministic execution seed.
12. 🔵 Therefore whole-snapshot `stateRevision` protects stored state conflicts but cannot by itself establish semantic replay equivalence for random/time-dependent claims.
13. 🔴 No exactly-once, JMM-HB, or power-loss conclusion is made.

## Consequence
The protected-transition model must distinguish:
- **state conflict protection**: existing `persistState(expectedRevision)`;
- **semantic attempt provenance**: random/time/provider inputs when they influence the protected result.

A stale snapshot retry can be safe as a fresh attempt only when the protocol explicitly treats it as a fresh attempt and does not claim equivalence with the discarded candidate.

## Exact next
Audit other non-snapshot inputs used by protected paths—policy/config/logic version, environment/provider observations, clock/time, external callbacks and function closures—and classify which are replay-critical, which are merely advisory, and which require explicit binding in the protected claim.

## DO-NOT-REPEAT
No implementation.
No TLC rerun.
No AB104.185 backfill.
No AB105.117R.
No JMM-HB/exactly-once/power-loss claims.
