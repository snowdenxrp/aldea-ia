# Nexo Research Delta — proof-obligation multiplicity

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS explicitly notes that one proof step can generate multiple proof obligations: one for the step's consequent and additional obligations for facts cited in its `BY` clause. citeturn0search9 A proof is semantically correct only when each generated obligation is correct, and a step is checkable only when its obligations are checkable. citeturn0search3 Fingerprints are stored per obligation, not merely per source-level theorem/step. citeturn0search12

## New conclusions
1. Nexo must model `THEOREM/STEP` and `PROOF_OBLIGATION` as different objects.
2. One source-level claim can have N generated obligations; a claim is current/checked only when every required obligation for that run is accounted for.
3. A cached result must therefore be keyed at obligation granularity, while the aggregate claim status is derived from the obligation dependency set.
4. A failed or stale auxiliary obligation can invalidate the aggregate claim even when the main consequent obligation remains unchanged.
5. Conversely, an auxiliary obligation unrelated to a particular claim must not contaminate that claim's status; dependency edges must be explicit.
6. This naturally yields a proof DAG rather than a flat theorem list: source claim → generated obligations → supporting facts/assumptions → sub-obligations.
7. Verification records should preserve `generated_obligation_set` and the generation method/version, because changes in obligation generation can change the proof boundary even when source-level theorem text is unchanged.
8. This reinforces the Nexo principle: `SOURCE_CLAIM != PROOF_BOUNDARY`.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
