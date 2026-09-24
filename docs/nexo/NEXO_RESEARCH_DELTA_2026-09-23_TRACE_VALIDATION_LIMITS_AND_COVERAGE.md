# Nexo Research Delta — trace validation limits and coverage

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLA+ Trace Validation maps recorded implementation states to specification states, but is explicitly non-exhaustive: it validates a selected subset of executions. citeturn0search0 TLC can export counterexamples and action traces in machine-readable formats, enabling preservation and replay workflows. citeturn0search2turn0search5 TLC configuration also separates invariants, temporal properties, constraints, symmetry, and deadlock policy, so the verification scope is configuration-dependent. citeturn0search9

## New conclusions
1. Runtime trace validation needs an explicit coverage ledger; otherwise a validated trace can be mistaken for broad implementation assurance.
2. Coverage should identify operation classes, race classes, failure modes, lease states, authority transitions, STOP states, evidence states and dependency conditions exercised by the traces.
3. Formal counterexamples and runtime traces should carry scenario IDs so coverage can be accumulated without losing provenance.
4. A trace that repeats a previously covered semantic path adds execution evidence but may add little scenario coverage; this distinction should be recorded.
5. Formal-model coverage and runtime-trace coverage are different dimensions and must not be merged into a single score.
6. A future Nexo evidence record should therefore state `model_scope`, `runtime_trace_scope`, `scenario_coverage`, and `uncovered_classes` explicitly.
7. This strengthens the existing rule: `TRACE_VALIDATED_SUBSET != IMPLEMENTATION_VERIFIED`.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
