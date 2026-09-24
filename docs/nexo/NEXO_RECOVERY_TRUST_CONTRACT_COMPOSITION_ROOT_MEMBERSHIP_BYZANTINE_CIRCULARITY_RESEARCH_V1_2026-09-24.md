# NEXO RECOVERY TRUST CONTRACT COMPOSITION ROOT MEMBERSHIP BYZANTINE CIRCULARITY RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## External cross-check
Generalized Byzantine quorum work shows that trust assumptions can be represented by formulas richer than a single threshold, while composition of different trust assumptions requires explicit composition rules. This supports modeling Nexo recovery trust as a context-bound contract rather than a universal quorum number. citeturn0academia3turn0academia4
Raft's joint-consensus membership transition is useful as an analogy for requiring an overlap/transition rule when membership changes, but Raft assumes crash faults rather than Byzantine behavior and therefore cannot itself establish Nexo's Byzantine safety. citeturn0search7

## Core result
A single recovery contract can compose quorum, failure-domain independence, root continuity, membership transition, and equivocation handling only if these are separate predicates joined by an explicit protected composition rule.

Candidate:
RecoveryTrustContract = {
  MembershipContext,
  FaultModel,
  QuorumFormula,
  FailureDomainConstraints,
  RootContinuityContract,
  MembershipTransitionContract,
  EquivocationContract,
  ExternalRecoveryRoot,
  OrderingDomain,
  PublicationBoundary
}

The contract itself cannot be trusted merely because it says it is current. Its authority and assumptions must be rooted outside the protected claim it authorizes.

## 1. Threshold is only one predicate
A quorum formula can say which sets are sufficient, but it does not by itself prove:
- members are independent;
- roots are current;
- membership is current;
- participants are non-equivocating;
- update artifacts are uncompromised;
- external enforcement is intact.

Therefore:
QUORUM_VALID != RECOVERY_SAFE

## 2. Failure-domain constraint
Candidate predicate:
FD_INDEPENDENT(Q, claim)

It evaluates the quorum against the failure domains relevant to the exact recovery claim.

Example:
A 4-of-7 threshold can be insufficient if all seven depend on one compromised recovery administrator.
Conversely, a smaller set may satisfy a narrow claim if its trust structure explicitly provides the required independence.

## 3. Root continuity is separate
Candidate predicate:
ROOT_CURRENT(Q, context)

A quorum can be mathematically valid under an obsolete root.

Therefore:
VALID_QUORUM + OLD_ROOT -> STALE_RECOVERY_AUTHORITY

Root transition is itself a protected authority transition.

## 4. Membership transition is separate
Candidate transition:
M_old -> M_joint -> M_new

During transition, the contract must define which configurations can authorize which protected operations.

A Raft-like overlap is an analogy, not a direct solution, because Nexo may have Byzantine members and heterogeneous trust. citeturn0search7

Candidate invariant:
NO_TWO_INCOMPATIBLE_CURRENT_MEMBERSHIP_CONFIGURATIONS

## 5. Equivocation is separate
A valid member can sign conflicting transitions.

Candidate predicate:
NO_UNRESOLVED_EQUIVOCATION(Q, scope)

If violated:
- freeze affected member;
- invalidate dependent candidate certificates;
- recompute quorum/trust formula;
- if contract still holds, continue;
- otherwise AUTHORITY_UNRESOLVED.

## 6. Composition cannot be circular
Suppose the recovery certificate authorizes the trust contract.
The trust contract validates the certificate.
The certificate then proves its own trust.

This is circular.

Candidate rule:
TRUST_CONTRACT_VALIDITY must depend on an external or independently rooted AuthorityFoundation.

Therefore:
CLAIM_USED_TO_AUTHORIZE_ITS_OWN_RECOVERY_ROOT -> DENY

## 7. Contract generation
Candidate:
RecoveryTrustContractGeneration

A contract change is itself an authority transition.

The current contract must bind:
- contract_generation;
- issuer/root;
- membership generation;
- fault model;
- quorum formula;
- failure-domain map;
- root generation;
- ordering domain;
- effective scope;
- invalidation rules.

Old contracts remain historical but cannot silently authorize current recovery.

## 8. Trust-contract dependency graph
Candidate:
RecoveryTrustDependencyGraph

Nodes:
- trust contract;
- root;
- membership;
- quorum formula;
- failure domains;
- policy/invariants;
- update artifact;
- recovery authority;
- ordering domain;
- evidence;
- external enforcement.

Edges:
DEPENDS_ON, SUPPORTS, INVALIDATES, AUTHORIZES, DERIVED_FROM, PRESERVES.

The current contract is valid only if its required dependencies are current and the dependency closure is not circular without an external root.

## 9. Root rotation + membership change
Hard case:
R1 authorizes M1.
Transition begins to R2 and M2.
Partition occurs.
A side sees R1/M1.
B side sees R2/M2.

Neither context can be declared globally current without an ordering contract.

Candidate sequence:
FREEZE_PROTECTED_RECOVERY
→ ESTABLISH_TRANSITION_CONTEXT
→ ORDER_ROOT_TRANSITION
→ ORDER_MEMBERSHIP_TRANSITION
→ INVALIDATE_STALE_CONTEXTS
→ RECOMPUTE_TRUST_CONTRACT
→ VERIFY_ENFORCEMENT
→ PUBLISH_CURRENT_AUTHORITY.

## 10. Common-mode root compromise
Even independent-looking members may share a root:
W1 -> R
W2 -> R
W3 -> R

If R is compromised, the apparent quorum can collapse.

Therefore:
QUORUM_INTERSECTION + FD_INDEPENDENCE must include root dependencies.

## 11. Recovery root and normal root
Recovery authority must not silently become normal mission authority.

Candidate separation:
RecoveryRoot
MissionRoot
AssuranceRoot
EvidenceRoot

They may be implemented by the same physical system only if the claim's independence contract explicitly permits it; logical naming alone does not establish independence.

## 12. Emergency path
A preauthorized emergency root may operate while normal quorum is unavailable, but only within a bounded contract.

Candidate:
EmergencyRecoveryContract

Required:
- exact scope;
- allowed transitions;
- maximum authority;
- expiry/review;
- external fence requirements;
- reconciliation obligations;
- explicit transition back to normal authority.

Emergency path must not widen its own scope.

## 13. Contract degradation
If some dependency becomes UNKNOWN:
KNOWN -> UNKNOWN

the contract cannot silently remain fully valid.

Possible outcomes:
- retain only claims not dependent on the uncertain dependency;
- degrade recovery scope;
- safety-only;
- quarantine.

Candidate:
RecoveryTrustDegradationPolicy.

## 14. Contract compromise
If the trust contract artifact itself is compromised:
- authenticity may remain valid under old root;
- semantic currentness may fail;
- dependency closure may fail.

Therefore:
VALID_SIGNATURE != VALID_RECOVERY_CONTRACT

The contract requires artifact integrity, provenance, current root context, and semantic compatibility.

## 15. Byzantine bound exceeded
If observed/evidenced Byzantine faults exceed the contract's tolerated bound:
- no new current authority;
- fence affected recovery paths;
- preserve evidence;
- enter AUTHORITY_UNRESOLVED;
- invoke an external recovery mechanism if available.

Never silently continue under a violated fault model.

## 16. Minimal composition law
Candidate:
RECOVERY_SAFE(C) =
  CURRENT_ROOT(C)
  AND CURRENT_MEMBERSHIP(C)
  AND QUORUM_SATISFIES(C)
  AND FAILURE_DOMAINS_SATISFY(C)
  AND NO_UNRESOLVED_EQUIVOCATION(C)
  AND ORDERING_DOMAIN_VALID(C)
  AND CONTRACT_CONTEXT_CURRENT(C)
  AND EXTERNAL_ROOT_VALID(C)
  AND ENFORCEMENT_BOUNDARY_VALID(C)

This is a candidate semantic predicate, not a proved theorem.

## 17. No single predicate can replace the others
Examples:
CURRENT_ROOT + QUORUM != FAILURE_DOMAIN_INDEPENDENCE
FAILURE_DOMAIN_INDEPENDENCE + QUORUM != CURRENT_ROOT
CURRENT_ROOT + MEMBERSHIP != NO_EQUIVOCATION
QUORUM + NO_EQUIVOCATION != EXTERNAL_ENFORCEMENT
ALL_INTERNAL_PREDICATES != WORLD_TRUTH

This preserves the architecture's fundamental separation.

## 18. Publication
A recovery certificate can only become CURRENT at a protected publication boundary that atomically binds:
- trust-contract generation;
- root context;
- membership context;
- quorum evidence;
- failure-domain closure;
- equivocation state;
- ordering position;
- enforcement state;
- recovery epoch.

Consumers must reject mixed-generation bundles.

## New invariants
RTC-01: Quorum validity is necessary only relative to an explicit fault/trust model.
RTC-02: Quorum size does not establish failure-domain independence.
RTC-03: Root currentness is independent of quorum validity.
RTC-04: Membership currentness is independent of root validity.
RTC-05: Equivocation state is independent of signature validity.
RTC-06: Membership and root transitions require protected ordering.
RTC-07: RecoveryTrustContract cannot self-authorize its own authority root.
RTC-08: Contract dependencies must be current and non-circular for the claim.
RTC-09: A violated Byzantine fault bound forces degraded/unresolved authority.
RTC-10: Emergency recovery cannot widen its own authority.
RTC-11: Recovery authority cannot silently become mission authority.
RTC-12: Current publication must bind one coherent trust-contract generation.
RTC-13: Common-mode dependencies are part of the trust contract.
RTC-14: Unknown critical dependency cannot be promoted to known by local agreement.
RTC-15: A valid signature on an obsolete contract does not authorize current recovery.

## Candidate objects
- RecoveryTrustContract
- RecoveryTrustContractGeneration
- RecoveryTrustDependencyGraph
- FailureDomainConstraint
- RootContinuityContract
- MembershipTransitionContract
- EquivocationContract
- EmergencyRecoveryContract
- RecoveryTrustDegradationPolicy
- RecoveryCertificate
- RecoveryAuthorityPublication

## Architecture consequence
The AuthorityFoundation should not expose a primitive such as GRANT_RECOVERY(authority_set).

Instead, it should expose a protected transition whose admission evaluates the full current RecoveryTrustContract.

The contract is a semantic boundary, not an authority by itself.

## Open boundary
Next attack:
CONTRACT UPDATE ITSELF UNDER BYZANTINE PARTITION.

Scenario:
- old trust contract C1 is valid;
- new C2 changes membership/root/quorum;
- A sees C1;
- B sees C2;
- one Byzantine member signs approvals under both;
- recovery is active;
- an emergency root exists;
- external fence is partially verified.

Question:
What orders the contract transition itself, and how can Nexo prevent C1 and C2 from simultaneously authorizing incompatible recovery authorities?

No correctness guarantee is claimed.
