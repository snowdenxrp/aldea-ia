# Nexo Research Delta — proof status semantics

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS defines a proof as semantically correct when each proof obligation follows from its usable facts, while practical checkability depends on whether a current backend can verify the obligations. citeturn0search7 Its proof manager recursively determines theorem/step status from the status of generated obligations and backend results. citeturn0search9turn0search6 The official documentation also warns that displayed proof status may become obsolete after edits. citeturn0search5

## New conclusions
1. Nexo should distinguish the logical state of an obligation from its current tool status.
2. Suggested lifecycle vocabulary:
   - `UNSPECIFIED`: obligation not yet defined.
   - `DEFINED`: canonical statement/context exists.
   - `CHECK_PENDING`: current evidence absent or stale.
   - `CHECKED`: current backend successfully checked all required obligations for the recorded run.
   - `FAILED`: a current obligation was not established and has a counterexample/error where applicable.
   - `BLOCKED`: verification could not be completed because a required tool/input/context is unavailable.
   - `STALE`: a previously checked result no longer matches the current semantic inputs.
3. `FAILED` and `BLOCKED` must never be collapsed. A failed proof is evidence against the current proof attempt; a blocked proof is absence of current verification evidence.
4. `CHECKED` must be scoped to the exact obligation fingerprint, context, model boundary, checker/toolchain and verification run.
5. Historical `CHECKED` evidence may remain valid historically while the current obligation is `STALE`.
6. Aggregate verification status should be derived from obligation states, not from a manually maintained green flag.
7. This prevents a subtle failure mode where infrastructure/tool failure is interpreted as mathematical failure, or where an old green result is interpreted as current proof.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
