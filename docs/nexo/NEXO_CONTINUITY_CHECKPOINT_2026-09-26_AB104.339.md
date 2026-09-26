# NEXO CONTINUITY — AB104.339

AB104.339 persisted. Research only; no implementation.

## Finding
A snapshot integrity hash authenticates the snapshot artifact, but restore can create a new logical identity and an older revision can require a revision/freshness barrier. citeturn0search0turn0search1 Therefore a GC certificate must bind to the exact summary/evidence artifact and its semantic context; signature/hash validity alone does not establish current validity.

Candidate binding includes commit ID, parent frontier, summary/dependency/coverage digests, authority epoch/config, target incarnation, schema/semantic version, and certificate status.

Recovery must verify artifact digest, target/incarnation, authority/config, semantic compatibility/migration, parent frontier, and successor/revocation contradictions.

## Invariants
`VALID_SIGNATURE != CURRENT_VALIDITY`
`VALID_DIGEST != SEMANTIC_COMPATIBILITY`
`HISTORICAL_GC_CERT != CURRENT_AUTHORIZATION`

Ambiguous/missing binding => `UNKNOWN`, not executable recovery permission.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.340 — study certificate revocation/supersession after compaction and restore.

## DO-NOT-REPEAT
Do not reuse an old valid GC certificate as current authority after restore/incarnation change without authenticated revalidation.
