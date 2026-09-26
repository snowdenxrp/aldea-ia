# NEXO CONTINUITY — AB104.353

AB104.353 persisted. Research only; no implementation.

## Finding
A dependency traversal reaching a signed terminal node does not by itself prove closure. RFC 6024 treats trust anchors as locally configured authority with constrained scope; RFC 5280 treats the trust anchor as an input to validation. RATS protects the trust-anchor store, while current CORIM models terminus trustees as trust roots in an acyclic dependency graph. citeturn1search0turn1search2turn0search0turn0search3

Candidate separation:
`AUTHENTIC_TERMINAL != TRUSTED_TERMINAL`
`TRUSTED_TERMINAL != COMPLETE_BOUNDARY`
`COMPLETE_BOUNDARY != UNIVERSAL_COMPLETENESS`

Candidate BoundaryCertificate:
`claim_id + boundary_id + boundary_type + graph_root_digest + covered_scope + exclusion_rule + terminal_authority + authority_epoch + semantic_version + frontier + status`

`CLOSED_FOR_CLAIM` requires claim-specific traversal scope, accepted anchor/delegation, authority/scope compatibility, freshness/frontier compatibility, and no claim-relevant unresolved dependency/cycle/revocation gap/conflict.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.354 — study trust-anchor/boundary rotation and revocation, including anti-resurrection during recovery.

## DO-NOT-REPEAT
Do not infer boundary trust from the boundary's own signature alone. Do not infer closure from reaching a terminal node.
