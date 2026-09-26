# NEXO AB104.315 — Authenticated coverage certificates for negative evidence

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
A cryptographic commitment to a dataset proves properties only relative to the committed universe/frontier. For a negative claim, the verifier needs both non-membership evidence and an authenticated statement that the inspected universe/range is complete for the claim. Merkle transparency systems demonstrate this separation: roots commit to a tree, inclusion proofs establish membership, and consistency proofs establish continuity between tree states. Non-membership requires an appropriate ordered/range proof or equivalent coverage argument. citeturn0search0turn0search1turn0search12

## Nexo consequence
1. Candidate negative-evidence certificate must bind `target_id`, `target_incarnation`, authenticated frontier/tree root, queried operation identity, covered range/universe, retention/compaction state, and non-membership proof.
2. `NOT_FOUND` without coverage is an observation, not a proof of `NOT_COMMITTED`.
3. A Merkle root alone is insufficient: it authenticates the committed tree but does not by itself establish that the queried universe is complete for the required claim.
4. Coverage must include the relevant time/sequence/revision interval and target incarnation; gaps become UNKNOWN.
5. A consistency proof can establish that a newer authenticated tree extends an older tree, but it does not by itself prove non-membership of an operation.
6. After restore, the certificate must bind the new incarnation/frontier; an old root cannot silently become current executable evidence.

## Candidate certificate
`CoverageCertificate = {target_id, target_incarnation, frontier, universe/range, retention_state, root_digest, consistency_lineage, non_membership_proof, signer/authority}`

## Explicit non-claims
Exact proof system is UNSELECTED. No formal proof or implementation performed.

## Sources studied
RFC 9162 Certificate Transparency v2; RFC 6962; IACR survey material on non-membership/range proofs. citeturn0search0turn0search1turn0search12

## Next
AB104.316 — investigate coverage gaps caused by compaction, retention expiry, and partitioned history, and define the resulting UNKNOWN boundaries.
