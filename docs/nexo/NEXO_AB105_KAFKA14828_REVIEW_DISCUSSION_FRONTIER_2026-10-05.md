# NEXO AB105 — KAFKA-14828 REVIEW DISCUSSION FRONTIER — 2026-10-05

PR #13437 review/comment audit was performed to test whether the design discussion explicitly established cross-thread visibility/JMM publication.

Findings:
- Review discussion focuses on persistent collection choice, read/write performance, dependency trade-offs, wrappers, and benchmark behavior.
- No inspected review/comment established a per-update JMM happens-before guarantee for incremental StandardAuthorizerData.aclCache publication.
- The discussion supports the motivation: read-heavy workload, low write frequency, and avoiding R/W-lock latency.
- The PR's design remains snapshot-coherence oriented: construct immutable/persistent state, then expose a completed snapshot.
- This does not identify a separate synchronization edge from incremental removeAcl() on the metadata-loader writer thread to authorize() on request-handler readers.

Important source-vs-secondary distinction:
- Exact pinned source remains authoritative: StandardAuthorizer.data is volatile, but incremental addAcl/removeAcl mutate the plain aclCache field inside the same StandardAuthorizerData instance.
- A secondary current-source commentary page claims every mutation replaces volatile StandardAuthorizerData; that statement conflicts with the exact Kafka source and is NOT accepted as evidence for AB105.

Epistemic state:
- snapshot coherence: CONFIRMED
- incremental writer constructs complete immutable AclCache before assigning aclCache: CONFIRMED
- volatile publication via data for loadSnapshot/copyWithNewAcls: CONFIRMED
- volatile publication via data for incremental addAcl/removeAcl: NOT IDENTIFIED
- W1→D1 JMM HB: UNKNOWN / NOT IDENTIFIED
- stale read: NOT OBSERVED / NOT DISPROVEN
- vulnerability: NOT ESTABLISHED

Next frontier:
Inspect historical/post-merge changes to StandardAuthorizerData/StandardAuthorizer for any later correction that changed incremental publication semantics (for example replacing the outer data object on every ACL delta, adding a synchronization primitive, or documenting an explicit visibility guarantee). Do not infer from secondary commentary.