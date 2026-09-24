# Nexo Research Delta — TLAPS temporal boundary

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
The current TLAPS documentation states that the current release does not perform general temporal reasoning and is primarily suitable for safety properties of non-trivial algorithms; temporal reasoning support is limited/under development. citeturn0search8 The proof-system tutorial distinguishes ordinary logical proof obligations from temporal operators and shows that the backend proof layer works on generated obligations whose usable facts/definitions must be supplied explicitly. citeturn0search1turn0search3

## New conclusions
1. Nexo must not treat a successful TLAPS proof of a safety lemma as evidence of a liveness property.
2. Temporal/liveness claims such as eventual takeover, eventual recovery, eventual reconciliation, or eventual termination need a distinct verification boundary (for example TLC temporal properties or another explicitly capable formal method).
3. The proof ledger must record `PROPERTY_KIND = SAFETY | LIVENESS | REFINEMENT | OTHER` and the checker/method used.
4. A proof chain may combine methods: TLAPS can establish logical safety lemmas while TLC or another method checks temporal behavior under explicit fairness/environment assumptions.
5. The absence of temporal capability in a checker is `METHOD_NOT_APPLICABLE`, not `PROPERTY_FALSE`.
6. Conversely, a temporal model result cannot be substituted for a deductive proof of a separate invariant unless the correspondence between them is explicitly established.
7. This preserves the research conclusion already reached for fairness: fairness belongs to liveness/environment assumptions and must not be used to manufacture safety authority.

## Consequence for Nexo
The future formal evidence boundary should remain layered:

`SAFETY_DEDUCTIVE_EVIDENCE`
`TEMPORAL_MODEL_EVIDENCE`
`REFINEMENT_EVIDENCE`
`RUNTIME_TRACE_EVIDENCE`

Agreement among layers is corroboration, not automatic implementation proof.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
