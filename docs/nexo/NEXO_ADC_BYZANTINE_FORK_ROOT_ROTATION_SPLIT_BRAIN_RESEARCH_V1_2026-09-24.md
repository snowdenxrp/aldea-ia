# NEXO — Assurance Dependency Closure Under Byzantine Forks, Root Rotation and Split Brain V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Stress ADC when Byzantine witnesses, forked roots, concurrent root rotations, partitions, and later merges occur simultaneously.

## 2. New finding
ADC cannot be represented safely as a static dependency list.

It is a versioned, claim-scoped, causally ordered support structure.

Therefore:
`ADC_AT_T0 != ADC_AT_T1`
unless explicit compatibility is established.

## 3. Byzantine equivocation creates multiple histories
A witness W can produce:
W -> claim A
W -> incompatible claim B

Both can be cryptographically valid.

Therefore:
`VALID_SIGNATURE(A) + VALID_SIGNATURE(B) != COMPATIBLE_HISTORY`.

The system must retain equivocation evidence and prevent one branch from using the other's evidence as if they shared a single honest history.

## 4. Witness identity vs witness behavior
Separate:
- WitnessIdentity
- WitnessMembership
- WitnessTrust
- WitnessBehavior
- WitnessEvidence.

A valid member can behave Byzantine.
A removed member can have historically authentic evidence.
A newly admitted member is not automatically trusted for historical claims.

## 5. Equivocation record
Candidate `EquivocationRecord`:
witness_id
membership_generation
key_generation
branch_a
branch_b
conflicting_claim_scope
ordering_context
evidence_a
evidence_b
detection_context
root_context
revocation/cutoff status
resolution state.

Resolution states:
DETECTED
CONFIRMED
DISPUTED
CONTAINED
INVALIDATED
RESOLVED
UNKNOWN.

Equivocation itself is evidence; it is not automatically proof that every statement from the witness is false. Scope must be claim-specific.

## 6. Branch contexts
Candidate `AssuranceBranchContext`:
branch_id
predecessor_context
root_generation
authority_epoch
assurance_generation
membership_generation
policy/invariant generation
dependency closure
resource incarnations
ordering domain
partition/reconciliation generation
invalidations
support roots.

A branch must never silently inherit currentness from a sibling.

## 7. Fork rule
If A forks into B and C:
`B.current && C.current` may be locally true but globally incompatible.

Therefore a branch currentness claim is local/provisional until an authoritative ordering domain establishes compatibility.

## 8. Root rotation during fork
Suppose:
R0
├─ branch B uses R1
└─ branch C continues R0

Neither branch may simply declare itself globally current.

Required healing:
freeze conflicting admission
identify root generations
identify branch support closure
identify predecessor cutoff
detect common-mode dependencies
establish authoritative order
fence stale branch
invalidate affected descendant assurance
reconcile effects/resources
recompute ADC
recompute currentness
publish successor authority
explicit release.

## 9. Two valid roots, one ordering domain
R1 and R2 can each be cryptographically valid.

If both claim current authority for overlapping protected scope:
`VALID(R1) + VALID(R2) != CURRENT(R1,R2)`.

The SafetyOrderingDomain must establish whether:
- one supersedes the other;
- they are disjoint;
- they can coexist under an explicit composition contract;
- or authority is unresolved.

## 10. Root generations are not authority order
A higher root generation number is useful only if generation advancement itself is protected by the authoritative ordering mechanism.

Therefore:
`ROOT_GENERATION > ROOT_GENERATION`
does not automatically imply
`CURRENT_AUTHORITY).

This preserves the earlier split-brain root-rotation finding.

## 11. Byzantine quorum during fork
A quorum can sign incompatible branches if:
- membership changes are not ordered;
- signers equivocate;
- roles differ;
- transaction context differs;
- keys are reused across protocols;
- common trust roots are compromised.

Therefore a quorum certificate needs explicit:
target
property
membership generation
signer set
role binding
key generation
transaction/causal context
ordering domain
root generation
revocation state
dependency closure
composition contract.

## 12. Quorum intersection
Even if two quorums intersect in a member, that does not by itself prove safety if the member can equivocate or if membership/trust semantics changed.

Intersection is useful only under an explicit trust/behavior contract.

Thus:
`QUORUM_INTERSECTION != BYZANTINE_SAFETY`
without assumptions about membership, quorum rules, and fault bounds.

## 13. Dynamic membership
Adding/removing a witness changes the assurance context.

Membership transition must be protected.

A new witness cannot retroactively strengthen old claims unless the composition contract explicitly permits it and the historical context supports it.

A removed witness's historical evidence may remain attributable while becoming unusable for current assurance.

## 14. Root rotation and membership transition race
Dangerous sequence:
T0 R0/M0
T1 membership changes to M1
T2 R0 cutoff
T3 branch A sees R1/M1
T4 branch B sees R1/M0
T5 both issue certificates.

Neither certificate can be treated as globally current without an authoritative order over the transitions.

This means root generation and membership generation are separate dimensions.

## 15. Policy transition race
Similarly:
P0 → P1

An assurance generated under P0 cannot automatically authorize an effect requiring P1 semantics.

If P1 is stricter, the old assurance may be insufficient even if the old claim remains historically true.

Policy generation belongs in ADC.

## 16. Common-mode Byzantine attack
An attacker compromises one shared dependency D:
A witness service, KMS, IdP, update channel, policy source, or coordination store.

Multiple apparently independent roots then produce consistent but correlated false assurance.

ADC must include D as a shared dependency.

If D is unknown/compromised, composite assurance is reduced or blocked according to the claim contract.

## 17. Independence vector
Candidate `RootIndependenceVector`:
failure_domain_independence
trust_root_independence
ordering_independence
policy_independence
artifact/toolchain independence
data independence
operator independence
observability independence
recovery independence
resource independence
network independence
clock dependence
model/provider dependence.

Independence is a vector, not a boolean.

## 18. Claim-specific independence
A dependency can be irrelevant to one claim and critical to another.

Example:
A shared clock may be irrelevant to a simple identity claim but critical to a temporal ordering claim.

Therefore:
`INDEPENDENT_FOR_CLAIM_A != INDEPENDENT_FOR_CLAIM_B`.

## 19. Byzantine root
A root can be cryptographically authentic and behaviorally compromised.

Therefore:
`ROOT_SIGNATURE_VALID != ROOT_BEHAVIOR_TRUSTED`.

A compromise requires cutoff and descendant invalidation for affected claims, not merely a new certificate.

## 20. Historical vs current root
A root certificate can remain historically valid after root compromise/cutoff.

Therefore:
`HISTORICALLY_AUTHENTIC(R0) != CURRENT_TRUST(R0)`.

ADC must bind support to trust intervals/generations.

## 21. Merge certificate
Candidate `AssuranceBranchMergeCertificate`:
branch_a
branch_b
common_predecessor
ordering_context
root generations
membership generations
policy/invariant generations
dependency closure
equivocation records
conflict set
semantic compatibility
merge operator
scope
invalidation set
result generation
verification method.

No merge without explicit compatibility.

## 22. Merge cannot erase conflicts
A merge must retain unresolved conflict information.

`MERGE != CONFLICT_ERASURE`.

If conflict remains relevant:
MERGED_CLAIM = UNKNOWN/CONFLICTED/HOLD.

A merge that merely chooses one branch without recording why it supersedes the other is not sufficient for high-assurance currentness.

## 23. Split-brain healing
Candidate sequence:
1. Freeze overlapping admission.
2. Stop new authority derivation.
3. Capture branch/root/membership contexts.
4. Build joint ADC.
5. Detect common-mode dependencies.
6. Establish SafetyOrderingDomain order.
7. Fence stale branch/effects.
8. Invalidate stale assurance.
9. Reconcile external effects.
10. Recompute closure and assurance.
11. Publish only one compatible current context or explicitly disjoint contexts.
12. Release explicitly.

## 24. Recovery cannot choose its favorite branch
A recovery process must not decide:
"I see branch A, therefore A is current."

It needs an ordering basis independent of the disputed branch.

Otherwise recovery becomes an authority amplifier.

## 25. Emergency human path
Human emergency recovery can resolve a bounded safety problem only within its predefined envelope.

If the human mechanism is used to decide its own constitutional authority, the same self-supporting cycle returns.

Therefore:
`EMERGENCY_RECOVERY_AUTHORITY`
must be subordinate to a pre-existing constitutional contract.

## 26. Formal model implication
The future model needs explicit branch and root variables plus adversarial actions:
- equivocate;
- fork;
- rotate root;
- change membership;
- change policy;
- partition;
- heal;
- compromise shared dependency;
- submit conflicting merge;
- restore stale snapshot;
- publish stale certificate.

Safety properties should forbid incompatible current authority from being simultaneously published for overlapping scope unless an explicit composition contract proves compatibility.

TLC is designed to check safety and liveness of executable finite-state TLA+ models, while Lamport notes that model checking provides confidence over the modeled instances rather than replacing proof or covering arbitrary real-world systems. citeturn0search2turn0search3turn0search25

## 27. Candidate invariants
BF-01 BYZANTINE_EQUIVOCATION_MUST_BE_EXPLICITLY_REPRESENTED
BF-02 VALID_SIGNED_BRANCHES_CANNOT_BE_ASSUMED_COMPATIBLE
BF-03 BRANCH_CURRENTNESS_DOES_NOT_IMPLY_GLOBAL_CURRENTNESS
BF-04 ROOT_GENERATION_DOES_NOT_BY_ITSELF_ESTABLISH_GLOBAL_ORDER
BF-05 ROOT_ROTATION_AND_MEMBERSHIP_CHANGE_REQUIRE_ORDERED_COMPOSITION
BF-06 QUORUM_INTERSECTION_REQUIRES_EXPLICIT_BEHAVIOR/TRUST ASSUMPTIONS
BF-07 DYNAMIC_MEMBERSHIP_IS_A_PROTECTED_ASSURANCE_CONTEXT_CHANGE
BF-08 REMOVED_WITNESS_EVIDENCE_MAY_REMAIN_HISTORICAL_BUT_NOT_CURRENT
BF-09 SHARED_COMPROMISED_DEPENDENCY_INVALIDATES_INDEPENDENCE_ASSUMPTIONS
BF-10 INDEPENDENCE_IS_CLAIM_SPECIFIC
BF-11 ROOT_SIGNATURE_VALIDITY_DOES_NOT_ESTABLISH_CURRENT_ROOT_TRUST
BF-12 ROOT_CUTOFF_PROPAGATES_TO_AFFECTED_ADC
BF-13 MERGE_MUST_PRESERVE_RELEVANT_CONFLICTS
BF-14 UNRESOLVED_RELEVANT_CONFLICT_FORCES_UNKNOWN/QUARANTINE
BF-15 RECOVERY_CANNOT_SELF_SELECT_CURRENT_BRANCH
BF-16 EMERGENCY_RECOVERY_CANNOT_REDEFINE_ITS_CONSTITUTIONAL_BOUNDARY
BF-17 CURRENT_AUTHORITY_REQUIRES_ORDERED_CURRENT_ADC
BF-18 CURRENTNESS_CANNOT_BE_DERIVED_FROM_UNORDERED_SUCCESSOR_CLAIMS
BF-19 POLICY/MEMBERSHIP/ROOT GENERATIONS ARE DISTINCT CONTEXT DIMENSIONS
BF-20 ADC_SCOPE_MUST_COVER_SHARED_DEPENDENCIES_OF_COMPOSED_ASSURANCE

## 28. Synthesis
The architecture now needs an explicit concept of:
`ORDERED CURRENT ADC`.

Not simply:
`ADC exists`.

The protected question becomes:
"Is this assurance dependency closure the current, ordered, non-circular closure for this exact claim and scope?"

That is stronger than asking whether the certificate is valid.

## 29. Open gaps
BF-G1 Formal Byzantine ADC semantics.
BF-G2 Rooted-cycle theorem under Byzantine behavior.
BF-G3 Quorum intersection with dynamic membership.
BF-G4 Root rotation + membership + policy simultaneous ordering.
BF-G5 Efficient joint ADC during split-brain healing.
BF-G6 Formal merge non-amplification.
BF-G7 Human emergency ordering root independence.
BF-G8 Compaction preserving equivocation and branch provenance.
BF-G9 Implementation refinement for branch/root discovery.
BF-G10 SANY/TLC/TLAPS validation.

## 30. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.