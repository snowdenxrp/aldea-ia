# NEXO GLOBAL AUDIT-095 — Split-Brain, Rollback and Identity/Authority Divergence

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope
Old/new incarnations concurrently alive, stale writers after restore, provider namespace reuse, operation-ID collisions, fencing divergence, dedup divergence, identity-map conflicts, anti-rollback bypasses, FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence
The Raft paper states terms are monotonically increasing logical clocks; stale leaders step down after observing a higher term and stale-term requests are rejected. citeturn0search36

HashiCorp Raft's current code responds to in-flight operations with ErrLeadershipLost when a leader steps down, separating leadership loss from client-visible operation outcome. citeturn0search4

HashiCorp Raft issue #661 reports a concrete 2025 crash-persistence safety bug involving non-atomic term/vote persistence; the reported scenario could permit a second vote after recovery and two leaders in one term. The issue is closed, but it is direct evidence that recovery atomicity is part of an authority boundary. citeturn0search5

The etcd Raft implementation rejects proposals when no leader is known and tracks term/leader state explicitly. citeturn0search10

## Findings
NEW INCARNATION != OLD INCARNATION
NEW IDENTITY != ERASURE OF OLD AUTHORITY HISTORY
AUTHENTIC CREDENTIAL != CURRENT WRITE AUTHORITY
OLD EPOCH != CURRENT AUTHORITY
LOCAL FENCE != EXTERNAL FENCE
FENCING INTENT != FENCING ENFORCEMENT
SAME NAMESPACE != SAME INCARNATION
NAMESPACE REUSE != IDENTITY CONTINUITY
SAME OPERATION_ID != SAME HISTORICAL OPERATION
ID COLLISION != DUPLICATE EXECUTION PROOF
SAME KEY != SAME DEDUP HISTORY
DEDUP AGREEMENT != EFFECT HISTORY
MAPPING CONFLICT != AUTOMATIC IDENTITY CONFLICT
CONFLICTING MAPS != JUSTIFIED PRECEDENCE
MONOTONIC VERSION != GLOBAL ANTI-ROLLBACK
ANTI-ROLLBACK DOMAIN != WORLD DOMAIN
ATOMIC RECOVERY BOUNDARY != STORAGE OPTIMIZATION
RECOVERY INTEGRITY != AUTOMATIC EXTERNAL AUTHORITY
LEADERSHIP LOSS != EFFECT ABSENCE
CLIENT ERROR != EXTERNAL NON-EXECUTION
AUTHENTIC A + AUTHENTIC B != ONE CURRENT AUTHORITY
SPLIT-BRAIN CLOSURE != FUTURE FINALITY
AUTHORITY RECONSTRUCTION != FUTUREOBS_PAA CLOSURE

## Safe research boundary
Raft term fencing is a bounded consensus mechanism, not automatic fencing for arbitrary external providers. Provider-side enforcement must be evidenced separately.

A recovered identity/epoch is not current merely because it authenticates. Namespace reuse and operation-ID reuse require incarnation and effective-interval binding. Dedup state is temporal and provider-specific.

Recovery atomicity can affect authority semantics; a locally valid restored state is not enough if the authoritative transition boundary was torn.

FutureObs_PAA remains UNKNOWN.

## Research-only authority/identity boundary
Bind logical identity, incarnation, provider/namespace, authority/fencing epoch, credential epoch, operation ID/namespace, dedup epoch/window, routing/migration epoch, snapshot/checkpoint, restoration event, identity-map version, anti-rollback state, receipt/reconciliation lineage, external enforcement evidence, provenance/dependency closure, reconstruction loss, and conflict/revocation state.

## Verdict
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
GLOBAL-AUDIT-096 — authority/identity revocation propagation across incarnations: credential revocation, old-key reuse, delayed revocation visibility, provider-side credential caches, fencing-token reuse, emergency authority, recovery after revocation, FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
