# NEXO CONSTITUTIONAL ORDERING DUAL VALID CONTRACT TRANSITIONS RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## 1. Problem
Two sides of a partition may produce individually valid but mutually incompatible contract transitions:
C1 -> C2
C1 -> C3

Both can have valid local quorum, root, membership, failure-domain checks and signatures. Local validity does not establish global precedence.

Raft's joint-consensus mechanism illustrates the general safety principle that configuration changes need an explicit transition state preserving quorum intersection; however, Nexo's Byzantine/common-mode/root requirements are broader, so this is an analogy rather than a direct solution. citeturn0search24turn0search11

## 2. Main result
A new contract cannot become globally current merely because it is:
- newer;
- more highly signed;
- locally quorum-certified;
- locally root-certified;
- present in a newer snapshot;
- accepted by an emergency recovery path.

The system needs an authoritative ordering relation for incompatible constitutional transitions.

Candidate:
ConstitutionalOrderingDomain (COD)

COD is the smallest protected domain capable of uniquely ordering mutually conflicting constitutional transitions for a specified safety scope.

## 3. COD is not another recovery quorum
If COD were defined entirely by the current RecoveryTrustContract, then during C1 -> C2/C3 conflict the contract would already be disputed.

That creates circularity:
C1 defines COD
COD chooses C2
C2 replaces C1

Therefore COD requires an independently rooted constitutional basis, or the system must enter AUTHORITY_UNRESOLVED.

## 4. No universal global order
Nexo does not need one global total order for every operation.

It needs a protected order only over transitions whose simultaneous validity could violate the same safety claim.

Candidate:
ConstitutionalConflictDomain

For a claim scope S:
CCD(S) = closure of all constitutional transitions that can conflict with S.

COD(S) orders that closure.

This follows the architecture's earlier minimal-coordination-domain principle.

## 5. Transition conflict relation
Candidate:
Conflict(T1,T2,S)

T1 and T2 conflict when both can affect the same:
- trust root;
- contract generation;
- membership;
- recovery authority;
- fence;
- assurance publication;
- external effect boundary;
- safety invariant.

If they do not affect overlapping protected scope, they may coexist.

Therefore:
CONSTITUTIONAL_CONFLICT != ANY_DIFFERENCE

## 6. Three possible outcomes after partition
Given T1: C1 -> C2 and T2: C1 -> C3:

A) T1 ordered before T2
  T1 current
  T2 stale/invalidated

B) T2 ordered before T1
  T2 current
  T1 stale/invalidated

C) no authoritative order
  neither may be promoted
  AUTHORITY_UNRESOLVED

There is no safe fourth option:
"pick the one with more local evidence."

## 7. Why generation is insufficient
C2.generation > C3.generation can occur locally on both sides.

Therefore:
LOCAL_GENERATION > != GLOBAL_ORDER

Generation becomes meaningful only when bound to an authoritative ordering position.

Candidate:
ConstitutionalOrderPosition {
  ordering_domain,
  transition_id,
  predecessor_context,
  successor_context,
  position,
  authority_epoch,
  root_generation,
  membership_generation,
  evidence_context
}

## 8. Root does not solve the conflict automatically
Two valid roots can exist during a transition.

Therefore:
VALID_ROOT_A + VALID_ROOT_B != GLOBAL_CURRENT_ROOT

Root validity must be interpreted relative to the same constitutional ordering domain.

## 9. Emergency path does not solve it
An emergency root can preserve safety only within its preauthorized scope.

If emergency path E produces C2 while normal path produces C3, E does not automatically win.

Possible outcomes:
- E has explicit constitutional precedence -> T2 ordered;
- normal path has explicit precedence -> emergency transition rejected;
- no precedence -> AUTHORITY_UNRESOLVED.

## 10. Membership change must itself be ordered
If C2 and C3 also change membership, the transition object must include membership semantics.

A joint configuration is one established pattern for preserving overlap during membership changes, but Nexo needs to add Byzantine and failure-domain predicates. citeturn0search24

Candidate:
JointConstitutionalTransition

It may require:
- predecessor membership;
- successor membership;
- transition membership;
- quorum intersection;
- failure-domain constraints;
- Byzantine fault model;
- root continuity;
- transition ordering;
- old-context fencing.

## 11. Common-mode compromise
Suppose:
A1, A2, A3 support C2
B1, B2, B3 support C3

If both groups depend on the same:
- KMS;
- update source;
- admin;
- hypervisor;
- root;
- policy source;

then their apparent independence may collapse.

Thus COD must carry:
CommonModeDependencyClosure.

## 12. Constitutional root
The research now points toward a narrowly defined constitutional anchor.

Candidate:
ConstitutionalRoot

Properties:
- outside ordinary recovery authority;
- immutable or separately governed;
- defines admissible transition rules;
- cannot be rewritten by the transition it authorizes;
- has explicit succession/rotation semantics;
- can declare AUTHORITY_UNAVAILABLE when no safe transition can be ordered.

This does not imply a magical trusted component. It means the architecture must explicitly state where the ultimate trust assumption resides.

## 13. If no constitutional root exists
The safe answer is not to synthesize one.

State:
CONSTITUTIONAL_AUTHORITY_UNAVAILABLE

Permitted:
- observe;
- preserve evidence;
- reconcile;
- enforce independent fences;
- prepare candidate transitions.

Forbidden:
- publish current contract;
- grant new recovery authority;
- choose C2/C3 by local score;
- turn emergency credentials into constitutional authority.

## 14. Constitutional root rotation
The root itself cannot rotate by simply declaring:
new_root = successor.

Candidate:
ConstitutionalRootTransition {
  predecessor_root,
  successor_root,
  transition_id,
  succession_authority,
  ordering_position,
  membership context,
  dependency closure,
  descendant invalidation,
  enforcement verification,
  activation boundary
}

Root rotation is therefore another constitutional transition subject to the same ordering machinery.

## 15. Avoiding infinite regress
Attack:
Who orders COD?
Who authorizes ConstitutionalRoot?
Who authorizes that authority?

The architecture cannot solve this by adding endlessly nested authorities.

At some point it must declare a base assumption:
- immutable constitutional artifact;
- externally governed root;
- hardware-backed root;
- human governance;
- formally specified trust anchor;
- or explicit no-authority state.

This is not a technical proof; it is the architectural trust boundary.

## 16. Formal model consequence
The abstract model needs:
- constitutional root;
- ordering domain;
- transition conflict relation;
- transition ordering;
- current contract derivation;
- unresolved authority state;
- root succession.

Candidate safety invariant:
NO_TWO_INCOMPATIBLE_CONSTITUTIONAL_TRANSITIONS_CURRENT

Candidate derivation:
CURRENT_CONTRACT(S) is valid only if its transition has an authoritative order position and no later conflicting transition invalidates it.

## 17. Refinement consequence
The concrete implementation must refine the abstract constitutional transition relation. State-machine refinement requires every concrete behavior to map to an allowed abstract behavior; therefore an implementation that allows two incompatible concrete transitions to become current would fail refinement even if each transition independently passes local checks. citeturn0search7turn0search26

## 18. TLC boundary
Future TLC checking should parameterize:
- number of roots;
- membership sets;
- Byzantine identities;
- transition configurations;
- partitions;
- contract versions;
- ordering availability;
- emergency paths;
- common-mode dependencies.

The model must distinguish:
UNKNOWN_ORDER
from
T1_BEFORE_T2
and
T2_BEFORE_T1.

TLC's invariant/property configuration checks specified reachable states; it does not remove the need to state the fault model and scope explicitly. citeturn0search14

## 19. New objects
- ConstitutionalOrderingDomain
- ConstitutionalConflictDomain
- ConstitutionalOrderPosition
- JointConstitutionalTransition
- CommonModeDependencyClosure
- ConstitutionalRoot
- ConstitutionalRootTransition
- ConstitutionalAuthorityUnavailable
- ConstitutionalTransitionConflict

## New invariants
CO-01: Individually valid transitions can still be globally incompatible.
CO-02: Local quorum validity does not establish constitutional precedence.
CO-03: Contract generation does not establish constitutional ordering.
CO-04: Constitutional conflict requires an authoritative ordering decision or unresolved authority.
CO-05: No incompatible constitutional transitions may both be current for the same protected scope.
CO-06: COD cannot derive its authority solely from the disputed contract.
CO-07: Root validity is interpreted within the constitutional ordering context.
CO-08: Emergency authority cannot implicitly become constitutional precedence.
CO-09: Common-mode dependencies are part of constitutional trust analysis.
CO-10: Snapshot restoration cannot restore superseded constitutional authority.
CO-11: Absence of authoritative ordering yields AUTHORITY_UNRESOLVED.
CO-12: Constitutional root succession is itself a protected transition.
CO-13: Concrete implementations must refine the abstract constitutional transition relation.
CO-14: Constitutional trust assumptions must terminate at an explicitly declared trust boundary.
CO-15: Claim-scoped constitutional ordering is sufficient where global total ordering is unnecessary.

## Architecture update
Candidate final hierarchy is now:

0. Constitutional / Trust Foundation
1. Constitutional Ordering Domain
2. Contract Transition Authority
3. Recovery Trust Contract
4. Recovery Authority
5. Assurance / Enforcement
6. External Reconciliation

This remains a candidate design, not a finalized architecture.

## Critical open question
Can the ConstitutionalOrderingDomain itself be distributed Byzantine-tolerantly without becoming circular?

If yes, what exact external trust assumption gives it uniqueness?
If no, what explicit governance/hardware/immutable-root boundary is required?

That is the next research gate.

## Verification status
No SANY/TLC execution.
No implementation refinement.
No runtime/fault-injection verification.
No correctness guarantee.
