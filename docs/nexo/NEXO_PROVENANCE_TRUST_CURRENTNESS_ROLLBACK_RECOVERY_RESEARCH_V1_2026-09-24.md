# NEXO — Provenance Root of Trust Corruption, Restore and Recovery Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Attack the previous provenance-preservation design by assuming the retained provenance itself can be stale, corrupted, maliciously modified, restored from an older snapshot, or signed by a root later revoked.

## 2. Central finding
Preserving provenance is necessary but not sufficient.

We need a distinction:
`PROVENANCE_PRESERVED != PROVENANCE_TRUSTED`.

A surviving tombstone/certificate/summary can be authentic as bytes and still be unusable for current assurance if its trust root, ordering context, dependency closure, or semantic context is stale or compromised.

NIST's resiliency guidance separates protection, detection, and recovery and treats roots of trust as foundational; it also notes that relying on another device for security functions creates a critical trust relationship. This supports treating provenance storage/recovery as part of the trust architecture rather than ordinary durable storage. citeturn0search24turn0search13

## 3. Provenance has its own currentness
Candidate:
`ProvenanceCurrentnessContext`
- provenance_id
- provenance_type
- claim_scope
- property
- identity
- root/trust generation
- ordering context
- authority epoch
- assurance generation
- policy/invariant generation
- dependency closure generation
- resource incarnations
- compaction generation
- snapshot lineage
- invalidation set
- recovery generation
- verification profile
- canonical representation
- status.

A provenance object must be evaluated in the current context before supporting a current claim.

## 4. Four distinct properties
Separate:
1. Authenticity: did an accepted source produce this artifact?
2. Integrity: was the artifact modified?
3. Provenance completeness: does it preserve the distinctions required for the claim?
4. Current validity: does it remain usable for the claim now?

`AUTHENTIC != COMPLETE != CURRENT`.

## 5. Snapshot restore attack
Suppose current provenance P2 exists.
A stale snapshot restores P1.

P1 may be perfectly authentic and internally consistent.

But if P2 contained:
- a root cutoff;
- equivocation discovery;
- revocation;
- branch fencing;
- resource replacement;
then restoring P1 can resurrect stale support.

Therefore:
`RESTORED_PROVENANCE != CURRENT_PROVENANCE`.

Restore must start quarantined and re-establish the current trust/order context.

## 6. Provenance rollback attack
If provenance storage itself rolls back:
old root trust
old membership
old policy
old invalidation state
old compaction generation

may reappear.

Therefore storage rollback is a security event, not merely data loss.

Candidate:
`ProvenanceRollbackDetection`.

## 7. Monotonic invalidation anchor
Candidate protected monotonic anchors:
- root cutoff generation;
- authority epoch;
- invalidation epoch;
- recovery generation;
- compaction generation;
- membership/policy generation where relevant.

The exact implementation may differ, but current assurance must not accept a provenance context older than a protected invalidation boundary.

Important:
`MONOTONIC_VERSION != MONOTONIC_AUTHORITY`.
The version itself must be advanced under protected ordering.

## 8. Corrupted tombstone
A tombstone says:
"branch B was fenced before branch A became current."

If its ordering context is corrupted or its predecessor identity is altered, the tombstone may create a false causal bridge.

Therefore a tombstone must bind:
- predecessor;
- successor;
- relation;
- ordering domain;
- generation;
- support root;
- claim/property;
- scope;
- conflict set;
- invalidation context.

## 9. Summary substitution
Attacker replaces a valid summary S1 with a validly signed but semantically different S2 under another protocol/context.

Cryptographic validity does not establish semantic compatibility.

This reuses the previous rule:
`CRYPTOGRAPHIC_VALIDITY != SEMANTIC_VALIDITY`.

Provenance artifacts require protocol/domain/type/purpose binding.

## 10. Compaction certificate signed by revoked root
C was validly authorized by R0 to compact history.
Later R0 is compromised and cut off.

C may remain historical evidence that compaction was authorized at time T, but cannot automatically establish current trust.

Thus:
`HISTORICAL_COMPACTION_AUTHORIZATION != CURRENT_COMPACTION_AUTHORITY`.

If future claims depend on C, its root trust interval must be checked.

## 11. Recovery after corrupted provenance
Recovery cannot simply say:
"the provenance says recovery is safe."

Required conceptual sequence:
RESTORE
→ QUARANTINE
→ ESTABLISH CURRENT TRUST/ORDER
→ DETECT PROVENANCE ROLLBACK/CORRUPTION
→ VERIFY PROVENANCE INTEGRITY
→ VERIFY SEMANTIC COMPLETENESS
→ RECONSTRUCT REQUIRED CURRENT PROVENANCE
→ RECOMPUTE ADC
→ RECOMPUTE CURRENTNESS
→ RECONCILE EXTERNAL EFFECTS
→ REVALIDATE AUTHORITY/FENCES
→ EXPLICIT RELEASE.

## 12. Independent provenance recovery
If all provenance copies share one corrupted root, replicas do not create independence.

Therefore:
`REPLICATED_PROVENANCE != INDEPENDENT_PROVENANCE`.

Candidate `ProvenanceRecoverySourceVector` records failure-domain and trust-domain diversity.

## 13. Provenance source hierarchy
Possible support:
P0 — protected authoritative provenance;
P1 — independently anchored external/resource evidence;
P2 — corroborated secondary provenance;
P3 — reconstructed inference;
P4 — unverified restored data.

Only explicit contracts determine which levels can support a claim.

## 14. Reconstructed provenance
If provenance is missing, reconstructing it from surviving artifacts can be useful.

But:
`RECONSTRUCTION != ORIGINAL_HISTORY`.

A reconstructed bridge must identify:
- source artifacts;
- transformation;
- assumptions;
- loss/unknowns;
- property proven;
- scope;
- independent support.

If historical uniqueness cannot be established, the resulting claim must be weaker.

## 15. Provenance gap
Candidate state:
`PROVENANCE_GAP`.

Triggered by:
- missing predecessor;
- missing root cutoff;
- unknown membership generation;
- unknown resource incarnation;
- missing equivocation residue;
- incompatible snapshot lineage;
- corrupted summary;
- unknown ordering.

A provenance gap must not silently resolve to "no conflict."

## 16. Gap closure
Candidate sequence:
IDENTIFY GAP
→ FREEZE AFFECTED CLAIMS
→ DETERMINE REQUIRED SUPPORT
→ SEARCH INDEPENDENT SOURCES
→ RECONSTRUCT IF SOUND
→ VALIDATE CONTEXT
→ UPDATE ADC
→ RECOMPUTE CLAIM
→ RELEASE or HOLD/QUARANTINE.

## 17. Anti-resurrection rule
A restored/stale provenance artifact must not resurrect:
- revoked authority;
- expired delegation;
- fenced branch;
- old root;
- old policy;
- old capability;
- old resource incarnation;
- invalidated assurance.

Candidate invariant:
`RESTORE_CANNOT_INCREASE_CURRENT_AUTHORITY`.

## 18. Recovery provenance loop
Recovery itself generates provenance.

Danger:
R1 recovery uses provenance P1.
R1 writes a recovery certificate P2.
P2 later becomes the support for the claim that R1 was legitimate.
If P1 was never independently validated, P2 is self-supporting.

Therefore:
`RECOVERY_GENERATED_PROVENANCE`
must retain its dependency closure and cannot erase the provenance it relied on before the claim is independently established.

## 19. Root of provenance
We need an explicit concept:
`ProvenanceTrustAnchor`.

It may be:
- constitutional root;
- protected ordering root;
- independent resource attestation;
- externally anchored historical checkpoint;
- bounded human emergency root under explicit contract.

But it cannot be merely:
"the provenance says this provenance is trustworthy."

## 20. Dual-root provenance
If provenance P is signed by R1 and R2, that does not automatically make it more trustworthy.

Need explicit composition:
- same artifact identity;
- same semantic context;
- same generation;
- same scope;
- same property;
- same ordering;
- independent failure domains;
- no common compromised dependency.

Otherwise signatures are participation evidence, not independent assurance.

## 21. Provenance fork
Provenance itself can fork:
P → P1
P → P2

If P1 and P2 disagree about root cutoff/order, they become competing support histories.

Therefore provenance has to be modeled as a graph, not a single mutable record.

## 22. Provenance merge
Merge requires:
- common predecessor;
- branch identities;
- ordering;
- conflict closure;
- root context;
- dependency closure;
- semantic compatibility;
- explicit merge operation.

`PROVENANCE_MERGE != HISTORY_TRUTH`.

If conflict remains relevant, merged provenance remains conflicted/unknown.

## 23. External resource provenance
A provider may independently attest:
"effect E exists for resource incarnation R2."

That can help recover from lost local provenance.

But it does not establish:
- why Nexo authorized E;
- whether E was safe;
- whether current authority existed.

Thus external provenance is property-specific.

## 24. Compaction + corrupted summary
If summary S was corrupted before raw history was reclaimed, the system may be unable to recover the original distinction.

Then:
`SUMMARY_CORRUPTION + NO_RAW_SUPPORT -> CLAIM_DEGRADATION`.

The system must not infer missing facts from the summary's own assertion.

## 25. Tamper-evident is not tamper-proof
A tamper-evident chain can show that bytes changed relative to an anchor.

It does not by itself prove that the anchor was correct or current.

Therefore:
`TAMPER_EVIDENCE != SEMANTIC_TRUTH`.

## 26. Formal model implication
Future TLA+ should model:
- provenance objects;
- trust anchors;
- provenance generations;
- snapshot restore;
- storage rollback;
- corruption;
- compaction;
- root cutoff;
- recovery-generated provenance;
- provenance forks/merges;
- reconstruction;
- provenance gaps.

Candidate properties:
`RestoreCannotIncreaseAuthority`
`StaleProvenanceCannotSupportCurrentClaim`
`SelfSupportingProvenanceIsRejected`
`PublishedClaimScope <= VerifiedProvenanceSupportScope`.

TLA+ tools can check invariants over the behaviors represented by the model, while refinement mappings can connect lower-level behavior to higher-level specifications. Neither makes an omitted corruption/rollback behavior disappear; the adversarial transitions must be represented in the model. citeturn0search1turn0search25

## 27. Candidate invariants
PR-01 PROVENANCE_PRESERVED != PROVENANCE_TRUSTED
PR-02 AUTHENTICITY != COMPLETENESS != CURRENT_VALIDITY
PR-03 RESTORED_PROVENANCE_STARTS_QUARANTINED
PR-04 STORAGE_ROLLBACK_IS_SECURITY_RELEVANT
PR-05 CURRENT_INVALIDATION_BOUNDARIES_CANNOT_BE_REWOUND_BY_RESTORE
PR-06 PROVENANCE_ARTIFACTS_REQUIRE_SEMANTIC_DOMAIN_BINDING
PR-07 REVOKED_ROOT_PROVENANCE_CANNOT_SUPPORT_CURRENT_CLAIMS
PR-08 REPLICATED_PROVENANCE_DOES_NOT_IMPLY_INDEPENDENCE
PR-09 RECONSTRUCTED_PROVENANCE_MUST_DISCLOSE_LOSS_AND_ASSUMPTIONS
PR-10 PROVENANCE_GAP_CANNOT_PROMOTE_TO_NO_CONFLICT
PR-11 RESTORE_CANNOT_INCREASE_CURRENT_AUTHORITY
PR-12 RECOVERY_GENERATED_PROVENANCE_CANNOT_SELF-JUSTIFY_RECOVERY
PR-13 PROVENANCE_MERGE_REQUIRES_EXPLICIT_COMPATIBILITY
PR-14 PROVENANCE_FORKS_REQUIRE_BRANCH_PROVENANCE
PR-15 SUMMARY_CORRUPTION_WITHOUT_INDEPENDENT_SUPPORT_REQUIRES_CLAIM_DEGRADATION
PR-16 TAMPER_EVIDENCE_DOES_NOT_ESTABLISH_SEMANTIC_TRUTH
PR-17 CURRENT_PROVENANCE_REQUIRES_CURRENT_TRUST_ORDER_AND_DEPENDENCY_CONTEXT
PR-18 PROVENANCE_SUPPORT_CANNOT_EXCEED_VERIFIED_TRUST_ANCHOR_SCOPE
PR-19 RESTORED_STALE_ARTIFACTS_CANNOT_RESURRECT_REVOKED_STATE
PR-20 PROVENANCE_RECLAMATION_MUST_PRESERVE_REQUIRED_SECURITY_DISTINCTIONS

## 28. New synthesis
The architecture now needs two separate concepts:
1. Provenance preservation.
2. Provenance trust/currentness.

The protected chain becomes:
`TRUST ANCHOR → PROVENANCE SUPPORT → ADC → CURRENTNESS → AUTHORITY`.

No provenance artifact may skip the trust-anchor and current-context checks.

## 29. Open gaps
PR-G1 Formal ProvenanceCurrentnessContext.
PR-G2 Protected monotonic invalidation across storage rollback.
PR-G3 Independent provenance recovery under common-mode compromise.
PR-G4 Formal reconstruction soundness.
PR-G5 Byzantine tampering of provenance summaries/tombstones.
PR-G6 Privacy deletion versus provenance minimum.
PR-G7 Efficient provenance graph storage and compaction.
PR-G8 Recovery-generated provenance anti-circularity.
PR-G9 Implementation refinement for provenance discovery.
PR-G10 SANY/TLC/TLAPS validation.

## 30. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.