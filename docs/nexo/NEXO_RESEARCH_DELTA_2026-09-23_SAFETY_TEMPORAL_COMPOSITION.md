# Nexo Research Delta — safety/temporal composition boundary

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
Current TLAPS documentation says TLAPS does not perform general temporal reasoning and is suitable for safety properties of non-trivial algorithms. citeturn0search0turn0search1 TLA+ documentation distinguishes safety/invariance reasoning from liveness/fairness properties; liveness properties concern complete behaviors and are checked with temporal properties and fairness assumptions. citeturn0search19turn0search9 TLA+ guidance also emphasizes checking the exact specifications used in proofs with TLC, since model checking can catch formalization errors in assumptions and invariants. citeturn0search18

## New conclusions
1. Nexo's formal evidence should explicitly separate three composition boundaries: deductive safety, temporal/liveness behavior, and implementation refinement.
2. A safety proof may be a prerequisite for a liveness argument, but it does not establish liveness by itself.
3. A temporal model may rely on safety lemmas as assumptions; those lemmas need explicit references to their proof/evidence status.
4. The exact same TLA+ specification should be cross-checked with TLC where practical, especially for formulas assumed in deductive proofs, because a formalized assumption can itself be encoded incorrectly. This is corroboration, not a replacement for deductive proof.
5. If TLC finds a counterexample to a formula assumed by a proof, the affected proof dependency becomes suspect/stale and must be re-evaluated; the proof result should not silently remain current.
6. If TLAPS establishes a safety lemma but TLC has not checked the corresponding finite model, the status should say so explicitly rather than implying full formal verification.
7. If a liveness property requires fairness, the fairness assumption belongs to the temporal evidence boundary and must not be promoted into a safety or authority assumption.

## Proposed evidence relation
`SAFETY_LEMMA`
→ may support → `TEMPORAL_MODEL_ASSUMPTION`
→ checked by → `TLC_LIVENESS_RUN`
→ under explicit → `FAIRNESS/ENVIRONMENT_ASSUMPTIONS`

None of these alone establishes implementation correctness; that remains a refinement/runtime boundary.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
