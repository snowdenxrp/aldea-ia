# NEXO CONTINUITY — AB104.338

AB104.338 persisted. Research only; no implementation.

## Finding
etcd warns a snapshot may omit data still present in WAL, so snapshot state is not automatically the complete durable frontier. citeturn0search0 Its v3.5 postmortem demonstrates a crash-consistency failure when a persisted consistency index advanced ahead of the database apply; recovery then skipped required WAL work. citeturn0search2

Nexo implication: GC certificate/summary metadata must share an explicit crash-consistent boundary with the frontier/evidence it claims to summarize.

Candidate GC commit fields: commit ID, parent frontier, coverage, summary digest, dependency digest, authority epoch, target incarnation, semantic version, status.

Recovery validates integrity, completeness, predecessor/frontier, summary/coverage binding, authority/incarnation/schema compatibility, and contradictions.

## Invariants
`DURABLE_CERTIFICATE != DURABLE_TRUTH`
A torn certificate is not committed GC. A certificate referencing non-durable/incompatible evidence => `UNKNOWN/STOP`.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.339 — study authenticated cross-record binding so a valid GC certificate cannot reference missing/replaced/incompatible summary data after recovery or restore.

## DO-NOT-REPEAT
Do not let metadata advance the claimed recovery frontier beyond the durable evidence it actually binds.
