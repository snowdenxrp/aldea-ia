# Nexo Research Delta — proof-obligation fingerprints and cache integrity

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS generates proof obligations from proof steps and computes fingerprints for obligations so previously established results can be reused rather than reproved unnecessarily. citeturn0search8 The documentation also describes hierarchical proof contexts and keeping usable facts scoped to the current obligation. citeturn0search0

## New conclusions
1. Nexo's future proof ledger should identify proof obligations by content, not only by human-readable names.
2. A proof-obligation identity should include a canonicalized statement plus the relevant definitions/context and model/spec version. A renamed obligation with identical semantics may be the same logical obligation; a same-named obligation with changed semantics is not.
3. Cached proof results must therefore be invalidated when the obligation's semantic inputs change: specification, definitions, assumptions, cited facts/context, model boundary, or checker-relevant configuration.
4. Historical proof results remain valuable, but they must be marked as belonging to their prior semantic version rather than silently reused as current evidence.
5. This gives Nexo another explicit anti-staleness rule: `PROOF_RESULT_STALE != PROOF_RESULT_FALSE`. Stale means it no longer establishes the current obligation until rechecked.
6. The evidence ledger should preserve both `obligation_fingerprint` and `verification_run_id`, allowing exact reconstruction of what was actually checked.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
