# NEXO — AB104.200 ROOT-TRANSITION CRASH / FRESHNESS PERSISTENCE ATTACK V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Scope
Attack the crash-consistency boundary identified by AB104.199. The question is not whether a root can be signed, but whether a crash can make durable evidence disagree about which root is current.

## External research

### TUF reference: freshness and rollback
TUF explicitly treats rollback and freeze as distinct attacks and requires clients to recognize versions older than ones previously seen. Its metadata model also separates Root, Snapshot and Timestamp roles: Root controls trusted keys; Snapshot binds a consistent metadata view; Timestamp points to the current snapshot and is frequently refreshed. This is useful evidence that freshness, authority and consistent-view semantics should not be collapsed into one field. [TUF Security; TUF Roles and Metadata]

### TUF reference: compromise and root replacement
TUF documents that compromised keys must be replaced/revoked, and that compromise of a threshold of Root keys requires Root metadata to be re-issued out of band. This matters for crash recovery: the local durable state must not be able to invent a new authoritative root merely because it contains a higher signed version.

### NIST trust-anchor definition
NIST defines a trust anchor as an authoritative entity for which trust is assumed, and notes that a trust anchor can be securely provisioned out-of-band or built into hardware/software. Therefore the root that validates recovery cannot derive its ultimate authority only from the history being validated.

## Crash attack matrix

### A. Crash after accepting R(n+1), before persisting freshness
Durable state may contain:
- old freshness F(n)
- new root metadata R(n+1)
If recovery sees R(n+1) but cannot prove that its transition was durably accepted, it must not promote R(n+1) merely from its presence. It may classify it as pending/uncommitted root transition.

### B. Crash after persisting freshness, before persisting root metadata
Durable state may contain:
- freshness F(n+1)
- only old root metadata R(n)
This is the dangerous asymmetric case. Recovery must not silently fall back to R(n) as current if F(n+1) proves a newer root had already been accepted. The correct result is potentially RECOVERY_BLOCKED / ROOT_METADATA_MISSING until R(n+1) can be recovered from an independently verified source.

This establishes a key invariant:
A durable freshness advance must never be allowed to disappear merely because the corresponding root metadata is missing.

### C. Torn/partial root write
A partially written root must fail structural/integrity validation. It must never overwrite the previous verified root in place. Recovery should retain the last complete verified root plus an explicit incomplete transition record.

### D. Crash after root + freshness commit but before dependent metadata/materialized state
Root transition may be durable even though downstream state is not. Recovery must resume from the durable root transition and reconstruct dependent metadata/state idempotently; it must not replay external effects.

### E. Replay after power loss
A copied old durable image can contain a cryptographically valid older root and freshness. Cryptography alone cannot identify that it is a rollback if the protected freshness anchor was also rolled back. Therefore freshness evidence itself needs stronger protection than ordinary mutable state.

### F. Two recoverers race
Two recoverers may both observe a pending root transition. They must not independently install competing current roots. A conditional claim/fence over the root-transition incarnation is needed before finalizing the transition.

### G. Restore from older backup
A backup may be internally consistent and signed but still stale. Restoration must be checked against protected freshness/epoch evidence. If the restored freshness is older than the protected latest value, the restored image is STALE/ROLLBACK and cannot become canonical.

### H. Device cloning
A cloned device can contain a valid root and valid local freshness state. If that state is the only authority, both original and clone may independently advance the same identity. Therefore device identity/incarnation and authority epoch must be part of the durable continuity boundary, or a higher-level quorum/anchor must arbitrate.

## New finding: freshness is itself an authority-bearing fact
AB104.199 treated freshness as a predicate. AB104.200 shows it is also durable security evidence.

Therefore:
CURRENT_ROOT requires not only a valid root transition but a durable freshness fact that survives crash and cannot be silently rolled back by ordinary restoration.

This freshness fact must be bound to at least:
- Nexo identity;
- root identity/digest;
- authority epoch/version;
- scope/resource;
- predecessor root;
- transition authorization;
- device/incarnation where applicable.

Exact representation remains OPEN.

## Candidate atomic durability boundary

Research narrows the root-transition commit unit conceptually to a tuple such as:

ROOT_TRANSITION_COMMIT =
(anchor_epoch,
previous_root_digest,
new_root_digest,
new_root_version,
authority_scope,
transition_authorization_digest,
freshness_epoch,
device/incarnation scope,
commit_identity)

The tuple must become durably authoritative as one logical state transition. If storage cannot atomically write all physical fields, a recovery protocol must provide equivalent atomicity using a journal/transaction/commit marker plus integrity protection.

This is a research invariant, not an implementation prescription.

## Recovery cases

1. Old root + old freshness only
-> CURRENT if still valid and no external evidence says a newer transition was accepted.

2. New root + old freshness
-> PENDING_ROOT_TRANSITION / do not promote automatically.

3. Old root + new freshness
-> ROOT_METADATA_MISSING / RECOVERY_BLOCKED unless new root can be independently recovered and verified.

4. New root + new freshness + valid transition authorization
-> CURRENT_ROOT eligible; downstream state recovery can proceed.

5. New root + new freshness but conflicting transition identity
-> CONFLICT / QUARANTINE.

6. Restored older root + older freshness against protected newer anchor
-> ROLLBACK / STALE; never canonicalize silently.

7. Two recoverers claim same transition
-> one fenced/committed transition; loser observes durable result and reconstructs, never repeats root installation as a competing history.

## Code/repository study

Canonical repository: snowdenxrp/aldea-ia, main.
AB104.199 research was persisted as commit d8bbc9ebcc98c74f50eed67a1bcadc84d1cba57a.
AB104.199 continuity checkpoint was persisted as commit 92ccbc0187a720e59661ae0e95742028c79d5b0e.

Repository inspection remains documentation/research oriented for this line; no verified trust-anchor implementation was found or claimed. Security properties must not be inferred from names or planned fields. The next implementation stage must trace actual persistence, recovery, fencing and verification code before claiming these invariants are satisfied.

## Historical residuals MUST remain visible
AB50 -> AB58:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

## DO-NOT-REPEAT
- Do not treat root metadata presence as committed root transition.
- Do not let a durable freshness advance disappear during recovery.
- Do not fall back to an older root when protected freshness proves a newer root was accepted.
- Do not accept torn root writes.
- Do not use mutable local freshness alone as rollback protection.
- Do not let two recoverers silently create competing roots.
- Do not treat a restored backup as current merely because it is internally consistent.
- Do not infer clone/original authority from timestamps.
- Do not execute external effects during root-transition uncertainty.
- No V21.
- No unsupported formal/CI/fault-injection claims.

## EXACT NEXT ACTION — AB104.201
Attack the minimum durable freshness anchor itself:
1. journaling vs transactional storage;
2. atomic commit marker design;
3. rollback-resistant counters/epochs;
4. backup/restore semantics;
5. clone detection and device incarnation;
6. multi-device quorum/authority;
7. determine which evidence must live outside ordinary mutable state.

Status remains research-only.
