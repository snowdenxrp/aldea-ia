# GLOBAL-AUDIT-037T — RECONCILIATION STABILIZATION, TERMINATION AND NON-CONVERGENCE — 2026-09-28

## Scope
Final 037 attack: whether reconciliation can soundly declare stabilization/termination, and whether bounded protocols can detect non-convergence.

## 1. Termination is not convergence
A reconciliation loop may terminate because of timeout, retry budget, worker shutdown or operator intervention while claim-relevant histories remain unresolved. Therefore:
`TERMINATED != RESOLVED`.

A protocol may declare only:
- RESOLVED_TRUE_EFFECT_STATE;
- RESOLVED_REJECTED_EFFECT_STATE;
- UNRESOLVED_UNKNOWN;
- QUARANTINED_NON_CONVERGENT/INSUFFICIENT_OBSERVATION.

The last two are safe terminal outcomes when the evidence contract cannot establish resolution.

## 2. Bounded detection
Within a declared finite observation model, non-convergence can be detected if the protocol observes a repeated semantic state plus unchanged authoritative evidence generation, or reaches an explicit provider/reconciliation limit whose semantics state that no stronger observation is available.

A retry count alone is not proof of non-convergence in the external world.

## 3. Stabilization criterion
Candidate stabilization requires:
1. same exact EffectID and resource incarnation;
2. observation provenance complete for the claim;
3. authoritative provider ordering/revision or equivalent semantics;
4. no unresolved contradictory observations;
5. no pending higher-generation observation capable of changing the claim;
6. authority/recovery state evaluated separately from effect resolution;
7. reconciliation result reproducible from the same authoritative evidence set.

If any condition is missing, the safe result is UNKNOWN/QUARANTINE.

## 4. Late evidence
Evidence arriving after a local stabilization decision must be classified by its authoritative generation/order. If it supersedes the prior evidence, the prior resolution may need invalidation. Therefore stabilization is conditional on the provider's declared finality semantics, not merely local silence.

## 5. FLP-style caution
No general distributed termination guarantee should be inferred from bounded local retries in an asynchronous system with failures. The audit does not claim an FLP theorem for Nexo; it records the engineering consequence: absence of a response is not evidence of a final external state.

## 6. Safe bounded protocol
A bounded reconciliation protocol can safely stop attempting resolution and enter `QUARANTINED_UNKNOWN` when its declared evidence budget, provider contract and failure assumptions no longer permit stronger inference. This is a safe protocol termination, not proof that the external world has stabilized.

## 7. 037 closure criterion
GLOBAL-AUDIT-037 can be semantically closed only for the following bounded statement:
"Within a declared provider observation contract and failure model, reconciliation may distinguish RESOLVED from UNRESOLVED only when authoritative evidence excludes claim-relevant alternatives; otherwise it terminates in UNKNOWN/QUARANTINE rather than inventing convergence."

Universal convergence remains UNKNOWN.

## Status
037 semantic attack sequence is complete. 037 is CLOSED AS A RESEARCH RESULT ONLY, with universal convergence, provider-independent finality and formal verification still UNKNOWN.

No TLC/TLAPS execution, theorem proof, or runtime fault injection was performed.

Next: GLOBAL-AUDIT-038 — contradictory reconciliation evidence, stale provider responses and observation ordering.
