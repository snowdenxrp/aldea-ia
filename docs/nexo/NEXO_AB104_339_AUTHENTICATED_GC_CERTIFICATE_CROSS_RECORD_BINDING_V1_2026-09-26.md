# NEXO AB104.339 — Authenticated cross-record binding after restore

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
etcd restore verifies a snapshot integrity hash when one exists, but a snapshot can represent an older revision and restore creates a new logical cluster identity; revision bump/mark-compacted are used to prevent old revisions from being treated as current. citeturn0search0turn0search1 This shows that integrity of one artifact does not by itself establish current semantic validity after restore.

## Finding
A Nexo GC certificate must bind to the exact summary/evidence artifact it certifies, plus its semantic context. A valid certificate signature/hash must not remain valid if the referenced summary is replaced, restored from another incarnation, or interpreted under an incompatible schema.

Candidate binding:
`GC_CERT = H(commit_id || parent_frontier || summary_digest || dependency_digest || coverage_digest || authority_epoch/config || target_incarnation || schema_semantic_version || certificate_status)`

Recovery checks:
1. referenced summary exists and matches digest;
2. summary's target/incarnation matches certificate;
3. authority/epoch/config matches;
4. schema/semantic version is compatible or has authenticated migration evidence;
5. parent frontier is valid and causally compatible;
6. no authenticated successor/revocation contradicts the certificate.

If any binding is missing or ambiguous => certificate is historical evidence only / `UNKNOWN`, not an executable recovery frontier. A restore that changes logical identity must not silently reuse the old certificate as current authority.

## Boundary
`VALID_SIGNATURE != CURRENT_VALIDITY`
`VALID_DIGEST != SEMANTIC_COMPATIBILITY`
`HISTORICAL_GC_CERT != CURRENT_AUTHORIZATION`

## Status
Exact canonical encoding, signature scheme, migration contract, and implementation remain UNSELECTED. No formal verification performed.

## Next
AB104.340 — study certificate revocation/supersession after compaction and restore, including how later authority or semantic changes invalidate previously valid GC summaries.
