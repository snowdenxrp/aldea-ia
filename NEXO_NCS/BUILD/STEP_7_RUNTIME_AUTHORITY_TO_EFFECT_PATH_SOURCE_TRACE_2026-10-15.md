# STEP 7 — Runtime authority-to-effect path source trace — 2026-10-15

Branch: `ncs-clean-architecture`  
Status: SOURCE INSPECTION / BOUNDED FINDING — NO IMPLEMENTATION

## 1. Why this trace was run

The previous bootstrap analysis was correctly gated on the initial trust premise. In parallel, the existing STEP 7 obligation to prove that recognized authority actually controls protected effects can be advanced through source inspection without selecting Direction A/B, changing code, repeating device research, or reopening P112's already completed broad mutation inventory.

This trace asks one narrow question: **does the currently reachable Nexo runtime path invoke the STEP 3 protected-transition composition before calling an effect adapter?**

## 2. Files and exact current branch evidence

Fetched directly from `ncs-clean-architecture`:

- `src/nexo/runtime.js`, blob `1b4096bd6868fd9086ba6740f07d6a104a258651`.
- `src/nexo/orchestrator.js`, blob `973d3d5406c5cab16fb49529d94e07a1557c3111`.
- `src/nexo/effect-adapter.js`, blob `e2095c52282865699e4de107c75a6792bcf5dac3`.
- `src/nexo/core/protected-transition.mjs`, blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`.
- `src/nexo/core/ownership.mjs`, blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`.
- `src/nexo/adapters/conditional-commit-persist-state.mjs`, blob `9a707677c99d226f87f9b8b0d9e7673e7a1a100e`.
- `src/nexo/core/policy-context-resolver.mjs`, blob `024b385d928b6b95edee1a54de867f7193917c91`.

This is a source inspection of these concrete files, not a claim that every repository callsite or deployed artifact has been exhaustively enumerated.

## 3. Observed runtime path

The inspected call path is:

`executeLuminaNexoStep()`
→ constructs `createLuminaEffectAdapter(...)`
→ calls `executeNexoStep(...)`
→ `beginNexoStep(...)`
→ `adapter.execute(...)`
→ `createEffectAdapter.executeFresh(...)`
→ precondition callback and state-version comparison
→ registered effect handler
→ postcondition callback
→ `commitRuntimeOutcome(...)` records mission/execution/outcome memory.

Within the inspected `runtime.js`, the protected transition module is not imported or invoked. The function reaches the adapter directly. `orchestrator.js` plans and advances mission steps but does not itself establish constitutional authority. `effect-adapter.js` checks an optional caller-provided precondition and state version, invokes a registered handler, and checks a postcondition after the handler; those are not equivalent to a current Constitution Authority Context or a pre-effect constitutional final gate.

## 4. Protected-transition composition exists, but is not the path above

The separately inspected `executeProtectedTransition()` sequence is:

`claimBuilder.build`
→ `authorityGate.check`
→ isolation
→ candidate execution
→ final semantic validation
→ `conditionalCommit.commit(candidate)`
→ outcome classification.

The inspected function does not call `ports.effectBoundary.prepare`. The `createCorePorts()` factory provides an `effectBoundary.prepare` port whose default throws `NOT_IMPLEMENTED`, but the transition does not invoke it. After semantic PASS it calls conditional commit directly.

The `conditional-commit-persist-state.mjs` adapter persists a candidate snapshot with `expectedRevision`; it is a state commit adapter, not an effect adapter and not a Genesis/authority source. Its own comments and behavior do not claim constitutional enforcement or external-effect atomicity.

The inspected `resolvePolicyContext()` checks caller-supplied identity, applicability, dependencies, temporal and provenance statuses and combines PASS/FAIL/UNKNOWN. This is a semantic resolver; its input status fields are not themselves proof that the policy/Genesis trust basis is legitimately established.

## 5. Bounded conclusion

**Confirmed for the inspected runtime path:** the concrete Nexo-to-Lúmina simulation path does not pass through `executeProtectedTransition()` before the effect adapter. Therefore the existence and passing tests of the protected-transition module do not prove that this runtime path is protected by it.

**Also confirmed:** the current protected-transition composition itself does not invoke `effectBoundary.prepare`; no effect-boundary enforcement is established by that port in this composition.

This is a real wiring/ownership gap, not merely missing documentation. It does not authorize a patch. Before any implementation, the architecture must determine whether this simulation path is in scope for a protected effect, what the actual protected effect class is, and which common mutation boundary can enforce the contract without misclassifying ordinary Lúmina simulation as constitutional Nexo authority.

## 6. What this does not claim

- It does not claim every action in the project is a protected constitutional effect; ordinary simulation actions may be outside that scope.
- It does not repeat or supersede P112's already documented direct mutation bypass inventory.
- It does not prove the absence of every other callsite in the repository; this is a bounded trace through the inspected runtime entry path.
- It does not prove any deployed APK/runtime corresponds to these repository files.
- It does not prove the Genesis trust path, owner-intent evidence, authority currentness, final sink protection, or bypass closure.
- It does not authorize code changes, a new generic wrapper, an effectBoundary patch, new transaction machinery, a key, ceremony, device operation, or commissioning.

## 7. Next precise step

Do not add a gate to `executeAction()` or to the effect adapter by guesswork. First establish the scope boundary:

1. Which exact effect class, if any, from this runtime is designated constitutional/protected rather than ordinary simulation?
2. What is the last effect-capable sink for that class, and which other entry paths can reach it?
3. Does the existing Core protected-transition contract own that sink, or does the architecture require a deliberate root-level redesign because the present simulation runtime and constitutional authority model are different domains?

If this is ordinary Lúmina simulation, it must not be used as evidence of Nexo constitutional authority. If it is a protected Nexo effect, the current direct adapter path is insufficient and must remain STOP until a single defensible enforcement owner and bypass closure are designed and evidenced.

## Status

STEP 7 remains **OPEN / STOP / UNKNOWN**. This source trace advances the implementation-path evidence but does not resolve Genesis bootstrap or authorize implementation.
