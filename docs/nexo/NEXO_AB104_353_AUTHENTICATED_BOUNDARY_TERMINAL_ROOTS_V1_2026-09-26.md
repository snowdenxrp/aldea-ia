# NEXO AB104.353 — Authenticated boundary nodes and terminal-root trust V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 6024 defines a trust anchor as an authoritative entity represented by a public key plus associated data that constrains what the anchor is authoritative for; trust anchors have local significance and their integrity is normally established by configuration/out-of-band means. citeturn1search0turn1search1 RFC 5280 treats the trust anchor as an input to path validation rather than merely another certificate in the path, and path validity is scoped by the selected anchor and application policy. citeturn1search2turn1search3 RATS likewise places trust anchors in a protected trust-anchor store and separates trust-anchor configuration from subsequent evidence appraisal. citeturn0search0 Current CORIM work models terminus trustees as roots of trust and requires trust-dependency graphs to be acyclic, but this does not by itself establish that a presented terminal boundary is complete or appropriate for every claim. citeturn0search3turn0search5

## Finding
A dependency traversal cannot prove closure merely because it reached a cryptographically authenticated terminal node. The terminal node is a **boundary assertion** whose authority and scope must already be anchored by policy/configuration or by an independently authenticated higher-level transition.

Candidate boundary record:
`BoundaryCertificate = claim_id + boundary_id + boundary_type + graph_root_digest + covered_scope + exclusion_rule + terminal_authority + authority_epoch + semantic_version + frontier + status`

Candidate terminal statuses:
`ANCHOR_ACCEPTED | ANCHOR_SCOPE_MISMATCH | ANCHOR_STALE | ANCHOR_UNTRUSTED | BOUNDARY_INCOMPLETE | CLOSED_FOR_CLAIM | UNKNOWN | CONFLICT`

Candidate closure rule:
`CLOSED_FOR_CLAIM` only if:
1. the claim's policy explicitly names the dependency classes and traversal scope;
2. every reached terminal is bound to an accepted trust anchor or an authenticated authority transition;
3. the anchor/boundary metadata constrains the terminal's authority to the claim's required scope;
4. the authenticated frontier/semantic version is compatible with the claim;
5. no excluded dependency class can affect the claim under the declared policy;
6. no unresolved cycle, stale epoch, revocation gap, or contradictory dependency remains.

Important distinction:
`AUTHENTIC_TERMINAL != TRUSTED_TERMINAL`
`TRUSTED_TERMINAL != COMPLETE_BOUNDARY`
`COMPLETE_BOUNDARY != UNIVERSAL_COMPLETENESS`

A self-signed or otherwise validly signed terminal object cannot bootstrap its own trust merely by containing a signature. RFC 6024 explicitly treats trust-anchor establishment as a configuration/management problem, while RFC 5280 makes the trust anchor an input to validation. citeturn1search0turn1search2

## Nexo implication
The dependency graph should therefore distinguish:
- **graph integrity** — was this graph altered?
- **boundary authenticity** — who issued the boundary statement?
- **boundary authority** — is that issuer an accepted trust anchor/authorized delegate?
- **boundary scope** — what claims/dependency classes does the boundary cover?
- **boundary freshness** — is its epoch/frontier current enough?
- **closure** — does the boundary actually exclude all claim-relevant dependencies?

No single signature should collapse these predicates.

## Status
Exact discovery mechanism, trust-anchor rotation semantics, boundary revocation semantics, and formal closure proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.354 — study trust-anchor/boundary rotation and revocation: how a previously accepted terminal root becomes stale without resurrecting old authority during recovery.
