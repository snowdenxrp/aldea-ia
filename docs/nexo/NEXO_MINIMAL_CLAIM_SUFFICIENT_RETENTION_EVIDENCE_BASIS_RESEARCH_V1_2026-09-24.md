# NEXO — Minimal Claim-Sufficient Retention, Evidence Basis and Safe Reclamation V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Objective
Determine whether Nexo can retain less than raw history while still preserving exactly the evidence needed for a defined claim, without confusing minimization with proof or creating circular deletion.

## External cross-check
NIST defines assurance relative to specific claims and notes that credible evidence substantiates those claims; this supports making retention property-specific rather than treating evidence as universally sufficient. citeturn0search14
NIST's evidence-management work separately addresses retention, preservation, integrity and disposition, supporting the treatment of reclamation as an explicit lifecycle/security concern. citeturn0search8
Lamport and Merz describe history variables as recording past behavior needed for refinement mappings, while data refinement explicitly maps lower-level representations to higher-level state. This supports preserving only claim-relevant history when the mapping is explicitly defined and verified, rather than assuming raw history is always required. citeturn0search24turn0search12

## Central finding
`MINIMAL_RETENTION != MINIMAL_TRUST_BASIS`.
`MINIMAL_RETENTION` is the smallest retained information sufficient for a specified claim under a specified model and environment boundary.
`MINIMAL_TRUST_BASIS` is the smallest dependency-closed set of independently anchored assumptions/support sufficient for the claim.
They interact but are not interchangeable.

## 1. Claim-Sufficient Retention Boundary
Candidate `ClaimSufficientRetentionBoundary` contains:
- claim/property;
- temporal interval;
- scope/resource/incarnation;
- required distinctions;
- retained artifacts;
- summaries/tombstones;
- missing-history set;
- dependency/effect/enforcement closure;
- trust/order/root context;
- assumptions/environment boundary;
- reconstruction method;
- invalidation triggers;
- verification method;
- retention/reclamation policy.

## 2. First sound, then minimize
Safe order:
`SOUND CLOSURE → IDENTIFY REQUIRED DISTINCTIONS → MINIMIZE REPRESENTATION → VERIFY PROPERTY PRESERVATION → AUTHORIZE RECLAMATION`.
Unsafe order:
`MINIMIZE → ASSUME OMITTED INFORMATION IS IRRELEVANT → CLAIM SOUNDNESS`.
This extends the earlier rule `FIRST_SOUND_CLOSURE → THEN_MINIMIZE`.

## 3. Minimality is claim-relative
The minimum retained information for `AccountingBalanced` can be smaller than for `HistoricalEffectAttribution`, which can be smaller than for `CurrentAuthorityContinuity`.
There is no universal smallest history.

## 4. Required-distinction set
Candidate `RequiredDistinctionSet` records distinctions whose loss could change the truth of the claim.
Examples: event identity, order, resource incarnation, authority epoch, policy generation, membership generation, branch identity, provider execution identity, compensation relation, dependency closure, enforcement boundary.
If an omitted distinction can change claim truth, it cannot be safely omitted under that claim context.

## 5. Counterfactual relevance test
For a candidate datum D and claim P: if changing, removing, delaying, replacing, or reinterpreting D can change whether P is true within the defined environment, D is claim-relevant unless a stronger protected boundary makes that causal difference impossible.
This is a claim-scoped version of the prior security-relevance work.

## 6. Representation minimization versus semantic minimization
Multiple raw records may be replaced by one certified summary if the summary preserves every security-relevant distinction needed by P.
`FEWER_BYTES != FEWER_SECURITY_DISTINCTIONS`.
A compact certificate can therefore replace a large event set without weakening P, but only if its preservation/refinement relation is established.

## 7. Summary as a derived artifact
A summary must not be treated as an independent source merely because it is compact.
Candidate `SummaryDerivationCertificate` binds source scope, transformation, preserved properties, loss set, unknown set, dependency closure, semantic context, generation, invalidations and verification method.

## 8. Loss set and unknown set
Candidate summary metadata:
`LossSet = distinctions intentionally removed`.
`UnknownSet = distinctions whose status cannot be established`.
`PreservedSet = distinctions required and demonstrably retained`.
Publication condition for claim P: all P-required distinctions are in PreservedSet or covered by a verified abstraction.

## 9. Abstraction soundness
A summary is an abstraction. An abstraction can be sound for one property and unsound for another.
`ABSTRACTION_SOUND_FOR(P) != ABSTRACTION_SOUND_FOR(Q)`.
Future formal work should prove a property-specific abstraction/refinement relation, not merely compare schemas.

## 10. Hidden dependency danger
A minimized certificate can accidentally omit a dependency that was needed to establish its own trust.
Therefore dependency closure must be computed before minimization and the retained certificate must preserve enough dependency metadata to keep its support graph closed.

## 11. Minimal retention versus circularity
If a summary is used to justify deleting the raw evidence from which the summary's trust was established, the summary must have an independent support boundary or independently retained provenance.
`SUMMARY_USED_TO_JUSTIFY_ITS_OWN_SUPPORT_DELETION → DENY`.

## 12. Multiple incomparable minima
There may be two different minimal retention bases:
Basis A preserves causal ordering.
Basis B preserves a provider-attested transaction certificate.
Neither is necessarily smaller in a universal sense.
Therefore the architecture should not require a unique global minimum. It needs a verified sufficient basis under an explicit contract.

## 13. Retention substitution
Replacing raw history H with summary S is a protected semantic transition if S is expected to preserve a security claim previously supported by H.
Candidate `RetentionSubstitutionTransition` binds source scope, target summary, preservation claim, loss set, dependency closure, authority/order context and reclamation authorization.

## 14. New claim after substitution
If later claim P2 requires a distinction removed when creating S for P1, S cannot automatically support P2.
Either retained auxiliary evidence supports P2, or P2 becomes partially supported/UNKNOWN.
`P1-SUFFICIENT != P2-SUFFICIENT`.

## 15. Reclamation after proof reuse
If a proof or assurance certificate remains reusable after raw history is compacted, its proof context must itself include the retained semantic boundary and dependencies.
A stale proof cache cannot be used as a substitute for deleted context.

## 16. Dynamic environment
If a provider later adds a callback, retry path, or new resource behavior, a previously minimal retention basis may no longer be sufficient for the same claim.
Environment/contract change must invalidate or re-evaluate the retention certificate where relevant.

## 17. Claim degradation as a valid result
When minimization destroys distinctions required by a strong claim, the architecture can deliberately publish a weaker claim rather than retaining everything.
Example:
`FULL_HISTORY_CLAIM → HISTORICAL_ATTRIBUTION_ONLY → ACCOUNTING_ONLY`.
Such degradation must be explicit and monotonic; information loss cannot strengthen the claim.

## 18. Minimal retention and privacy
NIST defines minimization as limiting collection, processing, storage and maintenance of personal information to what is relevant/necessary for an authorized purpose and for as long as necessary. This is compatible with claim-sufficient retention only if the security claim and its required residue are explicitly part of the authorized purpose/retention contract. citeturn0search11
Privacy minimization therefore does not mean deleting safety provenance blindly; it requires a protected policy deciding what minimum residue is necessary for the recognized safety/security claims.

## 19. Formal model direction
Future model should represent:
- claim P;
- required distinction set;
- raw history;
- abstraction/summary;
- loss/unknown/preserved sets;
- dependency closure;
- proof context;
- retention epoch;
- reclamation transition;
- claim degradation;
- environment changes;
- recovery claims.

Lamport's work supports adding history variables that need not be implemented as ordinary program state, and data refinement can map lower-level representations to higher-level concepts. The future Nexo model can therefore distinguish implementation storage from abstract claim-relevant history, but the mapping itself must be specified and checked. citeturn0search24turn0search12

## 20. Candidate invariants
MR-01 RETENTION_IS_CLAIM_RELATIVE
MR-02 SOUND_CLOSURE_PRECEDES_MINIMIZATION
MR-03 REQUIRED_DISTINCTIONS_MUST_BE_PRESERVED_OR_SOUNDLY_ABSTRACTED
MR-04 FEWER_BYTES_DO_NOT_IMPLY_FEWER_SECURITY_DISTINCTIONS
MR-05 SUMMARY_SOUNDNESS_IS_PROPERTY_SPECIFIC
MR-06 LOSS_SET_AND_UNKNOWN_SET_MUST_BE_EXPLICIT
MR-07 SUMMARY_SUPPORT_DEPENDENCIES_MUST_REMAIN_CLOSED
MR-08 SUMMARY_CANNOT_SELF_JUSTIFY_ITS_OWN_SUPPORT_DELETION
MR-09 MINIMAL_RETENTION_NEED_NOT_BE_UNIQUE
MR-10 RETENTION_SUBSTITUTION_IS_PROTECTED_WHEN_CLAIM_PRESERVATION_IS_EXPECTED
MR-11 NEW_CLAIMS_CANNOT_USE_OLD_SUMMARIES_WITHOUT_PROPERTY_COMPATIBILITY
MR-12 PROOF_REUSE_CANNOT_REPLACE_DELETED_PROOF CONTEXT
MR-13 ENVIRONMENT_CHANGES_CAN_INVALIDATE_RETENTION_CERTIFICATES
MR-14 CLAIM_DEGRADATION_MUST_BE_EXPLICIT
MR-15 INFORMATION_LOSS_CANNOT_STRENGTHEN_A_CLAIM
MR-16 PRIVACY_MINIMIZATION_REQUIRES_EXPLICIT_SAFETY_RESIDUE_POLICY
MR-17 RETENTION_SCOPE_CANNOT_EXCEED_VERIFIED_CLAIM_SUPPORT_SCOPE
MR-18 RECLAMATION_REQUIRES_CURRENT_RETENTION_CONTEXT.

## 21. Open gaps
MR-G1 Formal RequiredDistinctionSet.
MR-G2 Property-specific abstraction soundness.
MR-G3 Minimal sufficient retention algorithm.
MR-G4 Multiple incomparable retention bases.
MR-G5 Summary derivation certificate semantics.
MR-G6 Dynamic environment invalidation.
MR-G7 Proof-cache interaction.
MR-G8 Privacy/security residue composition.
MR-G9 Formal refinement and finite-model abstraction.
MR-G10 SANY/TLC/TLAPS validation.

## Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.