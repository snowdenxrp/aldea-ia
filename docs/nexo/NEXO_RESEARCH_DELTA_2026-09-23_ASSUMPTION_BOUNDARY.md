# Nexo Research Delta — assumption boundary

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS treats a proof obligation as a goal entailed by its usable context, and explicitly permits assumptions/axioms to support proofs. Its documentation also states that the proof system checks the proof hierarchy and the obligations generated from cited facts. citeturn0search0turn0search1 TLA+ module validity likewise treats module assumptions as hypotheses of the theorem rather than independently established facts. citeturn0search11 TLAPS's design emphasizes prover-independent TLA+ proof structure, with backend verification as a separate layer. citeturn0search21turn0search2

## New conclusions
1. Nexo needs an explicit `ASSUMPTION_BOUNDARY` for every high-assurance proof claim.
2. Every assumption supporting a proof should be classified at minimum as `MODEL_ASSUMPTION`, `ENVIRONMENT_ASSUMPTION`, `TRUSTED_AXIOM`, or `EMPIRICALLY_SUPPORTED_PRECONDITION`.
3. An assumption is a dependency of the proof, not a result produced by the proof. Its truth/adequacy must have a separate evidence chain when the architecture relies on it.
4. A proof result should therefore carry both `proved_claim` and `assumption_set_fingerprint`.
5. Changing, adding, removing, or reclassifying an assumption must invalidate the current proof result unless compatibility is explicitly established.
6. Assumptions about implementation behavior are especially dangerous: they must not silently turn an unverified implementation property into a formal theorem. They require an implementation/refinement evidence boundary.
7. The future proof ledger should expose the smallest assumption dependency responsible for a claim, allowing a claim to be downgraded or invalidated without discarding unrelated historical proof results.
8. This preserves the central Nexo rule: `PROOF VALIDITY != TRUTH OF ASSUMPTIONS != IMPLEMENTATION CORRECTNESS`.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
