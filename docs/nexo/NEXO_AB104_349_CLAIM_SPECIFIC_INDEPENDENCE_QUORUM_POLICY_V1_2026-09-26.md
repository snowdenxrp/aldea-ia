# NEXO AB104.349 — Claim-specific independence without scalar security scores

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
C2SP transparency policies express quorum through explicit witness groups and thresholds, allowing different organizational groups to be required simultaneously rather than reducing evidence to a raw count. citeturn0search1 RFC 9162 shows that append-only consistency can be audited through consistency proofs, while consistency of views across query sources is a separate concern. citeturn0search0turn0search2

## Finding
Nexo should represent independence as a **claim-specific predicate over failure-domain coverage**, not as a scalar security score. A claim declares the domains whose common failure would invalidate its evidence. A witness set is admissible only if the selected witnesses collectively satisfy those domain requirements.

Candidate requirement:
`IndependenceRequirement = {claim_id, required_domains, forbidden_shared_domains, minimum_coverage_interval, quorum_rule}`

Candidate evaluation:
`SATISFIED | CORRELATED | INSUFFICIENT_COVERAGE | UNKNOWN | CONFLICT`.

Example: a claim requiring independence from one operator may require witnesses from at least two operator domains. A different claim concerned only with storage loss might require storage-domain separation but not operator separation. No numeric “independence score” is needed.

Critical boundary: witness grouping proves only that the policy's structural conditions are met. It does not prove that the modeled domains are actually independent or that the underlying claim is true. C2SP itself describes groups by organizational separation; Nexo must retain the distinction between declared policy and verified real-world independence.

## Invariants
`INDEPENDENCE_PREDICATE != SECURITY_SCORE`
`POLICY_SATISFIED != REAL_WORLD_INDEPENDENCE_PROVEN`
`WITNESS_QUORUM != CLAIM_TRUTH`
`CORRELATED_REQUIRED_DOMAIN => UNKNOWN/STOP`.

## Status
Exact domain ontology, discovery/evidence method and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.350 — study how Nexo can authenticate the independence-domain metadata itself without trusting a single operator to self-attest all failure domains.
