# NEXO AUTHORITY FOUNDATION, BOOTSTRAP, NO-ROOT RECOVERY AND HUMAN OVERRIDE RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## External cross-check
Raft's safety model depends on a defined term/leader authority: at most one leader per term, stale terms are rejected, and committed state survives future leadership through quorum intersection. citeturn0search24turn0search8
etcd explicitly stops accepting consensus writes after quorum loss; disaster recovery restores a new logical cluster and changes cluster/member identity rather than silently continuing the old authority. Its documentation also warns that snapshot restore can move revisions backward unless a revision bump is used. citeturn0search0

## Core result
If the original authority quorum, publisher and recovery root are all unavailable, Nexo cannot safely manufacture current authority from its own recovered state.

Candidate rule:
`NO_EXTERNAL_AUTHORITY_ROOT -> NO_NEW_AUTHORITATIVE_PUBLICATION`

unless an explicitly pre-established recovery contract supplies an independent root of authority.

## 1. Authority has a root-of-trust problem
The previous architecture separated:
- AuthorityEpoch
- PublisherIncarnation
- AssuranceGeneration
- PublicationBoundary

This round establishes that these are not themselves ultimate authority.

If every component that can declare "current authority" derives its legitimacy from the same lost state, recovery cannot bootstrap legitimacy by circular declaration.

`RECOVERED_STATE != AUTHORITY`
`VALID_SNAPSHOT != CURRENT_AUTHORITY`
`SELF_SIGNED_RECOVERY != INDEPENDENT_RECOVERY`

## 2. Safe bootstrap classes
Candidate recovery classes:

R0 NORMAL_CONTINUATION
- original authority still demonstrably exists;
- quorum/authority contract remains valid;
- continue only under current authority.

R1 QUORUM_RECOVERY
- authority mechanism survives;
- quorum can re-form;
- establish a new authority epoch through the existing protocol.

R2 PREAUTHORIZED_DISASTER_RECOVERY
- original authority is unavailable;
- a separately protected recovery root was provisioned before failure;
- recovery creates a new epoch and explicitly fences the old authority.

R3 HUMAN/ORGANIZATIONAL RECOVERY
- a predefined external governance process supplies authorization;
- authorization is recorded as a new recovery event;
- old authority is permanently treated as stale unless explicitly re-admitted.

R4 NO-ROOT STATE
- no quorum;
- no valid recovery root;
- no independently trusted human/governance root;
- no way to distinguish competing recovery authorities.

R4 must remain non-authoritative.

## 3. Recovery root must be outside the recovered authority state
A recovery key stored only inside the snapshot it is supposed to recover is not an independent recovery root.

Candidate property:
`RECOVERY_ROOT_FAILURE_DOMAIN != RECOVERED_AUTHORITY_FAILURE_DOMAIN`

Subject to the exact threat model, the recovery root may be protected through an independently controlled mechanism, offline process, hardware-backed root, or external governance process.

The exact mechanism is implementation-dependent and not selected here.

## 4. Old authority must be fenced before new authority becomes current
A safe recovery transition needs a proof/contract that the old authority cannot continue making current publications.

Conceptually:
`OLD_AUTHORITY_IDENTIFIED`
→ `OLD_AUTHORITY_FENCED_OR_DECLARED_IRRECOVERABLE`
→ `RECOVERY_ROOT_AUTHENTICATED`
→ `NEW_AUTHORITY_EPOCH`
→ `NEW_PUBLISHER_INCARNATIONS`
→ `RECONCILE`
→ `NEW_ASSURANCE_PUBLICATION`

If old authority remains potentially active and cannot be fenced or ruled out under the recovery contract, strong current-authority claims must remain blocked.

## 5. Disaster recovery cannot silently preserve authority
A snapshot can preserve application state while representing an older authority state.

Therefore:
`DATA_CONTINUITY != AUTHORITY_CONTINUITY`

This matches etcd's disaster-recovery model: restoring from a snapshot creates a new logical cluster and overwrites member/cluster identity metadata so the restored system does not accidentally rejoin the former cluster. citeturn0search0

For Nexo, restoration should similarly create a new authority lineage unless the original authority contract explicitly proves continuity.

## 6. Recovery epoch must dominate stale authority
Suppose:
`old = E10`
`recovery = E11`

Any delayed E10 publication must be rejected as current after E11 is committed under the recovery contract.

Candidate invariant:
`AUTHORITY_EPOCH_MONOTONICITY`

with an externally protected high-water mark or equivalent recovery proof.

A local snapshot cannot reset the high-water mark.

## 7. Human override is not an informal bypass
A human emergency action can be a valid authority root only if it is explicitly part of the architecture.

Candidate `HumanRecoveryAuthorization` must define:
- authorized principals/roles;
- authentication;
- required quorum/threshold where applicable;
- scope;
- reason/event identifier;
- validity period;
- affected authority lineage;
- old-authority invalidation;
- audit evidence;
- replay protection;
- emergency revocation;
- post-recovery reconciliation.

`ADMIN_PRIVILEGE != CURRENT_AUTHORITY` unless the recovery contract explicitly grants it.

## 8. Break-glass cannot silently widen authority
A break-glass operation should produce a distinct authority class, not mutate normal authority invisibly.

Candidate:
`NORMAL_AUTHORITY`
`RECOVERY_AUTHORITY`
`EMERGENCY_AUTHORITY`

Claims and capabilities must state which class authorized them.

## 9. No-root mode
When no valid authority root exists, Nexo should enter a constrained state.

Allowed:
- observe;
- collect evidence;
- preserve history;
- calculate hypothetical/recovery candidates;
- validate integrity;
- prepare reconciliation;
- expose uncertainty.

Blocked:
- declare a new current authority;
- issue strong current assurance;
- grant authority based solely on recovered local state;
- silently supersede the old authority;
- perform irreversible protected effects requiring current authority.

Candidate state:
`AUTHORITY_UNAVAILABLE`

This is a safety state, not an application failure to be hidden.

## 10. Recovery proposal versus recovery commitment
Separate:
`RECOVERY_PROPOSAL`
from:
`RECOVERY_COMMITMENT`.

A recovered node can propose:
"I believe E12 should exist."

It cannot make that current without the recovery authority.

Therefore:
`PROPOSAL != COMMITMENT != CURRENT_AUTHORITY`.

## 11. Competing recovery roots
Attack:
R1 and R2 both claim to be emergency roots.

If there is no higher rule distinguishing them, Nexo cannot safely choose.

Result:
`MULTIPLE_UNORDERED_RECOVERY_ROOTS -> AUTHORITY_UNRESOLVED`

A deterministic tie-breaker such as timestamp, lexical ID or local preference is not sufficient unless it was explicitly established as part of the authority contract.

## 12. Recovery root compromise
If the recovery root is compromised:
- all dependent recovery authority claims become suspect;
- the system must locate dependent publications;
- invalidate/degrade them;
- invoke the next pre-established recovery mechanism if one exists.

Candidate chain:
`RECOVERY_ROOT_COMPROMISED`
→ `DEPENDENCY_CLOSURE`
→ `CLAIM_INVALIDATION`
→ `OLD_AUTHORITY_REASSESSMENT`
→ `NEXT_RECOVERY_ROOT`
→ `NEW_EPOCH`

If no next root exists, return to `AUTHORITY_UNAVAILABLE`.

## 13. Recovery cannot prove its own exclusivity
A recovery publisher cannot establish "I am the only recovery publisher" by querying only itself.

Candidate rule:
`SELF_ASSERTED_RECOVERY_EXCLUSIVITY -> DENY`

Exclusivity must derive from quorum/intersection, externally protected recovery governance, or another pre-established authority contract.

## 14. Membership bootstrap
If a disaster replaces all members, the new membership is not automatically entitled to represent the old membership.

The recovery contract must bind:
- new member set;
- new authority epoch;
- old membership invalidation;
- trust context;
- recovery event;
- snapshot lineage.

This follows the same safety intuition as consensus membership changes: safe transitions need an overlap or another explicit mechanism that prevents simultaneous incompatible authorities. Raft's membership-change mechanism uses overlapping majorities for this purpose. citeturn0search8

## 15. Recovery and assurance must be separated
A recovery root may authorize a new authority epoch.
It does not thereby prove that the recovered resource is safe, current or effect-free.

Therefore:
`RECOVERY_AUTHORITY != ENFORCEMENT_ASSURANCE`

After authority recovery, enforcement assurance must be recomputed.

## 16. Recovery and world reconciliation
A snapshot can describe a past internal state while the external world continued changing.

Therefore after recovery:
`RESTORED_INTERNAL_STATE`
→ `EXTERNAL_RECONCILIATION`
→ `CONFLICT_CLASSIFICATION`
→ `AUTHORITY/ASSURANCE_RECOMPUTATION`

Do not assume the external world rolled back with the snapshot.

## 17. Candidate recovery state machine
`NORMAL`
→ `AUTHORITY_DEGRADED`
→ `AUTHORITY_LOST`
→ `RECOVERY_PENDING`
→ `RECOVERY_AUTHENTICATED`
→ `OLD_AUTHORITY_FENCED`
→ `NEW_EPOCH_ESTABLISHED`
→ `RECONCILIATION_REQUIRED`
→ `ASSURANCE_REBUILT`
→ `NORMAL`

Failure at any stage should not silently skip forward.

Examples:
`RECOVERY_PENDING + no root -> AUTHORITY_UNAVAILABLE`
`NEW_EPOCH + old authority not fenced -> NOT_CURRENT`
`RECONCILIATION conflict -> ASSURANCE_DEGRADED`

## 18. New invariants
AF-01: Recovered state cannot self-authorize.
AF-02: Valid snapshot integrity does not establish current authority.
AF-03: Disaster recovery creates a new authority lineage unless continuity is explicitly proven.
AF-04: A recovery root must not depend solely on the authority state it is recovering.
AF-05: Old authority must be fenced or explicitly rendered non-current before strong new-authority publication.
AF-06: Authority epoch cannot decrease because of storage rollback.
AF-07: Multiple unordered recovery roots imply unresolved authority.
AF-08: Human emergency authority must be an explicit, auditable authority class.
AF-09: Break-glass cannot silently widen normal authority.
AF-10: No-root mode must block authoritative publication and protected authority-dependent effects.
AF-11: Recovery proposal cannot become current without recovery commitment.
AF-12: Recovery authority does not establish enforcement assurance.
AF-13: Recovery must reconcile internal restored state with the external world.
AF-14: Recovery exclusivity cannot be established by self-assertion alone.
AF-15: Recovery-root compromise invalidates dependent authority claims according to dependency closure.
AF-16: New membership requires an explicit authority transition.

## Candidate objects
- AuthorityFoundation
- RecoveryRoot
- RecoveryRootDependencyClosure
- RecoveryAuthorization
- HumanRecoveryAuthorization
- RecoveryEpoch
- PublisherIncarnation
- AuthorityHighWaterMark
- OldAuthorityFence
- RecoveryCommitment
- AuthorityUnavailableState
- RecoveryLineage
- RecoveryReconciliationRecord

## Architecture consequence
The architecture now has a distinct root layer:

`AuthorityFoundation`
↓
`SafetyOrderingDomain`
↓
`ProtectedEnforcementContract`
↓
`EnforcementAssurance`
↓
`AssurancePublicationBoundary`
↓
`External Reconciliation`

The root layer does not claim world truth. It only answers the narrower question:
"Who/what is currently authorized to make this class of protected declaration or transition?"

## Open boundary
Next attack:
`RECOVERY ROOT COMPROMISE + HUMAN OVERRIDE COLLUSION + STALE OLD AUTHORITY + SIMULTANEOUS RECOVERY DOMAINS`.

Question:
Can two separately legitimate recovery mechanisms both activate during a prolonged partition, and what constitutional rule prevents their independent actions from becoming two incompatible current authorities?

No correctness guarantee is claimed.
