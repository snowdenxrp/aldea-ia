# NEXO GLOBAL AUDIT-085 — Crash Consistency, Partial Persistence and Recovery of Authority Transitions

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-085 attacks interrupted authority transitions: crash consistency, partial persistence, replay after interruption, stale/forked caches, recovery proofs, key/delegation reintroduction, proof-engine rollback, cross-epoch certificate invalidation, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

W3C PROV requires provenance validity to respect event-order constraints and explicitly models generation, usage and invalidation as events; a valid provenance instance therefore constrains what histories can be reconstructed from the retained record. It also distinguishes event ordering from physical timestamps. citeturn0search0turn0search4

in-toto v1.2 separates predicate semantics, subject-binding statement, authentication/serialization envelope, and bundles. Its parsing/versioning rules show that an upgrade can intentionally preserve some consumer-visible semantics while ignoring fields not recognized by the consumer. That preservation is layer- and contract-specific, not a universal equivalence claim. citeturn0search1turn0search2

## Findings

### 1. Crash between transition records creates a reconstruction boundary

Suppose an authority transition requires records R_old, R_transition and R_new. A crash after persisting only a subset does not justify reconstructing the missing transition as if it occurred.

PARTIAL PERSISTENCE != COMPLETE TRANSITION
FINAL STATE != PROVEN TRANSITION HISTORY

Recovery must distinguish committed transition evidence from merely prepared or observed state.

### 2. Replay after interruption

Replaying an interrupted transition can be safe for idempotent state mutation while still being unsafe as historical evidence.

IDEMPOTENT REPLAY != HISTORICAL OCCURRENCE PROOF
REPLAY SUCCESS != PROOF THAT THE ORIGINAL TRANSITION COMMITTED

The operation_id/replay identity can prevent duplicate effects, but it does not by itself establish whether an externally visible transition happened before the crash.

### 3. Stale cache recovery

A cached authority snapshot may be authentic yet stale.

AUTHENTIC CACHE != CURRENT AUTHORITY

Recovery must retain version/epoch/incarnation and anti-rollback evidence. Replacing a missing current snapshot with the newest locally available snapshot silently converts uncertainty into a current-authority claim.

NEWEST LOCAL != SEMANTICALLY CURRENT

### 4. Forked cache recovery

Two devices can hold different valid snapshots from different points or branches.

CACHE DIVERGENCE != AUTHORITY CONFLICT
AUTHENTIC FORK != PROVEN MERGE

A merge requires an authoritative transition relation. Unioning records can invent a history that never existed.

### 5. Recovery proof

A recovery proof can demonstrate that a state satisfies a postcondition without proving the exact historical sequence that produced it.

POSTCONDITION PROOF != HISTORY PROOF
STATE VALIDITY != TRANSITION HISTORY COMPLETENESS

For Nexo, the distinction matters because historical admission may depend on which authority epoch was active at the moment of a decision.

### 6. Key/delegation reintroduction

Restoring an old backup can reintroduce a key or delegation that was valid in an earlier epoch but revoked later.

RESTORATION != CURRENT REAUTHORIZATION
BACKUP VALIDITY != CURRENT AUTHORITY

Historical backup material must be bound to epoch/incarnation and checked against later revocation/rotation evidence before current authority is reconstructed.

### 7. Proof-engine rollback

Rolling back the proof engine can reproduce an older certificate representation without restoring the historical proof environment.

ENGINE ROLLBACK != HISTORICAL PROOF ENVIRONMENT
REPRODUCED CERTIFICATE != ORIGINAL PROOF EXECUTION

If semantics differ across engine versions, replay output alone cannot establish historical equivalence.

### 8. Cross-epoch certificate invalidation

A certificate issued under E1 and invalidated under E2 can retain historical evidentiary meaning while losing current admissibility.

E2 INVALIDATION != E1 ERASURE

Propagation must be scope-, interval-, target-incarnation-, dependency- and authority-aware.

### 9. Recovery from partial persistence can reopen UNKNOWN

If the crash leaves the system unable to determine whether a transition committed, current authority for affected claims must remain UNKNOWN unless an independent authoritative evidence path closes that boundary.

CRASH AMBIGUITY != FAILED TRANSITION
CRASH AMBIGUITY != COMMITTED TRANSITION

This is a direct continuation of the project's UNKNOWN discipline.

### 10. Idempotency and fencing are not semantic finality

An operation_id, fencing token, monotonic version or durable sequence can prevent stale actors from performing certain duplicate actions, but it does not alone prove the semantic meaning of every historical transition.

FENCING != HISTORICAL COMPLETENESS
MONOTONIC VERSION != SEMANTIC FINALITY

### 11. FutureObs_PAA

Even if recovery is perfectly crash-consistent and all historical transitions are reconstructed, the result is still bounded to the retained observation domain and authority contract.

CRASH CONSISTENCY != FUTURE FINALITY
RECOVERY COMPLETENESS != FUTUREOBS_PAA CLOSURE

## Research-only recovery boundary

For any authority transition whose recovery matters to a claim, retain at minimum:

- operation identity/idempotency identity;
- prepare/commit/abort state where applicable;
- authority epoch;
- predecessor/successor root;
- delegation chain;
- target/source incarnation;
- scope;
- proof-engine identity/version;
- transition event ordering;
- durable version/anti-rollback state;
- revocation and expiry evidence;
- checkpoint/cache provenance;
- fork/rejoin relation;
- recovery assumptions;
- reconstruction loss state;
- dependency/common-mode closure;
- conflict status.

This remains research-only and is not a frozen Nexo protocol.

## Verdict

Audit-085 does NOT close:

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

GLOBAL-AUDIT-086 — attack recovery evidence itself:
prepare/commit ambiguity, write-ahead logs versus authoritative state, idempotency and fencing semantics, crash-recovery linearizability, stale-reader resurrection, cache invalidation, snapshot/restore ordering, proof replay after environment drift, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
