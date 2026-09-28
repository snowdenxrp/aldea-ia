# NEXO GLOBAL AUDIT-086 — Recovery Evidence, WAL, Linearizability and Stale-State Resurrection

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-086 attacks recovery evidence itself: prepare/commit ambiguity, write-ahead logs versus authoritative state, idempotency/fencing, crash-recovery linearizability, stale-reader resurrection, cache invalidation, snapshot/restore ordering, proof replay after environment drift, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

etcd documents strict serializability/durability for KV operations and distinguishes this from watches, which can have unbounded delivery delay; clients must use revisions to reason about ordering. Its persistent-storage documentation states that the WAL persists proposals plus snapshots and hard state, and that later entries can supersede earlier entries at the same index. citeturn0search1turn0search9

etcd's disaster-recovery documentation explicitly warns that a snapshot can omit data already present in the WAL, and that restoring an older revision can leave local caches/informers stale unless recovery handles the revision discontinuity. It also notes that restore changes member/cluster identity to prevent accidental rejoining of the former cluster. citeturn0search4

Raft defines a committed log entry as one safely replicated and says committed entries are durable and eventually applied to state machines. The commit boundary is therefore distinct from merely having an entry in a local log. citeturn0search32

in-toto describes preliminary recording followed by final recording/verification and requires the verifier to validate signed layout/link metadata and expiration; its security audit also documents that the implementations/specification have undergone an external security review, but this does not prove Nexo's semantics. citeturn0search2turn0search6

## Findings

### 1. Prepare/commit ambiguity

A durable prepare record is not proof of commit. A final state without a durable commit boundary is not enough to reconstruct whether the externally visible transition occurred.

PREPARED != COMMITTED
DURABLE INTENT != DURABLE EFFECT

If recovery cannot distinguish the states, the affected semantic fact remains UNKNOWN.

### 2. WAL != authoritative claim history

A WAL is an important recovery substrate, but the meaning of its entries depends on the commit protocol and state-machine application rules. etcd explicitly persists both Raft/WAL state and snapshots, while Raft defines commitment separately from mere log presence. citeturn0search9turn0search32

WAL ENTRY != AUTOMATICALLY COMMITTED CLAIM
RECOVERABLE LOG != COMPLETE SEMANTIC HISTORY

### 3. Atomicity boundary

A transactional primitive can make multiple state changes atomic within its defined store, but that does not automatically make external side effects atomic with the store.

etcd transactions atomically modify the KV state, while watch delivery has different guarantees. citeturn0search8turn0search1

ATOMIC STORE TRANSACTION != ATOMIC EXTERNAL WORLD EFFECT

This matters for Nexo's external-effect contracts: commit of internal authority state and execution of an external effect require explicit linkage/reconciliation semantics.

### 4. Linearizability vs historical reconstruction

Linearizability gives a defined point between invocation and response at which an operation takes effect. It does not by itself preserve every causal detail of the pre/post history needed for forensic reconstruction.

LINEARIZABILITY != COMPLETE HISTORICAL PROVENANCE

A system can provide strong current consistency while retaining insufficient information to reconstruct an earlier semantic distinction.

### 5. Idempotency and fencing

An idempotency key can prevent duplicate application of the same operation under a defined scope. A fencing token can prevent stale actors from applying operations after a newer epoch. Neither alone proves that a prior ambiguous operation committed.

IDEMPOTENCY != OCCURRENCE PROOF
FENCING != COMMIT PROOF

### 6. Stale-reader resurrection

After snapshot restore, a local cache can contain state from a newer revision than the restored authoritative state, or vice versa. etcd explicitly warns that restoring an older revision can confuse consumers holding cached data and recommends revision-bump techniques for such cases. citeturn0search4

CACHED NEWER STATE + RESTORED OLDER AUTHORITY != SAFE CURRENT STATE

The cache must be fenced against the restored authority epoch/revision rather than silently reused.

### 7. Snapshot/WAL ordering

A snapshot and WAL are not interchangeable evidence. A snapshot can omit data still represented in the WAL; conversely, a WAL record can exist without representing a committed semantic transition.

SNAPSHOT != COMPLETE WAL
WAL != COMPLETE SNAPSHOT
SNAPSHOT+WAL != AUTOMATICALLY COMPLETE HISTORY

The exact recovery protocol must define which boundary is authoritative.

### 8. Restore identity

etcd changes member and cluster identity during restore to prevent accidental reattachment to the old cluster. citeturn0search4

This is a concrete example of an important Nexo distinction:
RESTORED STATE != SAME INCARNATION

Restoration can preserve data while deliberately creating a new operational incarnation.

### 9. Replay after environment drift

A deterministic replay performed with a changed engine, dependency, clock model, configuration, trust root, or external dataset can reproduce a result without reproducing the historical execution semantics.

REPLAY DETERMINISM != HISTORICAL ENVIRONMENT EQUALITY
SAME OUTPUT != SAME HISTORICAL EXECUTION

A replay certificate must bind the environment assumptions relevant to the claim.

### 10. Cache invalidation is evidence-bearing

Invalidating a stale cache is an operational action; proving that every claim derived from the stale cache has been identified is a separate completeness problem.

CACHE INVALIDATION != DEPENDENCY-CLOSURE PROOF
NO KNOWN STALE ENTRY != NO STALE DERIVATION

### 11. Recovery proof composition

A recovery proof can establish a bounded post-recovery invariant while leaving unknown whether a missing transition occurred during the crash window.

POST-RECOVERY INVARIANT != COMPLETE CRASH-WINDOW HISTORY

Therefore a recovery certificate cannot automatically convert every affected UNKNOWN into CONCRETE.

### 12. FutureObs_PAA

Even complete WAL/snapshot recovery, strict serializability, fencing and deterministic replay only establish properties within the declared retained history and observation domain.

RECOVERY EVIDENCE != FUTURE FINALITY
LINEARIZABLE HISTORY != FUTUREOBS_PAA CLOSURE

## Research-only recovery evidence boundary

A candidate recovery evidence object must bind:

- operation_id;
- prepare/commit/abort status;
- durable-log position;
- commit index/epoch where applicable;
- state-machine application status;
- snapshot revision;
- WAL range and loss boundary;
- cache revision and invalidation state;
- fencing/authority epoch;
- source/target incarnation;
- environment/reducer version;
- external-effect reconciliation status;
- dependency/provenance closure;
- conflict/revocation state;
- reconstruction completeness/loss set.

This remains research-only and is not a frozen Nexo protocol.

## Verdict

Audit-086 does NOT close:

P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
population completeness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

## Mandatory AB55/AB56 carryover

AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission

GLOBAL-AUDIT-087 — attack external-effect recovery and reconciliation:
two-phase/transactional outbox patterns, effect-before-commit and commit-before-effect windows, idempotent effect replay, compensation versus rollback, operation identity across epochs, crash-induced duplicate/omitted effects, stale authority during recovery, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
