# NEXO — Post-Compaction Reconstruction Claims, Missing History and Evidence Sufficiency V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Objective
Analyze whether a new claim appearing after historical compaction can be reconstructed from retained summaries, surviving witnesses, tombstones and external observations, and define when reconstruction must remain UNKNOWN.

## Central finding
`RECONSTRUCTION != RESTORATION_OF_DELETED_HISTORY`.
`SURVIVING_EVIDENCE != SUFFICIENT_EVIDENCE`.
`MULTIPLE_PARTIAL_WITNESSES != COMPLETE_HISTORY`.
`CLAIM_APPEARS_LATER != CLAIM_WAS_SUPPORTED_AT_RECLAMATION`.

## 1. Reconstruction claim
Candidate `HistoricalReconstructionClaim` states a property about a historical interval using retained summaries and evidence rather than the original raw events.
It must explicitly state the property, interval, scope, evidence set, missing information, assumptions, transformations and reconstruction method.

## 2. Three outcomes
RECONSTRUCTED: retained information is sufficient for the exact property.
PARTIALLY_RECONSTRUCTED: some property is supported but relevant distinctions remain missing.
UNRECONSTRUCTABLE: required distinctions were destroyed or never observed.
UNKNOWN is the default when the system cannot safely distinguish these cases.

## 3. Reconstruction must not silently fill gaps
If E1 and E2 were compacted into a summary that preserves final balance but not ordering, a later causal-order claim cannot infer an order from timestamps alone unless an authoritative ordering contract exists.
`MISSING_ORDER != ARBITRARY_ORDER`.

## 4. Evidence classes
Candidate reconstruction evidence levels:
R0 identifier/tombstone only
R1 signed historical assertion
R2 protected state transition
R3 causal bridge
R4 external resource evidence
R5 independent corroboration under explicit failure-domain closure
R6 property-specific historical reconstruction
R7 current authority/currentness — never implied merely by historical reconstruction.
No lower class automatically implies R6 or R7.

## 5. Surviving witnesses can disagree
After compaction, witness A may retain E1 and witness B may retain E2. Their consistency must be checked before composition.
`VALID(A) + VALID(B) != VALID(RECONSTRUCTED(A,B))`.
Common-mode dependencies, generation, branch provenance, ordering and semantic interpretation remain part of the composition context.

## 6. Missing history is a first-class input
Candidate `MissingHistorySet` records which distinctions are unavailable: event identity, ordering, resource incarnation, authority generation, policy, membership, provider execution, callback lineage, compensation relation, etc.
Claims whose truth depends on an item in MissingHistorySet cannot be promoted beyond the verified retained scope.

## 7. Reconstruction from negative evidence
An empty query result, absent callback or absent local record cannot establish no effect unless the observation mechanism is explicitly absence-capable for the claim boundary.
`ABSENCE_OF_RETAINED_RECORD != HISTORICAL_ABSENCE`.

## 8. Reconstruction after branch deletion
If Branch B was compacted and only Branch A survives, a later claim about whether A and B agreed cannot be answered merely because A is internally coherent.
The missing branch becomes an explicit unresolved branch context.
`MISSING_BRANCH != COMPATIBLE_BRANCH`.

## 9. Reconstruction after equivocation evidence loss
If the raw branch context containing equivocation was deleted but two certificates remain, the certificates cannot be merged into a stronger quorum claim merely because their signatures remain valid.
`SIGNATURE_SURVIVAL != CONTEXT_SURVIVAL`.

## 10. Reconstruction after root rotation
Historical facts under Root R1 may be reconstructed without establishing that R1 is current. A later Root R2 cannot retroactively reinterpret an R1 certificate as an R2 authorization unless an explicit semantic compatibility/composition transition proves that property.

## 11. Reconstruction after resource replacement
An effect record lacking the incarnation boundary cannot safely be attributed to the current resource if replacement could have occurred during the missing interval.
Same provider ID is insufficient.

## 12. Reconstruction from provider observations
A current provider state can sometimes establish a bounded state claim, but not necessarily the complete historical sequence that produced it.
`CURRENT_RESOURCE_STATE != COMPLETE_EFFECT_HISTORY`.

## 13. Reconstruction and compensation
A final state plus a compensation record may support `STATE_RESTORED` if the provider contract and evidence support that property. It does not automatically support `NO_HISTORICAL_EFFECT`.

## 14. Reconstruction and external witnesses
Independent external witnesses may strengthen a reconstruction only after their dependency and failure-domain closure is analyzed. Two logs copied from the same provider database are not independent merely because they have different filenames or services.

## 15. Reconstruction and temporal gaps
Evidence from T0 and T2 cannot automatically prove what happened at T1. A causal bridge or interval-complete observation contract is required for claims spanning the gap.

## 16. Reconstruction claim scope
Candidate `ReconstructionScopeVector`: property, temporal interval, branches, resources/incarnations, authority generations, policy/invariant generations, effect paths, enforcement boundary, evidence scope, dependency closure and uncertainty.
Publication requires each dimension to be within verified retained/reconstructable scope.

## 17. Reconstruction cannot create authority
A reconstructed historical authorization may support attribution of a past event. It cannot itself grant current authority to a recovered process, branch or capability.
`HISTORICAL_RECONSTRUCTION != CURRENT_AUTHORITY`.

## 18. New claim after compaction
If a newly introduced claim was outside the recognized retention contract, the architecture does not retroactively make the old reclamation invalid. Instead it must report that the historical claim is unsupported or only partially reconstructable.
If the new claim was within an explicit latent/recovery obligation, failure to retain required distinctions is a retention-contract failure and must trigger the appropriate governance/recovery response.

## 19. Reconstruction provenance
Candidate `ReconstructionCertificate` should bind:
- claim/property;
- historical interval;
- retained artifacts and tombstones;
- missing-history set;
- evidence dependency graph;
- transformations/projections;
- semantic interpretation context;
- root/membership/policy generations;
- resource incarnations;
- causal bridges;
- ordering assumptions;
- common-mode/failure-domain closure;
- invalidations;
- reconstruction method;
- exact claim supported;
- expiry/review.

## 20. No self-supporting reconstruction
A reconstruction certificate cannot be the sole evidence that the certificate itself is trustworthy, complete, independent or current.
Unsupported assurance SCCs remain denied.

## 21. Formal implication
Lamport and Merz describe history variables as auxiliary variables that record past behavior and can be used when constructing refinement mappings. This supports explicitly modeling the difference between retained history and current implementation state. TLA+ can express the abstraction, but actual soundness still requires the refinement relation and verification work; none has been executed here. citeturn0search36turn0search39

NIST's evidence-management work treats retention, preservation, integrity and disposition as distinct concerns, and its digital-evidence guidance highlights the special preservation problems of digital evidence. This supports treating reconstruction and evidence loss as explicit claim-boundary issues rather than ordinary data lookup failures. citeturn0search1turn0search10

## 22. Candidate invariants
HR-01 RECONSTRUCTION_DOES_NOT_RESTORE_DELETED_HISTORY
HR-02 SURVIVING_EVIDENCE_MUST_MEET_PROPERTY_SPECIFIC_SUFFICIENCY
HR-03 PARTIAL_WITNESSES_CANNOT_BE_COMPOSED_WITHOUT_CONTEXT_COMPATIBILITY
HR-04 MISSING_HISTORY_IS_EXPLICIT
HR-05 ABSENCE_OF_RECORD_DOES_NOT_PROVE_HISTORICAL_ABSENCE
HR-06 MISSING_BRANCH_DOES_NOT_IMPLY_BRANCH_COMPATIBILITY
HR-07 SIGNATURE_SURVIVAL_DOES_NOT_PRESERVE_DELETED_CONTEXT
HR-08 ROOT_ROTATION_DOES_NOT_REWRITE_HISTORICAL_AUTHORITY
HR-09 RESOURCE_IDENTITY_REQUIRES_INCARNATION_WHEN_RELEVANT
HR-10 CURRENT_RESOURCE_STATE_DOES_NOT_PROVE_COMPLETE_HISTORY
HR-11 COMPENSATION_DOES_NOT_PROVE_NO_HISTORICAL_EFFECT
HR-12 EXTERNAL_WITNESS_INDEPENDENCE_REQUIRES_FAILURE_DOMAIN CLOSURE
HR-13 TEMPORAL_GAPS_REQUIRE_CAUSAL_BRIDGES_FOR_SPANNING_CLAIMS
HR-14 RECONSTRUCTION_SCOPE_CANNOT_EXCEED_VERIFIED_RETAINED_SCOPE
HR-15 HISTORICAL_RECONSTRUCTION_CANNOT_GRANT_CURRENT_AUTHORITY
HR-16 NEW_UNSUPPORTED_CLAIM_MUST_REMAIN_UNSUPPORTED
HR-17 LATENT_CLAIM_RETENTION_FAILURE_MUST_NOT_BE_HIDDEN
HR-18 RECONSTRUCTION_CERTIFICATE_CANNOT_SELF-JUSTIFY
HR-19 UNKNOWN_IS_PRESERVED_WHEN_REQUIRED_DISTINCTIONS_ARE_MISSING
HR-20 RECONSTRUCTION_METHOD_AND_TRANSFORMATIONS_MUST_BE_TRACEABLE.

## 23. Open gaps
HR-G1 Formal reconstruction sufficiency predicate.
HR-G2 Minimal retained evidence for property-specific claims.
HR-G3 MissingHistorySet semantics.
HR-G4 Partial-witness composition algebra.
HR-G5 Temporal-gap causal bridges.
HR-G6 Reconstruction under Byzantine branch loss.
HR-G7 Reconstruction under resource replacement.
HR-G8 Reconstruction under privacy minimization.
HR-G9 Formal refinement and finite-model abstraction.
HR-G10 SANY/TLC/TLAPS validation.

## Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.