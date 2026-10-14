# STEP 7 — Concrete mutation-boundary source trace — 2026-10-14

Status: SOURCE INSPECTION ONLY. This maps existing mutation entry points; it does not designate them as the owner-approved activation target. STEP 7 remains OPEN / STOP / UNKNOWN.

## Source pins inspected

- `src/nexo/effect-adapter.js` — blob `e2095c52282865699e4de107c75a6792bcf5dac3`
- `src/nexo/runtime.js` — blob `1b4096bd6868fd9086ba6740f07d6a104a258651`
- `src/nexo/simulation-adapter.js` — blob `291ef4d43ca1af2dad29503d8c15f5cdd05aa114`
- `src/simulation.js` — blob `f9ad65003693f4c563659f92da8ef8e52abf2c14`
- Reused P112 evidence: `NEXO_CONTINUITY/P112_EXECUTEACTION_FINAL_GATE_BOUNDARY_AUDIT_V1_2026-10-07.md`, blob `ad49869b57ed7ec70de3dfbf1e40812c4e65081a`.

## Observed paths

### Normal Lúmina simulation
`tick()` → perception/decision → `performDecision()` → `executeAction(simulation, agent, intent)` → post-action learning/events/memory.

The simulation loop also mutates world/day state before decisions and applies learning, beliefs, event/memory updates and need consequences after action execution. Therefore the whole `tick()` function is not a valid inferred transaction scope: protected effect mutation, outcome history and post-effect learning must be distinguished.

### Nexo simulation adapter
`executeLuminaNexoStep()` → `createLuminaEffectAdapter(simulation)` → registered effect handler → `executeAction(simulation, agent, action)` → local postcondition → runtime outcome commit.

The adapter exposes actions including rest, drink, eating, fishing, gathering, shelter/build/craft/farm/harvest, commons contribution/withdrawal and trade. It increments in-memory `nexoEffectRevision`; that value is not the canonical `stateRevision` and is not shown as a durable constitutional fence.

### Runtime outcome recording
`src/nexo/runtime.js` records mission, execution and outcome into Nexo memory under an in-memory WeakMap lock. That is an outcome-recording boundary, not evidence that the effect mutation itself is admitted by a canonical constitutional authority owner or committed via `persistState(expectedRevision)`.

### Generic effect adapter
`src/nexo/effect-adapter.js` supports explicit handler registration, in-memory executed-result tracking, a bounded execution journal, optional `persistPreparedIntent` and reconciliation. A prepared journal record is not proof that an effect did not occur. The existence of these adapter features does not establish that the actual mutation is protected by the constitutional currentness owner.

### Canonical simulation persistence
Existing P112 evidence identifies `scripts/simulate.mjs::persistState(expectedRevision)` as the snapshot persistence owner for cooperating writers. It is not called by the Nexo runtime path identified above as its canonical final commit, and it does not itself confer constitutional authority.

## Boundary conclusion

A concrete mutation primitive is identifiable: `executeAction()`, reached from both the normal simulation and Nexo adapter. But **the repository does not designate this primitive as the owner-approved STEP 7 activation target**, and the current call paths do not demonstrate a semantic final gate immediately before the mutation or a canonical conditional commit that binds authority/currentness to that mutation.

Do not “fix” this by inserting an arbitrary check inside `executeAction()`: that function is shared with ordinary Lúmina simulation, the admission footprint includes dependencies beyond the eventual WriteSet, and protected effect scope is not yet owner-selected. First define which claim/target is being protected and whether simulation-local mutations are in scope; then design the correct narrow boundary with existing persistence semantics rather than wrapping all of `tick()`.

## What this trace establishes / does not establish

Established from source and existing P112 audit:
- shared mutation primitive and call-path convergence;
- local in-memory mutation occurs before later runtime outcome recording;
- `nexoEffectRevision` is distinct from canonical persistence revision;
- no demonstrated constitutional final gate at the mutation boundary;
- no demonstrated Nexo runtime-to-canonical-persistence final commit.

Not established:
- an exploit in a deployed target;
- that all simulation mutations are STEP 7 protected effects;
- the exact owner-approved activation scope;
- any production protected sink or bypass-closed constitutional enforcement.

## Next action

Do not write code. The only useful source-side continuation is to compare the existing MASTER scope and the human-readable Constitution draft against this observed path and determine whether any existing approved record explicitly names `executeAction`/Nexo mission effects as the initial activation claim. If none does, stop and preserve the owner-scope decision as unresolved; do not choose the target by inference.

## Non-actions
No source/tests changed or ran. No keys, signatures, digest, frozen Constitution, ceremony, recovery reference, root, verifier, device, deployment or runtime authority changed. No protected effect authorized.

**STEP 7 remains OPEN / STOP / UNKNOWN.**
