# NEXO CONTINUITY — AB104.315

## Canonical state
AB104.315 research persisted. No implementation performed.

## Finding
Negative evidence needs two things: non-membership evidence and an authenticated statement that the relevant universe/range/history is complete enough for the claim. A Merkle root alone does not establish that coverage. RFC 9162 separates Merkle commitment/inclusion/consistency; non-membership needs an appropriate range/coverage proof. citeturn0search0turn0search12

## Candidate certificate
CoverageCertificate binds target identity/incarnation, authenticated frontier/root, covered range/universe, retention state, lineage, non-membership proof, and authority.

## Constraints
Research first; no V21; no historical patching; no unsupported security/correctness/verification claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.316: study compaction, retention expiry, partitioned history, and the UNKNOWN boundaries they create for negative evidence.

## DO-NOT-REPEAT
Do not treat a Merkle root, inclusion proof, empty query result, or consistency proof alone as proof that an operation never committed.
