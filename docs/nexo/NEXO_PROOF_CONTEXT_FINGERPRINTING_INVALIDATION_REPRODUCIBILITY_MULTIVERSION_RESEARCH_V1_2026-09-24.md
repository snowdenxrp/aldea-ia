# NEXO - PROOF CONTEXT FINGERPRINTING / INVALIDATION / REPRODUCIBILITY / MULTI-VERSION MODELS - 2026-09-24
Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Core result
A proof is not current merely because the proof file is authentic, the artifact is byte-identical, the timestamp is recent, or the same numeric version appears.
Canonical model: PROOF = CLAIM + PROOF_CONTEXT + OBLIGATIONS + EVIDENCE + ASSUMPTIONS + RESULT.
Therefore OLD_PROOF != CURRENT_PROOF unless current context is shown compatible with the proof context and all relevant invalidation conditions remain false.

## External cross-check
SLSA 1.2 treats provenance as verifiable information describing where, when and how an artifact was produced. Its build provenance records build definition, inputs/dependencies and builder context, enabling downstream verification. citeturn0search3turn0search6
SLSA distinguishes reproducible builds from verified reproducibility using independent build platforms. citeturn0search7

## 1. ProofContextFingerprint
Candidate structured identity:
claim/specification identity
model and instantiated-configuration fingerprint
module/import closure
claim/invariant fingerprint
policy/invariant versions
dependency closure
effect-path/boundary closure
abstraction/reduction fingerprint
assumption-graph fingerprint
environment-assumption fingerprint
resource-incarnation set
continuity context
toolchain/backend identity
proof-obligation set
refinement mapping identity
proof-result lineage.
The fingerprint is semantic context identity, not merely a file hash.

## 2. Content identity versus context identity
Two byte-identical models can have different meaning if dependencies, environment assumptions, resource incarnations or external contracts changed.
CONTENT_IDENTITY != CONTEXT_IDENTITY.
Version equality also does not imply semantic continuity.

## 3. Compatibility instead of equality
Candidate ProofCompatible(C1,C2,Claim) classes:
C0 INCOMPATIBLE
C1 FENCE-COMPATIBLE
C2 SEMANTICALLY-COMPATIBLE
C3 PROOF-CONTINUOUS
C4 UNKNOWN.
C4 cannot support strong reuse without a separate safe-under-uncertainty argument.

## 4. Proof invalidation
Candidate lifecycle:
GENERATED -> CONTEXT_BOUND -> VERIFIED -> CURRENT -> INVALIDATED -> REVALIDATING -> CURRENT.
Invalidation preserves historical provenance; it does not erase the old proof.

Invalidate affected proof contexts after:
model/specification changes; claim/invariant changes; policy changes; dependency changes; effect-path or boundary changes; abstraction changes; assumption changes; environment changes; resource replacement; continuity changes; recovery; relevant STOP changes; toolchain/backend semantic changes; refinement changes; evidence freshness expiry.

Transitive propagation:
CHANGE -> IMPACTED_CONTEXTS -> INVALIDATE -> REVALIDATE -> REPUBLISH.

## 5. Reproducibility layers
Candidate architectural levels:
R0 unavailable
R1 source/build inputs recorded
R2 repeatable execution
R3 independently reproduced result
R4 independently reproduced result under materially independent trust assumptions.
These are Nexo research categories, not SLSA levels.
REPRODUCIBLE_PROOF != CORRECT_PROOF.
PROVENANCE != PROOF.

## 6. Finite model identity
MODEL_FILE_HASH != MODEL_INSTANCE_ID.
Constants, bounds, symmetry sets, environment parameters and model configuration define what was actually checked.
A successful finite check is bounded by that configured model and assumptions; it does not automatically prove arbitrary scale or implementation correctness.

## 7. Refinement
Implementation assurance requires a refinement context binding abstract specification, concrete specification, mapping, preserved invariants, environment assumptions and proof obligations.
OLD_PROOF cannot silently authorize a new implementation context.

## 8. Multi-version and rollback
Old and new models may coexist during migration. Any continuation requires explicit compatibility.
Rollback can restore historical artifacts or proof data but must not restore historical authority or currentness.
AUTHENTIC_SNAPSHOT != CURRENT_PROOF_CONTEXT.
OLD_PROOF_RESTORED != CURRENT_PROOF_RESTORED.

## 9. Proof status
Candidate statuses:
UNKNOWN, GENERATED, CHECKED, VERIFIED_FOR_CONTEXT, CURRENT, STALE, INVALID, CONFLICTING, SUPERSEDED, REQUIRES_RECHECK.
These are assurance states, not confidence scores.

## 10. Freshness
Freshness is claim- and context-specific.
CURRENTNESS != AGE.
A recent proof can already be invalid after a policy/dependency change; an old proof can remain applicable if no relevant context changed and compatibility is established.

## 11. Proof conflicts
If proof results disagree, do not average, vote or automatically select the newest.
Classify model, assumption, abstraction, backend or genuine semantic disagreement. Until resolved, the affected claim may remain CONFLICTING or UNKNOWN.

## 12. Independence
Different tools can share the same model generator, assumptions, formalization or trust root.
TOOL_DIVERSITY != PROOF_INDEPENDENCE.
Independent reproduction is meaningful only when relevant trust and input dependencies are materially independent. citeturn0search7

## 13. Candidate invariants INV-PCTX-01..38
01 Proof is context-bound.
02 Authentic proof is not automatically current proof.
03 Content identity does not imply context identity.
04 Version equality does not imply semantic continuity.
05 Compatibility is claim-specific.
06 Unknown compatibility blocks strong reuse.
07 Model configuration is part of proof identity.
08 Finite model success is bounded by model scope.
09 Toolchain identity is part of proof context.
10 Backend changes can require recheck.
11 Abstraction changes can invalidate proof.
12 Assumption changes can invalidate proof.
13 Dependency changes propagate invalidation.
14 Policy/invariant changes propagate invalidation.
15 Resource incarnation changes invalidate affected proofs.
16 Boundary generation changes invalidate affected proofs.
17 Recovery can invalidate incompatible proof contexts.
18 STOP can invalidate relevant proof assumptions.
19 Proof caches require context validation.
20 Historical PASS remains historical after invalidation.
21 Invalidation must not erase provenance.
22 Supersession does not rewrite history.
23 Proof conflict is not resolved by recency.
24 Proof conflict is not resolved by voting.
25 Reproducibility is not correctness.
26 Provenance is not proof.
27 Independent reproduction requires meaningful independence.
28 Snapshot authenticity is not currentness.
29 Rollback cannot restore historical authority.
30 Proof generation must be continuity-aware.
31 Freshness is claim-specific.
32 Wall-clock age alone does not establish currentness.
33 Recheck policy is context-bound.
34 Refinement context is part of implementation assurance.
35 Multi-version coexistence requires explicit compatibility.
36 Old proof cannot silently authorize new context.
37 Proof result must expose assumptions and limitations.
38 Strong claim cannot exceed current ProofContext closure.

## Architectural result
Nexo now needs a dedicated proof lifecycle and identity layer:
PROOF_GENERATION -> CONTEXT_BINDING -> VERIFICATION -> CURRENTNESS -> INVALIDATION -> REVALIDATION/SUPERSESSION.
Proof identity should be semantic/contextual, not merely a file hash.

## Open gaps
G-PCTX-01 formal ProofContext schema.
G-PCTX-02 compatibility relation formalization.
G-PCTX-03 proof-context fingerprint canonicalization.
G-PCTX-04 transitive invalidation algorithm.
G-PCTX-05 continuity anchor for proof generations.
G-PCTX-06 toolchain semantic compatibility.
G-PCTX-07 multi-version formal-model coexistence.
G-PCTX-08 refinement-context verification.
G-PCTX-09 independent reproduction criteria.
G-PCTX-10 actual SANY/TLC/TLAPS execution.
G-PCTX-11 implementation refinement.
G-PCTX-12 fault-injection of proof invalidation.
G-PCTX-13 long-duration proof lifecycle tests.

## Conclusion
NO CURRENT CLAIM FROM HISTORICAL PROOF WITHOUT CURRENT PROOF-CONTEXT COMPATIBILITY.
PROOF FRESHNESS = CONTEXT CURRENTNESS, NOT TIMESTAMP AGE.
This is a research/design result, not a verified theorem.

## Next attack
PROOF-CONTEXT FINGERPRINT COLLISION/OMISSION + DEPENDENCY CLOSURE + SEMANTIC EQUIVALENCE.
Question: can two contexts receive the same apparent fingerprint while differing in a safety-relevant dependency, or receive different fingerprints despite being semantically equivalent, and how should Nexo distinguish unsafe collision from harmless syntactic drift?