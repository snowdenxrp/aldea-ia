# NEXO GLOBAL AUDIT-101 — External-Effect History Retention and Reconstructability

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope
Provider log truncation/TTL, tombstones, deleted resources, dedup-window expiry, receipt retention, snapshot/compaction boundaries, and whether finite retention can close FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

AWS Durable Execution exposes execution history only while running and for a bounded post-completion retention period of 1–90 days, default 30 days. The history is paginated and can optionally include execution data. This is a concrete example where a provider's audit history has a finite availability contract. citeturn0search1turn0search5

Google Cloud Tasks documents a maximum task retention of 31 days and a task-name deduplication window of up to 24 hours after deletion. These are separate limits, so deduplication identity retention is not equivalent to full task/effect-history retention. citeturn0search0turn0search3

etcd documents that Raft log entries are truncated after a snapshot/compaction boundary and that older MVCC keyspace revisions become inaccessible after compaction. Its retention can be time- or revision-based. citeturn0search7turn0search10

etcd/raft source explicitly models snapshots as reconstructing state at a point and compaction as discarding log entries before a boundary. The snapshot is therefore a state reconstruction artifact, not automatically a complete historical event log. citeturn0search2

## Findings

FINITE RETENTION != COMPLETE HISTORY

RETENTION WINDOW != EFFECT HISTORY WINDOW

DEDUP WINDOW != HISTORY RETENTION

CURRENT SNAPSHOT != COMPLETE EVENT HISTORY

SNAPSHOT RECONSTRUCTION != HISTORICAL RECONSTRUCTION

COMPACTION BOUNDARY != SEMANTIC ERASURE PROOF

COMPACTION SUCCESS != PRESERVATION OF ALL CLAIM-RELEVANT PROVENANCE

DELETED RESOURCE != PROVEN NON-EXISTENCE

TOMBSTONE != COMPLETE PRE-DELETION HISTORY

EXPIRY != HISTORICAL NON-OCCURRENCE

TTL EXPIRATION != EFFECT ABSENCE

RETAINED RECEIPT != COMPLETE ATTEMPT HISTORY

RECEIPT RETENTION != WORLD-EFFECT RETENTION

CURRENT STATE + RETAINED RECEIPTS != COMPLETE HISTORY

SNAPSHOT + RETAINED SUFFIX != COMPLETE PRE-SNAPSHOT HISTORY

RECONSTRUCTION FROM STATE != RECONSTRUCTION OF CAUSAL PATH

REVISION RETENTION != OPERATION RETENTION

LOG RETENTION != EXTERNAL EFFECT RETENTION

PROVIDER RETENTION CONTRACT != WORLD RETENTION CONTRACT

FINITE PROVIDER HISTORY != FUTUREOBS_PAA CLOSURE

## Critical result

A finite retention policy can only support a bounded reconstruction claim if the required observation horizon, dependency horizon, revocation horizon, reconciliation horizon, and effect-finality horizon are themselves bounded by a formally justified contract.

Without such a bound, expiry/compaction creates an epistemic gap rather than proving absence.

Therefore:

FINITE RETENTION + UNBOUNDED REQUIRED HORIZON -> UNKNOWN

A finite horizon could become sufficient only if a future architecture formally establishes all required dependencies and their maximum validity horizon. That has NOT been established here.

## Retention decomposition required for future formalization

For every external operation, research must distinguish at minimum:

- logical operation ID and namespace;
- provider operation ID;
- provider incarnation;
- attempt/retry lineage;
- task/job/resource identity;
- submission/acceptance evidence;
- state-transition evidence;
- receipt identity and issuer;
- event-time vs observation-time;
- deduplication interval;
- execution-history retention interval;
- provider log retention;
- snapshot/compaction boundary;
- tombstone/deletion retention;
- external sub-effect evidence;
- reconciliation evidence;
- authority/fencing epoch;
- credential/revocation horizon;
- provenance/dependency closure;
- reconstruction loss after expiry.

## New unresolved question

The next layer is not simply “how long should Nexo retain data?”

It is:

WHAT MINIMUM EVIDENCE MUST SURVIVE HOW LONG, AND UNDER WHICH FORMAL CONDITIONS, FOR A HISTORICAL CLAIM TO REMAIN RECONSTRUCTIBLE?

Until that is formally bounded, retention is an information-loss boundary and cannot be promoted to FutureObs_PAA closure.

## Epistemic state — unchanged

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

GLOBAL-AUDIT-102 — tombstones, deletion semantics, resource recreation, identity reuse, and whether deletion/recreation can preserve or break historical effect identity and reconstruction.

No implementation. No V21. Preserve UNKNOWN.
