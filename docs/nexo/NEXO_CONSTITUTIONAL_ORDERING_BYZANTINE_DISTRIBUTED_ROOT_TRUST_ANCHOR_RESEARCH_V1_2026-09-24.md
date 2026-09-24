# NEXO CONSTITUTIONAL ORDERING BYZANTINE DISTRIBUTED ROOT AND TRUST ANCHOR RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## 1. Research question
Can ConstitutionalOrderingDomain (COD) itself be distributed Byzantine-tolerantly without becoming circular, and what gives it uniqueness?

## 2. External cross-check
Current distributed-systems work on heterogeneous quorum systems explicitly notes that quorum definitions traditionally assume a pre-existing global agreement on the quorum system. This is directly relevant: a quorum cannot bootstrap the very constitutional configuration that defines which quorums are authoritative without an external/rooted assumption. citeturn0search12
Raft joint consensus provides a useful structural example: configuration change is represented as an explicit transitional configuration, preserving overlap between old and new majorities. It is not Byzantine fault tolerant and therefore is not a direct Nexo solution. citeturn0search1turn0search6
TLA+ refinement requires concrete behaviors to correspond to allowed abstract behaviors, making the constitutional transition relation a suitable future formal boundary. citeturn0search0

## 3. Main result
COD can be distributed only if its authority is anchored in a trust basis that is not simultaneously defined by the disputed constitutional transition.

Therefore there are two architectural cases:

A. External constitutional anchor exists.
COD may be implemented as a distributed Byzantine ordering mechanism under an explicit fault/trust model.

B. No independent constitutional anchor exists.
No protocol can manufacture unique constitutional authority from mutually conflicting local claims. The correct state is CONSTITUTIONAL_AUTHORITY_UNAVAILABLE / AUTHORITY_UNRESOLVED.

This is a trust-boundary result, not a claim that Byzantine consensus is impossible.

## 4. Why ordinary quorum cannot bootstrap COD
Assume:
C1 defines quorum Q1.
A partition creates candidate transitions T2 and T3.
Q1 is disputed.

If COD uses Q1 to decide which transition is current, then:
Q1 defines COD
COD defines current contract
current contract defines Q1

This is circular.

The same problem appears if a new contract C2 defines the quorum that decides whether C2 is current.

Candidate rule:
NO_DISPUTED_CONTRACT_MAY_BE_THE_SOLE_ROOT_OF_ITS_OWN_TRANSITION_AUTHORITY.

## 5. Byzantine COD requirements
If an external constitutional anchor exists, a Byzantine COD must define:
- member identity and incarnation;
- fault model;
- quorum/trust formula;
- quorum intersection for the exact claim;
- failure-domain constraints;
- root/trust-anchor dependencies;
- membership transition;
- equivocation handling;
- ordering semantics;
- recovery semantics;
- evidence and certificate context;
- common-mode closure;
- external enforcement requirements where ordering affects effects.

A single numeric threshold is insufficient.

## 6. Trust formula
Candidate:
ConstitutionalTrustFormula

Possible composition:
THRESHOLD
AND FAILURE_DOMAIN_DIVERSITY
AND MANDATORY_ROOT_WITNESS
AND MEMBERSHIP_VALIDITY
AND NO_UNRESOLVED_EQUIVOCATION
AND ORDERING_CONTEXT_VALID

The exact logical composition must be explicit. There is no universal formula.

## 7. Intersection is claim-specific
Quorum intersection must be evaluated against:
- transition scope;
- fault model;
- membership generation;
- root generation;
- failure domains;
- Byzantine assumptions.

Thus:
QUORUM_INTERSECTION != UNIVERSAL_SAFETY

A quorum may intersect for one claim but fail to provide the required independent support for another.

## 8. Common-mode compromise
Suppose 5 of 7 constitutional members satisfy the quorum formula.

But all 7 depend on:
- one KMS;
- one firmware supply chain;
- one update source;
- one administrative authority;
- one hypervisor;
- one root.

The numeric quorum remains satisfied while the trust basis is correlated.

Therefore:
QUORUM_INTERSECTION + THRESHOLD != FAILURE_DOMAIN_INDEPENDENCE.

Candidate:
ConstitutionalDependencyClosure

## 9. Byzantine equivocation
A member may validly sign:
T2
and
T3

A signature proves attribution/authenticity under its cryptographic assumptions, not non-equivocation.

Candidate:
ConstitutionalEquivocationRecord

If equivocation is detected:
FREEZE_MEMBER
→ INVALIDATE_DEPENDENT_CERTIFICATES
→ RECOMPUTE_TRUST_FORMULA
→ CHECK_TRANSITION_INTERSECTION
→ CONTINUE only if safety conditions remain satisfied
otherwise CONSTITUTIONAL_AUTHORITY_UNAVAILABLE.

Detection itself does not imply complete global history.

## 10. Membership transition
COD membership change must be ordered by a current COD configuration or external constitutional rule.

This is another bootstrap edge.

A joint transitional configuration can preserve overlap, as Raft demonstrates, but the Nexo contract must additionally include Byzantine and failure-domain constraints. citeturn0search1

Candidate:
ConstitutionalMembershipTransition {
  old_membership,
  transition_membership,
  new_membership,
  quorum_rules,
  failure_domain_rules,
  fault_model,
  root_context,
  transition_order,
  activation_boundary,
  old_member_fencing
}

## 11. Root rotation
If constitutional root R1 rotates to R2, the transition cannot rely solely on R2 saying R2 is current.

Candidate:
ConstitutionalRootTransition {
  predecessor_root,
  successor_root,
  succession_rule,
  transition_id,
  ordering_position,
  dependency_closure,
  old_root_cutoff,
  descendant_invalidation,
  enforcement_verification,
  activation_boundary
}

If R1 and R2 both remain independently valid with no ordered succession:
CONSTITUTIONAL_ROOT_UNRESOLVED.

## 12. Emergency root
Emergency root E can only operate if its authority was already bounded by the constitutional anchor.

E cannot create the rule that makes E constitutional.

Therefore:
EMERGENCY_AUTHORITY != CONSTITUTIONAL_SUCCESSION.

If the constitutional anchor is unavailable and E has no preauthorized transition rule:
E may preserve safety but cannot establish new constitutional currentness.

## 13. Human governance
Human governance can be an external constitutional anchor if explicitly modeled.

Candidate:
HumanConstitutionalAuthorization {
  governance_identity,
  quorum/rule,
  scope,
  succession_rule,
  evidence requirements,
  conflict resolution,
  revocation,
  audit/provenance
}

But human approval is not automatically independent or safe. It needs its own trust/failure-domain model.

## 14. Hardware root
A hardware-backed root can be an external anchor only for the claims it actually supports.

Hardware authenticity does not automatically prove:
- current membership;
- Byzantine honesty;
- software semantic correctness;
- external-world effect;
- global authority.

Thus:
HARDWARE_ROOT != UNIVERSAL_TRUST.

## 15. Immutable artifact
An immutable constitutional document can define the transition rules without itself being a live authority.

This separates:
RULE DEFINITION
from
CURRENT AUTHORITY.

But the artifact still needs:
- authenticity;
- distribution;
- version semantics;
- succession/rotation rules;
- interpretation/implementation refinement.

## 16. No-root state is mandatory
If every candidate root depends on a disputed current contract, the architecture must have a terminal state:
NO_CONSTITUTIONAL_ROOT

Allowed:
- observation;
- evidence preservation;
- independent fencing;
- reconciliation;
- preparing candidate transitions.

Forbidden:
- choosing a winner by local majority;
- self-promoting recovery;
- activating a successor root solely by local assertion;
- publishing current constitutional authority.

## 17. Constitutional root is not necessarily a single machine
The external trust boundary can be:
- immutable artifact + governance;
- hardware root + governance;
- multiple independent organizations;
- formally defined root set;
- preauthorized emergency succession;
- other explicitly modeled trust structure.

The architecture must define the trust assumptions rather than hide them inside root.

## 18. Anti-circularity condition
Candidate:
CONSTITUTIONAL_TRANSITION_AUTHORITY(T) must have a dependency path to an independent ConstitutionalTrustAnchor that does not pass through T or any successor state whose validity is being established by T.

Equivalent safety condition:
T ∉ TRANSITIVE_TRUST_DEPENDENCY_CLOSURE(T)
unless an explicitly external axiom/root breaks the cycle.

## 19. Ordering protocol candidate
If a valid constitutional anchor exists:

REQUEST
→ AUTHENTICATE_TRANSITION
→ VERIFY_SUCCESSION_RULE
→ BUILD_CONSTITUTIONAL_CONFLICT_CLOSURE
→ VERIFY_TRUST_FORMULA
→ VERIFY_FAILURE-DOMAIN CLOSURE
→ VERIFY_EQUIVOCATION STATE
→ ESTABLISH_ORDERING
→ COMMIT_TRANSITION
→ FENCE_PREDECESSOR
→ VERIFY_FENCE
→ ACTIVATE_SUCCESSOR
→ RECOMPUTE_CONTRACT
→ RECOMPUTE_RECOVERY_AUTHORITY
→ PUBLISH_CURRENT

Any unresolved ordering/root/dependency condition:
HOLD / AUTHORITY_UNRESOLVED.

## 20. Important distinction
We now have three separate concepts:
CONSTITUTIONAL ORDER
CURRENT AUTHORITY
EXTERNAL EFFECT

A valid constitutional ordering does not itself prove that external effects are stopped or reconciled.

This preserves:
AUTHORITY != EFFECT != WORLD_TRUTH.

## 21. Formalization boundary
Future abstract model should include:
- constitutional anchor;
- trust formula;
- membership;
- root transitions;
- contract transitions;
- partitions;
- equivocation;
- common-mode compromise;
- unresolved authority;
- predecessor fencing;
- currentness publication.

Safety invariants:
CR-01 no self-authorized constitutional transition.
CR-02 no incompatible constitutional current states.
CR-03 currentness requires ordered transition.
CR-04 constitutional quorum validity requires explicit fault model.
CR-05 quorum intersection does not imply independence.
CR-06 equivocation invalidates dependent authority unless revalidated.
CR-07 membership transition preserves the contract's explicit safety relation.
CR-08 root succession requires ordered predecessor cutoff/successor activation.
CR-09 emergency authority cannot self-create constitutional authority.
CR-10 no-root state cannot self-promote.
CR-11 common-mode dependency closure is part of constitutional trust.
CR-12 concrete implementation must refine abstract constitutional ordering.
CR-13 constitutional order does not imply external-world success.
CR-14 trust dependency graph must have an external root for constitutional currentness.
CR-15 unresolved constitutional order yields authority-unavailable, not winner selection.

## 22. New candidate objects
- ConstitutionalTrustAnchor
- ConstitutionalTrustFormula
- ConstitutionalDependencyClosure
- ConstitutionalEquivocationRecord
- ConstitutionalMembershipTransition
- ConstitutionalRootTransition
- HumanConstitutionalAuthorization
- ConstitutionalAuthorityUnavailable
- ConstitutionalOrderCertificate
- ConstitutionalSuccessionContext

## 23. Architectural consequence
The previous top layer can now be sharpened:

CONSTITUTIONAL TRUST ANCHOR
        ↓
CONSTITUTIONAL ORDERING DOMAIN
        ↓
CONTRACT TRANSITION AUTHORITY
        ↓
RECOVERY TRUST CONTRACT
        ↓
RECOVERY AUTHORITY
        ↓
ASSURANCE / ENFORCEMENT
        ↓
EXTERNAL RECONCILIATION

But the top layer is explicitly a trust boundary, not an omnipotent component.

## 24. Open question
The next attack should combine:
- two constitutional roots;
- two valid succession certificates;
- Byzantine members;
- membership change;
- contract change;
- emergency recovery;
- common-mode compromise;
- partition;
- partition healing;
- stale snapshot;
- external fence disagreement.

The objective is to determine whether a single ConstitutionalTrustAnchor can remain non-circular under root rotation and recovery, or whether the architecture needs a permanently external governance boundary.

## Verification status
No SANY/TLC execution.
No TLAPS proof.
No implementation refinement.
No runtime/fault-injection verification.
No correctness guarantee.
