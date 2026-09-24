# Nexo Research Delta — proof status aggregation

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS's Proof Manager translates a proof into a collection of obligations, including subproof obligations, and determines the status of a theorem/step from the outcomes of those obligations. citeturn0search7turn0search2 A proof is semantically correct only when each obligation is correct; checkability requires each obligation to be checkable. citeturn0search9 The system can remember previously proved obligations through fingerprints, so aggregate status must remain tied to the current obligation set rather than a manually persisted theorem flag. citeturn0search12

## New conclusions
1. Aggregate proof status is a derived function over the current proof-obligation graph.
2. The aggregate function must be deterministic and explainable: every non-green aggregate state should identify the blocking obligation(s) and their state.
3. `CHECKED` requires complete coverage of the current required obligation set; omitted, stale, failed, or blocked obligations prevent a current checked aggregate.
4. Historical successful obligations can remain retained as evidence even when the aggregate claim becomes stale after regeneration or context change.
5. The aggregate state should not be a writable authority field; it should be recomputed from obligation records and the current semantic boundary.
6. Proof-obligation generation itself is part of the boundary. A changed generated-obligation set requires recomputation even if source theorem text is unchanged.
7. This creates a clean separation: `PROOF_ARTIFACT_HISTORY` stores what happened; `CURRENT_PROOF_STATUS` is derived from current inputs.
8. This is analogous to Nexo's broader rule that current authority/release state must be derived from current bound state rather than trusted historical flags.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
