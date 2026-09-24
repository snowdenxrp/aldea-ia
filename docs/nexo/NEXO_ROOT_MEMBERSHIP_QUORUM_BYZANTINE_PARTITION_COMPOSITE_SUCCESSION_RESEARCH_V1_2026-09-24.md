# NEXO — Root Rotation + Membership Rotation + Quorum + Byzantine Partition Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Attack the simultaneous transition where trust root, ordering root, membership, quorum, and authority are changing while branches are partitioned and some members may be Byzantine.

## 2. Central finding
The transition context itself is a protected object.

`ROOT_VALID + MEMBERSHIP_VALID + QUORUM_VALID != SUCCESSION_AUTHORIZED`.

A quorum certificate is only meaningful relative to the exact membership generation, root/order context, target transition, causal context, and composition contract that produced it.

## 3. New object: SuccessionTransitionContext
Candidate fields:
- transition_id
- predecessor_root
- successor_candidate
- predecessor_cutoff
- constitutional_generation
- ordering_generation
- membership_generation
- key_generation
- quorum_contract
- signer set and roles
- signer behavior/equivocation state
- trust/failure-domain closure
- common-mode dependencies
- partition context
- branch context
- policy/invariant generation
- dependency closure
- effect/enforcement closure where applicable
- invalidations
- predecessor/successor continuity context
- publication state.

## 4. Five dimensions must not collapse
A succession event has at least:
1. constitutional validity;
2. ordering validity;
3. membership validity;
4. quorum/composition validity;
5. enforcement/currentness.

Each can be valid or unknown independently.

Therefore:
`VALID_EACH_COMPONENT != VALID_COMPOSITE_TRANSITION`.

## 5. Atomic transition boundary
Safe conceptual sequence:
FREEZE conflicting transitions
→ capture exact contexts
→ validate predecessor/current state
→ validate candidate successor
→ validate membership generation
→ validate quorum contract
→ evaluate Byzantine/common-mode closure
→ establish authoritative ordering
→ cut off predecessor
→ invalidate/fence stale descendants
→ activate successor
→ verify enforcement
→ recompute ADC/currentness
→ reconcile
→ publish
→ explicit release.

No component should be treated as current before the protected transition reaches its publication boundary.

## 6. Mixed-generation attack
Example:
- root R1;
- membership M2;
- ordering O3;
- quorum certificate generated under M1/O2.

Every individual artifact may be valid historically.

The bundle is mixed-generation and cannot automatically establish current succession.

`INDIVIDUAL_VALIDITY != BUNDLE_COHERENCE`.

## 7. Quorum certificate replay
An old quorum certificate for succession T may be replayed against:
- a new root;
- a new membership;
- a new policy;
- a new ordering domain;
- a new resource/effect scope.

Target, generation, semantic context, ordering domain, and invalidation must be bound to prevent replay across contexts.

## 8. Signer-set substitution
Certificate says threshold k of members approved.

Attacker substitutes a different signer set that also meets k.

Therefore signer identities, roles, membership generation, distinctness, and intended composition must be part of the certificate.

`THRESHOLD_COUNT != SIGNER_SET_IDENTITY`.

## 9. Byzantine equivocation during membership rotation
W signs:
M0→M1 on branch A.
M0→M2 on branch B.

If M1 or M2 later includes W and uses W's participation to strengthen its own membership proof, the system risks circular or self-reinforcing membership.

Equivocation must propagate into membership trust and succession currentness.

## 10. Membership cannot retroactively strengthen history
A newly admitted member under M1 cannot automatically make an old M0 historical claim stronger.

`NEW_MEMBER != RETROACTIVE_ASSURANCE`.

Historical claims remain bound to their original membership context unless an explicit compatibility/composition contract says otherwise.

## 11. Root rotation during membership transition
R0/M0 → R1/M1 is one protected composition, not two independent local changes.

If root cutoff occurs before membership transition, the successor must be evaluated under the resulting trust context.

If membership changes first, the transition must specify whether M1 remains valid under R0 cutoff and under what succession authority.

Unknown interleavings must not be silently linearized after the fact.

## 12. Ordering ambiguity
Suppose branch A records:
R0 cutoff → M1 → R1.

Branch B records:
M1 → R0 cutoff → R2.

These histories can have different security meaning.

A merge cannot simply sort events by timestamps. It needs an authoritative ordering contract.

## 13. Quorum contract transition
Changing the quorum rule itself is a protected transition.

Example:
Q0 = 3-of-5.
Q1 = 4-of-7.

A certificate under Q0 cannot automatically satisfy Q1.

The quorum policy/version and membership generation must be bound.

## 14. Quorum downgrade
Danger:
A partition cannot satisfy Q1, so a branch silently switches to Q0.

That is authority amplification if Q0 is weaker.

Therefore:
`FAILURE_TO_MEET_CURRENT_QUORUM != PERMISSION_TO_USE_WEAKER_QUORUM`.

A degraded quorum must be explicitly pre-authorized by constitutional policy and bounded to a weaker scope.

## 15. Quorum upgrade
Conversely, obtaining more signatures does not automatically prove stronger authority if:
- signers share a compromised root;
- signers are from the same failure domain;
- signer behavior is Byzantine;
- contexts differ.

`MORE_SIGNERS != MORE_INDEPENDENT_AUTHORITY`.

## 16. Split membership views
During partition:
A sees M1.
B sees M2.

Both may be internally consistent.

Until membership ordering is resolved:
`GLOBAL_MEMBERSHIP = UNKNOWN`.

No new constitutional authority should be derived from the ambiguous global membership.

## 17. Common-mode attack
Five independent-looking quorum members all depend on:
- one identity root;
- one update artifact;
- one coordination store;
- one operator;
- one clock;
- one policy source.

An attacker compromises the common dependency and obtains apparently independent votes.

Therefore quorum assurance requires failure-domain/dependency closure, not only cardinality.

## 18. Byzantine signer behavior
A signer can sign:
- contradictory transitions;
- incompatible membership updates;
- incompatible root rotations.

Valid signatures remain useful as historical evidence, but equivocation changes trust semantics.

Candidate `SignerBehaviorContext`:
- identity;
- membership generation;
- key generation;
- observed branches;
- equivocation;
- cutoff;
- trust status.

## 19. Succession claim lattice
Candidate claim states:
C0 — candidate identified.
C1 — candidate eligible.
C2 — candidate transition ordered.
C3 — predecessor cutoff ordered.
C4 — stale descendants fenced.
C5 — successor enforcement verified.
C6 — current successor published.
C7 — external reconciliation complete where required.

Higher state must not be inferred merely from lower evidence counts.

## 20. Partial success
If:
- successor ordered;
- predecessor cutoff verified;
- but one effect domain cannot be fenced;

then current constitutional succession may be established while the global effect-containment claim remains weaker.

`SUCCESSOR_CURRENT != GLOBAL_EFFECT_CONTAINMENT`.

Claim scope must be explicit.

## 21. Permanent membership/order loss
If no protected mechanism can re-establish unique membership/order:
- stop authority amplification;
- preserve current fences;
- enter bounded safety;
- retain historical evidence;
- permit only explicitly pre-authorized safety actions;
- remain unresolved.

A system must have a safe answer to "we can never re-establish quorum."

## 22. Human emergency path
Human emergency authority can be used for a pre-defined succession operation if the constitutional contract allows it.

But the emergency path must itself specify:
- identity;
- quorum/independence;
- scope;
- expiry;
- audit;
- anti-amplification;
- successor constraints.

Human approval cannot simply become a second constitution.

## 23. Root/member/key generation relationship
Generations must be treated as separate dimensions:
- root generation;
- membership generation;
- key generation;
- ordering generation;
- policy generation;
- invariant generation.

Equal or increasing integers do not imply semantic compatibility.

## 24. Compaction consequence
If historical membership/root/quorum conflicts are compacted, the surviving certificate must preserve the distinctions needed to determine current succession.

A certificate without membership/root/order provenance is not sufficient currentness evidence.

## 25. Recovery consequence
Recovery must reconstruct the complete transition context before releasing authority.

A snapshot containing:
R1 + M2 + quorum certificate

does not prove that R1/M2/quorum were globally ordered together.

Recovery must establish the causal/ordering bridge.

## 26. Formal model implications
Future model should explicitly include:
- root generation;
- membership generation;
- ordering generation;
- quorum rule generation;
- key generation;
- branch contexts;
- Byzantine equivocation;
- common-mode dependencies;
- competing transitions;
- protected composition;
- degraded quorum;
- permanent quorum loss;
- human emergency path;
- compaction/restore.

Candidate invariants:
SRM-01 NO_MIXED_GENERATION_SUCCESSION
SRM-02 QUORUM_CERTIFICATE_IS_CONTEXT_BOUND
SRM-03 MEMBERSHIP_TRANSITION_IS_ORDERED
SRM-04 ROOT_AND_MEMBERSHIP_TRANSITION_CANNOT_SELF_AUTHORIZE
SRM-05 QUORUM_DOWNGRADE_REQUIRES_EXPLICIT_AUTHORIZATION
SRM-06 MORE_SIGNERS_DO_NOT_IMPLY_INDEPENDENCE
SRM-07 BYZANTINE_EQUIVOCATION_PROPAGATES_TO_CURRENTNESS
SRM-08 NEW_MEMBERS_DO_NOT_RETROACTIVELY_STRENGTHEN_HISTORY
SRM-09 UNRESOLVED_GLOBAL_MEMBERSHIP_BLOCKS_NEW_CONSTITUTIONAL_AUTHORITY
SRM-10 SUCCESSOR_CURRENTNESS_DOES_NOT_IMPLY_GLOBAL_EFFECT_CONTAINMENT
SRM-11 RESTORE_CANNOT_CREATE_MISSING_ORDERING_BRIDGES
SRM-12 COMPACTION_MUST_RETAIN_CLAIM-RELEVANT_MEMBERSHIP/ROOT/ORDER PROVENANCE
SRM-13 HUMAN_EMERGENCY_AUTHORITY_CANNOT_AMPLIFY_SCOPE
SRM-14 GENERATION_NUMBERS_DO_NOT_ESTABLISH_SEMANTIC_COMPATIBILITY
SRM-15 CURRENTNESS_REQUIRES_COHERENT_COMPOSITE_CONTEXT.

Lamport's TLA+ material supports modeling such transition boundaries as invariants and using refinement mappings to relate an implementation to an abstract specification; TLC can exhaustively check a finite instantiation, but only within the modeled state space. citeturn0search12turn0search13

## 27. New synthesis
The protected object is not simply a root, quorum, or membership.

It is the complete:
`SUCCESSION_TRANSITION_CONTEXT`.

Current authority requires a coherent tuple:
`(root, ordering, membership, quorum, policy, trust, dependencies, branch, invalidation, enforcement)`.

If the tuple is mixed, unknown, conflicted, or stale:
`NO_CURRENT_SUCCESSOR`
unless an explicit degraded contract defines a weaker safe state.

## 28. Open gaps
SRM-G1 Formal composite succession transition.
SRM-G2 Root+membership+ordering algebra.
SRM-G3 Byzantine quorum behavior.
SRM-G4 Common-mode closure for quorum.
SRM-G5 Degraded quorum safety.
SRM-G6 Permanent quorum-loss semantics.
SRM-G7 Human emergency succession formalization.
SRM-G8 Restore/compaction of composite transition context.
SRM-G9 Refinement to implementation.
SRM-G10 SANY/TLC/TLAPS validation.

## 29. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.