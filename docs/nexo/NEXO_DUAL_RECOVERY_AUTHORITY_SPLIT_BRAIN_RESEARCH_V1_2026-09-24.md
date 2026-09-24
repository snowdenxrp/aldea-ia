# NEXO DUAL RECOVERY AUTHORITY / SPLIT-BRAIN RECOVERY RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## Core result
Two recovery mechanisms can each be locally legitimate while being globally incompatible.

`LEGITIMATE(A) + LEGITIMATE(B) != COMPATIBLE(A,B)`

`RECOVERY_CREDENTIAL_VALID != CURRENT_RECOVERY_AUTHORITY`

A recovery path must not become authoritative merely because it can authenticate itself.

## External cross-check
Raft's joint-consensus design prevents unsafe direct transitions between old and new configurations that could permit two independent majorities/leaders during reconfiguration; the transition requires agreement from both configurations. citeturn0search24turn0search2
etcd stops accepting consensus updates after quorum loss, and disaster restore creates a new logical cluster identity instead of silently continuing the old identity. citeturn0search0turn0search1

## 1. Dual-recovery attack
Original authority disappears. Recovery domains A and B lose contact, each has valid pre-authorized recovery credentials, and each independently creates a new epoch. Both can be authentic yet conflicting.

`VALID_RECOVERY_ROOT != UNIQUE_RECOVERY_ROOT`

## 2. Exclusive recovery transition
A new authority requires an exclusivity mechanism: surviving quorum, independently protected recovery root, pre-authorized fencing/epoch source, external witness, or explicitly defined human governance quorum. If none can establish uniqueness:

`AUTHORITY_UNRESOLVED`

## 3. Human recovery
Human override is a legitimate root only if independently defined by the architecture. A single operator credential must not automatically defeat another recovery root unless that supremacy is part of the contract.

Candidate `HumanRecoveryQuorum` properties:
- independently authenticated identities;
- predefined threshold;
- explicit scope;
- anti-replay;
- authority epoch creation;
- old-authority invalidation;
- audit;
- post-recovery reconciliation.

## 4. RecoveryEpochCertificate
Candidate certificate binds:
- recovery epoch;
- issuing authority;
- predecessor authority;
- predecessor invalidation condition;
- recovery scope;
- membership/configuration;
- issuance context;
- expiry/permanence.

## 5. Split-brain recovery fails closed
If A and B cannot establish exclusive authority:

`A -> PROVISIONAL`
`B -> PROVISIONAL`

Neither may publish `CURRENT`. They may preserve evidence, reconcile candidates, and wait for authority restoration. This deliberately sacrifices liveness for authority safety.

## 6. Epoch uniqueness
Two sides cannot independently invent the same authoritative epoch. An epoch identifier is not self-authenticating; it must be bound to an authorized issuer and issuance context.

`ONE_AUTHORITY_EPOCH -> ONE_CURRENT_AUTHORITY`

## 7. Membership transition
Recovery membership changes are authority transitions. A direct `C_old -> C_A` while B independently chooses `C_B` can create incompatible majorities. A safe design needs joint-transition semantics or an equivalent external mechanism preventing both sides from becoming current. This is an architectural analogy, not a requirement to implement Raft.

## 8. Recovery-root compromise
`R_COMPROMISED`
→ `DEPENDENT_RECOVERY_AUTHORITY_INVALIDATED`
→ `DEPENDENT_ASSURANCE_INVALIDATED_OR_DEGRADED`
→ `EFFECT_AUTHORITY_RECHECK`
→ `NEW_RECOVERY_ROOT_REQUIRED`

A compromised recovery root cannot authorize its own replacement.

## 9. Old authority reappears
After recovery, an old publisher may reconnect with valid credentials and claim current authority. Recovery therefore requires an `AuthorityRevocationEpoch`: publishers below the committed recovery epoch are non-current even if their credentials remain cryptographically valid.

`CREDENTIAL_VALIDITY != AUTHORITY_CURRENTNESS`

## 10. Delayed messages
Authentic old publications, quorum responses, witness records, or recovery certificates remain useful historical evidence but cannot silently supersede current authority.

`AUTHENTICATED_OLD_MESSAGE -> HISTORICAL_UNLESS_CURRENT_AUTHORITY_CONTEXT_MATCHES`

## 11. Snapshot resurrection
Restoring a snapshot must not restore current authority. Candidate sequence:

`SNAPSHOT_RESTORED`
→ `IDENTITY_REINCARNATED`
→ `OLD_AUTHORITY_FENCED`
→ `RECOVERY_AUTHORITY_ESTABLISHED`
→ `NEW_EPOCH`
→ `RECONCILE_EXTERNAL_WORLD`
→ `REBUILD_ASSURANCE`

This mirrors etcd's useful property that disaster restoration creates a new logical cluster identity rather than inadvertently rejoining the old cluster. citeturn0search1

## 12. No-root state
If no recovery mechanism can establish uniqueness:

`AuthorityState = UNKNOWN`

Then there is no new authoritative assurance, no authority widening, no protected effect admission requiring current authority, no automatic choice of a recovery side, and no promotion from provisional to current. Observation and evidence preservation may continue.

## 13. Recovery arbitration
Candidate protocol:

`DETECT_AUTHORITY_LOSS`
→ `FREEZE_PROTECTED_PUBLICATION`
→ `ENUMERATE_RECOVERY_CANDIDATES`
→ `VERIFY_RECOVERY_CREDENTIALS`
→ `BUILD_RECOVERY_DEPENDENCY_CLOSURES`
→ `CHECK_COMMON_MODE`
→ `CHECK_UNIQUENESS_MECHANISM`
→ `ESTABLISH_RECOVERY_EPOCH`
→ `FENCE_OLD_AUTHORITY`
→ `RECONCILE_CANDIDATE_STATES`
→ `PUBLISH_NEW_AUTHORITY`
→ `REBUILD_ASSURANCE`

If uniqueness cannot be established: `AUTHORITY_UNRESOLVED`.

## 14. Recovery authority != recovered safety
A recovery certificate proves authority to initiate recovery. It does not prove recovered resources are safe.

`RECOVERY_AUTHORITY != RECOVERED_ASSURANCE`

Enforcement and external reconciliation remain mandatory.

## 15. Candidate authority state machine
`NORMAL`
→ `AUTHORITY_DEGRADED`
→ `RECOVERY_CANDIDATE`
→ `RECOVERY_TRANSITION`
→ `CURRENT`

Failure:
`RECOVERY_CANDIDATE -> AUTHORITY_UNRESOLVED`

Conflict:
`RECOVERY_TRANSITION -> CONFLICT -> AUTHORITY_UNRESOLVED`

No `CURRENT` transition without the uniqueness/exclusivity contract.

## 16. New invariants
DR-01: Valid recovery credentials do not establish current recovery authority by themselves.
DR-02: Individually legitimate recovery domains may be mutually incompatible.
DR-03: Current authority requires an exclusivity/uniqueness proof appropriate to the failure model.
DR-04: Unresolved recovery candidates remain provisional.
DR-05: Recovery epoch identifiers do not create authority without an authorized issuer.
DR-06: Recovery membership changes require protected transition semantics.
DR-07: Compromised recovery roots cannot authorize their own replacement.
DR-08: Old authority must be explicitly fenced after recovery.
DR-09: Authenticated delayed messages are historical unless their authority context is current.
DR-10: Snapshot restoration cannot silently resurrect current authority.
DR-11: No-root state fails closed for authority-sensitive actions.
DR-12: Recovery authority does not imply recovered-resource safety.
DR-13: Recovery candidates cannot self-promote from provisional to current.
DR-14: Human override requires an independently defined governance contract.
DR-15: Unique current authority requires more than locally valid credentials.

## Candidate objects
- RecoveryEpochCertificate
- HumanRecoveryQuorum
- AuthorityRevocationEpoch
- RecoveryDependencyClosure
- RecoveryCandidate
- RecoveryTransition
- AuthorityConflictRecord
- AuthorityUniquenessProof
- RecoveryRootRegistry
- ProvisionalAuthorityState

## Architecture consequence
`AuthorityFoundation` is itself a protected distributed state machine with an explicit unresolved state. It must never use highest timestamp, highest generation, latest-arriving message, largest local quorum, valid snapshot, or self-issued recovery certificate as a substitute for a defined uniqueness mechanism.

## Open boundary
Next attack: `BYZANTINE RECOVERY MEMBERS + COMPROMISED VALID CREDENTIALS + EQUIVOCATION`.

Scenario: one recovery member is malicious but has valid credentials; it tells A that B approved recovery and B that A approved recovery; it signs conflicting recovery certificates; witnesses see different versions; delayed messages arrive after transition.

Question: What minimum quorum/intersection and evidence rules prevent a compromised but validly credentialed recovery participant from causing two conflicting authorities or recovery epochs?

No correctness guarantee is claimed.
