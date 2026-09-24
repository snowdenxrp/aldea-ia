# NEXO AUTHORITY REGISTER FAILURE, CONSENSUS LOSS AND RECOVERY CONFLICT RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## External cross-check
Raft establishes a useful baseline: at most one leader is elected per term; terms act as a logical clock; stale leaders/requests are rejected when their term is obsolete; and committed state survives leadership changes. etcd similarly stops writes when quorum is unavailable and requires quorum for consensus-bearing operations. These properties are evidence for the architectural pattern below, not a claim that Nexo should implement Raft. citeturn0search15turn0search0turn0search2

## Core result
The authority register cannot be treated as ordinary replicated state if it is itself the root of publication authority.

Candidate rule:
AUTHORITY_STATE != ORDINARY_DATA

The system needs an authority mechanism whose safety survives:
- partition;
- stale replicas;
- publisher loss;
- storage rollback;
- recovery from snapshots;
- membership changes;
- root rotation;
- operator recovery;
- delayed messages.

## 1. Minimum authority property
For any protected authority epoch E:

AT MOST ONE CURRENT PUBLICATION AUTHORITY(E)

must be safely derivable under the declared failure model.

Availability is secondary when the authority boundary cannot establish uniqueness.

Therefore:
NO CURRENT AUTHORITY > TWO CURRENT AUTHORITIES.

If uniqueness cannot be established, state must become:
AUTHORITY_UNKNOWN / READ-ONLY / NON-AUTHORITATIVE.

## 2. Quorum is a means, not a magic word
A quorum mechanism only establishes safety if quorum membership, voting rules, configuration transitions, and persistent state themselves satisfy the assumed protocol.

A fixed integer such as 2/3 is not enough.

Membership changes must be part of the authority protocol. etcd explicitly routes membership changes through quorum and treats loss of quorum as a loss of write availability; this is the operational consequence of refusing split-brain authority. citeturn0search3turn0search0

Candidate:
AuthorityQuorumContract.

## 3. Partition behavior
Scenario:
A and B cannot communicate.

If A cannot prove authority remains current, A must not publish current assurance merely because its local state says it is leader.

Likewise B.

Safe outcome:
A = OBSERVER / PROVISIONAL
B = OBSERVER / PROVISIONAL

until one side establishes a new authority epoch under the authority protocol.

This is the same safety-over-availability tradeoff seen in consensus systems: when quorum is unavailable, writes stop rather than allowing two authoritative histories. citeturn0search0turn0search8

## 4. Stale authority snapshot
A recovered node has:
E10 / Publisher A

Current system has:
E12 / Publisher C

Restoring the E10 snapshot must never resurrect E10 as current.

Candidate invariant:
RESTORED_AUTHORITY_STATE MUST BE PROVEN CURRENT, NOT ASSUMED CURRENT.

## 5. Authority fencing
When E11 supersedes E10, E10's publisher must lose the ability to create current publications.

This requires a fence stronger than an in-memory boolean.

Candidate:
AuthorityPublisherFence = (authority_epoch, publisher_incarnation, fencing_generation)

A publication from an obsolete tuple is rejected.

This mirrors the Raft concept that a server discovering a higher term updates its term and rejects stale-term requests. citeturn0search15

## 6. Publisher incarnation
Publisher identity alone is insufficient.

Publisher A may crash and restart.

A restarted A must not automatically inherit the exact publication authority of the previous A process unless the authority protocol explicitly re-admits it.

Therefore:
PUBLISHER_ID != PUBLISHER_INCARCERATION

Candidate:
PublisherIncarnationToken.

## 7. Authority epoch
Every authority transfer creates a new epoch:

E10/A → E11/B

A message from E10 cannot become current merely because it arrives after E11.

Candidate rule:
EPOCH_MONOTONICITY + FENCE_OLD_EPOCHS.

## 8. Permanent quorum loss
If the authority quorum is permanently lost, blindly choosing the node with the newest local snapshot is unsafe.

Recovery must distinguish:
A. quorum-preserving recovery;
B. explicitly authorized disaster recovery;
C. uncontrolled local resurrection.

Only A or an explicitly governed B can create a new authoritative epoch.

C must remain non-authoritative.

## 9. Disaster recovery is a new authority event
If the original authority set is unrecoverable, disaster recovery cannot simply claim continuity from a stale snapshot.

Candidate transition:

OLD_AUTHORITY_UNRECOVERABLE
→ FREEZE_OLD_AUTHORITY
→ DECLARE_RECOVERY_MODE
→ ESTABLISH_NEW_RECOVERY_ROOT
→ CREATE_NEW_AUTHORITY_EPOCH
→ RECONCILE_RESTORED_STATE
→ PUBLISH_NEW_ASSURANCE

This makes recovery a first-class authority transition rather than an invisible restart.

## 10. Recovery root must not be circular
The recovered node cannot prove its own recovery authority by signing its own recovery authorization.

Candidate rule:
SELF_SIGNED_RECOVERY_AUTHORITY != INDEPENDENT_RECOVERY_AUTHORITY.

Recovery needs an external admission mechanism appropriate to the declared threat model: surviving quorum, independently protected operator authorization, hardware-backed recovery authority, or another explicitly defined root.

## 11. Membership change
Adding/removing authority members changes the quorum itself.

Therefore:
MEMBERSHIP_CHANGE = AUTHORITY_TRANSITION.

A naive sequence:
add B
then remove A
can create ambiguous membership during partition.

A safe protocol needs either overlapping-majority semantics or another formally specified transition that guarantees no two configurations can both authorize conflicting current histories. Raft explicitly uses overlapping majorities for membership changes. citeturn0search17

## 12. Two authority configurations
Configuration C1:
A,B,C

Configuration C2:
D,E,F

If both can independently form valid majorities without overlap or external fencing, both can authorize different E_next values.

Therefore:
CONFIGURATION_TRANSITION requires an overlap/fence/externally rooted handoff.

Candidate invariant:
NO_CONCURRENT_AUTHORITATIVE_CONFIGURATIONS.

## 13. Root rotation
Authority root rotation is not merely key replacement.

It changes the trust context of authority decisions.

Candidate:
R1/E10 → transition → R2/E11.

During transition, old-root and new-root decisions must be explicitly ordered.

An old-root snapshot cannot become current after R2 solely because its signature remains cryptographically valid.

## 14. Delayed message attack
A legitimate message from E10 may arrive after E12.

Its signature is valid.
Its historical content is authentic.
Its current authority is invalid.

Therefore:
AUTHENTIC != CURRENT.

Messages need an authority-context check before publication.

## 15. Replayed publication
Attacker replays a previously valid publication:
P(E10,G500)

The content is unchanged and authentic.

Still reject if:
- authority epoch obsolete;
- publisher incarnation obsolete;
- resource incarnation mismatched;
- root generation obsolete;
- publication already superseded.

Candidate:
PublicationReplayGuard.

## 16. Authority and assurance remain separate
Even a valid authority epoch does not make a weak assurance strong.

Therefore:
VALID_AUTHORITY != VALID_ASSURANCE.

The authority protocol answers:
WHO MAY PUBLISH?

The assurance protocol answers:
WHAT MAY THEY CLAIM?

## 17. Authority and capability remain separate
Likewise:
AUTHORITY_TO_PUBLISH != AUTHORITY_TO_EFFECT.

A publisher may be authorized to issue a containment statement without gaining permission to perform the contained effect.

This preserves:
CLAIM != CAPABILITY != AUTHORITY.

## 18. Linearization boundary
A current assurance must have a unique authoritative linearization point.

Candidate:
AuthorityPublicationLinearization = the committed transition at which an assurance becomes the current authoritative publication.

Before that point:
PROPOSED / PREPARED.

After that point:
CURRENT, subject to later supersession.

If no linearization point exists:
NO_CURRENT_ASSURANCE.

## 19. Consumer rule
Consumers must not infer currentness from:
- largest generation;
- latest timestamp;
- highest local sequence;
- newest file modification time;
- newest message received;
- majority of stale caches.

They must validate the authority chain appropriate to the claim.

## 20. Authority-loss state machine
Candidate states:

AUTHORITY_CURRENT
→ AUTHORITY_SUSPECTED_LOSS
→ AUTHORITY_UNCONFIRMED
→ AUTHORITY_FROZEN
→ RECOVERY_PENDING
→ AUTHORITY_REESTABLISHED
→ NEW_EPOCH_CURRENT

Forbidden shortcut:
AUTHORITY_FROZEN → AUTHORITY_CURRENT by local restart alone.

## 21. New invariants
AR-01: At most one current publication authority exists under the declared authority model.
AR-02: Failure to establish unique authority forces non-authoritative/frozen behavior.
AR-03: Authority epoch is distinct from assurance generation.
AR-04: Publisher identity is distinct from publisher incarnation.
AR-05: Stale authority snapshots cannot self-promote to current.
AR-06: Obsolete authority epochs are fenced from current publication.
AR-07: Membership changes are authority transitions.
AR-08: Root rotation creates an explicit trust-context transition.
AR-09: Delayed authentic messages cannot regain current authority.
AR-10: Replay protection must bind authority epoch and publisher incarnation.
AR-11: Permanent quorum loss requires explicit disaster-recovery authority rather than local resurrection.
AR-12: Recovery authority cannot be established solely by the recovered node's own assertion.
AR-13: Authority validity does not imply assurance validity.
AR-14: Authority to publish does not imply authority to effect.
AR-15: Current assurance requires a unique publication linearization boundary.
AR-16: Configuration transitions must prevent concurrent authoritative configurations.
AR-17: Latest timestamp/generation/file state is not proof of current authority.
AR-18: Authority uncertainty must not silently become authority.

## Candidate objects
- AssuranceAuthorityRegister
- AuthorityEpoch
- AuthorityQuorumContract
- AuthorityPublisherFence
- PublisherIncarnationToken
- AuthorityConfiguration
- AuthorityConfigurationTransition
- AuthorityRecoveryRoot
- DisasterRecoveryAuthorization
- PublicationReplayGuard
- AuthorityPublicationLinearization
- AuthorityLossState

## Architecture consequence
The architecture now has a distinct authority foundation beneath assurance publication:

1. AuthorityFoundation — establishes who may publish current authority-bearing state.
2. SafetyOrderingDomain — orders protected authority/effect transitions.
3. ProtectedEnforcementContract — defines actual boundary enforcement.
4. EnforcementAssurance — determines claim strength.
5. AssurancePublicationBoundary — atomically publishes the claim.
6. External Reconciliation — determines external reality.

The critical separation is now:

AUTHORITY → CLAIM → EFFECT → WORLD

and no layer may impersonate the next layer's truth.

## Open boundary
Next attack:
`AUTHORITY FOUNDATION BOOTSTRAP / NO ROOT / DISASTER RECOVERY / HUMAN OVERRIDE / BYZANTINE AUTHORITY MEMBERS`.

Question:
If the original authority quorum is destroyed and no trusted authority root remains, can Nexo safely bootstrap a new authority without circular self-authorization? What claims must become permanently unavailable until an external recovery root is supplied?

No correctness guarantee is claimed.
