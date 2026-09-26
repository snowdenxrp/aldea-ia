# NEXO AB104.338 — Crash-consistent GC commitment/certificate persistence

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
etcd documents that snapshots may omit data still present in WAL, so a snapshot alone is not necessarily the complete durable frontier. citeturn0search0 Its published v3.5 postmortem shows a crash-consistency failure where a consistency index was persisted before the corresponding database apply completed; recovery then skipped required WAL work. The lesson is that metadata claiming a frontier and the state it summarizes must share an atomic consistency boundary. citeturn0search2

## Finding
For Nexo, a GC certificate must never become durable as a stronger claim than the evidence it authenticates. The certificate/summary and the frontier it describes need an explicit crash-consistent commit boundary.

Candidate durable record:
`GC_COMMIT {commit_id, parent_frontier, coverage, retained_summary_digest, dependency_digest, authority_epoch, target_incarnation, semantic_version, status}`

Recovery must validate:
1. record integrity/authenticity;
2. complete record/commit marker;
3. predecessor/frontier consistency;
4. summary digest and coverage binding;
5. authority/incarnation/schema compatibility;
6. no contradictory later record.

A torn/incomplete certificate is not evidence of committed GC. A certificate whose metadata is durable but whose referenced summary is not durably bound is `UNKNOWN/STOP`, not accepted as complete.

## Important distinction
`DURABLE_CERTIFICATE != DURABLE_TRUTH`.
The certificate proves only the exact scope it binds. A crash-safe commit boundary prevents the certificate from falsely advancing the recovery frontier, but it does not make the underlying historical claim true by itself.

## Status
Exact WAL/checkpoint format and atomic storage mechanism remain UNSELECTED. No implementation/formal verification performed.

## Next
AB104.339 — study authenticated cross-record binding: how to prevent a valid GC certificate from referencing a missing, replaced, or semantically incompatible summary after recovery/restore.
