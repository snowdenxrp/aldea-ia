# NEXO GLOBAL AUDIT-084 — Authority-Transition Reconstruction and Cross-Epoch Certificate State

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-084 attacks reconstruction across authority transitions: root rotation, delegation fork/rejoin, revocation ordering, certificate replacement, proof-engine migration, conflicting authority snapshots, authority rollback, quorum across epochs, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

W3C PROV models changing entities with distinct identifiers/lifetimes and explicit generation/invalidation events; it also requires event-order consistency and defines equivalence over normalized valid instances. Equivalence is therefore bounded by the provenance instance and application contract, not an unrestricted identity claim. citeturn0search0

TUF's current specification requires root transitions to be signed by threshold keys from both the currently trusted root and the new root, requires consecutive root versions, and treats root expiry separately from the transition process. It also uses root changes to trigger recovery actions after key rotation. citeturn1search3

python-tuf's tests concretely exercise malformed intermediate roots, non-consecutive roots, rollback, freeze, key rotation, cached intermediate roots, and rollback checks using expired local timestamp/snapshot metadata. This demonstrates that transition state and retained historical metadata can remain security-relevant even after expiry. citeturn1search0

The TUF specification repository also contains an issue documenting a subtle recovery/rollback boundary around root persistence and subsequent key-rotation recovery steps; this is evidence that a transition can have crash/recovery semantics not captured by a simple final-state comparison. citeturn1search4

in-toto v1.2 separates predicate, statement, envelope and bundle layers, reinforcing that claim semantics, subject binding, authentication/serialization and grouping are distinct layers whose transitions should not be silently conflated. citeturn0search1turn0search2

## Findings

### 1. Root rotation is a semantic transition

A new root cannot simply replace an old root because the final state looks valid.

The transition itself is evidence: old authority validates the transition into the new authority, and the new root establishes its continuing authority. TUF explicitly requires threshold signatures from both old and new trusted root key sets for a root transition.

FINAL ROOT STATE != COMPLETE TRANSITION PROOF
ROOT ROTATION != SIMPLE KEY-SET REPLACEMENT

### 2. Fork/rejoin of delegation state

Two valid authority snapshots can diverge while retaining authentic signatures. A later merge/rejoin does not prove that the union of their authority histories was the actual history.

UNION OF AUTHORITY SNAPSHOTS != AUTHORITY HISTORY THAT OCCURRED
AUTHENTIC FORKS != AUTOMATICALLY MERGEABLE HISTORY

The rejoin certificate needs explicit precedence, scope, interval, epoch and conflict semantics. If these are unresolved, current authority remains UNKNOWN for affected claims.

### 3. Revocation ordering

Revocation and replacement events cannot be ordered by arrival alone.

A certificate accepted under epoch E1 can be historically valid even if its issuer is revoked in E2. Conversely, a revocation whose semantic effective interval precedes a later admission may invalidate current admissibility even if it arrived afterward.

ARRIVAL ORDER != SEMANTIC EVENT ORDER
CURRENT REVOCATION != RETROACTIVE ERASURE

### 4. Certificate replacement

Replacing an equivalence certificate is not equivalent to editing the old certificate.

The system must distinguish:
- predecessor certificate;
- successor certificate;
- reason for replacement;
- scope;
- effective interval;
- authority epoch;
- proof-engine version;
- whether historical admissions remain bound to the predecessor.

REPLACEMENT != MUTATION OF HISTORY
SUCCESSOR CERTIFICATE != PROOF THAT PREDECESSOR WAS FALSE

### 5. Proof-engine migration

A new proof engine can reproduce the same outputs while changing proof assumptions or observer semantics.

A migration certificate must therefore establish the relation between old and new proof semantics for the exact observer/claim contract.

SAME RESULT != SAME PROOF SEMANTICS
ENGINE COMPATIBILITY != HISTORICAL EQUIVALENCE

### 6. Conflicting authority snapshots

Two snapshots can each be internally authentic and still disagree about the active authority.

Cryptographic authenticity does not select which snapshot is semantically current.

AUTHENTIC SNAPSHOT != CURRENT SNAPSHOT
TWO VALID SNAPSHOTS != ONE VALID CURRENT AUTHORITY

A precedence rule must itself be authority- and epoch-bound. Deterministic selection without such semantics creates unsupported authority.

### 7. Authority rollback

A rollback to an earlier authority snapshot can resurrect old keys/delegations unless anti-rollback state is retained.

TUF explicitly tests root version rollback and non-consecutive root transitions, and its implementation tests also preserve local version state for rollback detection. citeturn1search0turn1search3

ROLLBACK PROTECTION != HISTORICAL COMPLETENESS
OLD AUTHORITY SNAPSHOT != CURRENT AUTHORITY

### 8. Cross-epoch quorum

A quorum assembled from certificates across E1 and E2 cannot be treated as a single contemporaneous quorum without proving:
- membership/authority at each epoch;
- certificate validity intervals;
- cross-epoch transition semantics;
- no revoked dependency crossing the boundary;
- independence after accounting for shared roots.

CROSS-EPOCH QUORUM != SINGLE-EPOCH QUORUM
THRESHOLD COUNT != TEMPORAL COHERENCE

### 9. Retention and reconstruction

A final authority snapshot may be sufficient for current validation but insufficient to reconstruct historical admission.

TUF's cached intermediate-root behavior and rollback tests show that intermediate transition material can remain necessary to validate a current update path. citeturn1search0

CURRENT SNAPSHOT != COMPLETE HISTORICAL RECONSTRUCTION
RETAINED FINAL STATE != RETAINED TRANSITION PROOF

### 10. FutureObs_PAA

Even perfect reconstruction of authority transitions establishes only historical/current admissibility under the declared contract.

It does not establish that an external future observation cannot distinguish the claim.

AUTHORITY-TRANSITION CLOSURE != FUTURE FINALITY
HISTORICAL RECONSTRUCTION != FUTUREOBS_PAA CLOSURE

## Research-only reconstruction boundary

For a claim C reconstructed across authority epochs, a safe candidate boundary must retain:

- authority epoch and predecessor/successor relation;
- root/delegation chain;
- certificate identity and predecessor/successor relation;
- issuer authority at the relevant interval;
- target/source identity and incarnation;
- scope;
- observer contract;
- proof-engine identity/version;
- semantic migration relation;
- revocation/expiry state;
- event ordering;
- rollback/anti-rollback evidence;
- dependency/common-mode closure;
- retained-history/loss state;
- conflict resolution semantics.

This is research-only, not a frozen Nexo protocol.

## Verdict

Audit-084 does NOT close:

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

GLOBAL-AUDIT-085 — attack transition certificates and recovery evidence:
crash consistency, partial persistence, replay after interrupted transitions, stale/forked caches, recovery proofs, key/delegation reintroduction, migration rollback, cross-epoch certificate invalidation, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
