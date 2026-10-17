# STEP 7 — Runtime Mutation Timing and Effect-Class Map — M0.25 — 2026-10-16

Status: SOURCE-TRACE CONFIRMED FOR THE INSPECTED FILES — NO PROTECTED-AUTHORITY PATH DEMONSTRATED

## Scope and evidence
Inspected current branch `ncs-clean-architecture` source:
- `src/nexo/runtime.js`
- `src/nexo/effect-adapter.js`
- `src/nexo/simulation-adapter.js`
- `src/nexo/orchestrator.js`
- `src/nexo/core/protected-transition.mjs`
- `src/nexo/core/ownership.mjs`
- existing P112 runtime protected-transition owner gap audit.

This is a bounded source trace of those files, not an exhaustive search of every production entrypoint or a runtime test. No tests or CI were run.

## Observed control sequence

The inspected `executeLuminaNexoStep()` builds an effect adapter around the supplied live `simulation` object, then delegates to `executeNexoStep()`. The latter calls `beginNexoStep()` and then `adapter.execute()`.

Inside `createEffectAdapter()`, the path is:
1. record an in-memory `prepared` journal entry;
2. optionally call caller-supplied `persistPreparedIntent`;
3. evaluate the precondition and check the state version;
4. call the registered handler;
5. evaluate the postcondition after handler mutation;
6. record a terminal result in the in-memory journal;
7. return to runtime, which commits mission/outcome records to its supplied memory object.

The optional persistence callback is supplied by the caller; the adapter itself does not prove that it is durable, authoritative, or bound to the canonical state owner. The simulation handlers mutate the passed simulation object before the postcondition. The inspected runtime path does not call `executeProtectedTransition()` or canonical `persistState(expectedRevision)`.

The adapter's postcondition is useful result validation, but occurs after the handler's mutation. It cannot retroactively make that mutation a candidate-only change or prove that a later canonical commit accepted it.

## Current mutation classes

| Registered action class | Observed mutation | Current evidence boundary | Step 7 classification |
|---|---|---|---|
| `repair_agent_state` | Normalizes agent position/alive fields in supplied simulation | Postcondition checks resulting fields | Local simulation mutation; E0 candidate only |
| `repair_agent_needs` | Normalizes six need values in supplied simulation | Postcondition checks numeric ranges | Local simulation mutation; E0 candidate only |
| `repair_resource_state` | Normalizes resource amount in supplied simulation | Postcondition checks resulting resource state | Local simulation mutation; E0 candidate only |
| `execute_lumina_action` (rest/drink/eat/gather/build/craft/farm/trade/commons actions) | Calls `executeAction(simulation, agent, action)` on supplied simulation | Action-specific postcondition checks some resulting state/effect markers | Local Lúmina simulation mutation; E0 candidate only; some actions are marked non-reversible by mission metadata but that does not make them external-world effects |
| mission/outcome recording | Mutates supplied runtime memory with plan/execution/outcome records | In-process locking for commits to the same memory object | Local record mutation; not proof of canonical persistence or authority |
| `persistPreparedIntent` callback | Unknown from this call site | Caller-defined; no owner/durability proof here | UNKNOWN until concrete implementation is identified |

This classification is deliberately narrow. “E0 candidate” means only that the inspected handlers mutate the supplied Lúmina simulation. It does not prove isolation from canonical/live state, safe persistence, or absence of other effect paths elsewhere in the repository.

## Architectural finding

The immediate missing link is not another validator. It is the ownership and timing boundary between candidate-state mutation and canonical acceptance:
- If the supplied simulation is a detached candidate, the handler's mutation may be candidate preparation, subject to proof of detachment and complete mediation.
- If the supplied simulation aliases canonical/live state, the same handler mutates live state before any canonical revision check; a later conflict cannot undo it.
- The current API does not itself establish which case applies.
- The inspected runtime path also does not connect to the separate protected-transition Core flow, whose default `effectBoundary.prepare` port is `NOT_IMPLEMENTED` and which itself commits via its injected conditional-commit port.

Therefore the current evidence cannot support the claim that the protected-transition contracts govern these runtime mutations.

## Do not misclassify

- Do not treat local simulation actions as evidence of an external protected effect.
- Do not treat a “non-reversible” mission metadata flag as proof of an irreversible external-world effect.
- Do not treat postcondition success as proof of authorized commit.
- Do not treat an in-memory `prepared` journal entry as durable PREPARED.
- Do not add a wrapper or invoke the Core transition blindly before identifying canonical state owner and actual deployment entrypoint.

## Next exact action

Identify the actual state owner/canonical persistence caller for the deployment target and determine whether the simulation passed to `executeLuminaNexoStep()` is always detached or can alias canonical/live state. Then trace all calls to this runtime entrypoint and classify any real external sinks separately. Only after that evidence exists can the minimum final enforcement boundary be specified. No owner approval or device test is needed for this source-trace step.

## Change boundary
No code, tests, CI, Constitution, device, key, signature, owner review, commissioning, or protected effect changed or exercised. Step 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
