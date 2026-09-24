# NEXO CONTRACT TRANSITION AUTHORITY UNDER BYZANTINE PARTITION RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## Research cross-check
TLA+ refinement treats correctness as a relation between an implementation state machine and an abstract state machine: every concrete behavior must correspond to an allowed abstract behavior. This supports modeling trust-contract transition as an explicit abstract transition rather than assuming that a new contract is current because it exists or has a higher generation. citeturn0search0turn0search25
TLC checks invariants over the reachable state graph of a configured finite model; any future Nexo model must therefore make constants, fault assumptions, membership, root transitions, and properties explicit rather than treating a model-check result as an unbounded theorem. citeturn0search1turn0search10
Membership-change protocols commonly require an explicit transition configuration to preserve quorum intersection; this is useful as a design analogy, but it does not establish Byzantine safety for Nexo. citeturn0search11

## 1. New central result
The previous question is answered:

The system cannot safely replace RecoveryTrustContract C1 with C2 merely by having C2 signed, higher-generation, or accepted by a quorum defined by C1.

Therefore a distinct protected primitive is required:

ContractTransitionAuthority (CTA)

CTA is not a new normal mission authority. It is a narrowly scoped constitutional transition mechanism whose only purpose is to order changes to the trust contract itself.

## 2. Constitutional boundary
The architecture now has a possible hierarchy:

AuthorityFoundation
  |
  +-- ContractTransitionAuthority
  |       |
  |       +-- RecoveryTrustContract generation
  |
  +-- RecoveryTrustContract
          |
          +-- RecoveryAuthority

The critical rule is:
RECOVERY AUTHORITY cannot silently redefine the contract that defines recovery authority.

## 3. CTA must not be equivalent to current recovery authority
If C1 authorizes recovery R1, and R1 can directly replace C1 with C2, then:
R1 -> C2 -> R1
can create a self-authorizing cycle.

Therefore CTA must be separately scoped and bound to an external/rooted constitutional authority.

## 4. Contract transition is itself a protected transition
Candidate:
ContractTransition {
  transition_id,
  predecessor_contract,
  successor_contract,
  predecessor_root_generation,
  successor_root_generation,
  predecessor_membership_generation,
  successor_membership_generation,
  transition_scope,
  compatibility_relation,
  quorum/approval requirements,
  failure-domain requirements,
  equivocation evidence,
  ordering_position,
  enforcement requirements,
  activation boundary,
  invalidation boundary,
  rollback semantics,
  recovery semantics,
  dependency closure,
  common-mode fingerprint,
  external root,
  publication state
}

No field may be inferred merely from the successor generation.

## 5. C1 and C2 cannot overlap by default
Danger:
A recognizes C1.
B recognizes C2.
Both remain able to authorize incompatible recovery.

Therefore the transition needs explicit states:
C1_ACTIVE
C2_PREPARED
CONTRACT_TRANSITION_COMMITTED
C1_FENCED
C2_ACTIVE

A safer conceptual sequence:
PREPARE_C2
→ VERIFY_C2
→ ESTABLISH_TRANSITION_ORDER
→ COMMIT_CONTRACT_TRANSITION
→ FENCE_C1
→ VERIFY_FENCE
→ ACTIVATE_C2
→ RECOMPUTE_RECOVERY_AUTHORITY
→ PUBLISH_CURRENT

## 6. The transition must have a single authoritative ordering domain
The transition itself cannot be ordered independently by each side of a partition.

Candidate:
ContractOrderingDomain

It must be able to order at least:
- contract generation change;
- root cutoff/activation;
- membership generation;
- recovery epoch;
- emergency-root activation;
- old-contract fencing;
- new-contract publication.

If no authoritative ordering exists:
CONTRACT_ORDER_UNKNOWN
→ AUTHORITY_UNRESOLVED

## 7. Higher generation is not enough
Explicitly:
C2.generation > C1.generation

does not prove:
C2 is current.

A stale partition can manufacture a higher local generation.

Therefore:
GENERATION_MONOTONICITY != GLOBAL_CURRENTNESS

## 8. Compatibility is claim-specific
C1 and C2 may differ in:
- quorum threshold;
- member set;
- failure-domain requirements;
- root;
- recovery scope;
- fault model;
- emergency path;
- evidence requirements.

A compatibility relation is therefore required:
ContractCompatibility(C1,C2,claim_scope)

Possible outcomes:
COMPATIBLE
COMPATIBLE_WITH_DEGRADED_CLAIM
INCOMPATIBLE
UNKNOWN

UNKNOWN cannot be promoted to compatible by local agreement.

## 9. Root transition interaction
If C2 introduces R2:
C1/R1 -> C2/R2

then root transition and contract transition are not independent operations.

Candidate combined context:
ContractRootTransitionContext {
  contract_generation,
  root_generation,
  membership_generation,
  ordering_position,
  predecessor_context,
  successor_context,
  descendant_invalidation_closure,
  enforcement_status,
  recovery_owner,
  dependency/common-mode closure
}

The combined transition must establish which predecessor authority is cut off before successor authority becomes current.

## 10. Membership transition interaction
Changing M1 -> M2 can alter which quorums satisfy C2.

Therefore membership transition cannot be treated as metadata.

Candidate:
MembershipTransitionContract

It must specify:
- old membership;
- new membership;
- transitional membership/configuration;
- required overlap/intersection;
- failure-domain constraints;
- Byzantine fault model;
- transition ordering;
- activation boundary;
- old-member fencing;
- new-member admission.

## 11. Byzantine equivocation during transition
Attack:
member X signs:
C1->C2
and
C1->C3

Both may contain valid signatures.

Therefore:
SIGNATURE_VALIDITY != TRANSITION_UNIQUENESS

Candidate:
ContractEquivocationRecord

On detected equivocation:
FREEZE_MEMBER
→ INVALIDATE_DEPENDENT_TRANSITION_CERTIFICATES
→ RECOMPUTE_TRANSITION_TRUST
→ CHECK_ORDERING
→ CONTINUE only if contract remains satisfied
otherwise CONTRACT_AUTHORITY_UNRESOLVED

## 12. Emergency root during contract transition
Hard case:
normal CTA unavailable;
emergency root E activates;
E proposes C2.

E cannot automatically redefine its own scope.

Candidate EmergencyContractTransition:
- preauthorized exact contract changes;
- bounded scope;
- independent approval;
- explicit expiry;
- mandatory reconciliation;
- explicit return to constitutional CTA.

If emergency root has no valid transition authority:
CONTRACT_TRANSITION_UNAVAILABLE

not:
EMERGENCY_ROOT_BECOMES_CONSTITUTION

## 13. Rollback is not resurrection
If C2 is activated and later rollback occurs:
RESTORE(C1) != RESTORE(C1_AUTHORITY)

C1 may return as historical artifact only.

To become current again it needs a new protected contract transition with current ordering, root, membership, dependency, and enforcement context.

## 14. Snapshot attack
A snapshot containing:
C1 + valid signatures + old membership
cannot by itself restore C1 as current after C2 was authoritatively committed.

Therefore:
SNAPSHOT_STATE != CURRENT_CONTRACT_AUTHORITY

## 15. Common-mode compromise
CTA, C1, C2, quorum members, update source, and KMS may all share one failure domain.

Therefore CTA itself needs dependency closure.

A separate process or host does not create independence.

## 16. Contract transition evidence
Evidence must be bound to:
- exact transition;
- predecessor;
- successor;
- root generation;
- membership generation;
- ordering position;
- publisher identity/incarnation;
- dependency closure;
- common-mode assumptions;
- enforcement state;
- freshness.

Old evidence can establish historical provenance but not current contract authority.

## 17. Proposed state machine
NORMAL_C1
→ TRANSITION_REQUESTED
→ C2_PREPARED
→ TRANSITION_EVALUATED
→ TRANSITION_ORDERED
→ C2_COMMITTED
→ C1_FENCING
→ C1_FENCE_VERIFIED
→ C2_ACTIVE
→ RECOVERY_AUTHORITY_RECOMPUTED
→ CURRENT

Failure states:
TRANSITION_UNKNOWN
CONTRACT_CONFLICT
EQUIVOCATION_DETECTED
AUTHORITY_UNRESOLVED
QUARANTINED

No direct:
C2_SIGNED → C2_CURRENT

## 18. Key invariant
Candidate:

NO_INCOMPATIBLE_CURRENT_CONTRACTS

For every protected recovery scope, at most one contract context can be current.

This is stronger than:
NO_DUPLICATE_GENERATION

because two different contracts can have different generations and still both claim authority.

## 19. Another key invariant
CONTRACT_CURRENTNESS_REQUIRES_ORDERED_ACTIVATION

A contract cannot become current solely because:
- it has a valid signature;
- it has a larger generation;
- a local quorum accepted it;
- it is in a newer snapshot;
- an emergency process created it.

It needs the protected transition boundary.

## 20. Formalization consequence
The abstract formal model now needs a distinct transition relation:

ContractTransition(c_old,c_new)

with safety properties around:
- uniqueness;
- predecessor validity;
- ordering;
- root continuity;
- membership transition;
- equivocation;
- fencing;
- publication;
- recovery authority derivation.

This fits the existing TLA+ approach: the abstract transition system can define allowed contract transitions, while a future concrete implementation must refine that behavior. citeturn0search0turn0search25

## 21. New objects
- ContractTransitionAuthority
- ContractOrderingDomain
- ContractTransition
- ContractCompatibility
- ContractRootTransitionContext
- MembershipTransitionContract
- ContractEquivocationRecord
- EmergencyContractTransition
- ContractPublicationBoundary
- ContractAuthorityConflict

## New invariants
CTA-01: Recovery authority cannot redefine its own governing trust contract.
CTA-02: Contract transition is itself a protected authority transition.
CTA-03: Contract currentness requires authoritative ordered activation.
CTA-04: Higher contract generation does not imply global currentness.
CTA-05: At most one incompatible contract context may be current for a protected scope.
CTA-06: Root and membership changes are part of contract-transition safety.
CTA-07: Valid signatures do not establish transition uniqueness.
CTA-08: Emergency authority cannot self-expand into constitutional authority.
CTA-09: Snapshot restore cannot resurrect superseded contract authority.
CTA-10: Rollback cannot restore old authority without a new protected transition.
CTA-11: Contract evidence must bind predecessor, successor, ordering and trust context.
CTA-12: Unknown contract ordering yields unresolved authority, not local winner selection.
CTA-13: Contract transition dependencies must be closed against common-mode compromise.
CTA-14: Mixed-generation contract/recovery bundles cannot become current.
CTA-15: Contract transition compatibility is claim-specific.

## Architectural consequence
The emerging architecture now has a possible constitutional layer above the recovery system:

0. Constitutional / Trust Foundation
1. Contract Transition Authority
2. Recovery Trust Contract
3. Recovery Authority
4. Assurance / Enforcement / External Reconciliation

But this is still a candidate architecture, not final.

## Next attack
The next adversarial case is stronger:

TWO VALID CONTRACT TRANSITIONS.

C1 -> C2 is valid on side A.
C1 -> C3 is valid on side B.
Both have legitimate roots.
Both satisfy their local quorum.
Both satisfy their local failure-domain constraints.
Both survive local Byzantine checks.
The partition heals.

Question:
What primitive proves that C2 dominates C3, C3 dominates C2, or neither can be current — without relying on the very contract transition mechanism that is split?

This is the candidate boundary for a true constitutional ordering primitive.

## Verification status
Architecture: semantically expanded.
Formal proof: NOT DONE.
SANY/TLC: NOT EXECUTED.
Implementation refinement: NOT DONE.
Runtime/fault injection: NOT DONE.
