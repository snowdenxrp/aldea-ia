# NEXO BYZANTINE QUORUM COMMON-MODE ROOT ROTATION MEMBERSHIP COMPACTION RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. NO V21 IMPLEMENTATION. NO CORRECTNESS CLAIM.

## Target
Attack whether one RecoveryTrustContract can safely establish a unique successor while quorum evidence, common-mode dependencies, root trust, membership generation, and compaction certificates change concurrently.

## Core separations
QUORUM_COUNT != QUORUM_INTERSECTION.
QUORUM_INTERSECTION != FAILURE_DOMAIN_INDEPENDENCE.
VALID_MEMBER != HONEST_MEMBER.
VALID_SIGNATURE != UNIQUE_AUTHORITY.
VALID_ROOT != CURRENT_AUTHORITY.
CURRENT_MEMBERSHIP != CURRENT_ORDERING.
CURRENT_COMPACTION_CERTIFICATE != CURRENT_SUCCESSOR_AUTHORITY.
MULTIPLE_ROOTS != MULTIPLE_INDEPENDENT_AUTHORITIES.
MULTIPLE_WITNESSES != INDEPENDENT_EVIDENCE.

## Adversarial scenario
Two recovery partitions A and B each prepare an apparently valid successor. Meanwhile root R0 rotates toward R1, membership M0 changes toward M1, a member equivocates, and a compaction certificate is issued and its supporting raw evidence reclaimed. When the partition heals, neither local certificate may dominate.

Unsafe shortcut:
VALID(SA) + VALID(SB) + QUORUM(A) + QUORUM(B) -> choose by count, timestamp, generation, or local preference.

If the contract does not define an authoritative ordering and uniqueness rule, the correct state is AUTHORITY_UNRESOLVED.

## RecoveryTrustContract
Candidate fields:
contract_id, authority_scope, root/trust set, root generation, membership generation, membership transition contract, quorum/fault model, quorum intersection rule, Byzantine tolerance assumptions, failure-domain independence vector, equivocation policy, authoritative ordering domain, succession rules, predecessor cutoff rule, compaction dependency closure, retention floor, assurance dependency closure, enforcement boundary requirements, recovery ownership, common-mode dependencies, environment/closure mode, revalidation rules, permitted claim classes.

The contract is not safe merely because it contains all these fields. Each component needs explicit semantics and a non-circular trust foundation.

## Quorum findings
A candidate successor needs distinct predicates for:
Q1 credential validity
Q2 membership currentness
Q3 quorum rule satisfaction
Q4 quorum intersection under the stated fault model
Q5 failure-domain/common-mode closure
Q6 equivocation status
Q7 root currentness
Q8 membership transition ordering
Q9 predecessor cutoff ordering
Q10 compaction currentness
Q11 retained-history sufficiency
Q12 effect-path closure
Q13 enforcement verification
Q14 authoritative publication ordering

No Q predicate automatically implies another.

## Byzantine equivocation
A valid member may sign conflicting successor statements. Both signatures can be authentic while the authority result is contradictory.

Required response:
EQUIVOCATION_DETECTED -> FREEZE_DEPENDENT_SUCCESSION -> INVALIDATE_OR_QUARANTINE_DEPENDENT_CERTIFICATES -> RECOMPUTE_QUORUM_AND_INTERSECTION -> ESTABLISH_ORDER OR AUTHORITY_UNRESOLVED.

Signature validity proves origin under its cryptographic assumptions; it does not prove non-equivocation.

## Common-mode compromise
Different machines can share KMS, identity, update source, hypervisor, operator, clock, policy, or recovery infrastructure.

Therefore:
QUORUM_INTERSECTION != INDEPENDENCE.

The trust contract must carry an explicit failure-domain/common-mode closure.

## Root rotation
A certificate created under R0 can remain historically authentic after R0 is superseded by R1 while no longer supporting current assurance.

Required:
ROOT_CUTOFF -> ROOT_RELIANCE_CLOSURE -> INVALIDATE_OR_DOWNGRADE_DEPENDENT_CERTIFICATES -> REVALIDATE_UNDER_R1.

Root generation alone does not order all authority events; the transition needs protected ordering.

## Membership transition
M0 approval cannot silently remain current after M0 -> M1 is committed. Membership is an authority transition, not metadata.

A restored M0 snapshot cannot resurrect M0 authority after a later protected transition.

## Compaction interaction
A compaction certificate must retain or independently represent the exact information needed to resolve:
- predecessor cutoff
- root generation
- membership generation
- quorum evidence
- equivocation evidence
- dependency closure
- UNKNOWN
- authoritative ordering position.

If not reconstructable, the safe result is AUTHORITY_UNAVAILABLE, SAFETY_ONLY, or QUARANTINED, not inferred history.

## Assurance-cycle attack
Root, membership, quorum, succession, assurance, and compaction form a dependency graph with cycles:
compaction depends on assurance; assurance depends on root/membership; succession depends on retained history; retained history depends on compaction.

A certificate cannot justify its own evidence deletion, and a successor cannot establish its own constitutional currentness solely through support derived from that currentness.

## Two valid successors
If SA and SB are individually valid but neither dominates under the protected contract, state is AUTHORITY_UNRESOLVED.

Forbidden generic tie-breaks:
highest_generation, latest_timestamp, largest_quorum_count, local_winner.

A tie-break is safe only if explicitly defined and itself ordered by the relevant authority.

## Safe modes
NORMAL -> DEGRADED -> RECOVERY_CANDIDATE -> QUORUM_EVALUATION -> AUTHORITY_TRANSITION -> SUCCESSOR_CURRENT.

Failure branches:
QUORUM_UNKNOWN, QUORUM_INVALID, EQUIVOCATION_DETECTED, AUTHORITY_CONFLICT -> AUTHORITY_UNRESOLVED / QUARANTINED.

SAFETY_ONLY may preserve STOP, fences, evidence, reconciliation and preauthorized containment. It cannot manufacture constitutional authority.

## Candidate SuccessionTrustVector
Dimensions:
credential_validity, membership_currentness, quorum_validity, quorum_intersection, Byzantine_fault_model, failure_domain_independence, root_currentness, root_transition_order, membership_transition_order, predecessor_cutoff, compaction_currentness, retention_sufficiency, effect_path_closure, enforcement_assurance, publication_authority, dependency_closure, UNKNOWN set.

This is not a scalar score. Safety must not be reduced to a ranking number.

## Candidate RecoveryTrustTransition
Binds predecessor authority, successor candidate, root transition, membership transition, quorum contract, ordering position, cutoff, capability lineage, compaction certificates, retention floor, enforcement requirements, recovery owner, dependency closure, evidence, UNKNOWN set, permitted claim, invalidation triggers.

## Candidate invariants
BRC-01 valid credentials cannot alone establish current authority.
BRC-02 quorum count cannot substitute for the specified quorum/intersection rule.
BRC-03 valid quorum evidence cannot establish independence from common-mode dependencies.
BRC-04 equivocation cannot be silently ignored.
BRC-05 root rotation invalidates or downgrades dependent current-assurance claims when required.
BRC-06 membership changes require protected transition semantics.
BRC-07 two valid unordered successor certificates yield AUTHORITY_UNRESOLVED.
BRC-08 compaction cannot destroy information required to resolve succession.
BRC-09 compaction certificates cannot establish current authority by themselves.
BRC-10 snapshot restore cannot resurrect superseded authority.
BRC-11 SAFETY_ONLY cannot self-promote to constitutional authority.
BRC-12 common-mode compromise affects every claim depending on that domain.
BRC-13 assurance cycles without external/rooted support cannot establish currentness.
BRC-14 root, membership, quorum and succession transitions must be ordered consistently.
BRC-15 successor authority cannot exceed its trust-contract scope.
BRC-16 UNKNOWN ordering cannot be treated as a chosen ordering.
BRC-17 historical authenticity cannot substitute for current authority.
BRC-18 retained history must preserve the minimum information required by the permitted succession claim.

## Negative result
There is no universal safe RecoveryTrustContract merely by adding more fields. It is safe only if its components have explicit semantics, protected ordering, a non-circular trust root, stated fault model, failure-domain closure, membership transition rules, effect-path closure, retention guarantees, and enforcement boundaries.

## Formalization target
The future model must include recovery partitions, Byzantine equivocation, root generations, membership transitions, heterogeneous quorum/fault rules, common-mode dependencies, compaction, succession candidates, authoritative ordering, predecessor fencing, late evidence, external enforcement, crashes/restarts, and conflicting successor certificates.

Primary safety property:
NO_PROTECTED_EFFECT_REQUIRING_CURRENT_CONSTITUTIONAL_AUTHORITY_MAY_EXECUTE_UNDER_AN_UNORDERED_OR_UNRESOLVED_SUCCESSOR_CONTEXT.

## Verification boundary
No SANY/TLC/TLAPS execution was performed for this research. No implementation refinement or runtime fault-injection result is claimed.

## Next attack
BYZANTINE SUCCESSOR + HUMAN EMERGENCY RECOVERY + PREAUTHORIZED SAFETY ROOT + COMMON-MODE COMPROMISE + PARTITION HEALING + LATE EVIDENCE.

Question:
Can human recovery, emergency safety authority, and machine recovery coexist without creating a hidden second constitution or an authority-amplification path?
