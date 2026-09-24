# Nexo Research Delta — proof recheck and backend stability

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS documentation states that proof status can become obsolete after edits and should be recomputed. It also computes fingerprints of proof obligations to reuse prior results. citeturn0search0turn0search1 TLAPS documentation further distinguishes semantic correctness of an obligation from whether a particular current backend can check it, and advises keeping proofs independent of backend-specific details for maintainability. citeturn0search4 The TLAPS paper describes backend proof certification through Isabelle/TLA+ for some proof traces, showing that backend acceptance and independently checkable proof artifacts can be distinct evidence layers. citeturn0search20

## New conclusions
1. Nexo should distinguish `PROOF_LOGICALLY_SPECIFIED`, `BACKEND_ACCEPTED`, and `PROOF_ARTIFACT_CERTIFIED` rather than collapsing them into one status.
2. A result that succeeds only because a cached fingerprint was reused should still expose the original verification run and obligation fingerprint; a clean recheck should be separately identifiable.
3. Backend/tool changes can alter checkability without changing the mathematical obligation. Therefore `BACKEND_UNAVAILABLE` or `BACKEND_FAILED` must not automatically mean the proposition is false; they mean current verification evidence is insufficient.
4. Conversely, a backend accepting an obligation does not justify changing the obligation's semantics to fit that backend. The proof should remain tied to the canonical obligation/context.
5. Where a machine-checkable certificate exists, the evidence package should preserve the certificate/reference and the checker identity separately from the generating backend.
6. For high-assurance Nexo claims, a clean recheck after material toolchain/context changes should be a distinct lifecycle event, not an implicit overwrite of historical evidence.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
