# Nexo Research Delta — proof context integrity

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS defines each proof obligation as a goal entailed by a context containing declarations, facts and definitions; only the facts/definitions marked usable are sent to backend provers. citeturn0search0turn0search18 TLAPS also generates additional obligations to establish cited facts, so a proof's apparent context is itself part of the checked dependency structure. citeturn0search4 The documentation recommends decomposing failed obligations because a missing hypothesis or incorrect formula is often the real defect. citeturn0search8

## New conclusions
1. Nexo proof evidence must fingerprint not only the target proposition but also its effective proof context: declarations, assumptions, usable facts, definitions, imported modules and relevant axioms.
2. A theorem result cannot remain current merely because its target text is unchanged if a supporting assumption, definition, imported module or usable fact changes.
3. Hidden context must remain distinguishable from usable context. Future evidence should not claim that every known fact was available to the backend.
4. Every cited supporting fact should have its own verification dependency/result, because TLAPS can generate obligations for cited facts as well as the main consequent.
5. Assumptions/axioms need an explicit trust classification. An assumed theorem can support a proof, but it is not evidence that the assumed proposition was independently established by the current proof run.
6. Therefore a future Nexo proof ledger should distinguish `PROVED_FROM_MODEL`, `SUPPORTED_BY_ASSUMPTION`, and `EXTERNALLY_ASSUMED`, with the dependency chain preserved.
7. This creates a direct bridge to Nexo's existing provenance rule: `proof validity` and `truth of assumptions` are separate claims and must not be collapsed.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
