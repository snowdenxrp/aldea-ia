# Nexo Research Delta — proof context projection and imported assumptions

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS distinguishes known facts from the smaller set of facts and definitions made usable for a particular obligation; only the usable context is sent to backends. citeturn0search0turn0search4 Imported theorems can carry their own hypotheses, and an importing module must discharge those hypotheses explicitly. The documentation also notes that imported operators may have distinct internal identities, requiring an explicit bridge theorem even when they are extensionally the same. citeturn0search13

## New conclusions
1. Nexo's proof ledger must preserve the **effective proof context**, not merely the global set of known facts.
2. For every obligation, distinguish `KNOWN_CONTEXT` from `USABLE_CONTEXT`; changing the usable projection can change backend behavior and proof validity without changing the global model text.
3. Imported theorems are not context-free facts. Their hypothesis set must travel with the theorem and be discharged explicitly.
4. Symbol/operator identity matters. Semantically equivalent-looking definitions from different module instances cannot be silently treated as identical dependencies.
5. Therefore context fingerprints should include canonical symbol identity/module origin and the exact usable projection used for the obligation.
6. A future refinement/proof ledger should record context-projection changes as semantic changes even when the underlying source modules are unchanged.
7. This strengthens the existing evidence rule: provenance is not just file origin; it includes the exact logical projection and identity through which evidence entered the proof.

## Consequence for Nexo
`GLOBAL_MODEL != EFFECTIVE_PROOF_CONTEXT`

and:
`IMPORTED_THEOREM != CONTEXT_FREE_FACT`

and:
`SAME_TEXT != SAME_SYMBOL_IDENTITY`

These distinctions should be preserved before any formal proof automation is implemented.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
