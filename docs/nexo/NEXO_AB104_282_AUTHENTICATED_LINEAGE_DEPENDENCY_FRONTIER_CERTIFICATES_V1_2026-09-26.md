# NEXO AB104.282 — Authenticated lineage/dependency graphs and compact frontier certificates
Date: 2026-09-26
Status: RESEARCH ONLY

## Findings
A recovery frontier certificate cannot safely be just a hash plus a revision. Distributed causality is partial, so a certificate must preserve enough authenticated lineage to establish what the frontier covers and what it depends on. Lamport's happened-before relation is explicitly a partial order; incomparable events are not ordered merely because a scalar clock can assign them different values.

etcd provides a concrete recovery example: a snapshot has a revision and integrity hash, but restoring it creates a new logical cluster identity; restoring an older snapshot can move the visible revision backwards, and etcd documents revision bumping/compaction specifically to invalidate stale watcher state. This shows that snapshot revision alone is insufficient to describe safe post-restore semantics. citeturn0search0turn0search1

etcd's data model also keeps multiple dimensions: global revision, per-key generation/version and modification history; compaction removes historical information before a boundary. Therefore an evidence/frontier certificate needs coverage/retention semantics, not only a latest revision. citeturn0search6turn0search5

## Candidate authenticated dependency graph
For a recovery claim C, represent dependencies as a DAG whose nodes are claims/frontiers and whose edges state required predecessor/coverage relationships. Candidate node fields:
- claim_id / scope
- issuer and trust-anchor lineage
- statement digest
- authority generation/config digest
- target identity + incarnation
- local domain frontier
- predecessor digests
- evidence/coverage range
- retention/compaction boundary
- schema/semantic version
- dependency IDs
- status: VERIFIED / STALE / CONFLICT / UNKNOWN

The graph itself must be authenticated or anchored to authenticated roots. A valid node does not make every descendant valid: current admissibility must revalidate authority, incarnation, freshness and dependencies.

## Compact certificate principle
A compact certificate may summarize history only if it preserves the semantic information required for future decisions. Candidate certificate:
CERT = (statement_digest, scope, root/authority_generation, target_incarnation, local_frontier, predecessor_digest(s), coverage_frontier, retention_boundary, semantic_version, dependency_digest/root, authenticity/integrity proof).
A certificate is evidence of the summarized history, not permission to execute an effect.

If compaction removes a dependency needed to distinguish COMMITTED from UNKNOWN or NOT_COMMITTED, the certificate is insufficient and recovery must remain UNKNOWN rather than infer absence. etcd explicitly makes compacted revisions unavailable, illustrating why coverage boundaries matter. citeturn0search2turn0search6

## Critical non-equivalence
CERT_VALID != CURRENT_AUTHORIZATION
CERT_VALID != TARGET_COMMITTED
CERT_ABSENCE != TARGET_NOT_COMMITTED
CERT_NEWER != MORE_AUTHORIZED

## Open
- Minimum certificate fields.
- Canonical authenticated graph format.
- Whether graph root can be summarized by a Merkle-style commitment without losing decision-relevant semantics.
- Exact retention/coverage proof required for negative evidence.
- Formal verification/implementation not performed.

## Carry-forward
AB50→AB58 residuals unchanged. AB104.256/257/259 and other PENDING items remain unresolved. No architecture implementation, overwrite, deletion, migration, or semantic freeze.

## Next
AB104.283 — investigate authenticated graph commitments/Merkle-style summaries and their limits for dependency completeness and negative evidence.
