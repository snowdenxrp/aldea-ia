# Nexo Research Delta — proof cache reproducibility

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS fingerprints proof obligations and reuses prior results when the obligation remains semantically unchanged. Its documentation also warns that displayed proof status can become obsolete after edits and should be recomputed. citeturn0search15turn0search2 The proof system treats each obligation as a goal entailed by a relevant context of facts and definitions. citeturn0search0 The documented implementation also allows complete reproving when cache/fingerprinting trust is not desired. citeturn0search15

## New conclusions
1. Nexo's verification cache must be treated as an optimization layer, never as the source of truth for current verification status.
2. A cached result is reusable only when the canonical obligation fingerprint and all verification-boundary inputs remain compatible.
3. A verification run should support two modes: `INCREMENTAL_REUSE` and `CLEAN_REPROVE`.
4. A clean reproving run is especially important before high-confidence release claims, after toolchain changes, after suspected cache corruption, and when an obligation's semantic dependency set is uncertain.
5. Current status should be recomputed from artifacts; a stored green/verified marker is not authoritative if the source proof or context changed.
6. This extends the Nexo evidence rule: `CACHED_RESULT != CURRENT_RESULT` unless compatibility has been independently established.
7. Proof context itself matters. If a result depends on assumptions or definitions that changed, the proof result must become stale even if the target formula text is unchanged.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
