# Nexo Research Delta — formal checker cross-validation

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLC and Apalache use materially different checking strategies: TLC explores states explicitly, while Apalache encodes bounded executions symbolically for SMT solving. citeturn0search6turn0search22 Apalache documents bounded finite execution assumptions and supports state/action/temporal/trace/inductive invariants, while TLC's configured model scope is defined by its `.cfg` and finite constants. citeturn0search4turn0search1 TLC also warns that symmetry declarations are assumptions supplied by the user and are not independently validated; an unsound symmetry declaration can hide errors. citeturn0search3

## New conclusion
A future Nexo verification pipeline should cross-check **model semantics**, not merely run two tools and count matching results.

Required separation:
1. `SANY/TYPE/SYNTAX` — can the artifact be parsed and semantically processed?
2. `TLC_RESULT` — what did explicit-state exploration establish for the exact finite configuration?
3. `APALACHE_RESULT` — what did bounded/symbolic analysis establish for its exact bounds and assumptions?
4. `TRACE_RESULT` — do selected implementation executions map to the abstract specification?
5. `REFINEMENT_RESULT` — does the implementation-facing model preserve the abstract critical transitions?

Agreement between TLC and Apalache should be recorded as `CORROBORATED_MODEL_EVIDENCE`, not `IMPLEMENTATION_PROOF`.

## Additional safeguard
If symmetry, constraints, or bounds are used, they must be recorded as part of the model boundary. In particular, symmetry is not a harmless optimization when its semantic assumption has not been justified. citeturn0search3

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
