# Nexo Research Delta — coverage boundary and trace evidence

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLC systematically explores the reachable state graph of the configured finite model, while coverage statistics report action execution used to generate new states. These are useful diagnostics but remain scoped to the configured model. citeturn0search1turn0search2turn0search3 TLA+ refinement is semantic: a concrete specification refines an abstract one when its behaviors are allowed by the abstract specification, rather than because names or variables happen to match. citeturn0search15

## New conclusions
1. Coverage must never be interpreted without the exact model boundary. A high action-coverage result can coexist with an incomplete semantic model.
2. We need an explicit `MODEL_BOUNDARY` record in future verification evidence: spec/config hashes, constants, constraints, symmetry assumptions, enabled invariants/properties, and toolchain.
3. Trace evidence must then be attached to semantic scenarios and refinement mappings, not merely to source-code line coverage.
4. A runtime test can be considered formally useful only when its trace is mapped to a defined abstract scenario or is explicitly classified as outside the model.
5. Therefore the evidence hierarchy becomes:
   `MODEL_SCOPE → MODEL_RESULT → SCENARIO_ID → REFINEMENT_MAPPING → RUNTIME_TRACE → VALIDATION_RESULT`.
6. `OUTSIDE_MODEL` must be a first-class result. Otherwise implementation behavior that the formal model forgot to represent could be mistaken for validated behavior.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
