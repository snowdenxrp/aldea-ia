# STEP 7 — First-scope ownership boundary reconciliation after M0.58

Date: 2026-10-17  
Branch: `ncs-clean-architecture`  
Status: DESIGN-ONLY RECONCILIATION — NO WIRING — OPEN / STOP / UNKNOWN

## Purpose

Execute the next action already identified by the existing M0.26 runtime-callsite gate: distinguish planning, local simulation mutation, canonical state acceptance, and true external/protected effects before any production composition is selected. This is a reconciliation of prior evidence plus a bounded check that the inspected source pins have not changed; it is not a repeat of the historical broad mutation audit.

## Current source recheck

The following current branch blobs still match the pins cited by the earlier runtime/effect-path source trace:

- `src/nexo/runtime.js`: `1b4096bd6868fd9086ba6740f07d6a104a258651`
- `src/nexo/orchestrator.js`: `973d3d5406c5cab16fb49529d94e07a1557c3111`
- `src/nexo/effect-adapter.js`: `e2095c52282865699e4de107c75a6792bcf5dac3`
- `src/nexo/simulation-adapter.js`: `291ef4d43ca1af2dad29503d8c15f5cdd05aa114`
- `scripts/assistants.mjs`: `ecacf579d401e13f8602e396b87a1b7a89495fa7`
- `scripts/simulate.mjs`: `4dafebec265cc490ee17b388c75c04bb48869ac8`

In the current inspected sources, the production runtime/effect-adapter path does not invoke `executeProtectedTransition()`. The canonical planning/persistence scripts do not invoke that protected transition either. This is a bounded source finding, not proof that no generated, dynamic, or unindexed callsite exists anywhere.

## Ownership classes — kept separate

| Class | What currently exists | What it does not establish | Current disposition |
|---|---|---|---|
| Planning-only | Mission planning/persistence workflow in `scripts/assistants.mjs` and canonical state support in `scripts/simulate.mjs` | Constitutional authority, protected execution, or that a plan is an authorized effect | May remain non-authoritative; no protected-effect implication |
| Local Lúmina/simulation mutation | Runtime and simulation/effect adapters operate on supplied simulation state | Legitimate Constitution Authority Context, canonical-state ownership, or exclusive sink enforcement | Not to be silently promoted into Nexo's protected path |
| Canonical persisted-state acceptance | `persistState` supports state-file/revision handling; STEP 3C adapter wraps it for the tested protected-transition composition | A production caller connecting runtime, legitimate authority, and durable commit/reconciliation | Not wired as a constitutional owner path |
| External/protected effect | Generic effect-adapter contracts and Core transition tests exist | A concrete first target, legitimate initial authority, or exhaustive bypass closure | STOP; no effect class admitted |

## Binding constraints carried forward

1. Direction B remains the chosen security objective: preserve the L2 threat objective until a concrete independent owner-intent/presentation and verifier-provenance path is evidenced.
2. The normative owner decision is not itself a cryptographic proof or an enacted commissioning event.
3. No weaker self-reported L1 record, key ceremony, Constitution freeze/signature, APK, new trust registry, or production wiring is authorized by this reconciliation.
4. A valid-looking `AUTHORIZED`, `PASS`, or provenance field is not proof of legitimate authority.
5. Startup validation alone cannot prove that alternate paths cannot reach the final sink.
6. Do not wire the mission executor into `scripts/assistants.mjs` or `scripts/simulate.mjs` before trust root, constitutional scope, and final effect boundary are established.

## Next decision gate

**No production execution model is selected.** Before wiring, the owner must explicitly define the intended first deployment target and which ownership class is within the first constitutional scope. Existing evidence does not justify inferring that choice. After the target/scope is named, trace only that target's canonical state owner and final effect-capable sink, then prove how independently justified authority controls that sink and how every bypass is excluded.

If the intended first scope is still undefined, remain design-only and STOP rather than create another generic abstraction or speculative adapter.

## Evidence and limits

- Prior runtime callsite gate: [M0.26 source search and owner gate](STEP_7_RUNTIME_CALLSITE_CANONICAL_OWNER_GATE_M0_26_2026-10-16.md)
- Prior authority-to-effect trace: [STEP 7 runtime authority-to-effect path source trace](STEP_7_RUNTIME_AUTHORITY_TO_EFFECT_PATH_SOURCE_TRACE_2026-10-15.md)
- Prior concrete path crosswalk: [STEP 7 concrete execution-path crosswalk](STEP_7_CONCRETE_EXECUTION_PATH_CROSSWALK_2026-10-14.md)
- Current bounded source recheck: the six blob pins listed above.

No source code, test, workflow, state file, Constitution, device, key, signature, ceremony, commissioning, or protected effect was changed or exercised by this design-only reconciliation. No CI or full-repository test is claimed. STEP 7 remains `OPEN / STOP / UNKNOWN`; Constitution remains DRAFT / NOT FROZEN / NOT COMMISSIONED; protected effects remain STOP.
