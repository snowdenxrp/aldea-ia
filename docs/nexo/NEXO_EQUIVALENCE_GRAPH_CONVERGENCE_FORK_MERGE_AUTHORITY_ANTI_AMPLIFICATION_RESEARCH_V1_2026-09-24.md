# NEXO — Equivalence Graphs: Fork, Convergence, Merge and Authority Anti-Amplification V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Central finding
Graph convergence is not proof of equivalence, authority, or independence.
VALID_PATH_A + VALID_PATH_B != VALID_MERGED_CLAIM.
A converged object must not inherit the union of authority, scope, evidence, or assurance from incoming paths unless an explicit protected composition contract proves that union sound.

## Core findings
1. Fork: A→B1 and A→B2 creates distinct branch contexts; branches are not automatically interchangeable.
2. Convergence: B1→C and B2→C does not prove B1 and B2 have the same security semantics.
3. Merge amplification: S1 ∪ S2 can illegally amplify authority; merged scope must remain within verified joint scope unless a new protected authorization transition grants more.
4. Evidence multiplication: two certificates sharing hidden root H are not two independent witnesses.
5. Duplicate paths do not create independence.
6. Conflicting claims such as SUCCESS versus UNKNOWN remain CONFLICTED/UNKNOWN until resolved by a property-specific rule.
7. Historical validity cannot create current authority.
8. Mixed policy/invariant generations require explicit compatibility.
9. Temporal gaps require a protected causal bridge.
10. Same provider ID does not imply same resource incarnation.
11. Effect identity, attempt identity and retry lineage must survive merge.
12. Enforcement claims are bounded by the verified joint enforcement closure.
13. Merge is itself a protected transition when it changes authority, scope, assurance, currentness, branch status, or effect identity.
14. Merge certificates cannot self-justify compatibility; unsupported assurance SCCs are denied.
15. Operators such as INTERSECTION, BOUNDED_UNION, SELECT_ONE, CONSENSUS, ATTENUATION and RECONCILIATION have claim-specific semantics. Associativity/commutativity/idempotence cannot be assumed.

## New objects
EquivalenceGraphContext, EquivalenceBranch, EquivalenceMergeContext, PathIndependenceVector, MergeCompositionContract, BranchProvenanceRecord, MergeConflictRecord, JointScopeCertificate, CommonModeClosure, MergeCurrentnessContext.

## Safe merge analysis candidate
1. identify incoming branches; 2. preserve provenance; 3. compute causal closure; 4. compute dependency/common-mode closure; 5. compute temporal closure; 6. compute policy/invariant closure; 7. compute authority/revocation closure; 8. compute effect/enforcement closure; 9. classify conflicts/loss/unknown; 10. evaluate composition contract; 11. create fresh merge context; 12. publish only within verified joint scope.

## Candidate invariants
EG-01 VALID_PATHS_DO_NOT_AUTOMATICALLY_FORM_VALID_MERGE
EG-02 MERGE_CANNOT_AMPLIFY_SCOPE
EG-03 COMMON_TARGET_DOES_NOT_PROVE_COMMON_SEMANTICS
EG-04 PATH_COUNT_DOES_NOT_PROVE_INDEPENDENCE
EG-05 COMMON_MODE_DEPENDENCIES_ARE_CLOSED_BEFORE_ASSURANCE_COMPOSITION
EG-06 DUPLICATE_PATHS_ARE_NOT_INDEPENDENT_WITNESSES
EG-07 CONFLICTING_BRANCHES_REMAIN_CONFLICTED_UNTIL_RESOLVED
EG-08 HISTORICAL_BRANCHES_CANNOT_CREATE_CURRENT_AUTHORITY
EG-09 GENERATION_MISMATCH_BLOCKS_UNPROVEN_CURRENT_COMPOSITION
EG-10 TEMPORAL_GAPS_BLOCK_UNPROVEN_CONTINUITY
EG-11 CAUSAL_PROVENANCE_MUST_SURVIVE_MERGE
EG-12 RESOURCE_INCARNA​TION_MUST_SURVIVE_MERGE
EG-13 EFFECT_IDENTITY_AND_ATTEMPT_LINEAGE_MUST_SURVIVE_MERGE
EG-14 ENFORCEMENT_SCOPE_CANNOT_EXCEED_JOINT_VERIFIED_CLOSURE
EG-15 MERGE_IS_PROTECTED_WHEN_SECURITY_RELEVANT
EG-16 MERGE_CERTIFICATE_CANNOT_SELF_JUSTIFY_COMPATIBILITY
EG-17 MERGE_OPERATOR_SEMANTICS_ARE_CLAIM_SPECIFIC
EG-18 INTERSECTION_DOES_NOT_AUTOMATICALLY_PROVE_SEMANTIC_COMPATIBILITY
EG-19 BRANCH_SELECTION_REQUIRES_PROTECTED_ORDER
EG-20 MERGE_CURRENTNESS_REQUIRES_FRESH_COMPOSITION_CONTEXT.

## Open gaps
EG-G1 Formal graph composition algebra.
EG-G2 Sound independence calculation.
EG-G3 Higher-order common-mode closure.
EG-G4 Merge conflict semantics.
EG-G5 Branch selection formalization.
EG-G6 Effect/effect-identity convergence.
EG-G7 Enforcement convergence.
EG-G8 Root/membership/policy multi-generation merge.
EG-G9 Compaction-safe branch provenance.
EG-G10 Refinement and SANY/TLC/TLAPS validation.

## Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.