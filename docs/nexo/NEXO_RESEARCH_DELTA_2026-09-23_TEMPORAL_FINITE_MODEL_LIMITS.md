# Nexo Research Delta — temporal checking and finite-model limits

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Findings
Official TLA+ material distinguishes exhaustive model checking from simulation. Simulation samples behaviors and can be reproduced with the same seed/aril, but it is not exhaustive. TLC can check liveness, yet finite-state constraints can create a subtle boundary: an artificial finite model may admit only stuttering behaviors that do not faithfully represent the infinite behaviors relevant to a liveness property. Lamport's documentation explicitly warns that temporal checking requires verifying that the model permits the infinite behaviors needed by the liveness condition. 

Symmetry is another scoped transformation. TLC uses symmetry in model-checking mode, while simulation ignores it. If the specification/properties are not symmetric with respect to the declared symmetry set, TLC may even have difficulty recovering an error trace. Therefore symmetry configuration must remain part of evidence provenance.

## Nexo conclusions
1. `LIVENESS_CHECKED` must carry an explicit finite-model validity rationale, not only a PASS result.
2. The model must document which infinite behaviors are represented by its finite abstraction and which are intentionally excluded.
3. A state constraint used to make a model finite can change the temporal evidence boundary; it must therefore be fingerprinted and reviewed as a semantic assumption.
4. Fairness assumptions and finiteness constraints are separate assumptions and must not be conflated.
5. A temporal PASS with an invalid or overly restrictive model is not evidence of the intended liveness property.
6. Symmetry configuration belongs in the temporal evidence fingerprint, including whether the checked property is symmetry-preserving and whether the result can reconstruct counterexamples.
7. Counterexample recovery itself is evidence quality: inability to reconstruct a reported temporal failure should be recorded rather than silently treated as a clean result.

## Evidence boundary
`TEMPORAL_CLAIM`
→ `FINITE_MODEL`
→ `MODEL_VALIDITY_ARGUMENT`
→ `FAIRNESS/ENVIRONMENT_ASSUMPTIONS`
→ `TLC_TEMPORAL_CHECK`
→ `REPRODUCIBLE_TRACE`

The chain supports a scoped temporal claim only. It does not establish implementation correctness without a separate refinement/implementation correspondence argument.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
