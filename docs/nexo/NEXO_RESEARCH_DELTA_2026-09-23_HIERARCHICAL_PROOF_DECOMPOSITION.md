# Nexo Research Delta — hierarchical proof decomposition

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS mechanically decomposes hierarchical TLA+ proofs into proof obligations and sends them to backend provers. The official tutorial shows the standard invariant structure: initial-state obligation, next-state preservation obligation, then implication from the invariant to the desired safety property. citeturn0search0turn0search3 The TLA+ proof literature notes that sufficiently complicated algorithms may require hierarchical decomposition because a single SMT obligation can become too large. citeturn0search14

## New conclusions
1. Nexo's proof-obligation graph should mirror the transition structure rather than becoming one giant formula.
2. Each critical transition family should have local lemmas/obligations, with explicit composition into higher-level properties.
3. Useful decomposition candidates are: lease validity, stale-owner rejection, authority-epoch fencing, STOP dominance, exact effect binding, evidence freshness/version validity, recovery/reconciliation exclusion, release authorization consumption, and commit/revoke ordering.
4. A higher-level proof should cite lower-level obligations explicitly; passing a leaf obligation alone must not be interpreted as proving the parent property.
5. Failed obligations should expose the smallest failing proof boundary possible. This supports diagnosis instead of repeated broad rewrites.
6. This decomposition also aligns with implementation refinement: each concrete transition can be mapped to a small set of abstract obligations rather than to an opaque monolithic theorem.
7. The future formal evidence ledger should therefore support a DAG of obligations with parent/child relationships, model boundary, assumptions, checker, result, and counterexample references.

## Important boundary
TLAPS being able to mechanically check a proof does not itself establish that the specification models the intended real-world system. The semantic/model boundary remains a separate engineering obligation.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
