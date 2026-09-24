# NEXO — ADC Compaction, Provenance Retention and Root-Rotation Safety V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Test whether causal/assurance compaction can accidentally erase the information required to detect Byzantine equivocation, incompatible roots, branch provenance, or historical cutoffs.

## 2. Central finding
Compaction is not merely storage optimization when retained history participates in security claims.

Therefore:
`COMPACTION != INFORMATION_DELETION` in the semantic sense.
A physical record may be deleted only after its claim-relevant information has been preserved in a protected causal summary/tombstone/certificate whose own support does not depend on the deleted information.

Core rule:
`CLAIM_SCOPE_AFTER_COMPACTION <= VERIFIED_RETAINED_CLOSURE_SCOPE`.

## 3. New object: Assurance Retention Boundary
Candidate `AssuranceRetentionBoundary`:
- boundary_id
- claim_scope
- retained_history_scope
- reclaimed_history_scope
- root generations
- membership generations
- policy/invariant generations
- branch identities
- predecessor/successor relations
- equivocation records
- ordering decisions
- invalidation records
- resource incarnations
- dependency closure
- effect-path closure
- enforcement boundary
- trust roots
- support dependencies
- compaction certificate
- retention policy
- recovery/reconstruction method.

The boundary is a security object because deciding what may be forgotten changes what future claims can be established.

## 4. Three distinct operations
1. Physical reclamation: bytes are deleted.
2. Semantic compaction: information is summarized.
3. Claim-scope reduction: future claims are deliberately weakened.

They must not be conflated.

`RECLAIMED_BYTES != ERASED_HISTORY`.
`COMPACTION != CLAIM_PRESERVATION`.
`CLAIM_SCOPE_REDUCTION != HISTORY_ERASURE`.

## 5. Minimum retained provenance
For any surviving currentness/continuity claim, retained support must preserve at least:
- identity lineage;
- causal bridge;
- root/trust generation;
- authority cutoff;
- ordering context;
- membership generation;
- policy/invariant generation;
- relevant dependency closure;
- resource incarnation;
- effect identity where applicable;
- invalidation reason;
- branch/fork provenance;
- equivocation/conflict evidence;
- scope/property of the original claim;
- assumptions and exclusions.

If one of these is necessary to distinguish a safe branch from an unsafe branch, it cannot be reclaimed unless an equivalent protected summary preserves that distinction.

## 6. Counterexample: compaction hides root fork
History:
R0 → branch A → R1A
R0 → branch B → R1B

Compaction keeps only:
`current_root = R1A`.

It deletes:
- branch B;
- predecessor relation;
- ordering conflict.

Later an observer sees R1A as valid and cannot reconstruct that R1B was also valid under a partition.

The compacted state may falsely appear unambiguous.

Correct:
retain a conflict tombstone/branch summary stating that R1B existed, under which context, why it was rejected/fenced, and what authoritative ordering established R1A.

## 7. Counterexample: compaction hides equivocation
Witness W signs A and B.

Compaction retains only the accepted branch A and deletes B.

Later a claim says:
"W is an independent trustworthy witness for A."

The system has lost the information needed to know W equivocated.

Therefore equivocation evidence is itself claim-relevant provenance and may need retention beyond ordinary event history.

## 8. Counterexample: root rotation after compaction
R0 supports certificate C0.
R0 is later compromised/cut off.
R1 becomes current.

If compaction deletes R0's reliance boundary and only retains:
`C0 = valid signature`,
a future process may incorrectly treat C0 as current assurance.

Retained state must distinguish:
`historically authentic under R0`
from
`currently trusted after R0 cutoff`.

## 9. Counterexample: membership transition
M0 → M1.

A historical quorum under M0 may remain valid as historical participation.

It cannot automatically become a current quorum under M1.

Compaction must retain membership generation and the transition boundary.

## 10. Counterexample: policy transition
P0 → P1.

A certificate generated under P0 can remain historically valid while being insufficient for a P1 claim.

Policy generation is therefore claim-relevant provenance.

## 11. Compaction certificate circularity
Danger:
The certificate says:
"history H can be deleted because certificate C proves C's claim."
But C itself depends on H.

That is self-support.

Required sequence:
PREPARE_COMPACTION
→ FREEZE_RELEVANT_TRANSITIONS
→ COMPUTE_SUPPORT_CLOSURE
→ VERIFY_INDEPENDENT_SUPPORT
→ VERIFY_RETAINED_SUMMARY
→ COMMIT_SUMMARY
→ COMMIT_RECLAMATION_AUTHORIZATION
→ RECLAIM.

The reclamation authorization must not depend on evidence scheduled for reclamation.

## 12. Reclamation authorization
Candidate `ReclamationAuthorization`:
- target history range
- claim scope affected
- retained summary IDs
- support closure
- root/order basis
- invalidation closure
- conflict/equivocation residue
- resource/incarnation residue
- recovery method
- rollback semantics
- current authority
- current retention policy
- publication boundary.

This is an authorization to delete/compact, not a statement that the deleted events never happened.

## 13. Causal tombstones
Candidate `CausalTombstone`:
- predecessor identity
- successor identity
- relation
- ordering context
- cutoff generation
- reason
- relevant conflicts
- support root
- retained property
- invalidation status.

A tombstone is not a full history replacement. It is a bounded semantic residue.

## 14. Residual uncertainty
If compaction cannot prove that all relevant distinctions were preserved:
`COMPACTION_ASSURANCE = UNKNOWN`.

It must not silently promote to:
`COMPACTION_SAFE = TRUE`.

The resulting currentness/authority claim must degrade or quarantine according to contract.

## 15. Root rotation + compaction ordering
Dangerous sequence:
1. compact under R0;
2. rotate to R1;
3. discover R0 compromise;
4. realize deleted history contained R0-dependent certificates.

Therefore root reliance metadata must outlive the raw history it justifies reclaiming.

Safe conceptual order:
establish R0 cutoff
→ invalidate affected support
→ recompute surviving claims
→ create root-reliance residue
→ independently validate compaction
→ reclaim.

## 16. Byzantine fork + compaction
If two branches existed and one is selected, compaction must retain why:
- branch identities;
- common predecessor;
- conflict set;
- ordering decision;
- fencing result;
- root/membership/policy generations;
- effect/resource consequences;
- residual uncertainty.

Otherwise the system may later reconstruct the selected branch as if it were the only branch.

## 17. Merge provenance
A merge certificate must preserve the provenance of every input branch relevant to the resulting claim.

`MERGED_CLAIM != INPUT_CLAIMS`.

Composition creates a new claim context.

If an input later invalidates, the composite claim must be re-evaluated unless the composition contract proves the input irrelevant to the surviving property.

## 18. Common-mode residue
If multiple witnesses share dependency D, compaction cannot delete D from the support summary if independence is part of the claim.

Otherwise:
`N_WITNESSES`
may later be mistaken for
`N_INDEPENDENT_SOURCES`.

The retained summary must preserve shared-dependency information.

## 19. Temporal retention
Retention is not only about event age.

An old record may remain security-relevant because a future claim depends on:
- an old root cutoff;
- old authority epoch;
- old resource incarnation;
- old fork;
- old delegation;
- old effect identity;
- old equivocation;
- old ordering decision.

Therefore:
`OLD != IRRELEVANT`.

## 20. Retention policy as a security contract
Candidate `HistoryRetentionPolicy`:
- claim classes
- mandatory retained fields
- retention horizon
- legal/privacy constraints
- compaction levels
- minimum provenance
- invalidation dependencies
- reconstruction guarantees
- exception triggers
- review/expiry.

Privacy deletion cannot be allowed to silently erase safety-critical residue needed to prevent unauthorized authority or reconstruct relevant historical effects. This is consistent with NIST's broader resiliency principle that protection, detection, and recovery depend on preserving the integrity of the relevant trust mechanisms. citeturn0search24turn0search0

## 21. Claim-scoped compaction levels
C0 — raw history retained.
C1 — lossless semantic summary.
C2 — property-specific summary.
C3 — weaker claim with bounded residue.
C4 — historical attribution only.
C5 — no supported claim; quarantine/unknown.

Compaction must explicitly declare the resulting claim scope.

## 22. Compaction cannot improve assurance
`COMPACTION` may:
- preserve a claim;
- reduce a claim;
- invalidate a claim;
- leave status unknown.

It cannot legitimately strengthen a claim merely because storage was compressed.

## 23. Formal model implication
The future TLA+ model should include:
- raw history;
- retained summaries;
- reclamation authorization;
- branch/fork provenance;
- equivocation records;
- root cutoffs;
- membership/policy generations;
- claim scope after compaction.

Candidate invariant:
`PublishedClaimScope <= VerifiedRetainedProvenanceScope`.

TLC can check such invariants over finite models, while the model itself must include the adversarial transitions that matter; Lamport's tools documentation explicitly describes TLC as an explicit-state model checker for executable TLA+ specifications and notes its safety/liveness checking role. citeturn0search1turn0search2

## 24. Candidate invariants
RC-01 COMPACTION_IS_A_SECURITY_RELEVANT_TRANSITION
RC-02 RECLAMATION_REQUIRES_PROTECTED_AUTHORIZATION
RC-03 RECLAMATION_AUTHORIZATION_CANNOT_DEPEND_ON_RECLAIMED_SUPPORT
RC-04 RETAINED_PROVENANCE_MUST_COVER_SURVIVING_CLAIM_SCOPE
RC-05 ROOT_CUTOFF_PROVENANCE_MUST_SURVIVE_RECLAMATION
RC-06 EQUIVOCATION_RESIDUE_MUST_SURVIVE_WHEN_RELEVANT_TO_CURRENT_ASSURANCE
RC-07 FORK_PROVENANCE_MUST_SURVIVE_WHEN_RELEVANT_TO_CURRENTNESS
RC-08 MEMBERSHIP_GENERATION_BOUNDARIES_MUST_SURVIVE
RC-09 POLICY_GENERATION_BOUNDARIES_MUST_SURVIVE
RC-10 RESOURCE_INCARNATION_BOUNDARIES_MUST_SURVIVE
RC-11 COMMON_MODE_DEPENDENCIES_MUST_SURVIVE_WHEN_RELEVANT_TO_INDEPENDENCE
RC-12 MERGE_PROVENANCE_MUST_SURVIVE_FOR_SURVIVING_COMPOSITE_CLAIMS
RC-13 COMPACTION_CANNOT_STRENGTHEN_CLAIM_SCOPE
RC-14 UNKNOWN_COMPACTION_SAFETY_CANNOT_BE_PROMOTED_TO_SAFE
RC-15 OLD_RECORDS_MAY_REMAIN_SECURITY_RELEVANT
RC-16 CLAIM_SCOPE_AFTER_COMPACTION_MUST_NOT_EXCEED_VERIFIED_RETAINED_SCOPE
RC-17 PRIVACY_RECLAMATION_CANNOT_SILENTLY_ERASE_REQUIRED_SAFETY_RESIDUE
RC-18 ROOT_RELIANCE_METADATA_MUST_OUTLIVE_THE_HISTORY_IT_JUSTIFIES_RECLAIMING

## 25. New synthesis
We now have a stronger conservation rule:

`SECURITY-RELEVANT SEMANTIC DISTINCTIONS MUST SURVIVE ANY TRANSFORMATION THAT LEAVES A CLAIM ALIVE`.

Physical bytes may disappear.
The security-relevant distinction may not.

This unifies:
- causal tombstones;
- branch provenance;
- root cutoffs;
- equivocation;
- resource incarnations;
- membership/policy generations;
- compaction certificates;
- claim-scope degradation.

## 26. Open gaps
RC-G1 Formal minimal retained provenance for each claim class.
RC-G2 Automatic detection of which historical fields remain claim-relevant.
RC-G3 Compaction under simultaneous root rotation and Byzantine equivocation.
RC-G4 Privacy/safety conflict resolution.
RC-G5 Efficient provenance summaries for large effect graphs.
RC-G6 Formal anti-circularity proof for reclamation authorization.
RC-G7 Refinement from physical storage GC to abstract semantic compaction.
RC-G8 Recovery from corrupted/partial compaction summaries.
RC-G9 Byzantine tampering with tombstones/summaries.
RC-G10 SANY/TLC/TLAPS validation.

## 27. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.