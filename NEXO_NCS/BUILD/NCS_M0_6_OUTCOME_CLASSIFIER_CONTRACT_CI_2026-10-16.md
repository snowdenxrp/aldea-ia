# NCS M0.6 — Outcome classifier contract in CI
Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: EXISTING TEST INCLUDED / CI PASS CONFIRMED / NO RUNTIME CLAIM

## Scope
Expanded the existing narrow Core-contract workflow to run the already-existing `tests/nexo/outcome-classifier.test.mjs` alongside the observation contract tests. No production source code changed in this slice.

## Why this is useful
The existing test checks that the classifier:
- accepts each declared terminal outcome;
- preserves supplied reasons and evidence;
- returns immutable result arrays;
- defaults the explicit `UNKNOWN` and `RECONCILE_REQUIRED` kinds as covered by tests;
- rejects an unsupported outcome string;
- exposes neither `commit` nor `reconcile` methods.

This is a schema/classification contract only. It does not make an outcome true, authenticate its evidence, authorize an effect, or prove reconciliation safety.

## CI evidence
Latest confirmed run after the workflow's final path-filter adjustment:
- Run ID: `38978179524`
- URL: https://github.com/snowdenxrp/aldea-ia/actions/runs/38978179524
- Tested commit: `f12454ed7f537aff90a0bbd62c53ca955eef34de`
- Workflow: `Nexo — STEP 7 observation contract`
- Job `observation-contract`: `success`
- `node tests/nexo/observation.test.mjs`: `success`
- `node tests/nexo/observation-equivalence.test.mjs`: `success`
- `node tests/nexo/outcome-classifier.test.mjs`: `success`

Workflow file:
https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-step-7-observation-contract.yml

## Limits and next gate
- This is not the full `npm test` suite.
- The three isolated commands do not prove the entire planner/runtime call graph, protected sink enforcement, or bypass closure.
- The outcome classifier is not an authority gate. A caller-provided outcome or `AUTHORIZED` assertion remains insufficient evidence of constitutional legitimacy.
- No runtime, orchestrator, adapter, persistence, claim identity, or protected-effect path was changed.
- STEP 7 remains OPEN / STOP / UNKNOWN; Direction B / L2 remains the objective.

Next engineering action: select any further Core slice only after checking its existing contract/tests and keeping the same evidence boundary. Do not integrate this classifier into the runtime as an authority shortcut.
