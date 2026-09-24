# NEXO — External Effect Graph Convergence, Duplicate Effects, Incarnation and Reconciliation V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Central finding
REPRESENTATION_CONVERGENCE != EFFECT_CONVERGENCE.
Two branches can converge to one logical object while their external histories remain different, concurrent, duplicated, partially committed, or UNKNOWN.

## Core findings
1. Same target does not mean same effect. Two branches can target R while producing distinct effect identities.
2. Retry does not imply idempotency. Local deduplication is not proof of provider-side exactly-once behavior.
3. Preserve effect_id, attempt_id, retry lineage and compensation lineage.
4. Local convergence does not prove external-history convergence.
5. Provider idempotency is a provider contract, not a universal property.
6. Resource replacement breaks unproven effect continuity even when provider/resource ID is unchanged.
7. Late callbacks are historical evidence and cannot resurrect authority or erase newer state.
8. Compensation is a new protected external effect, not historical erasure.
9. No local record does not prove no external effect.
10. Effect equivalence is bounded by provider contract, resource incarnation, retries, callbacks, ordering and reconciliation semantics.
11. Local fences cannot claim global effect prevention beyond the last effect-capable enforcement boundary.
12. If effect convergence cannot be established, publish only a weaker safety/containment claim or quarantine.

## New object
ExternalEffectGraphContext with effect/attempt identity, provider execution ID, resource incarnation, branch/causal context, authority/policy/invariant context, fence/enforcement context, observation, reconciliation generation, conflict state and currentness.

## Candidate effect convergence classes
E0 EXACT_SAME_EFFECT — same effect identity and provider semantics proven.
E1 DUPLICATE_ATTEMPTS — same logical effect with multiple attempts, provider idempotency contract proves one commit.
E2 DISTINCT_EFFECTS — different external effects.
E3 CONFLICTING_EFFECTS — effects cannot safely coexist.
E4 UNKNOWN_RELATION — insufficient evidence.
E5 HISTORICAL_ONLY — relation known historically but not current.
E6 QUARANTINED — conflict or uncertainty blocks further protected effect.

## Effect graph merge candidate
1. identify effect identities; 2. identify attempt identities; 3. identify provider execution IDs; 4. identify resource incarnations; 5. establish causal relations; 6. close retry/redrive and callback paths; 7. include compensations; 8. collect external observations; 9. reconcile; 10. classify conflicts/UNKNOWN; 11. compute common-mode dependencies; 12. publish only within verified scope.

## Candidate invariants
XEC-01 SAME_TARGET_DOES_NOT_IMPLY_SAME_EFFECT
XEC-02 RETRY_DOES_NOT_IMPLY_IDEMPOTENCY
XEC-03 EFFECT_IDENTITY_IS_DISTINCT_FROM_ATTEMPT_IDENTITY
XEC-04 RESOURCE_REPLACEMENT_INVALIDATES_UNPROVEN_EFFECT_CONTINUITY
XEC-05 LOCAL_CONVERGENCE_DOES_NOT_PROVE_EXTERNAL_HISTORY_CONVERGENCE
XEC-06 LATE_CALLBACK_CANNOT_RESURRECT_AUTHORITY
XEC-07 COMPENSATION_IS_A_NEW_PROTECTED_EFFECT
XEC-08 NO_LOCAL_RECORD_DOES_NOT_PROVE_NO_EXTERNAL_EFFECT
XEC-09 EFFECT_EQUIVALENCE_IS_BOUNDED_BY_PROVIDER_CONTRACT
XEC-10 RECONCILIATION_REQUIRES_RESOURCE_INCARNATION
XEC-11 COMMON_MODE_DEPENDENCIES_BOUND_ASSURANCE_INDEPENDENCE
XEC-12 GLOBAL_EFFECT_TERMINATION_REQUIRES_GLOBAL_CLOSURE
XEC-13 LOCAL_FENCE_CANNOT_CLAIM_GLOBAL_EFFECT_PREVENTION
XEC-14 UNKNOWN_EXTERNAL_RELATION_BLOCKS_UNSAFE_MERGE
XEC-15 EFFECT_GRAPH_MERGE_REQUIRES_FRESH_COMPOSITION_CONTEXT
XEC-16 SAFETY_ONLY_CONTAINMENT_CANNOT_BE_PROMOTED_TO_WORLD_TRUTH.

## External research cross-check
NIST SSDF and supply-chain guidance emphasize software integrity and management of dependencies and suppliers across acquisition, development, deployment and maintenance, supporting the treatment of provider/toolchain dependencies as security context rather than neutral infrastructure. citeturn0search2turn0search5
Lamport's state-machine/refinement work supports modeling concurrent branches and requiring an explicit refinement relation when moving from abstract behavior to implementation; it does not justify treating convergent local states as equivalent external histories without modeling relevant state and transitions. citeturn0search7turn0search26

## Open gaps
XEC-G1 Formal external-effect equivalence.
XEC-G2 Provider idempotency contract algebra.
XEC-G3 Duplicate-effect detection under partial observability.
XEC-G4 Resource-incarnation transition proof.
XEC-G5 Callback/redrive closure.
XEC-G6 Compensation/world-history semantics.
XEC-G7 Global effect graph termination.
XEC-G8 Reconciliation independence.
XEC-G9 External fence proof boundary.
XEC-G10 Formal refinement and SANY/TLC/TLAPS validation.

## Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.