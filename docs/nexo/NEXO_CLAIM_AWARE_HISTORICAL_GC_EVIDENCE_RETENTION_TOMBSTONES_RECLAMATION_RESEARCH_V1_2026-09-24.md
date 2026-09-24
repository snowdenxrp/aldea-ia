# NEXO — Claim-Aware Historical GC, Evidence Retention, Tombstones and Anti-Circular Reclamation V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Central finding
History reclamation cannot be decided by age, storage pressure, or apparent compensation alone.

`SAFE_TO_RECLAIM != OLD`
`SAFE_TO_RECLAIM != COMPENSATED`
`SAFE_TO_RECLAIM != COMPACTED`
`CLAIM_NO_LONGER_SUPPORTED != EVENT_NEVER_OCCURRED`.

NIST's evidence-management work treats retention, preservation, integrity and disposition as distinct lifecycle concerns, and its digital-evidence guidance emphasizes that preservation has special integrity requirements. This supports treating deletion/reclamation as a security-relevant transition rather than ordinary garbage collection. citeturn0search3turn0search8

## 1. Reclamation must be claim-scoped
For each historical item H, determine which active or potentially recoverable claims depend on H.

Candidate relation:
`ClaimDependency(C,H)`.

If H supports any claim that may still be asserted, H cannot be physically reclaimed unless a sound replacement summary/tombstone preserves the required property.

## 2. Four different operations
- Physical reclamation: bytes/resources removed.
- Semantic compaction: raw events replaced by a summary.
- Claim-scope reduction: Nexo voluntarily stops making claims requiring the history.
- Historical invalidation: a claim about the history is withdrawn because its support is no longer sufficient.

They are not interchangeable.

## 3. Dangerous circularity
Bad protocol:
`USE H TO PROVE H IS SAFE TO DELETE → DELETE H → CLAIM H WAS NOT NEEDED`.

This is self-supporting evidence.

Safe shape:
`FREEZE → IDENTIFY CLAIMS → BUILD INDEPENDENT SUPPORT GRAPH → VERIFY RETENTION BOUNDARY → COMMIT SUMMARY/TOMBSTONES → COMMIT RECLAMATION AUTHORIZATION → RECLAIM`.

The reclamation authorization must not depend on information that is destroyed by the same reclamation unless an independently retained summary proves the required property.

## 4. Retention boundary
Candidate `HistoricalRetentionBoundary` fields:
- retention_id
- claim/property scope
- retained history scope
- reclaimable scope
- active claims
- possible recovery claims
- root/authority generations
- policy/invariant generations
- branch/equivocation provenance
- ordering decisions
- resource incarnations
- effect/retry/compensation lineage
- dependency/effect/enforcement closure
- evidence roots
- invalidations
- compaction certificate
- tombstone set
- reconstruction method
- expiry/review
- recovery semantics.

## 5. Tombstone is not deletion proof
A tombstone such as `E1 deleted` proves that a record was removed only if its provenance and integrity are protected.
It does not prove E1 never happened.

Candidate `CausalTombstone` should bind:
- original identity;
- predecessor/successor;
- retention decision;
- claim scope;
- compaction/reclamation certificate;
- authority/policy/invariant context;
- ordering position;
- resource incarnation;
- invalidation state.

## 6. Summary must preserve security distinctions
A compact summary is sound only for a specified claim.

`SUMMARY_VALID_FOR_P != SUMMARY_VALID_FOR_ALL_PROPERTIES`.

If a summary preserves accounting but not causal provenance, it cannot support a historical-attribution claim.
If it preserves historical attribution but not current authority, it cannot support current authorization.

## 7. Negative claims are especially fragile
Deleting all evidence of E1 can make the system unable to distinguish:
- E1 never happened;
- E1 happened and was compensated;
- E1 happened but evidence was lost;
- E1 happened in another incarnation;
- E1 happened on a hidden continuation.

Therefore reclamation must not manufacture certainty from information loss.

## 8. Retention can be claim-degrading by design
Sometimes privacy, cost, or policy legitimately requires reducing retained history.
The correct consequence can be:
`CLAIM_STRENGTH ↓`
not:
`EVIDENCE_LOST → CLAIM_STILL_STRONG`.

This yields a controlled transition:
`RETAINED → COMPACTED → CLAIM_DEGRADED`
when the original proof boundary cannot be preserved.

## 9. Compaction levels
Candidate:
C0 RAW_HISTORY
C1 LOSSLESS_SEMANTIC_SUMMARY
C2 PROPERTY_SPECIFIC_SUMMARY
C3 WEAKER_CLAIM_SUMMARY
C4 HISTORICAL_ATTRIBUTION_ONLY
C5 NO_SUPPORTED_CLAIM / QUARANTINE.

A lower level must never silently inherit claims from a higher level.

## 10. Active versus latent claims
A history item may support a claim that is not currently published but could become relevant during:
- recovery;
- incident investigation;
- reconciliation;
- dispute resolution;
- root rotation;
- rollback analysis;
- decommission audit;
- legal/operational retention obligations.

Retention policy therefore needs a defined set of latent/recovery claims rather than only currently visible claims.

## 11. Recovery after compaction
Recovery must know exactly what was compacted and what claims remain supported.
A snapshot cannot silently recreate deleted provenance.

`RESTORE != RESTORE_HISTORY`
`RESTORE != RESTORE_PROOF`
`RESTORE != RESTORE_CURRENT_AUTHORITY`.

If required causal bridges are missing, recovery enters UNKNOWN/HOLD/QUARANTINE.

## 12. Root rotation interaction
If H supports trust in root R1 and R1 is later rotated, H may still be required to prove historical attribution under R1 even though it cannot establish current authority under R2.

Therefore root rotation must not automatically erase predecessor provenance.

## 13. Policy/invariant interaction
A later policy may require stronger retention than the old policy.
A weaker historical retention rule cannot be used to erase evidence needed to satisfy the new claim unless an explicit transition establishes compatibility.

Likewise, a policy cannot retroactively redefine a historical effect as nonexistent merely because the new policy no longer cares about it.

## 14. Membership/quorum interaction
Historical quorum evidence may be needed to prove who authorized an old transition.
After membership rotation, the old signer set remains historically meaningful even though it may no longer be current.

`HISTORICAL_QUORUM != CURRENT_QUORUM`.

Compaction must preserve enough membership/root/quorum provenance to distinguish genuine historical authorization from later reconstructed approval.

## 15. Byzantine/equivocation interaction
If a witness equivocated, the equivocation record can be more important than the individual signatures.
Deleting the branch context may leave two valid-looking certificates that appear compatible.

Therefore compaction must preserve conflict/equivocation provenance whenever it is relevant to an active or latent claim.

## 16. Independence interaction
Two evidence summaries that share the same deleted dependency can appear independent after compaction.
Therefore common-mode metadata must outlive the raw evidence it justifies when independence is still a claim.

`COMPACTION_CANNOT_CREATE_INDEPENDENCE_BY_DELETING_SHARED_DEPENDENCIES`.

## 17. Effect/compensation interaction
If E1 was compensated by E2, retaining only final state loses the relation E2→compensates(E1).
That destroys the distinction between no effect and compensated effect.

Therefore compensation lineage is claim-relevant provenance.

## 18. Resource incarnation interaction
If R7 was replaced by R8, deleting the incarnation boundary can make old E1 appear to have happened to current R8.

Resource-incarnation tombstones are therefore required when historical effect identity depends on them.

## 19. Reclamation authorization must be a protected transition
Candidate sequence:
`REQUEST_RECLAMATION → FREEZE_RELEVANT_TRANSITIONS → COMPUTE_CLAIM_DEPENDENCY_CLOSURE → VERIFY_INDEPENDENT_SUPPORT → VERIFY_RETENTION_POLICY → PREPARE_SUMMARY/TOMBSTONES → COMMIT_SUMMARY → COMMIT_RECLAMATION_AUTHORIZATION → RECLAIM → VERIFY_RETAINED_CLAIM_SCOPE → PUBLISH`.

Crash between any steps must not permit unsafe reclamation or false claim promotion.

## 20. Garbage collection is not ordinary garbage collection
Security-relevant history cannot be reclaimed solely because no active pointer references it.
A claim, recovery path, reconciliation path, or audit proof may reference it semantically even when no runtime object does.

`NO_RUNTIME_REFERENCE != NO_SECURITY_DEPENDENCY`.

## 21. Formal implications
Future model should include:
- historical events;
- claim-dependency relation;
- retention boundaries;
- summaries/tombstones;
- reclamation authorization;
- active/latent claims;
- dependency/effect/enforcement closure;
- root/policy/membership generations;
- branch/equivocation provenance;
- resource incarnations;
- crash states around reclamation.

Lamport and Merz describe history variables as a way to preserve information about past behavior needed for refinement while leaving ordinary system variables unchanged. That supports modeling claim-relevant historical information explicitly rather than assuming current state contains all proof-relevant history. citeturn0search24turn0search25

## 22. Candidate invariants
RG-01 RECLAMATION_IS_CLAIM_SCOPED
RG-02 AGE_DOES_NOT_PROVE_RECLAIMABILITY
RG-03 COMPENSATION_DOES_NOT_PROVE_RECLAIMABILITY
RG-04 RECLAMATION_CANNOT_SELF_JUSTIFY
RG-05 SUMMARY_SCOPE_MUST_BE_EXPLICIT
RG-06 SUMMARY_CANNOT_SUPPORT_PROPERTIES_IT_DOES_NOT_PRESERVE
RG-07 INFORMATION_LOSS_CANNOT_CREATE_NEGATIVE_CERTAINTY
RG-08 CLAIM_DEGRADATION_MUST_BE_EXPLICIT
RG-09 LATENT_RECOVERY_CLAIMS_ARE_INCLUDED_IN_RETENTION_ANALYSIS
RG-10 RESTORE_CANNOT_RECREATE_DELETED_PROVENANCE
RG-11 ROOT_ROTATION_DOES_NOT_ERASE_HISTORICAL_ROOT_PROVENANCE
RG-12 POLICY_CHANGE_DOES_NOT_RETROACTIVELY_ERASE_HISTORY
RG-13 HISTORICAL_MEMBERSHIP_AND_QUORUM_CONTEXT_MUST_SURVIVE_WHEN_CLAIM-RELEVANT
RG-14 EQUIVOCATION_PROVENANCE_MUST_SURVIVE_WHEN_CLAIM-RELEVANT
RG-15 COMPACTION_CANNOT_CREATE_INDEPENDENCE
RG-16 COMPENSATION_LINEAGE_MUST_SURVIVE_WHEN_HISTORY_CLAIMS_REQUIRE_IT
RG-17 RESOURCE_INCARNATION_BOUNDARIES_MUST_SURVIVE_WHEN_EFFECT_CLAIMS_REQUIRE_IT
RG-18 RECLAMATION_IS_A_PROTECTED_TRANSITION
RG-19 NO_RUNTIME_REFERENCE_DOES_NOT_PROVE_NO_SECURITY_DEPENDENCY
RG-20 POST-RECLAMATION_CLAIM_SCOPE_MUST_BE_RECOMPUTED.

## 23. Open gaps
RG-G1 Formal claim-dependency closure.
RG-G2 Latent/recovery claim enumeration.
RG-G3 Sound summary certificates.
RG-G4 Tombstone trust and provenance.
RG-G5 Reclamation crash semantics.
RG-G6 Privacy versus safety-retention composition.
RG-G7 Dynamic claim creation after compaction.
RG-G8 Byzantine/common-mode provenance after compaction.
RG-G9 Formal refinement.
RG-G10 SANY/TLC/TLAPS validation.

## Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.