# NEXO — AB104.573 — RecoveryCommitID across restore, compaction, migration and incarnation rollover

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE. No V21. No runtime construction. No formal verification.

## Exact question
Is RecoveryCommitID alone sufficient to identify a protected recovery operation after snapshot restore, history compaction, state migration, replica replacement or authority-epoch rollover?

## Evidence
etcd snapshot restore creates a new logical cluster and overwrites member/cluster identity metadata. The restored keyspace can preserve application data while the cluster identity changes. etcd also documents that restoring an older snapshot can make revisions appear to move backward, and recommends revision bumps for consumers that depend on monotonic revision observations. citeturn1search0turn1search1

etcd compaction removes historical revisions before the compaction boundary, so an old revision alone is not a durable universal lookup identity. citeturn1search2turn1search6

etcd response metadata explicitly distinguishes cluster_id, member_id, revision and raft_term, and applications can use cluster identity to ensure they are communicating with the intended cluster. citeturn1search10

## Finding
A globally unique RecoveryCommitID is necessary for retry/idempotency, but it is not by itself sufficient as the complete authority identity.

The same logical identifier can become unsafe if a storage lineage is restored, migrated or reincarnated and the identifier is interpreted against a different authoritative state.

Therefore operation identity needs a durable authority/incarnation context.

Core distinction:
OPERATION_IDENTITY != AUTHORITY_IDENTITY

## Candidate binding
A protected recovery operation should bind its identity to at least:

RecoveryCommitID
+ AuthorityIncarnationID
+ AuthorityEpoch
+ RecoveryGeneration
+ ContinuityAnchorDigest
+ protected state/dependency snapshot digest.

The exact set remains a design candidate until dependency-closure analysis is complete.

## Restore attack
T0: RecoveryCommitID R-17 is prepared.
T1: commit may have occurred, but caller loses response.
T2: authoritative store is destroyed/restored from an older snapshot.
T3: a new store sees R-17.

If the restored state cannot prove whether R-17 committed in the prior lineage, it must not treat absence of R-17 as proof that R-17 never committed.

Likewise, it must not replay R-17 as current authority merely because the identifier matches.

Required response:
OLD-LINEAGE-UNKNOWN → quarantine/reconcile against continuity evidence; never silently reinterpret.

This follows from the fact that snapshot restore can create a new logical cluster identity while preserving application keyspace contents. citeturn1search0

## Compaction attack
If the only proof of R-17 is an old revision that has been compacted, revision lookup can fail.

Therefore:
REVISION != PERMANENT OPERATION IDENTITY

The durable operation record must either survive compaction or be anchored to a retained continuity/evidence mechanism capable of establishing its authoritative outcome. citeturn1search2

## Replica replacement attack
A replacement member is not automatically a new authority. Membership/incarnation changes must be distinguishable from application-state continuity.

A stale replica must not be allowed to answer a recovery lookup as though it were current authority merely because it possesses an old operation record.

Therefore reconciliation requires current authority/fence validation, not just record existence.

## Epoch rollover attack
R-17 committed under AuthorityEpoch E7.
Later E8 supersedes E7.

Historical R-17 remains valid evidence of what happened under E7, but cannot become fresh E8 authority without a new protected transition.

Hence:
HISTORICAL COMMIT != CURRENT AUTHORITY

## Migration attack
A schema/data migration may preserve the semantic operation record while changing representation.

The migration contract must preserve:
- operation identity;
- authoritative outcome;
- authority incarnation;
- continuity anchor;
- dependency/version binding;
- traceability to the pre-migration state.

If semantic preservation cannot be established, recovery lookup must return UNKNOWN rather than infer equivalence from matching fields.

## Candidate state machine
Operation record:
PREPARED
→ SUBMITTED
→ UNKNOWN
→ RECONCILING
→ COMMITTED@INCARNATION/ EPOCH
or
→ NOT_COMMITTED
or
→ SUPERSEDED/STALE
or
→ UNKNOWN_UNRESOLVABLE

A COMMITTED record is not automatically CURRENT_AUTHORITY.

Current authority additionally requires:
current incarnation match
+ current authority epoch/fence
+ current policy/invariant validity
+ current dependency validity.

## New invariant
A recovery operation may be replayed idempotently only when the replay target is the same authoritative lineage or when a formally defined continuity migration establishes semantic identity.

Otherwise:
REPLAY = NEW/UNSAFE until lineage is reconciled.

## Key conclusion
RecoveryCommitID is an operation identity, not a substitute for continuity identity.

The safe conceptual tuple is therefore closer to:

(AuthorityIncarnation, RecoveryCommitID, Generation, Epoch, ContinuityAnchor)

rather than:

(RecoveryCommitID)

This does not require a particular database or consensus technology. It is an architectural requirement candidate.

## Closure status
AB104.573 closes the specific question that a bare RecoveryCommitID is insufficient across authority reincarnation boundaries.

Still OPEN:
- exact continuity-anchor construction;
- migration semantic-equivalence proof;
- cross-store reconciliation;
- external-effect identity across provider/resource replacement;
- formal verification;
- implementation/fault injection.

## Next exact step
AB104.574 — adversarially study external EffectID identity across provider/resource incarnation replacement: determine when an old external effect identifier can safely be recognized as the same effect, when it must be treated as a new attempt, and how UNKNOWN provider state interacts with resource reincarnation.
