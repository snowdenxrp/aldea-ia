# NEXO GLOBAL AUDIT-093 — Recovery Evidence: WAL, Snapshots, Dedup Stores and Checkpoint Alignment

Date: 2026-09-28
Latest audit: GLOBAL-AUDIT-093

## Scope
Snapshot/WAL atomicity, provider recovery, dedup-store restoration, cross-provider checkpoint alignment, receipt replay, recovery idempotency, fencing persistence, disaster recovery, FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence
HashiCorp Raft documents a real commit/apply separation: commands are durably committed to a quorum before application to the FSM, leaving a window where committed state and applied state differ. citeturn0search1turn0search9

HashiCorp raft-wal documents crash recovery around explicit commit frames, fsync and torn writes; recovery can discard uncommitted/corrupt tail data while retaining prior committed frames. citeturn0search2

etcd's current disaster-recovery documentation states a snapshot can omit data still present in WAL, restoring an older revision can make caches stale, and restore creates a new logical cluster identity. citeturn0search7

AWS Durable Execution documents deterministic OperationId and attempt numbers, and explicitly warns that replay can rerun side effects unless idempotency semantics are used. citeturn0search3turn0search0

## Findings
COMMITTED LOG != APPLIED STATE
DURABLE SNAPSHOT != COMPLETE WAL
WAL != COMPLETE SNAPSHOT
COMMIT FRAME != EXTERNAL EFFECT
RECOVERED LOCAL STATE != PROVEN EXTERNAL HISTORY
TORN TAIL != PROVEN NON-OCCURRENCE
SNAPSHOT REVISION != CURRENT REVISION
RESTORED CLUSTER != SAME CLUSTER INCARNATION
RESTORED DEDUP STORE != HISTORICAL DEDUP STATE
DEDUP CHECKPOINT != COMPLETE REQUEST HISTORY
RECEIPT REPLAY != EFFECT REPLAY
REPLAYED RECEIPT != NEW OBSERVATION
RECOVERY IDEMPOTENCY != HISTORICAL SINGULARITY
FENCING STATE RESTORE != PROOF OF PAST FENCING
A+B CHECKPOINTS != PROVEN JOINT STATE
CROSS-PROVIDER EPOCH ALIGNMENT != SEMANTIC EQUIVALENCE
DISASTER-RECOVERY SUCCESS != HISTORICAL COMPLETENESS
CACHE REFRESH != HISTORY RECONSTRUCTION
COMMIT/APPLY RECOVERY != EXTERNAL-EFFECT RECOVERY
RECOVERY CLOSURE != FUTURE FINALITY
RECOVERY EVIDENCE != FUTUREOBS_PAA CLOSURE

## Key analysis
1. WAL/snapshot recovery can establish a bounded local state-machine history if its commit boundary and integrity rules are explicit. It does not automatically establish external effect history.
2. A provider dedup store is itself historical state. Restoring an older dedup snapshot can change whether a replay is treated as duplicate.
3. Receipt replay must not be counted as a second provider observation merely because the receipt was reprocessed locally.
4. Cross-provider recovery requires a relation between checkpoints; independently valid snapshots can describe different semantic times.
5. Fencing persistence protects future writers only when the external boundary enforces the fencing contract. Restoring an old fencing epoch cannot retroactively prove that stale writers did not act.
6. etcd's documented new cluster identity after restore is a concrete example that recovery can intentionally create a new incarnation rather than preserve identity. citeturn0search7
7. AWS's deterministic OperationId across replay demonstrates how stable operation identity can survive local replay, but it does not itself prove the external provider performed exactly one effect. citeturn0search3
8. Raft's commit/apply separation demonstrates why a recovery proof must identify which boundary is being claimed. citeturn0search1

## Research-only recovery evidence boundary
Candidate record must bind:
- snapshot ID and revision;
- WAL range and commit boundary;
- state-machine applied index;
- dedup-store snapshot/epoch;
- provider operation/receipt history;
- provider checkpoint/version;
- cross-provider checkpoint relation;
- fencing/authority epoch;
- cluster/source incarnation;
- replay/attempt lineage;
- idempotency namespace;
- cache revision;
- restoration event;
- integrity/hash evidence;
- retention/compaction loss;
- provenance/dependency closure;
- conflict/revocation state.

This remains research-only and is not a frozen Nexo protocol.

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

Mandatory AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission
GLOBAL-AUDIT-094 — attack checkpoint/identity continuity:
restore-created incarnations, cluster/member identity, operation-ID continuity, fencing epoch monotonicity, dedup epoch continuity, provider identity migration, stale snapshots, anti-rollback and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
