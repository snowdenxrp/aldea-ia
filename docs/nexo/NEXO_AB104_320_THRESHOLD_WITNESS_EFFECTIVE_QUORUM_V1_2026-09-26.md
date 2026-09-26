# NEXO AB104.320 — Threshold witnesses and effective independence

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
A threshold signature proves that a threshold of authorized key shares participated, but the cryptographic threshold alone does not establish independent failure domains. Current IETF evidence-record work explicitly requires distinct pinned witness identities and notes that equivocation becomes detectable through comparison of independent witnesses; a quorum of repeated observations from one operator is only arithmetic quorum, not independent corroboration. citeturn0search1turn0search3

Byzantine quorum safety additionally depends on quorum-intersection assumptions and a bound on Byzantine faults; Lamport's Byzantine Paxos proof illustrates that quorum intersection is a protocol property, not a consequence of signatures alone. citeturn0search18turn0search10

## Nexo consequence
1. Distinguish `CRYPTographic_THRESHOLD` from `EFFECTIVE_INDEPENDENT_THRESHOLD`.
2. Count distinct admitted failure/provenance domains, not merely signatures or key shares, when the claim depends on independence.
3. Threshold participation can establish that enough authorized participants signed, but cannot by itself establish independent observation, truthful content, completeness, or external effect.
4. Quorum disagreement must classify as `CONFLICT/EQUIVOCATION` until lineage and authority semantics resolve it; never choose a history by raw majority.
5. Effective quorum is claim-specific: two witnesses may be independent for storage failure yet correlated for parser/software failure.

## Candidate witness identity
`witness_id + operator_domain + authority_root + acquisition_path + software_domain + storage_domain + upstream_source + observation_time/frontier`

A duplicate identity/domain contributes no additional independence for that failure mode.

## Candidate statuses
`THRESHOLD_VALID | INDEPENDENCE_SUFFICIENT | INDEPENDENCE_CORRELATED | INSUFFICIENT_QUORUM | CONFLICT | UNKNOWN`

Exact quorum thresholds and independence metrics remain UNSELECTED.

## Next
AB104.321 — study Byzantine quorum certificates versus evidence corroboration: determine exactly which claims a quorum certificate can establish, and which still require target-authoritative or independent evidence.
