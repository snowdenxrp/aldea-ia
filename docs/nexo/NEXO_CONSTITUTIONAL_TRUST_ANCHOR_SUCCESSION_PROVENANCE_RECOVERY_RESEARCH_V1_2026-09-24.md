# NEXO — Constitutional Trust Anchor Succession Under Provenance/Recovery Attack V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Attack the deepest remaining boundary: the trust anchor itself changes, is compromised, unavailable, split, or restored from stale state while provenance and recovery are being reconstructed.

## 2. Central finding
A trust anchor cannot be validated solely by artifacts whose validity depends on that same anchor.

Core rule:
`ANCHOR_CURRENTNESS CANNOT BE ESTABLISHED SOLELY FROM AN ARTIFACT CHAIN WHOSE SECURITY MEANING DEPENDS ON THE CANDIDATE ANCHOR`.

NIST SP 800-193 describes roots of trust as foundational elements for security-specific functions and notes that their proper functioning is essential; it also treats protection, detection, and recovery as separate resiliency functions. This supports keeping constitutional trust succession separate from ordinary application recovery. citeturn0search24turn0search0

## 3. New object: ConstitutionalTrustContext
Candidate fields:
- constitutional_epoch
- active_anchor_set
- predecessor_anchor_set
- candidate_anchor_set
- anchor generations
- succession transition ID
- protected ordering domain
- root reliance closure
- affected descendant closure
- invalidation cutoff
- emergency/recovery authority envelope
- membership/trust-set context
- dependency/common-mode closure
- branch/fork context
- reconciliation generation
- publication status.

## 4. Anchor states
`HEALTHY → DEGRADED → SUCCESSION_CANDIDATE → SUCCESSION_VALIDATING → SUCCESSION_ORDERED → PREDECESSOR_FENCED → SUCCESSOR_ACTIVE → DESCENDANT_REVALIDATION → RECOVERY_REVALIDATION → RELEASE_ELIGIBLE`.

Additional terminal/problem states:
`UNAVAILABLE`, `COMPROMISED`, `CONFLICTED`, `AUTHORITY_UNRESOLVED`, `QUARANTINED`.

## 5. Candidate successor attack
Suppose old anchor R0 is compromised.

A candidate R1 says:
"R0 is compromised, therefore I am current."

That is insufficient.

R1 is merely a candidate until a protected succession contract establishes:
- why R1 is eligible;
- which root/order authorizes succession;
- what predecessor cutoff occurred;
- which descendants become stale;
- what enforcement/fencing prevents R0-derived authority;
- what trust assumptions remain independent;
- what happens if R0 and R1 both appear current.

## 6. Second-constitution attack
Danger:
R1 defines a new constitution that declares R1 authoritative.

That is circular:
`CANDIDATE_ANCHOR → SELF_DEFINED_RULE → CURRENT_ANCHOR`.

A successor may inherit/implement constitutional rules, but cannot enlarge its own authority merely by rewriting the constitution it uses to justify itself.

## 7. Independent succession basis
Succession needs an external/protected basis appropriate to the threat model.

Candidate support classes:
S0 — predecessor-authorized succession;
S1 — constitutionally pre-authorized successor path;
S2 — independent constitutional quorum under explicit contract;
S3 — protected hardware/platform root;
S4 — bounded human emergency authority;
S5 — external resource/organizational attestation.

No class is universally sufficient. The contract must specify the failure model and independence requirements.

## 8. Human emergency authority
Human emergency authority may protect safety during anchor failure but must not silently become constitutional authority.

`EMERGENCY_SAFETY_AUTHORITY != CONSTITUTIONAL_AUTHORITY`.

It may:
- freeze execution;
- require reconciliation;
- approve a pre-defined succession transition;
- select among constitutionally valid successors.

It may not redefine the safety constitution merely because the normal root is unavailable.

## 9. Root rotation and provenance
When R0 → R1:
1. establish protected cutoff for R0;
2. freeze conflicting authority derivations;
3. identify descendants/reliance closure;
4. invalidate stale support;
5. establish R1 under protected succession;
6. verify enforcement/fencing;
7. recompute ADC/currentness;
8. reconcile external effects;
9. publish R1 currentness;
10. decommission R0 only after required historical residue is retained.

## 10. Root rotation during partition
Partition can create:
- branch A using R0;
- branch B claiming R1.

Neither local reachability nor generation number alone proves global currentness.

`ROOT_GENERATION != GLOBAL_AUTHORITY_ORDER`.

A protected `SafetyOrderingDomain` is required for conflicting succession transitions.

## 11. Two valid successors
If R1 and R2 both have locally valid credentials and no protected ordering establishes one as current:
`AUTHORITY_UNRESOLVED`.

Do not choose by:
- timestamp;
- local majority;
- highest generation;
- fastest response;
- most recent snapshot.

Those are not universally authoritative ordering rules.

## 12. Split-brain healing
Conceptual sequence:
FREEZE overlapping admission
→ capture branch contexts
→ capture support/root closure
→ detect common-mode dependencies
→ establish authoritative order
→ fence stale branch
→ invalidate stale assurance
→ reconcile effects/resources
→ recompute ADC/currentness
→ publish one current context or explicitly disjoint contexts
→ release.

If ordering cannot be established, remain quarantined/degraded.

## 13. Root compromise discovered after compaction
Hard case:
- R0 authorizes compaction;
- raw history is reclaimed;
- R0 is later compromised;
- surviving summary depends on R0.

The summary may remain historical evidence, but cannot automatically support current trust.

Therefore compaction must retain:
- root reliance;
- cutoff context;
- claim scope;
- successor transition;
- invalidation consequences.

## 14. Root compromise discovered during recovery
Recovery must stop before publishing current authority.

Sequence:
RECOVERY_STARTED
→ ROOT_STATUS_CHECK
→ if compromised/unavailable: freeze
→ identify candidate succession
→ establish independent succession basis
→ invalidate root-dependent assurance
→ recompute required provenance/ADC
→ establish successor
→ verify enforcement
→ reconcile
→ explicit release.

Recovery worker cannot promote itself to successor.

## 15. Byzantine anchor behavior
A root may be cryptographically authentic yet behaviorally Byzantine.

Examples:
- signs incompatible succession branches;
- signs contradictory cutoffs;
- signs both R1 and R2;
- equivocates about membership;
- produces inconsistent state to different observers.

Therefore:
`VALID_ROOT_CREDENTIAL != HONEST_ROOT_BEHAVIOR`.

Candidate `AnchorEquivocationRecord`:
- anchor identity;
- generation;
- branch A/B;
- incompatible statements;
- target transition;
- ordering context;
- evidence;
- detection;
- cutoff;
- resolution.

## 16. Root trust versus root authority
Separate:
`ROOT_TRUST`
`CURRENT_AUTHORITY`
`DESCENDANT_CAPABILITY`
`EFFECT_ENFORCEMENT`
`WORLD_EVIDENCE`.

A valid root does not prove that descendants are currently authorized.
Current authority does not prove external effect enforcement.
Enforcement does not prove world history.

## 17. Multi-root succession
Multiple anchors can be used only under an explicit composition contract.

Possible operators:
AND_ROOT
OR_ROOT
INTERSECTION_ROOT
BOUNDED_UNION_ROOT
THRESHOLD_ROOT
SEQUENTIAL_ROOT
ATTENUATED_ROOT.

Operator name alone does not establish its algebraic properties.

A composite root must not use the independence of its own composite as evidence for that independence.

## 18. Root substitution
R1 may claim semantic equivalence to R0.

But:
`SEMANTIC_EQUIVALENCE != AUTHORITY_CONTINUITY`.

Even if R1 preserves all relevant behavior, succession is still a protected authority transition.

## 19. Root dependency closure
Candidate `RootRelianceClosure` must include:
- constitutional rules;
- ordering root;
- identity roots;
- key/trust roots;
- policy/invariant roots;
- dependency closure;
- artifact/toolchain;
- membership;
- observability;
- recovery;
- enforcement;
- external resource assumptions.

If the candidate successor relies on a dependency controlled by the compromised predecessor, that dependency must be treated as part of the compromise closure unless an independent boundary blocks the causal path.

## 20. Recovery root versus mission root
A recovery mechanism may need a separate root to operate when mission authority is unavailable.

But:
`RECOVERY_ROOT != MISSION_ROOT`.

Recovery authority is bounded by the constitutional contract.

It can restore the ability to safely recover; it cannot create arbitrary mission authority.

## 21. Anti-amplification
Succession must not amplify authority.

Candidate property:
`SUCCESSOR_AUTHORITY_SCOPE <= PROTECTED_SUCCESSION_SCOPE`.

If R1 receives only recovery authority, it cannot emerge as unrestricted mission authority.

## 22. Root rotation and delegation
All descendant capabilities issued under R0 must be evaluated against the R0 cutoff.

A capability may remain historically authentic but become stale for current use.

`ROOT_CUTOFF → DESCENDANT_INVALIDATION/FENCING → REVALIDATION`.

The closure must cover queued work, retries, delegated children, callbacks, provider continuations and recovery paths.

## 23. Root rotation and resource incarnation
A resource replacement during root transition creates another continuity boundary.

A current R1 authorization bound to resource incarnation R2 cannot be assumed equivalent to old R0 authorization bound to R1.

Resource identity and authority continuity remain separate.

## 24. Root rotation and external effects
An effect may have committed externally before R0 was cut off.

Therefore root rotation does not erase the historical effect.

It must:
- preserve effect identity;
- classify uncertainty;
- reconcile external state;
- recompute mission invariants;
- determine whether any current authority is needed for compensation/recovery.

## 25. Formal model implications
The future model must represent:
- anchor states;
- root generations;
- successor candidates;
- succession contracts;
- root equivocation;
- partition;
- competing successors;
- protected ordering;
- descendant invalidation;
- compaction;
- recovery;
- human emergency authority;
- root reliance closure.

Candidate invariants:
`NoSelfAuthorizedSuccession`
`NoAuthorityAmplificationOnSuccession`
`CompromisedRootCannotRetainCurrentDescendantAuthority`
`TwoUnorderedSuccessorsImplyAuthorityUnresolved`
`RestoreCannotResurrectOldRootAuthority`
`RootCutoffPropagatesToRequiredDescendantClosure`.

TLA+ is appropriate later for finite-state adversarial exploration of these transitions; Lamport describes invariants as properties that must hold in every state of every modeled behavior, and refinement mappings as the mechanism connecting implementation-level specifications to higher-level specifications. citeturn0search4turn0search25

## 26. Stronger architectural synthesis
The architecture now has a protected succession boundary:

CONSTITUTIONAL TRUST BOUNDARY
→ TRUST ANCHOR
→ SUCCESSION CONTRACT
→ SAFETY ORDERING DOMAIN
→ PREDECESSOR CUTOFF
→ DESCENDANT INVALIDATION/FENCING
→ SUCCESSOR ACTIVE
→ ADC RECOMPUTATION
→ ENFORCEMENT VERIFICATION
→ EXTERNAL RECONCILIATION
→ EXPLICIT RELEASE.

The critical point is that provenance, recovery, and successor validation cannot form a closed self-supporting loop.

## 27. Open gaps
TA-G1 Formal constitutional succession relation.
TA-G2 Minimal independent succession basis per threat model.
TA-G3 Byzantine anchor equivocation formalization.
TA-G4 Root partition/split-brain finite model.
TA-G5 Root rotation + compaction + provenance recovery composition.
TA-G6 Emergency human authority anti-amplification.
TA-G7 Root dependency closure under dynamic discovery.
TA-G8 Hardware/platform root integration boundary.
TA-G9 Formal refinement from succession model to implementation.
TA-G10 SANY/TLC/TLAPS validation.

## 28. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.