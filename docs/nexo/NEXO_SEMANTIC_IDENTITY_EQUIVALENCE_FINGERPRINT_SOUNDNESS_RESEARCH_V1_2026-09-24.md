# NEXO - SEMANTIC IDENTITY / EQUIVALENCE / FINGERPRINT SOUNDNESS - 2026-09-24
Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
How should Nexo distinguish unsafe proof-context collisions from harmless syntactic differences, while ensuring that dependency omissions cannot make two semantically different contexts appear equivalent?

## External cross-check
TLA+ refinement is semantic: an implementation refines an abstract specification when its behaviors are permitted by the abstract specification; the specifications need not have identical syntax or variables. citeturn0search0turn0search32
SLSA provenance binds verification to a concrete subject digest and records resolved dependencies; its model explicitly treats dependencies as part of the provenance context. citeturn0search1turn0search4

## Core result
Three different relations must not be collapsed:
`SYNTACTIC_EQUALITY`
`CONTEXT_IDENTITY`
`SEMANTIC_EQUIVALENCE`.
They answer different questions.

`SAME_BYTES != SAME_CONTEXT`
`DIFFERENT_BYTES != DIFFERENT_SEMANTICS`
`SAME_DIGEST != SAME_AUTHORITY`
`SEMANTICALLY_EQUIVALENT != AUTHORIZED_TO_CONTINUE`.

## 1. Three identities
Candidate identity layers:
1. ContentIdentity - exact artifact/content identity.
2. ContextIdentity - all safety-relevant context needed to interpret the artifact.
3. SemanticIdentity - the behavior/property relation relevant to a particular claim.
A fourth layer remains separate:
4. AuthorityIdentity - whether the current actor/context may act now.

Therefore the chain is:
`CONTENT -> CONTEXT -> SEMANTIC CLAIM -> AUTHORITY`
and no arrow is automatic.

## 2. Fingerprint collision versus omission
A cryptographic digest can detect accidental content collision under its assumptions, but it cannot detect a dependency that was never included in the input set.
Thus the dangerous failure is often not:
`HASH_COLLISION`
but:
`CLOSURE_OMISSION`.
If dependency D is omitted from the fingerprint, two contexts can have identical apparent fingerprints while differing in D.

## 3. Closure-complete fingerprint
Candidate `ContextFingerprint` must include a dependency-closure commitment, not merely direct files.
Conceptually:
`FP = H(canonicalized semantic inputs + transitive dependency closure + environment assumptions + external contracts + resource incarnations + proof configuration)`.
This is an architectural formula, not a finalized cryptographic scheme.

## 4. Dependency closure is part of identity
SLSA's provenance model records resolved dependencies and supports recursive dependency analysis; this reinforces that a build/proof subject cannot be understood solely by its top-level artifact digest. citeturn0search1turn0search4
For Nexo, the same principle must extend to formal proof dependencies.

## 5. Semantic equivalence is claim-relative
Two contexts can be equivalent for claim M but not for claim N.
Candidate:
`Equivalent(C1,C2,M)`.
Not:
`Equivalent(C1,C2)` globally.
Example: two implementations may be equivalent for authorization safety but differ in performance or recovery behavior. If recovery is outside M, that difference may be irrelevant; if M includes recovery safety, it becomes relevant.

## 6. Projection before equivalence
To establish claim-specific equivalence, define a projection:
`Projection_M(State,Context)`.
Then compare only the state/behavior dimensions relevant to M, while proving projection completeness.
This connects directly to the previous commutativity and abstraction research.

## 7. Behavior equivalence versus state equality
Two systems may use different internal states and still implement the same abstract behavior. TLA+ refinement explicitly permits this: semantic behavior matters, not syntactic identity. citeturn0search0turn0search3
Therefore byte-level equality is too strict for semantic reuse.

## 8. But semantic equivalence is harder
Showing two arbitrary concurrent systems equivalent can require reasoning about all relevant behaviors, traces, state mappings and environment assumptions.
Nexo must not replace this difficult proof with a heuristic hash.
Candidate status:
`EQUIVALENCE_PROVEN`
`EQUIVALENCE_BOUNDED`
`EQUIVALENCE_UNKNOWN`
`EQUIVALENCE_REFUTED`.

## 9. Refinement is directional
If C refines A, this establishes a relationship from concrete behavior to abstract allowed behavior. It does not automatically establish bidirectional equivalence.
Therefore:
`REFINEMENT != EQUIVALENCE`.
Two contexts may both refine a common abstraction without being fully equivalent for every property.

## 10. Safety-equivalence
For safety claims, full trace equivalence may be unnecessarily strong.
Candidate `SafetyEquivalent(C1,C2,M)` means every behavior difference irrelevant to M is safely abstracted, while every behavior capable of changing M is preserved.
This is claim-specific and must be backed by a proof/refinement relation.

## 11. Authority continuity remains separate
Even if:
`SafetyEquivalent(C1,C2,M) = TRUE`
it does not follow that authority from C1 transfers to C2.
Context migration still needs current authority, fence generation, policy, continuity and resource-incarnation validation.

## 12. Semantic drift
A dependency can preserve the same top-level API while changing safety semantics.
Examples include:
timeout semantics
retry behavior
ACK meaning
queue ordering
resource incarnation rules
cancellation behavior
authorization defaults
failure behavior.
Therefore API compatibility is not semantic compatibility.

## 13. External contract identity
Effect protocols must be part of proof context when claims depend on them.
Candidate `ExternalContractIdentity` includes:
provider identity
effect class
ACK semantics
idempotency contract
retry/redrive semantics
history/query semantics
cancellation/fencing
resource replacement semantics
retention/proof boundary.

## 14. Environment identity
Environment assumptions need explicit identity.
Candidate `EnvironmentContext` includes:
boundary set
provider set
trust roots
network/control-plane assumptions
clock/time assumptions
resource set
failure-domain assumptions
open-world/closed-world mode.

## 15. Omitted dependency attack
Attack:
C1 fingerprint includes A,B.
C2 fingerprint includes A,B.
D changes between them.
D was never in the closure.
FP(C1) == FP(C2), but semantic safety differs.
Therefore a fingerprint can be collision-free yet still unsound because its input closure was incomplete.
Strong rule:
`FINGERPRINT_SOUNDNESS REQUIRES CLOSURE_SOUNDNESS`.

## 16. Over-approximate closure
An over-approximate dependency closure can include extra dependencies. This may cause unnecessary invalidation but is safer than underapproximating a safety-relevant dependency.
`UNDERAPPROX_CLOSURE -> POSSIBLE_FALSE_CURRENT`.
`OVERAPPROX_CLOSURE -> POSSIBLE_FALSE_STALE`.
Safety prefers the second failure mode.

## 17. Canonicalization
Equivalent structured contexts need deterministic canonical representation before hashing.
Canonicalization must define ordering, normalization, omitted/default fields, encoding and schema version.
Otherwise harmless serialization differences create needless context changes.

## 18. Schema version
Fingerprint schemas themselves need version identity.
`FP_SCHEMA_V1 != FP_SCHEMA_V2` unless compatibility is explicitly proven.
A verifier must know how to interpret the fingerprint.

## 19. Unknown fields
If a verifier encounters an unknown safety-relevant fingerprint field, it cannot simply ignore it.
Candidate behavior:
KNOWN_IRRELEVANT -> ignore under contract.
UNKNOWN_POSSIBLY_RELEVANT -> UNKNOWN/REVALIDATE.

## 20. Equivalence proof object
Candidate `SemanticEquivalenceClaim`:
equivalence_id
claim_scope
context_A
context_B
projection
refinement mappings
environment assumptions
dependency closure
interaction closure
allowed behavior differences
excluded differences
proof obligations
verification method
freshness
invalidation triggers.

## 21. Context migration
A migration can establish:
`C1 --compatible_migration--> C2`
without claiming C1 == C2.
This is safer than treating migration as identity preservation.

## 22. Version graph
Candidate context graph:
`C0 -> C1 -> C2`
with edges labeled:
`EQUIVALENT`
`REFINES`
`MIGRATES`
`INCOMPATIBLE`
`UNKNOWN`.
Authority never follows an edge automatically.

## 23. Proof reuse rule
Candidate:
`REUSE_PROOF(P,C2,M)` only if:
current proof context closure is complete;
semantic compatibility/equivalence or valid refinement is proven;
all assumptions remain valid;
no invalidation trigger fired;
resource/boundary incarnations remain compatible;
proof obligations cover C2;
current authority is separately established.
Otherwise RECHECK/HOLD.

## 24. Counterexample to naive equivalence
Two implementations can both satisfy an abstract safety invariant while differing in recovery behavior. If recovery is later added to the claim, the previous equivalence may no longer hold.
This demonstrates why equivalence must be claim-versioned.

## 25. Equality hierarchy
Candidate hierarchy:
`BYTE_EQUAL`
⊂ `CONTENT_EQUAL`
⊂ `CONTEXT_EQUAL`
⊂ `SEMANTICALLY_EQUIVALENT_FOR_CLAIM`
These are not simple nested sets in every implementation; they are distinct relations with different proof obligations.

## 26. Candidate invariants INV-SEI-01..34
01 Content identity does not imply context identity.
02 Different content does not imply semantic difference.
03 Context identity requires safety-relevant closure.
04 Fingerprint soundness depends on closure soundness.
05 Omitted dependencies cannot be treated as absent.
06 Unknown relevant fields block strong equivalence.
07 Overapproximate closure is safer than underapproximate closure for safety freshness.
08 Semantic equivalence is claim-specific.
09 Refinement is directional.
10 Refinement is not equivalence.
11 Safety equivalence must preserve claim-relevant behavior.
12 Projection completeness is required.
13 API compatibility is not semantic compatibility.
14 External effect contracts are proof-context dependencies.
15 Environment assumptions are proof-context dependencies.
16 Resource incarnation is context identity where relevant.
17 Boundary generation is context identity where relevant.
18 Canonicalization is deterministic.
19 Fingerprint schema version is explicit.
20 Unknown schema semantics block strong reuse.
21 Migration is not identity preservation.
22 Semantic compatibility does not transfer authority.
23 Proof reuse requires current context.
24 Historical proof remains historical after context change.
25 Equivalent contexts may have different internal state.
26 Different contexts may be equivalent for one claim and not another.
27 Proof reuse requires obligation coverage.
28 Proof conflict is not resolved by hash equality.
29 Cryptographic collision resistance does not repair closure omission.
30 Dependency closure must be transitive where relevant.
31 Environment closure must include relevant open-world assumptions.
32 Semantic equivalence claims are themselves versioned/context-bound.
33 Equivalence invalidates on relevant semantic drift.
34 Strong claim cannot exceed proven semantic/context equivalence.

## Architectural result
Nexo now needs two separate mechanisms:
1. `ContextFingerprint` for efficient identity/change detection.
2. `SemanticEquivalenceClaim` for justified reuse across different contexts.
The fingerprint answers: `DID THE REPRESENTED CONTEXT CHANGE?`
The equivalence claim answers: `IF IT CHANGED, DOES THE OLD ASSURANCE STILL APPLY TO THIS CLAIM?`
Neither mechanism grants authority.

## Open gaps
G-SEI-01 formal closure-soundness definition.
G-SEI-02 canonical context schema.
G-SEI-03 semantic fingerprint construction.
G-SEI-04 claim-specific projection completeness.
G-SEI-05 refinement/equivalence formalization.
G-SEI-06 external-contract semantic identity.
G-SEI-07 environment-context identity.
G-SEI-08 unknown-field handling.
G-SEI-09 migration compatibility proof.
G-SEI-10 equivalence invalidation propagation.
G-SEI-11 actual SANY/TLC/TLAPS.
G-SEI-12 implementation refinement.
G-SEI-13 fault-injection validation.

## Conclusion
The safest distinction is:
`FINGERPRINT = CHANGE DETECTION`
`EQUIVALENCE PROOF = JUSTIFIED REUSE`
`AUTHORITY = CURRENT PERMISSION`.
Do not make one mechanism impersonate another.

## Next attack
SEMANTIC EQUIVALENCE + NON-MONOTONIC POLICY CHANGES + REFINEMENT ACROSS ROLLBACK/MIGRATION + EXTERNAL EFFECT CONTRACT DRIFT.
Question: can an old proof remain semantically valid for the invariant while becoming unsafe because policy or external-effect semantics changed, and how must Nexo separate invariant preservation from operational admissibility?