# Nexo Research Delta — formalization self-check boundary

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS documentation emphasizes that the exact specification used in a proof should also be checked with TLC where practical, because even simple formulas can be formalized incorrectly. citeturn0search12turn0search2 TLC/model checking is therefore useful not only for discovering implementation-like behaviors, but also for validating the formalization of assumptions and invariants that deductive proofs rely on. citeturn0search12 TLAPS's current temporal boundary means non-trivial temporal reasoning remains a separate evidence path. citeturn0search0turn0search11

## New conclusions
1. Nexo needs a dedicated `FORMALIZATION_SELF_CHECK` boundary: before treating a deductive proof dependency as high-assurance, check the corresponding formula/model with an independent method where feasible.
2. This is not a proof of the theorem by itself; it is a guard against proving the wrong formalization.
3. A self-check counterexample should invalidate or downgrade the affected proof dependency even if the deductive proof itself still succeeds, because the shared formalization boundary has been challenged.
4. Self-check evidence must record the finite model boundary, constants, constraints, enabled properties, and checker/tool version.
5. A self-check that cannot cover the relevant unbounded behavior must remain scoped as bounded corroboration, not an unbounded proof.
6. The formal evidence graph should therefore distinguish `PROOF_OF_FORMULA` from `CHECK_OF_FORMULA_MODEL`, with an explicit dependency edge between them.
7. This provides a defense against a particularly dangerous failure mode: a perfectly valid proof of an incorrectly encoded safety rule.

## Resulting evidence chain
`CANONICAL CLAIM`
→ `FORMALIZATION`
→ `DEDUCTIVE PROOF`
→ `MODEL SELF-CHECK`
→ `REFINEMENT`
→ `RUNTIME VALIDATION`

Each edge remains independently scoped.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
